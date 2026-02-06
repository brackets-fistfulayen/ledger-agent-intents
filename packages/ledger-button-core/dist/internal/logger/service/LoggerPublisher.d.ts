import { LoggerSubscriber } from './LoggerSubscriber.js';
export type LogMessageData = Record<string, unknown>;
export type LogData = {
    timestamp: string;
    tag: string;
    data?: LogMessageData;
};
export interface LoggerPublisher {
    readonly subscribers: LoggerSubscriber[];
    error(message: string, data?: LogMessageData): void;
    warn(message: string, data?: LogMessageData): void;
    info(message: string, data?: LogMessageData): void;
    debug(message: string, data?: LogMessageData): void;
    fatal(message: string, data?: LogMessageData): void;
}
/**
 * Synchronous logger factory used across the codebase.
 *
 * Note: Inversify's built-in `Factory<T>` type is modeled as `T | Promise<T>`
 * which is too broad for our usage (we only ever return sync loggers).
 */
export type LoggerPublisherFactory = (tag: string) => LoggerPublisher;
//# sourceMappingURL=LoggerPublisher.d.ts.map