import { ContainerModule } from "inversify";

import { DefaultDeviceManagementKitService } from "./service/DefaultDeviceManagementKitService.js";
import { StubDeviceManagementKitService } from "./service/StubDeviceManagementKitService.js";
import { BroadcastTransaction } from "./use-case/BroadcastTransaction.js";
import { ConnectDevice } from "./use-case/ConnectDevice.js";
import { DisconnectDevice } from "./use-case/DisconnectDevice.js";
import { ListAvailableDevices } from "./use-case/ListAvailableDevices.js";
import { SignPersonalMessage } from "./use-case/SignPersonalMessage.js";
import { SignRawTransaction } from "./use-case/SignRawTransaction.js";
import { SignTransaction } from "./use-case/SignTransaction.js";
import { SignTypedData } from "./use-case/SignTypedData.js";
import { SwitchDevice } from "./use-case/SwitchDevice.js";
import { ContainerOptions } from "../diTypes.js";
import { deviceModuleTypes } from "./deviceModuleTypes.js";

type DeviceModuleOptions = Pick<ContainerOptions, "dmkConfig"> & {
  stub?: boolean;
};

export function deviceModuleFactory({ stub, dmkConfig }: DeviceModuleOptions) {
  return new ContainerModule(({ bind, rebindSync }) => {
    bind(deviceModuleTypes.DmkConfig).toConstantValue(dmkConfig);

    bind(deviceModuleTypes.DeviceManagementKitService)
      .to(DefaultDeviceManagementKitService)
      .inSingletonScope();

    bind(deviceModuleTypes.ConnectDeviceUseCase).to(ConnectDevice);
    bind(deviceModuleTypes.DisconnectDeviceUseCase).to(DisconnectDevice);
    bind(deviceModuleTypes.SwitchDeviceUseCase).to(SwitchDevice);
    bind(deviceModuleTypes.SignRawTransactionUseCase).to(SignRawTransaction);
    bind(deviceModuleTypes.SignTransactionUseCase).to(SignTransaction);
    bind(deviceModuleTypes.BroadcastTransactionUseCase).to(
      BroadcastTransaction,
    );
    bind(deviceModuleTypes.SignTypedDataUseCase).to(SignTypedData);
    bind(deviceModuleTypes.SignPersonalMessageUseCase).to(SignPersonalMessage);
    bind(deviceModuleTypes.ListAvailableDevicesUseCase).to(
      ListAvailableDevices,
    );

    if (stub) {
      rebindSync(deviceModuleTypes.DeviceManagementKitService).to(
        StubDeviceManagementKitService,
      );
    }
  });
}
