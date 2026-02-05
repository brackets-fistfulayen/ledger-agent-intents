import { ContainerModule } from "inversify";

import { consentModuleTypes } from "./consentModuleTypes.js";
import { ConsentService } from "./ConsentService.js";
import { DefaultConsentService } from "./DefaultConsentService.js";

export function consentModuleFactory() {
  return new ContainerModule(({ bind }) => {
    bind<ConsentService>(consentModuleTypes.ConsentService)
      .to(DefaultConsentService)
      .inSingletonScope();
  });
}
