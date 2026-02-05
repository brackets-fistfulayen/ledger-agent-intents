import { LedgerButtonCore } from "@ledgerhq/ledger-wallet-provider-core";
import { createContext, provide } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export type CoreContext = LedgerButtonCore;

export const coreContext = createContext<CoreContext>(Symbol.for("core"));

@customElement("core-provider")
export class CoreProvider extends LitElement {
  @property({ type: Object })
  coreClass?: LedgerButtonCore;

  @provide({ context: coreContext })
  @property({ attribute: false })
  public core!: CoreContext;

  override connectedCallback() {
    super.connectedCallback();

    this.core =
      this.coreClass ??
      new LedgerButtonCore({
        devConfig: {
          stub: {
            base: true,
            device: true,
            web3Provider: true,
          },
        },
      });
  }

  override render() {
    return html`<slot></slot>`;
  }
}
