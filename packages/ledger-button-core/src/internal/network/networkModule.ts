import { ContainerModule } from "inversify";

import { DefaultNetworkService } from "./DefaultNetworkService.js";
import { networkModuleTypes } from "./networkModuleTypes.js";

type NetworkModuleOptions = {
  stub?: boolean;
};

export function networkModuleFactory({ stub }: NetworkModuleOptions) {
  return new ContainerModule(({ bind }) => {
    bind(networkModuleTypes.NetworkService).to(DefaultNetworkService);

    if (stub) {
      // rebindSync(networkModuleTypes.NetworkService).toConstantValue({
      //   // TODO: Implement stub
      // });
    }
  });
}
