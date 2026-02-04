import type { Intent, IntentStatus } from "@agent-intents/shared";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3005";

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
			const url = new URL(`${API_BASE}/api/users/${userId}/intents`);
			if (status) {
				url.searchParams.set("status", status);
			}

			const res = await fetch(url.toString());
			if (!res.ok) {
				throw new Error(`Failed to fetch intents: ${res.statusText}`);
			}

			const data = (await res.json()) as { success: boolean; intents: Intent[] };
			return data.intents;
		},
		refetchInterval: 5000, // Poll every 5 seconds
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
			const res = await fetch(`${API_BASE}/api/intents/${id}`);
			if (!res.ok) {
				throw new Error(`Failed to fetch intent: ${res.statusText}`);
			}

			const data = (await res.json()) as { success: boolean; intent: Intent };
			return data.intent;
		},
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
}

/**
 * Mutation hook for updating an intent's status.
 * Automatically invalidates intent queries on success.
 */
export function useUpdateIntentStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, status, txHash, note }: UpdateIntentStatusParams): Promise<Intent> => {
			const res = await fetch(`${API_BASE}/api/intents/${id}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status, txHash, note }),
			});

			if (!res.ok) {
				const error = (await res.json().catch(() => ({}))) as { error?: string };
				throw new Error(error.error || `Failed to update intent: ${res.statusText}`);
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
