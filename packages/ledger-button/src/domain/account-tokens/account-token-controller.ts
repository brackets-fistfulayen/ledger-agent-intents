import { Account } from "@ledgerhq/ledger-wallet-provider-core";
import { ReactiveController, ReactiveControllerHost } from "lit";

import { CoreContext } from "../../context/core-context";
import { Navigation } from "../../shared/navigation";
import { RootNavigationComponent } from "../../shared/root-navigation";

export class AccountTokenController implements ReactiveController {
  account: Account | null = null;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly core: CoreContext,
    private readonly navigation: Navigation,
    // NOTE: Used for testing purposes only
    // we should not fetch the accounts again on this screen
  ) {
    this.host.addController(this);
  }

  hostConnected() {
    this.getAccount();
  }

  getAccount() {
    const targetId = this.core.getPendingAccountId();
    if (!targetId) {
      this.navigation.navigateBack();
      return;
    }
    this.account = this.core
      .getAccounts()
      .find((acc) => acc.id === targetId) as Account | null;

    // If the account is not found, navigate back to account list
    if (!this.account) {
      this.navigation.navigateBack();
    }

    this.host.requestUpdate();
  }

  handleConnect = () => {
    this.selectAccount(this.account);
    const selectedAccount = this.core.getSelectedAccount();
    window.dispatchEvent(
      new CustomEvent<{ account: Account; status: "success" }>(
        "ledger-internal-account-selected",
        {
          bubbles: true,
          composed: true,
          detail: { account: selectedAccount as Account, status: "success" },
        },
      ),
    );
    this.close();
  };

  selectAccount = (account?: Account | null) => {
    if (!account) {
      return;
    }

    if (this.navigation.host instanceof RootNavigationComponent) {
      this.navigation.host.selectAccount(account);
    }
  };

  close = () => {
    if (this.navigation.host instanceof RootNavigationComponent) {
      this.navigation.host.closeModal();
      this.host.requestUpdate();
    }
  };
}
