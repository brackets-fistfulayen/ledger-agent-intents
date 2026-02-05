import { DeviceModelId } from "@ledgerhq/device-management-kit";
import { type Factory, inject, injectable } from "inversify";

import { DeviceNotSupportedError } from "../../../api/errors/DeviceErrors.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { deviceModuleTypes } from "../deviceModuleTypes.js";
import { Device } from "../model/Device.js";
import {
  ConnectionType,
  type DeviceManagementKitService,
} from "../service/DeviceManagementKitService.js";

@injectable()
export class ConnectDevice {
  private readonly logger: LoggerPublisher;
  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(deviceModuleTypes.DeviceManagementKitService)
    private readonly deviceManagementKitService: DeviceManagementKitService,
  ) {
    this.logger = loggerFactory("[ConnectDevice UseCase]");
  }

  async execute({ type }: { type: ConnectionType }): Promise<Device> {
    this.logger.info("Connecting to device", { type });
    const device = await this.deviceManagementKitService.connectToDevice({
      type,
    });

    if (device.modelId === DeviceModelId.NANO_S) {
      await this.deviceManagementKitService.disconnectFromDevice();
      const error = new DeviceNotSupportedError("Device not supported", {
        modelId: device.modelId,
      });
      this.logger.error("Device not supported", { error });
      throw error;
    }

    return device;
  }
}
