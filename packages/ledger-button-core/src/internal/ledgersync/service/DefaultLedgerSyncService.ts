import {
  DeviceActionState,
  DeviceActionStatus,
  DeviceManagementKit,
} from "@ledgerhq/device-management-kit";
import {
  AuthenticateDAError,
  AuthenticateDAIntermediateValue,
  AuthenticateDAOutput,
  KeyPair,
  LedgerKeyringProtocol,
  LedgerKeyringProtocolBuilder,
  LKRPEnv,
  Permissions,
} from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol";
import { AuthenticateUsecaseInput } from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol/internal/use-cases/authentication/AuthenticateUseCase.js";
import { type Factory, inject, injectable } from "inversify";
import pako from "pako";
import { from, map, Observable, switchMap } from "rxjs";

import { LedgerSyncAuthenticationError } from "../../../api/model/errors.js";
import {
  type AuthContext,
  type LedgerSyncAuthenticateResponse,
} from "../../../api/model/LedgerSyncAuthenticateResponse.js";
import type {
  UserInteractionNeeded,
  UserInteractionNeededResponse,
} from "../../../api/model/UserInteractionNeeded.js";
import { configModuleTypes } from "../../config/configModuleTypes.js";
import { Config } from "../../config/model/config.js";
import { cryptographicModuleTypes } from "../../cryptographic/cryptographicModuleTypes.js";
import { GetOrCreateKeyPairUseCase } from "../../cryptographic/usecases/GetOrCreateKeyPairUseCase.js";
import { deviceModuleTypes } from "../../device/deviceModuleTypes.js";
import type { DeviceManagementKitService } from "../../device/service/DeviceManagementKitService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { storageModuleTypes } from "../../storage/storageModuleTypes.js";
import type { StorageService } from "../../storage/StorageService.js";
import {
  LedgerKeyringProtocolError,
  LedgerSyncAuthContextMissingError,
} from "../model/errors.js";
import { InternalAuthContext } from "../model/InternalAuthContext.js";
import { LedgerSyncService } from "./LedgerSyncService.js";

const LEDGER_SYNC_APPLICATION_ID = 16;

@injectable()
export class DefaultLedgerSyncService implements LedgerSyncService {
  private readonly logger: LoggerPublisher;
  private _authContext: InternalAuthContext | undefined;
  lkrpAppKit: LedgerKeyringProtocol;
  private keyPair: KeyPair | undefined;
  private trustChainId: string | undefined;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    private readonly loggerFactory: Factory<LoggerPublisher>,
    @inject(deviceModuleTypes.DeviceManagementKitService)
    private readonly deviceManagementKitService: DeviceManagementKitService,
    @inject(storageModuleTypes.StorageService)
    private readonly storageService: StorageService,
    @inject(cryptographicModuleTypes.GetOrCreateKeyPairUseCase)
    private readonly getOrCreateKeyPairUseCase: GetOrCreateKeyPairUseCase,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {
    this.logger = this.loggerFactory("[Ledger Sync Service]");

    const dmk: DeviceManagementKit = this.deviceManagementKitService.dmk;
    this.lkrpAppKit = new LedgerKeyringProtocolBuilder({
      dmk: dmk,
      applicationId: LEDGER_SYNC_APPLICATION_ID,
      env:
        this.config.environment === "production"
          ? LKRPEnv.PROD
          : LKRPEnv.STAGING,
    }).build();
  }

  authenticate(): Observable<LedgerSyncAuthenticateResponse> {
    this.logger.info("Authenticating with ledger sync");

    return from(this.getOrCreateKeyPairUseCase.execute()).pipe(
      switchMap((keypair: KeyPair) => {
        const authenticationData = this.prepareAuthenticationData(keypair);
        const authenticateInput =
          this.createAuthenticateInput(authenticationData);
        return this.executeAuthentication(authenticateInput);
      }),
      map(
        (
          response: DeviceActionState<
            AuthenticateDAOutput,
            AuthenticateDAError,
            AuthenticateDAIntermediateValue
          >,
        ) => {
          return this.mapAuthenticateResponse(response);
        },
      ),
    );
  }

  async decrypt(encryptedData: Uint8Array): Promise<Uint8Array> {
    if (!this.authContext?.encryptionKey) {
      const error = new LedgerSyncAuthContextMissingError("No encryption key");
      this.logger.error("Missing encryption key for decrypt", { error });
      throw error;
    }

    const compressedClearData = await this.lkrpAppKit.decryptData(
      this.authContext?.encryptionKey,
      encryptedData,
    );

    return pako.inflate(compressedClearData);
  }

  get authContext() {
    return this._authContext;
  }
  private getClientName(): string {
    return `LedgerWalletProvider::${this.config.dAppIdentifier}`;
  }

  private prepareAuthenticationData(keypair: KeyPair): {
    keypair: KeyPair;
    trustChainId: string | undefined;
  } {
    this.logger.info("Keypair retrieved", {
      keypair: keypair.getPublicKeyToHex(),
    });
    this.keyPair = keypair;
    const trustChainId = this.storageService.getTrustChainId().extract();
    this.trustChainId = trustChainId;

    this.logger.info(`Trustchain ID : ${trustChainId}`);
    this.logger.info("Start DeviceAction for authenticate with ledger sync");

    return { keypair, trustChainId };
  }

  private createAuthenticateInput(authenticationData: {
    keypair: KeyPair;
    trustChainId: string | undefined;
  }): AuthenticateUsecaseInput {
    const { keypair, trustChainId } = authenticationData;

    this.logger.info("Create authenticate input", {
      trustChainId,
      keypair: keypair.getPublicKeyToHex(),
    });

    if (!trustChainId) {
      return this.createDeviceAuthenticateInput(keypair);
    } else {
      return this.createKeypairAuthenticateInput(keypair, trustChainId);
    }
  }

  private createDeviceAuthenticateInput(
    keypair: KeyPair,
  ): AuthenticateUsecaseInput {
    this.logger.info("Try to authenticate with a Ledger Device");

    if (!this.deviceManagementKitService.sessionId) {
      throw new Error("No session ID");
    }

    return {
      keypair: keypair,
      clientName: this.getClientName(),
      permissions: Permissions.OWNER & ~Permissions.CAN_ADD_BLOCK,
      sessionId: this.deviceManagementKitService.sessionId,
      trustchainId: undefined,
    } as AuthenticateUsecaseInput;
  }

  private createKeypairAuthenticateInput(
    keypair: KeyPair,
    trustChainId: string,
  ): AuthenticateUsecaseInput {
    this.logger.info("Try to authenticate with keypair");

    return {
      keypair: keypair,
      clientName: this.getClientName(),
      permissions: Permissions.OWNER & ~Permissions.CAN_ADD_BLOCK,
      trustchainId: trustChainId,
      sessionId: undefined,
    } as AuthenticateUsecaseInput;
  }

  private executeAuthentication(
    input: AuthenticateUsecaseInput,
  ): Observable<
    DeviceActionState<
      AuthenticateDAOutput,
      AuthenticateDAError,
      AuthenticateDAIntermediateValue
    >
  > {
    return this.lkrpAppKit.authenticate(input).observable;
  }

  private mapAuthenticateResponse(
    state: DeviceActionState<
      AuthenticateDAOutput,
      AuthenticateDAError,
      AuthenticateDAIntermediateValue
    >,
  ): LedgerSyncAuthenticateResponse {
    switch (state.status) {
      case DeviceActionStatus.Completed: {
        const newAuthContext = {
          jwt: state.output.jwt,
          trustChainId: state.output.trustchainId,
          encryptionKey: state.output.encryptionKey,
          applicationPath: state.output.applicationPath,
          keyPair: this.keyPair,
        } as unknown as InternalAuthContext;

        this.trustChainId = newAuthContext.trustChainId;
        this.storageService.saveTrustChainId(this.trustChainId);

        this._authContext = newAuthContext;

        return {
          trustChainId: newAuthContext.trustChainId,
          applicationPath: newAuthContext.applicationPath,
        } satisfies AuthContext;
      }

      case DeviceActionStatus.Error: {
        const errorMessage =
          (state.error as unknown as { message?: string })?.message ??
          "An unknown error occurred";
        const error = new LedgerKeyringProtocolError(errorMessage, {
          errorType: state.error?.constructor?.name,
          originalError: JSON.stringify(state.error),
        });
        this.logger.error("LKRP authentication failed", { error });
        return error;
      }

      // TODO https://ledgerhq.atlassian.net/browse/LBD-199
      //  Handle error when members has been removed from the trustchain => Remove the trustchainId from the storage and retry the authentication

      case DeviceActionStatus.Pending:
        return {
          requiredUserInteraction: state.intermediateValue
            ?.requiredUserInteraction as UserInteractionNeeded,
        } satisfies UserInteractionNeededResponse;

      default: {
        const error = new LedgerSyncAuthenticationError("Unknown error");
        this.logger.error("Unknown authentication status", { error });
        return error;
      }
    }
  }
}
