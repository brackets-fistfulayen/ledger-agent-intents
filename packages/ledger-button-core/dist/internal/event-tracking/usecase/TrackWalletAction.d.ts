import { Factory } from 'inversify';
import { WalletActionType } from '../../backend/model/trackEvent.js';
import { Config } from '../../config/model/config.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { EventTrackingService } from '../service/EventTrackingService.js';
export declare class TrackWalletAction {
    private readonly eventTrackingService;
    private readonly config;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, eventTrackingService: EventTrackingService, config: Config);
    trackWalletActionClicked(walletAction: WalletActionType): Promise<void>;
    trackWalletRedirectConfirmed(walletAction: WalletActionType): Promise<void>;
    trackWalletRedirectCancelled(walletAction: WalletActionType): Promise<void>;
}
//# sourceMappingURL=TrackWalletAction.d.ts.map