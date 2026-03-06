import type { VercelRequest } from "@vercel/node";
import { logger } from "./logger.js";

const IP_RATE_LIMIT_MAX_REQUESTS = Number.parseInt(
	process.env.IP_RATE_LIMIT_MAX_REQUESTS ?? "120",
	10,
);
const IP_RATE_LIMIT_WINDOW_MS = Number.parseInt(process.env.IP_RATE_LIMIT_WINDOW_MS ?? "60000", 10);

const ipRateLimitStore = new Map<string, { count: number; resetTime: number }>();
let lastRateLimitCleanup = Date.now();

function cleanupRateLimitStore(now: number) {
	// Opportunistic cleanup once per minute to keep memory bounded.
	if (now - lastRateLimitCleanup < 60_000) return;
	lastRateLimitCleanup = now;

	for (const [ip, entry] of ipRateLimitStore) {
		if (entry.resetTime <= now) {
			ipRateLimitStore.delete(ip);
		}
	}
}

export function getClientIp(req: VercelRequest): string | null {
	const forwardedFor = req.headers["x-forwarded-for"];
	if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
		return forwardedFor.split(",")[0]?.trim() ?? null;
	}

	const realIp = req.headers["x-real-ip"];
	if (typeof realIp === "string" && realIp.length > 0) {
		return realIp.trim();
	}

	const vercelForwardedFor = req.headers["x-vercel-forwarded-for"];
	if (typeof vercelForwardedFor === "string" && vercelForwardedFor.length > 0) {
		return vercelForwardedFor.split(",")[0]?.trim() ?? null;
	}

	return req.socket?.remoteAddress ?? null;
}

export function checkIpRateLimit(req: VercelRequest): {
	allowed: boolean;
	retryAfterSeconds?: number;
} {
	const now = Date.now();
	cleanupRateLimitStore(now);

	const ip = getClientIp(req) ?? "unknown";
	const existing = ipRateLimitStore.get(ip);

	if (!existing || existing.resetTime <= now) {
		ipRateLimitStore.set(ip, {
			count: 1,
			resetTime: now + IP_RATE_LIMIT_WINDOW_MS,
		});
		return { allowed: true };
	}

	if (existing.count >= IP_RATE_LIMIT_MAX_REQUESTS) {
		const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
		return { allowed: false, retryAfterSeconds };
	}

	existing.count += 1;
	return { allowed: true };
}

export function logAuthFailure(params: {
	req: VercelRequest;
	status: 401 | 403;
	reason: string;
	walletAddress?: string;
}) {
	logger.warn(
		{
			event: "auth_failure",
			endpoint: params.req.url ?? "unknown",
			method: params.req.method ?? "unknown",
			ip: getClientIp(params.req),
			walletAddress: params.walletAddress?.toLowerCase(),
			status: params.status,
			reason: params.reason,
			timestamp: new Date().toISOString(),
		},
		"Authorization failure",
	);
}
