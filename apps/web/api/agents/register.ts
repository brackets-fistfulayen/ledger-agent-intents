/**
 * Agent registration endpoint
 * POST /api/agents/register
 *
 * Registers a new agent (Trustchain Member).  The request must include:
 * - trustChainId: the user's identity (lowercased wallet address)
 * - agentPublicKey: hex-encoded secp256k1 compressed public key
 * - agentLabel: human-friendly name
 * - authorizationSignature: EIP-191 personal_sign proving device authorization
 *
 * The backend reconstructs the authorization message, recovers the signer
 * address from the signature, and verifies it matches the trustChainId
 * (which is the user's wallet address).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import { recoverMessageAddress } from "viem";
import { getActiveMemberByPubkey, registerAgent } from "../_lib/agentsRepo.js";
import { jsonError, jsonSuccess, methodRouter, parseBodyWithSchema } from "../_lib/http.js";
import { logger } from "../_lib/logger.js";
import { registerAgentRequestSchema } from "../_lib/validation.js";

/** Max agent registrations per wallet per minute */
const RATE_LIMIT_REGISTRATIONS_PER_MINUTE = 5;

/**
 * Reconstruct the authorization message.
 * MUST match the frontend buildAuthorizationMessage() exactly.
 */
function buildAuthorizationMessage(params: {
	agentPublicKey: string;
	agentLabel: string;
	trustchainId: string;
}): string {
	return [
		"Authorize agent key for Ledger Agent Payments",
		`Key: ${params.agentPublicKey}`,
		`Label: ${params.agentLabel}`,
		`Identity: ${params.trustchainId}`,
	].join("\n");
}

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBodyWithSchema(req, res, registerAgentRequestSchema);
		if (body === null) return;

		const agentPublicKey = body.agentPublicKey.toLowerCase();
		const trustchainId = body.trustChainId.toLowerCase();
		const agentLabel = body.agentLabel || "Unnamed Agent";
		const signature = body.authorizationSignature as `0x${string}`;

		// --- Validate public key format (hex string starting with 0x) ---
		if (!/^0x[0-9a-f]+$/.test(agentPublicKey)) {
			jsonError(res, "agentPublicKey must be a hex-encoded string (0x-prefixed)", 400);
			return;
		}

		// --- Verify device authorization signature ---
		try {
			const message = buildAuthorizationMessage({
				agentPublicKey: body.agentPublicKey, // Use the original case for message reconstruction
				agentLabel,
				trustchainId: body.trustChainId, // Use the original case for message reconstruction
			});

			const recoveredAddress = await recoverMessageAddress({
				message,
				signature,
			});

			if (recoveredAddress.toLowerCase() !== trustchainId) {
				logger.error(
					{ recovered: recoveredAddress.toLowerCase(), expected: trustchainId },
					"Agent registration: signature mismatch",
				);
				jsonError(res, "Authorization signature does not match the connected wallet", 403);
				return;
			}
		} catch (err) {
			logger.error({ err }, "Agent registration: signature verification failed");
			jsonError(res, "Invalid authorization signature", 400);
			return;
		}

		// --- Rate limit: max N registrations per wallet per minute ---
		try {
			const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
			const countResult = await sql`
				SELECT COUNT(*)::int AS cnt
				FROM trustchain_members
				WHERE trustchain_id = ${trustchainId}
					AND created_at > ${oneMinuteAgo}
			`;
			const recentCount = (countResult.rows[0] as { cnt: number })?.cnt ?? 0;
			if (recentCount >= RATE_LIMIT_REGISTRATIONS_PER_MINUTE) {
				jsonError(
					res,
					`Rate limit exceeded: max ${RATE_LIMIT_REGISTRATIONS_PER_MINUTE} agent registrations per minute`,
					429,
				);
				return;
			}
		} catch (err) {
			logger.error({ err }, "Agent registration: rate limit check failed");
			jsonError(res, "Service temporarily unavailable", 503);
			return;
		}

		// --- Check if already registered ---
		const existing = await getActiveMemberByPubkey(agentPublicKey);
		if (existing) {
			jsonError(res, "This agent public key is already registered", 409);
			return;
		}

		// --- Register the agent ---
		try {
			const member = await registerAgent({
				trustchainId,
				memberPubkey: agentPublicKey,
				label: agentLabel,
				authorizationSignature: signature,
			});

			logger.info(
				{ memberId: member.id, agentLabel, trustchainId: member.trustchainId },
				"Agent registered",
			);

			jsonSuccess(res, { member }, 201);
		} catch (err: unknown) {
			// Handle unique constraint violation (race condition)
			const message = err instanceof Error ? err.message : String(err);
			if (message.includes("unique") || message.includes("duplicate")) {
				jsonError(res, "This agent public key is already registered", 409);
				return;
			}
			throw err;
		}
	},
});
