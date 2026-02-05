export type SignedResults =
  | BroadcastedTransactionResult
  | SignedTransactionResult
  | SignedPersonalMessageOrTypedDataResult;
// TODO: Handle error return type
// (should be resolved in LedgerButtonCore and rejeced in the provider)

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

export function isSignedTransactionResult(
  signedTransaction: unknown,
): signedTransaction is SignedTransactionResult {
  return (
    !!signedTransaction &&
    typeof signedTransaction === "object" &&
    "rawTransaction" in signedTransaction &&
    "signedRawTransaction" in signedTransaction
  );
}

export function isBroadcastedTransactionResult(
  signedTransaction: unknown,
): signedTransaction is BroadcastedTransactionResult {
  return (
    !!signedTransaction &&
    typeof signedTransaction === "object" &&
    "hash" in signedTransaction
  );
}

export function isSignedMessageOrTypedDataResult(
  signedTransaction: unknown,
): signedTransaction is SignedPersonalMessageOrTypedDataResult {
  return (
    !!signedTransaction &&
    typeof signedTransaction === "object" &&
    "signature" in signedTransaction
  );
}
