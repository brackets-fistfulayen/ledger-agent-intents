/**
 * Agents listing endpoint
 * GET /api/agents?trustchainId=<id>
 *
 * Requires session auth. Caller can only list agents for their own wallet (trustchainId).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSession } from "./_lib/auth.js";
import { methodRouter, jsonSuccess, jsonError, getQueryParam } from "./_lib/http.js";
import { getMembersByTrustchain } from "./_lib/agentsRepo.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		let session: { sessionId: string; walletAddress: string };
		try {
			session = await requireSession(req);
		} catch {
			jsonError(res, "Authentication required", 401);
			return;
		}

		const trustchainId = getQueryParam(req, "trustchainId");

		if (!trustchainId) {
			jsonError(res, "Missing required query parameter: trustchainId", 400);
			return;
		}

		const normalized = trustchainId.toLowerCase();
		if (normalized !== session.walletAddress) {
			jsonError(res, "You can only list your own agents", 403);
			return;
		}

		const members = await getMembersByTrustchain(normalized);
		jsonSuccess(res, { members });
	},
});
