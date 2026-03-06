/**
 * Single agent management endpoint
 * GET    /api/agents/:id   – Get agent details (requires session, ownership)
 * DELETE /api/agents/:id   – Revoke an agent (requires session, ownership)
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMemberByIdForOwner, revokeMember } from "../_lib/agentsRepo.js";
import { requireSession } from "../_lib/auth.js";
import { jsonError, jsonSuccess, methodRouter } from "../_lib/http.js";
import { logger } from "../_lib/logger.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		let session: { sessionId: string; walletAddress: string };
		try {
			session = await requireSession(req);
		} catch {
			jsonError(res, "Authentication required", 401);
			return;
		}

		const id = req.query.id as string;
		if (!id) {
			jsonError(res, "Missing agent ID", 400);
			return;
		}

		const member = await getMemberByIdForOwner(id, session.walletAddress);
		if (!member) {
			jsonError(res, "Agent not found", 404);
			return;
		}

		jsonSuccess(res, { member });
	},

	DELETE: async (req: VercelRequest, res: VercelResponse) => {
		let session: { sessionId: string; walletAddress: string };
		try {
			session = await requireSession(req);
		} catch {
			jsonError(res, "Authentication required", 401);
			return;
		}

		const id = req.query.id as string;
		if (!id) {
			jsonError(res, "Missing agent ID", 400);
			return;
		}

		const member = await getMemberByIdForOwner(id, session.walletAddress);
		if (!member) {
			jsonError(res, "Agent not found", 404);
			return;
		}

		const revoked = await revokeMember(id);
		if (!revoked) {
			jsonError(res, "Agent not found or already revoked", 404);
			return;
		}

		logger.info(
			{ memberId: revoked.id, label: revoked.label, trustchainId: revoked.trustchainId },
			"Agent revoked",
		);
		jsonSuccess(res, { member: revoked });
	},
});
