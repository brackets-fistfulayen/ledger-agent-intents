import type { IntentStatus } from "@agent-intents/shared";
import { INTENT_TRANSITIONS } from "@agent-intents/shared";
import type { IntentApiClient } from "../lib/api-client.js";
import { CLIError } from "../lib/errors.js";
import { colors, formatIntentRow } from "../lib/format.js";

const VALID_STATUSES = Object.keys(INTENT_TRANSITIONS);

interface ListOpts {
	status?: IntentStatus;
	limit?: number;
}

export function parseListArgs(args: string[]): ListOpts {
	const opts: ListOpts = {};

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--status" && args[i + 1]) {
			const s = args[i + 1] ?? "";
			if (!VALID_STATUSES.includes(s)) {
				throw new CLIError(`Invalid status: ${s}. Valid values: ${VALID_STATUSES.join(", ")}`);
			}
			opts.status = s as IntentStatus;
			i++;
		} else if (args[i] === "--limit" && args[i + 1]) {
			opts.limit = Number.parseInt(args[i + 1] ?? "", 10);
			if (Number.isNaN(opts.limit) || opts.limit < 1) {
				throw new CLIError("Invalid limit: must be a positive integer");
			}
			i++;
		}
	}

	return opts;
}

export async function handleList(args: string[], client: IntentApiClient): Promise<void> {
	const opts = parseListArgs(args);
	const data = await client.listIntents(opts);

	if (!data.intents || data.intents.length === 0) {
		console.log(colors.dim("No intents found."));
		return;
	}

	console.log("");
	for (const intent of data.intents) {
		console.log(formatIntentRow(intent));
		console.log("");
	}
}
