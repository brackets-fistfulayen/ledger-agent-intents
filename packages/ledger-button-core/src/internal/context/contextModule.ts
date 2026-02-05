import { ContainerModule } from "inversify";

import { contextModuleTypes } from "./contextModuleTypes.js";
import { DefaultContextService } from "./DefaultContextService.js";

export function contextModuleFactory() {
  return new ContainerModule(({ bind }) => {
    bind(contextModuleTypes.ContextService)
      .to(DefaultContextService)
      .inSingletonScope();
  });
}
