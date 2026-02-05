import { LedgerButtonCore } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { AccountItemClickEventDetail } from './components/molecule/account-item/ledger-account-item.js';
export declare class LedgerButtonAppController implements ReactiveController {
    host: ReactiveControllerHost;
    readonly core: LedgerButtonCore;
    constructor(host: ReactiveControllerHost, core: LedgerButtonCore);
    hostConnected(): void;
    handleAccountSelected(e: CustomEvent<AccountItemClickEventDetail>): void;
    setupSelectedAccount(): void;
}
//# sourceMappingURL=ledger-button-app-controller.d.ts.map