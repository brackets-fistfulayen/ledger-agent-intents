/**
 * Verify EIP-712 signature and establish a session cookie.
 * POST /api/auth/verify
 *
 * Body: { challengeId: string, signature: string }
 * Returns: { success: true, walletAddress: string }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { methodRouter, jsonError, jsonSuccess, parseBodyWithSchema } from "../_lib/http.js";
import { verifyBodySchema } from "../_lib/validation.js";
import {
	buildAuthenticateTypedData,
	setSessionCookie,
	verifyTypedDataSignature,
} from "../_lib/auth.js";
import { sql } from "../_lib/db.js";

const SESSION_VALIDITY_DAYS = 7;

export default methodRouter({
	POST: async (req: VercelRequest, res: VercelResponse) => {
		const body = parseBodyWithSchema(req, res, verifyBodySchema);
		if (body === null) return;

		const signature = body.signature as `0x${string}`;

		const challengeResult = await sql`
			SELECT id, wallet_address, nonce, chain_id, issued_at, expires_at
			FROM auth_challenges
			WHERE id = ${body.challengeId}
				AND used_at IS NULL
				AND expires_at > NOW()
			LIMIT 1
		`;

		if (challengeResult.rows.length === 0) {
			jsonError(res, "Invalid or expired challenge", 401);
			return;
		}

		const row = challengeResult.rows[0] as {
			wallet_address: string;
			nonce: string;
			chain_id: number;
			issued_at: Date;
			expires_at: Date;
		};

		const issuedAt = Math.floor(new Date(row.issued_at).getTime() / 1000);
		const expiresAt = Math.floor(new Date(row.expires_at).getTime() / 1000);

		const typedData = buildAuthenticateTypedData({
			chainId: Number(row.chain_id),
			walletAddress: row.wallet_address,
			nonce: row.nonce,
			issuedAt,
			expiresAt,
		});

		let recoveredAddress: string;
		try {
			recoveredAddress = await verifyTypedDataSignature({ typedData, signature });
		} catch {
			jsonError(res, "Invalid signature", 401);
			return;
		}

		if (recoveredAddress !== row.wallet_address.toLowerCase()) {
			jsonError(res, "Signature does not match wallet", 401);
			return;
		}

		await sql`
			UPDATE auth_challenges
			SET used_at = NOW()
			WHERE id = ${body.challengeId}
		`;

		const sessionId = randomUUID();
		const sessionExpiresAt = new Date();
		sessionExpiresAt.setDate(sessionExpiresAt.getDate() + SESSION_VALIDITY_DAYS);

		await sql`
			INSERT INTO auth_sessions (id, wallet_address, expires_at)
			VALUES (${sessionId}, ${row.wallet_address}, ${sessionExpiresAt.toISOString()})
		`;

		setSessionCookie(res, sessionId, sessionExpiresAt);

		jsonSuccess(res, { walletAddress: row.wallet_address });
	},
});
