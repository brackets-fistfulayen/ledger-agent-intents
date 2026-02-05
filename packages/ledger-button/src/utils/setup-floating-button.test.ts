/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, test, vi } from "vitest";

import type { LedgerButtonApp } from "../ledger-button-app.js";
import { setupFloatingButton } from "./setup-floating-button.js";

describe("setupFloatingButton", () => {
  let mockApp: LedgerButtonApp;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockApp = {
      floatingButtonPosition: "bottom-right",
      navigationIntent: vi.fn(),
    } as unknown as LedgerButtonApp;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    document.body.innerHTML = "";
  });

  describe("with floatingButtonTarget as HTMLElement", () => {
    test("should create compact floating button in target container", () => {
      const container = document.createElement("div");
      container.id = "test-container";
      document.body.appendChild(container);

      const result = setupFloatingButton(mockApp, container, "bottom-right");

      expect(result.floatingButtonContainer).toBe(container);
      expect(result.floatingButton).toBeInstanceOf(Element);
      expect(result.floatingButton?.tagName.toLowerCase()).toBe(
        "ledger-floating-button",
      );
      expect(result.floatingButton?.getAttribute("variant")).toBe("compact");
      expect(
        result.floatingButton?.classList.contains("ledger-wallet-provider"),
      ).toBe(true);
      expect(mockApp.floatingButtonPosition).toBe(false);
      expect(container.children).toHaveLength(1);
    });

    test("should attach click event listener that calls navigationIntent", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const result = setupFloatingButton(mockApp, container, "bottom-right");

      const event = new CustomEvent("ledger-internal-floating-button-click");
      result.floatingButton?.dispatchEvent(event);

      expect(mockApp.navigationIntent).toHaveBeenCalledWith("selectAccount");
    });
  });

  describe("with floatingButtonTarget as string selector", () => {
    test("should find element by selector and create button", () => {
      const container = document.createElement("div");
      container.id = "floating-button-container";
      document.body.appendChild(container);

      const result = setupFloatingButton(
        mockApp,
        "#floating-button-container",
        "bottom-right",
      );

      expect(result.floatingButtonContainer).toBe(container);
      expect(result.floatingButton).toBeInstanceOf(Element);
      expect(mockApp.floatingButtonPosition).toBe(false);
      expect(container.children).toHaveLength(1);
    });

    test("should handle complex CSS selectors", () => {
      const wrapper = document.createElement("div");
      wrapper.className = "wrapper";
      const container = document.createElement("div");
      container.className = "floating-container";
      wrapper.appendChild(container);
      document.body.appendChild(wrapper);

      const result = setupFloatingButton(
        mockApp,
        ".wrapper .floating-container",
        "top-left",
      );

      expect(result.floatingButtonContainer).toBe(container);
      expect(result.floatingButton).toBeInstanceOf(Element);
      expect(container.children).toHaveLength(1);
    });
  });

  describe("with invalid floatingButtonTarget", () => {
    test("should warn and fallback when selector not found", () => {
      const result = setupFloatingButton(
        mockApp,
        "#non-existent",
        "bottom-left",
      );

      expect(result.floatingButtonContainer).toBe(null);
      expect(result.floatingButton).toBe(null);
      expect(mockApp.floatingButtonPosition).toBe("bottom-left");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Ledger Button: floatingButtonTarget not found or invalid, falling back to default position",
      );
    });

    test("should warn and fallback when target is not an HTMLElement", () => {
      const textNode = document.createTextNode("text");
      document.body.appendChild(textNode);

      const result = setupFloatingButton(
        mockApp,
        textNode as unknown as HTMLElement,
        "top-right",
      );

      expect(result.floatingButtonContainer).toBe(null);
      expect(result.floatingButton).toBe(null);
      expect(mockApp.floatingButtonPosition).toBe("top-right");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Ledger Button: floatingButtonTarget not found or invalid, falling back to default position",
      );
    });

    test("should handle null querySelector result", () => {
      const result = setupFloatingButton(
        mockApp,
        "invalid > selector > chain",
        "bottom-center",
      );

      expect(result.floatingButtonContainer).toBe(null);
      expect(result.floatingButton).toBe(null);
      expect(mockApp.floatingButtonPosition).toBe("bottom-center");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe("without floatingButtonTarget", () => {
    test("should set floatingButtonPosition when target is undefined", () => {
      const result = setupFloatingButton(mockApp, undefined, "top-center");

      expect(result.floatingButtonContainer).toBe(null);
      expect(result.floatingButton).toBe(null);
      expect(mockApp.floatingButtonPosition).toBe("top-center");
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle false as floatingButtonPosition", () => {
      const result = setupFloatingButton(mockApp, undefined, false);

      expect(result.floatingButtonContainer).toBe(null);
      expect(result.floatingButton).toBe(null);
      expect(mockApp.floatingButtonPosition).toBe(false);
    });
  });

  describe("button attributes and classes", () => {
    test("should set correct variant attribute for compact button", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const result = setupFloatingButton(mockApp, container, "bottom-right");

      expect(result.floatingButton?.getAttribute("variant")).toBe("compact");
    });

    test("should add ledger-wallet-provider class for CSS variables", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const result = setupFloatingButton(mockApp, container, "bottom-right");

      expect(
        result.floatingButton?.classList.contains("ledger-wallet-provider"),
      ).toBe(true);
    });

    test("should create ledger-floating-button custom element", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const result = setupFloatingButton(mockApp, container, "bottom-right");

      expect(result.floatingButton?.tagName.toLowerCase()).toBe(
        "ledger-floating-button",
      );
    });
  });

  describe("app state management", () => {
    test("should disable app floating button when target is provided", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      expect(mockApp.floatingButtonPosition).toBe("bottom-right");

      setupFloatingButton(mockApp, container, "top-left");

      expect(mockApp.floatingButtonPosition).toBe(false);
    });

    test("should preserve position when no target is provided", () => {
      mockApp.floatingButtonPosition = "bottom-right";

      setupFloatingButton(mockApp, undefined, "top-left");

      expect(mockApp.floatingButtonPosition).toBe("top-left");
    });
  });
});
