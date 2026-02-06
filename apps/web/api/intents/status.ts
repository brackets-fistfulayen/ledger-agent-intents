import type {
	IntentStatus,
	X402PaymentPayload,
	X402SettlementReceipt,
} from "@agent-intents/shared";
/**
 * Update intent status endpoint (static path -- avoids Vercel dynamic-route issues)
 *
 * POST /api/intents/status  { id, status, txHash?, note?, ... }
 *
 * Authentication:
 *  - AgentAuth header: agent can set "confirmed" | "failed"
 *  - Session cookie: user can set "approved" | "rejected" | "authorized"
 *  - No auth (legacy/demo): allowed with deprecation warning
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAgentAuth } from "../_lib/agentAuth.js";
import { requireSession } from "../_lib/auth.js";
import { jsonError, jsonSuccess, methodRouter, parseBody } from "../_lib/http.js";
import { getIntentById, updateIntentStatus } from "../_lib/intentsRepo.js";

interface UpdateStatusBody {
	id: string;
	status: IntentStatus;
	txHash?: string;
	note?: string;
	paymentSignatureHeader?: string;
	paymentPayload?: X402PaymentPayload;
	settlementReceipt?: X402SettlementReceipt;
	expiresAt?: string;
}

const VALID_STATUSES: IntentStatus[] = [
	"pending",
	"approved",
	"rejected",
	"broadcasting",
	"authorized",
	"executing",
	"confirmed",
	"failed",
	"expired",
];

/** Statuses an authenticated agent is allowed to set */
const AGENT_ALLOWED_STATUSES: IntentStatus[] = ["executing", "confirmed", "failed"];

/** Statuses an authenticated user (session) is allowed to set */
const USER_ALLOWED_STATUSES: IntentStatus[] = ["approved", "rejected", "authorized", "broadcasting"];

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBody<UpdateStatusBody>(req);
		const intentId = body.id;

		if (!intentId) {
			jsonError(res, "Missing intent ID in request body", 400);
			return;
		}

		const existing = await getIntentById(intentId);
		if (!existing) {
			jsonError(res, "Intent not found", 404);
			return;
		}

		if (!body.status || !VALID_STATUSES.includes(body.status)) {
			jsonError(res, "Valid status required", 400);
			return;
		}

		// --- Authentication & authorization ---
		const authHeader = req.headers.authorization;
		if (authHeader?.startsWith("AgentAuth ")) {
			// Authenticated agent flow
			try {
				const { member } = await verifyAgentAuth(req);

				if (!AGENT_ALLOWED_STATUSES.includes(body.status)) {
					jsonError(
						res,
						`Agents can only set status to: ${AGENT_ALLOWED_STATUSES.join(", ")}`,
						403,
					);
					return;
				}

				// Verify ownership: agent's trustchain must match intent's trustchain
				if (existing.trustChainId && existing.trustChainId !== member.trustchainId) {
					jsonError(res, "Agent does not own this intent", 403);
					return;
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : "Authentication failed";
				jsonError(res, message, 401);
				return;
			}
		} else {
			// Try session cookie for web UI users
			try {
				const session = await requireSession(req);

				if (!USER_ALLOWED_STATUSES.includes(body.status)) {
					jsonError(res, `Users can only set status to: ${USER_ALLOWED_STATUSES.join(", ")}`, 403);
					return;
				}

				// Verify ownership: session wallet must match intent's userId
				if (existing.userId !== session.walletAddress) {
					jsonError(res, "User does not own this intent", 403);
					return;
				}
			} catch {
				// No valid session -- legacy/demo mode (no auth)
				// Restrict to user-safe statuses to prevent anonymous privilege escalation
				if (!USER_ALLOWED_STATUSES.includes(body.status)) {
					jsonError(
						res,
						`Unauthenticated requests can only set status to: ${USER_ALLOWED_STATUSES.join(", ")}`,
						403,
					);
					return;
				}
				console.warn(
					`[DEPRECATION] Unauthenticated status update on intent ${intentId} -> ${body.status}`,
				);
			}
		}

		const intent = await updateIntentStatus({
			id: intentId,
			status: body.status,
			txHash: body.txHash,
			note: body.note,
			paymentSignatureHeader: body.paymentSignatureHeader,
			paymentPayload: body.paymentPayload,
			settlementReceipt: body.settlementReceipt,
			expiresAt: body.expiresAt,
		});

		if (!intent) {
			jsonError(res, "Intent not found", 404);
			return;
		}

		console.log(
			`[Intent ${body.status.toUpperCase()}] ${intent.id}${body.txHash ? ` tx: ${body.txHash}` : ""}`,
		);

		jsonSuccess(res, { intent });
	},
});
