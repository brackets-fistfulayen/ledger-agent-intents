import {
  DeviceActionState,
  DeviceActionStatus,
} from "@ledgerhq/device-management-kit";
import {
  AuthenticateDAError,
  AuthenticateDAIntermediateValue,
  AuthenticateDAOutput,
  KeyPair,
  LedgerKeyringProtocolBuilder,
  LKRPEnv,
  Permissions,
} from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol";
import pako from "pako";
import { lastValueFrom, of } from "rxjs";
import { beforeEach, describe, expect, it, test, vi } from "vitest";

import { LedgerSyncAuthenticationError } from "../../../api/model/errors.js";
import type { AuthContext } from "../../../api/model/LedgerSyncAuthenticateResponse.js";
import type { UserInteractionNeededResponse } from "../../../api/model/UserInteractionNeeded.js";
import type { Config } from "../../config/model/config.js";
import type { GetOrCreateKeyPairUseCase } from "../../cryptographic/usecases/GetOrCreateKeyPairUseCase.js";
import type { DeviceManagementKitService } from "../../device/service/DeviceManagementKitService.js";
import type { StorageService } from "../../storage/StorageService.js";
import {
  LedgerKeyringProtocolError,
  LedgerSyncAuthContextMissingError,
} from "../model/errors.js";
import { DefaultLedgerSyncService } from "./DefaultLedgerSyncService.js";

vi.mock(
  "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol",
  async () => {
    const actual = await vi.importActual<
      typeof import("@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol")
    >("@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol");
    return {
      ...actual,
      LedgerKeyringProtocolBuilder: vi.fn(),
    };
  },
);

describe("DefaultLedgerSyncService", () => {
  let service: DefaultLedgerSyncService;
  let mockDeviceManagementKitService: {
    dmk: unknown;
    sessionId: string | undefined;
  };
  let mockStorageService: {
    getTrustChainId: ReturnType<typeof vi.fn>;
    saveTrustChainId: ReturnType<typeof vi.fn>;
  };
  let mockGetOrCreateKeyPairUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  let mockConfig: Config;
  let mockLkrpAppKit: {
    authenticate: ReturnType<typeof vi.fn>;
    decryptData: ReturnType<typeof vi.fn>;
  };
  let mockKeyPair: KeyPair;
  let mockBuild: ReturnType<typeof vi.fn>;

  const mockJWT = {
    access_token: "test-access-token",
    permissions: {},
  };

  const mockAuthOutput: AuthenticateDAOutput = {
    jwt: mockJWT,
    trustchainId: "test-trustchain-id",
    encryptionKey: new Uint8Array([1, 2, 3, 4, 5]),
    applicationPath: "test-app-path",
  };

  beforeEach(() => {
    mockKeyPair = {
      getPublicKeyToHex: vi.fn().mockReturnValue("mock-public-key-hex"),
    } as unknown as KeyPair;

    mockDeviceManagementKitService = {
      dmk: {},
      sessionId: "test-session-id",
    };

    mockStorageService = {
      getTrustChainId: vi.fn().mockReturnValue({
        extract: vi.fn().mockReturnValue(undefined),
      }),
      saveTrustChainId: vi.fn(),
    };

    mockGetOrCreateKeyPairUseCase = {
      execute: vi.fn().mockResolvedValue(mockKeyPair),
    };

    mockConfig = {
      environment: "staging",
      dAppIdentifier: "test-dapp",
      lkrp: {},
    } as Config;

    mockLkrpAppKit = {
      authenticate: vi.fn(),
      decryptData: vi.fn(),
    };

    mockBuild = vi.fn().mockReturnValue(mockLkrpAppKit);

    vi.mocked(LedgerKeyringProtocolBuilder).mockImplementation(
      () =>
        ({
          build: mockBuild,
        }) as unknown as LedgerKeyringProtocolBuilder,
    );

    service = new DefaultLedgerSyncService(
      vi.fn().mockReturnValue({
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      }),
      mockDeviceManagementKitService as unknown as DeviceManagementKitService,
      mockStorageService as unknown as StorageService,
      mockGetOrCreateKeyPairUseCase as unknown as GetOrCreateKeyPairUseCase,
      mockConfig,
    );

    vi.clearAllMocks();
  });

  describe("when building the class", () => {
    it("should build a LedgerKeyringProtocolBuilder with correct configuration", () => {
      new DefaultLedgerSyncService(
        vi.fn().mockReturnValue({
          info: vi.fn(),
          debug: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        }),
        mockDeviceManagementKitService as unknown as DeviceManagementKitService,
        mockStorageService as unknown as StorageService,
        mockGetOrCreateKeyPairUseCase as unknown as GetOrCreateKeyPairUseCase,
        mockConfig,
      );

      expect(LedgerKeyringProtocolBuilder).toHaveBeenCalledWith({
        dmk: mockDeviceManagementKitService.dmk,
        applicationId: 16,
        env: LKRPEnv.STAGING,
      });
      expect(mockBuild).toHaveBeenCalled();
    });

    test.each([
      {
        environment: "production" as const,
        expectedEnv: LKRPEnv.PROD,
      },
      {
        environment: "staging" as const,
        expectedEnv: LKRPEnv.STAGING,
      },
    ])(
      "should use correct environment when config.environment is $environment",
      ({ environment, expectedEnv }) => {
        mockConfig.environment = environment;

        new DefaultLedgerSyncService(
          vi.fn().mockReturnValue({
            info: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
          }),
          mockDeviceManagementKitService as unknown as DeviceManagementKitService,
          mockStorageService as unknown as StorageService,
          mockGetOrCreateKeyPairUseCase as unknown as GetOrCreateKeyPairUseCase,
          mockConfig,
        );

        expect(LedgerKeyringProtocolBuilder).toHaveBeenCalledWith({
          dmk: mockDeviceManagementKitService.dmk,
          applicationId: 16,
          env: expectedEnv,
        });
      },
    );
  });

  describe("authContext", () => {
    it("should return undefined when no authentication has occurred", () => {
      expect(service.authContext).toBeUndefined();
    });
  });

  describe("authenticate", () => {
    describe("when preparing for device action", () => {
      test("given a trustchainId in storage, it should call authenticate with the given trustchainId", async () => {
        const existingTrustchainId = "existing-trustchain-id";
        mockStorageService.getTrustChainId.mockReturnValue({
          extract: vi.fn().mockReturnValue(existingTrustchainId),
        });

        const state: DeviceActionState<
          AuthenticateDAOutput,
          AuthenticateDAError,
          AuthenticateDAIntermediateValue
        > = {
          status: DeviceActionStatus.Completed,
          output: mockAuthOutput,
        };

        mockLkrpAppKit.authenticate.mockReturnValue({
          observable: of(state),
        });

        const result$ = service.authenticate();
        await lastValueFrom(result$);

        expect(mockGetOrCreateKeyPairUseCase.execute).toHaveBeenCalled();
        expect(mockLkrpAppKit.authenticate).toHaveBeenCalledWith({
          keypair: mockKeyPair,
          clientName: `LedgerWalletProvider::${mockConfig.dAppIdentifier}`,
          permissions: Permissions.OWNER & ~Permissions.CAN_ADD_BLOCK,
          trustchainId: existingTrustchainId,
          sessionId: undefined,
        });
      });

      test("when no trustchainId is found, it should authenticate with no trustchainId", async () => {
        mockStorageService.getTrustChainId.mockReturnValue({
          extract: vi.fn().mockReturnValue(undefined),
        });

        const state: DeviceActionState<
          AuthenticateDAOutput,
          AuthenticateDAError,
          AuthenticateDAIntermediateValue
        > = {
          status: DeviceActionStatus.Completed,
          output: mockAuthOutput,
        };

        mockLkrpAppKit.authenticate.mockReturnValue({
          observable: of(state),
        });

        const result$ = service.authenticate();
        await lastValueFrom(result$);

        expect(mockGetOrCreateKeyPairUseCase.execute).toHaveBeenCalled();
        expect(mockLkrpAppKit.authenticate).toHaveBeenCalledWith({
          keypair: mockKeyPair,
          clientName: `LedgerWalletProvider::${mockConfig.dAppIdentifier}`,
          permissions: Permissions.OWNER & ~Permissions.CAN_ADD_BLOCK,
          trustchainId: undefined,
          sessionId: mockDeviceManagementKitService.sessionId,
        });
      });

      test("when no trustchainId is found and no sessionId exists, it should throw an error", async () => {
        mockDeviceManagementKitService.sessionId = undefined;
        mockStorageService.getTrustChainId.mockReturnValue({
          extract: vi.fn().mockReturnValue(undefined),
        });

        const result$ = service.authenticate();

        await expect(lastValueFrom(result$)).rejects.toThrow("No session ID");
      });
    });

    describe("when listening to authentication response", () => {
      describe("on status Completed", () => {
        it("should store auth information in context", async () => {
          const state: DeviceActionState<
            AuthenticateDAOutput,
            AuthenticateDAError,
            AuthenticateDAIntermediateValue
          > = {
            status: DeviceActionStatus.Completed,
            output: mockAuthOutput,
          };

          mockLkrpAppKit.authenticate.mockReturnValue({
            observable: of(state),
          });

          const result$ = service.authenticate();
          await lastValueFrom(result$);

          expect(service.authContext).toEqual({
            jwt: mockJWT,
            trustChainId: mockAuthOutput.trustchainId,
            encryptionKey: mockAuthOutput.encryptionKey,
            applicationPath: mockAuthOutput.applicationPath,
            keyPair: mockKeyPair,
          });
          expect(mockStorageService.saveTrustChainId).toHaveBeenCalledWith(
            mockAuthOutput.trustchainId,
          );
        });

        it("should return AuthContext with trustChainId and applicationPath", async () => {
          const state: DeviceActionState<
            AuthenticateDAOutput,
            AuthenticateDAError,
            AuthenticateDAIntermediateValue
          > = {
            status: DeviceActionStatus.Completed,
            output: mockAuthOutput,
          };

          mockLkrpAppKit.authenticate.mockReturnValue({
            observable: of(state),
          });

          const result$ = service.authenticate();
          const result = await lastValueFrom(result$);

          expect(result).toEqual({
            trustChainId: mockAuthOutput.trustchainId,
            applicationPath: mockAuthOutput.applicationPath,
          } satisfies AuthContext);
        });
      });

      describe("on status Pending", () => {
        it("should return an intermediate state with requiredUserInteraction", async () => {
          const state: DeviceActionState<
            AuthenticateDAOutput,
            AuthenticateDAError,
            AuthenticateDAIntermediateValue
          > = {
            status: DeviceActionStatus.Pending,
            intermediateValue: {
              requiredUserInteraction: "unlock-device",
            } as AuthenticateDAIntermediateValue,
          };

          mockLkrpAppKit.authenticate.mockReturnValue({
            observable: of(state),
          });

          const result$ = service.authenticate();
          const result = await lastValueFrom(result$);

          expect(result).toEqual({
            requiredUserInteraction: "unlock-device",
          } satisfies UserInteractionNeededResponse);
        });
      });

      describe("on error statuses", () => {
        it.each([
          {
            scenario: "DeviceActionStatus.Error",
            status: DeviceActionStatus.Error,
            error: {
              type: "DeviceDisconnected",
            } as unknown as AuthenticateDAError,
            expectedErrorClass: LedgerKeyringProtocolError,
            expectedMessage: "An unknown error occurred",
          },
          {
            scenario: "unknown status",
            status: "UnknownStatus" as DeviceActionStatus,
            error: undefined,
            expectedErrorClass: LedgerSyncAuthenticationError,
            expectedMessage: "Unknown error",
          },
        ])(
          "should return $expectedErrorClass.name with message '$expectedMessage' on $scenario",
          async ({ status, error, expectedErrorClass, expectedMessage }) => {
            const state = {
              status,
              error,
            } as DeviceActionState<
              AuthenticateDAOutput,
              AuthenticateDAError,
              AuthenticateDAIntermediateValue
            >;

            mockLkrpAppKit.authenticate.mockReturnValue({
              observable: of(state),
            });

            const result$ = service.authenticate();
            const result = await lastValueFrom(result$);

            expect(result).toBeInstanceOf(expectedErrorClass);
            expect((result as Error).message).toBe(expectedMessage);
          },
        );
      });
    });
  });

  describe("decrypt", () => {
    it("should successfully decrypt data when auth context exists", async () => {
      service["_authContext"] = {
        jwt: mockJWT,
        encryptionKey: new Uint8Array([1, 2, 3, 4, 5]),
        trustChainId: "test-trustchain-id",
        applicationPath: "test-app-path",
        keyPair: new Uint8Array([6, 7, 8]),
      };

      const testData = "test-data";
      const compressedData = pako.deflate(new TextEncoder().encode(testData));
      const encryptedData = new Uint8Array([10, 20, 30, 40, 50]);

      mockLkrpAppKit.decryptData.mockResolvedValue(compressedData);

      const result = await service.decrypt(encryptedData);

      expect(mockLkrpAppKit.decryptData).toHaveBeenCalledWith(
        service.authContext?.encryptionKey,
        encryptedData,
      );

      const decompressed = pako.inflate(compressedData);
      expect(result).toEqual(decompressed);
    });

    test.each([
      {
        description: "no auth context exists",
        authContext: undefined,
        shouldCheckMessage: true,
      },
      {
        description: "auth context has no encryption key",
        authContext: {
          jwt: mockJWT,
          encryptionKey: undefined as unknown as Uint8Array,
          trustChainId: "test-trustchain-id",
          applicationPath: "test-app-path",
          keyPair: new Uint8Array([6, 7, 8]),
        },
        shouldCheckMessage: false,
      },
    ])(
      "should throw LedgerSyncAuthContextMissingError when $description",
      async ({ authContext, shouldCheckMessage }) => {
        service["_authContext"] = authContext;

        const encryptedData = new Uint8Array([10, 20, 30]);

        const promise = expect(service.decrypt(encryptedData)).rejects;
        await promise.toThrow(LedgerSyncAuthContextMissingError);

        if (shouldCheckMessage) {
          await promise.toThrow("No encryption key");
        }
      },
    );
  });
});
