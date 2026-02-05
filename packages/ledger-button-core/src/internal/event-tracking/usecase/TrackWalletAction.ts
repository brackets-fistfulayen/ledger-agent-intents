import { type Factory, inject, injectable } from "inversify";

import { type WalletActionType } from "../../backend/model/trackEvent.js";
import { configModuleTypes } from "../../config/configModuleTypes.js";
import { type Config } from "../../config/model/config.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { eventTrackingModuleTypes } from "../eventTrackingModuleTypes.js";
import { EventTrackingUtils } from "../EventTrackingUtils.js";
import type { EventTrackingService } from "../service/EventTrackingService.js";

@injectable()
export class TrackWalletAction {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(eventTrackingModuleTypes.EventTrackingService)
    private readonly eventTrackingService: EventTrackingService,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {
    this.logger = loggerFactory("[TrackWalletAction UseCase]");
  }

  async trackWalletActionClicked(walletAction: WalletActionType): Promise<void> {
    const sessionId = this.eventTrackingService.getSessionId();

    const event = EventTrackingUtils.createWalletActionClickedEvent({
      dAppId: this.config.dAppIdentifier,
      sessionId: sessionId,
      walletAction: walletAction,
    });

    this.logger.debug("Tracking wallet action clicked event", { event });

    await this.eventTrackingService.trackEvent(event);
  }

  async trackWalletRedirectConfirmed(
    walletAction: WalletActionType,
  ): Promise<void> {
    const sessionId = this.eventTrackingService.getSessionId();

    const event = EventTrackingUtils.createWalletRedirectConfirmedEvent({
      dAppId: this.config.dAppIdentifier,
      sessionId: sessionId,
      walletAction: walletAction,
    });

    this.logger.debug("Tracking wallet redirect confirmed event", { event });

    await this.eventTrackingService.trackEvent(event);
  }

  async trackWalletRedirectCancelled(
    walletAction: WalletActionType,
  ): Promise<void> {
    const sessionId = this.eventTrackingService.getSessionId();

    const event = EventTrackingUtils.createWalletRedirectCancelledEvent({
      dAppId: this.config.dAppIdentifier,
      sessionId: sessionId,
      walletAction: walletAction,
    });

    this.logger.debug("Tracking wallet redirect cancelled event", { event });

    await this.eventTrackingService.trackEvent(event);
  }
}
