import { Either } from 'purify-ts';
import { TokenInformation } from './calTypes.js';
export interface CalDataSource {
    getTokenInformation(tokenAddress: string, currencyId: string): Promise<Either<Error, TokenInformation>>;
}
//# sourceMappingURL=CalDataSource.d.ts.map