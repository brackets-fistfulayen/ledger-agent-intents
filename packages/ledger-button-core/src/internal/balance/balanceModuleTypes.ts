export const balanceModuleTypes = {
  BalanceService: Symbol.for("BalanceService"),
  AlpacaDataSource: Symbol.for("AlpacaDataSource"),
  CalDataSource: Symbol.for("CalDataSource"),
  CounterValueDataSource: Symbol.for("CounterValueDataSource"),
  GasFeeEstimationService: Symbol.for("GasFeeEstimationService"),
} as const;
