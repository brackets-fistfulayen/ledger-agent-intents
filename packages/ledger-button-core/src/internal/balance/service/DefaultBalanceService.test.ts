import { Left, Right } from "purify-ts";

import { Account } from "../../account/service/AccountService.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { AlpacaDataSource } from "../datasource/alpaca/AlpacaDataSource.js";
import { AlpacaBalance } from "../datasource/alpaca/alpacaTypes.js";
import { CalDataSource } from "../datasource/cal/CalDataSource.js";
import { TokenBalance } from "../model/types.js";
import { DefaultBalanceService } from "./DefaultBalanceService.js";

describe("DefaultBalanceService", () => {
  let balanceService: DefaultBalanceService;
  let mockLoggerFactory: () => LoggerPublisher;
  let mockAlpacaDataSource: AlpacaDataSource;
  let mockCalDataSource: CalDataSource;
  let mockLogger: LoggerPublisher;

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

    // Mock AlpacaDataSource
    mockAlpacaDataSource = {
      getBalanceForAddressAndCurrencyId: vi.fn(),
    } as unknown as AlpacaDataSource;

    // Mock CalDataSource
    mockCalDataSource = {
      getTokenInformation: vi.fn(),
    } as unknown as CalDataSource;

    balanceService = new DefaultBalanceService(
      mockLoggerFactory,
      mockAlpacaDataSource,
      mockCalDataSource,
    );
  });

  describe("getBalanceForAccount", () => {
    const mockAccount: Account = {
      id: "account-1",
      currencyId: "ethereum",
      freshAddress: "0x1234567890abcdef",
      seedIdentifier: "seed-123",
      derivationMode: "44'/60'/0'",
      index: 0,
      name: "Test Account",
      ticker: "ETH",
      balance: undefined,
      tokens: [],
    };

    it("should successfully fetch native balance without tokens", async () => {
      const mockAlpacaBalances: AlpacaBalance[] = [
        {
          type: "native",
          value: "1000000000000000000", // 1 ETH in wei
        },
      ];

      vi.spyOn(
        mockAlpacaDataSource,
        "getBalanceForAddressAndCurrencyId",
      ).mockResolvedValue(Right(mockAlpacaBalances));

      const result = await balanceService.getBalanceForAccount(
        mockAccount,
        true,
      );

      expect(result.isRight()).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Getting balance for address",
        {
          address: mockAccount.freshAddress,
          currencyId: mockAccount.currencyId,
          withTokens: true,
        },
      );

      result.map((accountBalance) => {
        expect(accountBalance.nativeBalance.balance).toBe(
          BigInt("1000000000000000000"),
        );
        expect(accountBalance.tokenBalances).toEqual([]);
      });
    });

    it("should successfully fetch native balance with tokens", async () => {
      const mockAlpacaBalances: AlpacaBalance[] = [
        {
          type: "native",
          value: "2000000000000000000", // 2 ETH
        },
        {
          type: "erc20",
          value: "1000000000000000000000", // 1000 tokens
          reference: "0xtoken1",
        },
        {
          type: "erc20",
          value: "500000000", // 500 tokens with 6 decimals
          reference: "0xtoken2",
        },
      ];

      const mockTokenInfo1 = {
        id: "ethereum/erc20/test_token_1",
        decimals: 18,
        name: "Test Token 1",
        ticker: "TT1",
      };

      const mockTokenInfo2 = {
        id: "ethereum/erc20/test_token_2",
        decimals: 6,
        name: "Test Token 2",
        ticker: "TT2",
      };

      vi.spyOn(
        mockAlpacaDataSource,
        "getBalanceForAddressAndCurrencyId",
      ).mockResolvedValue(Right(mockAlpacaBalances));

      vi.spyOn(mockCalDataSource, "getTokenInformation")
        .mockResolvedValueOnce(Right(mockTokenInfo1))
        .mockResolvedValueOnce(Right(mockTokenInfo2));

      const result = await balanceService.getBalanceForAccount(
        mockAccount,
        true,
      );

      expect(result.isRight()).toBe(true);
      expect(mockCalDataSource.getTokenInformation).toHaveBeenCalledTimes(2);
      expect(mockCalDataSource.getTokenInformation).toHaveBeenCalledWith(
        "0xtoken1",
        "ethereum",
      );
      expect(mockCalDataSource.getTokenInformation).toHaveBeenCalledWith(
        "0xtoken2",
        "ethereum",
      );

      result.map((accountBalance) => {
        expect(accountBalance.nativeBalance.balance).toBe(
          BigInt("2000000000000000000"),
        );
        expect(accountBalance.tokenBalances).toHaveLength(2);
        expect(accountBalance.tokenBalances[0]).toBeInstanceOf(TokenBalance);
        expect(accountBalance.tokenBalances[0].name).toBe("Test Token 1");
        expect(accountBalance.tokenBalances[0].ticker).toBe("TT1");
        expect(accountBalance.tokenBalances[0].balance).toBe(
          BigInt("1000000000000000000000"),
        );
        expect(accountBalance.tokenBalances[0].decimals).toBe(18);
        expect(accountBalance.tokenBalances[1]).toBeInstanceOf(TokenBalance);
        expect(accountBalance.tokenBalances[1].name).toBe("Test Token 2");
        expect(accountBalance.tokenBalances[1].ticker).toBe("TT2");
        expect(accountBalance.tokenBalances[1].balance).toBe(
          BigInt("500000000"),
        );
        expect(accountBalance.tokenBalances[1].decimals).toBe(6);
      });
    });

    it("should filter out tokens when token information fetch fails", async () => {
      const mockAlpacaBalances: AlpacaBalance[] = [
        {
          type: "native",
          value: "1000000000000000000",
        },
        {
          type: "erc20",
          value: "1000000000000000000000",
          reference: "0xtoken1",
        },
        {
          type: "erc20",
          value: "500000000",
          reference: "0xtoken2",
        },
      ];

      const mockTokenInfo1 = {
        id: "ethereum/erc20/test_token_1",
        decimals: 18,
        name: "Test Token 1",
        ticker: "TT1",
      };

      vi.spyOn(
        mockAlpacaDataSource,
        "getBalanceForAddressAndCurrencyId",
      ).mockResolvedValue(Right(mockAlpacaBalances));

      // First token succeeds, second fails
      vi.spyOn(mockCalDataSource, "getTokenInformation")
        .mockResolvedValueOnce(Right(mockTokenInfo1))
        .mockResolvedValueOnce(Left(new Error("Token info fetch failed")));

      const result = await balanceService.getBalanceForAccount(
        mockAccount,
        true,
      );

      expect(result.isRight()).toBe(true);

      result.map((accountBalance) => {
        expect(accountBalance.nativeBalance.balance).toBe(
          BigInt("1000000000000000000"),
        );
        // Only the first token should be included
        expect(accountBalance.tokenBalances).toHaveLength(1);
        expect(accountBalance.tokenBalances[0].name).toBe("Test Token 1");
      });
    });

    it("should handle case when all token information fetches fail", async () => {
      const mockAlpacaBalances: AlpacaBalance[] = [
        {
          type: "native",
          value: "1000000000000000000",
        },
        {
          type: "erc20",
          value: "1000000000000000000000",
          reference: "0xtoken1",
        },
      ];

      vi.spyOn(
        mockAlpacaDataSource,
        "getBalanceForAddressAndCurrencyId",
      ).mockResolvedValue(Right(mockAlpacaBalances));

      vi.spyOn(mockCalDataSource, "getTokenInformation").mockResolvedValue(
        Left(new Error("Token info fetch failed")),
      );

      const result = await balanceService.getBalanceForAccount(
        mockAccount,
        true,
      );

      expect(result.isRight()).toBe(true);

      result.map((accountBalance) => {
        expect(accountBalance.nativeBalance.balance).toBe(
          BigInt("1000000000000000000"),
        );
        expect(accountBalance.tokenBalances).toEqual([]);
      });
    });

    it("should return error when alpaca data source fails", async () => {
      vi.spyOn(
        mockAlpacaDataSource,
        "getBalanceForAddressAndCurrencyId",
      ).mockResolvedValue(Left(new Error("Alpaca fetch failed")));

      const result = await balanceService.getBalanceForAccount(
        mockAccount,
        true,
      );

      expect(result.isLeft()).toBe(true);
      result.mapLeft((error) => {
        expect(error.message).toBe("Failed to fetch balance from Alpaca");
      });
    });

    it("should log debug information when fetching balance", async () => {
      const mockAlpacaBalances: AlpacaBalance[] = [
        {
          type: "native",
          value: "1000000000000000000",
        },
      ];

      vi.spyOn(
        mockAlpacaDataSource,
        "getBalanceForAddressAndCurrencyId",
      ).mockResolvedValue(Right(mockAlpacaBalances));

      await balanceService.getBalanceForAccount(mockAccount, true);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Getting balance for address",
        {
          address: "0x1234567890abcdef",
          currencyId: "ethereum",
          withTokens: true,
        },
      );
    });

    it("should handle accounts with different currency IDs", async () => {
      const bitcoinAccount: Account = {
        ...mockAccount,
        currencyId: "bitcoin",
        freshAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        ticker: "BTC",
      };

      const mockAlpacaBalances: AlpacaBalance[] = [
        {
          type: "native",
          value: "100000000", // 1 BTC in satoshis
        },
      ];

      vi.spyOn(
        mockAlpacaDataSource,
        "getBalanceForAddressAndCurrencyId",
      ).mockResolvedValue(Right(mockAlpacaBalances));

      const result = await balanceService.getBalanceForAccount(
        bitcoinAccount,
        true,
      );

      expect(result.isRight()).toBe(true);
      expect(
        mockAlpacaDataSource.getBalanceForAddressAndCurrencyId,
      ).toHaveBeenCalledWith(
        "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "bitcoin",
      );

      result.map((accountBalance) => {
        expect(accountBalance.nativeBalance.balance).toBe(BigInt("100000000"));
      });
    });

    it("should handle zero balance", async () => {
      const mockAlpacaBalances: AlpacaBalance[] = [
        {
          type: "native",
          value: "0",
        },
      ];

      vi.spyOn(
        mockAlpacaDataSource,
        "getBalanceForAddressAndCurrencyId",
      ).mockResolvedValue(Right(mockAlpacaBalances));

      const result = await balanceService.getBalanceForAccount(
        mockAccount,
        true,
      );

      expect(result.isRight()).toBe(true);

      result.map((accountBalance) => {
        expect(accountBalance.nativeBalance.balance).toBe(BigInt(0));
        expect(accountBalance.tokenBalances).toEqual([]);
      });
    });

    it("should handle multiple token balances with mixed success/failure", async () => {
      const mockAlpacaBalances: AlpacaBalance[] = [
        {
          type: "native",
          value: "1000000000000000000",
        },
        {
          type: "erc20",
          value: "1000000",
          reference: "token1",
        },
        {
          type: "erc20",
          value: "2000000",
          reference: "token2",
        },
        {
          type: "erc20",
          value: "3000000",
          reference: "token3",
        },
      ];

      const mockTokenInfo1 = {
        id: "ethereum/erc20/token_1",
        decimals: 6,
        name: "Token 1",
        ticker: "TK1",
      };

      const mockTokenInfo3 = {
        id: "ethereum/erc20/token_3",
        decimals: 6,
        name: "Token 3",
        ticker: "TK3",
      };

      vi.spyOn(
        mockAlpacaDataSource,
        "getBalanceForAddressAndCurrencyId",
      ).mockResolvedValue(Right(mockAlpacaBalances));

      vi.spyOn(mockCalDataSource, "getTokenInformation")
        .mockResolvedValueOnce(Right(mockTokenInfo1))
        .mockResolvedValueOnce(Left(new Error("Failed for token 2")))
        .mockResolvedValueOnce(Right(mockTokenInfo3));

      const result = await balanceService.getBalanceForAccount(
        mockAccount,
        true,
      );

      expect(result.isRight()).toBe(true);

      result.map((accountBalance) => {
        expect(accountBalance.tokenBalances).toHaveLength(2);
        expect(accountBalance.tokenBalances[0].ticker).toBe("TK1");
        expect(accountBalance.tokenBalances[1].ticker).toBe("TK3");
      });
    });
  });
});
