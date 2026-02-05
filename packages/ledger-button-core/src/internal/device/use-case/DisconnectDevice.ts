import { type Factory, inject, injectable } from "inversify";

import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { deviceModuleTypes } from "../deviceModuleTypes.js";
import { type DeviceManagementKitService } from "../service/DeviceManagementKitService.js";

@injectable()
export class DisconnectDevice {
  private readonly logger: LoggerPublisher;
  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(deviceModuleTypes.DeviceManagementKitService)
    private readonly deviceManagementKitService: DeviceManagementKitService,
  ) {
    this.logger = loggerFactory("[DisconnectDevice UseCase]");
  }

  async execute(): Promise<void> {
    this.logger.info("Disconnecting from device");
    return this.deviceManagementKitService.disconnectFromDevice();
  }
}
