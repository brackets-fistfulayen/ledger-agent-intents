import { BackendService } from '../../backend/BackendService.js';
import { Config } from '../../config/model/config.js';
import { DAppConfig } from '../dAppConfigTypes.js';
import { DAppConfigService } from './DAppConfigService.js';
export declare class DefaultDAppConfigService implements DAppConfigService {
    private readonly config;
    private readonly backendService;
    private dAppConfig;
    constructor(config: Config, backendService: BackendService);
    getDAppConfig(): Promise<DAppConfig>;
}
//# sourceMappingURL=DefaultDAppConfigService.d.ts.map