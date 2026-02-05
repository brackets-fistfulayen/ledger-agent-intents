import { Account } from '../../../internal/account/service/AccountService.js';
export type AccountDbModel = {
    address: string;
    currencyId: string;
    derivationMode: string;
    index: number;
};
export declare function mapToAccountDbModel(account: Account): AccountDbModel;
//# sourceMappingURL=accountDbModel.d.ts.map