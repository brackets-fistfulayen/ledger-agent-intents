import { lastValueFrom, toArray } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "../service/AccountService.js";
import { FetchAccountsUseCase } from "./fetchAccountsUseCase.js";
import { FetchAccountsWithBalanceUseCase } from "./fetchAccountsWithBalanceUseCase.js";
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

function createMockAccount(overrides: Partial<Account> = {}): Account {
  return {
    freshAddress: "0x1234567890123456789012345678901234567890",
    seedIdentifier: "seed-1",
    derivationMode: "default",
    index: 0,
    name: "john.eth",
    ticker: "ETH",
    balance: undefined,
    tokens: [],
    ...overrides,
    id: overrides.id ?? "account-1",
    currencyId: overrides.currencyId ?? "ethereum",
  };
}

function createDeferredPromise<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const mockEthAccountValue = {
  id: "account-1",
  name: "john.eth",
  currencyId: "ethereum",
};
const mockUsdtAccountValue = {
  id: "account-2",
  name: "USDT",
  currencyId: "tether",
  ticker: "USDT",
};

const ETH_BALANCE = "3.23 ETH";
const USDT_BALANCE = "1000.0 USDT";

function createMockHydrateImplementation(
  account1Balance: string,
  account2Balance: string,
): (account: Account) => Promise<Account> {
  return async (account: Account) => {
    if (account.id === mockEthAccountValue.id) {
      return { ...account, balance: account1Balance };
    }
    return { ...account, balance: account2Balance };
  };
}
describe("FetchAccountsWithBalanceUseCase", () => {
  let useCase: FetchAccountsWithBalanceUseCase;
  let mockFetchAccountsUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  let mockHydrateAccountWithBalanceUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockFetchAccountsUseCase = {
      execute: vi.fn(),
    };
    mockHydrateAccountWithBalanceUseCase = {
      execute: vi.fn(),
    };

    useCase = new FetchAccountsWithBalanceUseCase(
      createMockLoggerFactory(),
      mockFetchAccountsUseCase as unknown as FetchAccountsUseCase,
      mockHydrateAccountWithBalanceUseCase as unknown as HydrateAccountWithBalanceUseCase,
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should return Observable<Account[]>", () => {
      const account1 = createMockAccount(mockEthAccountValue);
      const account2 = createMockAccount(mockUsdtAccountValue);

      mockFetchAccountsUseCase.execute.mockResolvedValue([account1, account2]);
      mockHydrateAccountWithBalanceUseCase.execute.mockImplementation(
        createMockHydrateImplementation(ETH_BALANCE, USDT_BALANCE),
      );

      const result$ = useCase.execute();

      expect(result$).toBeDefined();
      expect(typeof result$.subscribe).toBe("function");
    });

    it("should emit accounts without balances as first emission", async () => {
      const account1 = createMockAccount(mockEthAccountValue);
      const account2 = createMockAccount(mockUsdtAccountValue);
      const accounts = [account1, account2];
      mockFetchAccountsUseCase.execute.mockResolvedValue(accounts);
      mockHydrateAccountWithBalanceUseCase.execute.mockImplementation(
        createMockHydrateImplementation(ETH_BALANCE, USDT_BALANCE),
      );

      const emissions = await lastValueFrom(useCase.execute().pipe(toArray()));

      expect(emissions.length).toBeGreaterThan(0);

      const firstEmission = emissions[0];
      expect(firstEmission).toHaveLength(accounts.length);
      accounts.forEach((account, index) => {
        expect(firstEmission[index].balance).toBeUndefined();
        expect(firstEmission[index].name).toBe(account.name);
      });
    });

    it("should emit updated array as each balance arrives", async () => {
      const account1 = createMockAccount(mockEthAccountValue);
      const account2 = createMockAccount(mockUsdtAccountValue);

      mockFetchAccountsUseCase.execute.mockResolvedValue([account1, account2]);

      const account1WithBalance = { ...account1, balance: ETH_BALANCE };
      const account2WithBalance = { ...account2, balance: USDT_BALANCE };

      const ethDeferred = createDeferredPromise<Account>();
      const usdtDeferred = createDeferredPromise<Account>();

      mockHydrateAccountWithBalanceUseCase.execute.mockImplementation(
        async (account: Account) => {
          if (account.id === account1.id) {
            return ethDeferred.promise;
          }
          return usdtDeferred.promise;
        },
      );

      const emissionsPromise = lastValueFrom(useCase.execute().pipe(toArray()));

      const accounts = [account1, account2];
      const accountsWithBalance = [account1WithBalance, account2WithBalance];

      // Resolve ETH first to simulate faster loading
      ethDeferred.resolve(account1WithBalance);
      await Promise.resolve();

      // Resolve USDT after
      usdtDeferred.resolve(account2WithBalance);

      const emissions = await emissionsPromise;

      // First emission: no balances
      accounts.forEach((account, index) => {
        expect(emissions[0][index].name).toBe(account.name);
        expect(emissions[0][index].balance).toBeUndefined();
      });

      // Find emission where ETH is loaded but USDT is not
      const ethLoadedEmission = emissions.find(
        (emission) =>
          emission[0].balance === ETH_BALANCE &&
          emission[1].balance === undefined,
      );
      expect(ethLoadedEmission).toBeDefined();
      // Final emission: both balances loaded
      const finalEmission = emissions[emissions.length - 1];
      accountsWithBalance.forEach((accountWithBalance, index) => {
        expect(finalEmission[index].name).toBe(accountWithBalance.name);
        expect(finalEmission[index].balance).toBe(accountWithBalance.balance);
      });
    });

    it("should not block other accounts when first account balance fetch fails", async () => {
      const account1 = createMockAccount(mockEthAccountValue);
      const account2 = createMockAccount(mockUsdtAccountValue);

      mockFetchAccountsUseCase.execute.mockResolvedValue([account1, account2]);

      const account2WithBalance = { ...account2, balance: USDT_BALANCE };

      mockHydrateAccountWithBalanceUseCase.execute.mockImplementation(
        async (account: Account) => {
          if (account.id === account1.id) {
            throw new Error("Balance fetch failed");
          }
          return account2WithBalance;
        },
      );

      const emissions = await lastValueFrom(useCase.execute().pipe(toArray()));

      // Should still emit updates for account-2
      const finalEmission = emissions[emissions.length - 1];
      expect(finalEmission).toHaveLength(2);
      // account-1 should remain with undefined balance (error handled)
      expect(finalEmission[0].balance).toBeUndefined();
      // account-2 should have balance loaded
      expect(finalEmission[1].balance).toBe(USDT_BALANCE);
    });
  });
});
