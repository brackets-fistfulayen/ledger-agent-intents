import { Left, Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NoSelectedAccountError } from "../../../api/errors/LedgerSyncErrors.js";
import type { ContextService } from "../../context/ContextService.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import type { Account, DetailedAccount } from "../service/AccountService.js";
import type { FetchSelectedAccountUseCase } from "./fetchSelectedAccountUseCase.js";
import { GetDetailedSelectedAccountUseCase } from "./getDetailedSelectedAccountUseCase.js";

describe("GetDetailedSelectedAccountUseCase", () => {
  let useCase: GetDetailedSelectedAccountUseCase;
  let mockContextService: {
    getContext: ReturnType<typeof vi.fn>;
  };
  let mockFetchSelectedAccountUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  let mockLogger: {
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };
  let mockLoggerFactory: ReturnType<typeof vi.fn>;

  const hydratedAccount: DetailedAccount = {
    id: "account-1",
    currencyId: "ethereum",
    freshAddress: "0x1234567890abcdef1234567890abcdef12345678",
    seedIdentifier: "seed-1",
    derivationMode: "default",
    index: 0,
    name: "My Ethereum Account",
    ticker: "ETH",
    balance: "1000000000000000000",
    tokens: [],
    fiatBalance: { value: "2000.00", currency: "USD" },
    transactionHistory: [],
  };

  const nonHydratedAccount: Account = {
    id: "account-2",
    currencyId: "ethereum",
    freshAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    seedIdentifier: "seed-1",
    derivationMode: "default",
    index: 1,
    name: "",
    ticker: "",
    balance: undefined,
    tokens: [],
  };

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    mockLoggerFactory = vi.fn().mockReturnValue(mockLogger);

    mockContextService = {
      getContext: vi.fn(),
    };

    mockFetchSelectedAccountUseCase = {
      execute: vi.fn(),
    };

    useCase = new GetDetailedSelectedAccountUseCase(
      mockLoggerFactory as unknown as () => LoggerPublisher,
      mockContextService as unknown as ContextService,
      mockFetchSelectedAccountUseCase as unknown as FetchSelectedAccountUseCase,
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    describe("when selected account is already hydrated", () => {
      it("should return Right with the account directly without fetching", async () => {
        mockContextService.getContext.mockReturnValue({
          selectedAccount: hydratedAccount,
        });

        const result = await useCase.execute();

        expect(result.isRight()).toBe(true);
        result.map((account) => {
          expect(account).toEqual(hydratedAccount);
        });
        expect(mockFetchSelectedAccountUseCase.execute).not.toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Selected account already hydrated",
          { selectedAccount: hydratedAccount },
        );
      });
    });

    describe("when selected account is not hydrated", () => {
      it("should fetch account details when account has empty name", async () => {
        mockContextService.getContext.mockReturnValue({
          selectedAccount: nonHydratedAccount,
        });
        mockFetchSelectedAccountUseCase.execute.mockResolvedValue(
          Right(hydratedAccount),
        );

        const result = await useCase.execute();

        expect(result.isRight()).toBe(true);
        result.map((account) => {
          expect(account).toEqual(hydratedAccount);
        });
        expect(mockFetchSelectedAccountUseCase.execute).toHaveBeenCalledTimes(1);
      });

      it("should fetch account details when account is undefined", async () => {
        mockContextService.getContext.mockReturnValue({
          selectedAccount: undefined,
        });
        mockFetchSelectedAccountUseCase.execute.mockResolvedValue(
          Left(new NoSelectedAccountError()),
        );

        const result = await useCase.execute();

        expect(result.isLeft()).toBe(true);
        result.mapLeft((error) => {
          expect(error).toBeInstanceOf(NoSelectedAccountError);
        });
        expect(mockFetchSelectedAccountUseCase.execute).toHaveBeenCalledTimes(1);
      });
    });
  });
});
