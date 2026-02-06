/**
 * Agents repository – database operations for trustchain members (agents).
 */
import type { TrustchainMember, TrustchainMemberRole } from "@agent-intents/shared";
import { sql } from "./db.js";

// Database row type
interface TrustchainMemberRow {
	id: string;
	trustchain_id: string;
	member_pubkey: string;
	role: TrustchainMemberRole;
	label: string | null;
	authorization_signature: string | null;
	created_at: Date;
	revoked_at: Date | null;
}

function rowToMember(row: TrustchainMemberRow): TrustchainMember {
	return {
		id: row.id,
		trustchainId: row.trustchain_id,
		memberPubkey: row.member_pubkey,
		role: row.role,
		label: row.label,
		createdAt: row.created_at.toISOString(),
		revokedAt: row.revoked_at?.toISOString() ?? null,
	};
}

/**
 * Register a new agent (trustchain member).
 * Throws if the public key is already registered.
 */
export async function registerAgent(params: {
	trustchainId: string;
	memberPubkey: string;
	role?: TrustchainMemberRole;
	label?: string;
	authorizationSignature?: string;
}): Promise<TrustchainMember> {
	const {
		trustchainId,
		memberPubkey,
		role = "agent_write_only",
		label,
		authorizationSignature,
	} = params;

	const result = await sql`
    INSERT INTO trustchain_members (trustchain_id, member_pubkey, role, label, authorization_signature)
    VALUES (${trustchainId}, ${memberPubkey}, ${role}, ${label ?? null}, ${authorizationSignature ?? null})
    RETURNING *
  `;

	return rowToMember(result.rows[0] as TrustchainMemberRow);
}

/**
 * Look up an active (non-revoked) member by their public key (address).
 */
export async function getActiveMemberByPubkey(pubkey: string): Promise<TrustchainMember | null> {
	const result = await sql`
    SELECT * FROM trustchain_members
    WHERE member_pubkey = ${pubkey}
      AND revoked_at IS NULL
    LIMIT 1
  `;

	if (result.rows.length === 0) return null;
	return rowToMember(result.rows[0] as TrustchainMemberRow);
}

/**
 * Get a member by ID.
 */
export async function getMemberById(id: string): Promise<TrustchainMember | null> {
	const result = await sql`
    SELECT * FROM trustchain_members WHERE id = ${id}::uuid
    LIMIT 1
  `;

	if (result.rows.length === 0) return null;
	return rowToMember(result.rows[0] as TrustchainMemberRow);
}

/**
 * List all members for a trustchain (including revoked ones).
 */
export async function getMembersByTrustchain(trustchainId: string): Promise<TrustchainMember[]> {
	const result = await sql`
    SELECT * FROM trustchain_members
    WHERE trustchain_id = ${trustchainId}
    ORDER BY created_at DESC
  `;

	return (result.rows as TrustchainMemberRow[]).map(rowToMember);
}

/**
 * Revoke a member (soft-delete by setting revoked_at).
 */
export async function revokeMember(id: string): Promise<TrustchainMember | null> {
	const result = await sql`
    UPDATE trustchain_members
    SET revoked_at = NOW()
    WHERE id = ${id}::uuid AND revoked_at IS NULL
    RETURNING *
  `;

	if (result.rows.length === 0) return null;
	return rowToMember(result.rows[0] as TrustchainMemberRow);
}
