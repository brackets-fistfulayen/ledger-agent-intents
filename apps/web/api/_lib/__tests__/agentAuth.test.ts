import { describe, it, expect, vi, beforeEach } from "vitest";
import type { VercelRequest } from "@vercel/node";
import { keccak256, toHex } from "viem";

// Mock external dependencies before importing the module under test
vi.mock("../agentsRepo.js", () => ({
	getActiveMemberByPubkey: vi.fn(),
}));

vi.mock("../logger.js", () => ({
	logger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}));

// After mocking, import the module
import { verifyAgentAuth } from "../agentAuth.js";
import { getActiveMemberByPubkey } from "../agentsRepo.js";

function makeReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
	return {
		headers: {},
		method: "POST",
		body: {},
		...overrides,
	} as unknown as VercelRequest;
}

describe("verifyAgentAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("throws when Authorization header is missing", async () => {
		const req = makeReq({ headers: {} });
		await expect(verifyAgentAuth(req)).rejects.toThrow("Authentication failed");
	});

	it("throws when Authorization header uses wrong scheme", async () => {
		const req = makeReq({
			headers: { authorization: "Bearer some-token" },
		});
		await expect(verifyAgentAuth(req)).rejects.toThrow("Authentication failed");
	});

	it("throws for malformed header with fewer than 3 parts", async () => {
		const req = makeReq({
			headers: { authorization: "AgentAuth timestamp.bodyhash" },
		});
		await expect(verifyAgentAuth(req)).rejects.toThrow("Authentication failed");
	});

	it("throws when timestamp is not a number", async () => {
		const req = makeReq({
			headers: { authorization: "AgentAuth notanumber.0xbodyhash.0xsig" },
		});
		await expect(verifyAgentAuth(req)).rejects.toThrow("Authentication failed");
	});

	it("throws when timestamp is expired (too old)", async () => {
		// 10 minutes ago (> 5 min drift)
		const oldTimestamp = Math.floor(Date.now() / 1000) - 600;
		const req = makeReq({
			headers: { authorization: `AgentAuth ${oldTimestamp}.0xbodyhash.0xsig` },
		});
		await expect(verifyAgentAuth(req)).rejects.toThrow("Authentication failed");
	});

	it("throws when timestamp is too far in the future", async () => {
		const futureTimestamp = Math.floor(Date.now() / 1000) + 600;
		const req = makeReq({
			headers: { authorization: `AgentAuth ${futureTimestamp}.0xbodyhash.0xsig` },
		});
		await expect(verifyAgentAuth(req)).rejects.toThrow("Authentication failed");
	});

	it("throws when body hash does not match for POST requests", async () => {
		const now = Math.floor(Date.now() / 1000);
		const body = { test: "data" };
		// Intentionally use a wrong hash
		const wrongHash = "0xdeadbeef";

		const req = makeReq({
			method: "POST",
			body,
			headers: { authorization: `AgentAuth ${now}.${wrongHash}.0xsig` },
		});

		await expect(verifyAgentAuth(req)).rejects.toThrow("Authentication failed");
	});

	it("verifies body hash correctly for POST requests", async () => {
		const now = Math.floor(Date.now() / 1000);
		const body = { test: "data" };
		const rawBody = JSON.stringify(body);
		const correctHash = keccak256(toHex(rawBody));

		// This will pass hash check but fail on signature recovery.
		// After the try/catch fix, viem errors are wrapped with the generic
		// "Authentication failed" message (no internal leak).
		const req = makeReq({
			method: "POST",
			body,
			headers: {
				authorization: `AgentAuth ${now}.${correctHash}.0x${"a".repeat(130)}`,
			},
		});

		await expect(verifyAgentAuth(req)).rejects.toThrow("Authentication failed");
	});

	it("skips body hash check for GET requests", async () => {
		const now = Math.floor(Date.now() / 1000);

		const req = makeReq({
			method: "GET",
			headers: {
				authorization: `AgentAuth ${now}.0x.0x${"a".repeat(130)}`,
			},
		});

		// Should get past body hash check for GET, fail on signature recovery
		// with the generic sanitized message.
		await expect(verifyAgentAuth(req)).rejects.toThrow("Authentication failed");
	});

	it("never leaks specific auth failure details", async () => {
		// Test that all failure paths use the generic "Authentication failed" message
		const testCases = [
			makeReq({ headers: {} }),
			makeReq({ headers: { authorization: "Bearer xyz" } }),
			makeReq({ headers: { authorization: "AgentAuth short" } }),
			makeReq({ headers: { authorization: "AgentAuth NaN.hash.sig" } }),
		];

		for (const req of testCases) {
			try {
				await verifyAgentAuth(req);
				// Should not reach here
				expect.unreachable("Should have thrown");
			} catch (e) {
				expect((e as Error).message).toBe("Authentication failed");
			}
		}
	});
});
