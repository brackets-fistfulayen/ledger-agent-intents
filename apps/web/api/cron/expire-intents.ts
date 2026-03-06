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
import { withDbRlsContext } from "../_lib/db.js";
import { env } from "../_lib/env.js";
import { logger } from "../_lib/logger.js";
import { checkIpRateLimit, logAuthFailure } from "../_lib/security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const rateLimit = checkIpRateLimit(req);
	if (!rateLimit.allowed) {
		if (rateLimit.retryAfterSeconds) {
			res.setHeader("Retry-After", rateLimit.retryAfterSeconds.toString());
		}
		res.status(429).json({ success: false, error: "Rate limit exceeded. Try again later." });
		return;
	}

	// Vercel Cron sends the secret in the Authorization header
	const authHeader = req.headers.authorization;
	const cronSecret = env.CRON_SECRET;

	if (!cronSecret) {
		logger.error("CRON_SECRET not configured");
		res.status(500).json({ error: "CRON_SECRET not configured" });
		return;
	}

	if (authHeader !== `Bearer ${cronSecret}`) {
		logAuthFailure({
			req,
			status: 401,
			reason: "Invalid cron bearer token",
		});
		res.status(401).json({ error: "Unauthorized" });
		return;
	}

	try {
		const count = await withDbRlsContext({ systemRole: true }, async (client) => {
			const now = new Date().toISOString();

			const result = await client.sql`
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

			const updatedCount = result.rowCount ?? 0;

			if (updatedCount > 0) {
				logger.info({ count: updatedCount }, "expire-intents: transitioned intents to expired");
				await client.sql`
					INSERT INTO intent_status_history (intent_id, status, timestamp, note)
					SELECT id, 'expired', ${now}, 'Automatically expired by cron (x402 authorization timeout)'
					FROM intents
					WHERE status = 'expired'
						AND id NOT IN (
							SELECT intent_id FROM intent_status_history WHERE status = 'expired'
						)
				`;
			}

			return updatedCount;
		});

		res.status(200).json({ success: true, expiredCount: count });
	} catch (error) {
		logger.error({ err: error }, "expire-intents error");
		res.status(500).json({ error: "Internal error" });
	}
}
