/**
 * Agents listing endpoint
 * GET /api/agents?trustchainId=<id>
 *
 * Lists all registered agents (including revoked) for a given trustchain.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodRouter, jsonSuccess, jsonError, getQueryParam } from "./_lib/http.js";
import { getMembersByTrustchain } from "./_lib/agentsRepo.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		const trustchainId = getQueryParam(req, "trustchainId");

		if (!trustchainId) {
			jsonError(res, "Missing required query parameter: trustchainId", 400);
			return;
		}

		const members = await getMembersByTrustchain(trustchainId.toLowerCase());
		jsonSuccess(res, { members });
	},
});
