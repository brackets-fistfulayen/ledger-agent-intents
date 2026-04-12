import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CLIError } from "./errors.js";

export interface AgentCredentialFile {
	version: number;
	label: string;
	trustchainId: string;
	privateKey: string;
	publicKey: string;
	createdAt: string;
}

const home = process.env.HOME ?? process.env.USERPROFILE;
const DEFAULT_PATHS = [
	"./agent-credential.json",
	...(home ? [resolve(home, ".config", "ledger-agent", "credential.json")] : []),
];

function resolveCredentialPath(flagValue?: string): string {
	if (flagValue) return resolve(flagValue);

	const envPath = process.env.AGENT_CREDENTIAL;
	if (envPath) return resolve(envPath);

	for (const p of DEFAULT_PATHS) {
		const abs = resolve(p);
		if (existsSync(abs)) return abs;
	}

	throw new CLIError(
		"No credential file found. Provide --credential <path>, set AGENT_CREDENTIAL env, or place agent-credential.json in the current directory.",
	);
}

/**
 * Resolve credential path and load+validate the file in a single pass.
 */
export function loadCredential(flagValue?: string): AgentCredentialFile {
	const absPath = resolveCredentialPath(flagValue);

	let raw: string;
	try {
		raw = readFileSync(absPath, "utf-8");
	} catch {
		throw new CLIError(`Cannot read credential file: ${absPath}`);
	}

	let cred: AgentCredentialFile;
	try {
		cred = JSON.parse(raw) as AgentCredentialFile;
	} catch {
		throw new CLIError(`Invalid JSON in credential file: ${absPath}`);
	}

	if (!cred.privateKey) {
		throw new CLIError("Credential file is missing 'privateKey' field.");
	}
	if (!cred.trustchainId) {
		throw new CLIError("Credential file is missing 'trustchainId' field.");
	}
	if (typeof cred.version !== "number") {
		throw new CLIError("Credential file is missing or has invalid 'version' field.");
	}

	return cred;
}
