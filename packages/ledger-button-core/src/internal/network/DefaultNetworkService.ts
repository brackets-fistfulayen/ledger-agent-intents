import { inject, injectable } from "inversify";
import { Either, EitherAsync } from "purify-ts";

import {
  DEFAULT_HEADERS,
  LEDGER_CLIENT_VERSION_HEADER,
  LEDGER_ORIGIN_TOKEN_HEADER,
} from "./model/constant.js";
import { type NetworkServiceOpts } from "./model/types.js";
import { merge } from "./utils/merge.js";
import PACKAGE from "../../../package.json" with { type: "json" };
import { NetworkError } from "../../api/errors/NetworkErrors.js";
import { configModuleTypes } from "../config/configModuleTypes.js";
import { Config } from "../config/model/config.js";
import { NetworkService } from "./NetworkService.js";

@injectable()
export class DefaultNetworkService
  implements NetworkService<NetworkServiceOpts>
{
  private headers: Record<string, string> = {};

  constructor(
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {
    const dynamicHeaders = {
      [LEDGER_ORIGIN_TOKEN_HEADER]: this.config.originToken,
      [LEDGER_CLIENT_VERSION_HEADER]: `ledger-button/${PACKAGE.version}/${this.config.dAppIdentifier}`,
    };

    this.headers = {
      ...DEFAULT_HEADERS,
      ...dynamicHeaders,
    };
  }

  async get<T>(
    url: string,
    options?: NetworkServiceOpts,
  ): Promise<Either<Error, T>> {
    const defaultOpts = {
      headers: this.headers,
      method: "GET",
    };

    return EitherAsync(async () => {
      const response = await fetch(url, merge(defaultOpts, options || {}));
      if (!response.ok) {
        throw new NetworkError("GET request failed", {
          status: response.status,
          url,
          options,
        });
      }
      return response.json();
    });
  }

  async post<T>(
    url: string,
    body: unknown,
    options?: NetworkServiceOpts,
  ): Promise<Either<Error, T>> {
    const defaultOpts = {
      headers: this.headers,
      method: "POST",
      body,
    };

    return EitherAsync(async () => {
      const response = await fetch(url, merge(defaultOpts, options || {}));
      if (!response.ok) {
        throw new NetworkError("POST request failed", {
          status: response.status,
          url,
          options,
          body,
        });
      }
      return response.json();
    });
  }

  async put<T>(
    url: string,
    body: unknown,
    options?: NetworkServiceOpts,
  ): Promise<Either<Error, T>> {
    const defaultOpts = {
      headers: this.headers,
      method: "PUT",
      body,
    };

    return EitherAsync(async () => {
      const response = await fetch(url, merge(defaultOpts, options || {}));
      if (!response.ok) {
        throw new NetworkError("PUT request failed", {
          status: response.status,
          url,
          options,
          body,
        });
      }
      return response.json();
    });
  }

  async patch<T>(
    url: string,
    body: unknown,
    options?: NetworkServiceOpts,
  ): Promise<Either<Error, T>> {
    const defaultOpts = {
      headers: this.headers,
      method: "PATCH",
      body,
    };

    return EitherAsync(async () => {
      const response = await fetch(url, merge(defaultOpts, options || {}));
      if (!response.ok) {
        throw new NetworkError("PATCH request failed", {
          status: response.status,
          url,
          options,
          body,
        });
      }
      return response.json();
    });
  }

  async delete<T>(
    url: string,
    options?: NetworkServiceOpts,
  ): Promise<Either<Error, T>> {
    const defaultOpts = {
      headers: this.headers,
      method: "DELETE",
    };

    return EitherAsync(async () => {
      const response = await fetch(url, merge(defaultOpts, options || {}));
      if (!response.ok) {
        throw new NetworkError("DELETE request failed", {
          status: response.status,
          url,
          options,
        });
      }
      return response.json();
    });
  }
}
