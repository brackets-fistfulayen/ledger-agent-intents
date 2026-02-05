import { ContainerModule } from "inversify";

import { DefaultLedgerSyncService } from "./service/DefaultLedgerSyncService.js";
import { ledgerSyncModuleTypes } from "./ledgerSyncModuleTypes.js";

type LedgerSyncModuleOptions = {
  stub?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ledgerSyncModuleFactory({ stub }: LedgerSyncModuleOptions) {
  return new ContainerModule(({ bind }) => {
    bind(ledgerSyncModuleTypes.LedgerSyncService)
      .to(DefaultLedgerSyncService)
      .inSingletonScope();

    /* if (stub) {
      rebindSync(ledgerSyncModuleTypes.LedgerSyncService).to(
        StubLedgerSyncService,
      );
    } */
  });
}
