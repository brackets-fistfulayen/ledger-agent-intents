/**
 * HTTP helpers for Vercel Functions
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

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
			console.error(`[API Error] ${method} ${req.url}:`, error);
			const message =
				error instanceof Error ? error.message : "Internal server error";
			res.status(500).json({
				success: false,
				error: message,
			});
		}
	};
}

/**
 * Set CORS headers for responses
 */
export function setCorsHeaders(res: VercelResponse, req?: VercelRequest) {
	// If the request provides an Origin, reflect it so cookies can be used.
	// (Access-Control-Allow-Origin cannot be '*' when credentials are included.)
	const origin = req?.headers?.origin;
	if (origin) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Access-Control-Allow-Credentials", "true");
	} else {
		res.setHeader("Access-Control-Allow-Origin", "*");
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
 * Parse and validate request body
 */
export function parseBody<T>(req: VercelRequest): T {
	return req.body as T;
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
