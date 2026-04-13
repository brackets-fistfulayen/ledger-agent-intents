import type { IntentApiClient } from "../lib/api-client.js";
import { colors, formatIntentRow } from "../lib/format.js";

export async function handleHistory(
	args: string[],
	client: IntentApiClient,
): Promise<void> {
	let limit = 10;
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--limit" && args[i + 1]) {
			limit = Number.parseInt(args[i + 1] ?? "", 10);
			if (Number.isNaN(limit) || limit < 1) limit = 10;
			i++;
		}
	}

	const data = await client.listIntents({ limit });

	if (!data.intents || data.intents.length === 0) {
		console.log(colors.dim("No operations found."));
		return;
	}

	console.log(`${colors.bold("Recent Operations")} (${data.intents.length})`);
	console.log("");

	for (const intent of data.intents) {
		console.log(formatIntentRow(intent));
		console.log("");
	}
}
