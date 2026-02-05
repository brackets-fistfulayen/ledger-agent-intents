import { FloatingButtonPosition } from '../components/atom/floating-button/ledger-floating-button.js';
import { LedgerButtonApp } from '../ledger-button-app.js';
export type FloatingButtonConfig = {
    floatingButtonContainer: HTMLElement | null;
    floatingButton: Element | null;
};
export declare function setupFloatingButton(app: LedgerButtonApp, floatingButtonTarget: HTMLElement | string | undefined, floatingButtonPosition: FloatingButtonPosition | false): FloatingButtonConfig;
//# sourceMappingURL=setup-floating-button.d.ts.map