import { UserConsent } from '../storage/model/UserConsent.js';
export interface ConsentService {
    hasConsent(): Promise<boolean>;
    hasRespondedToConsent(): Promise<boolean>;
    giveConsent(): Promise<void>;
    refuseConsent(): Promise<void>;
    removeConsent(): Promise<void>;
    getConsentDetails(): Promise<UserConsent | undefined>;
}
//# sourceMappingURL=ConsentService.d.ts.map