export const LOG_LEVELS = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
} as const;

export type LogLevelKey = keyof typeof LOG_LEVELS;
export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
