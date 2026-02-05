import { Left, Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BackendService } from "../../backend/BackendService.js";
import type { AccountBalance, TokenBalance } from "../../balance/model/types.js";
import type { BalanceService } from "../../balance/service/BalanceService.js";
import type { Account } from "../service/AccountService.js";
import { HydrateAccountWithBalanceUseCase } from "./HydrateAccountWithBalanceUseCase.js";

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

function createMockBalanceService(): {
  getBalanceForAccount: ReturnType<typeof vi.fn>;
} {
  return {
    getBalanceForAccount: vi.fn(),
  };
}

function createMockBackendService(): {
  broadcast: ReturnType<typeof vi.fn>;
  getConfig: ReturnType<typeof vi.fn>;
  event: ReturnType<typeof vi.fn>;
} {
  return {
    broadcast: vi.fn(),
    getConfig: vi.fn(),
    event: vi.fn(),
  };
}

function createMockAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: "account-1",
    currencyId: "ethereum",
    freshAddress: "0x1234567890123456789012345678901234567890",
    seedIdentifier: "seed-1",
    derivationMode: "default",
    index: 0,
    name: "My Ethereum Account",
    ticker: "ETH",
    balance: undefined,
    tokens: [],
    ...overrides,
  };
}

describe("HydrateAccountWithBalanceUseCase", () => {
  let useCase: HydrateAccountWithBalanceUseCase;
  let mockBalanceService: ReturnType<typeof createMockBalanceService>;
  let mockBackendService: ReturnType<typeof createMockBackendService>;

  beforeEach(() => {
    mockBalanceService = createMockBalanceService();
    mockBackendService = createMockBackendService();

    useCase = new HydrateAccountWithBalanceUseCase(
      createMockLoggerFactory(),
      mockBalanceService as unknown as BalanceService,
      mockBackendService as unknown as BackendService,
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should return account with balance and tokens when balance service succeeds", async () => {
      const mockAccount = createMockAccount();
      const mockBalanceData: AccountBalance = {
        nativeBalance: {
          balance: BigInt("1500000000000000000"), // 1.5 ETH in wei
        },
        tokenBalances: [
          {
            ledgerId: "ethereum/erc20/usdc",
            ticker: "USDC",
            name: "USD Coin",
            decimals: 6,
            balance: BigInt("1000000000"),
            balanceFormatted: "1000.0",
          } as unknown as TokenBalance,
          {
            ledgerId: "ethereum/erc20/dai",
            ticker: "DAI",
            name: "Dai Stablecoin",
            decimals: 18,
            balance: BigInt("500000000000000000000"),
            balanceFormatted: "500.0",
          } as unknown as TokenBalance,
        ],
      };

      mockBalanceService.getBalanceForAccount.mockResolvedValue(
        Right(mockBalanceData),
      );

      const result = await useCase.execute(mockAccount);

      expect(result.balance).toBe("1.5000");
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens[0]).toEqual({
        ledgerId: "ethereum/erc20/usdc",
        ticker: "USDC",
        name: "USD Coin",
        balance: "1000.0",
        fiatBalance: undefined,
      });
      expect(result.tokens[1]).toEqual({
        ledgerId: "ethereum/erc20/dai",
        ticker: "DAI",
        name: "Dai Stablecoin",
        balance: "500.0",
        fiatBalance: undefined,
      });
      expect(mockBalanceService.getBalanceForAccount).toHaveBeenCalledWith(
        mockAccount,
        true,
      );
    });

    it("should return account with zero balance when balance service succeeds with zero balance", async () => {
      const mockAccount = createMockAccount();
      const mockBalanceData: AccountBalance = {
        nativeBalance: {
          balance: BigInt(0),
        },
        tokenBalances: [],
      };

      mockBalanceService.getBalanceForAccount.mockResolvedValue(
        Right(mockBalanceData),
      );

      const result = await useCase.execute(mockAccount);

      expect(result.balance).toBe("0.0000");
      expect(result.tokens).toHaveLength(0);
    });

    it("should format balance to 4 decimal places", async () => {
      const mockAccount = createMockAccount();
      const mockBalanceData: AccountBalance = {
        nativeBalance: {
          balance: BigInt("1234567890123456789"), // ~1.2345... ETH
        },
        tokenBalances: [],
      };

      mockBalanceService.getBalanceForAccount.mockResolvedValue(
        Right(mockBalanceData),
      );

      const result = await useCase.execute(mockAccount);

      expect(result.balance).toBe("1.2345");
    });

    it("should pass withTokens parameter to balance service", async () => {
      const mockAccount = createMockAccount();
      const mockBalanceData: AccountBalance = {
        nativeBalance: {
          balance: BigInt("1000000000000000000"),
        },
        tokenBalances: [],
      };

      mockBalanceService.getBalanceForAccount.mockResolvedValue(
        Right(mockBalanceData),
      );

      await useCase.execute(mockAccount, false);

      expect(mockBalanceService.getBalanceForAccount).toHaveBeenCalledWith(
        mockAccount,
        false,
      );
    });

    it("should fall back to RPC when balance service fails", async () => {
      const mockAccount = createMockAccount();
      const mockError = new Error("Balance service unavailable");

      mockBalanceService.getBalanceForAccount.mockResolvedValue(
        Left(mockError),
      );
      mockBackendService.broadcast.mockResolvedValue(
        Right({ result: "0xDE0B6B3A7640000" }), // 1 ETH in hex
      );

      const result = await useCase.execute(mockAccount);

      expect(result.balance).toBe("1.0000");
      expect(result.tokens).toHaveLength(0);
      expect(mockBackendService.broadcast).toHaveBeenCalledWith({
        blockchain: { name: "ethereum", chainId: "1" },
        rpc: {
          method: "eth_getBalance",
          params: [mockAccount.freshAddress, "latest"],
          id: 1,
          jsonrpc: "2.0",
        },
      });
    });

    it("should return zero balance when both balance service and RPC fail", async () => {
      const mockAccount = createMockAccount();

      mockBalanceService.getBalanceForAccount.mockResolvedValue(
        Left(new Error("Balance service unavailable")),
      );
      mockBackendService.broadcast.mockResolvedValue(
        Left(new Error("RPC error")),
      );

      const result = await useCase.execute(mockAccount);

      expect(result.balance).toBe("0.0000");
      expect(result.tokens).toHaveLength(0);
    });

    it("should use correct chain ID for different currencies", async () => {
      const mockAccount = createMockAccount({ currencyId: "polygon" });

      mockBalanceService.getBalanceForAccount.mockResolvedValue(
        Left(new Error("Balance service unavailable")),
      );
      mockBackendService.broadcast.mockResolvedValue(
        Right({ result: "0x0" }),
      );

      await useCase.execute(mockAccount);

      expect(mockBackendService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          blockchain: { name: "ethereum", chainId: "137" },
        }),
      );
    });

    it("should preserve original account properties", async () => {
      const mockAccount = createMockAccount({
        id: "custom-id",
        name: "Custom Name",
        index: 5,
      });
      const mockBalanceData: AccountBalance = {
        nativeBalance: {
          balance: BigInt("1000000000000000000"),
        },
        tokenBalances: [],
      };

      mockBalanceService.getBalanceForAccount.mockResolvedValue(
        Right(mockBalanceData),
      );

      const result = await useCase.execute(mockAccount);

      expect(result.id).toBe("custom-id");
      expect(result.name).toBe("Custom Name");
      expect(result.index).toBe(5);
      expect(result.freshAddress).toBe(mockAccount.freshAddress);
    });
  });
});
