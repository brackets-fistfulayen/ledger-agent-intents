import { inject, injectable } from "inversify";

import { accountModuleTypes } from "../accountModuleTypes.js";
import type { AccountService } from "../service/AccountService.js";
import { Account } from "../service/AccountService.js";
import { FetchCloudSyncAccountsUseCase } from "./fetchCloudSyncAccountsUseCase.js";

@injectable()
export class FetchAccountsUseCase {
  constructor(
    @inject(accountModuleTypes.FetchCloudSyncAccountsUseCase)
    private readonly fetchCloudSyncAccountsUseCase: FetchCloudSyncAccountsUseCase,
    @inject(accountModuleTypes.AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(): Promise<Account[]> {
    const accounts = await this.fetchCloudSyncAccountsUseCase.execute();
    await this.accountService.setAccountsFromCloudSyncData(accounts);
    return this.accountService.getAccounts();
  }
}
