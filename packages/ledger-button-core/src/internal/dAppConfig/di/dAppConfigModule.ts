import { ContainerModule } from "inversify";

import { DAppConfigService } from "../service/DAppConfigService.js";
import { DefaultDAppConfigService } from "../service/DefaultDAppConfigService.js";
import { stubDAppConfig } from "../service/StubDAppConfig.js";
import { dAppConfigModuleTypes } from "./dAppConfigModuleTypes.js";

type DAppConfigModuleOptions = {
  stub?: boolean;
};

export function dAppConfigModuleFactory({ stub }: DAppConfigModuleOptions) {
  return new ContainerModule(({ rebindSync, bind }) => {
    bind<DAppConfigService>(dAppConfigModuleTypes.DAppConfigService).to(
      DefaultDAppConfigService,
    );

    if (stub) {
      rebindSync<DAppConfigService>(
        dAppConfigModuleTypes.DAppConfigService,
      ).toConstantValue({
        getDAppConfig() {
          return Promise.resolve(stubDAppConfig);
        },
      });
    }
  });
}
