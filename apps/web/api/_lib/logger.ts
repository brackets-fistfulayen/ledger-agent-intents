/**
 * Structured logger for Vercel serverless API.
 * Uses pino for JSON output (level, message, context, timestamp).
 */
import * as pinoModule from "pino";
const pino = (pinoModule as { default?: typeof pinoModule }).default ?? pinoModule;

export const logger = pino({
	level: process.env.LOG_LEVEL ?? "info",
	formatters: {
		level: (label) => ({ level: label }),
	},
	timestamp: pino.stdTimeFunctions.isoTime,
});
