import chalk from "chalk";
import { inject, injectable } from "inversify";

import { configModuleTypes } from "../../config/configModuleTypes.js";
import { Config } from "../../config/model/config.js";
import { LOG_LEVELS, type LogLevel } from "../model/constant.js";
import { LogData } from "./LoggerPublisher.js";
import { LoggerSubscriber } from "./LoggerSubscriber.js";

@injectable()
export class ConsoleLoggerSubscriber implements LoggerSubscriber {
  constructor(
    @inject(configModuleTypes.Config) private readonly config: Config,
  ) {}

  private canLog(level: number): boolean {
    return level <= this.config.logLevel;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const colorByLevel = {
      [LOG_LEVELS.debug]: chalk.cyan,
      [LOG_LEVELS.info]: chalk.green,
      [LOG_LEVELS.warn]: chalk.yellow,
      [LOG_LEVELS.error]: chalk.red,
      [LOG_LEVELS.fatal]: chalk.bgRed,
    };

    const color = colorByLevel[level];

    if (!color) {
      return chalk.white(message);
    }

    return color(message);
  }

  log(level: LogLevel, message: string, data: LogData): void | Promise<void> {
    if (!this.canLog(level)) {
      return;
    }

    const tag = `[${data.tag}]`;

    console.group(this.formatMessage(level, `${tag}: ${data.timestamp}`));
    switch (level) {
      case LOG_LEVELS.debug:
        console.debug(this.formatMessage(level, message), data.data);
        break;
      case LOG_LEVELS.info:
        console.info(this.formatMessage(level, message), data.data);
        break;
      case LOG_LEVELS.warn:
        console.warn(this.formatMessage(level, message), data.data);
        break;
      case LOG_LEVELS.error:
      case LOG_LEVELS.fatal:
        console.error(this.formatMessage(level, message), data.data);
        break;
    }
    console.groupEnd();
  }
}
