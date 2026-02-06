/**
 * Get intent by ID endpoint
 * GET /api/intents/:id
 *
 * Returns full intent details. Sensitive x402 fields (paymentSignatureHeader,
 * paymentPayload, signature) are stripped unless the caller is the owning
 * agent authenticated via AgentAuth.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAgentAuth } from "../_lib/agentAuth.js";
import { jsonError, jsonSuccess, methodRouter } from "../_lib/http.js";
import { getIntentById, sanitizeIntent } from "../_lib/intentsRepo.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		const { id } = req.query;
		const intentId = Array.isArray(id) ? id[0] : id;

		if (!intentId) {
			jsonError(res, "Intent ID required", 400);
			return;
		}

		const intent = await getIntentById(intentId);

		if (!intent) {
			jsonError(res, "Intent not found", 404);
			return;
		}

		// Check if caller is the owning agent -- if so, return full intent
		// (agent needs paymentSignatureHeader to complete the x402 flow)
		const authHeader = req.headers.authorization;
		if (authHeader?.startsWith("AgentAuth ")) {
			try {
				const { member } = await verifyAgentAuth(req);
				if (intent.trustChainId && intent.trustChainId === member.trustchainId) {
					// Owning agent -- return full intent with x402 secrets
					jsonSuccess(res, { intent });
					return;
				}
			} catch {
				// Auth failed -- fall through to sanitized response
			}
		}

		// Non-owning caller or no auth -- strip x402 bearer credentials
		jsonSuccess(res, { intent: sanitizeIntent(intent) });
	},
});
