import { type Factory, inject, injectable } from "inversify";

import type { Account } from "../../account/service/AccountService.js";
import { getChainIdFromCurrencyId } from "../../blockchain/evm/chainUtils.js";
import { configModuleTypes } from "../../config/configModuleTypes.js";
import { type Config } from "../../config/model/config.js";
import { contextModuleTypes } from "../../context/contextModuleTypes.js";
import { type ContextService } from "../../context/ContextService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { eventTrackingModuleTypes } from "../eventTrackingModuleTypes.js";
import { EventTrackingUtils } from "../EventTrackingUtils.js";
import type { EventTrackingService } from "../service/EventTrackingService.js";

@injectable()
export class TrackOnboarding {
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
    this.logger = loggerFactory("[TrackOnboarding UseCase]");
  }

  async execute(selectedAccount: Account): Promise<void> {
    const sessionId = this.eventTrackingService.getSessionId();
    const trustChainId = this.contextService.getContext().trustChainId;

    const { currencyId, balance } = selectedAccount;

    const currency = currencyId;
    const chainId = getChainIdFromCurrencyId(currencyId).toString();

    const event = EventTrackingUtils.createOnboardingEvent({
      dAppId: this.config.dAppIdentifier,
      sessionId: sessionId,
      trustChainId: trustChainId,
      accountCurrency: currency,
      accountBalance: balance ?? "", // Should always be defined when use here.
      chainId: chainId,
    });

    this.logger.debug("Tracking ledger sync activated event", { event });

    await this.eventTrackingService.trackEvent(event);
  }
}
