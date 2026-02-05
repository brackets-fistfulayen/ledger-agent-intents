import type { Factory } from "inversify";
import { inject, injectable } from "inversify";
import { Either, Right } from "purify-ts";

import { contextModuleTypes } from "../../context/contextModuleTypes.js";
import type { ContextService } from "../../context/ContextService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { accountModuleTypes } from "../accountModuleTypes.js";
import type { Account, DetailedAccount } from "../service/AccountService.js";
import {
  type AccountError,
  type FetchSelectedAccountUseCase,
} from "./fetchSelectedAccountUseCase.js";

@injectable()
export class GetDetailedSelectedAccountUseCase {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(contextModuleTypes.ContextService)
    private readonly contextService: ContextService,
    @inject(accountModuleTypes.FetchSelectedAccountUseCase)
    private readonly fetchSelectedAccountUseCase: FetchSelectedAccountUseCase,
  ) {
    this.logger = loggerFactory("[GetDetailedSelectedAccountUseCase]");
  }

  async execute(): Promise<Either<AccountError, DetailedAccount>> {
    const selectedAccount = this.contextService.getContext().selectedAccount;

    if (this.isSelectedAccountHydrated(selectedAccount)) {
      this.logger.debug("Selected account already hydrated", {
        selectedAccount,
      });
      return Right(selectedAccount as DetailedAccount);
    }

    return this.fetchSelectedAccountUseCase.execute();
  }

  private isSelectedAccountHydrated(selectedAccount?: Account): boolean {
    // Account is only fully hydrated if it has name AND transactionHistory
    // This ensures we fetch transaction history when it's missing
    const detailed = selectedAccount as DetailedAccount | undefined;
    return (
      !!selectedAccount?.name &&
      selectedAccount.name.length > 0 &&
      detailed?.transactionHistory !== undefined
    );
  }
}
