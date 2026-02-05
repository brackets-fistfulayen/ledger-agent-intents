import { ContainerModule } from "inversify";

import { DefaultAccountService } from "./service/DefaultAccountService.js";
import { FetchAccountsUseCase } from "./use-case/fetchAccountsUseCase.js";
import { FetchAccountsWithBalanceUseCase } from "./use-case/fetchAccountsWithBalanceUseCase.js";
import { FetchCloudSyncAccountsUseCase } from "./use-case/fetchCloudSyncAccountsUseCase.js";
import { FetchSelectedAccountUseCase } from "./use-case/fetchSelectedAccountUseCase.js";
import { GetDetailedSelectedAccountUseCase } from "./use-case/getDetailedSelectedAccountUseCase.js";
import { HydrateAccountWithBalanceUseCase } from "./use-case/HydrateAccountWithBalanceUseCase.js";
import { HydrateAccountWithFiatUseCase } from "./use-case/hydrateAccountWithFiatUseCase.js";
import { HydrateAccountWithTxHistoryUseCase } from "./use-case/hydrateAccountWithTxHistoryUseCase.js";
import { type ContainerOptions } from "../diTypes.js";
import { accountModuleTypes } from "./accountModuleTypes.js";

type AccountModuleOptions = Pick<ContainerOptions, "loggerLevel"> & {
  stub?: boolean;
};

export function accountModuleFactory(_args: AccountModuleOptions) {
  return new ContainerModule(({ bind }) => {
    bind(accountModuleTypes.AccountService)
      .to(DefaultAccountService)
      .inSingletonScope();

    bind(accountModuleTypes.FetchAccountsUseCase).to(FetchAccountsUseCase);
    bind(accountModuleTypes.FetchAccountsWithBalanceUseCase).to(
      FetchAccountsWithBalanceUseCase,
    );
    bind(accountModuleTypes.FetchCloudSyncAccountsUseCase).to(
      FetchCloudSyncAccountsUseCase,
    );
    bind(accountModuleTypes.FetchSelectedAccountUseCase).to(
      FetchSelectedAccountUseCase,
    );
    bind(accountModuleTypes.GetDetailedSelectedAccountUseCase).to(
      GetDetailedSelectedAccountUseCase,
    );
    bind(accountModuleTypes.HydrateAccountWithTxHistoryUseCase).to(
      HydrateAccountWithTxHistoryUseCase,
    );
    bind(accountModuleTypes.HydrateAccountWithFiatUseCase).to(
      HydrateAccountWithFiatUseCase,
    );
    bind(accountModuleTypes.HydrateAccountWithBalanceUseCase).to(
      HydrateAccountWithBalanceUseCase,
    );
  });
}
