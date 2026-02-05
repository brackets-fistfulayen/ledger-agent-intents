import { Maybe, Nothing } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EventType } from "../backend/model/trackEvent.js";
import type { EventTrackingService } from "../event-tracking/service/EventTrackingService.js";
import type { UserConsent } from "../storage/model/UserConsent.js";
import type { StorageService } from "../storage/StorageService.js";
import { DefaultConsentService } from "./DefaultConsentService.js";

describe("DefaultConsentService", () => {
  let consentService: DefaultConsentService;
  let mockStorageService: {
    getUserConsent: ReturnType<typeof vi.fn>;
    saveUserConsent: ReturnType<typeof vi.fn>;
    removeUserConsent: ReturnType<typeof vi.fn>;
  };
  let mockEventTrackingService: {
    trackEvent: ReturnType<typeof vi.fn>;
    getSessionId: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockStorageService = {
      getUserConsent: vi.fn().mockResolvedValue(Nothing),
      saveUserConsent: vi.fn().mockResolvedValue(undefined),
      removeUserConsent: vi.fn().mockResolvedValue(undefined),
    };

    mockEventTrackingService = {
      trackEvent: vi.fn().mockResolvedValue(undefined),
      getSessionId: vi.fn().mockReturnValue("test-session-id"),
    };

    consentService = new DefaultConsentService(
      mockStorageService as unknown as StorageService,
      mockEventTrackingService as unknown as EventTrackingService,
    );
  });

  describe("hasConsent", () => {
    it("should return true when user has given consent", async () => {
      const mockConsent: UserConsent = {
        consentGiven: true,
        consentDate: new Date().toISOString(),
      };
      mockStorageService.getUserConsent.mockResolvedValue(
        Maybe.of(mockConsent),
      );

      const result = await consentService.hasConsent();

      expect(result).toBe(true);
      expect(mockStorageService.getUserConsent).toHaveBeenCalled();
    });

    it("should return false when user has refused consent", async () => {
      const mockConsent: UserConsent = {
        consentGiven: false,
        consentDate: new Date().toISOString(),
      };
      mockStorageService.getUserConsent.mockResolvedValue(
        Maybe.of(mockConsent),
      );

      const result = await consentService.hasConsent();

      expect(result).toBe(false);
    });

    it("should return false when no consent record exists", async () => {
      mockStorageService.getUserConsent.mockResolvedValue(Nothing);

      const result = await consentService.hasConsent();

      expect(result).toBe(false);
    });
  });

  describe("hasRespondedToConsent", () => {
    it("should return true when user has responded to consent (given)", async () => {
      const mockConsent: UserConsent = {
        consentGiven: true,
        consentDate: new Date().toISOString(),
      };
      mockStorageService.getUserConsent.mockResolvedValue(
        Maybe.of(mockConsent),
      );

      const result = await consentService.hasRespondedToConsent();

      expect(result).toBe(true);
    });

    it("should return true when user has responded to consent (refused)", async () => {
      const mockConsent: UserConsent = {
        consentGiven: false,
        consentDate: new Date().toISOString(),
      };
      mockStorageService.getUserConsent.mockResolvedValue(
        Maybe.of(mockConsent),
      );

      const result = await consentService.hasRespondedToConsent();

      expect(result).toBe(true);
    });

    it("should return false when user has not responded to consent", async () => {
      mockStorageService.getUserConsent.mockResolvedValue(Nothing);

      const result = await consentService.hasRespondedToConsent();

      expect(result).toBe(false);
    });
  });

  describe("giveConsent", () => {
    it("should save consent with consentGiven=true", async () => {
      await consentService.giveConsent();

      expect(mockStorageService.saveUserConsent).toHaveBeenCalledWith(
        expect.objectContaining({
          consentGiven: true,
          consentDate: expect.any(String),
        }),
      );
    });

    it("should track consent given event", async () => {
      await consentService.giveConsent();

      expect(mockEventTrackingService.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Consent Given",
          type: EventType.ConsentGiven,
          data: expect.objectContaining({
            event_type: "consent_given",
            event_id: expect.any(String),
            transaction_dapp_id: "",
            timestamp_ms: expect.any(Number),
          }),
        }),
      );
    });

    it("should save consent date in ISO format", async () => {
      const beforeCall = new Date().toISOString();
      await consentService.giveConsent();
      const afterCall = new Date().toISOString();

      const savedConsent = mockStorageService.saveUserConsent.mock.calls[0][0];
      expect(savedConsent.consentDate >= beforeCall).toBe(true);
      expect(savedConsent.consentDate <= afterCall).toBe(true);
    });
  });

  describe("refuseConsent", () => {
    it("should save consent with consentGiven=false", async () => {
      await consentService.refuseConsent();

      expect(mockStorageService.saveUserConsent).toHaveBeenCalledWith(
        expect.objectContaining({
          consentGiven: false,
          consentDate: expect.any(String),
        }),
      );
    });

    it("should NOT track any event when refusing consent", async () => {
      await consentService.refuseConsent();

      expect(mockEventTrackingService.trackEvent).not.toHaveBeenCalled();
    });
  });

  describe("removeConsent", () => {
    it("should remove user consent from storage", async () => {
      await consentService.removeConsent();

      expect(mockStorageService.removeUserConsent).toHaveBeenCalled();
    });

    it("should NOT track any event when removing consent", async () => {
      await consentService.removeConsent();

      expect(mockEventTrackingService.trackEvent).not.toHaveBeenCalled();
    });
  });

  describe("getConsentDetails", () => {
    it("should return consent details when consent exists", async () => {
      const mockConsent: UserConsent = {
        consentGiven: true,
        consentDate: "2024-01-01T00:00:00.000Z",
      };
      mockStorageService.getUserConsent.mockResolvedValue(
        Maybe.of(mockConsent),
      );

      const result = await consentService.getConsentDetails();

      expect(result).toEqual(mockConsent);
    });

    it("should return undefined when no consent exists", async () => {
      mockStorageService.getUserConsent.mockResolvedValue(Nothing);

      const result = await consentService.getConsentDetails();

      expect(result).toBeUndefined();
    });
  });
});
