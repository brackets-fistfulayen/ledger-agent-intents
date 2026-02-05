import { LedgerButtonError } from "../../../api/errors/LedgerButtonError.js";

export type TransactionHistoryErrorContext = {
  address?: string;
  blockchain?: string;
  originalError?: string;
};

export class TransactionHistoryError extends LedgerButtonError<TransactionHistoryErrorContext> {
  constructor(message: string, context?: TransactionHistoryErrorContext) {
    super(message, "TransactionHistoryError", context);
  }
}
