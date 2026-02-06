/**
 * Agent revoke endpoint
 * POST /api/agents/revoke  { id: "uuid", signature: "0x..." }
 *
 * Signature-based auth.  The caller signs an EIP-191 revocation message with
 * their Ledger device. The backend recovers the signer address from the
 * signature and verifies it matches the agent's trustchainId (wallet address).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { recoverMessageAddress } from "viem";
import { getMemberById, revokeMember } from "../_lib/agentsRepo.js";
import { jsonError, jsonSuccess, methodRouter, parseBodyWithSchema } from "../_lib/http.js";
import { logger } from "../_lib/logger.js";
import { revokeAgentBodySchema } from "../_lib/validation.js";

/**
 * Reconstruct the revocation message.
 * MUST match the frontend buildRevocationMessage() exactly.
 */
function buildRevocationMessage(params: {
	agentId: string;
	agentPublicKey: string;
	trustchainId: string;
}): string {
	return [
		"Revoke agent key for Ledger Agent Payments",
		`Agent ID: ${params.agentId}`,
		`Key: ${params.agentPublicKey}`,
		`Identity: ${params.trustchainId}`,
	].join("\n");
}

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBodyWithSchema(req, res, revokeAgentBodySchema);
		if (body === null) return;

		const id = body.id;
		const signature = body.signature as `0x${string}`;

		const member = await getMemberById(id);
		if (!member) {
			jsonError(res, "Agent not found", 404);
			return;
		}

		// --- Verify device signature ---
		try {
			const message = buildRevocationMessage({
				agentId: member.id,
				agentPublicKey: member.memberPubkey,
				trustchainId: member.trustchainId,
			});

			const recoveredAddress = await recoverMessageAddress({
				message,
				signature,
			});

			if (recoveredAddress.toLowerCase() !== member.trustchainId) {
				logger.error(
					{ recovered: recoveredAddress.toLowerCase(), expected: member.trustchainId },
					"Agent revocation: signature mismatch",
				);
				jsonError(res, "Revocation signature does not match the agent owner", 403);
				return;
			}
		} catch (err) {
			logger.error({ err }, "Agent revocation: signature verification failed");
			jsonError(res, "Invalid revocation signature", 400);
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
