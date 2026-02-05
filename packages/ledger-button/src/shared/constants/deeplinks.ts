import type { WalletTransactionFeature } from "../../components/molecule/wallet-actions/ledger-wallet-actions.js";

/**
 * Context for building deep links with pre-filled information.
 */
export type DeepLinkContext = {
  currency?: string;
  address?: string;
};

/**
 * Base deep links for wallet actions.
 * Note: "sell" is not supported in Ledger Live Desktop, falls back to "buy".
 */
const BASE_DEEPLINKS: Record<WalletTransactionFeature, string> = {
  send: "ledgerwallet://send",
  receive: "ledgerwallet://receive",
  swap: "ledgerwallet://swap",
  buy: "ledgerwallet://buy",
  earn: "ledgerwallet://earn",
  sell: "ledgerwallet://buy",
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
export function buildWalletActionDeepLink(
  action: WalletTransactionFeature,
  context?: DeepLinkContext,
): string {
  const baseUrl = BASE_DEEPLINKS[action];

  if (!context?.currency) {
    return baseUrl;
  }

  switch (action) {
    case "send":
    case "receive":
      return `${baseUrl}?currency=${context.currency}`;
    case "swap":
      return `${baseUrl}?fromToken=${context.currency}`;
    case "earn":
      return `${baseUrl}?cryptoAssetId=${context.currency}`;
    case "buy":
    case "sell":
    default:
      return baseUrl;
  }
}

/**
 * URL to download the Ledger Wallet desktop application.
 */
export const LEDGER_WALLET_DOWNLOAD_URL =
  "https://shop.ledger.com/pages/ledger-wallet-download";
