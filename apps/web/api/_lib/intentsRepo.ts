/**
 * Intents repository - database operations for intents
 */

/** Thrown when a concurrent update changed the intent status (atomic update returned 0 rows). */
export class IntentStatusConflictError extends Error {
	constructor() {
		super("Intent status has changed, please refresh");
		this.name = "IntentStatusConflictError";
	}
}

import {
	type Intent,
	type IntentStatus,
	type IntentUrgency,
	type TransferIntent,
	type X402PaymentPayload,
	type X402SettlementReceipt,
	getExplorerTxUrl,
	isValidTransition,
} from "@agent-intents/shared";
import { sql } from "./db.js";

// Database row types
interface IntentRow {
	id: string;
	user_id: string;
	agent_id: string;
	agent_name: string;
	details: TransferIntent;
	urgency: IntentUrgency;
	status: IntentStatus;
	created_at: Date;
	expires_at: Date | null;
	reviewed_at: Date | null;
	broadcast_at: Date | null;
	confirmed_at: Date | null;
	tx_hash: string | null;
	tx_url: string | null;
	trust_chain_id: string | null;
	created_by_member_id: string | null;
}

interface StatusHistoryRow {
	status: IntentStatus;
	timestamp: Date;
	note: string | null;
}

interface StatusHistoryRowWithIntentId extends StatusHistoryRow {
	intent_id: string;
}

/**
 * Convert database row to Intent type
 */
function rowToIntent(row: IntentRow, history: StatusHistoryRow[]): Intent {
	// Derive effective status: if the authorization has expired and the DB
	// row hasn't been updated yet (cron may lag), surface "expired" to callers.
	let effectiveStatus: IntentStatus = row.status;
	const x402ExpiresAt = row.details?.x402?.expiresAt ?? row.expires_at?.toISOString();
	if (
		x402ExpiresAt &&
		(row.status === "authorized" || row.status === "approved") &&
		new Date(x402ExpiresAt) < new Date()
	) {
		effectiveStatus = "expired";
	}

	return {
		id: row.id,
		userId: row.user_id,
		agentId: row.agent_id,
		agentName: row.agent_name,
		details: row.details,
		urgency: row.urgency,
		status: effectiveStatus,
		trustChainId: row.trust_chain_id ?? undefined,
		createdByMemberId: row.created_by_member_id ?? undefined,
		createdAt: row.created_at.toISOString(),
		expiresAt: row.expires_at?.toISOString(),
		reviewedAt: row.reviewed_at?.toISOString(),
		broadcastAt: row.broadcast_at?.toISOString(),
		confirmedAt: row.confirmed_at?.toISOString(),
		txHash: row.tx_hash ?? undefined,
		txUrl: row.tx_url ?? undefined,
		statusHistory: history.map((h) => ({
			status: h.status,
			timestamp: h.timestamp.toISOString(),
			note: h.note ?? undefined,
		})),
	};
}

/**
 * Strip sensitive x402 fields from an intent for public API responses.
 * The paymentSignatureHeader is a bearer credential that could be replayed
 * to obtain the paid resource. Only the owning agent (who already has the
 * signature from polling) should see it.
 */
export function sanitizeIntent(intent: Intent): Intent {
	if (!intent.details.x402) return intent;

	const {
		paymentSignatureHeader: _sig,
		paymentPayload: _payload,
		signature: _rawSig,
		...safeX402
	} = intent.details.x402;

	return {
		...intent,
		details: {
			...intent.details,
			x402: safeX402,
		},
	};
}

/**
 * Get status history for an intent
 */
async function getStatusHistory(intentId: string): Promise<StatusHistoryRow[]> {
	const result = await sql`
    SELECT status, timestamp, note
    FROM intent_status_history
    WHERE intent_id = ${intentId}
    ORDER BY timestamp ASC
  `;
	return result.rows as StatusHistoryRow[];
}

/**
 * Batch-fetch status histories for multiple intents in a single query.
 * Returns a Map of intentId -> StatusHistoryRow[]
 */
async function getStatusHistoriesBatch(
	intentIds: string[],
): Promise<Map<string, StatusHistoryRow[]>> {
	const historyMap = new Map<string, StatusHistoryRow[]>();

	if (intentIds.length === 0) {
		return historyMap;
	}

	// ANY() with array - driver accepts string[] for this parameter
	const result = await sql`
    SELECT intent_id, status, timestamp, note
    FROM intent_status_history
    WHERE intent_id = ANY(${intentIds as unknown as string[]})
    ORDER BY intent_id, timestamp ASC
  `;

	for (const row of result.rows as StatusHistoryRowWithIntentId[]) {
		const existing = historyMap.get(row.intent_id) ?? [];
		existing.push({
			status: row.status,
			timestamp: row.timestamp,
			note: row.note,
		});
		historyMap.set(row.intent_id, existing);
	}

	return historyMap;
}

/**
 * Create a new intent
 */
export async function createIntent(params: {
	id: string;
	userId: string;
	agentId: string;
	agentName: string;
	details: TransferIntent;
	urgency: IntentUrgency;
	expiresAt?: string;
	trustChainId?: string;
	createdByMemberId?: string;
}): Promise<Intent> {
	const {
		id,
		userId,
		agentId,
		agentName,
		details,
		urgency,
		expiresAt,
		trustChainId,
		createdByMemberId,
	} = params;

	// Insert intent
	const result = await sql`
    INSERT INTO intents (id, user_id, agent_id, agent_name, details, urgency, status, expires_at, trust_chain_id, created_by_member_id)
    VALUES (
      ${id},
      ${userId},
      ${agentId},
      ${agentName},
      ${JSON.stringify(details)},
      ${urgency},
      'pending',
      ${expiresAt ?? null},
      ${trustChainId ?? null},
      ${createdByMemberId ?? null}
    )
    RETURNING *
  `;

	// Insert initial status history
	await sql`
    INSERT INTO intent_status_history (intent_id, status, timestamp)
    VALUES (${id}, 'pending', NOW())
  `;

	const row = result.rows[0] as IntentRow;
	const history = await getStatusHistory(id);
	return rowToIntent(row, history);
}

/**
 * Get an intent by ID
 */
export async function getIntentById(id: string): Promise<Intent | null> {
	const result = await sql`
    SELECT * FROM intents WHERE id = ${id}
  `;

	if (result.rows.length === 0) {
		return null;
	}

	const row = result.rows[0] as IntentRow;
	const history = await getStatusHistory(id);
	return rowToIntent(row, history);
}

/**
 * Get intents for a user with optional status filter
 */
export async function getIntentsByUser(params: {
	userId: string;
	status?: IntentStatus;
	limit?: number;
	cursor?: string;
}): Promise<Intent[]> {
	const { userId, status, limit = 50 } = params;

	let result;
	if (status) {
		result = await sql`
      SELECT * FROM intents
      WHERE user_id = ${userId} AND status = ${status}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
	} else {
		result = await sql`
      SELECT * FROM intents
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
	}

	const rows = result.rows as IntentRow[];
	const intentIds = rows.map((row) => row.id);

	// Batch-fetch all histories in a single query (eliminates N+1)
	const historyMap = await getStatusHistoriesBatch(intentIds);

	return rows.map((row) => rowToIntent(row, historyMap.get(row.id) ?? []));
}

/**
 * Build an enriched audit note for the status history, adding structured
 * x402 context at key transitions. Stored as JSON in the TEXT `note` column.
 */
function buildAuditNote(
	status: IntentStatus,
	userNote: string | undefined,
	intentRow: IntentRow,
	params: {
		paymentPayload?: X402PaymentPayload;
		settlementReceipt?: X402SettlementReceipt;
		txHash?: string;
	},
): string | null {
	const isX402 = !!intentRow.details?.x402;
	if (!isX402 && !userNote) return userNote ?? null;

	const context: Record<string, unknown> = {};

	if (userNote) {
		context.message = userNote;
	}

	if (status === "authorized" && params.paymentPayload?.payload?.authorization) {
		const auth = params.paymentPayload.payload.authorization;
		context.signer = auth.from;
		context.nonce = auth.nonce;
		context.validBefore = auth.validBefore;
		context.network = params.paymentPayload.accepted?.network;
	}

	if (status === "confirmed") {
		const receipt = params.settlementReceipt ?? intentRow.details?.x402?.settlementReceipt;
		if (receipt) {
			context.txHash = receipt.txHash;
			context.network = receipt.network;
			context.settledAt = receipt.settledAt;
		}
		if (params.txHash) {
			context.txHash = params.txHash;
		}
	}

	if (status === "failed") {
		context.reason = userNote ?? "Unknown failure";
		const x402 = intentRow.details?.x402;
		if (x402?.accepted?.network) {
			context.network = x402.accepted.network;
		}
	}

	if (status === "executing") {
		context.resource = intentRow.details?.x402?.resource?.url;
	}

	// If no extra context was added, just return the user note
	if (Object.keys(context).length === 0) return userNote ?? null;
	if (Object.keys(context).length === 1 && context.message) return userNote ?? null;

	return JSON.stringify(context);
}

/**
 * Update intent status.
 *
 * All mutations are wrapped in a single DB transaction so that a failure at any
 * step (details update, expires_at, status, history INSERT) leaves the DB in a
 * consistent state.
 */
export async function updateIntentStatus(params: {
	id: string;
	status: IntentStatus;
	txHash?: string;
	note?: string;
	paymentSignatureHeader?: string;
	paymentPayload?: X402PaymentPayload;
	settlementReceipt?: X402SettlementReceipt;
	expiresAt?: string;
}): Promise<Intent | null> {
	const {
		id,
		status,
		txHash,
		note,
		paymentSignatureHeader,
		paymentPayload,
		settlementReceipt,
		expiresAt,
	} = params;

	// Get current intent to check it exists (outside transaction — read-only)
	const existing = await sql`SELECT * FROM intents WHERE id = ${id}`;
	if (existing.rows.length === 0) {
		return null;
	}

	const intentRow = existing.rows[0] as IntentRow;
	const nowIso = new Date().toISOString();

	// Enforce state machine: reject invalid transitions
	const currentStatus = intentRow.status as IntentStatus;
	if (!isValidTransition(currentStatus, status)) {
		throw new Error(`Invalid status transition: ${currentStatus} -> ${status}`);
	}

	// --- All writes happen inside a single transaction ---
	const client = await sql.connect();
	try {
		await client.sql`BEGIN`;

		// If we received x402 proof data or settlement receipt, persist it inside the JSON `details` blob.
		if (paymentSignatureHeader || paymentPayload || settlementReceipt) {
			const existingX402 = intentRow.details.x402;
			const base = paymentPayload
				? { resource: paymentPayload.resource, accepted: paymentPayload.accepted }
				: existingX402;

			if (base) {
				const nextDetails: TransferIntent = {
					...intentRow.details,
					x402: {
						...base,
						...(existingX402 ?? {}),
						paymentSignatureHeader: paymentSignatureHeader ?? existingX402?.paymentSignatureHeader,
						paymentPayload: paymentPayload ?? existingX402?.paymentPayload,
						settlementReceipt: settlementReceipt ?? existingX402?.settlementReceipt,
						...(expiresAt ? { expiresAt } : {}),
					},
				};

				await client.sql`
					UPDATE intents
					SET details = ${JSON.stringify(nextDetails)}
					WHERE id = ${id}
				`;

				// Keep local copy in sync for txUrl computation below
				intentRow.details = nextDetails;
			}
		}

		// Persist expiresAt on the intent row itself (used by cron + derived status)
		if (expiresAt) {
			await client.sql`
				UPDATE intents
				SET expires_at = ${expiresAt}
				WHERE id = ${id}
			`;
		}

		// Build update based on status
		let txUrl: string | null = null;
		if (status === "broadcasting" && txHash) {
			txUrl = getExplorerTxUrl(intentRow.details.chainId, txHash);
		}

		// Atomic status update: only update if current status matches (prevents race conditions)
		let updateResult: { rows: unknown[] };
		if (status === "approved") {
			updateResult = await client.sql`
				UPDATE intents
				SET status = ${status}, reviewed_at = ${nowIso}
				WHERE id = ${id} AND status = ${currentStatus}
				RETURNING *
			`;
		} else if (status === "broadcasting" && txHash) {
			updateResult = await client.sql`
				UPDATE intents
				SET status = ${status}, broadcast_at = ${nowIso}, tx_hash = ${txHash}, tx_url = ${txUrl}
				WHERE id = ${id} AND status = ${currentStatus}
				RETURNING *
			`;
		} else if (status === "broadcasting") {
			updateResult = await client.sql`
				UPDATE intents
				SET status = ${status}, broadcast_at = ${nowIso}
				WHERE id = ${id} AND status = ${currentStatus}
				RETURNING *
			`;
		} else if (status === "confirmed") {
			updateResult = await client.sql`
				UPDATE intents
				SET status = ${status}, confirmed_at = ${nowIso}
				WHERE id = ${id} AND status = ${currentStatus}
				RETURNING *
			`;
		} else if (status === "rejected") {
			updateResult = await client.sql`
				UPDATE intents
				SET status = ${status}, reviewed_at = ${nowIso}
				WHERE id = ${id} AND status = ${currentStatus}
				RETURNING *
			`;
		} else {
			updateResult = await client.sql`
				UPDATE intents
				SET status = ${status}
				WHERE id = ${id} AND status = ${currentStatus}
				RETURNING *
			`;
		}

		if (updateResult.rows.length === 0) {
			// Concurrent update — ROLLBACK and throw
			await client.sql`ROLLBACK`;
			throw new IntentStatusConflictError();
		}

		// Build enriched audit note with x402 context
		const auditNote = buildAuditNote(status, note, intentRow, params);

		// Add status history entry
		await client.sql`
			INSERT INTO intent_status_history (intent_id, status, timestamp, note)
			VALUES (${id}, ${status}, ${nowIso}, ${auditNote})
		`;

		await client.sql`COMMIT`;
	} catch (err) {
		// ROLLBACK for any unexpected error (conflict error already rolled back above)
		if (!(err instanceof IntentStatusConflictError)) {
			await client.sql`ROLLBACK`.catch(() => {});
		}
		throw err;
	} finally {
		client.release();
	}

	// Return updated intent (reads outside transaction are fine)
	return getIntentById(id);
}

/**
 * Get all intents (debug only)
 */
export async function getAllIntents(): Promise<Intent[]> {
	const result = await sql`
    SELECT * FROM intents
    ORDER BY created_at DESC
    LIMIT 100
  `;

	const rows = result.rows as IntentRow[];
	const intentIds = rows.map((row) => row.id);

	// Batch-fetch all histories in a single query (eliminates N+1)
	const historyMap = await getStatusHistoriesBatch(intentIds);

	return rows.map((row) => rowToIntent(row, historyMap.get(row.id) ?? []));
}

/**
 * Delete all intents (debug only)
 */
export async function deleteAllIntents(): Promise<void> {
	await sql`DELETE FROM intent_status_history`;
	await sql`DELETE FROM intents`;
}
