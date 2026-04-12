import { keccak256, recoverMessageAddress, toHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { buildAgentAuthHeader } from "./agent-auth.js";

describe("buildAgentAuthHeader", () => {
	const testKey = generatePrivateKey();
	const testAccount = privateKeyToAccount(testKey);

	it("returns a header starting with AgentAuth", async () => {
		const header = await buildAgentAuthHeader(testKey, "POST", '{"test":true}');
		expect(header.startsWith("AgentAuth ")).toBe(true);
	});

	it("produces three dot-separated parts after the scheme", async () => {
		const header = await buildAgentAuthHeader(testKey, "POST", '{"test":true}');
		const payload = header.slice("AgentAuth ".length);
		const parts = payload.split(".");
		// Timestamp, bodyHash, and signature (signature may contain dots, so >= 3)
		expect(parts.length).toBeGreaterThanOrEqual(3);
	});

	it("uses keccak256 of body for POST requests", async () => {
		const body = '{"foo":"bar"}';
		const header = await buildAgentAuthHeader(testKey, "POST", body);
		const payload = header.slice("AgentAuth ".length);
		const parts = payload.split(".");

		const expectedHash = keccak256(toHex(body));
		expect(parts[1]).toBe(expectedHash);
	});

	it('uses "0x" as bodyHash for GET requests', async () => {
		const header = await buildAgentAuthHeader(testKey, "GET");
		const payload = header.slice("AgentAuth ".length);
		const parts = payload.split(".");
		expect(parts[1]).toBe("0x");
	});

	it("produces a recoverable signature matching the account", async () => {
		const body = '{"data":"test"}';
		const header = await buildAgentAuthHeader(testKey, "POST", body);
		const payload = header.slice("AgentAuth ".length);
		const parts = payload.split(".");

		const timestamp = parts[0];
		const bodyHash = parts[1];
		const signature = parts.slice(2).join(".") as `0x${string}`;
		const message = `${timestamp}.${bodyHash}`;

		const recovered = await recoverMessageAddress({ message, signature });
		expect(recovered.toLowerCase()).toBe(testAccount.address.toLowerCase());
	});

	it("timestamp is a valid unix epoch within the last minute", async () => {
		const before = Math.floor(Date.now() / 1000);
		const header = await buildAgentAuthHeader(testKey, "GET");
		const after = Math.floor(Date.now() / 1000);

		const payload = header.slice("AgentAuth ".length);
		const ts = Number.parseInt(payload.split(".")[0] ?? "0", 10);

		expect(ts).toBeGreaterThanOrEqual(before);
		expect(ts).toBeLessThanOrEqual(after);
	});
});
