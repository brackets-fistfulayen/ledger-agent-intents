import { LedgerButtonError } from '../../../api/errors/LedgerButtonError.js';
import { DAppConfigError } from '../../dAppConfig/dAppConfigTypes.js';
export declare class FetchAccountsError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export type AccountServiceError = FetchAccountsError | DAppConfigError;
//# sourceMappingURL=error.d.ts.map