/**
 * Single agent management endpoint
 * GET    /api/agents/:id   – Get agent details (requires session, ownership)
 * DELETE /api/agents/:id   – Revoke an agent (requires session, ownership)
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMemberById, revokeMember } from "../_lib/agentsRepo.js";
import { requireSession } from "../_lib/auth.js";
import { withDbRlsContext } from "../_lib/db.js";
import { authError, jsonError, jsonSuccess, methodRouter } from "../_lib/http.js";
import { logger } from "../_lib/logger.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
		let session: { sessionId: string; walletAddress: string };
		try {
			session = await requireSession(req);
		} catch {
			authError(req, res, "Authentication required", 401);
			return;
		}

		const id = req.query.id as string;
		if (!id) {
			jsonError(res, "Missing agent ID", 400);
			return;
		}

		const member = await withDbRlsContext({ currentUser: session.walletAddress }, async (client) =>
			getMemberById(id, client.sql),
		);
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
			authError(req, res, "Authentication required", 401);
			return;
		}

		const id = req.query.id as string;
		if (!id) {
			jsonError(res, "Missing agent ID", 400);
			return;
		}

		const member = await withDbRlsContext({ currentUser: session.walletAddress }, async (client) =>
			getMemberById(id, client.sql),
		);
		if (!member) {
			jsonError(res, "Agent not found", 404);
			return;
		}
		const revoked = await withDbRlsContext({ currentUser: session.walletAddress }, async (client) =>
			revokeMember(id, client.sql),
		);
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
