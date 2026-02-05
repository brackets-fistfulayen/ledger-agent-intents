import { Account } from "../../internal/account/service/AccountService.js";
import { Device } from "../../internal/device/model/Device.js";

export type ButtonCoreContext = {
  connectedDevice: Device | undefined;
  selectedAccount: Account | undefined;
  trustChainId: string | undefined;
  applicationPath: string | undefined;
  chainId: number;
  welcomeScreenCompleted: boolean;
  hasTrackingConsent: boolean | undefined;
};
