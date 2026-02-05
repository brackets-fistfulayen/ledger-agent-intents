import { Either } from "purify-ts";

import {
  AlpacaBalance,
  AlpacaFeeEstimationResponse,
  AlpacaTransactionIntent,
} from "./alpacaTypes.js";

export interface AlpacaDataSource {
  getBalanceForAddressAndCurrencyId(
    address: string,
    currencyId: string,
  ): Promise<Either<Error, AlpacaBalance[]>>;

  estimateTransactionFee(
    network: string,
    intent: AlpacaTransactionIntent,
  ): Promise<Either<Error, AlpacaFeeEstimationResponse>>;
}
