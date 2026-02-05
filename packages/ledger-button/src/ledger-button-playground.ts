import "./components/index.js";
import "./context/core-context.js";
import "./context/language-context.js";
import "./ledger-button-app.js";

import {
  EIP1193Provider,
  EIP6963AnnounceProviderEvent,
  EIP6963RequestProviderEvent,
} from "@ledgerhq/ledger-wallet-provider-core";
import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import { initializeLedgerProvider } from "./index.js";

@customElement("ledger-button-playground")
export class LedgerButtonPlayground extends LitElement {
  @property({ type: String })
  demoMode: "onboarding" | "signTransaction" = "onboarding";

  @query("#app")
  private app!: HTMLDivElement;

  @property({ attribute: false })
  private web3Provider?: EIP1193Provider;

  selectedAccount?: string;

  override connectedCallback() {
    super.connectedCallback();

    window.addEventListener(
      "eip6963:announceProvider",
      this.handleAnnounceProvider,
    );
  }

  handleAnnounceProvider = (e: Event) => {
    const { provider /*, info */ } = (e as EIP6963AnnounceProviderEvent).detail;
    this.web3Provider = provider;
  };

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "eip6963:announceProvider",
      this.handleAnnounceProvider,
    );
  }

  override firstUpdated() {
    this.createApp();
    window.dispatchEvent(
      new Event("eip6963:requestProvider", {
        bubbles: true,
        composed: true,
      }) as EIP6963RequestProviderEvent,
    );
  }

  createApp() {
    initializeLedgerProvider({
      dAppIdentifier: "ledger-button-playground",
      apiKey:
        "1e55ba3959f4543af24809d9066a2120bd2ac9246e626e26a1ff77eb109ca0e5",
      devConfig: {
        stub: {
          base: true,
          device: false,
          web3Provider: true,
          dAppConfig: false,
        },
      },
      target: this.app,
    });
  }

  requestAccounts = async () => {
    if (!this.web3Provider) {
      return;
    }

    const accounts = await this.web3Provider.request({
      method: "eth_requestAccounts",
      params: [],
    });

    if (Array.isArray(accounts) && accounts.length > 0) {
      this.selectedAccount = accounts[0];
      this.requestUpdate();
    }
  };

  sendTransaction = async () => {
    console.log("sendTransaction", this.selectedAccount);
  };

  override render() {
    return html`
      <div id="app"></div>
      <button @click=${this.requestAccounts}>Request Accounts</button>
      ${this.selectedAccount
        ? html`
            <p>Selected Account: ${this.selectedAccount}</p>
            <button @click=${this.sendTransaction}>Send Transaction</button>
          `
        : null}
    `;
  }
}
