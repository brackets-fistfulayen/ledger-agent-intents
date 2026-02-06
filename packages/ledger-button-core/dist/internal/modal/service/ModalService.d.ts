import { TrackOpenSession } from '../../event-tracking/usecase/TrackOpenSession.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
export declare class ModalService {
    private readonly trackOpenSession;
    private _open;
    private readonly logger;
    private openTracked;
    constructor(loggerFactory: LoggerPublisherFactory, trackOpenSession: TrackOpenSession);
    openModal: () => void;
    closeModal: () => void;
    onDeactivation(): void;
    get open(): boolean;
}
//# sourceMappingURL=ModalService.d.ts.map