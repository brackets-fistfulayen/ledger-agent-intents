export type UserInteractionNeeded =
  | "unlock-device"
  | "allow-secure-connection"
  | "confirm-open-app"
  | "sign-transaction"
  | "allow-list-apps"
  | "web3-checks-opt-in"
  | "sign-personal-message"
  | "sign-typed-data"
  | "lkrp-authenticate";

export type UserInteractionNeededResponse = {
  requiredUserInteraction: UserInteractionNeeded;
};
