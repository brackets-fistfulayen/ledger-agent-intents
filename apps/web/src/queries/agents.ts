import type { TrustchainMember, RegisterAgentRequest } from "@agent-intents/shared";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_BACKEND_URL || "") : "";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, { credentials: "include", ...init });
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
		throw new Error(body.error || `Request failed: ${res.status}`);
	}
	return (await res.json()) as T;
}

// =============================================================================
// Query Options
// =============================================================================

/**
 * List all agents for a given trustchain ID.
 */
export function agentsQueryOptions(trustchainId: string | null) {
	return queryOptions({
		queryKey: ["agents", trustchainId] as const,
		queryFn: async (): Promise<TrustchainMember[]> => {
			if (!trustchainId) return [];
			const data = await fetchJson<{ success: boolean; members: TrustchainMember[] }>(
				`${API_BASE}/api/agents?trustchainId=${encodeURIComponent(trustchainId)}`,
			);
			return data.members;
		},
		enabled: !!trustchainId,
		staleTime: 10_000,
	});
}

// =============================================================================
// Mutations
// =============================================================================

/**
 * Register a new agent.
 */
export function useRegisterAgent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			params: RegisterAgentRequest,
		): Promise<TrustchainMember> => {
			const data = await fetchJson<{ success: boolean; member: TrustchainMember }>(
				`${API_BASE}/api/agents/register`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(params),
				},
			);
			return data.member;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents"] });
		},
	});
}

/**
 * Revoke an agent.
 */
export function useRevokeAgent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<TrustchainMember> => {
			const data = await fetchJson<{ success: boolean; member: TrustchainMember }>(
				`${API_BASE}/api/agents/${id}`,
				{ method: "DELETE" },
			);
			return data.member;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents"] });
		},
	});
}
