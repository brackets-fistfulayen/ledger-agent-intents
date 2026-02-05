import { type Factory, inject, injectable } from "inversify";
import { type Either } from "purify-ts";

import { balanceModuleTypes } from "../../balance/balanceModuleTypes.js";
import type { CounterValueDataSource } from "../../balance/datasource/countervalue/CounterValueDataSource.js";
import type { CounterValueResult } from "../../balance/datasource/countervalue/counterValueTypes.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import type {
  Account,
  AccountWithFiat,
  FiatBalance,
  Token,
} from "../service/AccountService.js";

@injectable()
export class HydrateAccountWithFiatUseCase {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(balanceModuleTypes.CounterValueDataSource)
    private readonly counterValueDataSource: CounterValueDataSource,
  ) {
    this.logger = loggerFactory("[HydrateAccountWithFiatUseCase]");
  }

  async execute(
    account: Account,
    targetCurrency = "usd",
  ): Promise<AccountWithFiat> {
    this.logHydrationStart(account);

    const balance = account.balance;
    if (!balance) {
      return this.skipHydration(account, "No balance found");
    }

    const counterValuesResult = await this.fetchCounterValues(
      account,
      targetCurrency,
    );

    return counterValuesResult.caseOf({
      Left: (error) => {
        this.logger.warn("Failed to fetch counter values", { error });
        return { ...account, fiatBalance: undefined };
      },
      Right: (counterValues) => {
        const currency = targetCurrency.toUpperCase();

        const accountFiatBalance = this.calculateAccountFiat(
          balance,
          counterValues[0]?.rate,
          currency,
        );

        const tokensWithFiat = this.hydrateTokensWithFiat(
          account.tokens,
          counterValues.slice(1),
          currency,
        );

        this.logHydrationSuccess(accountFiatBalance, tokensWithFiat, currency);

        return {
          ...account,
          fiatBalance: accountFiatBalance,
          tokens: tokensWithFiat,
        };
      },
    });
  }

  private logHydrationStart(account: Account): void {
    this.logger.debug("Hydrating account with fiat balance", {
      address: account.freshAddress,
      currencyId: account.currencyId,
      tokenCount: account.tokens.length,
    });
  }

  private skipHydration(account: Account, reason: string): AccountWithFiat {
    this.logger.debug(`${reason}, skipping fiat hydration`);
    return { ...account, fiatBalance: undefined };
  }

  private async fetchCounterValues(
    account: Account,
    targetCurrency: string,
  ): Promise<Either<Error, CounterValueResult[]>> {
    const ledgerIds = this.buildLedgerIds(account);
    this.logger.debug("Fetching counter values", { ledgerIds, targetCurrency });
    return this.counterValueDataSource.getCounterValues(
      ledgerIds,
      targetCurrency,
    );
  }

  private buildLedgerIds(account: Account): string[] {
    return [
      account.currencyId,
      ...account.tokens.map((token) => token.ledgerId),
    ];
  }

  private logHydrationSuccess(
    accountFiat: FiatBalance | undefined,
    tokens: Token[],
    currency: string,
  ): void {
    this.logger.debug("Successfully calculated fiat balances", {
      accountFiat: accountFiat?.value,
      tokensWithFiat: tokens.filter((t) => t.fiatBalance).length,
      currency,
    });
  }

  private calculateAccountFiat(
    balance: string,
    rate: number | undefined,
    currency: string,
  ): FiatBalance | undefined {
    const balanceNum = parseFloat(balance);
    if (Number.isNaN(balanceNum) || rate === undefined) {
      return undefined;
    }
    const fiatValue = balanceNum * rate;
    return {
      value: fiatValue.toFixed(2),
      currency,
    };
  }

  private hydrateTokensWithFiat(
    tokens: Token[],
    counterValues: CounterValueResult[],
    currency: string,
  ): Token[] {
    return tokens.map((token, index) => {
      const rate = counterValues[index]?.rate;
      const balanceNum = parseFloat(token.balance);

      if (Number.isNaN(balanceNum) || rate === undefined || rate === 0) {
        return token;
      }

      const fiatValue = balanceNum * rate;
      return {
        ...token,
        fiatBalance: {
          value: fiatValue.toFixed(2),
          currency,
        },
      };
    });
  }
}
