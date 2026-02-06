import { ContainerModule } from 'inversify';
import { ContainerOptions } from '../diTypes.js';
type ConfigModuleOptions = Pick<ContainerOptions, "loggerLevel" | "apiKey" | "dAppIdentifier" | "environment" | "rpcUrls">;
export declare function configModuleFactory({ loggerLevel, apiKey, dAppIdentifier, environment, rpcUrls, }: ConfigModuleOptions): ContainerModule;
export {};
//# sourceMappingURL=configModule.d.ts.map