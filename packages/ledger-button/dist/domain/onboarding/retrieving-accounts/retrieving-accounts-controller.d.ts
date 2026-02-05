import { ReactiveController, ReactiveControllerHost } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
export declare class RetrievingAccountsController implements ReactiveController {
    private readonly host;
    private readonly core;
    private readonly navigation;
    private readonly destinations;
    private readonly lang;
    errorData?: {
        message: string;
        title: string;
        cta1?: {
            label: string;
            action: () => void;
        };
        cta2?: {
            label: string;
            action: () => void;
        };
    };
    private hasNavigated;
    constructor(host: ReactiveControllerHost, core: CoreContext, navigation: Navigation, destinations: Destinations, lang: LanguageContext);
    hostConnected(): void;
    fetchAccounts(): void;
    mapError(error: unknown): void;
}
//# sourceMappingURL=retrieving-accounts-controller.d.ts.map