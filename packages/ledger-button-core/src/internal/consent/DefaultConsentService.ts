import { inject, injectable } from "inversify";

import { EventType } from "../backend/model/trackEvent.js";
import { eventTrackingModuleTypes } from "../event-tracking/eventTrackingModuleTypes.js";
import type { EventTrackingService } from "../event-tracking/service/EventTrackingService.js";
import type { UserConsent } from "../storage/model/UserConsent.js";
import { storageModuleTypes } from "../storage/storageModuleTypes.js";
import type { StorageService } from "../storage/StorageService.js";
import type { ConsentService } from "./ConsentService.js";

@injectable()
export class DefaultConsentService implements ConsentService {
  constructor(
    @inject(storageModuleTypes.StorageService)
    private readonly storageService: StorageService,
    @inject(eventTrackingModuleTypes.EventTrackingService)
    private readonly eventTrackingService: EventTrackingService,
  ) {}

  async hasConsent(): Promise<boolean> {
    const consent = await this.storageService.getUserConsent();
    return consent.map((c) => c.consentGiven).orDefault(false);
  }

  async hasRespondedToConsent(): Promise<boolean> {
    const consent = await this.storageService.getUserConsent();
    return consent.isJust();
  }

  async giveConsent(): Promise<void> {
    const consent: UserConsent = {
      consentGiven: true,
      consentDate: new Date().toISOString(),
    };

    await this.storageService.saveUserConsent(consent);

    await this.eventTrackingService.trackEvent({
      name: "Consent Given",
      type: EventType.ConsentGiven,
      data: {
        event_type: "consent_given",
        event_id: crypto.randomUUID(),
        transaction_dapp_id: "",
        timestamp_ms: Date.now(),
      },
    });
  }

  async refuseConsent(): Promise<void> {
    const consent: UserConsent = {
      consentGiven: false,
      consentDate: new Date().toISOString(),
    };

    await this.storageService.saveUserConsent(consent);
  }

  async removeConsent(): Promise<void> {
    await this.storageService.removeUserConsent();
  }

  async getConsentDetails(): Promise<UserConsent | undefined> {
    const consent = await this.storageService.getUserConsent();
    return consent.isJust() ? consent.extract() : undefined;
  }
}
