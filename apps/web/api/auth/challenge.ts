/**
 * Issue a personal_sign authentication challenge for a wallet.
 * POST /api/auth/challenge
 *
 * Body: { walletAddress: string }
 * Returns: { success: true, nonce: string, message: string }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { methodRouter, jsonError, jsonSuccess, parseBodyWithSchema } from "../_lib/http.js";
import { buildWelcomeMessage, normalizeWalletAddress } from "../_lib/auth.js";
import { sql } from "../_lib/db.js";
import { challengeBodySchema } from "../_lib/validation.js";

const CHALLENGE_VALIDITY_SECONDS = 300; // 5 minutes

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
