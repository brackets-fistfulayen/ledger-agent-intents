import { BroadcastedTransactionResult } from '../../../api/model/signing/SignedTransaction.js';
import { Config } from '../../config/model/config.js';
import { ContextService } from '../../context/ContextService.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { EventTrackingService } from '../service/EventTrackingService.js';
export declare class TrackTransactionCompleted {
    private readonly eventTrackingService;
    private readonly config;
    private readonly contextService;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, eventTrackingService: EventTrackingService, config: Config, contextService: ContextService);
    execute(rawTransaction: string, txResult: BroadcastedTransactionResult): Promise<void>;
}
//# sourceMappingURL=TrackTransactionCompleted.d.ts.map