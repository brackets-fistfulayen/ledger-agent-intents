import { Factory } from 'inversify';
import { Either } from 'purify-ts';
import { AccountNotFoundError, NoSelectedAccountError } from '../../../api/errors/LedgerSyncErrors.js';
import { ContextService } from '../../context/ContextService.js';
import { LedgerSyncService } from '../../ledgersync/service/LedgerSyncService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { DetailedAccount } from '../service/AccountService.js';
import { FetchAccountsUseCase } from './fetchAccountsUseCase.js';
import { HydrateAccountWithBalanceUseCase } from './HydrateAccountWithBalanceUseCase.js';
import { HydrateAccountWithFiatUseCase } from './hydrateAccountWithFiatUseCase.js';
import { HydrateAccountWithTxHistoryUseCase } from './hydrateAccountWithTxHistoryUseCase.js';
export type AccountError = NoSelectedAccountError | AccountNotFoundError;
export declare class FetchSelectedAccountUseCase {
    private readonly contextService;
    private readonly ledgerSyncService;
    private readonly fetchAccountsUseCase;
    private readonly hydrateWithBalanceUseCase;
    private readonly hydrateWithFiatUseCase;
    private readonly hydrateWithTxHistoryUseCase;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, contextService: ContextService, ledgerSyncService: LedgerSyncService, fetchAccountsUseCase: FetchAccountsUseCase, hydrateWithBalanceUseCase: HydrateAccountWithBalanceUseCase, hydrateWithFiatUseCase: HydrateAccountWithFiatUseCase, hydrateWithTxHistoryUseCase: HydrateAccountWithTxHistoryUseCase);
    execute(): Promise<Either<AccountError, DetailedAccount>>;
    private getSelectedAccountFromContext;
    private hydrateDetailedAccount;
    private mergeHydrations;
    private emitAccountChangedEvent;
}
//# sourceMappingURL=fetchSelectedAccountUseCase.d.ts.map