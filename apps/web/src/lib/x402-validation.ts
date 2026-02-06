/**
 * x402 validation utilities for client-side checks before signing.
 */

import type { X402AcceptedExactEvm, X402Resource } from "@agent-intents/shared";
import { http, type Address, type Chain, createPublicClient, erc20Abi } from "viem";
import { base, baseSepolia, sepolia } from "viem/chains";

// Re-export shared utilities so existing import sites don't break
export { parseEip155ChainId, formatAtomicAmount, extractDomain } from "@agent-intents/shared";

// =============================================================================
// Constants
// =============================================================================

/** Supported x402 EVM networks (Base mainnet + Base Sepolia for MVP) */
const SUPPORTED_X402_NETWORKS = new Set(["eip155:8453", "eip155:84532"]);

// =============================================================================
// Validation result type
// =============================================================================

export interface X402ValidationResult {
	valid: boolean;
	error?: string;
}

// =============================================================================
// Validation helpers
// =============================================================================

/**
 * Validate a URL is http(s).
 */
export function isValidHttpUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:" || parsed.protocol === "http:";
	} catch {
		return false;
	}
}

/**
 * Validate an Ethereum address (0x + 40 hex chars).
 */
export function isValidEvmAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate a uint256 decimal string (positive integer, no decimals).
 */
export function isValidUint256String(value: string): boolean {
	if (!/^\d+$/.test(value)) return false;
	try {
		const num = BigInt(value);
		// Max uint256
		return num >= 0n && num <= 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
	} catch {
		return false;
	}
}

/**
 * Validate x402 resource object.
 */
export function validateX402Resource(resource: X402Resource | undefined): X402ValidationResult {
	if (!resource) {
		return { valid: false, error: "Missing x402 resource" };
	}
	if (!resource.url) {
		return { valid: false, error: "Missing resource URL" };
	}
	if (!isValidHttpUrl(resource.url)) {
		return { valid: false, error: "Invalid resource URL (must be http/https)" };
	}
	return { valid: true };
}

/**
 * Validate x402 accepted payment requirements for EVM exact scheme.
 */
export function validateX402Accepted(
	accepted: X402AcceptedExactEvm | undefined,
): X402ValidationResult {
	if (!accepted) {
		return { valid: false, error: "Missing x402 payment requirements" };
	}

	// Scheme
	if (accepted.scheme !== "exact") {
		return { valid: false, error: `Unsupported x402 scheme: ${accepted.scheme}` };
	}

	// Network
	if (!SUPPORTED_X402_NETWORKS.has(accepted.network)) {
		return {
			valid: false,
			error: `Unsupported x402 network: ${accepted.network}. Supported: Base, Base Sepolia`,
		};
	}

	// Asset address
	if (!isValidEvmAddress(accepted.asset)) {
		return { valid: false, error: "Invalid asset address" };
	}

	// PayTo address
	if (!isValidEvmAddress(accepted.payTo)) {
		return { valid: false, error: "Invalid payTo address" };
	}

	// Amount (atomic units)
	if (!isValidUint256String(accepted.amount)) {
		return { valid: false, error: "Invalid amount (must be a positive integer in atomic units)" };
	}

	// EIP-712 domain name and version (required for reliable signature)
	if (!accepted.extra?.name) {
		return { valid: false, error: "Missing EIP-712 domain name (extra.name required)" };
	}
	if (!accepted.extra?.version) {
		return { valid: false, error: "Missing EIP-712 domain version (extra.version required)" };
	}

	return { valid: true };
}

/**
 * Full validation of x402 context before signing.
 */
export function validateX402ForSigning(
	resource: X402Resource | undefined,
	accepted: X402AcceptedExactEvm | undefined,
): X402ValidationResult {
	const resourceResult = validateX402Resource(resource);
	if (!resourceResult.valid) return resourceResult;

	const acceptedResult = validateX402Accepted(accepted);
	if (!acceptedResult.valid) return acceptedResult;

	return { valid: true };
}

// =============================================================================
// On-chain balance check
// =============================================================================

const CHAIN_CONFIG: Record<number, { chain: Chain; rpcUrl?: string }> = {
	8453: { chain: base },
	84532: { chain: baseSepolia },
	11155111: { chain: sepolia },
};

/**
 * Check if the user's USDC balance is sufficient for the x402 payment.
 * Returns null if sufficient, or an error message if insufficient.
 * Fails silently (returns null) on RPC errors so signing is not blocked.
 */
export async function checkUsdcBalance(
	userAddress: string,
	tokenAddress: string,
	requiredAmount: string,
	chainId: number,
): Promise<string | null> {
	const config = CHAIN_CONFIG[chainId];
	if (!config) return null; // Unknown chain -- skip check

	try {
		const client = createPublicClient({
			chain: config.chain,
			transport: http(config.rpcUrl),
		});

		const balance = await client.readContract({
			address: tokenAddress as Address,
			abi: erc20Abi,
			functionName: "balanceOf",
			args: [userAddress as Address],
		});

		const required = BigInt(requiredAmount);
		if (balance < required) {
			// Format both for display
			const balanceStr = formatBalanceForDisplay(balance, 6);
			const requiredStr = formatBalanceForDisplay(required, 6);
			return `Insufficient USDC balance: you have ${balanceStr} USDC but need ${requiredStr} USDC`;
		}

		return null; // Balance is sufficient
	} catch (err) {
		// Fail open: don't block signing on RPC errors
		console.warn("[x402] Balance check failed (proceeding anyway):", err);
		return null;
	}
}

function formatBalanceForDisplay(amount: bigint, decimals: number): string {
	const divisor = BigInt(10 ** decimals);
	const intPart = amount / divisor;
	const fracPart = amount % divisor;
	const fracStr = fracPart.toString().padStart(decimals, "0").slice(0, 4); // Show 4 decimals
	return `${intPart}.${fracStr}`;
}
