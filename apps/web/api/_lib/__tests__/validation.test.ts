import { describe, it, expect } from "vitest";
import {
	createIntentRequestSchema,
	updateStatusBodySchema,
	updateStatusBodyLegacySchema,
	registerAgentRequestSchema,
	challengeBodySchema,
	verifyBodySchema,
	revokeAgentBodySchema,
	isValidIntentId,
	isValidUserId,
} from "../validation.js";

// =============================================================================
// createIntentRequestSchema
// =============================================================================

describe("createIntentRequestSchema", () => {
	const validInput = {
		agentId: "agent-123",
		agentName: "My Agent",
		details: {
			type: "transfer" as const,
			token: "USDC",
			tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			amount: "10.5",
			recipient: "0x1234567890abcdef1234567890abcdef12345678",
			chainId: 1,
		},
		urgency: "normal" as const,
		expiresInMinutes: 30,
	};

	it("accepts a valid transfer intent", () => {
		const result = createIntentRequestSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it("accepts minimal required fields", () => {
		const result = createIntentRequestSchema.safeParse({
			agentId: "a",
			details: {
				type: "transfer",
				token: "ETH",
				amount: "1",
				recipient: "0xabc",
				chainId: 1,
			},
		});
		expect(result.success).toBe(true);
	});

	it("rejects missing agentId", () => {
		const { agentId, ...rest } = validInput;
		const result = createIntentRequestSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it("rejects empty agentId", () => {
		const result = createIntentRequestSchema.safeParse({ ...validInput, agentId: "" });
		expect(result.success).toBe(false);
	});

	it("rejects missing details", () => {
		const { details, ...rest } = validInput;
		const result = createIntentRequestSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it("rejects wrong details.type", () => {
		const result = createIntentRequestSchema.safeParse({
			...validInput,
			details: { ...validInput.details, type: "swap" },
		});
		expect(result.success).toBe(false);
	});

	it("rejects negative chainId", () => {
		const result = createIntentRequestSchema.safeParse({
			...validInput,
			details: { ...validInput.details, chainId: -1 },
		});
		expect(result.success).toBe(false);
	});

	it("rejects non-integer chainId", () => {
		const result = createIntentRequestSchema.safeParse({
			...validInput,
			details: { ...validInput.details, chainId: 1.5 },
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid urgency enum", () => {
		const result = createIntentRequestSchema.safeParse({
			...validInput,
			urgency: "super-urgent",
		});
		expect(result.success).toBe(false);
	});

	it("accepts valid urgency values", () => {
		for (const urgency of ["low", "normal", "high", "critical"]) {
			const result = createIntentRequestSchema.safeParse({ ...validInput, urgency });
			expect(result.success).toBe(true);
		}
	});

	it("allows extra passthrough fields in details", () => {
		const result = createIntentRequestSchema.safeParse({
			...validInput,
			details: { ...validInput.details, customField: "hello" },
		});
		expect(result.success).toBe(true);
	});

	it("accepts x402 context in details", () => {
		const result = createIntentRequestSchema.safeParse({
			...validInput,
			details: {
				...validInput.details,
				x402: {
					resource: { url: "https://example.com/api" },
					accepted: { network: "eip155:1", asset: "0xabc", amount: "100", payTo: "0xdef" },
				},
			},
		});
		expect(result.success).toBe(true);
	});
});

// =============================================================================
// updateStatusBodySchema
// =============================================================================

describe("updateStatusBodySchema", () => {
	it("accepts valid status update", () => {
		const result = updateStatusBodySchema.safeParse({
			id: "int_1234567890_abc",
			status: "approved",
		});
		expect(result.success).toBe(true);
	});

	it("accepts all valid status values", () => {
		const validStatuses = [
			"pending", "approved", "rejected", "broadcasting",
			"authorized", "executing", "confirmed", "failed", "expired",
		];
		for (const status of validStatuses) {
			const result = updateStatusBodySchema.safeParse({ id: "x", status });
			expect(result.success).toBe(true);
		}
	});

	it("rejects invalid status value", () => {
		const result = updateStatusBodySchema.safeParse({ id: "x", status: "signed" });
		expect(result.success).toBe(false);
	});

	it("rejects missing id", () => {
		const result = updateStatusBodySchema.safeParse({ status: "approved" });
		expect(result.success).toBe(false);
	});

	it("accepts optional fields", () => {
		const result = updateStatusBodySchema.safeParse({
			id: "x",
			status: "broadcasting",
			txHash: "0xabc123",
			note: "Broadcast successful",
			expiresAt: "2025-01-01T00:00:00Z",
		});
		expect(result.success).toBe(true);
	});
});

// =============================================================================
// updateStatusBodyLegacySchema
// =============================================================================

describe("updateStatusBodyLegacySchema", () => {
	it("accepts status without id (legacy)", () => {
		const result = updateStatusBodyLegacySchema.safeParse({ status: "rejected" });
		expect(result.success).toBe(true);
	});

	it("rejects missing status", () => {
		const result = updateStatusBodyLegacySchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

// =============================================================================
// registerAgentRequestSchema
// =============================================================================

describe("registerAgentRequestSchema", () => {
	const valid = {
		trustChainId: "0x1234",
		agentPublicKey: "0xabcdef",
		authorizationSignature: "0xsig",
	};

	it("accepts valid registration", () => {
		const result = registerAgentRequestSchema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it("accepts optional agentLabel", () => {
		const result = registerAgentRequestSchema.safeParse({ ...valid, agentLabel: "My Agent" });
		expect(result.success).toBe(true);
	});

	it("rejects missing trustChainId", () => {
		const { trustChainId, ...rest } = valid;
		const result = registerAgentRequestSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it("rejects empty agentPublicKey", () => {
		const result = registerAgentRequestSchema.safeParse({ ...valid, agentPublicKey: "" });
		expect(result.success).toBe(false);
	});

	it("rejects empty authorizationSignature", () => {
		const result = registerAgentRequestSchema.safeParse({ ...valid, authorizationSignature: "" });
		expect(result.success).toBe(false);
	});
});

// =============================================================================
// challengeBodySchema
// =============================================================================

describe("challengeBodySchema", () => {
	it("accepts wallet address", () => {
		const result = challengeBodySchema.safeParse({ walletAddress: "0xabc123" });
		expect(result.success).toBe(true);
	});

	it("accepts optional chainId", () => {
		const result = challengeBodySchema.safeParse({ walletAddress: "0xabc123", chainId: 1 });
		expect(result.success).toBe(true);
	});

	it("rejects empty wallet address", () => {
		const result = challengeBodySchema.safeParse({ walletAddress: "" });
		expect(result.success).toBe(false);
	});
});

// =============================================================================
// verifyBodySchema
// =============================================================================

describe("verifyBodySchema", () => {
	it("accepts valid verify body", () => {
		const result = verifyBodySchema.safeParse({ challengeId: "c-123", signature: "0xsig" });
		expect(result.success).toBe(true);
	});

	it("rejects empty challengeId", () => {
		const result = verifyBodySchema.safeParse({ challengeId: "", signature: "0xsig" });
		expect(result.success).toBe(false);
	});
});

// =============================================================================
// revokeAgentBodySchema
// =============================================================================

describe("revokeAgentBodySchema", () => {
	it("accepts valid UUID", () => {
		const result = revokeAgentBodySchema.safeParse({ id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" });
		expect(result.success).toBe(true);
	});

	it("rejects non-UUID string", () => {
		const result = revokeAgentBodySchema.safeParse({ id: "not-a-uuid" });
		expect(result.success).toBe(false);
	});
});

// =============================================================================
// isValidIntentId
// =============================================================================

describe("isValidIntentId", () => {
	it("accepts valid intent IDs", () => {
		expect(isValidIntentId("int_1234567890_abc")).toBe(true);
		expect(isValidIntentId("int_1234567890_abcdef12")).toBe(true);
		expect(isValidIntentId("int_9999999999_a1b2c3d4-e5f6")).toBe(true);
	});

	it("rejects short strings", () => {
		expect(isValidIntentId("int_1_a")).toBe(false);
	});

	it("rejects strings without int_ prefix", () => {
		expect(isValidIntentId("abc_1234567890_abc")).toBe(false);
	});

	it("rejects empty strings", () => {
		expect(isValidIntentId("")).toBe(false);
	});
});

// =============================================================================
// isValidUserId
// =============================================================================

describe("isValidUserId", () => {
	it("accepts valid Ethereum addresses", () => {
		expect(isValidUserId("0x1234567890abcdef1234567890abcdef12345678")).toBe(true);
	});

	it("rejects strings without 0x prefix", () => {
		expect(isValidUserId("1234567890abcdef1234567890abcdef12345678")).toBe(false);
	});

	it("rejects too-short strings", () => {
		expect(isValidUserId("0x123")).toBe(false);
	});

	it("rejects empty strings", () => {
		expect(isValidUserId("")).toBe(false);
	});

	it("rejects non-hex characters", () => {
		expect(isValidUserId("0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG")).toBe(false);
	});
});
