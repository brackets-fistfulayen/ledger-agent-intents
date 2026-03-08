/**
 * Structured logger for Vercel serverless API.
 * Uses pino for JSON output (level, message, context, timestamp).
 */
// @ts-expect-error pino uses export= but Node ESM runtime handles the default import correctly
import pino from "pino";

export const logger = pino({
	level: process.env.LOG_LEVEL ?? "info",
	formatters: {
		level: (label) => ({ level: label }),
	},
	timestamp: pino.stdTimeFunctions.isoTime,
});
