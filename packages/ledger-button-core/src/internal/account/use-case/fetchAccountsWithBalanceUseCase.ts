import { type Factory, inject, injectable } from "inversify";
import {
  catchError,
  from,
  map,
  merge,
  Observable,
  of,
  scan,
  startWith,
  switchMap,
} from "rxjs";

import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { accountModuleTypes } from "../accountModuleTypes.js";
import type { Account, AccountUpdate } from "../service/AccountService.js";
import { FetchAccountsUseCase } from "./fetchAccountsUseCase.js";
import { HydrateAccountWithBalanceUseCase } from "./HydrateAccountWithBalanceUseCase.js";

@injectable()
export class FetchAccountsWithBalanceUseCase {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(accountModuleTypes.FetchAccountsUseCase)
    private readonly fetchAccountsUseCase: FetchAccountsUseCase,
    @inject(accountModuleTypes.HydrateAccountWithBalanceUseCase)
    private readonly hydrateAccountWithBalanceUseCase: HydrateAccountWithBalanceUseCase,
  ) {
    this.logger = loggerFactory("[FetchAccountsWithBalanceUseCase]");
  }

  execute(): Observable<Account[]> {
    return from(this.fetchAccountsUseCase.execute()).pipe(
      switchMap((accounts) => {
        const initialAccounts =
          this.initializeAccountsWithEmptyBalances(accounts);

        if (initialAccounts.length === 0) {
          return of(initialAccounts);
        }

        const balanceObservables = initialAccounts.map((account) =>
          this.createBalanceObservable(account),
        );

        return merge(...balanceObservables).pipe(
          scan(
            (acc: Account[], update: AccountUpdate) =>
              this.mergeAccountUpdate(acc, update),
            initialAccounts,
          ),
          startWith(initialAccounts),
        );
      }),
    );
  }

  private initializeAccountsWithEmptyBalances(accounts: Account[]): Account[] {
    return accounts.map((account) => ({
      ...account,
      balance: undefined,
      tokens: [],
    }));
  }

  private createBalanceObservable(account: Account): Observable<AccountUpdate> {
    return from(
      this.hydrateAccountWithBalanceUseCase.execute(account, true),
    ).pipe(
      catchError((error) => {
        this.logger.warn(
          "Failed to fetch balance for account, keeping original",
          {
            accountId: account.id,
            error,
          },
        );
        return of(account);
      }),
      map(
        (updatedAccount): AccountUpdate => ({
          accountId: account.id,
          account: updatedAccount,
        }),
      ),
    );
  }

  private mergeAccountUpdate(
    accounts: Account[],
    update: AccountUpdate,
  ): Account[] {
    const index = accounts.findIndex((a) => a.id === update.accountId);
    if (index !== -1) {
      const updated = [...accounts];
      updated[index] = update.account;
      return updated;
    }
    return accounts;
  }
}
