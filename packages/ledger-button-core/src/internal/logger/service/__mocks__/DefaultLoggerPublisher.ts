import { LoggerSubscriber } from "../LoggerSubscriber.js";

export class DefaultLoggerPublisher {
  constructor(
    readonly subscribers: LoggerSubscriber[],
    readonly tag: string,
  ) {}
  error = vi.fn();
  warn = vi.fn();
  info = vi.fn();
  debug = vi.fn();
  fatal = vi.fn();
}
