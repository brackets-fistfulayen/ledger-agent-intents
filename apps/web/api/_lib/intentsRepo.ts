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
	type IntentDetails,
	type IntentStatus,
	type IntentUrgency,
	type TransferIntent,
	type X402PaymentPayload,
	type X402SettlementReceipt,
	getExplorerTxUrl,
	isTransferIntent,
	isValidTransition,
} from "@agent-intents/shared";
import { type DbClient, type DbExecutor, sql } from "./db.js";

interface IntentRow {
	id: string;
	user_id: string;
	agent_id: string;
	agent_name: string;
	details: IntentDetails;
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

export interface IntentsPage {
	intents: Intent[];
	nextCursor?: string;
}

function encodeIntentCursor(row: Pick<IntentRow, "id" | "created_at">): string {
	return Buffer.from(
		JSON.stringify({
			id: row.id,
			createdAt: row.created_at.toISOString(),
		}),
	).toString("base64url");
}

function decodeIntentCursor(cursor: string): { id: string; createdAt: Date } {
	const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
		id?: unknown;
		createdAt?: unknown;
	};
	if (typeof decoded.id !== "string" || typeof decoded.createdAt !== "string") {
		throw new Error("Invalid cursor");
	}

	const createdAt = new Date(decoded.createdAt);
	if (Number.isNaN(createdAt.getTime())) {
		throw new Error("Invalid cursor");
	}

	return { id: decoded.id, createdAt };
}

function rowToIntent(row: IntentRow, history: StatusHistoryRow[]): Intent {
	let effectiveStatus: IntentStatus = row.status;
	const x402 = isTransferIntent(row.details) ? row.details.x402 : undefined;
	const x402ExpiresAt = x402?.expiresAt ?? row.expires_at?.toISOString();
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

export function sanitizeIntent(intent: Intent): Intent {
	if (!isTransferIntent(intent.details) || !intent.details.x402) return intent;

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

async function getStatusHistory(
	intentId: string,
	db: DbExecutor = sql,
): Promise<StatusHistoryRow[]> {
	const result = await db`
    SELECT status, timestamp, note
    FROM intent_status_history
    WHERE intent_id = ${intentId}
    ORDER BY timestamp ASC
  `;
	return result.rows as StatusHistoryRow[];
}

async function getStatusHistoriesBatch(
	intentIds: string[],
	db: DbExecutor = sql,
): Promise<Map<string, StatusHistoryRow[]>> {
	const historyMap = new Map<string, StatusHistoryRow[]>();

	if (intentIds.length === 0) {
		return historyMap;
	}

	const result = await db`
    SELECT intent_id, status, timestamp, note
    FROM intent_status_history
    WHERE intent_id = ANY(${intentIds as unknown as never})
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
 * Transition all pending intents from the given agent to "expired",
 * so they don't pile up when the agent recreates intents.
 * Returns the number of intents superseded.
 */
export async function supersedePendingIntents(
	agentId: string,
	userId: string,
	dbClient?: DbClient,
): Promise<number> {
	const nowIso = new Date().toISOString();
	const db = dbClient?.sql ?? sql;

	const result = await db`
		UPDATE intents
		SET status = 'expired'
		WHERE agent_id = ${agentId}
			AND user_id = ${userId}
			AND status = 'pending'
		RETURNING id
	`;

	const count = result.rows.length;
	if (count > 0) {
		const ids = result.rows.map((r: { id: string }) => r.id);
		for (const id of ids) {
			await db`
				INSERT INTO intent_status_history (intent_id, status, timestamp, note)
				VALUES (${id}, 'expired', ${nowIso}, 'Superseded by newer intent from same agent')
			`;
		}
	}

	return count;
}

export async function createIntent(
	params: {
		id: string;
		userId: string;
		agentId: string;
		agentName: string;
		details: IntentDetails;
		urgency: IntentUrgency;
		expiresAt?: string;
		trustChainId?: string;
		createdByMemberId?: string;
	},
	db: DbExecutor = sql,
): Promise<Intent> {
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

	const result = await db`
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

	await db`
    INSERT INTO intent_status_history (intent_id, status, timestamp)
    VALUES (${id}, 'pending', NOW())
  `;

	const row = result.rows[0] as IntentRow;
	const history = await getStatusHistory(id, db);
	return rowToIntent(row, history);
}

export async function getIntentById(id: string, db: DbExecutor = sql): Promise<Intent | null> {
	const result = await db`
    SELECT * FROM intents WHERE id = ${id}
  `;

	if (result.rows.length === 0) {
		return null;
	}

	const row = result.rows[0] as IntentRow;
	const history = await getStatusHistory(id, db);
	return rowToIntent(row, history);
}

export async function getIntentsByUser(
	params: {
		userId: string;
		status?: IntentStatus;
		limit?: number;
		cursor?: string;
	},
	db: DbExecutor = sql,
): Promise<IntentsPage> {
	const { userId, status, limit = 50, cursor } = params;
	const pageSize = Math.max(1, Math.min(limit, 100));
	const fetchLimit = pageSize + 1;
	const decodedCursor = cursor ? decodeIntentCursor(cursor) : null;

	let result: Awaited<ReturnType<typeof sql>>;
	if (status && decodedCursor) {
		result = await db`
      SELECT * FROM intents
      WHERE user_id = ${userId}
        AND status = ${status}
        AND (
          created_at < ${decodedCursor.createdAt}
          OR (created_at = ${decodedCursor.createdAt} AND id < ${decodedCursor.id})
        )
      ORDER BY created_at DESC, id DESC
      LIMIT ${fetchLimit}
    `;
	} else if (status) {
		result = await db`
      SELECT * FROM intents
      WHERE user_id = ${userId} AND status = ${status}
      ORDER BY created_at DESC, id DESC
      LIMIT ${fetchLimit}
    `;
	} else if (decodedCursor) {
		result = await db`
      SELECT * FROM intents
      WHERE user_id = ${userId}
        AND (
          created_at < ${decodedCursor.createdAt}
          OR (created_at = ${decodedCursor.createdAt} AND id < ${decodedCursor.id})
        )
      ORDER BY created_at DESC, id DESC
      LIMIT ${fetchLimit}
    `;
	} else {
		result = await db`
      SELECT * FROM intents
      WHERE user_id = ${userId}
      ORDER BY created_at DESC, id DESC
      LIMIT ${fetchLimit}
    `;
	}

	const rows = result.rows as IntentRow[];
	const pageRows = rows.slice(0, pageSize);
	const intentIds = pageRows.map((row) => row.id);
	const historyMap = await getStatusHistoriesBatch(intentIds, db);

	return {
		intents: pageRows.map((row) => rowToIntent(row, historyMap.get(row.id) ?? [])),
		nextCursor:
			rows.length > pageSize && pageRows.length > 0
				? encodeIntentCursor(pageRows[pageRows.length - 1]!)
				: undefined,
	};
}

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
	const x402 = isTransferIntent(intentRow.details) ? intentRow.details.x402 : undefined;
	if (!x402 && !userNote) return userNote ?? null;

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
		const receipt = params.settlementReceipt ?? x402?.settlementReceipt;
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
		if (x402?.accepted?.network) {
			context.network = x402.accepted.network;
		}
	}

	if (status === "executing") {
		context.resource = x402?.resource?.url;
	}

	if (Object.keys(context).length === 0) return userNote ?? null;
	if (Object.keys(context).length === 1 && context.message) return userNote ?? null;

	return JSON.stringify(context);
}

export async function updateIntentStatus(
	params: {
		id: string;
		status: IntentStatus;
		txHash?: string;
		note?: string;
		paymentSignatureHeader?: string;
		paymentPayload?: X402PaymentPayload;
		settlementReceipt?: X402SettlementReceipt;
		expiresAt?: string;
	},
	dbClient?: DbClient,
): Promise<Intent | null> {
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

	const existingQuery = dbClient?.sql ?? sql;
	const existing = await existingQuery`SELECT * FROM intents WHERE id = ${id}`;
	if (existing.rows.length === 0) {
		return null;
	}

	const intentRow = existing.rows[0] as IntentRow;
	const nowIso = new Date().toISOString();
	const currentStatus = intentRow.status as IntentStatus;
	if (!isValidTransition(currentStatus, status)) {
		throw new Error(`Invalid status transition: ${currentStatus} -> ${status}`);
	}

	const ownConnection = !dbClient;
	const client = dbClient ?? (await sql.connect());
	if (ownConnection) {
		client.sql = client.sql.bind(client) as typeof client.sql;
	}
	try {
		await client.sql`BEGIN`;

		if (
			(paymentSignatureHeader || paymentPayload || settlementReceipt) &&
			isTransferIntent(intentRow.details)
		) {
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

				intentRow.details = nextDetails;
			}
		}

		if (expiresAt) {
			await client.sql`
				UPDATE intents
				SET expires_at = ${expiresAt}
				WHERE id = ${id}
			`;
		}

		let txUrl: string | null = null;
		if (status === "broadcasting" && txHash) {
			txUrl = getExplorerTxUrl(intentRow.details.chainId, txHash);
		}

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
			await client.sql`ROLLBACK`;
			throw new IntentStatusConflictError();
		}

		const auditNote = buildAuditNote(status, note, intentRow, params);
		await client.sql`
			INSERT INTO intent_status_history (intent_id, status, timestamp, note)
			VALUES (${id}, ${status}, ${nowIso}, ${auditNote})
		`;

		await client.sql`COMMIT`;
	} catch (err) {
		if (!(err instanceof IntentStatusConflictError)) {
			await client.sql`ROLLBACK`.catch(() => {});
		}
		throw err;
	} finally {
		if (ownConnection) {
			client.release();
		}
	}

	return getIntentById(id, dbClient?.sql ?? sql);
}

export async function getAllIntents(db: DbExecutor = sql): Promise<Intent[]> {
	const result = await db`
    SELECT * FROM intents
    ORDER BY created_at DESC
    LIMIT 100
  `;

	const rows = result.rows as IntentRow[];
	const intentIds = rows.map((row) => row.id);
	const historyMap = await getStatusHistoriesBatch(intentIds, db);

	return rows.map((row) => rowToIntent(row, historyMap.get(row.id) ?? []));
}

export async function deleteAllIntents(db: DbExecutor = sql): Promise<void> {
	await db`DELETE FROM intent_status_history`;
	await db`DELETE FROM intents`;
}
