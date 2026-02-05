import type { LedgerButtonCore } from "@ledgerhq/ledger-wallet-provider-core";

import type { FloatingButtonPosition } from "../components/atom/floating-button/ledger-floating-button.js";
import type { LedgerButtonApp } from "../ledger-button-app.js";

export type FloatingButtonConfig = {
  floatingButtonContainer: HTMLElement | null;
  floatingButton: Element | null;
};

export function setupFloatingButton(
  app: LedgerButtonApp,
  floatingButtonTarget: HTMLElement | string | undefined,
  floatingButtonPosition: FloatingButtonPosition | false,
): FloatingButtonConfig {
  if (!floatingButtonTarget) {
    setDefaultFloatingButtonPosition(app, floatingButtonPosition);
    return { floatingButtonContainer: null, floatingButton: null };
  }

  const targetElement = resolveTargetElement(floatingButtonTarget);

  if (!targetElement) {
    logTargetNotFoundWarning();
    setDefaultFloatingButtonPosition(app, floatingButtonPosition);
    return { floatingButtonContainer: null, floatingButton: null };
  }

  disableAppFloatingButton(app);

  const button = createCompactFloatingButton(app.core);
  attachFloatingButtonClickHandler(button, app);
  targetElement.appendChild(button);

  return { floatingButtonContainer: targetElement, floatingButton: button };
}

function resolveTargetElement(
  target: HTMLElement | string | undefined,
): HTMLElement | null {
  if (!target) {
    return null;
  }

  if (typeof target === "string") {
    const element = document.querySelector(target);
    return element instanceof HTMLElement ? element : null;
  }

  return target instanceof HTMLElement ? target : null;
}

function createCompactFloatingButton(core: LedgerButtonCore): Element {
  const button = document.createElement("ledger-floating-button");
  button.setAttribute("variant", "compact");
  button.classList.add("ledger-wallet-provider");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (button as any).core = core;
  return button;
}

function attachFloatingButtonClickHandler(
  button: Element,
  app: LedgerButtonApp,
): void {
  button.addEventListener("ledger-internal-floating-button-click", () => {
    app.navigationIntent("selectAccount");
  });
}

function setDefaultFloatingButtonPosition(
  app: LedgerButtonApp,
  position: FloatingButtonPosition | false,
): void {
  app.floatingButtonPosition = position;
}

function disableAppFloatingButton(app: LedgerButtonApp): void {
  app.floatingButtonPosition = false;
}

function logTargetNotFoundWarning(): void {
  console.warn(
    "Ledger Button: floatingButtonTarget not found or invalid, falling back to default position",
  );
}
