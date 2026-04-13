import type { CreateIntentRequest, IntentUrgency } from "@agent-intents/shared";
import { SUPPORTED_CHAINS, isSupportedChain } from "@agent-intents/shared";
import type { IntentApiClient } from "../lib/api-client.js";
import type { AgentCredentialFile } from "../lib/credential.js";
import { CLIError } from "../lib/errors.js";
import { colors, formatIntent } from "../lib/format.js";

interface CallArgs {
	to: string;
	data: string;
	value?: string;
	memo?: string;
	chainId: number;
	urgency: IntentUrgency;
}

export function parseCallArgs(args: string[]): CallArgs {
	if (args.length < 2) {
		throw new CLIError(
			'Usage: ledger-intent call <contract-address> <calldata> [--value <wei>] [--memo "reason"] [--chain <id>] [--urgency <level>]',
		);
	}

	const to = args[0] ?? "";
	const data = args[1] ?? "";

	if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
		throw new CLIError(`Invalid contract address: ${to}`);
	}
	if (!/^0x[a-fA-F0-9]*$/.test(data)) {
		throw new CLIError(`Invalid calldata hex: ${data}`);
	}
	if (data.length < 10) {
		throw new CLIError("Calldata must include at least a 4-byte function selector");
	}

	let value: string | undefined;
	let memo: string | undefined;
	let chainId = 8453;
	let urgency: IntentUrgency = "normal";

	for (let i = 2; i < args.length; i++) {
		if (args[i] === "--value" && args[i + 1]) {
			value = args[i + 1] ?? "";
			i++;
		} else if (args[i] === "--memo" && args[i + 1]) {
			memo = (args[i + 1] ?? "").replace(/^["']|["']$/g, "");
			i++;
		} else if (args[i] === "--chain" && args[i + 1]) {
			chainId = Number.parseInt(args[i + 1] ?? "", 10);
			if (Number.isNaN(chainId)) {
				throw new CLIError(`Invalid chain ID: ${args[i + 1]}`);
			}
			i++;
		} else if (args[i] === "--urgency" && args[i + 1]) {
			const u = args[i + 1] ?? "";
			if (!["low", "normal", "high", "critical"].includes(u)) {
				throw new CLIError(`Invalid urgency: ${u}. Valid values: low, normal, high, critical`);
			}
			urgency = u as IntentUrgency;
			i++;
		}
	}

	if (!isSupportedChain(chainId)) {
		const supported = Object.entries(SUPPORTED_CHAINS)
			.map(([id, c]) => `${id} (${c.name})`)
			.join(", ");
		throw new CLIError(`Unsupported chain: ${chainId}. Supported: ${supported}`);
	}

	return { to, data, value, memo, chainId, urgency };
}

export async function handleCall(
	args: string[],
	client: IntentApiClient,
	credential: AgentCredentialFile,
): Promise<void> {
	const { to, data, value, memo, chainId, urgency } = parseCallArgs(args);
	const agentId = `agent-${credential.label.toLowerCase().replace(/\s+/g, "-")}`;

	const request: CreateIntentRequest = {
		agentId,
		agentName: credential.label,
		details: {
			type: "contract",
			to,
			data,
			value,
			chainId,
			memo,
		},
		urgency,
	};

	const response = await client.createIntent(request);

	if (response.intent) {
		console.log(colors.green("Contract call intent created successfully"));
		console.log("");
		console.log(formatIntent(response.intent));
		if (response.paymentUrl) {
			console.log("");
			console.log(`  ${colors.cyan("Review:")}  ${response.paymentUrl}`);
		}
	}
}
