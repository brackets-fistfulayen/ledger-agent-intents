/**
 * Agent registration endpoint
 * POST /api/agents/register
 *
 * Registers a new agent (Trustchain Member).  The request must include:
 * - trustChainId: the user's identity (lowercased wallet address)
 * - agentPublicKey: hex-encoded secp256k1 compressed public key
 * - agentLabel: human-friendly name
 *
 * Authorization is implicit – the user is already connected via the Ledger
 * button and explicitly triggered the registration from the UI.
 * No separate EIP-712 signature is required.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { RegisterAgentRequest } from "@agent-intents/shared";
import { methodRouter, jsonSuccess, jsonError, parseBody } from "../_lib/http.js";
import { registerAgent, getActiveMemberByPubkey } from "../_lib/agentsRepo.js";

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBody<RegisterAgentRequest>(req);

		// --- Validate required fields ---
		if (!body.trustChainId || !body.agentPublicKey) {
			jsonError(res, "Missing required fields: trustChainId, agentPublicKey", 400);
			return;
		}

		const agentPublicKey = body.agentPublicKey.toLowerCase();
		const trustchainId = body.trustChainId.toLowerCase();
		const label = body.agentLabel || "Unnamed Agent";

		// --- Validate public key format (hex string starting with 0x) ---
		if (!/^0x[0-9a-f]+$/.test(agentPublicKey)) {
			jsonError(res, "agentPublicKey must be a hex-encoded string (0x-prefixed)", 400);
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
				label,
			});

			console.log(
				`[Agent Registered] ${member.id} "${label}" for trustchain ${member.trustchainId}`,
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
