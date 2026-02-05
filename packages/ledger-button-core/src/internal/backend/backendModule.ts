import { ContainerModule } from "inversify";

import { backendModuleTypes } from "./backendModuleTypes.js";
import { DefaultBackendService } from "./DefaultBackendService.js";

type BackendModuleOptions = {
  stub?: boolean;
};

export function backendModuleFactory({ stub }: BackendModuleOptions) {
  return new ContainerModule(({ bind }) => {
    bind(backendModuleTypes.BackendService).to(DefaultBackendService);

    if (stub) {
      // TODO: Implement stub
    }
  });
}
