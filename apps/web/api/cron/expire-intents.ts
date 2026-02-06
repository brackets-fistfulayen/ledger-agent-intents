/// <reference types="node" />
/**
 * Vercel Cron: Batch-transition expired x402 intents.
 *
 * Runs every minute. Moves intents from "authorized" to "expired" when
 * their x402 authorization has passed its validBefore timestamp.
 *
 * Security: requires CRON_SECRET env var to match the Authorization header.
 *
 * Vercel Cron config in vercel.json:
 *   { "crons": [{ "path": "/api/cron/expire-intents", "schedule": "* * * * *" }] }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	// Vercel Cron sends the secret in the Authorization header
	const authHeader = req.headers.authorization;
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret) {
		console.error("[expire-intents] CRON_SECRET not configured");
		res.status(500).json({ error: "CRON_SECRET not configured" });
		return;
	}

	if (authHeader !== `Bearer ${cronSecret}`) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}

	try {
		const now = new Date().toISOString();

		// Batch update: transition authorized intents whose x402.expiresAt has passed.
		// LIMIT 100 as a safeguard against Vercel's execution timeout.
		// PostgreSQL does not support LIMIT on UPDATE -- use a subquery instead
		const result = await sql`
			UPDATE intents
			SET status = 'expired'
			WHERE id IN (
				SELECT id FROM intents
				WHERE status IN ('authorized', 'approved', 'executing')
					AND (
						(details->'x402'->>'expiresAt' IS NOT NULL AND details->'x402'->>'expiresAt' < ${now})
						OR
						(expires_at IS NOT NULL AND expires_at < ${now})
					)
				LIMIT 100
				FOR UPDATE SKIP LOCKED
			)
		`;

		const count = result.rowCount ?? 0;

		if (count > 0) {
			console.log(`[expire-intents] Transitioned ${count} intents to expired`);
		}

		// Also insert status history entries for the expired intents
		// (We do this in a separate pass since we need the IDs)
		if (count > 0) {
			await sql`
				INSERT INTO intent_status_history (intent_id, status, timestamp, note)
				SELECT id, 'expired', ${now}, 'Automatically expired by cron (x402 authorization timeout)'
				FROM intents
				WHERE status = 'expired'
					AND id NOT IN (
						SELECT intent_id FROM intent_status_history WHERE status = 'expired'
					)
			`;
		}

		res.status(200).json({ success: true, expiredCount: count });
	} catch (error) {
		console.error("[expire-intents] Error:", error);
		res.status(500).json({ error: "Internal error" });
	}
}
