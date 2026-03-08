/**
 * Structured logger for Vercel serverless API.
 * Uses pino for JSON output (level, message, context, timestamp).
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
import pino = require("pino");

export const logger = pino({
	level: process.env.LOG_LEVEL ?? "info",
	formatters: {
		level: (label) => ({ level: label }),
	},
	timestamp: pino.stdTimeFunctions.isoTime,
});
