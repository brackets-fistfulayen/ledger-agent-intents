/**
 * Raw API response types from Ledger Explorer API
 * GET https://explorers.api.live.ledger.com/blockchain/v4/{blockchain}/address/{address}/txs
 */
export type ExplorerBlockInfo = {
    hash: string;
    height: number;
    time: string;
};
export type EvmTransferEvent = {
    contract: string;
    from: string;
    to: string;
    count: string;
};
export type EvmAction = {
    from: string;
    to: string;
    value: string;
    gas: string;
    gas_used: string;
    error: string | null;
};
export type ExplorerTransaction = {
    hash: string;
    transaction_type: number;
    nonce: string;
    nonce_value: number;
    value: string;
    gas: string;
    gas_price: string;
    max_fee_per_gas?: string;
    max_priority_fee_per_gas?: string;
    from: string;
    to: string;
    transfer_events: EvmTransferEvent[];
    erc721_transfer_events: unknown[];
    erc1155_transfer_events: unknown[];
    approval_events: unknown[];
    actions: EvmAction[];
    confirmations: number;
    input: string | null;
    gas_used: string;
    cumulative_gas_used: string | null;
    status: number;
    received_at: string;
    block?: ExplorerBlockInfo;
    txPoolStatus: unknown | null;
};
export type ExplorerResponse = {
    data: ExplorerTransaction[];
    token: string | null;
};
/**
 * Options for fetching transaction history
 */
export type TransactionHistoryOptions = {
    batchSize?: number;
    pageToken?: string;
};
/**
 * Transformed transaction item for display
 */
export type TransactionType = "sent" | "received";
export type TransactionHistoryItem = {
    hash: string;
    type: TransactionType;
    value: string;
    timestamp: string;
};
/**
 * Result type for the use case
 */
export type TransactionHistoryResult = {
    transactions: TransactionHistoryItem[];
    nextPageToken?: string;
};
//# sourceMappingURL=transactionHistoryTypes.d.ts.map