import type {
	IntentStatus,
	X402PaymentPayload,
	X402SettlementReceipt,
} from "@agent-intents/shared";
/**
 * Update intent status endpoint (legacy dynamic route)
 * PATCH /api/intents/:id/status
 *
 * Authentication:
 *  - AgentAuth header: agent can set "confirmed" | "failed"
 *  - Session cookie: user can set "approved" | "rejected" | "authorized" | "broadcasting"
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAgentAuth } from "../../_lib/agentAuth.js";
import { requireSession } from "../../_lib/auth.js";
import { withDbRlsContext } from "../../_lib/db.js";
import {
	authError,
	jsonError,
	jsonSuccess,
	methodRouter,
	parseBodyWithSchema,
} from "../../_lib/http.js";
import {
	IntentStatusConflictError,
	getIntentById,
	updateIntentStatus,
} from "../../_lib/intentsRepo.js";
import { logger } from "../../_lib/logger.js";
import { updateStatusBodyLegacySchema } from "../../_lib/validation.js";

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
const USER_ALLOWED_STATUSES: IntentStatus[] = [
	"approved",
	"rejected",
	"authorized",
	"broadcasting",
	"failed",
];

export default methodRouter({
	PATCH: async (req: VercelRequest, res: VercelResponse) => {
		const { id } = req.query;
		const intentId = Array.isArray(id) ? id[0] : id;

		if (!intentId) {
			jsonError(res, "Intent ID required", 400);
			return;
		}

		const body = parseBodyWithSchema(req, res, updateStatusBodyLegacySchema);
		if (body === null) return;

		// --- Authentication & authorization ---
		const authHeader = req.headers.authorization;
		if (authHeader?.startsWith("AgentAuth ")) {
			let member: { trustchainId: string };
			try {
				({ member } = await verifyAgentAuth(req));
			} catch (err) {
				const message = err instanceof Error ? err.message : "Authentication failed";
				authError(req, res, message, 401);
				return;
			}
			const existing = await withDbRlsContext(
				{ currentUser: member.trustchainId },
				async (client) => getIntentById(intentId, client.sql),
			);
			if (!existing) {
				jsonError(res, "Intent not found", 404);
				return;
			}
			if (!AGENT_ALLOWED_STATUSES.includes(body.status)) {
				authError(
					req,
					res,
					`Agents can only set status to: ${AGENT_ALLOWED_STATUSES.join(", ")}`,
					403,
					member.trustchainId,
				);
				return;
			}

			let intent: Awaited<ReturnType<typeof updateIntentStatus>>;
			try {
				intent = await withDbRlsContext({ currentUser: member.trustchainId }, async (client) =>
					updateIntentStatus(
						{
							id: intentId,
							status: body.status,
							txHash: body.txHash,
							note: body.note,
							paymentSignatureHeader: body.paymentSignatureHeader,
							paymentPayload: body.paymentPayload as X402PaymentPayload | undefined,
							settlementReceipt: body.settlementReceipt as X402SettlementReceipt | undefined,
						},
						client,
					),
				);
			} catch (err) {
				if (err instanceof IntentStatusConflictError) {
					jsonError(res, err.message, 409);
					return;
				}
				throw err;
			}
			if (!intent) {
				jsonError(res, "Intent not found", 404);
				return;
			}
			logger.info(
				{ intentId: intent.id, status: body.status, txHash: body.txHash },
				`Intent ${body.status}`,
			);
			jsonSuccess(res, { intent });
			return;
		}

		let session: { walletAddress: string };
		try {
			session = await requireSession(req);
		} catch {
			authError(req, res, "Authentication failed", 401);
			return;
		}

		const existing = await withDbRlsContext(
			{ currentUser: session.walletAddress },
			async (client) => getIntentById(intentId, client.sql),
		);
		if (!existing) {
			jsonError(res, "Intent not found", 404);
			return;
		}
		if (!USER_ALLOWED_STATUSES.includes(body.status)) {
			authError(
				req,
				res,
				`Users can only set status to: ${USER_ALLOWED_STATUSES.join(", ")}`,
				403,
				session.walletAddress,
			);
			return;
		}

		let intent: Awaited<ReturnType<typeof updateIntentStatus>>;
		try {
			intent = await withDbRlsContext({ currentUser: session.walletAddress }, async (client) =>
				updateIntentStatus(
					{
						id: intentId,
						status: body.status,
						txHash: body.txHash,
						note: body.note,
						paymentSignatureHeader: body.paymentSignatureHeader,
						paymentPayload: body.paymentPayload as X402PaymentPayload | undefined,
						settlementReceipt: body.settlementReceipt as X402SettlementReceipt | undefined,
					},
					client,
				),
			);
		} catch (err) {
			if (err instanceof IntentStatusConflictError) {
				jsonError(res, err.message, 409);
				return;
			}
			throw err;
		}
		if (!intent) {
			jsonError(res, "Intent not found", 404);
			return;
		}
		logger.info(
			{ intentId: intent.id, status: body.status, txHash: body.txHash },
			`Intent ${body.status}`,
		);
		jsonSuccess(res, { intent });
	},
});
