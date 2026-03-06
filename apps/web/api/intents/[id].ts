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
import { withDbRlsContext } from "../_lib/db.js";
import { authError, jsonError, jsonSuccess, methodRouter } from "../_lib/http.js";
import { getIntentById, sanitizeIntent } from "../_lib/intentsRepo.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		const { id } = req.query;
		const intentId = Array.isArray(id) ? id[0] : id;

		if (!intentId) {
			jsonError(res, "Intent ID required", 400);
			return;
		}

		// --- Agent auth path ---
		const authHeader = req.headers.authorization;
		if (authHeader?.startsWith("AgentAuth ")) {
			let member: { trustchainId: string };
			try {
				({ member } = await verifyAgentAuth(req));
			} catch {
				authError(req, res, "Agent authentication failed", 401);
				return;
			}

			const intent = await withDbRlsContext({ currentUser: member.trustchainId }, async (client) =>
				getIntentById(intentId, client.sql),
			);
			if (!intent) {
				jsonError(res, "Intent not found", 404);
				return;
			}
			jsonSuccess(res, { intent });
			return;
		}

		// --- Session auth path ---
		try {
			const session = await requireSession(req);
			const intent = await withDbRlsContext(
				{ currentUser: session.walletAddress },
				async (client) => getIntentById(intentId, client.sql),
			);
			if (!intent) {
				jsonError(res, "Intent not found", 404);
				return;
			}
			jsonSuccess(res, { intent: sanitizeIntent(intent) });
			return;
		} catch {
			authError(req, res, "Authentication required", 401);
			return;
		}
	},
});
