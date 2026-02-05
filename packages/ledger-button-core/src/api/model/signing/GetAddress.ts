import { DeviceActionState } from "@ledgerhq/device-management-kit";
import {
  GetAddressDAError,
  GetAddressDAIntermediateValue,
  GetAddressDAOutput,
} from "@ledgerhq/device-signer-kit-ethereum";

export type GetAddressDAState = DeviceActionState<
  GetAddressDAOutput,
  GetAddressDAError,
  GetAddressDAIntermediateValue
>;

export function isGetAddressResult(
  result: unknown,
): result is GetAddressDAState {
  return (
    !!result &&
    typeof result === "object" &&
    "output" in result &&
    typeof result.output === "object" &&
    "address" in (result.output as object)
  );
}
