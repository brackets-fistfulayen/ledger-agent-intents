/**
 * Agents listing endpoint
 * GET /api/agents?trustchainId=<id>
 *
 * Public read — no session required.  The trustchain ID (wallet address)
 * is public information, and agent public keys are not secret.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMembersByTrustchain } from "./_lib/agentsRepo.js";
import { getQueryParam, jsonError, jsonSuccess, methodRouter } from "./_lib/http.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		const trustchainId = getQueryParam(req, "trustchainId");

		if (!trustchainId) {
			jsonError(res, "Missing required query parameter: trustchainId", 400);
			return;
		}

		const normalized = trustchainId.toLowerCase();
		const members = await getMembersByTrustchain(normalized);
		jsonSuccess(res, { members });
	},
});
