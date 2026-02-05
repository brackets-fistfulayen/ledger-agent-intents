/**
 * Update intent status endpoint (static path – avoids Vercel dynamic-route issues)
 *
 * POST /api/intents/status  { id, status, txHash?, note?, ... }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { IntentStatus, X402PaymentPayload, X402SettlementReceipt } from "@agent-intents/shared";
import { methodRouter, jsonSuccess, jsonError, parseBody } from "../_lib/http.js";
import { getIntentById, updateIntentStatus } from "../_lib/intentsRepo.js";

interface UpdateStatusBody {
	id: string;
	status: IntentStatus;
	txHash?: string;
	note?: string;
	paymentSignatureHeader?: string;
	paymentPayload?: X402PaymentPayload;
	settlementReceipt?: X402SettlementReceipt;
}

const VALID_STATUSES: IntentStatus[] = [
	"pending",
	"approved",
	"rejected",
	"signed",
	"authorized",
	"confirmed",
	"failed",
	"expired",
];

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

		const intent = await updateIntentStatus({
			id: intentId,
			status: body.status,
			txHash: body.txHash,
			note: body.note,
			paymentSignatureHeader: body.paymentSignatureHeader,
			paymentPayload: body.paymentPayload,
			settlementReceipt: body.settlementReceipt,
		});

		if (!intent) {
			jsonError(res, "Intent not found", 404);
			return;
		}

		console.log(
			`[Intent ${body.status.toUpperCase()}] ${intent.id}${body.txHash ? ` tx: ${body.txHash}` : ""}`
		);

		jsonSuccess(res, { intent });
	},
});
