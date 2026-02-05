import {
  type ConnectedDevice,
  DeviceManagementKit,
  DeviceModelId,
} from "@ledgerhq/device-management-kit";
import { injectable } from "inversify";

import { Device } from "../model/Device.js";
import { DeviceManagementKitService } from "./DeviceManagementKitService.js";

@injectable()
export class StubDeviceManagementKitService
  implements DeviceManagementKitService
{
  dmk: DeviceManagementKit = {} as DeviceManagementKit;
  sessionId: string | undefined = "session-id-123";
  connectedDevice: Device | undefined = new Device({
    name: "GM's Flex",
    modelId: DeviceModelId.FLEX,
    sessionId: "session-id-123",
    type: "BLE",
    id: "device-1",
  } as ConnectedDevice);

  connectToDevice = () => Promise.resolve(this.connectedDevice as Device);
  disconnectFromDevice = () => Promise.resolve();

  listAvailableDevices = () =>
    Promise.resolve([
      {
        id: "device-1",
        name: "GM's Flex",
        deviceModel: {
          id: "flex-001",
          model: DeviceModelId.FLEX,
          name: "GM's Flex",
        },
        transport: "BLE",
      },
      {
        id: "device-2",
        name: "GM's Stax",
        deviceModel: {
          id: "stax-001",
          model: DeviceModelId.STAX,
          name: "GM's Stax",
        },
        transport: "USB",
      },
    ]);
}
