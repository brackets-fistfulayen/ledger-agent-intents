import {
  ConsoleLogger,
  DeviceManagementKit,
  DeviceManagementKitBuilder,
  DiscoveredDevice,
  LogLevel,
  NoAccessibleDeviceError,
  TransportIdentifier,
} from "@ledgerhq/device-management-kit";
import {
  webBleIdentifier,
  webBleTransportFactory,
} from "@ledgerhq/device-transport-kit-web-ble";
import {
  webHidIdentifier,
  webHidTransportFactory,
} from "@ledgerhq/device-transport-kit-web-hid";
import { type Factory, inject, injectable } from "inversify";
import { firstValueFrom } from "rxjs";

import { type DeviceModuleOptions } from "../../diTypes.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { type LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { deviceModuleTypes } from "../deviceModuleTypes.js";
import { Device } from "../model/Device.js";
import { DeviceConnectionError } from "../model/errors.js";
import { DeviceManagementKitService } from "./DeviceManagementKitService.js";

export type ConnectionType = "bluetooth" | "usb" | "";

@injectable()
export class DefaultDeviceManagementKitService
  implements DeviceManagementKitService
{
  private readonly logger: LoggerPublisher;
  private readonly _dmk: DeviceManagementKit;
  public hidIdentifier: TransportIdentifier = webHidIdentifier;
  public bleIdentifier: TransportIdentifier = webBleIdentifier;
  private _currentSessionId?: string;
  private _connectedDevice?: Device;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(deviceModuleTypes.DmkConfig)
    args: DeviceModuleOptions,
  ) {
    this.logger = loggerFactory("[DeviceManagementKit Service]");
    const builder = new DeviceManagementKitBuilder();

    builder
      .addConfig(args)
      .addLogger(new ConsoleLogger(LogLevel.Error))
      .addTransport(webHidTransportFactory)
      .addTransport(webBleTransportFactory);

    this._dmk = builder.build();
  }

  get dmk() {
    return this._dmk;
  }

  get sessionId() {
    return this._currentSessionId;
  }

  get connectedDevice() {
    return this._connectedDevice;
  }

  async connectToDevice({ type }: { type: ConnectionType }) {
    const identifier = type === "usb" ? this.hidIdentifier : this.bleIdentifier;
    this.logger.debug(`Connecting to device`, { identifier });

    const dmk = this.dmk;
    let device: DiscoveredDevice;
    try {
      device = await firstValueFrom(
        dmk.startDiscovering({ transport: identifier }),
      );
      await dmk.stopDiscovering();
    } catch (error) {
      this.logger.error(`Failed to start discovery`, { error });
      if (error instanceof NoAccessibleDeviceError) {
        throw new DeviceConnectionError(`No accessible device`, {
          type: "no-accessible-device",
          error,
        });
      }

      throw new DeviceConnectionError(`Failed to start discovery`, {
        type: "failed-to-start-discovery",
        error,
      });
    }

    try {
      const sessionId = await dmk.connect({
        device,
        sessionRefresherOptions: {
          isRefresherDisabled: true,
        },
      });
      this._currentSessionId = sessionId;
      this._connectedDevice = new Device(
        await dmk.getConnectedDevice({ sessionId }),
      );
      return this._connectedDevice;
    } catch (error) {
      this.logger.error(`Failed to connect to device`, { error });
      throw new DeviceConnectionError(`Failed to connect to device`, {
        type: "failed-to-connect",
        error,
      });
    }
  }

  async listAvailableDevices() {
    let counter = 0;
    return new Promise<DiscoveredDevice[]>((resolve, reject) => {
      const subscription = this.dmk.listenToAvailableDevices({}).subscribe({
        next: (discoveredDevices) => {
          counter++;

          if (discoveredDevices.length) {
            this.logger.debug(`Known devices`, { discoveredDevices });
            resolve(discoveredDevices);
            if (subscription) {
              subscription.unsubscribe();
            }
            return;
          }

          if (counter > 5 && !discoveredDevices.length) {
            resolve([]);
            if (subscription) {
              subscription.unsubscribe();
            }
            return;
          }
        },
        error: (error) => {
          this.logger.error(`Failed to list known devices`, { error });
          reject(error);
          if (subscription) {
            subscription.unsubscribe();
          }
        },
      });
    });
  }

  async disconnectFromDevice() {
    if (!this._currentSessionId) {
      return;
    }

    try {
      await this.dmk.close();
      this._currentSessionId = undefined;
    } catch (error) {
      this.logger.error(`Failed to disconnect from device`, { error });
      throw new DeviceConnectionError(`Failed to disconnect from device`, {
        type: "failed-to-disconnect",
        error,
      });
    }
  }
}
