import { ContainerModule } from "inversify";

import { ModalService } from "./service/ModalService.js";
import { modalModuleTypes } from "./modalModuleTypes.js";

export function modalModuleFactory() {
  return new ContainerModule(({ bind }) => {
    bind<ModalService>(modalModuleTypes.ModalService)
      .to(ModalService)
      .inSingletonScope();
  });
}
