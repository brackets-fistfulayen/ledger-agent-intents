import { TransactionHistoryItem } from '@ledgerhq/ledger-wallet-provider-core';
import { LitElement } from 'lit';
export declare class TransactionListScreen extends LitElement {
    transactions: TransactionHistoryItem[] | undefined;
    private get isLoading();
    private formatDate;
    private formatHash;
    private renderSkeletonItem;
    private renderSkeletonList;
    private renderEmptyState;
    private renderTransactionItem;
    private renderTransactionList;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "transaction-list-screen": TransactionListScreen;
    }
}
//# sourceMappingURL=transaction-list.d.ts.map