import { LoggerPublisher, LogMessageData } from './LoggerPublisher.js';
import { LoggerSubscriber } from './LoggerSubscriber.js';
export declare class DefaultLoggerPublisher implements LoggerPublisher {
    readonly subscribers: LoggerSubscriber[];
    private readonly tag;
    constructor(subscribers: LoggerSubscriber[], tag: string);
    private _log;
    error(message: string, data?: LogMessageData): void;
    warn(message: string, data?: LogMessageData): void;
    info(message: string, data?: LogMessageData): void;
    debug(message: string, data?: LogMessageData): void;
    fatal(message: string, data?: LogMessageData): void;
}
//# sourceMappingURL=DefaultLoggerPublisher.d.ts.map