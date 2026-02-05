import { type Factory, inject, injectable } from "inversify";
import { Either } from "purify-ts";

import {
  FailedToFetchEncryptedAccountsError,
  NoAccountInSyncError,
} from "../../../api/errors/LedgerSyncErrors.js";
import { configModuleTypes } from "../../config/configModuleTypes.js";
import { Config } from "../../config/model/config.js";
import { InternalAuthContext } from "../../ledgersync/model/InternalAuthContext.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { networkModuleTypes } from "../../network/networkModuleTypes.js";
import { type NetworkService } from "../../network/NetworkService.js";
import { CloudSyncData } from "../model/cloudSyncTypes.js";
import { CloudSyncService } from "./CloudSyncService.js";

@injectable()
export class DefaultCloudSyncService implements CloudSyncService {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(networkModuleTypes.NetworkService)
    private readonly networkService: NetworkService<RequestInit>,
    @inject(configModuleTypes.Config)
    private readonly config: Config,
  ) {
    this.logger = loggerFactory("[Cloud Sync Service]");
  }

  async fetchEncryptedAccounts(
    authContext: InternalAuthContext,
  ): Promise<CloudSyncData> {
    // TODO: Handle version ?
    const params = new URLSearchParams({
      path: authContext.applicationPath,
      id: authContext.trustChainId,
      version: "0",
    });

    const response: Either<Error, CloudSyncData> =
      await this.networkService.get<CloudSyncData>(
        `${this.config.lkrp.cloudSyncUrl}/atomic/v1/live?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authContext.jwt.access_token}`,
            "x-ledger-client-version": "ll-web-tools/0.0.0",
          },
        },
      );

    return response.caseOf({
      Right: (data) => {
        if (data.status === "no-data") {
          throw new NoAccountInSyncError("No data found");
        }

        return data;
      },
      Left: (error) => {
        this.logger.error("Failed to fetch encrypted accounts", { error });
        throw new FailedToFetchEncryptedAccountsError(
          "Failed to fetch encrypted accounts",
        );
      },
    });
  }
}
