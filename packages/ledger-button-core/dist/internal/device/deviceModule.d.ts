import { ContainerModule } from 'inversify';
import { ContainerOptions } from '../diTypes.js';
type DeviceModuleOptions = Pick<ContainerOptions, "dmkConfig"> & {
    stub?: boolean;
};
export declare function deviceModuleFactory({ stub, dmkConfig }: DeviceModuleOptions): ContainerModule;
export {};
//# sourceMappingURL=deviceModule.d.ts.map