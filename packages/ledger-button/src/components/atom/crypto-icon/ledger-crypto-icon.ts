import { cva } from "class-variance-authority";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { tailwindElement } from "../../../tailwind-element.js";
import cryptoIconMap from "./map.json";

export type CryptoIconSize = "small" | "medium" | "large";
export type CryptoIconVariant = "rounded" | "square";

export interface LedgerCryptoIconAttributes {
  ledgerId: string;
  ticker: string;
  size?: CryptoIconSize;
  variant?: CryptoIconVariant;
}

const cryptoIconVariants = cva(
  [
    "position-relative lb-flex lb-items-center lb-justify-center lb-overflow-hidden",
  ],
  {
    variants: {
      size: {
        small: ["lb-h-20 lb-w-20"],
        medium: ["lb-h-32 lb-w-32"],
        large: ["lb-h-48 lb-w-48"],
      },
      variant: {
        rounded: ["lb-rounded-full"],
        square: [],
      },
    },
    compoundVariants: [
      {
        variant: "square",
        size: "small",
        class: ["lb-rounded-xs"],
      },
      {
        variant: "square",
        size: "medium",
        class: ["lb-rounded-sm"],
      },
      {
        variant: "square",
        size: "large",
        class: ["lb-rounded-md"],
      },
    ],
    defaultVariants: {
      size: "large",
      variant: "rounded",
    },
  },
);

const CRYPTO_ICONS_BASE_URL = "https://crypto-icons.ledger.com/";

@customElement("ledger-crypto-icon")
@tailwindElement()
export class LedgerCryptoIcon extends LitElement {
  @property({ type: String, attribute: "ledger-id" })
  ledgerId = "";

  @property({ type: String, attribute: "ticker" })
  ticker = "";

  @property({ type: String, attribute: "alt" })
  alt = "";

  @property({ type: String })
  size: CryptoIconSize = "large";

  @property({ type: String })
  variant: CryptoIconVariant = "rounded";

  private get iconClasses() {
    return cryptoIconVariants({ size: this.size, variant: this.variant });
  }

  private getCryptoIconUrl(ledgerId: string): string | null {
    if (ledgerId in cryptoIconMap) {
      const cryptoData = cryptoIconMap[ledgerId as keyof typeof cryptoIconMap];
      if (cryptoData && cryptoData.icon) {
        return `${CRYPTO_ICONS_BASE_URL}${cryptoData.icon}`;
      }
    }

    return null;
  }

  private renderFallback() {
    return html`
      <div class="${this.iconClasses} lb-bg-grey-500">${this.alt}</div>
    `;
  }

  private renderCryptoIcon(iconUrl: string) {
    return html`
      <div class="${this.iconClasses}" style="position: relative;">
        <img
          class="token-icon lb-block lb-h-full lb-w-full lb-bg-active lb-object-cover"
          src=${iconUrl}
          alt=${this.alt}
        />
      </div>
    `;
  }

  override render() {
    if (!this.ledgerId) {
      return this.renderFallback();
    }

    const iconForIdUrl = this.getCryptoIconUrl(this.ledgerId);

    if (iconForIdUrl) {
      return this.renderCryptoIcon(iconForIdUrl);
    }

    const iconForTickerUrl = `${CRYPTO_ICONS_BASE_URL}${this.ticker}.png`;
    return this.renderCryptoIcon(iconForTickerUrl);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-crypto-icon": LedgerCryptoIcon;
  }
}

export default LedgerCryptoIcon;
