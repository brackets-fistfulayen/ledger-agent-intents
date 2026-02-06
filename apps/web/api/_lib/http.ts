/**
 * HTTP helpers for Vercel Functions
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { z } from "zod";
import { getAllowedOrigins } from "./env.js";
import { logger } from "./logger.js";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

type RouteHandlers = Partial<Record<HttpMethod, Handler>>;

/**
 * Method router - dispatch to the right handler based on HTTP method
 */
export function methodRouter(handlers: RouteHandlers) {
	return async (req: VercelRequest, res: VercelResponse) => {
		// Handle CORS preflight
		if (req.method === "OPTIONS") {
			setCorsHeaders(res, req);
			res.status(200).end();
			return;
		}

		const method = req.method as HttpMethod;
		const handler = handlers[method];

		if (!handler) {
			setCorsHeaders(res, req);
			res.status(405).json({
				success: false,
				error: `Method ${method} not allowed`,
			});
			return;
		}

		try {
			setCorsHeaders(res, req);
			await handler(req, res);
		} catch (error) {
			logger.error({ err: error, method, url: req.url }, "API error");
			res.status(500).json({
				success: false,
				error: "Internal server error",
			});
		}
	};
}

/**
 * Set CORS headers for responses.
 * Uses ALLOWED_ORIGINS env (comma-separated). Empty = allow request origin (dev).
 */
export function setCorsHeaders(res: VercelResponse, req?: VercelRequest) {
	const allowed = getAllowedOrigins();
	const origin = req?.headers?.origin;

	if (allowed.length > 0) {
		if (origin && allowed.includes(origin)) {
			res.setHeader("Access-Control-Allow-Origin", origin);
			res.setHeader("Access-Control-Allow-Credentials", "true");
		} else {
			res.setHeader("Access-Control-Allow-Origin", allowed[0] ?? "*");
		}
	} else {
		// Dev fallback: reflect request origin so cookies work
		if (origin) {
			res.setHeader("Access-Control-Allow-Origin", origin);
			res.setHeader("Access-Control-Allow-Credentials", "true");
		} else {
			res.setHeader("Access-Control-Allow-Origin", "*");
		}
	}
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH, DELETE, OPTIONS"
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/**
 * Send a JSON success response
 */
export function jsonSuccess<T extends object>(
	res: VercelResponse,
	data: T,
	status = 200
) {
	res.status(status).json({ success: true, ...data });
}

/**
 * Send a JSON error response
 */
export function jsonError(res: VercelResponse, error: string, status = 400) {
	res.status(status).json({ success: false, error });
}

/**
 * Parse and validate request body with a Zod schema.
 * On failure sends 400 and returns null; on success returns the parsed data.
 */
export function parseBodyWithSchema<T>(
	req: VercelRequest,
	res: VercelResponse,
	schema: z.ZodType<T>,
): T | null {
	const result = schema.safeParse(req.body);
	if (result.success) {
		return result.data;
	}
	const flattened = result.error.flatten();
	const message = flattened.formErrors[0] ?? Object.values(flattened.fieldErrors).flat()[0] ?? "Validation failed";
	jsonError(res, message, 400);
	return null;
}

/**
 * Get query parameter as string
 */
export function getQueryParam(
	req: VercelRequest,
	key: string
): string | undefined {
	const value = req.query[key];
	return Array.isArray(value) ? value[0] : value;
}

/**
 * Get query parameter as number with bounds
 */
export function getQueryNumber(
	req: VercelRequest,
	key: string,
	defaultValue: number,
	min?: number,
	max?: number
): number {
	const raw = getQueryParam(req, key);
	if (!raw) return defaultValue;
	
	let num = parseInt(raw, 10);
	if (isNaN(num)) return defaultValue;
	
	if (min !== undefined && num < min) num = min;
	if (max !== undefined && num > max) num = max;
	
	return num;
}
