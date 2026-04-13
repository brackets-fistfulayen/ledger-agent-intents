import type { CreateIntentRequest, IntentUrgency } from "@agent-intents/shared";
import {
	SUPPORTED_CHAINS,
	SUPPORTED_TOKENS,
	type SupportedChainId,
	isSupportedChain,
	resolveToken,
} from "@agent-intents/shared";
import type { IntentApiClient } from "../lib/api-client.js";
import type { AgentCredentialFile } from "../lib/credential.js";
import { CLIError } from "../lib/errors.js";
import { colors, formatIntent } from "../lib/format.js";

const VALID_URGENCIES = ["low", "normal", "high", "critical"] as const;

interface SendArgs {
	amount: string;
	token: string;
	recipient: string;
	memo?: string;
	chainId: number;
	urgency: IntentUrgency;
}

export function parseSendArgs(args: string[]): SendArgs {
	if (args.length < 4 || args[2] !== "to") {
		throw new CLIError(
			'Usage: ledger-intent send <amount> <token> to <address> [for "reason"] [--chain <id>] [--urgency <level>]',
		);
	}

	const amount = args[0] ?? "";
	const token = (args[1] ?? "").toUpperCase();
	const recipient = args[3] ?? "";

	if (Number.isNaN(Number(amount)) || Number(amount) <= 0) {
		throw new CLIError(`Invalid amount: ${amount}`);
	}
	if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
		throw new CLIError(`Invalid Ethereum address: ${recipient}`);
	}

	let memo: string | undefined;
	let chainId = 8453;
	let urgency: IntentUrgency = "normal";

	for (let i = 4; i < args.length; i++) {
		if (args[i] === "for" && args[i + 1]) {
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
			if (!VALID_URGENCIES.includes(u as IntentUrgency)) {
				throw new CLIError(`Invalid urgency: ${u}. Valid values: ${VALID_URGENCIES.join(", ")}`);
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

	return { amount, token, recipient, memo, chainId, urgency };
}

export async function handleSend(
	args: string[],
	client: IntentApiClient,
	credential: AgentCredentialFile,
): Promise<void> {
	const { amount, token, recipient, memo, chainId, urgency } = parseSendArgs(args);

	// Resolve token: check SUPPORTED_TOKENS first, then Ledger API
	const staticEntry = SUPPORTED_TOKENS[chainId as SupportedChainId]?.[token];
	let tokenAddress: string;

	if (staticEntry) {
		tokenAddress = staticEntry.address;
	} else {
		const resolved = await resolveToken(chainId, token);
		if (!resolved) {
			throw new CLIError(
				`Token ${token} not found on chain ${chainId}. Checked built-in tokens and Ledger crypto-assets API.`,
			);
		}
		tokenAddress = resolved.address;
		console.log(colors.dim(`Resolved ${token}: ${resolved.name ?? token} (${tokenAddress})`));
	}

	const agentId = `agent-${credential.label.toLowerCase().replace(/\s+/g, "-")}`;

	const request: CreateIntentRequest = {
		agentId,
		agentName: credential.label,
		details: {
			type: "transfer",
			token,
			tokenAddress,
			amount,
			recipient,
			chainId,
			memo,
		},
		urgency,
	};

	const data = await client.createIntent(request);

	if (data.intent) {
		console.log(colors.green("Intent created successfully"));
		console.log("");
		console.log(formatIntent(data.intent));
		if (data.paymentUrl) {
			console.log("");
			console.log(`  ${colors.cyan("Review:")}  ${data.paymentUrl}`);
		}
	}
}
