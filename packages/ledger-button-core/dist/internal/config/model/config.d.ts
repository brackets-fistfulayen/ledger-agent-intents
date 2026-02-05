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
};
export declare class Config {
    originToken: string;
    dAppIdentifier: string;
    logLevel: LogLevel;
    environment: Environment;
    lkrp: LKRPConfig;
    constructor({ originToken, dAppIdentifier, logLevel, environment, }: ConfigArgs);
    private getCloudSyncUrl;
    setLogLevel(logLevel: LogLevelKey): void;
    getAlpacaUrl(): string;
    getCalUrl(): string;
    getBackendUrl(): string;
    getCounterValueUrl(): string;
    getExplorerUrl(): string;
    setEnvironment(environment: Environment): void;
}
//# sourceMappingURL=config.d.ts.map