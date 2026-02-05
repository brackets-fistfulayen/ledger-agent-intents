/**
 * Intents repository - database operations for intents
 */
import type {
	Intent,
	IntentStatus,
	TransferIntent,
	IntentUrgency,
	X402PaymentPayload,
	X402SettlementReceipt,
} from "@agent-intents/shared";
import { getExplorerTxUrl } from "@agent-intents/shared";
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
	signed_at: Date | null;
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
	return {
		id: row.id,
		userId: row.user_id,
		agentId: row.agent_id,
		agentName: row.agent_name,
		details: row.details,
		urgency: row.urgency,
		status: row.status,
		trustChainId: row.trust_chain_id ?? undefined,
		createdByMemberId: row.created_by_member_id ?? undefined,
		createdAt: row.created_at.toISOString(),
		expiresAt: row.expires_at?.toISOString(),
		reviewedAt: row.reviewed_at?.toISOString(),
		signedAt: row.signed_at?.toISOString(),
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
	intentIds: string[]
): Promise<Map<string, StatusHistoryRow[]>> {
	const historyMap = new Map<string, StatusHistoryRow[]>();

	if (intentIds.length === 0) {
		return historyMap;
	}

	const result = await sql`
    SELECT intent_id, status, timestamp, note
    FROM intent_status_history
    WHERE intent_id = ANY(${intentIds as any})
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
	const { id, userId, agentId, agentName, details, urgency, expiresAt, trustChainId, createdByMemberId } = params;

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
 * Update intent status
 */
export async function updateIntentStatus(params: {
	id: string;
	status: IntentStatus;
	txHash?: string;
	note?: string;
	paymentSignatureHeader?: string;
	paymentPayload?: X402PaymentPayload;
	settlementReceipt?: X402SettlementReceipt;
}): Promise<Intent | null> {
	const { id, status, txHash, note, paymentSignatureHeader, paymentPayload, settlementReceipt } = params;

	// Get current intent to check it exists
	const existing = await sql`SELECT * FROM intents WHERE id = ${id}`;
	if (existing.rows.length === 0) {
		return null;
	}

	const intentRow = existing.rows[0] as IntentRow;
	const nowIso = new Date().toISOString();

	// If we received x402 proof data or settlement receipt, persist it inside the JSON `details` blob.
	// This avoids needing extra columns/migrations for the demo.
	if (paymentSignatureHeader || paymentPayload || settlementReceipt) {
		const existing = intentRow.details.x402;
		const base =
			paymentPayload
				? { resource: paymentPayload.resource, accepted: paymentPayload.accepted }
				: existing;

		if (base) {
			const nextDetails: TransferIntent = {
				...intentRow.details,
				x402: {
					...base,
					...(existing ?? {}),
					paymentSignatureHeader:
						paymentSignatureHeader ?? existing?.paymentSignatureHeader,
					paymentPayload: paymentPayload ?? existing?.paymentPayload,
					settlementReceipt: settlementReceipt ?? existing?.settlementReceipt,
				},
			};

			await sql`
      UPDATE intents
      SET details = ${JSON.stringify(nextDetails)}
      WHERE id = ${id}
    `;

			// Keep local copy in sync for txUrl computation below
			intentRow.details = nextDetails;
		}
	}

	// Build update based on status
	let txUrl: string | null = null;
	if (status === "signed" && txHash) {
		txUrl = getExplorerTxUrl(intentRow.details.chainId, txHash);
	}

	// Update the intent
	if (status === "approved") {
		await sql`
      UPDATE intents
      SET status = ${status}, reviewed_at = ${nowIso}
      WHERE id = ${id}
    `;
	} else if (status === "signed" && txHash) {
		await sql`
      UPDATE intents
      SET status = ${status}, signed_at = ${nowIso}, tx_hash = ${txHash}, tx_url = ${txUrl}
      WHERE id = ${id}
    `;
	} else if (status === "signed") {
		// Signed may mean an x402 authorization signature (no onchain tx hash yet)
		await sql`
      UPDATE intents
      SET status = ${status}, signed_at = ${nowIso}
      WHERE id = ${id}
    `;
	} else if (status === "confirmed") {
		await sql`
      UPDATE intents
      SET status = ${status}, confirmed_at = ${nowIso}
      WHERE id = ${id}
    `;
	} else if (status === "rejected") {
		await sql`
      UPDATE intents
      SET status = ${status}, reviewed_at = ${nowIso}
      WHERE id = ${id}
    `;
	} else {
		await sql`
      UPDATE intents
      SET status = ${status}
      WHERE id = ${id}
    `;
	}

	// Add status history entry
	await sql`
    INSERT INTO intent_status_history (intent_id, status, timestamp, note)
    VALUES (${id}, ${status}, ${nowIso}, ${note ?? null})
  `;

	// Return updated intent
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
