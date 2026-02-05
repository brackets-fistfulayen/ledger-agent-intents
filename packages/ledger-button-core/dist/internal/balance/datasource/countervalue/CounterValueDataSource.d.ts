import { Either } from 'purify-ts';
import { CounterValueResult } from './counterValueTypes.js';
export interface CounterValueDataSource {
    getCounterValues(ledgerIds: string[], targetCurrency: string): Promise<Either<Error, CounterValueResult[]>>;
}
//# sourceMappingURL=CounterValueDataSource.d.ts.map