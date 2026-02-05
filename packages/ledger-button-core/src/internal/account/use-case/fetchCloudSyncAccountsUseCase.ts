import { type Factory, inject, injectable } from "inversify";
import { lastValueFrom } from "rxjs";

import { base64ToArrayBuffer } from "../../../api/utils/base64Utils.js";
import { cloudSyncModuleTypes } from "../../cloudsync/cloudSyncModuleTypes.js";
import type { CloudSyncService } from "../../cloudsync/service/CloudSyncService.js";
import { ledgerSyncModuleTypes } from "../../ledgersync/ledgerSyncModuleTypes.js";
import { LedgerSyncAuthContextMissingError } from "../../ledgersync/model/errors.js";
import type { InternalAuthContext } from "../../ledgersync/model/InternalAuthContext.js";
import type { LedgerSyncService } from "../../ledgersync/service/LedgerSyncService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import type { CloudSyncData } from "../service/AccountService.js";

@injectable()
export class FetchCloudSyncAccountsUseCase {
  private logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(ledgerSyncModuleTypes.LedgerSyncService)
    private readonly ledgerSyncService: LedgerSyncService,
    @inject(cloudSyncModuleTypes.CloudSyncService)
    private readonly cloudSyncService: CloudSyncService,
  ) {
    this.logger = loggerFactory("FetchCloudSyncAccountsUseCase");
  }

  async execute(): Promise<CloudSyncData> {
    // Authenticate first to ensure we have a fresh JWT token
    await this.authenticateWithKeyPair();
    // Get authContext AFTER authentication to use the updated JWT
    const authContext = this.getAuthContextOrThrow();
    const accounts = await this.fetchAndDecryptAccounts(authContext);

    this.logger.info("Accounts fetched from cloud sync", accounts);
    return accounts;
  }

  private getAuthContextOrThrow(): InternalAuthContext {
    const authContext = this.ledgerSyncService.authContext;
    if (!authContext) {
      const error = new LedgerSyncAuthContextMissingError(
        "No auth context available",
      );
      this.logger.error("Missing auth context for fetching accounts", {
        error,
      });
      throw error;
    }
    return authContext;
  }

  private async authenticateWithKeyPair(): Promise<void> {
    await lastValueFrom(this.ledgerSyncService.authenticate());
  }

  private async fetchAndDecryptAccounts(
    authContext: InternalAuthContext,
  ): Promise<CloudSyncData> {
    const cloudSyncData =
      await this.cloudSyncService.fetchEncryptedAccounts(authContext);
    const payload = base64ToArrayBuffer(cloudSyncData.payload);
    const accountsData = await this.ledgerSyncService.decrypt(payload);

    return JSON.parse(new TextDecoder().decode(accountsData));
  }
}
