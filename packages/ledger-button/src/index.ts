import "./styles.css";
import "./components/index.js";
import "./ledger-button-app.js";

import {
  type EIP6963ProviderInfo,
  LedgerButtonCore,
  type LedgerButtonCoreOptions,
} from "@ledgerhq/ledger-wallet-provider-core";
import { v4 as uuidv4 } from "uuid";

import { FloatingButtonPosition } from "./components/index.js";
import { setupFloatingButton } from "./utils/setup-floating-button.js";
import { LedgerEIP1193Provider } from "./web3-provider/LedgerEIP1193Provider.js";
import { LedgerButtonApp } from "./ledger-button-app.js";

export type {
  EIP1193Provider,
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from "@ledgerhq/ledger-wallet-provider-core";

export { LedgerEIP1193Provider };
export type { WalletTransactionFeature } from "./components/molecule/wallet-actions/ledger-wallet-actions.js";

import type { WalletTransactionFeature } from "./components/molecule/wallet-actions/ledger-wallet-actions.js";

let core: LedgerButtonCore | null = null;

export type InitializeLedgerProviderOptions = LedgerButtonCoreOptions & {
  target?: HTMLElement;
  floatingButtonPosition?: FloatingButtonPosition | false;
  floatingButtonTarget?: HTMLElement | string;
  walletTransactionFeatures?: WalletTransactionFeature[];
};

export function initializeLedgerProvider({
  apiKey,
  dAppIdentifier,
  dmkConfig = undefined,
  target = document.body,
  loggerLevel = "info",
  environment,
  floatingButtonPosition = "bottom-right",
  floatingButtonTarget,
  walletTransactionFeatures,
  devConfig = {
    stub: {
      base: false,
      account: false,
      device: false,
      web3Provider: false,
      dAppConfig: false,
    },
  },
}: InitializeLedgerProviderOptions): () => void {
  const existingApp = target.querySelector("ledger-button-app");
  if (existingApp) {
    console.log("Ledger button app already exists");
    return () => void 0;
  }
  // NOTE: `core` should be the same instance as the one injected in the lit app
  // so we either need to instanciate it here and give it to the lit app or retrieve it from it
  if (!core) {
    core = new LedgerButtonCore({
      apiKey,
      dAppIdentifier,
      dmkConfig,
      loggerLevel,
      environment,
      devConfig,
    });
  }

  const isSupported = core.isSupported();

  if (!isSupported) {
    // NOTE: If the environment is not supported, we don't need to do anything
    // and we can just return a noop function
    return () => {
      // noop
    };
  }

  let icon: string;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme:dark)").matches
  ) {
    //White icon
    icon =
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMTQ5LjA0IDEwNDkuNDciIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTkwLjA2LDY2OS4zNXYxOTAuMDZoMjg5LjIydi00Mi4xNEgyMzIuMjFWNjY5LjM1SDE5MC4wNnogTTkxNi44Myw2NjkuMzV2MTQ3LjkySDY2OS43NXY0Mi4xNGgyODkuMjJWNjY5LjM1CglIOTE2LjgzeiBNNDc5LjcsMzgwLjEydjI4OS4yMmgxOTAuMDV2LTM4LjAxSDUyMS44NFYzODAuMTJINDc5Ljd6IE0xOTAuMDYsMTkwLjA2djE5MC4wNmg0Mi4xNFYyMzIuMjFoMjQ3LjA4di00Mi4xNEgxOTAuMDZ6CgkgTTY2OS43NSwxOTAuMDZ2NDIuMTRoMjQ3LjA4djE0Ny45Mmg0Mi4xNFYxOTAuMDZINjY5Ljc1eiIvPgo8L3N2Zz4K";
  } else {
    //Black icon
    icon =
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMTQ5LjA0IDEwNDkuNDciIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiMwMDAwMDA7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTkwLjA2LDY2OS4zNXYxOTAuMDZoMjg5LjIydi00Mi4xNEgyMzIuMjFWNjY5LjM1SDE5MC4wNnogTTkxNi44Myw2NjkuMzV2MTQ3LjkySDY2OS43NXY0Mi4xNGgyODkuMjJWNjY5LjM1CglIOTE2LjgzeiBNNDc5LjcsMzgwLjEydjI4OS4yMmgxOTAuMDV2LTM4LjAxSDUyMS44NFYzODAuMTJINDc5Ljd6IE0xOTAuMDYsMTkwLjA2djE5MC4wNmg0Mi4xNFYyMzIuMjFoMjQ3LjA4di00Mi4xNEgxOTAuMDZ6CgkgTTY2OS43NSwxOTAuMDZ2NDIuMTRoMjQ3LjA4djE0Ny45Mmg0Mi4xNFYxOTAuMDZINjY5Ljc1eiIvPgo8L3N2Zz4K";
  }

  const info: EIP6963ProviderInfo = {
    uuid: uuidv4(),
    name: "Ledger Wallet",
    icon: icon,
    rdns: "com.ledger.wallet.provider",
  };

  const app = document.createElement("ledger-button-app") as LedgerButtonApp;
  app.core = core;
  app.walletTransactionFeatures = walletTransactionFeatures;
  app.classList.add("ledger-wallet-provider");

  const { floatingButton } = setupFloatingButton(
    app,
    floatingButtonTarget,
    floatingButtonPosition,
  );

  if (target) {
    target.appendChild(app);
  } else {
    document.body.appendChild(app);
  }

  const provider = new LedgerEIP1193Provider(core, app);

  const announceProviderListener = () => {
    window.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail: Object.freeze({ info, provider }),
      }),
    );
  };

  window.addEventListener("eip6963:requestProvider", announceProviderListener);

  window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", {
      detail: Object.freeze({ info, provider }),
    }),
  );

  // Cleanup function
  return () => {
    if (app.parentNode) {
      app.parentNode.removeChild(app);
    }

    if (floatingButton && floatingButton.parentNode) {
      floatingButton.parentNode.removeChild(floatingButton);
    }

    window.removeEventListener(
      "eip6963:requestProvider",
      announceProviderListener,
    );

    // Reset core so new config can be applied on next initialization
    core = null;
  };
}
