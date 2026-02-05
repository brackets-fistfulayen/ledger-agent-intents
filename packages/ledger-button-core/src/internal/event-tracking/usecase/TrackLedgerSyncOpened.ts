import { type Factory, inject, injectable } from "inversify";

import { configModuleTypes } from "../../config/configModuleTypes.js";
import { type Config } from "../../config/model/config.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { eventTrackingModuleTypes } from "../eventTrackingModuleTypes.js";
import { EventTrackingUtils } from "../EventTrackingUtils.js";
import type { EventTrackingService } from "../service/EventTrackingService.js";

@injectable()
export class TrackLedgerSyncOpened {
  private readonly logger: LoggerPublisher;
  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(eventTrackingModuleTypes.EventTrackingService)
    private readonly eventTrackingService: EventTrackingService,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {
    this.logger = loggerFactory("[TrackLedgerSyncOpened UseCase]");
  }

  async execute(): Promise<void> {
    const sessionId = this.eventTrackingService.getSessionId();
    const event = EventTrackingUtils.createOpenLedgerSyncEvent({
      dAppId: this.config.dAppIdentifier,
      sessionId: sessionId,
    });
    this.logger.debug("Tracking ledger sync opened event", { event });
    await this.eventTrackingService.trackEvent(event);
  }
}
