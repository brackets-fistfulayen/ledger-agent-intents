import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { default as PinApexDark } from "./apex/01_APEX_DARK_PIN.json";
import { default as ContinueOnLedgerApexDark } from "./apex/02_APEX_DARK_CONTINUE_ON_LEDGER.json";
import { default as PinFlexDark } from "./flex/01_EUROPA_DARK_PIN.json";
import { default as PairingFlexDark } from "./flex/02_EUROPA_DARK_PAIRING.json";
import { default as PairedSuccessFlexDark } from "./flex/03_EUROPA_DARK_PAIRED_SUCCESS.json";
import { default as ContinueOnLedgerFlexDark } from "./flex/04_EUROPA_DARK_CONTINUE_ON_LEDGER.json";
import { default as SignTransactionFlexDark } from "./flex/05_EUROPA_DARK_SIGN_TRANSACTION.json";
import { default as FrontViewFlexDark } from "./flex/06_STAX_DARK_FRONT_VIEW.json";
import { default as PinNanoSDark } from "./nanosp/01_NANO_S_DARK_PIN.json";
import { default as ContinueOnLedgerNanoSDark } from "./nanosp/02_NANO_S_DARK_CONTINUE_ON_YOUR_LEDGER.json";
import { default as PinNanoXDark } from "./nanox/01_NANO_X_DARK_PIN.json";
import { default as PairingNanoXDark } from "./nanox/02_NANO_X_DARK_PAIRING.json";
import { default as ContinueOnLedgerNanoXDark } from "./nanox/03_NANO_X_DARK_CONTINUE_ON_YOUR_LEDGER.json";
import { default as PinStaxDark } from "./stax/01_STAX_DARK_PIN.json";
import { default as PairingStaxDark } from "./stax/02_STAX_DARK_PAIRING.json";
import { default as PairedSuccessStaxDark } from "./stax/03_STAX_DARK_PAIRED_SUCCESS.json";
import { default as ContinueOnLedgerStaxDark } from "./stax/04_STAX_DARK_CONTINUE_ON_LEDGER.json";
import { default as SignTransactionStaxDark } from "./stax/05_STAX_DARK_SIGN_TRANSACTION.json";
import { default as FrontViewStaxDark } from "./stax/06_STAX_DARK_FRONT_VIEW.json";
import { type DeviceModelId } from "../../../components/atom/icon/device-icon/device-icon.js";
import { tailwindElement } from "../../../tailwind-element.js";

export type AnimationKey =
  | "pin"
  | "pairing"
  | "pairingSuccess"
  | "frontView"
  | "continueOnLedger"
  | "signTransaction";

export const animationDataMap: Record<
  DeviceModelId,
  Record<AnimationKey, object | null>
> = {
  stax: {
    pin: PinStaxDark,
    pairing: PairingStaxDark,
    pairingSuccess: PairedSuccessStaxDark,
    frontView: FrontViewStaxDark,
    continueOnLedger: ContinueOnLedgerStaxDark,
    signTransaction: SignTransactionStaxDark,
  },
  flex: {
    pin: PinFlexDark,
    pairing: PairingFlexDark,
    pairingSuccess: PairedSuccessFlexDark,
    frontView: FrontViewFlexDark,
    continueOnLedger: ContinueOnLedgerFlexDark,
    signTransaction: SignTransactionFlexDark,
  },
  nanoX: {
    pin: PinNanoXDark,
    pairing: PairingNanoXDark,
    pairingSuccess: null,
    frontView: null,
    continueOnLedger: ContinueOnLedgerNanoXDark,
    signTransaction: ContinueOnLedgerNanoXDark,
  },
  nanoS: {
    pin: PinNanoSDark,
    pairing: null,
    pairingSuccess: null,
    frontView: null,
    continueOnLedger: ContinueOnLedgerNanoSDark,
    signTransaction: ContinueOnLedgerNanoSDark,
  },
  nanoSP: {
    pin: PinNanoSDark,
    pairing: null,
    pairingSuccess: null,
    frontView: null,
    continueOnLedger: ContinueOnLedgerNanoSDark,
    signTransaction: ContinueOnLedgerNanoSDark,
  },
  apexp: {
    pin: PinApexDark,
    pairing: null,
    pairingSuccess: null,
    frontView: null,
    continueOnLedger: ContinueOnLedgerApexDark,
    signTransaction: ContinueOnLedgerApexDark,
  },
};

@customElement("ledger-device-animation")
@tailwindElement()
export class LedgerDeviceAnimation extends LitElement {
  @property({ type: String })
  modelId: DeviceModelId = "stax";

  @property({ type: String })
  animation: AnimationKey = "pin";

  @property({ type: Boolean })
  autoplay = true;

  @property({ type: Boolean })
  loop = true;

  override render() {
    const animationData = animationDataMap[this.modelId][this.animation];

    if (!animationData) {
      return html`
        <div class="lb-flex lb-h-full lb-items-center lb-justify-center">
          <ledger-lottie
            animationName="loadingSpinner"
            .autoplay=${this.autoplay}
            .loop=${this.loop}
            size="full"
          ></ledger-lottie>
        </div>
      `;
    }

    return html`
      <div class="lb-flex lb-h-full lb-items-center lb-justify-center">
        <ledger-lottie
          .animationData=${animationData}
          .autoplay=${this.autoplay}
          .loop=${this.loop}
          size="full"
        >
        </ledger-lottie>
      </div>
    `;
  }
}
