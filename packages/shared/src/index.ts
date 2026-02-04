/**
 * Shared types for Agent Intents system
 */

// Intent status lifecycle
export type IntentStatus = 
  | 'pending'      // Created by agent, awaiting human review
  | 'approved'     // Human approved, ready to sign
  | 'rejected'     // Human rejected
  | 'signed'       // Signed on device, broadcasting
  | 'confirmed'    // Transaction confirmed on-chain
  | 'failed'       // Transaction failed
  | 'expired';     // Intent expired without action

// Supported intent types
export type IntentType = 
  | 'transfer'     // Token transfer
  | 'swap'         // Token swap (future)
  | 'nft'          // NFT transfer (future)
  | 'contract';    // Generic contract call (future)

// Urgency levels affect how intents are displayed
export type IntentUrgency = 'low' | 'normal' | 'high' | 'critical';

// Token transfer intent
export interface TransferIntent {
  type: 'transfer';
  token: string;           // e.g., 'USDC', 'ETH'
  tokenAddress?: string;   // Contract address for ERC-20
  amount: string;          // Human-readable amount
  amountWei?: string;      // Wei amount for precision
  recipient: string;       // Destination address
  recipientEns?: string;   // ENS name if resolved
  chainId: number;         // e.g., 1 for mainnet, 137 for Polygon
  memo?: string;           // Human-readable reason
}

// Base intent structure
export interface Intent {
  id: string;
  userId: string;          // Ledger Live user identifier
  agentId: string;         // Which agent created this (e.g., 'clouseau')
  agentName: string;       // Display name (e.g., 'Inspector Clouseau')
  
  // Intent details (union for different types)
  details: TransferIntent; // Expand to union as we add types
  
  // Metadata
  urgency: IntentUrgency;
  status: IntentStatus;
  
  // Timestamps
  createdAt: string;       // ISO timestamp
  expiresAt?: string;      // Optional expiration
  reviewedAt?: string;     // When human reviewed
  signedAt?: string;       // When signed on device
  confirmedAt?: string;    // When confirmed on-chain
  
  // Transaction data (populated after signing)
  txHash?: string;
  txUrl?: string;          // Block explorer link
  
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
  event: 'intent.created' | 'intent.approved' | 'intent.rejected' | 
         'intent.signed' | 'intent.confirmed' | 'intent.failed' | 'intent.expired';
  intent: Intent;
  timestamp: string;
}

// Supported chains and tokens (initial set)
export const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' },
  137: { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
  8453: { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org' },
} as const;

export const SUPPORTED_TOKENS: Record<number, Record<string, { address: string; decimals: number }>> = {
  // Ethereum mainnet
  1: {
    USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    DAI: { address: '0x6B175474E89094C44Da98b954EescdECD73A31F', decimals: 18 },
  },
  // Polygon
  137: {
    USDC: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
    USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
  },
  // Base
  8453: {
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  },
};

// Utility: generate intent ID
export function generateIntentId(): string {
  return `int_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Utility: format amount for display
export function formatAmount(amount: string, token: string): string {
  return `${amount} ${token}`;
}
