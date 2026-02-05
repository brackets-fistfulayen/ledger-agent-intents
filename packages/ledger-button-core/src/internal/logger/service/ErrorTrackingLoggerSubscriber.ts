import { injectable } from "inversify";

import type { EventRequest } from "../../backend/model/trackEvent.js";
import type { ErrorTrackingConfig } from "../../event-tracking/config/ErrorTrackingConfig.js";
import {
  DEFAULT_ERROR_TRACKING_CONFIG,
  shouldTrackError,
} from "../../event-tracking/config/ErrorTrackingConfig.js";
import { createErrorEvent } from "../../event-tracking/ErrorTrackingUtils.js";
import { LOG_LEVELS } from "../model/constant.js";
import { LogData } from "./LoggerPublisher.js";
import { LoggerSubscriber } from "./LoggerSubscriber.js";

@injectable()
export class ErrorTrackingLoggerSubscriber implements LoggerSubscriber {
  private readonly config: ErrorTrackingConfig;
  private readonly sessionId: string | (() => string);
  private readonly dAppId: string | (() => string);
  private readonly trackEvent: (event: EventRequest) => void;

  constructor(params: {
    sessionId: string | (() => string);
    dAppId: string | (() => string);
    trackEvent: (event: EventRequest) => void;
    config?: ErrorTrackingConfig;
  }) {
    this.sessionId = params.sessionId;
    this.dAppId = params.dAppId;
    this.trackEvent = params.trackEvent;
    this.config = params.config ?? DEFAULT_ERROR_TRACKING_CONFIG;
  }

  private getSessionId(): string {
    return typeof this.sessionId === "function"
      ? this.sessionId()
      : this.sessionId;
  }

  private getDAppId(): string {
    return typeof this.dAppId === "function" ? this.dAppId() : this.dAppId;
  }

  log(level: number, _message: string, data: LogData): void {
    if (level !== LOG_LEVELS.error && level !== LOG_LEVELS.fatal) {
      return;
    }

    if (!this.config.enabled) {
      return;
    }

    const error = this.extractError(data.data);
    if (!error) {
      return;
    }

    if (this.config.useWhitelist && !shouldTrackError(error.name)) {
      return;
    }

    const errorEvent = createErrorEvent({
      error,
      sessionId: this.getSessionId(),
      dAppId: this.getDAppId(),
      severity: level === LOG_LEVELS.fatal ? "fatal" : "error",
    });

    this.trackEvent(errorEvent);
  }

  private extractError(logData?: Record<string, unknown>): Error | null {
    if (!logData) return null;

    if (logData.error instanceof Error) {
      return logData.error;
    }
    return null;
  }
}
