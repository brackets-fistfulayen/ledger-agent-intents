import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Destination } from './routes.js';
export declare const ANIMATION_DELAY = 300;
export declare class Navigation implements ReactiveController {
    private readonly modalContent;
    host: ReactiveControllerHost;
    history: Destination[];
    currentScreen: Destination | null;
    private navigationTimeoutId;
    constructor(host: ReactiveControllerHost, modalContent: HTMLElement);
    hostConnected(): void;
    hostDisconnected(): void;
    updateCurrentScreen(updates: Partial<Destination>): void;
    navigateTo(destination: Destination): void;
    navigateBack(): void;
    resetNavigation(): void;
    private clearNavigationTimeout;
    canGoBack(destination?: Destination): boolean;
}
//# sourceMappingURL=navigation.d.ts.map