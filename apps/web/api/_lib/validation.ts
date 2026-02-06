/**
 * Zod schemas for API request validation.
 */
import type { IntentStatus } from "@agent-intents/shared";
import { z } from "zod";

const intentStatusSchema = z.enum([
	"pending",
	"approved",
	"rejected",
	"broadcasting",
	"authorized",
	"executing",
	"confirmed",
	"failed",
	"expired",
]);

/** X402 resource (minimal for validation) */
const x402ResourceSchema = z.object({
	url: z.string().url(),
	description: z.string().optional(),
	mimeType: z.string().optional(),
});

/** X402 accepted EVM (minimal for validation) */
const x402AcceptedEvmSchema = z.object({
	network: z.string(),
	asset: z.string(),
	amount: z.string(),
	payTo: z.string(),
}).passthrough();

/** X402 context (optional nested) */
const x402ContextSchema = z.object({
	resource: x402ResourceSchema.optional(),
	accepted: x402AcceptedEvmSchema.optional(),
}).passthrough();

/** Transfer intent details */
const transferIntentSchema = z.object({
	type: z.literal("transfer"),
	token: z.string().min(1),
	tokenAddress: z.string().optional(),
	amount: z.string().min(1),
	recipient: z.string().min(1),
	chainId: z.number().int().positive(),
	memo: z.string().optional(),
	resource: z.string().optional(),
	category: z.string().optional(),
	x402: x402ContextSchema.optional(),
}).passthrough();

const urgencySchema = z.enum(["low", "normal", "high", "critical"]).optional();

export const createIntentRequestSchema = z.object({
	agentId: z.string().min(1, "agentId is required"),
	agentName: z.string().optional(),
	details: transferIntentSchema,
	urgency: urgencySchema,
	expiresInMinutes: z.number().int().positive().optional(),
});

export const updateStatusBodySchema = z.object({
	id: z.string().min(1, "id is required"),
	status: intentStatusSchema,
	txHash: z.string().optional(),
	note: z.string().optional(),
	paymentSignatureHeader: z.string().optional(),
	paymentPayload: z.unknown().optional(),
	settlementReceipt: z.unknown().optional(),
	expiresAt: z.string().optional(),
});

/** Update status body for PATCH /api/intents/:id/status (no id in body) */
export const updateStatusBodyLegacySchema = z.object({
	status: intentStatusSchema,
	txHash: z.string().optional(),
	note: z.string().optional(),
	paymentSignatureHeader: z.string().optional(),
	paymentPayload: z.unknown().optional(),
	settlementReceipt: z.unknown().optional(),
});

export const registerAgentRequestSchema = z.object({
	trustChainId: z.string().min(1, "trustChainId is required"),
	agentPublicKey: z.string().min(1, "agentPublicKey is required"),
	agentLabel: z.string().optional(),
	authorizationSignature: z.string().min(1, "authorizationSignature is required"),
});

/** Challenge body for POST /api/auth/challenge */
export const challengeBodySchema = z.object({
	walletAddress: z.string().min(1),
	chainId: z.number().int().positive().optional(),
});

/** Verify body for POST /api/auth/verify */
export const verifyBodySchema = z.object({
	challengeId: z.string().min(1),
	signature: z.string().min(1),
});

/** Revoke agent body for POST /api/agents/revoke */
export const revokeAgentBodySchema = z.object({
	id: z.string().uuid("Invalid agent ID"),
});

export type CreateIntentRequestInput = z.infer<typeof createIntentRequestSchema>;
export type UpdateStatusBodyInput = z.infer<typeof updateStatusBodySchema>;
export type UpdateStatusBodyLegacyInput = z.infer<typeof updateStatusBodyLegacySchema>;
export type RegisterAgentRequestInput = z.infer<typeof registerAgentRequestSchema>;

/** Validate intent ID format (e.g. int_123_abc) */
export function isValidIntentId(id: string): boolean {
	return typeof id === "string" && id.length >= 10 && /^int_\d+_[a-f0-9-]+$/i.test(id);
}

/** Validate userId (wallet address format - basic) */
export function isValidUserId(userId: string): boolean {
	return typeof userId === "string" && userId.length >= 40 && userId.length <= 44 && /^0x[a-fA-F0-9]+$/.test(userId);
}
