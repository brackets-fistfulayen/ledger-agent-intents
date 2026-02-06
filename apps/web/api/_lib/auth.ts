import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAddress, recoverMessageAddress } from "viem";
import { sql } from "./db.js";

const SESSION_COOKIE_NAME = "ai_session";

export function normalizeWalletAddress(addr: string): string {
	const trimmed = addr.trim();
	if (!isAddress(trimmed)) {
		throw new Error("Invalid wallet address");
	}
	return trimmed.toLowerCase();
}

export function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
	if (!cookieHeader) return {};
	const out: Record<string, string> = {};
	for (const part of cookieHeader.split(";")) {
		const [rawKey, ...rawValParts] = part.trim().split("=");
		if (!rawKey) continue;
		out[rawKey] = decodeURIComponent(rawValParts.join("=") || "");
	}
	return out;
}

export function setSessionCookie(res: VercelResponse, sessionId: string, expiresAt: Date) {
	const nodeEnv = (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } })
		.process?.env?.NODE_ENV;
	const isProd = nodeEnv === "production";
	const cookie = [
		`${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		isProd ? "Secure" : "",
		`Expires=${expiresAt.toUTCString()}`,
	].filter(Boolean).join("; ");
	res.setHeader("Set-Cookie", cookie);
}

export function clearSessionCookie(res: VercelResponse) {
	const nodeEnv = (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } })
		.process?.env?.NODE_ENV;
	const isProd = nodeEnv === "production";
	const cookie = [
		`${SESSION_COOKIE_NAME}=`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		isProd ? "Secure" : "",
		"Expires=Thu, 01 Jan 1970 00:00:00 GMT",
	].filter(Boolean).join("; ");
	res.setHeader("Set-Cookie", cookie);
}

export async function requireSession(req: VercelRequest): Promise<{ sessionId: string; walletAddress: string }> {
	const cookies = parseCookieHeader(req.headers.cookie);
	const sessionId = cookies[SESSION_COOKIE_NAME];
	if (!sessionId) {
		throw new Error("Unauthorized");
	}

	const now = new Date().toISOString();
	const result = await sql`
    SELECT id, wallet_address
    FROM auth_sessions
    WHERE id = ${sessionId} AND expires_at > ${now}
    LIMIT 1
  `;
	if (result.rows.length === 0) {
		throw new Error("Unauthorized");
	}

	const row = result.rows[0] as { id: string; wallet_address: string };
	return { sessionId: row.id, walletAddress: row.wallet_address };
}

/**
 * Build the human-readable welcome message that the user signs on their Ledger.
 * The nonce is included to prevent replay attacks.
 */
export function buildWelcomeMessage(nonce: string): string {
	return `Welcome to agentintents.io\n\nNonce: ${nonce}`;
}

/**
 * Recover the signer address from an EIP-191 personal_sign signature.
 * Returns the lowercased address.
 */
export async function verifyPersonalSignature(params: {
	message: string;
	signature: `0x${string}`;
}): Promise<string> {
	const recovered = await recoverMessageAddress({
		message: params.message,
		signature: params.signature,
	});
	return recovered.toLowerCase();
}

