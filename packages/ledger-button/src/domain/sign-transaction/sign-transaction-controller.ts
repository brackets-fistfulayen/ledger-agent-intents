import {
  BlindSigningDisabledError,
  BroadcastTransactionError,
  IncorrectSeedError,
  isBroadcastedTransactionResult,
  isSignedMessageOrTypedDataResult,
  isSignedTransactionResult,
  type SignedResults,
  type SignFlowStatus,
  type SignPersonalMessageParams,
  type SignRawTransactionParams,
  type SignTransactionParams,
  type SignTypedMessageParams,
  type UserInteractionNeeded,
  UserRejectedTransactionError,
} from "@ledgerhq/ledger-wallet-provider-core";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Subscription } from "rxjs";

import { AnimationKey } from "../../components/index.js";
import { type CoreContext } from "../../context/core-context.js";
import { LanguageContext } from "../../context/language-context.js";
import { Navigation } from "../../shared/navigation.js";
import { RootNavigationComponent } from "../../shared/root-navigation.js";

export type ScreenState =
  | {
      screen: "signing";
      deviceAnimation: Omit<
        AnimationKey,
        "pairing" | "pairingSuccess" | "frontView"
      >;
    }
  | { screen: "success"; status: StatusState }
  | { screen: "error"; status: StatusState };

export type StatusState = {
  message: string;
  title: string;
  cta1: { label: string; action: () => void | Promise<void> };
  cta2?: { label: string; action: () => void | Promise<void> };
};

export class SignTransactionController implements ReactiveController {
  host: ReactiveControllerHost;
  private transactionSubscription?: Subscription;
  private currentTransaction?:
    | SignTransactionParams
    | SignRawTransactionParams
    | SignTypedMessageParams
    | SignPersonalMessageParams;
  result?: SignedResults;

  state: ScreenState = {
    screen: "signing",
    deviceAnimation: "signTransaction",
  };

  constructor(
    host: ReactiveControllerHost,
    private readonly core: CoreContext,
    private readonly navigation: Navigation,
    private readonly lang: LanguageContext,
  ) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    this.host.requestUpdate();
  }

  hostDisconnected() {
    this.transactionSubscription?.unsubscribe();
  }

  private mapUserInteractionToDeviceAnimation(
    interaction: UserInteractionNeeded,
  ): Omit<AnimationKey, "pairing" | "pairingSuccess" | "frontView"> {
    switch (interaction) {
      case "unlock-device":
        return "pin";
      case "allow-secure-connection":
      case "confirm-open-app":
      case "allow-list-apps":
      case "web3-checks-opt-in":
        return "continueOnLedger";
      case "sign-transaction":
      default:
        return "signTransaction";
    }
  }

  startSigning(
    transactionParams:
      | SignTransactionParams
      | SignRawTransactionParams
      | SignTypedMessageParams
      | SignPersonalMessageParams,
  ) {
    this.currentTransaction = transactionParams;

    if (this.transactionSubscription) {
      this.transactionSubscription.unsubscribe();
    }

    this.transactionSubscription = this.core.sign(transactionParams).subscribe({
      next: (result: SignFlowStatus) => {
        switch (result.status) {
          case "success":
            if (result.data) {
              if (
                isSignedTransactionResult(result.data) ||
                isSignedMessageOrTypedDataResult(result.data)
              ) {
                window.dispatchEvent(
                  new CustomEvent<{ status: "success"; data: SignedResults }>(
                    "ledger-internal-sign",
                    {
                      bubbles: true,
                      composed: true,
                      detail: { status: "success", data: result.data },
                    },
                  ),
                );
              }

              this.state = this.mapSuccessToState(result.data);
              this.host.requestUpdate();
              break;
            }
            break;
          case "user-interaction-needed": {
            //TODO handle mapping for user interaction needed + update DeviceAnimation component regarding these interactions
            //Interactions: unlock-device, allow-secure-connection, confirm-open-app, sign-transaction, allow-list-apps, web3-checks-opt-in
            const animation = this.mapUserInteractionToDeviceAnimation(
              result.interaction,
            );
            this.state = { screen: "signing", deviceAnimation: animation };
            this.host.requestUpdate();
            break;
          }
          case "error":
            this.mapErrors(result.error);
            break;
        }

        this.host.requestUpdate();
      },
      error: (error: Error) => {
        this.mapErrors(error);
        this.host.requestUpdate();
      },
    });
  }

  private getDeviceName() {
    const device = this.core.getConnectedDevice();
    return device?.name || device?.modelId
      ? this.lang.currentTranslation.common.device.model[device.modelId]
      : this.lang.currentTranslation.common.device.model.fallback;
  }

  private mapSuccessToState(data: SignedResults): ScreenState {
    const lang = this.lang.currentTranslation;

    let cta2 = undefined;
    if (isBroadcastedTransactionResult(data)) {
      const scanWebsiteUrl = this.getScanWebsiteUrl(
        this.core.getChainId(),
        data.hash,
      );
      if (scanWebsiteUrl) {
        cta2 = {
          label: lang.signTransaction?.success?.viewTransaction,
          action: () => this.viewTransactionDetails(scanWebsiteUrl),
        };
      }
    }

    if (isSignedMessageOrTypedDataResult(data)) {
      return {
        screen: "success",
        status: {
          message: lang.signMessage?.success?.description,
          title: lang.signMessage?.success?.title,
          cta1: {
            label: lang.common.button.close,
            action: async () => {
              this.close();
            },
          },
          cta2,
        },
      };
    }
    return {
      screen: "success",
      status: {
        message: lang.signTransaction?.success?.description,
        title: lang.signTransaction?.success?.title,
        cta1: {
          label: lang.common.button.close,
          action: async () => {
            this.close();
          },
        },
        cta2,
      },
    };
  }

  private mapErrors(error: unknown) {
    const lang = this.lang.currentTranslation;
    switch (true) {
      case error instanceof IncorrectSeedError: {
        const selectedAccount = this.core.getSelectedAccount();
        const deviceName = this.getDeviceName();

        let accountName = "";
        if (selectedAccount) {
          if (selectedAccount.name) {
            accountName = selectedAccount.name;
          } else {
            accountName =
              selectedAccount.freshAddress.slice(0, 6) +
              "..." +
              selectedAccount.freshAddress.slice(-4);
          }
        }

        const message = lang.error.device.IncorrectSeed.description
          .replace("{device}", deviceName)
          .replace("{account}", accountName || "");

        this.state = {
          screen: "error",
          status: {
            title: lang.error.device.IncorrectSeed.title,
            message,
            cta1: {
              label: lang.error.device.IncorrectSeed.cta1,
              action: async () => {
                await this.core.disconnectFromDevice();
                this.host.requestUpdate();
              },
            },
            cta2: {
              label: lang.error.device.IncorrectSeed.cta2,
              action: async () => {
                window.dispatchEvent(
                  new CustomEvent("ledger-internal-sign", {
                    bubbles: true,
                    composed: true,
                    detail: {
                      status: "error",
                      error: error,
                    },
                  }),
                );
                this.close();
              },
            },
          },
        };
        break;
      }
      case error instanceof BlindSigningDisabledError: {
        this.state = {
          screen: "error",
          status: {
            title: lang.error.device.BlindSigningDisabled.title,
            message: lang.error.device.BlindSigningDisabled.description,
            cta1: {
              label: lang.error.device.BlindSigningDisabled.cta1,
              action: async () => {
                if (!this.currentTransaction) {
                  return;
                }
                this.startSigning(this.currentTransaction);
                this.host.requestUpdate();
              },
            },
            cta2: {
              label: lang.error.device.BlindSigningDisabled.cta2,
              action: async () => {
                window.dispatchEvent(
                  new CustomEvent("ledger-internal-sign", {
                    bubbles: true,
                    composed: true,
                    detail: {
                      status: "error",
                      error: error,
                    },
                  }),
                );
                this.close();
              },
            },
          },
        };
        break;
      }
      case error instanceof BroadcastTransactionError: {
        this.state = {
          screen: "error",
          status: {
            title: lang.error.network.BroadcastTransactionError.title,
            message: lang.error.network.BroadcastTransactionError.description,
            cta1: {
              label: lang.error.network.BroadcastTransactionError.cta1,
              action: async () => {
                if (!this.currentTransaction) {
                  return;
                }
                this.startSigning(this.currentTransaction);
                this.host.requestUpdate();
              },
            },
          },
        };
        break;
      }
      case error instanceof UserRejectedTransactionError: {
        const deviceName = this.getDeviceName();
        const isTx = isSignedTransactionResult(this.currentTransaction);
        this.state = {
          screen: "error",
          status: {
            title: isTx
              ? lang.error.device.UserRejectedTransaction.title
              : lang.error.device.UserRejectedMessage.title,
            message: isTx
              ? lang.error.device.UserRejectedTransaction.description.replace(
                  "{device}",
                  deviceName,
                )
              : lang.error.device.UserRejectedMessage.description.replace(
                  "{device}",
                  deviceName,
                ),
            cta1: {
              label: isTx
                ? lang.error.device.UserRejectedTransaction.cta1
                : lang.error.device.UserRejectedMessage.cta1,
              action: async () => {
                window.dispatchEvent(
                  new CustomEvent("ledger-internal-sign", {
                    bubbles: true,
                    composed: true,
                    detail: {
                      status: "error",
                      error: error,
                    },
                  }),
                );
                this.close();
              },
            },
            cta2: {
              label: isTx
                ? lang.error.device.UserRejectedTransaction.cta2
                : lang.error.device.UserRejectedMessage.cta2,
              action: async () => {
                if (!this.currentTransaction) {
                  return;
                }
                this.state = {
                  screen: "signing",
                  deviceAnimation: "continueOnLedger",
                };
                this.startSigning(this.currentTransaction);
                this.host.requestUpdate();
              },
            },
          },
        };
        break;
      }
      default: {
        this.state = {
          screen: "error",
          status: {
            title: lang.error.generic.sign.title,
            message: lang.error.generic.sign.description,
            cta1: {
              label: lang.error.generic.sign.cta1,
              action: async () => {
                if (!this.currentTransaction) {
                  return;
                }
                this.startSigning(this.currentTransaction);
                this.host.requestUpdate();
              },
            },
            cta2: {
              label: lang.error.generic.sign.cta2,
              action: async () => {
                window.dispatchEvent(
                  new CustomEvent("ledger-internal-sign", {
                    bubbles: true,
                    composed: true,
                    detail: {
                      status: "error",
                      error: error,
                    },
                  }),
                );
                this.close();
              },
            },
          },
        };
        break;
      }
    }
  }
  getScanWebsiteUrl(chainId: number, transactionHash: string): string | null {
    switch (chainId) {
      case 1:
        return `https://etherscan.io/tx/${transactionHash}`;
      case 10:
        return `https://optimistic.etherscan.io/tx/${transactionHash}`;
      case 137:
        return `https://polygonscan.com/tx/${transactionHash}`;
      case 42161:
        return `https://arbiscan.io/tx/${transactionHash}`;
      case 8453:
        return `https://basescan.org/tx/${transactionHash}`;
      case 56:
        return `https://bscscan.com/tx/${transactionHash}`;
      case 59144:
        return `https://lineascan.build/tx/${transactionHash}`;
      case 146:
        return `https://sonicscan.org/tx/${transactionHash}`;
      case 324:
        return `https://zkscan.io/explorer/transactions/${transactionHash}`;
      case 43114:
        return `https://snowtrace.io/tx/${transactionHash}?chainid=43114`;
      default:
        return null;
    }
  }

  viewTransactionDetails(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
    this.close();
  }

  close = () => {
    if (this.navigation.host instanceof RootNavigationComponent) {
      this.navigation.host.closeModal();
      this.host.requestUpdate();
    }
  };
}
