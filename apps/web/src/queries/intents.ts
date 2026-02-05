import type { Intent, IntentStatus, X402PaymentPayload } from "@agent-intents/shared";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

// Use same-origin API in production (Vercel); allow override in development only.
// This avoids accidentally pointing prod to a host that serves HTML for `/api/*`.
const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_BACKEND_URL || "") : "";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, { credentials: "include", ...init });
	const contentType = res.headers.get("content-type") ?? "";
	const isJson = contentType.includes("application/json");

	// If the backend (or Vercel rewrite) returns HTML (often index.html), fail fast with a clear error.
	if (!res.ok) {
		if (isJson) {
			const maybeJson = (await res.json().catch(() => null)) as
				| { error?: string; message?: string }
				| null;
			const message = maybeJson?.error || maybeJson?.message;
			throw new Error(message || `Request failed: ${res.status} ${res.statusText}`);
		}

		const text = await res.text().catch(() => "");
		const snippet = text.trim().slice(0, 140);
		throw new Error(
			`Request failed: ${res.status} ${res.statusText}${
				snippet ? ` — ${snippet}` : ""
			}`
		);
	}

	if (!isJson) {
		const text = await res.text().catch(() => "");
		const snippet = text.trim().slice(0, 140);
		throw new Error(
			`Expected JSON but got ${contentType || "unknown content-type"}${
				snippet ? ` — ${snippet}` : ""
			}`
		);
	}

	return (await res.json()) as T;
}

// =============================================================================
// Query Options
// =============================================================================

/**
 * Query options for fetching a user's intents with optional status filter.
 * Polls every 5 seconds to keep the list up-to-date.
 */
export function intentsQueryOptions(userId: string, status?: IntentStatus) {
	return queryOptions({
		queryKey: ["intents", userId, status] as const,
		queryFn: async (): Promise<Intent[]> => {
			const params = new URLSearchParams({ userId });
			if (status) {
				params.set("status", status);
			}
			const url = `${API_BASE}/api/intents?${params.toString()}`;

			const data = await fetchJson<{ success: boolean; intents: Intent[] }>(url);
			return data.intents;
		},
		// Stop polling/retrying when the API is misrouted (e.g. HTML returned instead of JSON).
		retry: false,
		refetchInterval: (query) => (query.state.status === "error" ? false : 5000), // Poll every 5 seconds
		refetchIntervalInBackground: false, // Disable background polling to reduce costs
		staleTime: 2000, // Consider data stale after 2 seconds
	});
}

/**
 * Query options for fetching a single intent by ID.
 */
export function intentQueryOptions(id: string) {
	return queryOptions({
		queryKey: ["intent", id] as const,
		queryFn: async (): Promise<Intent> => {
			const data = await fetchJson<{ success: boolean; intent: Intent }>(
				`${API_BASE}/api/intents/${id}`
			);
			return data.intent;
		},
		retry: false,
	});
}

// =============================================================================
// Mutations
// =============================================================================

interface UpdateIntentStatusParams {
	id: string;
	status: IntentStatus;
	txHash?: string;
	note?: string;
	// x402: base64-encoded JSON PaymentPayload for PAYMENT-SIGNATURE header
	paymentSignatureHeader?: string;
	paymentPayload?: X402PaymentPayload;
}

/**
 * Mutation hook for updating an intent's status.
 * Automatically invalidates intent queries on success.
 */
export function useUpdateIntentStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			status,
			txHash,
			note,
			paymentSignatureHeader,
			paymentPayload,
		}: UpdateIntentStatusParams): Promise<Intent> => {
			const url = `${API_BASE}/api/intents/status`;
			const res = await fetch(url, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, status, txHash, note, paymentSignatureHeader, paymentPayload }),
			});

			if (!res.ok) {
				const contentType = res.headers.get("content-type") ?? "";
				const isJson = contentType.includes("application/json");
				if (isJson) {
					const error = (await res.json().catch(() => ({}))) as { error?: string };
					throw new Error(error.error || `Failed to update intent: ${res.statusText}`);
				}
				const text = await res.text().catch(() => "");
				const snippet = text.trim().slice(0, 140);
				throw new Error(
					`Failed to update intent: ${res.status} ${res.statusText}${
						snippet ? ` — ${snippet}` : ""
					}`
				);
			}

			const data = (await res.json()) as { success: boolean; intent: Intent };
			return data.intent;
		},
		onSuccess: () => {
			// Invalidate all intent queries to refresh the list immediately
			queryClient.invalidateQueries({ queryKey: ["intents"] });
			queryClient.invalidateQueries({ queryKey: ["intent"] });
		},
	});
}
