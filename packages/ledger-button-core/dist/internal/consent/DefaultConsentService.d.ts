import { EventTrackingService } from '../event-tracking/service/EventTrackingService.js';
import { UserConsent } from '../storage/model/UserConsent.js';
import { StorageService } from '../storage/StorageService.js';
import { ConsentService } from './ConsentService.js';
export declare class DefaultConsentService implements ConsentService {
    private readonly storageService;
    private readonly eventTrackingService;
    constructor(storageService: StorageService, eventTrackingService: EventTrackingService);
    hasConsent(): Promise<boolean>;
    hasRespondedToConsent(): Promise<boolean>;
    giveConsent(): Promise<void>;
    refuseConsent(): Promise<void>;
    removeConsent(): Promise<void>;
    getConsentDetails(): Promise<UserConsent | undefined>;
}
//# sourceMappingURL=DefaultConsentService.d.ts.map