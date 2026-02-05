import { ContainerModule } from "inversify";

import { DefaultTransactionService } from "./service/DefaultTransactionService.js";
import { TransactionService } from "./service/TransactionService.js";
import { transactionModuleTypes } from "./transactionModuleTypes.js";

type TransactionModuleOptions = {
  stub?: boolean;
};

export function transactionModuleFactory({
  stub: _stub,
}: TransactionModuleOptions) {
  return new ContainerModule(({ bind }) => {
    bind<TransactionService>(transactionModuleTypes.TransactionService)
      .to(DefaultTransactionService)
      .inSingletonScope();
  });
}
