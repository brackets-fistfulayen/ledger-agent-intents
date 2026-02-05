import { Factory } from 'inversify';
import { Observable } from 'rxjs';
import { ContextEvent } from './model/ContextEvent.js';
import { ButtonCoreContext } from '../../api/model/ButtonCoreContext.js';
import { LoggerPublisher } from '../logger/service/LoggerPublisher.js';
import { ContextService } from './ContextService.js';
export declare class DefaultContextService implements ContextService {
    private readonly loggerFactory;
    private context;
    private readonly logger;
    private readonly contextSubject;
    constructor(loggerFactory: Factory<LoggerPublisher>);
    observeContext(): Observable<ButtonCoreContext>;
    getContext(): ButtonCoreContext;
    onEvent(event: ContextEvent): void;
}
//# sourceMappingURL=DefaultContextService.d.ts.map