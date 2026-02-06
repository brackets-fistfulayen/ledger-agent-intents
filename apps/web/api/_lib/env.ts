/**
 * Environment variable validation for Vercel serverless API.
 * Validated at module load time when this module is first imported.
 */
import { z } from "zod";

const envSchema = z.object({
	POSTGRES_URL: z.string().min(1, "POSTGRES_URL is required"),
	/** Required for /api/cron/expire-intents. Optional so app loads when cron is not used (e.g. local dev). */
	CRON_SECRET: z.string().optional(),
	/** Comma-separated list of allowed CORS origins. Empty or unset = allow current origin (dev). */
	ALLOWED_ORIGINS: z.string().optional().default(""),
});

function getEnv() {
	const raw = {
		POSTGRES_URL: process.env.POSTGRES_URL ?? "",
		CRON_SECRET: process.env.CRON_SECRET,
		ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
	};

	const result = envSchema.safeParse(raw);
	if (!result.success) {
		const messages = result.error.flatten().fieldErrors;
		const combined = Object.entries(messages)
			.map(([k, v]) => `${k}: ${(v ?? []).join(", ")}`)
			.join("; ");
		throw new Error(`Invalid environment: ${combined}`);
	}
	return result.data;
}

export const env = getEnv();

/** List of allowed CORS origins. Empty array means allow request origin (dev fallback). */
export function getAllowedOrigins(): string[] {
	const raw = env.ALLOWED_ORIGINS.trim();
	if (!raw) return [];
	return raw
		.split(",")
		.map((o) => o.trim())
		.filter(Boolean);
}
