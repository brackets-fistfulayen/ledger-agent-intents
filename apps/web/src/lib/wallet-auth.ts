import { useCallback, useEffect, useRef, useState } from "react";
import { useLedger } from "./ledger-provider";

// Use same-origin API in production (Vercel); allow override in development only.
const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_BACKEND_URL || "") : "";

/**
 * Feature flag: EIP-712 challenge-response authentication.
 *
 * When disabled (default) the hook considers the user authenticated as soon as
 * the wallet is connected — no session cookie, no Ledger signing prompt.
 *
 * Set VITE_AUTH_ENABLED=true in .env to turn it on.
 */
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === "true";

/**
 * - `idle`             – no wallet connected yet
 * - `checking`         – validating existing session cookie via GET /api/me
 * - `authed`           – valid session exists (cookie or just-signed)
 * - `unauthenticated`  – no valid session; user must click "Authenticate"
 * - `authing`          – EIP-712 challenge-sign-verify in progress
 * - `error`            – auth attempt failed
 */
export type AuthStatus =
	| "idle"
	| "checking"
	| "authed"
	| "unauthenticated"
	| "authing"
	| "error";

type MeResponse = {
	success: boolean;
	walletAddress?: string;
};

type ChallengeResponse = {
	success: boolean;
	challengeId: string;
	typedData: unknown;
	error?: string;
};

type VerifyResponse = {
	success: boolean;
	walletAddress: string;
	error?: string;
};

/**
 * Check whether the browser already holds a valid session cookie for `wallet`.
 * Uses GET /api/me which validates the cookie against the DB.
 */
async function checkExistingSession(wallet: string): Promise<boolean> {
	try {
		const res = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
		if (!res.ok) return false;
		const json = (await res.json()) as MeResponse;
		return (
			json.success === true &&
			typeof json.walletAddress === "string" &&
			json.walletAddress.toLowerCase() === wallet
		);
	} catch {
		return false;
	}
}

export function useWalletAuth(): {
	status: AuthStatus;
	error: Error | null;
	/** Trigger the full EIP-712 challenge → Ledger-sign → verify flow. */
	authenticate: () => void;
} {
	const { account, chainId, isConnected, signTypedDataV4 } = useLedger();
	const [status, setStatus] = useState<AuthStatus>("idle");
	const [error, setError] = useState<Error | null>(null);
	const checkingRef = useRef(false);
	const lastCheckedWalletRef = useRef<string | null>(null);
	const authingRef = useRef(false);

	// ── Passive phase ───────────────────────────────────────────────────
	// When AUTH_ENABLED: check for an existing session cookie on connect.
	// When AUTH disabled: immediately mark as "authed" on connect.
	useEffect(() => {
		if (!isConnected || !account) {
			if (status !== "idle") {
				setStatus("idle");
				setError(null);
				lastCheckedWalletRef.current = null;
			}
			return;
		}

		const walletLower = account.toLowerCase();

		// Auth disabled — consider connected = authenticated
		if (!AUTH_ENABLED) {
			if (status !== "authed") setStatus("authed");
			lastCheckedWalletRef.current = walletLower;
			return;
		}

		// Don't re-check if we already resolved this wallet
		if (lastCheckedWalletRef.current === walletLower) return;
		if (checkingRef.current) return;

		checkingRef.current = true;
		lastCheckedWalletRef.current = walletLower;
		setStatus("checking");
		setError(null);

		(async () => {
			try {
				const valid = await checkExistingSession(walletLower);
				setStatus(valid ? "authed" : "unauthenticated");
			} catch {
				setStatus("unauthenticated");
			} finally {
				checkingRef.current = false;
			}
		})();
	}, [isConnected, account, status]);

	// ── Active phase: full challenge → sign → verify ────────────────────
	// Only runs when the user explicitly calls authenticate().
	const authenticate = useCallback(() => {
		if (!AUTH_ENABLED) return;
		if (!isConnected || !account || !chainId) return;
		if (authingRef.current) return;

		authingRef.current = true;
		setStatus("authing");
		setError(null);

		(async () => {
			try {
				const challengeRes = await fetch(`${API_BASE}/api/auth/challenge`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ walletAddress: account, chainId }),
				});
				const challengeJson = (await challengeRes.json().catch(() => null)) as ChallengeResponse | null;
				if (!challengeRes.ok || !challengeJson?.success) {
					throw new Error(challengeJson?.error || "Failed to get auth challenge");
				}

				const signature = await signTypedDataV4(challengeJson.typedData);

				const verifyRes = await fetch(`${API_BASE}/api/auth/verify`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						challengeId: challengeJson.challengeId,
						signature,
					}),
				});
				const verifyJson = (await verifyRes.json().catch(() => null)) as VerifyResponse | null;
				if (!verifyRes.ok || !verifyJson?.success) {
					throw new Error(verifyJson?.error || "Authentication failed");
				}

				setStatus("authed");
			} catch (e) {
				const err = e instanceof Error ? e : new Error("Authentication failed");
				setError(err);
				setStatus("error");
			} finally {
				authingRef.current = false;
			}
		})();
	}, [isConnected, account, chainId, signTypedDataV4]);

	return { status, error, authenticate };
}
