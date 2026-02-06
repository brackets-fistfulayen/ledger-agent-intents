import { TransactionHistoryItem } from '../../transaction-history/model/transactionHistoryTypes.js';
export type CloudSyncAccount = {
    id: string;
    currencyId: string;
    freshAddress: string;
    seedIdentifier: string;
    derivationMode: string;
    index: number;
};
export type CloudSyncData = {
    accounts: CloudSyncAccount[];
    accountNames: Record<string, string>;
};
export type Account = CloudSyncAccount & {
    name: string;
    ticker: string;
    balance: string | undefined;
    tokens: Token[];
};
export type Token = {
    ledgerId: string;
    ticker: string;
    name: string;
    balance: string;
    fiatBalance: FiatBalance | undefined;
};
export type FiatBalance = {
    value: string;
    currency: string;
};
export type AccountUpdate = {
    accountId: string;
    account: Account;
};
export type AccountWithFiat = Account & {
    fiatBalance: FiatBalance | undefined;
};
export type DetailedAccount = Account & {
    fiatBalance: FiatBalance | undefined;
    transactionHistory: TransactionHistoryItem[] | undefined;
};
export interface AccountService {
    getBalanceAndTokensForAccount(account: Account, withTokens: boolean): Promise<Account>;
    setAccountsFromCloudSyncData(accounts: CloudSyncData): Promise<void>;
    getAccounts(): Account[];
    setAccounts(accounts: Account[]): void;
    selectAccount(account: Account): void;
    getSelectedAccount(): Account | null;
}
//# sourceMappingURL=AccountService.d.ts.map