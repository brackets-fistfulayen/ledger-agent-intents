import { ContainerModule } from "inversify";

import { DefaultTransactionHistoryDataSource } from "./datasource/DefaultTransactionHistoryDataSource.js";
import type { TransactionHistoryDataSource } from "./datasource/TransactionHistoryDataSource.js";
import { FetchTransactionHistoryUseCase } from "./use-case/FetchTransactionHistoryUseCase.js";
import { transactionHistoryModuleTypes } from "./transactionHistoryModuleTypes.js";

type TransactionHistoryModuleOptions = {
  stub?: boolean;
};

export function transactionHistoryModuleFactory({
  stub,
}: TransactionHistoryModuleOptions) {
  return new ContainerModule(({ bind }) => {
    bind<TransactionHistoryDataSource>(
      transactionHistoryModuleTypes.TransactionHistoryDataSource,
    )
      .to(DefaultTransactionHistoryDataSource)
      .inSingletonScope();

    bind<FetchTransactionHistoryUseCase>(
      transactionHistoryModuleTypes.FetchTransactionHistoryUseCase,
    )
      .to(FetchTransactionHistoryUseCase)
      .inSingletonScope();

    if (stub) {
      // TODO: Add stub implementations for testing
    }
  });
}
