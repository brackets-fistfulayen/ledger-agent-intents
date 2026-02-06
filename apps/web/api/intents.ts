import type { IntentStatus } from "@agent-intents/shared";
import { isSupportedChain } from "@agent-intents/shared";
/**
 * Intents endpoint
 *
 * GET  /api/intents?userId=...&status=...&limit=...  – List intents for a user
 * POST /api/intents                                    – Create a new intent
 *
 * POST requires AgentAuth header signed by a registered agent key.
 * The trustchain_id and member_id are derived from the verified signature.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";
import { isAddress } from "viem";
import { verifyAgentAuth } from "./_lib/agentAuth.js";
import { requireSession } from "./_lib/auth.js";
import {
	getQueryNumber,
	getQueryParam,
	jsonError,
	jsonSuccess,
	methodRouter,
	parseBodyWithSchema,
} from "./_lib/http.js";
import { createIntent, getIntentsByUser } from "./_lib/intentsRepo.js";
import { logger } from "./_lib/logger.js";
import { createIntentRequestSchema } from "./_lib/validation.js";

/** Maximum intents per agent per minute */
const RATE_LIMIT_PER_MINUTE = 10;

const VALID_STATUSES: IntentStatus[] = [
	"pending",
	"approved",
	"rejected",
	"broadcasting",
	"authorized",
	"confirmed",
	"failed",
	"expired",
];

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		// Require authenticated session
		let session: { sessionId: string; walletAddress: string };
		try {
			session = await requireSession(req);
		} catch {
			jsonError(res, "Authentication required", 401);
			return;
		}

		const userId = getQueryParam(req, "userId");

		if (!userId) {
			jsonError(res, "Missing required query parameter: userId", 400);
			return;
		}

		// Enforce ownership: users can only list their own intents
		if (userId.toLowerCase() !== session.walletAddress) {
			jsonError(res, "You can only list your own intents", 403);
			return;
		}

		const statusParam = getQueryParam(req, "status");
		const status =
			statusParam && VALID_STATUSES.includes(statusParam as IntentStatus)
				? (statusParam as IntentStatus)
				: undefined;

		const limit = getQueryNumber(req, "limit", 50, 1, 100);

		const intents = await getIntentsByUser({ userId, status, limit });
		jsonSuccess(res, { intents });
	},

	POST: async (req: VercelRequest, res: VercelResponse) => {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("AgentAuth ")) {
			jsonError(res, "Missing or invalid Authorization header", 401);
			return;
		}

		let userId: string;
		let trustChainId: string | undefined;
		let createdByMemberId: string | undefined;
		try {
			const { member } = await verifyAgentAuth(req);
			userId = member.trustchainId;
			trustChainId = member.trustchainId;
			createdByMemberId = member.id;
		} catch (err) {
			jsonError(res, "Authentication failed", 401);
			return;
		}

		const body = parseBodyWithSchema(req, res, createIntentRequestSchema);
		if (body === null) return;

		// Semantic validation of intent details
		if (!isSupportedChain(body.details.chainId)) {
			jsonError(res, "Unsupported chain ID", 400);
			return;
		}
		if (!isAddress(body.details.recipient)) {
			jsonError(res, "Invalid recipient address", 400);
			return;
		}
		if (
			typeof body.details.amount !== "string" ||
			body.details.amount.length === 0 ||
			Number.isNaN(Number(body.details.amount))
		) {
			jsonError(res, "Invalid amount", 400);
			return;
		}

		// Rate limiting: max N intents per agent per minute (fail closed)
		try {
			const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
			const countResult = await sql`
				SELECT COUNT(*)::int AS cnt
				FROM intents
				WHERE agent_id = ${body.agentId}
					AND created_at > ${oneMinuteAgo}
			`;
			const recentCount = (countResult.rows[0] as { cnt: number })?.cnt ?? 0;
			if (recentCount >= RATE_LIMIT_PER_MINUTE) {
				jsonError(
					res,
					`Rate limit exceeded: agent "${body.agentId}" has created ${recentCount} intents in the last minute (max ${RATE_LIMIT_PER_MINUTE})`,
					429,
				);
				return;
			}
		} catch (err) {
			logger.error({ err }, "rate-limit check failed");
			jsonError(res, "Service temporarily unavailable", 503);
			return;
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
			agentName: body.agentName ?? body.agentId,
			details: body.details,
			urgency: body.urgency ?? "normal",
			expiresAt,
			trustChainId,
			createdByMemberId,
		});

		// Build payment URL from request headers
		const proto = req.headers["x-forwarded-proto"] ?? "https";
		const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:3000";
		const paymentUrl = `${proto}://${host}/pay/${intent.id}`;

		logger.info(
			{
				intentId: intent.id,
				agentName: intent.agentName,
				amount: intent.details.amount,
				token: intent.details.token,
				recipient: intent.details.recipient,
			},
			"Intent created",
		);

		jsonSuccess(res, { intent, paymentUrl }, 201);
	},
});
