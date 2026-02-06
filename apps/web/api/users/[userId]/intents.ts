import type { IntentStatus } from "@agent-intents/shared";
/**
 * Get user intents endpoint
 * GET /api/users/:userId/intents
 *
 * Requires session auth. Caller can only list intents for their own wallet (userId).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSession } from "../../_lib/auth.js";
import {
	getQueryNumber,
	getQueryParam,
	jsonError,
	jsonSuccess,
	methodRouter,
} from "../../_lib/http.js";
import { getIntentsByUser } from "../../_lib/intentsRepo.js";

const VALID_STATUSES: IntentStatus[] = [
	"pending",
	"approved",
	"rejected",
	"broadcasting",
	"confirmed",
	"failed",
	"expired",
];

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		let session: { sessionId: string; walletAddress: string };
		try {
			session = await requireSession(req);
		} catch {
			jsonError(res, "Authentication required", 401);
			return;
		}

		const { userId } = req.query;
		const userIdStr = Array.isArray(userId) ? userId[0] : userId;

		if (!userIdStr) {
			jsonError(res, "User ID required", 400);
			return;
		}

		if (userIdStr.toLowerCase() !== session.walletAddress) {
			jsonError(res, "You can only list your own intents", 403);
			return;
		}

		const statusParam = getQueryParam(req, "status");
		const status =
			statusParam && VALID_STATUSES.includes(statusParam as IntentStatus)
				? (statusParam as IntentStatus)
				: undefined;

		const limit = getQueryNumber(req, "limit", 50, 1, 100);

		const intents = await getIntentsByUser({
			userId: userIdStr,
			status,
			limit,
		});

		jsonSuccess(res, { intents });
	},
});
