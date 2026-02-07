/**
 * Catch-all proxy for Ledger DMK API calls.
 *
 * Uses Vercel filesystem routing ([...path].ts) instead of route rewrites
 * to avoid issues with Vercel deployment protection + route matching.
 *
 * URL pattern:
 *   /api/ledger-proxy/cal/dapps?...       → https://crypto-assets-service.api.ledger.com/v1/dapps?...
 *   /api/ledger-proxy/web3checks/eth/...  → https://web3checks-backend.api.ledger.com/v3/eth/...
 *   /api/ledger-proxy/metadata/v1/eth/... → https://nft.api.live.ledger.com/v1/eth/...
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/http.js";
import { logger } from "../_lib/logger.js";

/** Ledger API key injected server-side */
const LEDGER_API_KEY = process.env.LEDGER_API_KEY ?? "";

/** Allowed upstream targets and their base URLs */
const UPSTREAM_TARGETS: Record<string, string> = {
	cal: "https://crypto-assets-service.api.ledger.com/v1",
	web3checks: "https://web3checks-backend.api.ledger.com/v3",
	metadata: "https://nft.api.live.ledger.com",
};

/** Headers we never forward to the upstream */
const STRIP_HEADERS = new Set([
	"host",
	"connection",
	"transfer-encoding",
	"content-length",
	"cookie",
	"authorization",
	"origin",
	"referer",
	"x-ledger-client-origin",
	"x-ledger-client-version",
	"x-forwarded-for",
	"x-forwarded-host",
	"x-forwarded-proto",
	"x-real-ip",
	"x-vercel-id",
	"x-vercel-deployment-url",
	"x-vercel-forwarded-for",
	"x-vercel-proxy-signature",
	"x-vercel-proxy-signature-ts",
]);

/** Headers we never forward back to the client */
const STRIP_RESPONSE = new Set(["transfer-encoding", "connection", "set-cookie"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
	setCorsHeaders(res, req);

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	// Parse path segments: first segment = target, rest = upstream path
	const rawPath = req.query.path;
	const segments = Array.isArray(rawPath) ? rawPath : typeof rawPath === "string" ? [rawPath] : [];

	if (segments.length === 0) {
		res
			.status(400)
			.json({ error: "Missing target. Use: /api/ledger-proxy/{cal|web3checks|metadata}/..." });
		return;
	}

	const target = segments[0];
	const baseUrl = UPSTREAM_TARGETS[target];
	if (!baseUrl) {
		res.status(400).json({
			error: `Unknown target "${target}". Use: ${Object.keys(UPSTREAM_TARGETS).join(", ")}`,
		});
		return;
	}

	// Build upstream path from remaining segments
	const upstreamPath = segments.length > 1 ? `/${segments.slice(1).join("/")}` : "";
	const upstreamUrl = new URL(`${baseUrl}${upstreamPath}`);

	// Forward query params (except "path" which is the catch-all param)
	for (const [key, value] of Object.entries(req.query)) {
		if (key === "path") continue;
		const values = Array.isArray(value) ? value : [value];
		for (const v of values) {
			if (v !== undefined) upstreamUrl.searchParams.append(key, v);
		}
	}

	// Build upstream headers
	const upstreamHeaders: Record<string, string> = {};
	for (const [key, value] of Object.entries(req.headers)) {
		if (STRIP_HEADERS.has(key.toLowerCase())) continue;
		if (typeof value === "string") upstreamHeaders[key] = value;
	}
	upstreamHeaders["x-ledger-client-origin"] = LEDGER_API_KEY;

	const method = req.method ?? "GET";
	const body = method !== "GET" && method !== "HEAD" ? JSON.stringify(req.body) : undefined;

	logger.info(
		{ target, upstreamPath, method, hasApiKey: LEDGER_API_KEY.length > 0 },
		"ledger-proxy",
	);

	try {
		const upstream = await fetch(upstreamUrl.toString(), {
			method,
			headers: upstreamHeaders,
			body,
		});

		if (!upstream.ok) {
			const errBody = await upstream
				.clone()
				.text()
				.catch(() => "");
			logger.warn(
				{ target, upstreamPath, status: upstream.status, errBody: errBody.slice(0, 500) },
				"ledger-proxy: non-2xx",
			);
		}

		for (const [key, value] of upstream.headers.entries()) {
			if (!STRIP_RESPONSE.has(key.toLowerCase())) res.setHeader(key, value);
		}

		const responseBody = await upstream.arrayBuffer();
		res.status(upstream.status).end(Buffer.from(responseBody));
	} catch (err) {
		logger.error({ err, target, upstreamPath }, "ledger-proxy: upstream failed");
		res.status(502).json({ error: "Upstream request failed" });
	}
}
