import { LitElement } from 'lit';
export type CryptoIconSize = "small" | "medium" | "large";
export type CryptoIconVariant = "rounded" | "square";
export interface LedgerCryptoIconAttributes {
    ledgerId: string;
    ticker: string;
    size?: CryptoIconSize;
    variant?: CryptoIconVariant;
}
export declare class LedgerCryptoIcon extends LitElement {
    ledgerId: string;
    ticker: string;
    alt: string;
    size: CryptoIconSize;
    variant: CryptoIconVariant;
    private get iconClasses();
    private getCryptoIconUrl;
    private renderFallback;
    private renderCryptoIcon;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-crypto-icon": LedgerCryptoIcon;
    }
}
export default LedgerCryptoIcon;
//# sourceMappingURL=ledger-crypto-icon.d.ts.map