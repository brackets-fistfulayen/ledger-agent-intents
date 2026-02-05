import { inject, injectable } from "inversify";
import { Either, Left, Right } from "purify-ts";

import type { EventRequest, EventResponse } from "./model/trackEvent.js";
import { BroadcastTransactionError } from "../../api/errors/NetworkErrors.js";
import { configModuleTypes } from "../config/configModuleTypes.js";
import { Config } from "../config/model/config.js";
import type { NetworkServiceOpts } from "../network/model/types.js";
import { networkModuleTypes } from "../network/networkModuleTypes.js";
import type { NetworkService } from "../network/NetworkService.js";
import type { BackendService } from "./BackendService.js";
import { ConfigResponseSchema } from "./schemas.js";
import type {
  BroadcastRequest,
  BroadcastResponse,
  ConfigRequest,
  ConfigResponse,
} from "./types.js";

@injectable()
export class DefaultBackendService implements BackendService {
  constructor(
    @inject(networkModuleTypes.NetworkService)
    private readonly networkService: NetworkService<NetworkServiceOpts>,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {}

  async broadcast(
    request: BroadcastRequest,
    domain = "ledger-button-domain",
  ): Promise<Either<Error, BroadcastResponse>> {
    const url = `${this.config.getBackendUrl()}/broadcast`;

    const headers = {
      "Content-Type": "application/json",
      "X-Ledger-client-origin": this.config.originToken,
      "X-Ledger-Domain": domain,
    };

    const options: NetworkServiceOpts = {
      headers,
    };

    const result = await this.networkService.post<BroadcastResponse>(
      url,
      JSON.stringify(request),
      options,
    );

    return result.mapLeft((error: Error) => {
      return new BroadcastTransactionError(
        `Broadcast failed: ${error.message}`,
        {
          error,
        },
      );
    });
  }

  async getConfig(request: ConfigRequest) {
    const url = `${this.config.getBackendUrl()}/config?dAppIdentifier=${encodeURIComponent(
      request.dAppIdentifier,
    )}`;

    const headers = {
      "X-Ledger-Domain": this.config.dAppIdentifier, //TODO verify if this is correct
      "X-Ledger-client-origin": this.config.originToken,
    };

    const options: NetworkServiceOpts = {
      headers,
    };

    const result = await this.networkService.get<ConfigResponse>(url, options);

    return result
      .mapLeft(
        (error: Error) => new Error(`Get config failed: ${error.message}`),
      )
      .map((res: unknown) => ConfigResponseSchema.safeParse(res))
      .chain((parsed) =>
        parsed.success ? Right(parsed.data) : Left(parsed.error),
      );
  }

  async event(
    request: EventRequest,
    domain = "ledger-button-domain",
  ): Promise<Either<Error, EventResponse>> {
    const url = `${this.config.getBackendUrl()}/event`;

    const headers = {
      "Content-Type": "application/json",
      "X-Ledger-Domain": domain,
    };

    const options: NetworkServiceOpts = {
      headers,
    };

    const result = await this.networkService.post<EventResponse>(
      url,
      JSON.stringify(request),
      options,
    );

    return result.mapLeft(
      (error: Error) => new Error(`Event tracking failed: ${error.message}`),
    );
  }
}
