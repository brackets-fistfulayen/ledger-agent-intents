import { ContainerModule } from "inversify";

import { AlpacaDataSource } from "./datasource/alpaca/AlpacaDataSource.js";
import { DefaultAlpacaDataSource } from "./datasource/alpaca/DefaultAlpacaDataSource.js";
import { CalDataSource } from "./datasource/cal/CalDataSource.js";
import { DefaultCalDataSource } from "./datasource/cal/DefaultCalDataSource.js";
import { CounterValueDataSource } from "./datasource/countervalue/CounterValueDataSource.js";
import { DefaultCounterValueDataSource } from "./datasource/countervalue/DefaultCounterValueDataSource.js";
import { BalanceService } from "./service/BalanceService.js";
import { DefaultBalanceService } from "./service/DefaultBalanceService.js";
import { DefaultGasFeeEstimationService } from "./service/DefaultGasFeeEstimationService.js";
import { GasFeeEstimationService } from "./service/GasFeeEstimationService.js";
import { balanceModuleTypes } from "./balanceModuleTypes.js";

type BalanceModuleOptions = {
  stub?: boolean;
};

export function balanceModuleFactory({ stub }: BalanceModuleOptions) {
  return new ContainerModule(({ bind }) => {
    bind<BalanceService>(balanceModuleTypes.BalanceService)
      .to(DefaultBalanceService)
      .inSingletonScope();

    bind<GasFeeEstimationService>(balanceModuleTypes.GasFeeEstimationService)
      .to(DefaultGasFeeEstimationService)
      .inSingletonScope();

    bind<AlpacaDataSource>(balanceModuleTypes.AlpacaDataSource)
      .to(DefaultAlpacaDataSource)
      .inSingletonScope();

    bind<CalDataSource>(balanceModuleTypes.CalDataSource)
      .to(DefaultCalDataSource)
      .inSingletonScope();

    bind<CounterValueDataSource>(balanceModuleTypes.CounterValueDataSource)
      .to(DefaultCounterValueDataSource)
      .inSingletonScope();

    if (stub) {
      /*
      rebindSync<AlpacaDataSource>(balanceModuleTypes.AlpacaDataSource)
        .to(StubAlpacaDataSource)
        .inSingletonScope();
*/
      //TODO: add stubs for CalDataSource and AlpacaDataSource
    }
  });
}
