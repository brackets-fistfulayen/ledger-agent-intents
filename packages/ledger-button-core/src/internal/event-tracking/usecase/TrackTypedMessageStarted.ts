import { TypedData } from "@ledgerhq/device-signer-kit-ethereum";
import { type Factory, inject, injectable } from "inversify";

import { configModuleTypes } from "../../config/configModuleTypes.js";
import { type Config } from "../../config/model/config.js";
import { contextModuleTypes } from "../../context/contextModuleTypes.js";
import type { ContextService } from "../../context/ContextService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { eventTrackingModuleTypes } from "../eventTrackingModuleTypes.js";
import { EventTrackingUtils, stringToSha256 } from "../EventTrackingUtils.js";
import type { EventTrackingService } from "../service/EventTrackingService.js";

@injectable()
export class TrackTypedMessageStarted {
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
    this.logger = loggerFactory("[TrackTypedMessageStarted UseCase]");
  }

  async execute(typedData: TypedData): Promise<void> {
    const sessionId = this.eventTrackingService.getSessionId();

    const typedMessageHash = stringToSha256(JSON.stringify(typedData));
    const context = this.contextService.getContext();
    const chainId = context.chainId.toString();
    const trustChainId = context.trustChainId;

    const event = EventTrackingUtils.createTypedMessageFlowInitializationEvent({
      dAppId: this.config.dAppIdentifier,
      sessionId: sessionId,
      trustChainId: trustChainId,
      typedMessageHash: typedMessageHash,
      chainId: chainId,
    });

    this.logger.debug("Tracking typed message flow initialization event", {
      event,
    });

    await this.eventTrackingService.trackEvent(event);
  }
}
