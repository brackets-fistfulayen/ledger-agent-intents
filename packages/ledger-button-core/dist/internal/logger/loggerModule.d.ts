import { ContainerModule } from 'inversify';
import { ErrorTrackingConfig } from '../event-tracking/config/ErrorTrackingConfig.js';
type LoggerModuleOptions = {
    stub?: boolean;
    errorTrackingConfig?: ErrorTrackingConfig;
};
export declare function loggerModuleFactory({ stub, errorTrackingConfig, }?: LoggerModuleOptions): ContainerModule;
export {};
//# sourceMappingURL=loggerModule.d.ts.map