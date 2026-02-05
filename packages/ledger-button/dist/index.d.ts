import { LedgerButtonCoreOptions } from '@ledgerhq/ledger-wallet-provider-core';
import { FloatingButtonPosition } from './components/index.js';
import { LedgerEIP1193Provider } from './web3-provider/LedgerEIP1193Provider.js';
import { WalletTransactionFeature } from './components/molecule/wallet-actions/ledger-wallet-actions.js';
export type { EIP1193Provider, EIP6963ProviderDetail, EIP6963ProviderInfo, } from '@ledgerhq/ledger-wallet-provider-core';
export { LedgerEIP1193Provider };
export type { WalletTransactionFeature } from './components/molecule/wallet-actions/ledger-wallet-actions.js';
export type InitializeLedgerProviderOptions = LedgerButtonCoreOptions & {
    target?: HTMLElement;
    floatingButtonPosition?: FloatingButtonPosition | false;
    floatingButtonTarget?: HTMLElement | string;
    walletTransactionFeatures?: WalletTransactionFeature[];
};
export declare function initializeLedgerProvider({ apiKey, dAppIdentifier, dmkConfig, target, loggerLevel, environment, floatingButtonPosition, floatingButtonTarget, walletTransactionFeatures, devConfig, }: InitializeLedgerProviderOptions): () => void;
//# sourceMappingURL=index.d.ts.map