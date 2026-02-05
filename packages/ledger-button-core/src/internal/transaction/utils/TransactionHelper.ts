import { Signature as DeviceSignature } from "@ledgerhq/device-signer-kit-ethereum";
import { ethers, Signature, TransactionLike } from "ethers";

import type { SignedTransactionResult } from "../../../api/model/signing/SignedTransaction.js";
import type { Transaction } from "../../../api/model/signing/SignTransactionParams.js";

export function createSignedTransaction(
  rawTransaction: string,
  signature: Signature,
): SignedTransactionResult {
  //Generate Signed transaction
  const signedTx = ethers.Transaction.from(rawTransaction);
  signedTx.signature = signature;
  const signedRawTransaction = signedTx.serialized;

  return {
    rawTransaction: rawTransaction as unknown as Uint8Array<ArrayBufferLike>,
    signedRawTransaction: signedRawTransaction,
  };
}

export function getRawTransactionFromEipTransaction(transaction: Transaction) {
  const sanitizedTransaction: TransactionLike = {
    chainId: transaction["chainId"],
    to: transaction["to"],
    value: transaction["value"],
    data: transaction["data"],
    gasLimit: transaction["gas"],
    maxFeePerGas: transaction["maxFeePerGas"],
    maxPriorityFeePerGas: transaction["maxPriorityFeePerGas"],
    gasPrice: transaction["gasPrice"],
    nonce: transaction["nonce"]
      ? parseInt(transaction["nonce"], 16)
      : undefined,
  };

  console.log("Ethers: Sanitized transaction", { sanitizedTransaction });
  try {
    const etherTx = ethers.Transaction.from(sanitizedTransaction);
    const tx = etherTx.unsignedSerialized;
    return tx;
  } catch (error) {
    console.error("Failed to get raw transaction from Ethers", { error });
    throw error;
  }
}

export function getHexaStringFromSignature(signature: DeviceSignature) {
  return ethers.Signature.from(signature).serialized;
}
