import { Config } from "./config.js";

describe("Config", () => {
  describe("environment and ledger keyring protocol configuration", () => {
    it("should default to production environment", () => {
      const config = new Config({
        originToken: "test-token",
        dAppIdentifier: "test-app",
      });
      expect(config.environment).toBe("production");
      expect(config.lkrp.cloudSyncUrl).toBe(
        "https://cloud-sync-backend.api.aws.prd.ldg-tech.com",
      );
    });

    it("should set staging environment correctly", () => {
      const config = new Config({
        originToken: "test-token",
        dAppIdentifier: "test-app",
        environment: "staging",
      });
      expect(config.environment).toBe("staging");
      expect(config.lkrp.cloudSyncUrl).toBe(
        "https://cloud-sync-backend.api.aws.stg.ldg-tech.com",
      );
    });

    it("should set production environment correctly", () => {
      const config = new Config({
        originToken: "test-token",
        dAppIdentifier: "test-app",
        environment: "production",
      });
      expect(config.environment).toBe("production");
      expect(config.lkrp.cloudSyncUrl).toBe(
        "https://cloud-sync-backend.api.aws.prd.ldg-tech.com",
      );
    });

    it("should allow changing environment after construction", () => {
      const config = new Config({
        originToken: "test-token",
        dAppIdentifier: "test-app",
        environment: "staging",
      });
      expect(config.lkrp.cloudSyncUrl).toBe(
        "https://cloud-sync-backend.api.aws.stg.ldg-tech.com",
      );

      config.setEnvironment("production");
      expect(config.environment).toBe("production");
      expect(config.lkrp.cloudSyncUrl).toBe(
        "https://cloud-sync-backend.api.aws.prd.ldg-tech.com",
      );
    });

    it("should maintain other configuration when changing environment", () => {
      const config = new Config({
        originToken: "test-token",
        dAppIdentifier: "test-app",
        environment: "staging",
        logLevel: "debug",
      });

      config.setEnvironment("production");

      expect(config.environment).toBe("production");
      expect(config.logLevel).toBeDefined();
      expect(config.dAppIdentifier).toBe("test-app");
    });
  });

  describe("existing functionality", () => {
    it("should maintain existing configuration options", () => {
      const config = new Config({
        originToken: "custom-token",
        dAppIdentifier: "custom-app",
        logLevel: "warn",
        environment: "production",
      });

      expect(config.originToken).toBe("custom-token");
      expect(config.dAppIdentifier).toBe("custom-app");
      expect(config.logLevel).toBeDefined();
      expect(config.environment).toBe("production");
    });
  });
});
