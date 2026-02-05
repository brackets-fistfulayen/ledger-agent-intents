import { Left, Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CounterValueDataSource } from "../../balance/datasource/countervalue/CounterValueDataSource.js";
import type { CounterValueResult } from "../../balance/datasource/countervalue/counterValueTypes.js";
import type { Account } from "../service/AccountService.js";
import { HydrateAccountWithFiatUseCase } from "./hydrateAccountWithFiatUseCase.js";

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

describe("HydrateAccountWithFiatUseCase", () => {
  let useCase: HydrateAccountWithFiatUseCase;
  let mockCounterValueDataSource: {
    getCounterValues: ReturnType<typeof vi.fn>;
  };

  const baseAccount: Account = {
    id: "account-1",
    currencyId: "ethereum",
    freshAddress: "0x1234567890abcdef1234567890abcdef12345678",
    seedIdentifier: "seed-1",
    derivationMode: "default",
    index: 0,
    name: "My Ethereum Account",
    ticker: "ETH",
    balance: "2.5",
    tokens: [],
  };

  const accountWithoutBalance: Account = {
    ...baseAccount,
    balance: undefined,
  };

  beforeEach(() => {
    mockCounterValueDataSource = {
      getCounterValues: vi.fn(),
    };

    useCase = new HydrateAccountWithFiatUseCase(
      createMockLoggerFactory(),
      mockCounterValueDataSource as unknown as CounterValueDataSource,
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    describe("when account has no balance", () => {
      it("should return account with undefined fiatBalance", async () => {
        const result = await useCase.execute(accountWithoutBalance);

        expect(result).toEqual({
          ...accountWithoutBalance,
          fiatBalance: undefined,
        });
        expect(
          mockCounterValueDataSource.getCounterValues,
        ).not.toHaveBeenCalled();
      });
    });

    describe("when counter value fetch fails", () => {
      it("should return account with undefined fiatBalance", async () => {
        mockCounterValueDataSource.getCounterValues.mockResolvedValue(
          Left(new Error("Network error")),
        );

        const result = await useCase.execute(baseAccount);

        expect(result).toEqual({
          ...baseAccount,
          fiatBalance: undefined,
        });
        expect(
          mockCounterValueDataSource.getCounterValues,
        ).toHaveBeenCalledWith(["ethereum"], "usd");
      });
    });

    describe("when counter value fetch returns empty array", () => {
      it("should return account with undefined fiat value when no rate available", async () => {
        mockCounterValueDataSource.getCounterValues.mockResolvedValue(
          Right([] as CounterValueResult[]),
        );

        const result = await useCase.execute(baseAccount);

        expect(result).toEqual({
          ...baseAccount,
          fiatBalance: undefined,
        });
      });
    });

    describe("when counter value fetch succeeds", () => {
      it("should calculate fiat balance correctly with default currency", async () => {
        const counterValueResult: CounterValueResult[] = [
          { ledgerId: "ethereum", rate: 2500.5 },
        ];
        mockCounterValueDataSource.getCounterValues.mockResolvedValue(
          Right(counterValueResult),
        );

        const result = await useCase.execute(baseAccount);

        expect(result).toEqual({
          ...baseAccount,
          fiatBalance: {
            value: "6251.25",
            currency: "USD",
          },
        });
        expect(
          mockCounterValueDataSource.getCounterValues,
        ).toHaveBeenCalledWith(["ethereum"], "usd");
      });

      it("should use custom target currency when provided", async () => {
        const counterValueResult: CounterValueResult[] = [
          { ledgerId: "ethereum", rate: 2300 },
        ];
        mockCounterValueDataSource.getCounterValues.mockResolvedValue(
          Right(counterValueResult),
        );

        const result = await useCase.execute(baseAccount, "eur");

        expect(result.fiatBalance).toEqual({
          value: "5750.00",
          currency: "EUR",
        });
        expect(
          mockCounterValueDataSource.getCounterValues,
        ).toHaveBeenCalledWith(["ethereum"], "eur");
      });

      it("should handle decimal balance values", async () => {
        const accountWithDecimalBalance: Account = {
          ...baseAccount,
          balance: "1.5",
        };
        const counterValueResult: CounterValueResult[] = [
          { ledgerId: "ethereum", rate: 2000 },
        ];
        mockCounterValueDataSource.getCounterValues.mockResolvedValue(
          Right(counterValueResult),
        );

        const result = await useCase.execute(accountWithDecimalBalance);

        expect(result.fiatBalance).toEqual({
          value: "3000.00",
          currency: "USD",
        });
      });
    });
  });
});
