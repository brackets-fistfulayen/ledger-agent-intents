/**
 * Single agent management endpoint
 * GET    /api/agents/:id   – Get agent details
 * DELETE /api/agents/:id   – Revoke an agent
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodRouter, jsonSuccess, jsonError } from "../_lib/http.js";
import { getMemberById, revokeMember } from "../_lib/agentsRepo.js";

export default methodRouter({
	GET: async (req: VercelRequest, res: VercelResponse) => {
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

		jsonSuccess(res, { member });
	},

	DELETE: async (req: VercelRequest, res: VercelResponse) => {
		const id = req.query.id as string;
		if (!id) {
			jsonError(res, "Missing agent ID", 400);
			return;
		}

		const member = await revokeMember(id);
		if (!member) {
			jsonError(res, "Agent not found or already revoked", 404);
			return;
		}

		console.log(`[Agent Revoked] ${member.id} "${member.label}" for trustchain ${member.trustchainId}`);
		jsonSuccess(res, { member });
	},
});
