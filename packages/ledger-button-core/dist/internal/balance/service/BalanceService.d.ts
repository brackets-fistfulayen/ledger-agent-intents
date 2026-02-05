import { Either } from 'purify-ts';
import { Account } from '../../account/service/AccountService.js';
import { AccountBalance } from '../model/types.js';
export interface BalanceService {
    getBalanceForAccount(account: Account, withTokens: boolean): Promise<Either<Error, AccountBalance>>;
}
//# sourceMappingURL=BalanceService.d.ts.map