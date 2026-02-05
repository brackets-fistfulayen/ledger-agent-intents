import type { Factory } from "inversify";
import { inject, injectable } from "inversify";

import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import type { TransactionHistoryItem } from "../../transaction-history/model/transactionHistoryTypes.js";
import { transactionHistoryModuleTypes } from "../../transaction-history/transactionHistoryModuleTypes.js";
import type { FetchTransactionHistoryUseCase } from "../../transaction-history/use-case/FetchTransactionHistoryUseCase.js";
import type { Account } from "../service/AccountService.js";

export type AccountWithTransactionHistory = Account & {
  transactionHistory: TransactionHistoryItem[] | undefined;
};

@injectable()
export class HydrateAccountWithTxHistoryUseCase {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(transactionHistoryModuleTypes.FetchTransactionHistoryUseCase)
    private readonly fetchTransactionHistoryUseCase: FetchTransactionHistoryUseCase,
  ) {
    this.logger = loggerFactory("HydrateAccountWithTxHistoryUseCase");
  }

  async execute(account: Account): Promise<AccountWithTransactionHistory> {
    const blockchain = account.ticker.toLowerCase();
    this.logger.debug("Fetching transaction history for account", {
      blockchain,
      address: account.freshAddress,
    });

    const result = await this.fetchTransactionHistoryUseCase.execute(
      blockchain,
      account.freshAddress,
    );

    return result.caseOf<AccountWithTransactionHistory>({
      Left: (error) => {
        this.logger.warn("Failed to fetch transaction history", {
          error: error.message,
          blockchain,
          address: account.freshAddress,
        });
        return {
          ...account,
          transactionHistory: undefined,
        };
      },
      Right: (historyResult) => {
        this.logger.debug("Transaction history fetched successfully", {
          blockchain,
          transactionCount: historyResult.transactions.length,
        });
        return {
          ...account,
          transactionHistory: historyResult.transactions,
        };
      },
    });
  }
}
