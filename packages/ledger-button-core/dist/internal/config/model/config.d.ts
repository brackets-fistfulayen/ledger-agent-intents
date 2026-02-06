import { LogLevel, LogLevelKey } from '../../logger/model/constant.js';
export type Environment = "staging" | "production";
export type LKRPConfig = {
    cloudSyncUrl: string;
};
export type ConfigArgs = {
    originToken: string;
    logLevel?: LogLevelKey;
    dAppIdentifier: string;
    environment?: Environment;
    rpcUrls?: Record<string, string | undefined>;
};
export declare class Config {
    originToken: string;
    dAppIdentifier: string;
    logLevel: LogLevel;
    environment: Environment;
    lkrp: LKRPConfig;
    rpcUrls: Record<string, string | undefined>;
    constructor({ originToken, dAppIdentifier, logLevel, environment, rpcUrls, }: ConfigArgs);
    private getCloudSyncUrl;
    setLogLevel(logLevel: LogLevelKey): void;
    getAlpacaUrl(): string;
    getCalUrl(): string;
    getBackendUrl(): string;
    getRpcUrl(chainId: string | number): string | undefined;
    getCounterValueUrl(): string;
    getExplorerUrl(): string;
    setEnvironment(environment: Environment): void;
}
//# sourceMappingURL=config.d.ts.map