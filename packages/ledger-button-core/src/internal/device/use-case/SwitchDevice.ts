import { type Factory, inject, injectable } from "inversify";

import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { deviceModuleTypes } from "../deviceModuleTypes.js";
import {
  ConnectionType,
  type DeviceManagementKitService,
} from "../service/DeviceManagementKitService.js";

@injectable()
export class SwitchDevice {
  private readonly logger: LoggerPublisher;
  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(deviceModuleTypes.DeviceManagementKitService)
    private readonly deviceManagementKitService: DeviceManagementKitService,
  ) {
    this.logger = loggerFactory("[SwitchDevice UseCase]");
  }

  async execute({ type }: { type: ConnectionType }): Promise<void> {
    try {
      this.logger.info("Switching device", { type });
      await this.deviceManagementKitService.disconnectFromDevice();
      await this.deviceManagementKitService.connectToDevice({ type });
    } catch (error) {
      this.logger.error(`Failed to switch device`, { error });
      throw error;
    }
  }
}
