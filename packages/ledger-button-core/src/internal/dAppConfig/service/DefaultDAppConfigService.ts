import { inject, injectable } from "inversify";

import { backendModuleTypes } from "../../backend/backendModuleTypes.js";
import { type BackendService } from "../../backend/BackendService.js";
import { configModuleTypes } from "../../config/configModuleTypes.js";
import { Config } from "../../config/model/config.js";
import { DAppConfig } from "../dAppConfigTypes.js";
import { DAppConfigService } from "./DAppConfigService.js";

@injectable()
export class DefaultDAppConfigService implements DAppConfigService {
  private dAppConfig: DAppConfig | null = null;

  constructor(
    @inject(configModuleTypes.Config)
    private readonly config: Config,
    @inject(backendModuleTypes.BackendService)
    private readonly backendService: BackendService,
  ) {}

  async getDAppConfig(): Promise<DAppConfig> {
    if (this.dAppConfig) {
      return this.dAppConfig;
    }

    const dAppIdentifier = this.config.dAppIdentifier;
    const config = await this.backendService.getConfig({ dAppIdentifier });

    if (config.isRight()) {
      this.dAppConfig = config.extract();
    } else {
      throw new Error("Failed to get DApp config");
    }

    return this.dAppConfig;
  }
}
