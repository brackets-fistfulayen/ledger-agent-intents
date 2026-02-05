import {
  Account,
  LedgerButtonCore,
} from "@ledgerhq/ledger-wallet-provider-core";
import { ReactiveController, ReactiveControllerHost } from "lit";

import type { AccountItemClickEventDetail } from "./components/molecule/account-item/ledger-account-item.js";

export class LedgerButtonAppController implements ReactiveController {
  host: ReactiveControllerHost;
  readonly core: LedgerButtonCore;

  constructor(host: ReactiveControllerHost, core: LedgerButtonCore) {
    this.host = host;
    this.core = core;
    this.host.addController(this);
  }

  hostConnected() {
    this.host.requestUpdate();
    this.setupSelectedAccount();
  }

  handleAccountSelected(e: CustomEvent<AccountItemClickEventDetail>) {
    window.dispatchEvent(
      new CustomEvent<{ accounts: string[] }>(
        "ledger-provider-account-selected",
        {
          bubbles: true,
          composed: true,
          detail: { accounts: [e.detail.address] },
        },
      ),
    );
  }

  setupSelectedAccount() {
    const selectedAccount = this.core.getSelectedAccount();
    if (!selectedAccount) return;

    window.dispatchEvent(
      new CustomEvent<{ account: Account }>(
        "ledger-provider-account-selected",
        {
          bubbles: true,
          composed: true,
          detail: { account: selectedAccount },
        },
      ),
    );
  }
}
