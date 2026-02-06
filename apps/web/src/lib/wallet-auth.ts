import { useEffect, useRef, useState } from "react";
import { useLedger } from "./ledger-provider";

// Use same-origin API in production (Vercel); allow override in development only.
const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_BACKEND_URL || "") : "";

type AuthStatus = "idle" | "authing" | "authed" | "error";

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

export function useWalletAuth(): { status: AuthStatus; error: Error | null } {
	const ledger = useLedger();
	const { account, chainId, isConnected, signTypedDataV4 } = ledger;
	const [status, setStatus] = useState<AuthStatus>("idle");
	const [error, setError] = useState<Error | null>(null);
	const inFlightRef = useRef(false);
	const lastWalletRef = useRef<string | null>(null);

	useEffect(() => {
		if (!isConnected || !account || !chainId) return;
		const walletLower = account.toLowerCase();

		// If we already authenticated this wallet and we're still connected, don't redo.
		if (status === "authed" && lastWalletRef.current === walletLower) return;
		if (inFlightRef.current) return;

		inFlightRef.current = true;
		lastWalletRef.current = walletLower;
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
				inFlightRef.current = false;
			}
		})();
	}, [isConnected, account, chainId, signTypedDataV4, status]);

	return { status, error };
}

