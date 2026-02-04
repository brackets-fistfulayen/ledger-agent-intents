import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export default async function handler(
	req: VercelRequest,
	res: VercelResponse
) {
	const { url, method, headers, body } = req;

	// Extract the path after /api/
	const path = url?.replace(/^\/api\/?/, "").split("?")[0] || "";
	const queryString = url?.includes("?") ? url.split("?")[1] : "";
	const targetUrl = `${BACKEND_URL}/api/${path}${queryString ? `?${queryString}` : ""}`;

	const proxyHeaders: HeadersInit = {
		"Content-Type": headers["content-type"] || "application/json",
	};

	// Forward authorization if present
	if (headers.authorization) {
		proxyHeaders["Authorization"] = headers.authorization;
	}

	// Handle preflight
	if (method === "OPTIONS") {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
		return res.status(200).end();
	}

	try {
		const response = await fetch(targetUrl, {
			method: method || "GET",
			headers: proxyHeaders,
			body: ["POST", "PUT", "PATCH"].includes(method || "")
				? JSON.stringify(body)
				: undefined,
		});

		const data = await response.text();

		// Set CORS headers
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

		res.status(response.status);
		res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
		res.send(data);
	} catch (error) {
		console.error("Proxy error:", error);
		res.status(502).json({
			success: false,
			error: "Backend unavailable",
		});
	}
}
