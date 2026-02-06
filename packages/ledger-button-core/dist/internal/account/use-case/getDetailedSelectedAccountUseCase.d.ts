import { Either } from 'purify-ts';
import { ContextService } from '../../context/ContextService.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { DetailedAccount } from '../service/AccountService.js';
import { AccountError, FetchSelectedAccountUseCase } from './fetchSelectedAccountUseCase.js';
export declare class GetDetailedSelectedAccountUseCase {
    private readonly contextService;
    private readonly fetchSelectedAccountUseCase;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, contextService: ContextService, fetchSelectedAccountUseCase: FetchSelectedAccountUseCase);
    execute(): Promise<Either<AccountError, DetailedAccount>>;
    private isSelectedAccountHydrated;
}
//# sourceMappingURL=getDetailedSelectedAccountUseCase.d.ts.map