import { randomUUID } from "node:crypto";
/**
 * Issue a personal_sign authentication challenge for a wallet.
 * POST /api/auth/challenge
 *
 * Body: { walletAddress: string }
 * Returns: { success: true, nonce: string, message: string }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildWelcomeMessage, normalizeWalletAddress } from "../_lib/auth.js";
import { sql } from "../_lib/db.js";
import { jsonError, jsonSuccess, methodRouter, parseBodyWithSchema } from "../_lib/http.js";
import { challengeBodySchema } from "../_lib/validation.js";

const CHALLENGE_VALIDITY_SECONDS = 300; // 5 minutes

/** Max challenge requests per wallet per minute */
const RATE_LIMIT_CHALLENGE_PER_MINUTE = 10;

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBodyWithSchema(req, res, challengeBodySchema);
		if (body === null) return;

		let wallet: string;
		try {
			wallet = normalizeWalletAddress(body.walletAddress);
		} catch {
			jsonError(res, "Invalid wallet address", 400);
			return;
		}

		// Rate limiting: max N challenges per wallet per minute
		try {
			const oneMinuteAgoEpoch = Math.floor(Date.now() / 1000) - 60;
			const countResult = await sql`
				SELECT COUNT(*)::int AS cnt
				FROM auth_challenges
				WHERE wallet_address = ${wallet}
					AND issued_at > to_timestamp(${oneMinuteAgoEpoch})
			`;
			const recentCount = (countResult.rows[0] as { cnt: number })?.cnt ?? 0;
			if (recentCount >= RATE_LIMIT_CHALLENGE_PER_MINUTE) {
				jsonError(
					res,
					"Rate limit exceeded: too many challenge requests. Try again in a minute.",
					429,
				);
				return;
			}
		} catch {
			jsonError(res, "Service temporarily unavailable", 503);
			return;
		}

		const challengeId = randomUUID();
		const nonce = randomUUID();
		const now = Math.floor(Date.now() / 1000);
		const issuedAt = now;
		const expiresAt = now + CHALLENGE_VALIDITY_SECONDS;

		await sql`
			INSERT INTO auth_challenges (id, wallet_address, nonce, chain_id, issued_at, expires_at)
			VALUES (
				${challengeId},
				${wallet},
				${nonce},
				${0},
				to_timestamp(${issuedAt}),
				to_timestamp(${expiresAt})
			)
		`;

		const message = buildWelcomeMessage(nonce);

		jsonSuccess(res, { nonce, message });
	},
});
