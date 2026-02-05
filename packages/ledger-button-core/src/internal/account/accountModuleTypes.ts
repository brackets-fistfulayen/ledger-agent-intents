export const accountModuleTypes = {
  AccountService: Symbol.for("AccountService"),
  FetchAccountsUseCase: Symbol.for("FetchAccountsUseCase"),
  FetchAccountsWithBalanceUseCase: Symbol.for(
    "FetchAccountsWithBalanceUseCase",
  ),
  FetchCloudSyncAccountsUseCase: Symbol.for("FetchCloudSyncAccountsUseCase"),
  FetchSelectedAccountUseCase: Symbol.for("FetchSelectedAccountUseCase"),
  GetDetailedSelectedAccountUseCase: Symbol.for(
    "GetDetailedSelectedAccountUseCase",
  ),
  HydrateAccountWithTxHistoryUseCase: Symbol.for(
    "HydrateAccountWithTxHistoryUseCase",
  ),
  HydrateAccountWithFiatUseCase: Symbol.for("HydrateAccountWithFiatUseCase"),
  HydrateAccountWithBalanceUseCase: Symbol.for(
    "HydrateAccountWithBalanceUseCase",
  ),
} as const;
