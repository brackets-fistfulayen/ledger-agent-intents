import { WalletTransactionFeature } from '../../components/molecule/wallet-actions/ledger-wallet-actions.js';
/**
 * Context for building deep links with pre-filled information.
 */
export type DeepLinkContext = {
    currency?: string;
    address?: string;
};
/**
 * Builds a deep link for a wallet action with optional context for pre-filling information.
 *
 * Based on Ledger Live Desktop deep link documentation:
 * - send: ?currency={currency} (pre-fills currency selection)
 * - receive: ?currency={currency} (pre-fills currency selection)
 * - swap: ?fromToken={currency} (pre-fills source token)
 * - buy: no params (params passed through to liveApp)
 * - earn: ?cryptoAssetId={currency} (pre-fills asset for deposit)
 * - sell: not supported in Desktop, falls back to buy
 */
export declare function buildWalletActionDeepLink(action: WalletTransactionFeature, context?: DeepLinkContext): string;
/**
 * URL to download the Ledger Wallet desktop application.
 */
export declare const LEDGER_WALLET_DOWNLOAD_URL = "https://shop.ledger.com/pages/ledger-wallet-download";
//# sourceMappingURL=deeplinks.d.ts.map