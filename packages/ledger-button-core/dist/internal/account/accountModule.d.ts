import { ContainerModule } from 'inversify';
import { ContainerOptions } from '../diTypes.js';
type AccountModuleOptions = Pick<ContainerOptions, "loggerLevel"> & {
    stub?: boolean;
};
export declare function accountModuleFactory(_args: AccountModuleOptions): ContainerModule;
export {};
//# sourceMappingURL=accountModule.d.ts.map