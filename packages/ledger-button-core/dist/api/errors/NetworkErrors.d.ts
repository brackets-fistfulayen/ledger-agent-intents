import { NetworkServiceOpts } from '../../internal/network/model/types.js';
import { LedgerButtonError } from './LedgerButtonError.js';
export declare class BroadcastTransactionError extends LedgerButtonError<{
    error: Error;
}> {
    constructor(message: string, context: {
        error: Error;
    });
}
export declare class NetworkError extends LedgerButtonError<{
    status: number;
    url: string;
    options?: NetworkServiceOpts;
    body?: unknown;
}> {
    constructor(message: string, context: {
        status: number;
        url: string;
        options?: NetworkServiceOpts;
        body?: unknown;
    });
}
//# sourceMappingURL=NetworkErrors.d.ts.map