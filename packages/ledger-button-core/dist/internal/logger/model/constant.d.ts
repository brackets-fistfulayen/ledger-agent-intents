export declare const LOG_LEVELS: {
    readonly fatal: 0;
    readonly error: 1;
    readonly warn: 2;
    readonly info: 3;
    readonly debug: 4;
};
export type LogLevelKey = keyof typeof LOG_LEVELS;
export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
//# sourceMappingURL=constant.d.ts.map