/**
 * Intents endpoint
 *
 * GET  /api/intents?userId=...&status=...&limit=...  – List intents for a user
 * POST /api/intents                                    – Create a new intent
 *
 * POST supports two authentication modes:
 * 1. **Agent auth** (preferred) – Authorization: AgentAuth header signed by a
 *    registered agent key. The trustchain_id and member_id are derived from
 *    the verified signature.
 * 2. **Legacy/demo** – No auth, accepts userId in body or defaults to 'demo-user'.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { CreateIntentRequest, IntentStatus } from "@agent-intents/shared";
import { v4 as uuidv4 } from "uuid";
import { methodRouter, jsonSuccess, jsonError, parseBody, getQueryParam, getQueryNumber } from "./_lib/http.js";
import { createIntent, getIntentsByUser } from "./_lib/intentsRepo.js";
import { verifyAgentAuth } from "./_lib/agentAuth.js";

const VALID_STATUSES: IntentStatus[] = [
	"pending",
	"approved",
	"rejected",
	"signed",
	"authorized",
	"confirmed",
	"failed",
	"expired",
];

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		const userId = getQueryParam(req, "userId");

		if (!userId) {
			jsonError(res, "Missing required query parameter: userId", 400);
			return;
		}

		const statusParam = getQueryParam(req, "status");
		const status = statusParam && VALID_STATUSES.includes(statusParam as IntentStatus)
			? (statusParam as IntentStatus)
			: undefined;

		const limit = getQueryNumber(req, "limit", 50, 1, 100);

		const intents = await getIntentsByUser({ userId, status, limit });
		jsonSuccess(res, { intents });
	},

	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBody<CreateIntentRequest & { userId?: string }>(req);

		// Validate required fields
		if (!body.agentId || !body.details) {
			jsonError(res, "Missing required fields", 400);
			return;
		}

		// --- Determine identity: agent auth vs legacy ---
		let userId: string;
		let trustChainId: string | undefined;
		let createdByMemberId: string | undefined;

		const authHeader = req.headers.authorization;
		if (authHeader?.startsWith("AgentAuth ")) {
			// Authenticated agent flow
			try {
				const { member } = await verifyAgentAuth(req);
				userId = member.trustchainId;
				trustChainId = member.trustchainId;
				createdByMemberId = member.id;
			} catch (err) {
				const message = err instanceof Error ? err.message : "Authentication failed";
				jsonError(res, message, 401);
				return;
			}
		} else {
			// Legacy/demo flow – accept userId in body or default
			userId = body.userId || "demo-user";
		}

		// Generate ID
		const id = `int_${Date.now()}_${uuidv4().slice(0, 8)}`;

		// Calculate expiration
		const expiresAt = body.expiresInMinutes
			? new Date(Date.now() + body.expiresInMinutes * 60 * 1000).toISOString()
			: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default 24h

		const intent = await createIntent({
			id,
			userId,
			agentId: body.agentId,
			agentName: body.agentName || body.agentId,
			details: body.details,
			urgency: body.urgency || "normal",
			expiresAt,
			trustChainId,
			createdByMemberId,
		});

		console.log(
			`[Intent Created] ${intent.id} by ${intent.agentName}: ${intent.details.amount} ${intent.details.token} to ${intent.details.recipient}`,
		);

		jsonSuccess(res, { intent }, 201);
	},
});
