import { Signature as DeviceSignature } from '@ledgerhq/device-signer-kit-ethereum';
import { Signature } from 'ethers';
import { SignedTransactionResult } from '../../../api/model/signing/SignedTransaction.js';
import { Transaction } from '../../../api/model/signing/SignTransactionParams.js';
export declare function createSignedTransaction(rawTransaction: string, signature: Signature): SignedTransactionResult;
export declare function getRawTransactionFromEipTransaction(transaction: Transaction): string;
export declare function getHexaStringFromSignature(signature: DeviceSignature): string;
//# sourceMappingURL=TransactionHelper.d.ts.map