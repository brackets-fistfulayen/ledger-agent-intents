/**
 * Shared types for Agent Payments with Ledger system
 */
export type IntentStatus = "pending" | "approved" | "rejected" | "broadcasting" | "authorized" | "executing" | "confirmed" | "failed" | "expired";
/**
 * Valid status transitions for intents.
 * Terminal states (rejected, confirmed, failed, expired) have no outgoing transitions.
 */
export declare const INTENT_TRANSITIONS: Record<IntentStatus, IntentStatus[]>;
/**
 * Check if a status transition is valid according to the state machine.
 */
export declare function isValidTransition(from: IntentStatus, to: IntentStatus): boolean;
export type IntentType = "transfer" | "swap" | "nft" | "contract";
export type IntentUrgency = "low" | "normal" | "high" | "critical";
export type PaymentCategory = "api_payment" | "subscription" | "purchase" | "p2p_transfer" | "defi" | "bill_payment" | "donation" | "other";
export interface Merchant {
    name: string;
    url?: string;
    logo?: string;
    verified?: boolean;
}
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
    /** ISO timestamp when the x402 authorization expires (derived from validBefore) */
    expiresAt?: string;
}
export interface TransferIntent {
    type: "transfer";
    token: string;
    tokenAddress?: string;
    tokenLogo?: string;
    amount: string;
    amountWei?: string;
    recipient: string;
    recipientEns?: string;
    chainId: number;
    memo?: string;
    resource?: string;
    merchant?: Merchant;
    category?: PaymentCategory;
    x402?: X402Context;
}
export interface Intent {
    id: string;
    userId: string;
    agentId: string;
    agentName: string;
    details: TransferIntent;
    urgency: IntentUrgency;
    status: IntentStatus;
    trustChainId?: string;
    createdByMemberId?: string;
    createdAt: string;
    expiresAt?: string;
    reviewedAt?: string;
    broadcastAt?: string;
    confirmedAt?: string;
    txHash?: string;
    txUrl?: string;
    statusHistory: Array<{
        status: IntentStatus;
        timestamp: string;
        note?: string;
    }>;
}
export type TrustchainMemberRole = "agent_write_only" | "full_access";
/** A provisioned agent registered under a user's Trustchain identity. */
export interface TrustchainMember {
    id: string;
    trustchainId: string;
    memberPubkey: string;
    role: TrustchainMemberRole;
    label: string | null;
    createdAt: string;
    revokedAt: string | null;
}
/** Request body for POST /api/agents/register */
export interface RegisterAgentRequest {
    trustChainId: string;
    agentLabel: string;
    agentPublicKey: string;
    /** EIP-191 personal_sign signature authorizing this agent key, signed on the Ledger device */
    authorizationSignature: string;
}
/** Response from POST /api/agents/register */
export interface RegisterAgentResponse {
    success: boolean;
    member?: TrustchainMember;
    error?: string;
}
export interface CreateIntentRequest {
    agentId: string;
    agentName: string;
    details: TransferIntent;
    urgency?: IntentUrgency;
    expiresInMinutes?: number;
}
export interface CreateIntentResponse {
    success: boolean;
    intent?: Intent;
    /** Direct link the agent can share for the user to review & sign this intent. */
    paymentUrl?: string;
    error?: string;
}
export interface IntentWebhook {
    event: "intent.created" | "intent.approved" | "intent.rejected" | "intent.broadcasting" | "intent.confirmed" | "intent.failed" | "intent.expired";
    intent: Intent;
    timestamp: string;
}
export declare const SUPPORTED_CHAINS: {
    readonly 8453: {
        readonly name: "Base";
        readonly symbol: "ETH";
        readonly explorer: "https://basescan.org";
    };
    readonly 11155111: {
        readonly name: "Sepolia";
        readonly symbol: "ETH";
        readonly explorer: "https://sepolia.etherscan.io";
    };
    readonly 84532: {
        readonly name: "Base Sepolia";
        readonly symbol: "ETH";
        readonly explorer: "https://sepolia.basescan.org";
    };
};
export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;
export declare const SUPPORTED_TOKENS: Record<SupportedChainId, Record<string, {
    address: string;
    decimals: number;
}>>;
/**
 * Get the block explorer URL for a transaction hash
 */
export declare function getExplorerTxUrl(chainId: number, txHash: string): string;
/**
 * Get the block explorer URL for an address
 */
export declare function getExplorerAddressUrl(chainId: number, address: string): string;
/**
 * Check if a chain ID is supported
 */
export declare function isSupportedChain(chainId: number): chainId is SupportedChainId;
/**
 * Get chain name by ID, or "Unknown" if not supported
 */
export declare function getChainName(chainId: number): string;
export declare function generateIntentId(): string;
export declare function formatAmount(amount: string, token: string): string;
/**
 * Parse a CAIP-2 "eip155:<chainId>" network string to a numeric chain ID.
 * Returns `null` if the string is not a valid eip155 network identifier.
 */
export declare function parseEip155ChainId(network: string): number | null;
/**
 * Format an atomic (smallest-unit) amount to a human-readable decimal string.
 * e.g. formatAtomicAmount("10000", 6) => "0.01"
 */
export declare function formatAtomicAmount(atomicAmount: string, decimals: number): string;
/**
 * Extract the hostname from a URL for display purposes.
 * Returns the raw string if parsing fails.
 */
export declare function extractDomain(url: string): string;
//# sourceMappingURL=index.d.ts.map