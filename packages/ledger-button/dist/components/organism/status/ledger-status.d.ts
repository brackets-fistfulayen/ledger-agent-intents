import { LitElement } from 'lit';
export type StatusType = "success" | "error";
export interface LedgerStatusAttributes {
    type?: StatusType;
    title?: string;
    description?: string;
    primaryButtonLabel?: string;
    secondaryButtonLabel?: string;
    showSecondaryButton?: boolean;
}
export declare class LedgerStatus extends LitElement {
    type: StatusType;
    title: string;
    description: string;
    primaryButtonLabel: string;
    secondaryButtonLabel: string;
    private get containerClasses();
    private get statusIconClasses();
    private get iconType();
    private handlePrimaryAction;
    private handleSecondaryAction;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-status": LedgerStatus;
    }
    interface WindowEventMap {
        "ledger-status-action": CustomEvent<{
            timestamp: number;
            action: "primary" | "secondary";
            type: StatusType;
        }>;
    }
}
export default LedgerStatus;
//# sourceMappingURL=ledger-status.d.ts.map