import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { tailwindElement } from "../../../tailwind-element.js";

const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .skeleton-base {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .skeleton-base::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
  }

  @keyframes skeleton-shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
`;

@customElement("ledger-skeleton")
@tailwindElement(styles)
export class LedgerSkeleton extends LitElement {
  override render() {
    return html`
      <div
        data-slot="skeleton"
        class="skeleton-base"
        role="presentation"
        aria-hidden="true"
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-skeleton": LedgerSkeleton;
  }
}
