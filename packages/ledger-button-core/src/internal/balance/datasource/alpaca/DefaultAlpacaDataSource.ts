import { inject, injectable } from "inversify";
import { Either, Left, Right } from "purify-ts";

import { configModuleTypes } from "../../../config/configModuleTypes.js";
import { Config } from "../../../config/model/config.js";
import type { NetworkServiceOpts } from "../../../network/model/types.js";
import { networkModuleTypes } from "../../../network/networkModuleTypes.js";
import type { NetworkService } from "../../../network/NetworkService.js";
import { AlpacaServiceErrors } from "../../model/error.js";
import type { AlpacaDataSource } from "./AlpacaDataSource.js";
import {
  AlpacaBalance,
  AlpacaBalanceDto,
  AlpacaFeeEstimationRequest,
  AlpacaFeeEstimationResponse,
  AlpacaTransactionIntent,
} from "./alpacaTypes.js";

@injectable()
export class DefaultAlpacaDataSource implements AlpacaDataSource {
  constructor(
    @inject(networkModuleTypes.NetworkService)
    private readonly networkService: NetworkService<NetworkServiceOpts>,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {}

  async getBalanceForAddressAndCurrencyId(
    address: string,
    currencyId: string,
  ): Promise<Either<Error, AlpacaBalance[]>> {
    // Add check if blockchain is supported by Alpaca
    const requestUrl = `${this.config.getAlpacaUrl()}/v1/${currencyId}/account/${address}/balance`;
    const balanceResult: Either<Error, AlpacaBalanceDto[]> =
      await this.networkService.get(requestUrl);

    if (!balanceResult.isRight())
      return Left(new Error("Failed to fetch balance from Alpaca"));

    const balanceDtos = balanceResult.extract();

    if (!Array.isArray(balanceDtos))
      return Left(new Error("Failed to fetch balance from Alpaca"));

    const balances = balanceDtos.map((balance) => ({
      value: balance.value,
      type: balance.asset.type,
      reference: balance.asset.assetReference,
    }));

    return Right(balances);
  }

  async estimateTransactionFee(
    network: string,
    intent: AlpacaTransactionIntent,
  ): Promise<Either<Error, AlpacaFeeEstimationResponse>> {
    const requestUrl = `${this.config.getAlpacaUrl()}/v1/${network}/transaction/estimate`;
    const requestBody: AlpacaFeeEstimationRequest = { intent };

    const feeEstimationResult: Either<Error, AlpacaFeeEstimationResponse> =
      await this.networkService.post(requestUrl, JSON.stringify(requestBody));

    return feeEstimationResult.mapLeft((error) =>
      AlpacaServiceErrors.feeEstimationError(network, error)
    );
  }
}
