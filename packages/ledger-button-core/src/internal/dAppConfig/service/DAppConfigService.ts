import { DAppConfig } from "../dAppConfigTypes.js";

export interface DAppConfigService {
  getDAppConfig(): Promise<DAppConfig>;
}
