import { IntentApiClient } from "./lib/api-client.js";
import { loadCredential } from "./lib/credential.js";
import { CLIError } from "./lib/errors.js";
import { formatError } from "./lib/format.js";

import { handleBalance } from "./commands/balance.js";
import { handleCall } from "./commands/call.js";
import { handleContext } from "./commands/context.js";
import { handleHealth } from "./commands/health.js";
import { handleHistory } from "./commands/history.js";
import { handleList } from "./commands/list.js";
import { handlePoll } from "./commands/poll.js";
import { handleSend } from "./commands/send.js";
import { handleStatus } from "./commands/status.js";

const VERSION = "0.2.0";

interface GlobalFlags {
	credentialPath?: string;
	apiUrl: string;
	command: string;
	commandArgs: string[];
}

function parseGlobalFlags(argv: string[]): GlobalFlags {
	let credentialPath: string | undefined;
	let apiUrl = process.env.INTENT_API_URL ?? "http://localhost:3005";
	const remaining: string[] = [];

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i] ?? "";
		if (arg === "--credential" && argv[i + 1]) {
			credentialPath = argv[i + 1] ?? "";
			i++;
		} else if (arg === "--api" && argv[i + 1]) {
			apiUrl = argv[i + 1] ?? "";
			i++;
		} else if (arg === "--no-color") {
			process.env.NO_COLOR = "1";
		} else {
			remaining.push(arg);
		}
	}

	const command = remaining[0] ?? "";
	const commandArgs = remaining.slice(1);

	return { credentialPath, apiUrl, command, commandArgs };
}

function printHelp(): void {
	console.log(`
ledger-intent -- Submit payment intents for Ledger signing

USAGE
  ledger-intent <command> [options]

COMMANDS
  send <amount> <token> to <address> [for "reason"]    Create a transfer intent
  call <address> <calldata> [--value <wei>]             Create a contract call intent
  status <intent-id>                                    Get intent status
  list [--status <status>] [--limit <n>]                List your intents
  poll <intent-id> [--interval <s>] [--timeout <s>]     Poll until terminal state
  balance [--chain <id>] [--token <ticker>]             Show wallet balances
  history [--limit <n>]                                 Show recent operations
  health                                                Check API connectivity
  context                                               Print skill file for agent context

GLOBAL OPTIONS
  --credential <path>    Path to agent credential JSON file
  --api <url>            API base URL (default: http://localhost:3005)
  --no-color             Disable colored output
  -h, --help             Show help
  -v, --version          Show version

ENVIRONMENT
  AGENT_CREDENTIAL       Path to credential file (overridden by --credential)
  INTENT_API_URL         API base URL (overridden by --api)

EXAMPLES
  ledger-intent send 50 USDC to 0x1234...5678 for "podcast music"
  ledger-intent send 0.01 USDC to 0xabc...def --chain 84532
  ledger-intent call 0xContract... 0xa9059cbb... --memo "swap tokens"
  ledger-intent status int_1707048000_abc123
  ledger-intent poll int_1707048000_abc123 --timeout 600
  ledger-intent list --status pending
  ledger-intent health --api https://www.agentintents.io
`);
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	// Early exits
	if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
		printHelp();
		return;
	}
	if (args.includes("-v") || args.includes("--version")) {
		console.log(VERSION);
		return;
	}

	const flags = parseGlobalFlags(args);

	// Commands that don't need credentials
	if (flags.command === "health") {
		await handleHealth(flags.apiUrl);
		return;
	}
	if (flags.command === "context") {
		handleContext();
		return;
	}

	// All other commands need credentials and an API client
	if (!flags.command) {
		printHelp();
		return;
	}

	const credential = loadCredential(flags.credentialPath);
	const client = new IntentApiClient({
		baseUrl: flags.apiUrl,
		credential,
	});

	switch (flags.command) {
		case "send":
			await handleSend(flags.commandArgs, client, credential);
			break;
		case "call":
			await handleCall(flags.commandArgs, client, credential);
			break;
		case "status":
			await handleStatus(flags.commandArgs[0], client);
			break;
		case "list":
			await handleList(flags.commandArgs, client);
			break;
		case "poll":
			await handlePoll(flags.commandArgs, client);
			break;
		case "balance":
			await handleBalance(flags.commandArgs, credential);
			break;
		case "history":
			await handleHistory(flags.commandArgs, client);
			break;
		default:
			console.error(`Unknown command: ${flags.command}`);
			printHelp();
			process.exit(1);
	}
}

main().catch((err) => {
	if (err instanceof CLIError) {
		console.error(formatError(err));
		process.exit(err.exitCode);
	}
	console.error(formatError(err));
	process.exit(1);
});
