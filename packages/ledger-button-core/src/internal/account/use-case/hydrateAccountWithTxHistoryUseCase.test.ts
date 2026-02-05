import { Left, Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionHistoryError } from "../../transaction-history/model/TransactionHistoryError.js";
import type {
  TransactionHistoryItem,
  TransactionHistoryResult,
} from "../../transaction-history/model/transactionHistoryTypes.js";
import type { FetchTransactionHistoryUseCase } from "../../transaction-history/use-case/FetchTransactionHistoryUseCase.js";
import type { Account } from "../service/AccountService.js";
import { HydrateAccountWithTxHistoryUseCase } from "./hydrateAccountWithTxHistoryUseCase.js";

function createMockLogger() {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    fatal: vi.fn(),
    subscribers: [],
  };
}

function createMockLoggerFactory() {
  return vi.fn().mockReturnValue(createMockLogger());
}

function createMockFetchTransactionHistoryUseCase(): {
  execute: ReturnType<typeof vi.fn>;
} {
  return {
    execute: vi.fn(),
  };
}

function createMockAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: "account-1",
    currencyId: "ethereum",
    freshAddress: "0x1234567890abcdef1234567890abcdef12345678",
    seedIdentifier: "seed-1",
    derivationMode: "native_segwit",
    index: 0,
    name: "My Account",
    ticker: "ETH",
    balance: "1000000000000000000",
    tokens: [],
    ...overrides,
  };
}

function createMockTransaction(
  overrides: Partial<TransactionHistoryItem> = {},
): TransactionHistoryItem {
  return {
    hash: "0xabc123",
    type: "sent",
    value: "500000000000000000",
    timestamp: "2024-01-15T10:30:00Z",
    ...overrides,
  };
}

describe("HydrateAccountWithTxHistoryUseCase", () => {
  let useCase: HydrateAccountWithTxHistoryUseCase;
  let mockFetchTransactionHistoryUseCase: ReturnType<
    typeof createMockFetchTransactionHistoryUseCase
  >;
  let mockLoggerFactory: ReturnType<typeof createMockLoggerFactory>;

  beforeEach(() => {
    mockFetchTransactionHistoryUseCase =
      createMockFetchTransactionHistoryUseCase();
    mockLoggerFactory = createMockLoggerFactory();

    useCase = new HydrateAccountWithTxHistoryUseCase(
      mockLoggerFactory,
      mockFetchTransactionHistoryUseCase as unknown as FetchTransactionHistoryUseCase,
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should fetch transaction history and return account with transactions", async () => {
      const account = createMockAccount();
      const transactions = [
        createMockTransaction({ hash: "0x111", type: "sent" }),
        createMockTransaction({ hash: "0x222", type: "received" }),
      ];
      const historyResult: TransactionHistoryResult = {
        transactions,
        nextPageToken: undefined,
      };
      mockFetchTransactionHistoryUseCase.execute.mockResolvedValue(
        Right(historyResult),
      );

      const result = await useCase.execute(account);

      expect(result).toEqual({
        ...account,
        transactionHistory: transactions,
      });
    });

    it("should call FetchTransactionHistoryUseCase with blockchain (ticker) and address", async () => {
      const account = createMockAccount({
        ticker: "ETH",
        freshAddress: "0xtest123",
      });
      mockFetchTransactionHistoryUseCase.execute.mockResolvedValue(
        Right({ transactions: [], nextPageToken: undefined }),
      );

      await useCase.execute(account);

      expect(mockFetchTransactionHistoryUseCase.execute).toHaveBeenCalledWith(
        "eth",
        "0xtest123",
      );
    });

    it("should return undefined transactionHistory when fetch fails", async () => {
      const account = createMockAccount();
      const error = new TransactionHistoryError("Network error", {
        address: account.freshAddress,
        blockchain: "eth",
      });
      mockFetchTransactionHistoryUseCase.execute.mockResolvedValue(Left(error));

      const result = await useCase.execute(account);

      expect(result).toEqual({
        ...account,
        transactionHistory: undefined,
      });
    });

    it("should preserve all account properties", async () => {
      const account = createMockAccount({
        id: "unique-id",
        name: "Test Account",
        balance: "5000000000000000000",
        tokens: [
          {
            ledgerId: "ethereum/erc20/tether",
            ticker: "USDT",
            name: "Tether",
            balance: "100000000",
            fiatBalance: undefined,
          },
        ],
      });
      mockFetchTransactionHistoryUseCase.execute.mockResolvedValue(
        Right({ transactions: [], nextPageToken: undefined }),
      );

      const result = await useCase.execute(account);

      expect(result.id).toBe("unique-id");
      expect(result.name).toBe("Test Account");
      expect(result.balance).toBe("5000000000000000000");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0]?.ticker).toBe("USDT");
    });
  });

  describe("error handling", () => {
    it("should not throw when FetchTransactionHistoryUseCase returns an error", async () => {
      const account = createMockAccount();
      const error = new TransactionHistoryError("API timeout", {
        address: account.freshAddress,
        blockchain: "eth",
      });
      mockFetchTransactionHistoryUseCase.execute.mockResolvedValue(Left(error));

      await expect(useCase.execute(account)).resolves.not.toThrow();
    });

    it("should return the original account data even when fetch fails", async () => {
      const account = createMockAccount({
        id: "test-id",
        name: "Original Name",
        balance: "123456",
      });
      mockFetchTransactionHistoryUseCase.execute.mockResolvedValue(
        Left(
          new TransactionHistoryError("Error", {
            address: account.freshAddress,
            blockchain: "eth",
          }),
        ),
      );

      const result = await useCase.execute(account);

      expect(result.id).toBe("test-id");
      expect(result.name).toBe("Original Name");
      expect(result.balance).toBe("123456");
      expect(result.transactionHistory).toBeUndefined();
    });
  });

  describe("logging", () => {
    it("should create logger with correct name", () => {
      const loggerFactory = createMockLoggerFactory();
      new HydrateAccountWithTxHistoryUseCase(
        loggerFactory,
        mockFetchTransactionHistoryUseCase as unknown as FetchTransactionHistoryUseCase,
      );

      expect(loggerFactory).toHaveBeenCalledWith(
        "HydrateAccountWithTxHistoryUseCase",
      );
    });
  });
});
