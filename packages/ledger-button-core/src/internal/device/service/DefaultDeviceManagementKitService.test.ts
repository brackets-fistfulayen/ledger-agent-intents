import {
  DeviceManagementKit,
  DiscoveredDevice,
  NoAccessibleDeviceError,
} from "@ledgerhq/device-management-kit";
import { Observable, of, throwError } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockLoggerFactory,
  mockConnectedDevice,
  mockDiscoveredDevice,
} from "../__tests__/mocks.js";
import { DeviceConnectionError } from "../model/errors.js";
import { DefaultDeviceManagementKitService } from "./DefaultDeviceManagementKitService.js";

vi.mock("@ledgerhq/device-management-kit", async () => {
  const actual = await vi.importActual("@ledgerhq/device-management-kit");
  return {
    ...actual,
    DeviceManagementKitBuilder: vi.fn().mockImplementation(() => ({
      addConfig: vi.fn().mockReturnThis(),
      addLogger: vi.fn().mockReturnThis(),
      addTransport: vi.fn().mockReturnThis(),
      build: vi.fn().mockReturnValue({
        startDiscovering: vi.fn(),
        stopDiscovering: vi.fn(),
        connect: vi.fn(),
        getConnectedDevice: vi.fn(),
        close: vi.fn(),
        listenToAvailableDevices: vi.fn(),
      }),
    })),
    ConsoleLogger: vi.fn(),
    LogLevel: {
      Error: "Error",
    },
  };
});

describe("DefaultDeviceManagementKitService", () => {
  let service: DefaultDeviceManagementKitService;
  let mockDmk: DeviceManagementKit;
  let mockLoggerFactory: ReturnType<typeof createMockLoggerFactory>;

  beforeEach(() => {
    mockLoggerFactory = createMockLoggerFactory();

    service = new DefaultDeviceManagementKitService(mockLoggerFactory, {});

    mockDmk = service.dmk;

    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with no session ID and no connected cevice", () => {
      expect(service.dmk).toBeDefined();
      expect(service.sessionId).toBeUndefined();
      expect(service.connectedDevice).toBeUndefined();
    });
  });

  describe("connectToDevice", () => {
    beforeEach(() => {
      vi.mocked(mockDmk.startDiscovering).mockReturnValue(
        of(mockDiscoveredDevice) as Observable<DiscoveredDevice>,
      );
      vi.mocked(mockDmk.stopDiscovering).mockResolvedValue(undefined);
      vi.mocked(mockDmk.connect).mockResolvedValue(
        mockConnectedDevice.sessionId,
      );
      vi.mocked(mockDmk.getConnectedDevice).mockResolvedValue(
        mockConnectedDevice,
      );
    });

    it.each([
      {
        type: "usb" as const,
        transport: "hidIdentifier" as const,
      },
      {
        type: "bluetooth" as const,
        transport: "bleIdentifier" as const,
      },
    ])(
      "should connect to $type device successfully",
      async ({ type, transport }) => {
        const device = await service.connectToDevice({ type });

        expect(device).toBeDefined();
        expect(mockDmk.startDiscovering).toHaveBeenCalledWith({
          transport: service[transport],
        });
        expect(service.connectedDevice).toBeDefined();
        expect(service.sessionId).toBe(mockConnectedDevice.sessionId);
        expect(service.connectedDevice?.name).toBe(mockConnectedDevice.name);
      },
    );

    it.each([
      {
        description: "no accessible device during discovery",
        errorType: "no-accessible-device" as const,
        error: new NoAccessibleDeviceError("No device"),
        mockMethod: "startDiscovering" as const,
      },
      {
        description: "failed to start discovery",
        errorType: "failed-to-start-discovery" as const,
        error: new Error("Discovery failed"),
        mockMethod: "startDiscovering" as const,
      },
      {
        description: "failed to connect to device",
        errorType: "failed-to-connect" as const,
        error: new Error("Connection failed"),
        mockMethod: "connect" as const,
      },
    ])(
      "should include error type in DeviceConnectionError when $description",
      async ({ error, errorType, mockMethod }) => {
        if (mockMethod === "startDiscovering") {
          vi.mocked(mockDmk[mockMethod]).mockReturnValue(
            throwError(() => error) as Observable<DiscoveredDevice>,
          );
        } else {
          vi.mocked(mockDmk[mockMethod]).mockRejectedValue(error);
        }

        try {
          await service.connectToDevice({ type: "usb" });
          expect.fail("Should have thrown an error");
        } catch (e) {
          expect(e).toBeInstanceOf(DeviceConnectionError);
          expect((e as DeviceConnectionError).context?.type).toBe(errorType);
          expect((e as DeviceConnectionError).context?.error).toBe(error);
        }
      },
    );
  });

  describe("listAvailableDevices", () => {
    it("should resolve with discovered devices when devices are found", async () => {
      const devices = [mockDiscoveredDevice];
      const mockUnsubscribe = vi.fn();
      vi.mocked(mockDmk.listenToAvailableDevices).mockReturnValue({
        subscribe: vi.fn((observer) => {
          if (typeof observer === "object" && observer.next) {
            // Use setImmediate/setTimeout to allow subscription assignment
            setImmediate(() => observer.next(devices));
          }
          return { unsubscribe: mockUnsubscribe };
        }),
      } as unknown as Observable<DiscoveredDevice[]>);

      const result = await service.listAvailableDevices();

      expect(result).toEqual(devices);
      expect(mockDmk.listenToAvailableDevices).toHaveBeenCalledWith({});
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should resolve with empty array after 5 iterations with no devices", async () => {
      let callCount = 0;
      const mockUnsubscribe = vi.fn();
      vi.mocked(mockDmk.listenToAvailableDevices).mockReturnValue({
        subscribe: vi.fn((observer) => {
          const interval = setInterval(() => {
            callCount++;
            if (typeof observer === "object" && observer.next) {
              // Use setTimeout to defer the call, allowing subscription to be assigned
              setTimeout(() => observer.next([]), 0);
            }
            if (callCount >= 6) {
              clearInterval(interval);
            }
          }, 1);
          return {
            unsubscribe: vi.fn(() => {
              mockUnsubscribe();
              clearInterval(interval);
            }),
          };
        }),
      } as unknown as Observable<DiscoveredDevice[]>);

      const result = await service.listAvailableDevices();

      expect(result).toEqual([]);
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should reject when an error occurs", async () => {
      const error = new Error("Failed to list devices");
      const mockUnsubscribe = vi.fn();
      vi.mocked(mockDmk.listenToAvailableDevices).mockReturnValue({
        subscribe: vi.fn((observer) => {
          if (typeof observer === "object" && observer.error) {
            // Use setImmediate/setTimeout to allow subscription assignment
            setImmediate(() => observer.error(error));
          }
          return { unsubscribe: mockUnsubscribe };
        }),
      } as unknown as Observable<DiscoveredDevice[]>);

      await expect(service.listAvailableDevices()).rejects.toThrow(error);
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("disconnectFromDevice", () => {
    it("should return early when no session exists", async () => {
      await service.disconnectFromDevice();

      expect(mockDmk.close).not.toHaveBeenCalled();
    });

    describe("with connected device", () => {
      beforeEach(async () => {
        vi.mocked(mockDmk.startDiscovering).mockReturnValue(
          of(mockDiscoveredDevice) as Observable<DiscoveredDevice>,
        );
        vi.mocked(mockDmk.stopDiscovering).mockResolvedValue(undefined);
        vi.mocked(mockDmk.connect).mockResolvedValue(
          mockConnectedDevice.sessionId,
        );
        vi.mocked(mockDmk.getConnectedDevice).mockResolvedValue(
          mockConnectedDevice,
        );

        await service.connectToDevice({ type: "usb" });
      });

      it("should disconnect successfully when session exists", async () => {
        vi.mocked(mockDmk.close).mockResolvedValue(undefined);

        await service.disconnectFromDevice();

        expect(mockDmk.close).toHaveBeenCalled();
        expect(service.sessionId).toBeUndefined();
      });

      it("should include error type in DeviceConnectionError when disconnect fails", async () => {
        const error = new Error("Disconnect failed");
        vi.mocked(mockDmk.close).mockRejectedValue(error);

        try {
          await service.disconnectFromDevice();
          expect.fail("Should have thrown an error");
        } catch (e) {
          expect(e).toBeInstanceOf(DeviceConnectionError);
          expect((e as DeviceConnectionError).context?.type).toBe(
            "failed-to-disconnect",
          );
          expect((e as DeviceConnectionError).context?.error).toBe(error);
        }
      });
    });
  });
});
