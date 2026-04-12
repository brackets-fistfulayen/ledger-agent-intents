import type { IntentStatus } from "@agent-intents/shared";
import { INTENT_TRANSITIONS } from "@agent-intents/shared";
import type { IntentApiClient } from "../lib/api-client.js";
import { CLIError } from "../lib/errors.js";
import { colors, formatIntent, statusLabel } from "../lib/format.js";

const TERMINAL_STATUSES = Object.entries(INTENT_TRANSITIONS)
	.filter(([, transitions]) => transitions.length === 0)
	.map(([status]) => status);

interface PollOpts {
	interval: number; // seconds
	timeout: number; // seconds
}

export function parsePollArgs(args: string[]): { intentId: string; opts: PollOpts } {
	const intentId = args[0];
	if (!intentId) {
		throw new CLIError(
			"Usage: ledger-intent poll <intent-id> [--interval <seconds>] [--timeout <seconds>]",
		);
	}

	const opts: PollOpts = { interval: 5, timeout: 300 };

	for (let i = 1; i < args.length; i++) {
		if (args[i] === "--interval" && args[i + 1]) {
			opts.interval = Number.parseInt(args[i + 1] ?? "", 10);
			if (Number.isNaN(opts.interval) || opts.interval < 1) {
				throw new CLIError("Invalid interval: must be a positive integer (seconds)");
			}
			i++;
		} else if (args[i] === "--timeout" && args[i + 1]) {
			opts.timeout = Number.parseInt(args[i + 1] ?? "", 10);
			if (Number.isNaN(opts.timeout) || opts.timeout < 1) {
				throw new CLIError("Invalid timeout: must be a positive integer (seconds)");
			}
			i++;
		}
	}

	return { intentId, opts };
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function handlePoll(args: string[], client: IntentApiClient): Promise<void> {
	const { intentId, opts } = parsePollArgs(args);
	const deadline = Date.now() + opts.timeout * 1000;

	console.log(
		`Polling ${colors.bold(intentId)} every ${opts.interval}s (timeout: ${opts.timeout}s)`,
	);
	console.log("");

	let lastStatus: IntentStatus | undefined;

	while (Date.now() < deadline) {
		const data = await client.getIntent(intentId);

		if (!data.intent) {
			throw new CLIError(`Intent not found: ${intentId}`);
		}

		const currentStatus = data.intent.status;

		if (currentStatus !== lastStatus) {
			const ts = new Date().toLocaleTimeString();
			console.log(`  ${colors.dim(ts)}  ${statusLabel(currentStatus)}`);
			lastStatus = currentStatus;
		}

		if (TERMINAL_STATUSES.includes(currentStatus)) {
			console.log("");
			console.log(formatIntent(data.intent));
			console.log("");
			return;
		}

		await sleep(opts.interval * 1000);
	}

	console.log("");
	console.log(
		colors.yellow(`Timeout after ${opts.timeout}s. Last status: ${lastStatus ?? "unknown"}`),
	);
}
