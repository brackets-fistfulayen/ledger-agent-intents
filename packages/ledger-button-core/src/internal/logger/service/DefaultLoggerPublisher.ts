import { injectable, multiInject } from "inversify";

import { loggerModuleTypes } from "../loggerModuleTypes.js";
import { LOG_LEVELS } from "../model/constant.js";
import { LogData, LoggerPublisher, LogMessageData } from "./LoggerPublisher.js";
import { LoggerSubscriber } from "./LoggerSubscriber.js";

@injectable()
export class DefaultLoggerPublisher implements LoggerPublisher {
  constructor(
    @multiInject(loggerModuleTypes.LoggerSubscriber)
    readonly subscribers: LoggerSubscriber[],
    private readonly tag: string,
  ) {}

  private _log(level: number, message: string, data?: LogMessageData): void {
    const opts: LogData = {
      timestamp: new Date().toISOString(),
      tag: this.tag,
      data,
    };
    this.subscribers.forEach((subscriber) => {
      subscriber.log(level, message, opts);
    });
  }

  error(message: string, data?: LogMessageData): void {
    this._log(LOG_LEVELS.error, message, data);
  }
  warn(message: string, data?: LogMessageData): void {
    this._log(LOG_LEVELS.warn, message, data);
  }
  info(message: string, data?: LogMessageData): void {
    this._log(LOG_LEVELS.info, message, data);
  }
  debug(message: string, data?: LogMessageData): void {
    this._log(LOG_LEVELS.debug, message, data);
  }
  fatal(message: string, data?: LogMessageData): void {
    this._log(LOG_LEVELS.fatal, message, data);
  }
}
