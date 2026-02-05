/**
 * Shared types for Ledger Agent Payments system
 */

// Intent status lifecycle
export type IntentStatus =
	| "pending" // Created by agent, awaiting human review
	| "approved" // Human approved, ready to sign
	| "rejected" // Human rejected
	| "signed" // Signed on device, broadcasting (for on-chain transactions)
	| "authorized" // x402 payment authorized (signature ready for agent to use)
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

// =============================================================================
// x402 (V2) - Minimal shared shapes
// =============================================================================

export interface X402Resource {
	url: string;
	description?: string;
	mimeType?: string;
}

/**
 * x402 "accepted" payment requirement for the EVM "exact" scheme (EIP-3009).
 * These values are typically copied from the server's PAYMENT-REQUIRED header
 * (decoded) and stored on the intent.
 */
export interface X402AcceptedExactEvm {
	scheme: "exact";
	/** CAIP-2 network identifier, e.g. "eip155:8453" */
	network: string;
	/** Amount in atomic units (e.g. 10000 = 0.01 USDC with 6 decimals) */
	amount: string;
	/** ERC-20 token contract address (must support EIP-3009) */
	asset: string;
	/** Recipient address */
	payTo: string;
	maxTimeoutSeconds?: number;
	extra?: {
		/**
		 * EIP-712 domain name and version for the token (e.g. USDC is usually:
		 * name: "USD Coin", version: "2").
		 */
		name?: string;
		version?: string;
		decimals?: number;
	};
}

export interface X402ExactEvmAuthorization {
	from: string;
	to: string;
	value: string;
	validAfter: string;
	validBefore: string;
	nonce: string;
}

export interface X402ExactEvmPayload {
	signature: string;
	authorization: X402ExactEvmAuthorization;
}

export interface X402PaymentPayload {
	x402Version: 2;
	resource: X402Resource;
	accepted: X402AcceptedExactEvm;
	payload: X402ExactEvmPayload;
	extensions?: Record<string, unknown>;
}

/**
 * Settlement receipt returned by the server in PAYMENT-RESPONSE header.
 * Contains proof that the payment was successfully processed.
 */
export interface X402SettlementReceipt {
	/** Transaction hash on-chain (if applicable) */
	txHash?: string;
	/** Network the settlement occurred on (CAIP-2 format, e.g., "eip155:8453") */
	network?: string;
	/** Amount settled in atomic units */
	amount?: string;
	/** Timestamp when the settlement was confirmed */
	settledAt?: string;
	/** Block number of the settlement transaction */
	blockNumber?: number;
	/** Whether the settlement was successful */
	success: boolean;
	/** Error message if settlement failed */
	error?: string;
	/** Raw PAYMENT-RESPONSE header value (base64-encoded) for debugging */
	rawHeader?: string;
}

/**
 * Stored on an intent when the agent has encountered an x402 paywall.
 * When signed, `paymentSignatureHeader` is the exact string the agent should send
 * in the HTTP `PAYMENT-SIGNATURE` header (base64-encoded JSON PaymentPayload).
 */
export interface X402Context {
	resource: X402Resource;
	accepted: X402AcceptedExactEvm;
	authorization?: X402ExactEvmAuthorization;
	signature?: string;
	paymentPayload?: X402PaymentPayload;
	paymentSignatureHeader?: string;
	/** Settlement receipt from PAYMENT-RESPONSE header after agent retries with proof */
	settlementReceipt?: X402SettlementReceipt;
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

	// Full x402 context (optional)
	x402?: X402Context;
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

	// Trustchain identity (populated when intent is created by a provisioned agent)
	trustChainId?: string;
	createdByMemberId?: string;

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

// =============================================================================
// Trustchain Members / Agent Provisioning
// =============================================================================

export type TrustchainMemberRole = "agent_write_only" | "full_access";

/** A provisioned agent registered under a user's Trustchain identity. */
export interface TrustchainMember {
	id: string; // UUID
	trustchainId: string;
	memberPubkey: string; // Hex-encoded secp256k1 compressed public key
	role: TrustchainMemberRole;
	label: string | null;
	createdAt: string; // ISO timestamp
	revokedAt: string | null; // ISO timestamp, null if active
}

/** Request body for POST /api/agents/register */
export interface RegisterAgentRequest {
	trustChainId: string;
	agentLabel: string;
	agentPublicKey: string; // Hex-encoded secp256k1 compressed public key (from LKRP NobleCryptoService)
}

/** Response from POST /api/agents/register */
export interface RegisterAgentResponse {
	success: boolean;
	member?: TrustchainMember;
	error?: string;
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
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

// =============================================================================
// Supported Tokens
// =============================================================================

export const SUPPORTED_TOKENS: Record<
	SupportedChainId,
	Record<string, { address: string; decimals: number }>
> = {
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
