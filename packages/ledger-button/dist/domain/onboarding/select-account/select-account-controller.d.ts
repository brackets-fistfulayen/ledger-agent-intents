import { Account } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { AccountItemClickEventDetail } from '../../../components/molecule/account-item/ledger-account-item.js';
import { CoreContext } from '../../../context/core-context.js';
import { Navigation } from '../../../shared/navigation.js';
export declare class SelectAccountController implements ReactiveController {
    private readonly host;
    private readonly core;
    private readonly navigation;
    private _accounts;
    constructor(host: ReactiveControllerHost, core: CoreContext, navigation: Navigation);
    get accounts(): Account[];
    hostConnected(): void;
    hostDisconnected(): void;
    private handleAccountsUpdated;
    getAccounts(): void;
    selectAccount(account: Account): void;
    handleAccountItemClick: (event: CustomEvent<AccountItemClickEventDetail>) => void;
    handleAccountItemShowTokensClick: (event: CustomEvent<AccountItemClickEventDetail>) => void;
    close: () => void;
}
//# sourceMappingURL=select-account-controller.d.ts.map