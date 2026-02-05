import { inject, injectable } from "inversify";
import { Either, Left, Right } from "purify-ts";

import { configModuleTypes } from "../../../config/configModuleTypes.js";
import type { Config } from "../../../config/model/config.js";
import type { NetworkServiceOpts } from "../../../network/model/types.js";
import { networkModuleTypes } from "../../../network/networkModuleTypes.js";
import type { NetworkService } from "../../../network/NetworkService.js";
import type { CounterValueDataSource } from "./CounterValueDataSource.js";
import type {
  CounterValuedResponse,
  CounterValueResult,
} from "./counterValueTypes.js";

@injectable()
export class DefaultCounterValueDataSource implements CounterValueDataSource {
  constructor(
    @inject(networkModuleTypes.NetworkService)
    private readonly networkService: NetworkService<NetworkServiceOpts>,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {}

  async getCounterValues(
    ledgerIds: string[],
    targetCurrency: string,
  ): Promise<Either<Error, CounterValueResult[]>> {
    if (ledgerIds.length === 0) {
      return Right([]);
    }

    const fromsParam = ledgerIds.join(",");
    const requestUrl = `${this.config.getCounterValueUrl()}/v3/spot/simple?froms=${encodeURIComponent(fromsParam)}&to=${targetCurrency}`;

    const response: Either<Error, CounterValuedResponse> =
      await this.networkService.get(requestUrl);

    if (response.isLeft()) {
      return Left(new Error("Failed to fetch counter values"));
    }

    const counterValueData = response.extract() as CounterValuedResponse;
    const results: CounterValueResult[] = ledgerIds.map((ledgerId) => ({
      ledgerId,
      rate: counterValueData[ledgerId] ?? 0,
    }));

    return Right(results);
  }
}
