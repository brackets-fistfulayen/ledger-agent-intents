import { LedgerButtonCore } from '@ledgerhq/ledger-wallet-provider-core';
import { LitElement } from 'lit';
export type CoreContext = LedgerButtonCore;
export declare const coreContext: {
    __context__: LedgerButtonCore;
};
export declare class CoreProvider extends LitElement {
    coreClass?: LedgerButtonCore;
    core: CoreContext;
    connectedCallback(): void;
    render(): import('lit').TemplateResult<1>;
}
//# sourceMappingURL=core-context.d.ts.map