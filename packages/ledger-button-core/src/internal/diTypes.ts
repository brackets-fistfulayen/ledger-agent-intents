import { type DmkConfig } from "@ledgerhq/device-management-kit";

import { LogLevelKey } from "./logger/model/constant.js";

export type DeviceModuleOptions = Partial<DmkConfig>;

export type ContainerOptions = {
  apiKey?: string;
  dAppIdentifier?: string;
  dmkConfig?: DeviceModuleOptions;
  loggerLevel?: LogLevelKey;
  environment?: "staging" | "production";
  devConfig?: {
    stub: Partial<{
      balance: boolean;
      base: boolean;
      account: boolean;
      device: boolean;
      web3Provider: boolean;
      dAppConfig: boolean;
      transactionHistory: boolean;
    }>;
  };
};
