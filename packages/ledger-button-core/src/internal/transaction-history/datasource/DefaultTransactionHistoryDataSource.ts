import { inject, injectable } from "inversify";
import { Either } from "purify-ts";

import { configModuleTypes } from "../../config/configModuleTypes.js";
import { Config } from "../../config/model/config.js";
import type { NetworkServiceOpts } from "../../network/model/types.js";
import { networkModuleTypes } from "../../network/networkModuleTypes.js";
import type { NetworkService } from "../../network/NetworkService.js";
import { TransactionHistoryError } from "../model/TransactionHistoryError.js";
import {
  ExplorerResponse,
  TransactionHistoryOptions,
} from "../model/transactionHistoryTypes.js";
import type { TransactionHistoryDataSource } from "./TransactionHistoryDataSource.js";

const DEFAULT_BATCH_SIZE = 20;

@injectable()
export class DefaultTransactionHistoryDataSource
  implements TransactionHistoryDataSource
{
  constructor(
    @inject(networkModuleTypes.NetworkService)
    private readonly networkService: NetworkService<NetworkServiceOpts>,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {}

  async getTransactions(
    blockchain: string,
    address: string,
    options?: TransactionHistoryOptions,
  ): Promise<Either<TransactionHistoryError, ExplorerResponse>> {
    const queryParams = this.buildQueryParams(options);
    const requestUrl = this.buildRequestUrl(blockchain, address, queryParams);

    const result = await this.networkService.get<ExplorerResponse>(requestUrl);

    return result.mapLeft(
      (error) =>
        new TransactionHistoryError(
          `Failed to fetch transaction history for ${address}`,
          { address, blockchain, originalError: error.message },
        ),
    );
  }

  private buildQueryParams(options?: TransactionHistoryOptions): string {
    const params = new URLSearchParams();

    params.set("batch_size", String(options?.batchSize ?? DEFAULT_BATCH_SIZE));
    params.set("order", "descending");
    params.set("noinput", "true");
    params.set("filtering", "true");

    if (options?.pageToken) {
      params.set("token", options.pageToken);
    }

    return params.toString();
  }

  private buildRequestUrl(
    blockchain: string,
    address: string,
    queryParams: string,
  ): string {
    const baseUrl = this.config.getExplorerUrl();
    return `${baseUrl}/blockchain/v4/${blockchain}/address/${address}/txs?${queryParams}`;
  }
}
