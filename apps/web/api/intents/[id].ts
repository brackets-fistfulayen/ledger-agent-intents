/**
 * Get intent by ID endpoint
 * GET /api/intents/:id
 *
 * Requires authentication (session or AgentAuth).
 *
 * - Authenticated agent that owns the intent → full intent (incl. x402 secrets)
 * - Authenticated user that owns the intent  → sanitized intent (no x402 secrets)
 * - Otherwise → 403
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAgentAuth } from "../_lib/agentAuth.js";
import { requireSession } from "../_lib/auth.js";
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

		// --- Agent auth path ---
		const authHeader = req.headers.authorization;
		if (authHeader?.startsWith("AgentAuth ")) {
			try {
				const { member } = await verifyAgentAuth(req);
				if (intent.trustChainId && intent.trustChainId === member.trustchainId) {
					// Owning agent — return full intent with x402 secrets
					jsonSuccess(res, { intent });
					return;
				}
				// Authenticated agent but not the owner
				jsonError(res, "You can only access intents on your own trustchain", 403);
				return;
			} catch {
				jsonError(res, "Agent authentication failed", 401);
				return;
			}
		}

		// --- Session auth path ---
		try {
			const session = await requireSession(req);
			// The intent's userId (wallet address) must match the session
			if (intent.userId && intent.userId.toLowerCase() === session.walletAddress.toLowerCase()) {
				jsonSuccess(res, { intent: sanitizeIntent(intent) });
				return;
			}
			jsonError(res, "You can only access your own intents", 403);
			return;
		} catch {
			jsonError(res, "Authentication required", 401);
			return;
		}
	},
});
