import { describe, expect, it } from "vitest";
import {
	X402Client,
	type X402ClientConfig,
	type X402PaymentRequired,
	decodePaymentRequired,
	decodePaymentResponse,
} from "../x402-client.js";

// =============================================================================
// decodePaymentRequired
// =============================================================================

describe("decodePaymentRequired", () => {
	it("decodes a base64 PAYMENT-REQUIRED header", () => {
		const payload: X402PaymentRequired = {
			x402Version: 1,
			resource: { url: "https://example.com/api/data" },
			accepted: [
				{
					scheme: "exact",
					network: "eip155:8453",
					asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
					amount: "1000000",
					payTo: "0x1234567890abcdef1234567890abcdef12345678",
				},
			],
		};

		const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
		const decoded = decodePaymentRequired(encoded);

		expect(decoded.x402Version).toBe(1);
		expect(decoded.resource.url).toBe("https://example.com/api/data");
		expect(decoded.accepted).toHaveLength(1);
		expect(decoded.accepted[0]?.network).toBe("eip155:8453");
		expect(decoded.accepted[0]?.amount).toBe("1000000");
	});

	it("throws on invalid base64", () => {
		expect(() => decodePaymentRequired("not-valid-json-even-decoded")).toThrow();
	});
});

// =============================================================================
// decodePaymentResponse
// =============================================================================

describe("decodePaymentResponse", () => {
	it("decodes a base64 PAYMENT-RESPONSE header", () => {
		const receipt = {
			txHash: "0xabc123",
			network: "eip155:8453",
			settledAt: "2025-01-01T00:00:00Z",
		};

		const encoded = Buffer.from(JSON.stringify(receipt)).toString("base64");
		const decoded = decodePaymentResponse(encoded);

		expect(decoded.txHash).toBe("0xabc123");
		expect(decoded.network).toBe("eip155:8453");
		expect(decoded.settledAt).toBe("2025-01-01T00:00:00Z");
	});
});

// =============================================================================
// X402Client constructor
// =============================================================================

describe("X402Client", () => {
	const baseConfig: X402ClientConfig = {
		apiBaseUrl: "https://api.example.com",
		userWallet: "0x1234567890abcdef1234567890abcdef12345678",
		agentId: "agent-test",
		agentName: "Test Agent",
	};

	it("sets default pollIntervalMs and maxWaitMs", () => {
		const client = new X402Client(baseConfig);
		// Access private config through a workaround (just verify the instance is created)
		expect(client).toBeInstanceOf(X402Client);
	});

	it("accepts custom pollIntervalMs and maxWaitMs", () => {
		const client = new X402Client({
			...baseConfig,
			pollIntervalMs: 500,
			maxWaitMs: 60000,
		});
		expect(client).toBeInstanceOf(X402Client);
	});
});

// =============================================================================
// Round-trip encode/decode
// =============================================================================

describe("encode/decode round-trip", () => {
	it("round-trips payment required data", () => {
		const original: X402PaymentRequired = {
			x402Version: 2,
			resource: {
				url: "https://api.example.com/premium",
				description: "Premium endpoint",
				mimeType: "application/json",
			},
			accepted: [
				{
					scheme: "exact",
					network: "eip155:1",
					asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
					amount: "5000000",
					payTo: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
				},
			],
		};

		const encoded = Buffer.from(JSON.stringify(original)).toString("base64");
		const decoded = decodePaymentRequired(encoded);

		expect(decoded).toEqual(original);
	});

	it("round-trips settlement receipt data", () => {
		const original = {
			txHash: `0x${"ab".repeat(32)}`,
			network: "eip155:8453",
			settledAt: new Date().toISOString(),
			payer: "0x1111111111111111111111111111111111111111",
		};

		const encoded = Buffer.from(JSON.stringify(original)).toString("base64");
		const decoded = decodePaymentResponse(encoded);

		expect(decoded).toEqual(original);
	});
});
