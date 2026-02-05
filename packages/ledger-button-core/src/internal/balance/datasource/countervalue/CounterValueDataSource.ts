import type { Either } from "purify-ts";

import type { CounterValueResult } from "./counterValueTypes.js";

export interface CounterValueDataSource {
  getCounterValues(
    ledgerIds: string[],
    targetCurrency: string,
  ): Promise<Either<Error, CounterValueResult[]>>;
}
