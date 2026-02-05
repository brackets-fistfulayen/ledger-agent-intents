import { LogData } from './LoggerPublisher.js';
export interface LoggerSubscriber {
    log(level: number, message: string, data: LogData): void;
}
//# sourceMappingURL=LoggerSubscriber.d.ts.map