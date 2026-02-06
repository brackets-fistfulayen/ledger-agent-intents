/**
 * Agent revoke endpoint
 * POST /api/agents/revoke  { id: "uuid" }
 *
 * Requires session auth. Caller's wallet must match the agent's trustchainId.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSession } from "../_lib/auth.js";
import { methodRouter, jsonSuccess, jsonError, parseBodyWithSchema } from "../_lib/http.js";
import { revokeAgentBodySchema } from "../_lib/validation.js";
import { getMemberById, revokeMember } from "../_lib/agentsRepo.js";
import { logger } from "../_lib/logger.js";

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		let session: { sessionId: string; walletAddress: string };
		try {
			session = await requireSession(req);
		} catch {
			jsonError(res, "Authentication required", 401);
			return;
		}
		const body = parseBodyWithSchema(req, res, revokeAgentBodySchema);
		if (body === null) return;

		const id = body.id;

		const member = await getMemberById(id);
		if (!member) {
			jsonError(res, "Agent not found", 404);
			return;
		}

		if (member.trustchainId !== session.walletAddress) {
			jsonError(res, "You can only revoke your own agents", 403);
			return;
		}

		const revoked = await revokeMember(id);
		if (!revoked) {
			jsonError(res, "Agent not found or already revoked", 404);
			return;
		}

		logger.info({ memberId: revoked.id, label: revoked.label, trustchainId: revoked.trustchainId }, "Agent revoked");
		jsonSuccess(res, { member: revoked });
	},
});
