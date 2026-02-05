import { Left, Right } from "purify-ts";

import { JsonRpcResponseSuccess } from "../../../api/model/eip/EIPTypes.js";
import { BackendService } from "../../backend/BackendService.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { AlpacaDataSource } from "../datasource/alpaca/AlpacaDataSource.js";
import { TransactionInfo } from "../model/types.js";
import { DefaultGasFeeEstimationService } from "./DefaultGasFeeEstimationService.js";

describe("DefaultGasFeeEstimationService", () => {
  let gasFeeEstimationService: DefaultGasFeeEstimationService;
  let mockLoggerFactory: () => LoggerPublisher;
  let mockBackendService: BackendService;
  let mockAlpacaDataSource: AlpacaDataSource;
  let mockLogger: LoggerPublisher;

  const mockTx: TransactionInfo = {
    chainId: "1",
    from: "0x1234567890abcdef1234567890abcdef12345678",
    to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    value: "0x0",
    data: "0x",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock logger
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as LoggerPublisher;

    mockLoggerFactory = vi.fn().mockReturnValue(mockLogger);

    // Mock BackendService
    mockBackendService = {
      broadcast: vi.fn(),
    } as unknown as BackendService;

    mockAlpacaDataSource = {
      getBalanceForAddressAndCurrencyId: vi.fn(),
      estimateTransactionFee: vi.fn(),
    } as unknown as AlpacaDataSource;

    gasFeeEstimationService = new DefaultGasFeeEstimationService(
      mockLoggerFactory,
      mockBackendService,
      mockAlpacaDataSource,
    );
  });

  describe("getNonceForTx", () => {
    it("should successfully get nonce for transaction", async () => {
      const mockNonceResponse: JsonRpcResponseSuccess = {
        jsonrpc: "2.0",
        id: 1,
        result: "0x5",
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockNonceResponse),
      );

      const result = await gasFeeEstimationService.getNonceForTx(mockTx);

      expect(result).toEqual(mockNonceResponse.result);
      expect(result).toMatch(/^0x[0-9a-f]+$/i);
      expect(mockBackendService.broadcast).toHaveBeenCalledWith({
        blockchain: { name: "ethereum", chainId: "1" },
        rpc: {
          method: "eth_getTransactionCount",
          params: [mockTx.from, "latest"],
          id: 1,
          jsonrpc: "2.0",
        },
      });
    });

    it("should throw error when nonce is undefined", async () => {
      vi.spyOn(gasFeeEstimationService, "getNonce").mockResolvedValue(
        undefined,
      );

      await expect(
        gasFeeEstimationService.getNonceForTx(mockTx),
      ).rejects.toThrow("Failed to get nonce");
    });
  });

  describe("getFeesForTransaction", () => {
    it("should use Alpaca for gas fee estimation when network is supported", async () => {
      const mockAlpacaResponse = {
        value: "50000",
        parameters: {
          gasLimit: "0xc350",
          maxFeePerGas: "0x6fc23ac00",
          maxPriorityFeePerGas: "0x77359400",
          nextBaseFee: "0x3b9aca00",
          gasOptions: {},
        },
      };

      vi.spyOn(mockAlpacaDataSource, "estimateTransactionFee").mockResolvedValue(
        Right(mockAlpacaResponse),
      );

      const result =
        await gasFeeEstimationService.getFeesForTransaction(mockTx);

      expect(mockAlpacaDataSource.estimateTransactionFee).toHaveBeenCalledWith(
        "ethereum",
        expect.objectContaining({
          type: "send",
          sender: mockTx.from,
          recipient: mockTx.to,
          amount: mockTx.value,
          data: mockTx.data,
        }),
      );

      expect(result.gasLimit).toEqual(mockAlpacaResponse.parameters.gasLimit);
      expect(result.maxFeePerGas).toEqual(
        mockAlpacaResponse.parameters.maxFeePerGas,
      );
      expect(result.maxPriorityFeePerGas).toEqual(
        mockAlpacaResponse.parameters.maxPriorityFeePerGas,
      );
    });

    it("should fallback to RPC method when Alpaca fails", async () => {
      vi.spyOn(mockAlpacaDataSource, "estimateTransactionFee").mockResolvedValue(
        Left(new Error("Alpaca error")),
      );

      const mockEstimateGas = 50000;
      const mockBaseFeePerGas = 30000000000;
      const mockMaxPriorityFeePerGas = 2000000000;

      vi.spyOn(gasFeeEstimationService, "estimateGas").mockResolvedValue(
        mockEstimateGas,
      );
      vi.spyOn(gasFeeEstimationService, "getBaseFeePerGas").mockResolvedValue(
        mockBaseFeePerGas,
      );
      vi.spyOn(
        gasFeeEstimationService,
        "getMaxPriorityFeePerGas",
      ).mockResolvedValue(mockMaxPriorityFeePerGas);

      const result =
        await gasFeeEstimationService.getFeesForTransaction(mockTx);

      expect(mockAlpacaDataSource.estimateTransactionFee).toHaveBeenCalled();
      expect(gasFeeEstimationService.estimateGas).toHaveBeenCalledWith(mockTx);
      expect(result.gasLimit).toMatch(/^0x[0-9a-f]+$/i);
    });

    it("should use RPC method when network is not supported by Alpaca", async () => {
      const unsupportedTx: TransactionInfo = {
        ...mockTx,
        chainId: "999999", // Unsupported network
      };

      const mockEstimateGas = 50000;
      const mockBaseFeePerGas = 30000000000;
      const mockMaxPriorityFeePerGas = 2000000000;

      vi.spyOn(gasFeeEstimationService, "estimateGas").mockResolvedValue(
        mockEstimateGas,
      );
      vi.spyOn(gasFeeEstimationService, "getBaseFeePerGas").mockResolvedValue(
        mockBaseFeePerGas,
      );
      vi.spyOn(
        gasFeeEstimationService,
        "getMaxPriorityFeePerGas",
      ).mockResolvedValue(mockMaxPriorityFeePerGas);

      await gasFeeEstimationService.getFeesForTransaction(unsupportedTx);

      expect(mockAlpacaDataSource.estimateTransactionFee).not.toHaveBeenCalled();
      expect(gasFeeEstimationService.estimateGas).toHaveBeenCalledWith(
        unsupportedTx,
      );
    });

    it("should calculate maxFeePerGas correctly (baseFee * 2 + maxPriorityFee) when using RPC fallback", async () => {
      // Assert RPC fallback by forcing Alpaca to fail
      vi.spyOn(mockAlpacaDataSource, "estimateTransactionFee").mockResolvedValue(
        Left(new Error("Alpaca error")),
      );

      const mockEstimateGas = 50000;
      const mockBaseFeePerGas = 30000000000; // 30 gwei
      const mockMaxPriorityFeePerGas = 2000000000; // 2 gwei
      const mockGasLimit = 1.2;

      vi.spyOn(gasFeeEstimationService, "estimateGas").mockResolvedValue(
        mockEstimateGas,
      );
      vi.spyOn(gasFeeEstimationService, "getBaseFeePerGas").mockResolvedValue(
        mockBaseFeePerGas,
      );
      vi.spyOn(
        gasFeeEstimationService,
        "getMaxPriorityFeePerGas",
      ).mockResolvedValue(mockMaxPriorityFeePerGas);

      const result =
        await gasFeeEstimationService.getFeesForTransaction(mockTx);

      expect(gasFeeEstimationService.estimateGas).toHaveBeenCalledWith(mockTx);
      expect(gasFeeEstimationService.getBaseFeePerGas).toHaveBeenCalledWith(
        mockTx,
      );
      expect(
        gasFeeEstimationService.getMaxPriorityFeePerGas,
      ).toHaveBeenCalledWith(mockTx);

      expect(result.gasLimit).toMatch(/^0x[0-9a-f]+$/i);
      expect(Number(result.gasLimit)).toEqual(mockEstimateGas * mockGasLimit);

      expect(result.maxFeePerGas).toMatch(/^0x[0-9a-f]+$/i);
      expect(Number(result.maxFeePerGas)).toEqual(
        mockBaseFeePerGas * 2 + mockMaxPriorityFeePerGas,
      );

      expect(result.maxPriorityFeePerGas).toMatch(/^0x[0-9a-f]+$/i);
      expect(Number(result.maxPriorityFeePerGas)).toEqual(
        mockMaxPriorityFeePerGas,
      );
    });
  });

  describe("getMaxPriorityFeePerGas", () => {
    it("should successfully fetch max priority fee per gas", async () => {
      const mockResponse: JsonRpcResponseSuccess = {
        jsonrpc: "2.0",
        id: 1,
        result: "0x12a05f200", // 5000000000 in hex
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockResponse),
      );

      const result =
        await gasFeeEstimationService.getMaxPriorityFeePerGas(mockTx);

      expect(result).toEqual(5000000000);
      expect(mockBackendService.broadcast).toHaveBeenCalledWith({
        blockchain: { name: "ethereum", chainId: "1" },
        rpc: {
          method: "eth_maxPriorityFeePerGas",
          params: [] as unknown[],
          id: 1,
          jsonrpc: "2.0",
        },
      });
    });

    it("should return default value (20000) when backend returns Left", async () => {
      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Left(new Error("Backend error")),
      );

      const result =
        await gasFeeEstimationService.getMaxPriorityFeePerGas(mockTx);

      expect(result).toEqual(20000);
    });

    it("should throw error when response is not successful", async () => {
      const mockErrorResponse = {
        jsonrpc: "2.0",
        id: 1,
        error: {
          code: -32000,
          message: "Error message",
        },
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockErrorResponse),
      );

      await expect(
        gasFeeEstimationService.getMaxPriorityFeePerGas(mockTx),
      ).rejects.toThrow("Failed to estimate base priority fee per gas");
    });
  });

  describe("getBaseFeePerGas", () => {
    it("should successfully fetch base fee per gas from latest block", async () => {
      const mockResponse: JsonRpcResponseSuccess = {
        jsonrpc: "2.0",
        id: 1,
        result: {
          baseFeePerGas: "0x6fc23ac00", // 30000000000 in hex
          number: "0x123",
        },
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockResponse),
      );

      const result = await gasFeeEstimationService.getBaseFeePerGas(mockTx);

      expect(result).toEqual(30000000000);
      expect(mockBackendService.broadcast).toHaveBeenCalledWith({
        blockchain: { name: "ethereum", chainId: "1" },
        rpc: {
          method: "eth_getBlockByNumber",
          params: ["latest", false],
          id: 1,
          jsonrpc: "2.0",
        },
      });
    });

    it("should return default value (2000000) when backend returns Left", async () => {
      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Left(new Error("Backend error")),
      );

      const result = await gasFeeEstimationService.getBaseFeePerGas(mockTx);

      expect(result).toEqual(2000000);
    });

    it("should throw error when response is not successful", async () => {
      const mockErrorResponse = {
        jsonrpc: "2.0",
        id: 1,
        error: {
          code: -32000,
          message: "Block not found",
        },
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockErrorResponse),
      );

      await expect(
        gasFeeEstimationService.getBaseFeePerGas(mockTx),
      ).rejects.toThrow("Failed to estimate base fee per gas");
    });
  });

  describe("estimateGas", () => {
    it("should successfully estimate gas for transaction", async () => {
      const mockResponse: JsonRpcResponseSuccess = {
        jsonrpc: "2.0",
        id: 1,
        result: "0xc350", // 50000 in hex
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockResponse),
      );

      const result = await gasFeeEstimationService.estimateGas(mockTx);

      expect(result).toEqual(Number(mockResponse.result));
    });

    it("should return default value (90000) when backend returns Left", async () => {
      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Left(new Error("Backend error")),
      );

      const result = await gasFeeEstimationService.estimateGas(mockTx);

      expect(result).toEqual(90000);
    });

    it("should format transaction request correctly", async () => {
      const customTx: TransactionInfo = {
        chainId: "5",
        from: "0xSender",
        to: "0xReceiver",
        value: "0x1000",
        data: "0xabcd",
      };

      const mockResponse: JsonRpcResponseSuccess = {
        jsonrpc: "2.0",
        id: 1,
        result: "0x5208",
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockResponse),
      );

      await gasFeeEstimationService.estimateGas(customTx);

      expect(mockBackendService.broadcast).toHaveBeenCalledWith({
        blockchain: { name: "ethereum", chainId: "5" },
        rpc: {
          method: "eth_estimateGas",
          params: [
            {
              from: customTx.from,
              to: customTx.to,
              value: customTx.value,
              input: customTx.data,
            },
            "latest",
          ],
          id: 1,
          jsonrpc: "2.0",
        },
      });
    });

    it("should parse hexadecimal gas estimate to number", async () => {
      const mockResponse: JsonRpcResponseSuccess = {
        jsonrpc: "2.0",
        id: 1,
        result: "0x186a0", // 100000 in hex
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockResponse),
      );

      const result = await gasFeeEstimationService.estimateGas(mockTx);

      expect(result).toEqual(Number(mockResponse.result));
    });

    it("should throw error when response is not successful", async () => {
      const mockErrorResponse = {
        jsonrpc: "2.0",
        id: 1,
        error: {
          code: -32000,
          message: "Execution reverted",
        },
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockErrorResponse),
      );

      await expect(gasFeeEstimationService.estimateGas(mockTx)).rejects.toThrow(
        "Failed to estimate gas",
      );
    });

    it("should handle transactions with different value amounts", async () => {
      const txWithValue: TransactionInfo = {
        ...mockTx,
        value: "0xde0b6b3a7640000", // 1 ETH in wei
      };

      const mockResponse: JsonRpcResponseSuccess = {
        jsonrpc: "2.0",
        id: 1,
        result: "0x5208",
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockResponse),
      );

      await gasFeeEstimationService.estimateGas(txWithValue);

      expect(mockBackendService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          rpc: expect.objectContaining({
            params: expect.arrayContaining([
              expect.objectContaining({
                value: txWithValue.value,
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe("getNonce", () => {
    it("should successfully fetch nonce for address", async () => {
      const mockResponse: JsonRpcResponseSuccess = {
        jsonrpc: "2.0",
        id: 1,
        result: "0xa",
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockResponse),
      );

      const result = await gasFeeEstimationService.getNonce(mockTx);

      expect(result).toEqual(mockResponse.result);
      expect(result).toMatch(/^0x[0-9a-f]+$/i);
      expect(mockBackendService.broadcast).toHaveBeenCalledWith({
        blockchain: { name: "ethereum", chainId: "1" },
        rpc: {
          method: "eth_getTransactionCount",
          params: [mockTx.from, "latest"],
          id: 1,
          jsonrpc: "2.0",
        },
      });
    });

    it("should return undefined when backend returns Left", async () => {
      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Left(new Error("Backend error")),
      );

      const result = await gasFeeEstimationService.getNonce(mockTx);

      expect(result).toBeUndefined();
    });

    it("should return undefined when response is not successful", async () => {
      const mockErrorResponse = {
        jsonrpc: "2.0",
        id: 1,
        error: {
          code: -32000,
          message: "Error message",
        },
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockErrorResponse),
      );

      const result = await gasFeeEstimationService.getNonce(mockTx);

      expect(result).toBeUndefined();
    });

    it("should return undefined when result is not a string", async () => {
      const mockResponse = {
        jsonrpc: "2.0",
        id: 1,
        result: 123, // number instead of string
      } as unknown as JsonRpcResponseSuccess;

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockResponse),
      );

      const result = await gasFeeEstimationService.getNonce(mockTx);

      expect(result).toBeUndefined();
    });

    it("should call backend with eth_getTransactionCount method", async () => {
      const mockResponse: JsonRpcResponseSuccess = {
        jsonrpc: "2.0",
        id: 1,
        result: "0x0",
      };

      vi.spyOn(mockBackendService, "broadcast").mockResolvedValue(
        Right(mockResponse),
      );

      await gasFeeEstimationService.getNonce(mockTx);

      expect(mockBackendService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          rpc: expect.objectContaining({
            method: "eth_getTransactionCount",
          }),
        }),
      );
    });
  });
});
