import { DmkConfig } from '@ledgerhq/device-management-kit';
import { LogLevelKey } from './logger/model/constant.js';
export type DeviceModuleOptions = Partial<DmkConfig>;
export type ContainerOptions = {
    apiKey?: string;
    dAppIdentifier?: string;
    /**
     * Optional chainId -> JSON-RPC URL overrides.
     * Keys are chain IDs as strings (e.g. "8453").
     *
     * When set, some internal JSON-RPC calls (gas estimation, nonce, etc.)
     * can be routed directly to this endpoint instead of Ledger backend routing.
     */
    rpcUrls?: Record<string, string | undefined>;
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
//# sourceMappingURL=diTypes.d.ts.map