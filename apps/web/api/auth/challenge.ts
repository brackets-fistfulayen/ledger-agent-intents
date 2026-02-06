/**
 * Issue an EIP-712 authentication challenge for a wallet.
 * POST /api/auth/challenge
 *
 * Body: { walletAddress: string, chainId?: number }
 * Returns: { success: true, challengeId: string, typedData: AuthenticateTypedData }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { methodRouter, jsonError, jsonSuccess, parseBodyWithSchema } from "../_lib/http.js";
import { buildAuthenticateTypedData, normalizeWalletAddress } from "../_lib/auth.js";
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

		const chainId = typeof body.chainId === "number" && body.chainId > 0 ? body.chainId : 1;

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
				${chainId},
				to_timestamp(${issuedAt}),
				to_timestamp(${expiresAt})
			)
		`;

		const typedData = buildAuthenticateTypedData({
			chainId,
			walletAddress: wallet,
			nonce,
			issuedAt,
			expiresAt,
		});

		jsonSuccess(res, { challengeId, typedData });
	},
});
