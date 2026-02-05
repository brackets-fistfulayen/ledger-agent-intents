import { LedgerSyncAuthenticationError } from "./errors.js";
import { UserInteractionNeededResponse } from "./UserInteractionNeeded.js";

export type LedgerSyncAuthenticateResponse =
  | AuthContext
  | UserInteractionNeededResponse
  | LedgerSyncAuthenticationError;

export type AuthContext = {
  trustChainId: string;
  applicationPath: string;
};
