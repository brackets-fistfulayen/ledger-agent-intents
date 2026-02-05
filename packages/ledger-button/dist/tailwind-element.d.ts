import { CSSResult, LitElement } from 'lit';
type Constructor = new (...args: any[]) => LitElement;
export declare function tailwindElement(styles?: CSSResult): <T extends Constructor>(constructor: T) => T;
export {};
//# sourceMappingURL=tailwind-element.d.ts.map