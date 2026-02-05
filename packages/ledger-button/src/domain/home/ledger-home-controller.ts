import {
  Account,
  DetailedAccount,
} from "@ledgerhq/ledger-wallet-provider-core";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Subscription } from "rxjs";

import { CoreContext } from "../../context/core-context.js";
import { Navigation } from "../../shared/navigation.js";
import { Destinations } from "../../shared/routes.js";

export class LedgerHomeController implements ReactiveController {
  selectedAccount: DetailedAccount | undefined = undefined;
  loading = false;
  contextSubscription: Subscription | undefined = undefined;
  // Track the current fetch to avoid race conditions when switching accounts
  private currentFetchId = 0;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly core: CoreContext,
    private readonly navigation: Navigation,
    private readonly destinations: Destinations,
  ) {
    this.host.addController(this);
  }

  async getSelectedAccount() {
    // Increment fetch ID to track this specific fetch
    const fetchId = ++this.currentFetchId;

    // First, try to get the basic account from context for immediate display
    const basicAccount = this.core.getSelectedAccount();

    if (!basicAccount) {
      // No account at all - need to do full load
      this.loading = true;
      this.host.requestUpdate();

      const result = await this.core.getDetailedSelectedAccount();

      // Check if this fetch is still current
      if (this.currentFetchId !== fetchId) return;

      result.caseOf({
        Left: () => {
          this.selectedAccount = undefined;
          this.navigation.navigateTo(this.destinations.onboardingFlow);
        },
        Right: (account) => {
          this.selectedAccount = account;
        },
      });

      this.loading = false;
      this.host.requestUpdate();
      return;
    }

    // We have basic account data - show it immediately (no loading animation)
    // transactionHistory will be undefined, showing skeleton in the UI
    this.selectedAccount = {
      ...basicAccount,
      transactionHistory: undefined,
      fiatBalance: undefined,
    } as DetailedAccount;
    this.loading = false;
    this.host.requestUpdate();

    // Fetch detailed data (including transaction history) in the background
    const result = await this.core.getDetailedSelectedAccount();

    // Check if this fetch is still current (user might have switched accounts)
    if (this.currentFetchId !== fetchId) return;

    result.caseOf({
      Left: () => {
        // Keep showing what we have
      },
      Right: (account) => {
        this.selectedAccount = account;
        this.host.requestUpdate();
      },
    });
  }

  startListeningToContextChanges() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }

    this.contextSubscription = this.core
      .observeContext()
      .subscribe((_context) => {
        // Only refetch if the account actually changed
        // Compare by id (unique) or currencyId (for same address on different networks)
        const contextAccount = _context.selectedAccount;
        const currentAccount = this.selectedAccount;
        
        if (
          contextAccount?.id !== currentAccount?.id ||
          contextAccount?.currencyId !== currentAccount?.currencyId
        ) {
          this.getSelectedAccount();
        }
      });
  }

  private handleAccountsUpdated = (event: Event) => {
    const customEvent = event as CustomEvent<{ accounts: Account[] }>;
    const accounts = customEvent.detail.accounts ?? [];

    // Find and update the selected account if its balance changed
    if (this.selectedAccount) {
      const updatedAccount = accounts.find(
        (acc) => acc.id === this.selectedAccount?.id,
      );
      if (updatedAccount && updatedAccount.balance !== this.selectedAccount.balance) {
        this.selectedAccount = {
          ...this.selectedAccount,
          balance: updatedAccount.balance,
          tokens: updatedAccount.tokens,
        };
        this.host.requestUpdate();
      }
    }
  };

  hostConnected() {
    this.getSelectedAccount();
    this.startListeningToContextChanges();
    // Listen for account updates from fetchAccountsWithProgress
    window.addEventListener(
      "ledger-accounts-updated",
      this.handleAccountsUpdated,
    );
    this.host.requestUpdate();
  }

  hostDisconnected() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
    window.removeEventListener(
      "ledger-accounts-updated",
      this.handleAccountsUpdated,
    );
  }
}
