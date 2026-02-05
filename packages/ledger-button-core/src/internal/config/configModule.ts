import { ContainerModule } from "inversify";

import { Config } from "./model/config.js";
import { type ContainerOptions } from "../diTypes.js";
import { configModuleTypes } from "./configModuleTypes.js";

type ConfigModuleOptions = Pick<
  ContainerOptions,
  "loggerLevel" | "apiKey" | "dAppIdentifier" | "environment"
>;

const originToken =
  "1e55ba3959f4543af24809d9066a2120bd2ac9246e626e26a1ff77eb109ca0e5";

export function configModuleFactory({
  loggerLevel,
  apiKey,
  dAppIdentifier,
  environment,
}: ConfigModuleOptions) {
  return new ContainerModule(({ bind }) => {
    bind<Config>(configModuleTypes.Config).toResolvedValue(() => {
      return new Config({
        logLevel: loggerLevel,
        originToken: apiKey || originToken,
        dAppIdentifier: dAppIdentifier || "",
        environment,
      });
    });
  });
}
