import type { Intent } from "@agent-intents/shared";
import { describe, expect, it } from "vitest";
import { IntentStatusConflictError, getIntentsByUser, sanitizeIntent } from "../intentsRepo.js";

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

describe("getIntentsByUser cursor pagination", () => {
	const makeRow = (id: string, createdAt: string) => ({
		id,
		user_id: "0x1234",
		agent_id: "agent-1",
		agent_name: "Test Agent",
		details: {
			type: "transfer" as const,
			token: "USDC",
			amount: "10",
			recipient: "0xabc",
			chainId: 1,
		},
		urgency: "normal" as const,
		status: "pending" as const,
		created_at: new Date(createdAt),
		expires_at: null,
		reviewed_at: null,
		broadcast_at: null,
		confirmed_at: null,
		tx_hash: null,
		tx_url: null,
		trust_chain_id: null,
		created_by_member_id: null,
	});

	it("returns nextCursor when there are more rows than the requested limit", async () => {
		let callCount = 0;
		const db = (async () => {
			callCount++;
			if (callCount === 1) {
				return {
					rows: [
						makeRow("intent-3", "2025-01-03T00:00:00.000Z"),
						makeRow("intent-2", "2025-01-02T00:00:00.000Z"),
						makeRow("intent-1", "2025-01-01T00:00:00.000Z"),
					],
				};
			}
			return { rows: [] };
		}) as unknown as typeof import("../db.js").sql;

		const page = await getIntentsByUser({ userId: "0x1234", limit: 2 }, db);

		expect(page.intents).toHaveLength(2);
		expect(page.intents[0]?.id).toBe("intent-3");
		expect(page.intents[1]?.id).toBe("intent-2");
		expect(page.nextCursor).toBeTruthy();
	});

	it("accepts a cursor and returns the next page", async () => {
		let callCount = 0;
		const db = (async (_strings: TemplateStringsArray, ...values: unknown[]) => {
			callCount++;
			if (callCount === 1) {
				return {
					rows: [
						makeRow("intent-3", "2025-01-03T00:00:00.000Z"),
						makeRow("intent-2", "2025-01-02T00:00:00.000Z"),
						makeRow("intent-1", "2025-01-01T00:00:00.000Z"),
					],
				};
			}

			expect(values).toContain("intent-2");
			return { rows: [] };
		}) as unknown as typeof import("../db.js").sql;

		const firstPage = await getIntentsByUser({ userId: "0x1234", limit: 2 }, db);
		const secondPage = await getIntentsByUser(
			{ userId: "0x1234", limit: 2, cursor: firstPage.nextCursor },
			db,
		);

		expect(firstPage.nextCursor).toBeTruthy();
		expect(secondPage.intents).toHaveLength(0);
	});
});
