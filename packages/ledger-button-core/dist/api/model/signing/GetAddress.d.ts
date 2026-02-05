import { DeviceActionState } from '@ledgerhq/device-management-kit';
import { GetAddressDAError, GetAddressDAIntermediateValue, GetAddressDAOutput } from '@ledgerhq/device-signer-kit-ethereum';
export type GetAddressDAState = DeviceActionState<GetAddressDAOutput, GetAddressDAError, GetAddressDAIntermediateValue>;
export declare function isGetAddressResult(result: unknown): result is GetAddressDAState;
//# sourceMappingURL=GetAddress.d.ts.map