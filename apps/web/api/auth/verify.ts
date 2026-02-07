import { randomUUID } from "node:crypto";
/**
 * Verify personal_sign signature and establish a session cookie.
 * POST /api/auth/verify
 *
 * Body: { walletAddress: string, nonce: string, signature: string }
 * Returns: { success: true, walletAddress: string }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
	buildWelcomeMessage,
	normalizeWalletAddress,
	setSessionCookie,
	verifyPersonalSignature,
} from "../_lib/auth.js";
import { sql } from "../_lib/db.js";
import { jsonError, jsonSuccess, methodRouter, parseBodyWithSchema } from "../_lib/http.js";
import { verifyBodySchema } from "../_lib/validation.js";

const SESSION_VALIDITY_DAYS = 7;

/** Max verify attempts per wallet per minute */
const RATE_LIMIT_VERIFY_PER_MINUTE = 10;

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBodyWithSchema(req, res, verifyBodySchema);
		if (body === null) return;

		let wallet: string;
		try {
			wallet = normalizeWalletAddress(body.walletAddress);
		} catch {
			jsonError(res, "Invalid wallet address", 400);
			return;
		}

		// Rate limiting: max N verify attempts per wallet per minute
		try {
			const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
			const countResult = await sql`
				SELECT COUNT(*)::int AS cnt
				FROM auth_challenges
				WHERE wallet_address = ${wallet}
					AND used_at IS NOT NULL
					AND used_at > ${oneMinuteAgo}
			`;
			const recentCount = (countResult.rows[0] as { cnt: number })?.cnt ?? 0;
			if (recentCount >= RATE_LIMIT_VERIFY_PER_MINUTE) {
				jsonError(
					res,
					"Rate limit exceeded: too many verify attempts. Try again in a minute.",
					429,
				);
				return;
			}
		} catch {
			jsonError(res, "Service temporarily unavailable", 503);
			return;
		}

		const signature = body.signature as `0x${string}`;

		// Look up the challenge by wallet address + nonce
		const challengeResult = await sql`
			SELECT id, wallet_address, nonce
			FROM auth_challenges
			WHERE wallet_address = ${wallet}
				AND nonce = ${body.nonce}
				AND used_at IS NULL
				AND expires_at > NOW()
			LIMIT 1
		`;

		if (challengeResult.rows.length === 0) {
			jsonError(res, "Invalid or expired challenge", 401);
			return;
		}

		const row = challengeResult.rows[0] as {
			id: string;
			wallet_address: string;
			nonce: string;
		};

		// Rebuild the welcome message and verify the signature
		const message = buildWelcomeMessage(row.nonce);

		let recoveredAddress: string;
		try {
			recoveredAddress = await verifyPersonalSignature({ message, signature });
		} catch {
			jsonError(res, "Invalid signature", 401);
			return;
		}

		if (recoveredAddress !== wallet) {
			jsonError(res, "Signature does not match wallet", 401);
			return;
		}

		// Mark challenge as used
		await sql`
			UPDATE auth_challenges
			SET used_at = NOW()
			WHERE id = ${row.id}
		`;

		// Create session
		const sessionId = randomUUID();
		const sessionExpiresAt = new Date();
		sessionExpiresAt.setDate(sessionExpiresAt.getDate() + SESSION_VALIDITY_DAYS);

		await sql`
			INSERT INTO auth_sessions (id, wallet_address, expires_at)
			VALUES (${sessionId}, ${wallet}, ${sessionExpiresAt.toISOString()})
		`;

		setSessionCookie(res, sessionId, sessionExpiresAt);

		jsonSuccess(res, { walletAddress: wallet });
	},
});
