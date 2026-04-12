import { CLIError } from "../lib/errors.js";
import { colors } from "../lib/format.js";

/**
 * Health check -- does not require credentials.
 */
export async function handleHealth(baseUrl: string): Promise<void> {
	const url = `${baseUrl.replace(/\/+$/, "")}/api/health`;

	let res: Response;
	try {
		res = await globalThis.fetch(url);
	} catch (err) {
		throw new CLIError(`Cannot reach ${url}: ${err instanceof Error ? err.message : String(err)}`);
	}

	const contentType = res.headers.get("content-type") ?? "";
	if (!contentType.includes("application/json")) {
		throw new CLIError(
			`Health endpoint returned ${contentType || "no content-type"} (status ${res.status})`,
		);
	}

	const data = (await res.json()) as Record<string, unknown>;

	console.log(`${colors.bold("API:")}       ${url}`);
	console.log(
		`${colors.bold("Status:")}    ${res.ok ? colors.green(String(data.status ?? "ok")) : colors.red(String(data.status ?? res.status))}`,
	);
	if (data.db !== undefined) {
		console.log(
			`${colors.bold("Database:")}  ${data.db === "ok" ? colors.green("ok") : colors.red(String(data.db))}`,
		);
	}
	if (data.timestamp) {
		console.log(`${colors.bold("Time:")}      ${data.timestamp}`);
	}
}
