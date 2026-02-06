/**
 * Single agent management endpoint
 * GET    /api/agents/:id   – Get agent details (requires session, ownership)
 * DELETE /api/agents/:id   – Revoke an agent (requires session, ownership)
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSession } from "../_lib/auth.js";
import { methodRouter, jsonSuccess, jsonError } from "../_lib/http.js";
import { getMemberById, revokeMember } from "../_lib/agentsRepo.js";
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

		const member = await getMemberById(id);
		if (!member) {
			jsonError(res, "Agent not found", 404);
			return;
		}

		if (member.trustchainId !== session.walletAddress) {
			jsonError(res, "You can only view your own agents", 403);
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
