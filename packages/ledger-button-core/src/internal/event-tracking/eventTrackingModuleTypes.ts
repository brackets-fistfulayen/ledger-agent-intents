export const eventTrackingModuleTypes = {
  EventTrackingService: Symbol.for("EventTrackingService"),
  TrackFloatingButtonClick: Symbol.for("TrackFloatingButtonClick"),
  TrackOpenSession: Symbol.for("TrackOpenSession"),
  TrackLedgerSyncOpened: Symbol.for("TrackLedgerSyncOpened"),
  TrackLedgerSyncActivated: Symbol.for("TrackLedgerSyncActivated"),
  TrackOnboarding: Symbol.for("TrackOnboarding"),
  TrackTransactionStarted: Symbol.for("TrackTransactionStarted"),
  TrackTransactionCompleted: Symbol.for("TrackTransactionCompleted"),
  TrackTypedMessageStarted: Symbol.for("TrackTypedMessageStarted"),
  TrackTypedMessageCompleted: Symbol.for("TrackTypedMessageCompleted"),
  TrackWalletAction: Symbol.for("TrackWalletAction"),
};
