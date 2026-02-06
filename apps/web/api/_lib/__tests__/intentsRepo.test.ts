import type { Intent } from "@agent-intents/shared";
import { describe, expect, it } from "vitest";
import { IntentStatusConflictError, sanitizeIntent } from "../intentsRepo.js";

// =============================================================================
// IntentStatusConflictError
// =============================================================================

describe("IntentStatusConflictError", () => {
	it("has the correct name", () => {
		const err = new IntentStatusConflictError();
		expect(err.name).toBe("IntentStatusConflictError");
	});

	it("has the correct message", () => {
		const err = new IntentStatusConflictError();
		expect(err.message).toBe("Intent status has changed, please refresh");
	});

	it("is an instance of Error", () => {
		const err = new IntentStatusConflictError();
		expect(err).toBeInstanceOf(Error);
	});
});

// =============================================================================
// sanitizeIntent
// =============================================================================

describe("sanitizeIntent", () => {
	const baseIntent: Intent = {
		id: "int_1234567890_abc",
		userId: "0x1234",
		agentId: "agent-1",
		agentName: "Test Agent",
		details: {
			type: "transfer",
			token: "USDC",
			amount: "10",
			recipient: "0xabc",
			chainId: 1,
		},
		urgency: "normal",
		status: "pending",
		createdAt: "2025-01-01T00:00:00Z",
		statusHistory: [],
	};

	it("returns intent unchanged when there is no x402 field", () => {
		const result = sanitizeIntent(baseIntent);
		expect(result).toEqual(baseIntent);
	});

	it("strips paymentSignatureHeader from x402", () => {
		const intent: Intent = {
			...baseIntent,
			details: {
				...baseIntent.details,
				x402: {
					resource: { url: "https://example.com" },
					accepted: { network: "eip155:1", asset: "0xabc", amount: "100", payTo: "0xdef" },
					paymentSignatureHeader: "secret-header",
				},
			},
		};

		const result = sanitizeIntent(intent);
		expect(result.details.x402).toBeDefined();
		expect(result.details.x402).not.toHaveProperty("paymentSignatureHeader");
		expect(result.details.x402).not.toHaveProperty("paymentPayload");
		expect(result.details.x402).not.toHaveProperty("signature");
		// Public fields should still be present
		expect(result.details.x402?.resource?.url).toBe("https://example.com");
		expect(result.details.x402?.accepted?.network).toBe("eip155:1");
	});

	it("strips paymentPayload from x402", () => {
		const intent: Intent = {
			...baseIntent,
			details: {
				...baseIntent.details,
				x402: {
					resource: { url: "https://example.com" },
					paymentPayload: { some: "secret" } as unknown,
				},
			},
		};

		const result = sanitizeIntent(intent);
		expect(result.details.x402).not.toHaveProperty("paymentPayload");
	});

	it("preserves other x402 fields", () => {
		const intent: Intent = {
			...baseIntent,
			details: {
				...baseIntent.details,
				x402: {
					resource: { url: "https://example.com", description: "API" },
					accepted: { network: "eip155:1", asset: "0xabc", amount: "100", payTo: "0xdef" },
					paymentSignatureHeader: "secret",
					settlementReceipt: { txHash: "0xtx", network: "eip155:1" },
				},
			},
		};

		const result = sanitizeIntent(intent);
		expect(result.details.x402?.settlementReceipt).toEqual({ txHash: "0xtx", network: "eip155:1" });
		expect(result.details.x402?.resource?.description).toBe("API");
	});

	it("does not mutate the original intent", () => {
		const intent: Intent = {
			...baseIntent,
			details: {
				...baseIntent.details,
				x402: {
					resource: { url: "https://example.com" },
					paymentSignatureHeader: "secret",
				},
			},
		};

		const _result = sanitizeIntent(intent);
		// Original should still have the secret field
		expect(intent.details.x402?.paymentSignatureHeader).toBe("secret");
	});
});
