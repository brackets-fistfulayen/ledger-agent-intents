import { Config } from '../../config/model/config.js';
import { LogLevel } from '../model/constant.js';
import { LogData } from './LoggerPublisher.js';
import { LoggerSubscriber } from './LoggerSubscriber.js';
export declare class ConsoleLoggerSubscriber implements LoggerSubscriber {
    private readonly config;
    constructor(config: Config);
    private canLog;
    private formatMessage;
    log(level: LogLevel, message: string, data: LogData): void | Promise<void>;
}
//# sourceMappingURL=ConsoleLoggerSubscriber.d.ts.map