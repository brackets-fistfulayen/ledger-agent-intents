import {
  DeviceActionState,
  DeviceActionStatus,
  OpenAppWithDependenciesDAInput,
  type OpenAppWithDependenciesDAState,
  OpenAppWithDependenciesDeviceAction,
  UserInteractionRequired,
} from "@ledgerhq/device-management-kit";
import {
  SignerEthBuilder,
  type SignPersonalMessageDAError,
  type SignPersonalMessageDAIntermediateValue,
  type SignPersonalMessageDAOutput,
} from "@ledgerhq/device-signer-kit-ethereum";
import { EthAppCommandError } from "@ledgerhq/device-signer-kit-ethereum/internal/app-binder/command/utils/ethAppErrors.js";
import { type Factory, inject, injectable } from "inversify";
import {
  BehaviorSubject,
  filter,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from "rxjs";

import {
  IncorrectSeedError,
  UserRejectedTransactionError,
} from "../../../api/errors/DeviceErrors.js";
import {
  GetAddressDAState,
  isGetAddressResult,
} from "../../../api/model/signing/GetAddress.js";
import {
  isSignedMessageOrTypedDataResult,
  type SignedPersonalMessageOrTypedDataResult,
} from "../../../api/model/signing/SignedTransaction.js";
import type {
  SignFlowStatus,
  SignType,
} from "../../../api/model/signing/SignFlowStatus.js";
import type { SignPersonalMessageParams } from "../../../api/model/signing/SignPersonalMessageParams.js";
import { getHexaStringFromSignature } from "../../../internal/transaction/utils/TransactionHelper.js";
import { getDerivationPath } from "../../account/AccountUtils.js";
import type { Account } from "../../account/service/AccountService.js";
import { configModuleTypes } from "../../config/configModuleTypes.js";
import { Config } from "../../config/model/config.js";
import { DAppConfig } from "../../dAppConfig/dAppConfigTypes.js";
import { dAppConfigModuleTypes } from "../../dAppConfig/di/dAppConfigModuleTypes.js";
import type { DAppConfigService } from "../../dAppConfig/service/DAppConfigService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { storageModuleTypes } from "../../storage/storageModuleTypes.js";
import type { StorageService } from "../../storage/StorageService.js";
import { deviceModuleTypes } from "../deviceModuleTypes.js";
import {
  AccountNotSelectedError,
  DeviceConnectionError,
} from "../model/errors.js";
import type { DeviceManagementKitService } from "../service/DeviceManagementKitService.js";

// TODO: Remove this once the type is exported from the package
type SignPersonalMessageDAState = DeviceActionState<
  SignPersonalMessageDAOutput,
  SignPersonalMessageDAError,
  SignPersonalMessageDAIntermediateValue
>;

@injectable()
export class SignPersonalMessage {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(deviceModuleTypes.DeviceManagementKitService)
    private readonly deviceManagementKitService: DeviceManagementKitService,
    @inject(storageModuleTypes.StorageService)
    private readonly storageService: StorageService,
    @inject(dAppConfigModuleTypes.DAppConfigService)
    private readonly dappConfigService: DAppConfigService,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {
    this.logger = loggerFactory("[SignPersonalMessage]");
  }

  execute(params: SignPersonalMessageParams): Observable<SignFlowStatus> {
    this.logger.info("Starting signing message", { params });

    const sessionId = this.deviceManagementKitService.sessionId;

    if (!sessionId) {
      this.logger.error("No device connected");
      throw new DeviceConnectionError(
        "No device connected. Please connect a device first.",
        { type: "not-connected" },
      );
    }

    const device = this.deviceManagementKitService.connectedDevice;
    if (!device) {
      this.logger.error("No connected device found");
      throw new DeviceConnectionError("No connected device found", {
        type: "not-connected",
      });
    }

    const [, message] = params;
    const signType: SignType = "personal-sign";

    const resultObservable = new BehaviorSubject<SignFlowStatus>({
      signType,
      status: "debugging",
      message: "Initializing personal message signing",
    });

    try {
      const dmk = this.deviceManagementKitService.dmk;
      const ethSigner = new SignerEthBuilder({
        dmk,
        originToken: this.config.originToken,
        sessionId,
      }).build();

      const selectedAccount: Account | undefined = this.storageService
        .getSelectedAccount()
        .extract();

      if (!selectedAccount) {
        throw new AccountNotSelectedError("No account selected");
      }

      //Craft from dAppConfig the open app config for the openAppWithDependenciesDA
      const initObservable: Observable<OpenAppWithDependenciesDeviceAction> =
        from(this.createOpenAppConfig()).pipe(
          map(
            (openAppConfig) =>
              new OpenAppWithDependenciesDeviceAction({
                input: openAppConfig,
                inspect: false,
              }),
          ),
        );

      const derivationPath = getDerivationPath(selectedAccount);

      initObservable
        .pipe(
          switchMap(
            (openAppDeviceAction: OpenAppWithDependenciesDeviceAction) => {
              const openObservable = dmk.executeDeviceAction({
                sessionId: sessionId,
                deviceAction: openAppDeviceAction,
              }).observable;
              return openObservable;
            },
          ),
          filter(
            (result: OpenAppWithDependenciesDAState) =>
              result.status !== DeviceActionStatus.Pending ||
              result.intermediateValue?.requiredUserInteraction !==
                UserInteractionRequired.None,
          ),
          tap((result: OpenAppWithDependenciesDAState) => {
            resultObservable.next(
              this.getTransactionResultForEvent(result, message, signType),
            );
          }),
          filter((result: OpenAppWithDependenciesDAState) => {
            return (
              result.status === DeviceActionStatus.Error ||
              result.status === DeviceActionStatus.Completed
            );
          }),
          switchMap((result: OpenAppWithDependenciesDAState) => {
            if (result.status === DeviceActionStatus.Error) {
              throw new Error("Open app with dependencies failed");
            }

            const { observable: addressObservable } = ethSigner.getAddress(
              derivationPath,
              {
                skipOpenApp: true,
              },
            );

            return addressObservable.pipe(
              filter((result: GetAddressDAState) => {
                return (
                  result.status === DeviceActionStatus.Error ||
                  result.status === DeviceActionStatus.Completed
                );
              }),
            );
          }),
          switchMap((result: GetAddressDAState) => {
            if (result.status === DeviceActionStatus.Error) {
              throw result.error;
            }

            if (
              result.status === DeviceActionStatus.Completed &&
              result.output.address.toLowerCase() !==
                selectedAccount.freshAddress.toLowerCase()
            ) {
              throw new IncorrectSeedError("Address mismatch");
            }

            resultObservable.next({
              signType,
              status: "debugging",
              message: "Starting Sign Personal Message DA",
            });

            const { observable: signObservable } = ethSigner.signMessage(
              derivationPath,
              message,
              {
                skipOpenApp: true,
              },
            );

            return signObservable;
          }),
          filter(
            (result: SignPersonalMessageDAState) =>
              result.status !== DeviceActionStatus.Pending ||
              result.intermediateValue?.requiredUserInteraction !==
                UserInteractionRequired.None,
          ),
          tap((result: SignPersonalMessageDAState) => {
            if (
              result.status !== DeviceActionStatus.Completed &&
              result.status !== DeviceActionStatus.Error
            ) {
              resultObservable.next(
                this.getTransactionResultForEvent(result, message, signType),
              );
            }
          }),
          filter((result: SignPersonalMessageDAState) => {
            return (
              result.status === DeviceActionStatus.Error ||
              result.status === DeviceActionStatus.Completed
            );
          }),
          tap((result: SignPersonalMessageDAState) => {
            resultObservable.next(
              this.getTransactionResultForEvent(result, message, signType),
            );
          }),
          map((result: SignPersonalMessageDAState) => {
            if (result.status === DeviceActionStatus.Error) {
              switch (true) {
                case result.error instanceof EthAppCommandError &&
                  result.error.errorCode === "6985":
                  throw new UserRejectedTransactionError(
                    "User rejected transaction",
                  );
                default:
                  return result;
              }
            }

            return result;
          }),
        )
        .subscribe({
          next: (result) => {
            resultObservable.next(
              this.getTransactionResultForEvent(
                result as SignPersonalMessageDAState,
                message,
                signType,
              ),
            );
          },
          error: (error: Error) => {
            this.logger.error("Personal message signing failed", { error });
            resultObservable.next({ signType, status: "error", error: error });
          },
        });

      return resultObservable.asObservable();
    } catch (error) {
      this.logger.error("Failed to sign personal message", { error });
      return of({
        signType,
        status: "error",
        error,
      });
    }
  }

  async createOpenAppConfig(): Promise<OpenAppWithDependenciesDAInput> {
    const dAppConfig: DAppConfig = await this.dappConfigService.getDAppConfig();

    const ethereumAppDependencies = dAppConfig.appDependencies.find(
      (dep) => dep.blockchain === "ethereum",
    );
    if (!ethereumAppDependencies) {
      throw new Error("Ethereum Blockchain dependencies not found");
    }

    return {
      application: { name: ethereumAppDependencies.appName },
      dependencies: ethereumAppDependencies.dependencies.map((dep) => ({
        name: dep,
      })),
      requireLatestFirmware: false, //TODO add this to the dApp config
    };
  }

  private getTransactionResultForEvent(
    result:
      | OpenAppWithDependenciesDAState
      | GetAddressDAState
      | SignPersonalMessageDAState
      | SignedPersonalMessageOrTypedDataResult,
    _message: string | Uint8Array,
    signType: SignType,
  ): SignFlowStatus {
    if (isSignedMessageOrTypedDataResult(result)) {
      return {
        signType,
        status: "success",
        data: result,
      };
    }

    switch (result.status) {
      case DeviceActionStatus.Pending:
        switch (result.intermediateValue?.requiredUserInteraction) {
          case "unlock-device":
            return {
              signType,
              status: "user-interaction-needed",
              interaction: "unlock-device",
            };
          case "allow-secure-connection":
            return {
              signType,
              status: "user-interaction-needed",
              interaction: "allow-secure-connection",
            };
          case "confirm-open-app":
            return {
              signType,
              status: "user-interaction-needed",
              interaction: "confirm-open-app",
            };
          case "sign-personal-message":
            return {
              signType,
              status: "user-interaction-needed",
              interaction: "sign-transaction",
            };
          case "allow-list-apps":
            return {
              signType,
              status: "user-interaction-needed",
              interaction: "allow-list-apps",
            };
          default:
            return {
              signType,
              status: "debugging",
              message: `Unhandled user interaction: ${JSON.stringify(result.intermediateValue?.requiredUserInteraction)}`,
            };
        }
      case DeviceActionStatus.Completed: {
        if (isGetAddressResult(result)) {
          return {
            signType,
            status: "debugging",
            message: `Got address: ${result.output.address}`,
          };
        }

        if (!("deviceMetadata" in result.output)) {
          const signature = getHexaStringFromSignature(result.output);
          return {
            signType,
            status: "success",
            data: {
              signature,
            },
          };
        } else {
          return {
            signType,
            status: "debugging",
            message: `App Opened`,
          };
        }
      }
      case DeviceActionStatus.Error:
        return {
          signType,
          status: "error",
          error: result.error,
        };
      default:
        return {
          signType,
          status: "debugging",
          message: `DA status: ${result.status} - ${JSON.stringify(result)}`,
        };
    }
  }
}
