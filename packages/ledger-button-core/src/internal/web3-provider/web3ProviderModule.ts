import { ContainerModule } from "inversify";

import { LedgerRemoteDatasource } from "./datasource/LedgerRemoteDatasource.js";
import { StubLedgerRemoteDatasource } from "./datasource/StubLedgerRemoteDatasource.js";
import { JSONRPCCallUseCase } from "./use-case/JSONRPCRequest.js";
import { web3ProviderModuleTypes } from "./web3ProviderModuleTypes.js";

type Web3ProviderModuleOptions = {
  stub?: boolean;
};

export function web3ProviderModuleFactory({ stub }: Web3ProviderModuleOptions) {
  return new ContainerModule(({ bind, rebindSync }) => {
    bind(web3ProviderModuleTypes.LedgerRemoteDatasource).to(
      LedgerRemoteDatasource,
    );

    bind(web3ProviderModuleTypes.JSONRPCCallUseCase).to(JSONRPCCallUseCase);

    if (stub) {
      rebindSync(web3ProviderModuleTypes.LedgerRemoteDatasource).to(
        StubLedgerRemoteDatasource,
      );
    }
  });
}
