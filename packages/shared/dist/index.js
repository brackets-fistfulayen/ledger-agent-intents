/**
 * Shared types for Agent Payments with Ledger system
 */
/**
 * Valid status transitions for intents.
 * Terminal states (rejected, confirmed, failed, expired) have no outgoing transitions.
 */
export const INTENT_TRANSITIONS = {
    pending: ["approved", "rejected", "broadcasting", "authorized", "failed", "expired"],
    approved: ["broadcasting", "authorized", "failed", "expired"],
    rejected: [],
    broadcasting: ["confirmed", "failed", "expired"],
    authorized: ["executing", "confirmed", "failed", "expired"],
    executing: ["confirmed", "failed"],
    confirmed: [],
    failed: [],
    expired: [],
};
/**
 * Check if a status transition is valid according to the state machine.
 */
export function isValidTransition(from, to) {
    const allowed = INTENT_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
}
// =============================================================================
// Supported Chains
// =============================================================================
export const SUPPORTED_CHAINS = {
    8453: {
        name: "Base",
        symbol: "ETH",
        explorer: "https://basescan.org",
    },
    11155111: {
        name: "Sepolia",
        symbol: "ETH",
        explorer: "https://sepolia.etherscan.io",
    },
    84532: {
        name: "Base Sepolia",
        symbol: "ETH",
        explorer: "https://sepolia.basescan.org",
    },
};
// =============================================================================
// Supported Tokens
// =============================================================================
export const SUPPORTED_TOKENS = {
    // Base mainnet
    8453: {
        USDC: {
            address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            decimals: 6,
        },
    },
    // Sepolia testnet
    11155111: {
        USDC: {
            address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
            decimals: 6,
        },
    },
    // Base Sepolia testnet
    84532: {
        USDC: {
            address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            decimals: 6,
        },
    },
};
// =============================================================================
// Explorer URL Helpers
// =============================================================================
/**
 * Get the block explorer URL for a transaction hash
 */
export function getExplorerTxUrl(chainId, txHash) {
    const chain = SUPPORTED_CHAINS[chainId];
    const explorer = chain?.explorer ?? "https://etherscan.io";
    return `${explorer}/tx/${txHash}`;
}
/**
 * Get the block explorer URL for an address
 */
export function getExplorerAddressUrl(chainId, address) {
    const chain = SUPPORTED_CHAINS[chainId];
    const explorer = chain?.explorer ?? "https://etherscan.io";
    return `${explorer}/address/${address}`;
}
/**
 * Check if a chain ID is supported
 */
export function isSupportedChain(chainId) {
    return chainId in SUPPORTED_CHAINS;
}
/**
 * Get chain name by ID, or "Unknown" if not supported
 */
export function getChainName(chainId) {
    const chain = SUPPORTED_CHAINS[chainId];
    return chain?.name ?? "Unknown";
}
// =============================================================================
// Utility Functions
// =============================================================================
// Utility: generate intent ID
export function generateIntentId() {
    return `int_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
// Utility: format amount for display
export function formatAmount(amount, token) {
    return `${amount} ${token}`;
}
// =============================================================================
// x402 / CAIP-2 Utility Functions
// =============================================================================
/**
 * Parse a CAIP-2 "eip155:<chainId>" network string to a numeric chain ID.
 * Returns `null` if the string is not a valid eip155 network identifier.
 */
export function parseEip155ChainId(network) {
    const match = /^eip155:(\d+)$/.exec(network);
    if (!match?.[1])
        return null;
    return Number(match[1]);
}
/**
 * Format an atomic (smallest-unit) amount to a human-readable decimal string.
 * e.g. formatAtomicAmount("10000", 6) => "0.01"
 */
export function formatAtomicAmount(atomicAmount, decimals) {
    try {
        const num = BigInt(atomicAmount);
        const divisor = BigInt(10 ** decimals);
        const intPart = num / divisor;
        const fracPart = num % divisor;
        const fracStr = fracPart.toString().padStart(decimals, "0").replace(/0+$/, "");
        if (fracStr) {
            return `${intPart}.${fracStr}`;
        }
        return intPart.toString();
    }
    catch {
        return atomicAmount;
    }
}
/**
 * Extract the hostname from a URL for display purposes.
 * Returns the raw string if parsing fails.
 */
export function extractDomain(url) {
    try {
        return new URL(url).hostname;
    }
    catch {
        return url;
    }
}
