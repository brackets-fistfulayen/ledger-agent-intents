export const LEDGER_CLIENT_VERSION_HEADER = "X-Ledger-Client-Version";
export const LEDGER_ORIGIN_TOKEN_HEADER = "X-Ledger-Origin-Token";

export const DEFAULT_HEADERS = {
  [LEDGER_CLIENT_VERSION_HEADER]: "ll-web-tools/0.0.0",
  "Content-Type": "application/json",
  // TODO add from config [LEDGER_ORIGIN_TOKEN_HEADER]: "TO BE REPLACED",
};
