const INDEXED_DB_KEYS = {
  DB_NAME: "ledger-button-db",
  DB_STORE_NAME: "ledger-button-store",
  DB_STORE_KEYPAIR_KEY: "keyPair",
  ENCRYPTION_KEY: "encryptionKey",
  USER_CONSENT: "userConsent",
  WELCOME_SCREEN_COMPLETED: "welcomeScreenCompleted",
} as const;

export const INDEXED_DB_VERSION = 3;

const LOCAL_STORAGE_KEYS = {
  PREFIX: "ledger-button",
  SELECTED_ACCOUNT: "selectedAccount",
  TRUST_CHAIN_ID: "trustChainId",
  TRUST_CHAIN_VALIDITY: "trustChainValidity",
  DB_VERSION: "dbVersion",
} as const;

export const STORAGE_KEYS = {
  ...INDEXED_DB_KEYS,
  ...LOCAL_STORAGE_KEYS,
} as const;
