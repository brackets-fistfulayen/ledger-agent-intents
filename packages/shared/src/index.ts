/**
 * Shared types for Ledger Agent Payments system
 */

// Intent status lifecycle
export type IntentStatus =
	| "pending" // Created by agent, awaiting human review
	| "approved" // Human approved, ready to sign
	| "rejected" // Human rejected
	| "signed" // Signed on device, broadcasting
	| "confirmed" // Transaction confirmed on-chain
	| "failed" // Transaction failed
	| "expired"; // Intent expired without action

// Supported intent types
export type IntentType =
	| "transfer" // Token transfer
	| "swap" // Token swap (future)
	| "nft" // NFT transfer (future)
	| "contract"; // Generic contract call (future)

// Urgency levels affect how intents are displayed
export type IntentUrgency = "low" | "normal" | "high" | "critical";

// Payment category (can be enriched from x402 Bazaar or LLM-inferred)
export type PaymentCategory =
	| "api_payment" // x402 pay-per-call API
	| "subscription" // Recurring service (Netflix, Spotify)
	| "purchase" // One-time purchase
	| "p2p_transfer" // Person-to-person transfer
	| "defi" // DeFi operations (swap, stake, lend)
	| "bill_payment" // Utilities, rent, invoices
	| "donation" // Tips, charity
	| "other";

// Merchant/payee information (x402-aligned)
export interface Merchant {
	name: string; // Display name (e.g., "OpenAI", "Uniswap")
	url?: string; // Website or service URL
	logo?: string; // Logo URL for UI display
	verified?: boolean; // True if from x402 Bazaar or curated list
}

// Token transfer intent
export interface TransferIntent {
	type: "transfer";
	token: string; // e.g., 'USDC', 'ETH'
	tokenAddress?: string; // Contract address for ERC-20
	tokenLogo?: string; // URL to token logo image
	amount: string; // Human-readable amount
	amountWei?: string; // Wei amount for precision
	recipient: string; // Destination address
	recipientEns?: string; // ENS name if resolved
	chainId: number; // e.g., 11155111 for Sepolia, 84532 for Base Sepolia
	memo?: string; // Human-readable reason

	// x402-aligned fields
	resource?: string; // x402 resource URL (API endpoint being paid for)
	merchant?: Merchant; // Merchant/payee information
	category?: PaymentCategory; // Payment category
}

// Base intent structure
export interface Intent {
	id: string;
	userId: string; // Ledger Live user identifier
	agentId: string; // Which agent created this (e.g., 'clouseau')
	agentName: string; // Display name (e.g., 'Inspector Clouseau')

	// Intent details (union for different types)
	details: TransferIntent; // Expand to union as we add types

	// Metadata
	urgency: IntentUrgency;
	status: IntentStatus;

	// Timestamps
	createdAt: string; // ISO timestamp
	expiresAt?: string; // Optional expiration
	reviewedAt?: string; // When human reviewed
	signedAt?: string; // When signed on device
	confirmedAt?: string; // When confirmed on-chain

	// Transaction data (populated after signing)
	txHash?: string;
	txUrl?: string; // Block explorer link

	// Audit trail
	statusHistory: Array<{
		status: IntentStatus;
		timestamp: string;
		note?: string;
	}>;
}

// API request to create intent
export interface CreateIntentRequest {
	agentId: string;
	agentName: string;
	details: TransferIntent;
	urgency?: IntentUrgency;
	expiresInMinutes?: number;
}

// API response
export interface CreateIntentResponse {
	success: boolean;
	intent?: Intent;
	error?: string;
}

// Webhook payload when intent status changes
export interface IntentWebhook {
	event:
		| "intent.created"
		| "intent.approved"
		| "intent.rejected"
		| "intent.signed"
		| "intent.confirmed"
		| "intent.failed"
		| "intent.expired";
	intent: Intent;
	timestamp: string;
}

// =============================================================================
// Supported Chains (Testnet only for hackathon)
// =============================================================================

export const SUPPORTED_CHAINS = {
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
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

// =============================================================================
// Supported Tokens (Testnet USDC addresses)
// =============================================================================

export const SUPPORTED_TOKENS: Record<
	SupportedChainId,
	Record<string, { address: string; decimals: number }>
> = {
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
export function getExplorerTxUrl(chainId: number, txHash: string): string {
	const chain = SUPPORTED_CHAINS[chainId as SupportedChainId];
	const explorer = chain?.explorer ?? "https://etherscan.io";
	return `${explorer}/tx/${txHash}`;
}

/**
 * Get the block explorer URL for an address
 */
export function getExplorerAddressUrl(chainId: number, address: string): string {
	const chain = SUPPORTED_CHAINS[chainId as SupportedChainId];
	const explorer = chain?.explorer ?? "https://etherscan.io";
	return `${explorer}/address/${address}`;
}

/**
 * Check if a chain ID is supported
 */
export function isSupportedChain(chainId: number): chainId is SupportedChainId {
	return chainId in SUPPORTED_CHAINS;
}

/**
 * Get chain name by ID, or "Unknown" if not supported
 */
export function getChainName(chainId: number): string {
	const chain = SUPPORTED_CHAINS[chainId as SupportedChainId];
	return chain?.name ?? "Unknown";
}

// =============================================================================
// Utility Functions
// =============================================================================

// Utility: generate intent ID
export function generateIntentId(): string {
	return `int_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Utility: format amount for display
export function formatAmount(amount: string, token: string): string {
	return `${amount} ${token}`;
}
