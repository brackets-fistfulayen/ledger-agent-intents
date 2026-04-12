import type { IntentApiClient } from "../lib/api-client.js";
import { CLIError } from "../lib/errors.js";
import { formatIntent } from "../lib/format.js";

export async function handleStatus(
	intentId: string | undefined,
	client: IntentApiClient,
): Promise<void> {
	if (!intentId) {
		throw new CLIError("Usage: ledger-intent status <intent-id>");
	}

	const data = await client.getIntent(intentId);

	if (data.intent) {
		console.log("");
		console.log(formatIntent(data.intent));
		console.log("");
	}
}
