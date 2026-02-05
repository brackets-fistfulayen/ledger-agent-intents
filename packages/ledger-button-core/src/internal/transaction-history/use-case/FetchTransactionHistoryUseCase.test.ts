import { Left, Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TransactionHistoryDataSource } from "../datasource/TransactionHistoryDataSource.js";
import { TransactionHistoryError } from "../model/TransactionHistoryError.js";
import type {
  ExplorerResponse,
  ExplorerTransaction,
} from "../model/transactionHistoryTypes.js";
import { FetchTransactionHistoryUseCase } from "./FetchTransactionHistoryUseCase.js";

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

function createMockDataSource(): {
  getTransactions: ReturnType<typeof vi.fn>;
} {
  return {
    getTransactions: vi.fn(),
  };
}

function createMockTransaction(
  overrides: Partial<ExplorerTransaction> = {},
): ExplorerTransaction {
  return {
    hash: "0xabc123",
    transaction_type: 2,
    nonce: "0x1",
    nonce_value: 1,
    value: "0",
    gas: "21000",
    gas_price: "1000000000",
    from: "0xsender",
    to: "0xrecipient",
    transfer_events: [],
    erc721_transfer_events: [],
    erc1155_transfer_events: [],
    approval_events: [],
    actions: [],
    confirmations: 10,
    input: null,
    gas_used: "21000",
    cumulative_gas_used: null,
    status: 1,
    received_at: "2024-01-15T10:30:00Z",
    txPoolStatus: null,
    ...overrides,
  };
}

describe("FetchTransactionHistoryUseCase", () => {
  let useCase: FetchTransactionHistoryUseCase;
  let mockDataSource: ReturnType<typeof createMockDataSource>;
  const testAddress = "0x1234567890abcdef1234567890abcdef12345678";
  const testBlockchain = "ethereum";

  beforeEach(() => {
    mockDataSource = createMockDataSource();

    useCase = new FetchTransactionHistoryUseCase(
      createMockLoggerFactory(),
      mockDataSource as unknown as TransactionHistoryDataSource,
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should call datasource with correct parameters", async () => {
      const response: ExplorerResponse = {
        data: [],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      await useCase.execute(testBlockchain, testAddress, { batchSize: 50 });

      expect(mockDataSource.getTransactions).toHaveBeenCalledWith(
        testBlockchain,
        testAddress,
        { batchSize: 50 },
      );
    });

    it("should return empty transactions array when no transactions", async () => {
      const response: ExplorerResponse = {
        data: [],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toEqual({
        transactions: [],
        nextPageToken: undefined,
      });
    });

    it("should return nextPageToken when token is present", async () => {
      const response: ExplorerResponse = {
        data: [],
        token: "next-page-token",
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("nextPageToken", "next-page-token");
    });

    it("should not return nextPageToken when token is null", async () => {
      const response: ExplorerResponse = {
        data: [],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("nextPageToken", undefined);
    });

    it("should return Left with error when datasource fails", async () => {
      const error = new TransactionHistoryError("Network error", {
        address: testAddress,
        blockchain: testBlockchain,
      });
      mockDataSource.getTransactions.mockResolvedValue(Left(error));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isLeft()).toBe(true);
      expect(result.extract()).toBe(error);
    });
  });

  describe("transaction type detection", () => {
    it("should mark transaction as 'sent' when address is the sender", async () => {
      const tx = createMockTransaction({
        hash: "0xsent",
        from: testAddress,
        to: "0xrecipient",
        value: "1000000000000000000",
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("type", "sent");
    });

    it("should mark transaction as 'received' when address is the recipient", async () => {
      const tx = createMockTransaction({
        hash: "0xreceived",
        from: "0xsender",
        to: testAddress,
        value: "1000000000000000000",
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("type", "received");
    });

    it("should mark as 'received' when address is recipient in transfer_events", async () => {
      const tx = createMockTransaction({
        hash: "0xtokenreceived",
        from: "0xsender",
        to: "0xcontract",
        value: "0",
        transfer_events: [
          {
            contract: "0xcontract",
            from: "0xsender",
            to: testAddress,
            count: "1000000",
          },
        ],
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("type", "received");
    });

    it("should handle case-insensitive address matching", async () => {
      const upperCaseAddress = testAddress.toUpperCase();
      const tx = createMockTransaction({
        from: upperCaseAddress,
        to: "0xrecipient",
        value: "1000000000000000000",
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("type", "sent");
    });
  });

  describe("value calculation", () => {
    it("should use native value for direct transfers", async () => {
      const tx = createMockTransaction({
        from: "0xsender",
        to: testAddress,
        value: "1000000000000000000",
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("value", "1000000000000000000");
    });

    it("should use token transfer count for ERC20 transfers", async () => {
      const tx = createMockTransaction({
        from: "0xsender",
        to: "0xcontract",
        value: "0",
        transfer_events: [
          {
            contract: "0xcontract",
            from: "0xsender",
            to: testAddress,
            count: "5000000",
          },
        ],
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("value", "5000000");
    });

    it("should use actions value for native transfers with actions", async () => {
      const tx = createMockTransaction({
        from: "0xsender",
        to: testAddress,
        value: "0",
        actions: [
          {
            from: "0xsender",
            to: testAddress,
            value: "2801780000000000",
            gas: "21000",
            gas_used: "21000",
            error: null,
          },
        ],
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("value", "2801780000000000");
    });

    it("should sum multiple token transfers to the same address", async () => {
      const tx = createMockTransaction({
        from: "0xsender",
        to: "0xcontract",
        value: "0",
        transfer_events: [
          {
            contract: "0xcontract1",
            from: "0xsender",
            to: testAddress,
            count: "1000000",
          },
          {
            contract: "0xcontract2",
            from: "0xsender",
            to: testAddress,
            count: "2000000",
          },
        ],
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("value", "3000000");
    });
  });

  describe("timestamp extraction", () => {
    it("should use block.time when available", async () => {
      const tx = createMockTransaction({
        received_at: "2024-01-15T10:30:00Z",
        block: {
          hash: "0xblock",
          height: 12345,
          time: "2024-01-15T10:35:00Z",
        },
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("timestamp", "2024-01-15T10:35:00Z");
    });

    it("should use received_at when block is not available", async () => {
      const tx = createMockTransaction({
        received_at: "2024-01-15T10:30:00Z",
        block: undefined,
      });

      const response: ExplorerResponse = {
        data: [tx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      expect(
        (data as { transactions: unknown[] }).transactions[0],
      ).toHaveProperty("timestamp", "2024-01-15T10:30:00Z");
    });
  });

  describe("transaction transformation", () => {
    it("should correctly transform multiple transactions", async () => {
      const sentTx = createMockTransaction({
        hash: "0xsent123",
        from: testAddress,
        to: "0xrecipient",
        value: "500000000000000000",
        received_at: "2024-01-15T10:00:00Z",
      });

      const receivedTx = createMockTransaction({
        hash: "0xreceived456",
        from: "0xsender",
        to: testAddress,
        value: "1800000000000000000",
        received_at: "2024-01-15T11:00:00Z",
      });

      const response: ExplorerResponse = {
        data: [sentTx, receivedTx],
        token: null,
      };
      mockDataSource.getTransactions.mockResolvedValue(Right(response));

      const result = await useCase.execute(testBlockchain, testAddress);

      expect(result.isRight()).toBe(true);
      const data = result.extract();
      expect(data).toHaveProperty("transactions");
      const transactions = (data as { transactions: unknown[] }).transactions;
      expect(transactions).toHaveLength(2);
      expect(transactions[0]).toEqual({
        hash: "0xsent123",
        type: "sent",
        value: "500000000000000000",
        timestamp: "2024-01-15T10:00:00Z",
      });
      expect(transactions[1]).toEqual({
        hash: "0xreceived456",
        type: "received",
        value: "1800000000000000000",
        timestamp: "2024-01-15T11:00:00Z",
      });
    });
  });
});
