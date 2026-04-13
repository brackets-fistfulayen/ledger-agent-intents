import {
	SUPPORTED_TOKENS,
	type SupportedChainId,
	type TokenInfo,
	getChainNetwork,
	isSupportedChain,
} from "./index.js";

const API_BASE = "https://crypto-assets-service.api.ledger.com/v1/tokens";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
	data: TokenInfo | null;
	expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(key: string): TokenInfo | null | undefined {
	const entry = cache.get(key);
	if (!entry) return undefined;
	if (Date.now() > entry.expiresAt) {
		cache.delete(key);
		return undefined;
	}
	return entry.data;
}

function setCache(key: string, data: TokenInfo | null): void {
	cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

interface LedgerTokenResponse {
	id: string;
	contract_address: string;
	name: string;
	ticker: string;
	decimals: number;
}

function toTokenInfo(item: LedgerTokenResponse): TokenInfo {
	return {
		address: item.contract_address,
		decimals: item.decimals,
		name: item.name,
		ticker: item.ticker,
	};
}

/**
 * Look up a token from SUPPORTED_TOKENS (synchronous, offline).
 */
function lookupStatic(chainId: number, ticker: string): TokenInfo | null {
	if (!isSupportedChain(chainId)) return null;
	const entry = SUPPORTED_TOKENS[chainId as SupportedChainId]?.[ticker.toUpperCase()];
	if (!entry) return null;
	return { address: entry.address, decimals: entry.decimals, ticker: ticker.toUpperCase() };
}

/**
 * Resolve a token by ticker symbol.
 * Checks SUPPORTED_TOKENS first, then falls back to the Ledger crypto-assets API.
 */
export async function resolveToken(chainId: number, ticker: string): Promise<TokenInfo | null> {
	const upperTicker = ticker.toUpperCase();

	// 1. Static fallback (instant)
	const staticResult = lookupStatic(chainId, upperTicker);
	if (staticResult) return staticResult;

	// 2. Cache
	const cacheKey = `${chainId}:ticker:${upperTicker}`;
	const cached = getCached(cacheKey);
	if (cached !== undefined) return cached;

	// 3. API
	const network = getChainNetwork(chainId);
	if (!network) return null;

	try {
		const url = `${API_BASE}?network=${network}&ticker=${upperTicker}&output=id,contract_address,name,ticker,decimals`;
		const res = await globalThis.fetch(url);
		if (!res.ok) {
			setCache(cacheKey, null);
			return null;
		}
		const items = (await res.json()) as LedgerTokenResponse[];
		const result = items.length > 0 ? toTokenInfo(items[0]!) : null;
		setCache(cacheKey, result);
		return result;
	} catch {
		return null;
	}
}

/**
 * Resolve a token by contract address.
 */
export async function resolveTokenByAddress(
	chainId: number,
	contractAddress: string,
): Promise<TokenInfo | null> {
	const addr = contractAddress.toLowerCase();

	const cacheKey = `${chainId}:addr:${addr}`;
	const cached = getCached(cacheKey);
	if (cached !== undefined) return cached;

	const network = getChainNetwork(chainId);
	if (!network) return null;

	try {
		const url = `${API_BASE}?network=${network}&contract_address=${addr}&output=id,contract_address,name,ticker,decimals`;
		const res = await globalThis.fetch(url);
		if (!res.ok) {
			setCache(cacheKey, null);
			return null;
		}
		const items = (await res.json()) as LedgerTokenResponse[];
		const result = items.length > 0 ? toTokenInfo(items[0]!) : null;
		setCache(cacheKey, result);
		return result;
	} catch {
		return null;
	}
}
