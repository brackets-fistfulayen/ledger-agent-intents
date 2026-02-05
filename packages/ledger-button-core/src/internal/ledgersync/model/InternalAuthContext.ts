import { JWT } from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol";

export type InternalAuthContext = {
  jwt: JWT;
  encryptionKey: Uint8Array;
  trustChainId: string;
  applicationPath: string;
  keyPair: Uint8Array;
};
