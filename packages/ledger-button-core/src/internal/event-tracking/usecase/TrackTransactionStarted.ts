import { sha256 } from "ethers";
import { type Factory, inject, injectable } from "inversify";

import { configModuleTypes } from "../../config/configModuleTypes.js";
import { type Config } from "../../config/model/config.js";
import { contextModuleTypes } from "../../context/contextModuleTypes.js";
import type { ContextService } from "../../context/ContextService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { eventTrackingModuleTypes } from "../eventTrackingModuleTypes.js";
import {
  EventTrackingUtils,
  normalizeTransactionHash,
} from "../EventTrackingUtils.js";
import type { EventTrackingService } from "../service/EventTrackingService.js";

@injectable()
export class TrackTransactionStarted {
  private readonly logger: LoggerPublisher;
  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(eventTrackingModuleTypes.EventTrackingService)
    private readonly eventTrackingService: EventTrackingService,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
    @inject(contextModuleTypes.ContextService)
    private readonly contextService: ContextService,
  ) {
    this.logger = loggerFactory("[TrackTransactionStarted UseCase]");
  }

  async execute(rawTransaction: string): Promise<void> {
    const sessionId = this.eventTrackingService.getSessionId();
    const unsignedTransactionHash = normalizeTransactionHash(
      sha256(rawTransaction),
    );
    const context = this.contextService.getContext();
    const chainId = context.chainId.toString();
    const trustChainId = context.trustChainId;

    const event = EventTrackingUtils.createTransactionFlowInitializationEvent({
      dAppId: this.config.dAppIdentifier,
      sessionId: sessionId,
      trustChainId: trustChainId,
      unsignedTransactionHash: unsignedTransactionHash,
      chainId: chainId,
    });

    this.logger.debug("Tracking ledger sync activated event", { event });

    await this.eventTrackingService.trackEvent(event);
  }
}
