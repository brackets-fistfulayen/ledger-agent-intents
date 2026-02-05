import { ContainerModule } from 'inversify';
import { ContainerOptions } from '../diTypes.js';
type ConfigModuleOptions = Pick<ContainerOptions, "loggerLevel" | "apiKey" | "dAppIdentifier" | "environment">;
export declare function configModuleFactory({ loggerLevel, apiKey, dAppIdentifier, environment, }: ConfigModuleOptions): ContainerModule;
export {};
//# sourceMappingURL=configModule.d.ts.map