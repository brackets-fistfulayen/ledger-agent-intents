import type { CreateIntentRequest, IntentUrgency } from "@agent-intents/shared";
import {
	SUPPORTED_CHAINS,
	SUPPORTED_TOKENS,
	type SupportedChainId,
	isSupportedChain,
} from "@agent-intents/shared";
import type { IntentApiClient } from "../lib/api-client.js";
import type { AgentCredentialFile } from "../lib/credential.js";
import { CLIError } from "../lib/errors.js";
import { colors, formatIntent } from "../lib/format.js";

const VALID_URGENCIES = ["low", "normal", "high", "critical"] as const;

interface SendArgs {
	amount: string;
	token: string;
	tokenAddress: string;
	recipient: string;
	memo?: string;
	chainId: number;
	urgency: IntentUrgency;
}

export function parseSendArgs(args: string[]): SendArgs {
	// Expected: <amount> <token> to <address> [for "reason"] [--chain <id>] [--urgency <level>]
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
	let chainId = 8453; // Default: Base mainnet
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

	// Validate chain
	if (!isSupportedChain(chainId)) {
		const supported = Object.entries(SUPPORTED_CHAINS)
			.map(([id, c]) => `${id} (${c.name})`)
			.join(", ");
		throw new CLIError(`Unsupported chain: ${chainId}. Supported: ${supported}`);
	}

	// Validate token on chain and resolve address
	const chainTokens = SUPPORTED_TOKENS[chainId as SupportedChainId];
	const tokenInfo = chainTokens?.[token];
	if (!tokenInfo) {
		const available = chainTokens ? Object.keys(chainTokens).join(", ") : "none";
		throw new CLIError(`Unsupported token ${token} on chain ${chainId}. Available: ${available}`);
	}

	return { amount, token, tokenAddress: tokenInfo.address, recipient, memo, chainId, urgency };
}

export async function handleSend(
	args: string[],
	client: IntentApiClient,
	credential: AgentCredentialFile,
): Promise<void> {
	const { amount, token, tokenAddress, recipient, memo, chainId, urgency } = parseSendArgs(args);
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
