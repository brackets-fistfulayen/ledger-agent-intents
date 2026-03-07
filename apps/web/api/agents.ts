/**
 * Agents listing endpoint
 * GET /api/agents?trustchainId=<id>
 *
 * Requires an authenticated session. The caller can only list agents
 * belonging to their own trustchain (wallet address).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMembersByTrustchain } from "./_lib/agentsRepo.js";
import { requireSession } from "./_lib/auth.js";
import { withDbRlsContext } from "./_lib/db.js";
import { authError, getQueryParam, jsonError, jsonSuccess, methodRouter } from "./_lib/http.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		let session: { sessionId: string; walletAddress: string };
		try {
			session = await requireSession(req);
		} catch {
			authError(req, res, "Authentication required", 401);
			return;
		}

		const trustchainId = getQueryParam(req, "trustchainId");

		if (!trustchainId) {
			jsonError(res, "Missing required query parameter: trustchainId", 400);
			return;
		}

		const normalized = trustchainId.toLowerCase();

		// Only allow users to list agents on their own trustchain
		if (normalized !== session.walletAddress.toLowerCase()) {
			authError(
				req,
				res,
				"You can only list agents on your own trustchain",
				403,
				session.walletAddress,
			);
			return;
		}

		const members = await withDbRlsContext({ currentUser: session.walletAddress }, async (client) =>
			getMembersByTrustchain(normalized, client.sql),
		);
		jsonSuccess(res, { members });
	},
});
