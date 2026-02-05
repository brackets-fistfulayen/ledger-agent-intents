import { Account } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { CoreContext } from '../../context/core-context';
import { Navigation } from '../../shared/navigation';
export declare class AccountTokenController implements ReactiveController {
    private readonly host;
    private readonly core;
    private readonly navigation;
    account: Account | null;
    constructor(host: ReactiveControllerHost, core: CoreContext, navigation: Navigation);
    hostConnected(): void;
    getAccount(): void;
    handleConnect: () => void;
    selectAccount: (account?: Account | null) => void;
    close: () => void;
}
//# sourceMappingURL=account-token-controller.d.ts.map