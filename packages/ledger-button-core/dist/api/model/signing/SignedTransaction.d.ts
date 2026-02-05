export type SignedResults = BroadcastedTransactionResult | SignedTransactionResult | SignedPersonalMessageOrTypedDataResult;
export interface BroadcastedTransactionResult {
    hash: string;
    rawTransaction: Uint8Array<ArrayBufferLike>;
    signedRawTransaction: string;
}
export interface SignedTransactionResult {
    rawTransaction: Uint8Array<ArrayBufferLike>;
    signedRawTransaction: string;
}
export interface SignedPersonalMessageOrTypedDataResult {
    signature: string;
}
export declare function isSignedTransactionResult(signedTransaction: unknown): signedTransaction is SignedTransactionResult;
export declare function isBroadcastedTransactionResult(signedTransaction: unknown): signedTransaction is BroadcastedTransactionResult;
export declare function isSignedMessageOrTypedDataResult(signedTransaction: unknown): signedTransaction is SignedPersonalMessageOrTypedDataResult;
//# sourceMappingURL=SignedTransaction.d.ts.map