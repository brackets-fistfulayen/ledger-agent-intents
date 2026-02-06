import { useCallback, useEffect, useRef, useState } from "react";
import { useLedger } from "./ledger-provider";

// Use same-origin API in production (Vercel); allow override in development only.
const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_BACKEND_URL || "") : "";

/** Maximum number of automatic retry attempts before giving up. */
const MAX_AUTO_RETRIES = 3;
/** Base delay (ms) for exponential backoff between retries. */
const RETRY_BASE_DELAY_MS = 2000;

/**
 * - `idle`             – no wallet connected yet
 * - `checking`         – validating existing session cookie via GET /api/me
 * - `authed`           – valid session exists (cookie or just-signed)
 * - `unauthenticated`  – no valid session; signing prompt will be triggered
 * - `authing`          – personal_sign challenge-sign-verify in progress
 * - `error`            – auth attempt failed (will auto-retry)
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
	nonce: string;
	message: string;
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
	/** Trigger the full personal_sign challenge → Ledger-sign → verify flow. */
	authenticate: () => void;
} {
	const { account, isConnected, personalSign, dismissDeviceAction } = useLedger();
	const [status, setStatus] = useState<AuthStatus>("idle");
	const [error, setError] = useState<Error | null>(null);
	const checkingRef = useRef(false);
	const lastCheckedWalletRef = useRef<string | null>(null);
	const authingRef = useRef(false);
	const retryCountRef = useRef(0);
	const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// ── Cleanup retry timer on unmount or disconnect ────────────────────
	useEffect(() => {
		return () => {
			if (retryTimerRef.current) {
				clearTimeout(retryTimerRef.current);
				retryTimerRef.current = null;
			}
		};
	}, []);

	// ── Passive phase ───────────────────────────────────────────────────
	// Check for an existing session cookie on connect.
	// If no valid session, auto-trigger authentication.
	useEffect(() => {
		if (!isConnected || !account) {
			if (status !== "idle") {
				setStatus("idle");
				setError(null);
				lastCheckedWalletRef.current = null;
				retryCountRef.current = 0;
				if (retryTimerRef.current) {
					clearTimeout(retryTimerRef.current);
					retryTimerRef.current = null;
				}
			}
			return;
		}

		const walletLower = account.toLowerCase();

		// Don't re-check if we already resolved this wallet
		if (lastCheckedWalletRef.current === walletLower) return;
		if (checkingRef.current) return;

		checkingRef.current = true;
		lastCheckedWalletRef.current = walletLower;
		setStatus("checking");
		setError(null);
		retryCountRef.current = 0;

		(async () => {
			try {
				const valid = await checkExistingSession(walletLower);
				if (valid) {
					setStatus("authed");
					// Session already exists — dismiss the "Authenticating…" dialog
					// that selectAddress left open (no signing needed).
					dismissDeviceAction();
				} else {
					setStatus("unauthenticated");
				}
			} catch {
				setStatus("unauthenticated");
			} finally {
				checkingRef.current = false;
			}
		})();
	}, [isConnected, account, status, dismissDeviceAction]);

	// ── Active phase: full challenge → sign → verify ────────────────────
	const authenticate = useCallback(() => {
		if (!isConnected || !account) return;
		if (authingRef.current) return;

		authingRef.current = true;
		setStatus("authing");
		setError(null);

		(async () => {
			let signingStarted = false;
			try {
				// 1. Request a challenge nonce from the backend
				const challengeRes = await fetch(`${API_BASE}/api/auth/challenge`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ walletAddress: account }),
				});
				const challengeJson = (await challengeRes.json().catch(() => null)) as ChallengeResponse | null;
				if (!challengeRes.ok || !challengeJson?.success) {
					throw new Error(challengeJson?.error || "Failed to get auth challenge");
				}

				// 2. Sign the welcome message with EIP-191 personal_sign on the Ledger
				signingStarted = true;
				const signature = await personalSign(challengeJson.message);

				// 3. Verify signature with the backend to establish a session
				const verifyRes = await fetch(`${API_BASE}/api/auth/verify`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						walletAddress: account,
						nonce: challengeJson.nonce,
						signature,
					}),
				});
				const verifyJson = (await verifyRes.json().catch(() => null)) as VerifyResponse | null;
				if (!verifyRes.ok || !verifyJson?.success) {
					throw new Error(verifyJson?.error || "Authentication failed");
				}

				setStatus("authed");
				retryCountRef.current = 0;
			} catch (e) {
				const err = e instanceof Error ? e : new Error("Authentication failed");
				setError(err);
				setStatus("error");

				if (!signingStarted) {
					// Pre-signing error (e.g. challenge API failure) — dismiss
					// the transitional "Authenticating…" dialog left open by
					// selectAddress, since no device interaction happened.
					dismissDeviceAction();
				}
				// If signing started and threw, personalSign already set its own
				// error state in the DeviceActionDialog (with a Retry button).
				// We leave the dialog open so the user can retry from it.
			} finally {
				authingRef.current = false;
			}
		})();
	}, [isConnected, account, personalSign, dismissDeviceAction]);

	// ── Auto-trigger: sign automatically when unauthenticated ───────────
	useEffect(() => {
		if (status === "unauthenticated") {
			authenticate();
		}
	}, [status, authenticate]);

	// ── Auto-retry on error with exponential backoff ────────────────────
	useEffect(() => {
		if (status !== "error") return;
		if (retryCountRef.current >= MAX_AUTO_RETRIES) return;

		const delay = RETRY_BASE_DELAY_MS * 2 ** retryCountRef.current;
		retryCountRef.current += 1;

		retryTimerRef.current = setTimeout(() => {
			retryTimerRef.current = null;
			// Reset to unauthenticated so the auto-trigger fires again
			setStatus("unauthenticated");
		}, delay);

		return () => {
			if (retryTimerRef.current) {
				clearTimeout(retryTimerRef.current);
				retryTimerRef.current = null;
			}
		};
	}, [status]);

	return { status, error, authenticate };
}
