import { type TokenInfo, resolveToken } from "@agent-intents/shared";
import { queryOptions, useQuery } from "@tanstack/react-query";

export function tokenQueryOptions(chainId: number, ticker: string) {
	return queryOptions<TokenInfo | null>({
		queryKey: ["token", chainId, ticker.toUpperCase()],
		queryFn: () => resolveToken(chainId, ticker),
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 1,
		enabled: !!ticker && chainId > 0,
	});
}

export function useTokenInfo(chainId: number, ticker: string) {
	return useQuery(tokenQueryOptions(chainId, ticker));
}
