import { LedgerButtonError } from "../../../api/errors/LedgerButtonError.js";

export class StorageIDBOpenError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "StorageIDBOpenError", context);
  }
}

export class StorageIDBNotInitializedError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "StorageIDBNotInitializedError", context);
  }
}

export class StorageIDBStoreError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "StorageIDBStoreError", context);
  }
}

export class StorageIDBGetError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "StorageIDBGetError", context);
  }
}

export class StorageIDBRemoveError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "StorageIDBRemoveError", context);
  }
}

export type StorageIDBErrors =
  | StorageIDBOpenError
  | StorageIDBNotInitializedError
  | StorageIDBStoreError
  | StorageIDBGetError
  | StorageIDBRemoveError;

export type StorageErrors = StorageIDBErrors;
