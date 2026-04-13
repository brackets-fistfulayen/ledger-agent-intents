import type { Intent, IntentStatus } from "@agent-intents/shared";
import { getChainName, isContractCallIntent, isTransferIntent } from "@agent-intents/shared";

function ansi(code: string): (text: string) => string {
	return (text) => {
		if (process.env.NO_COLOR || process.stdout.isTTY === false) return text;
		return `\x1b[${code}m${text}\x1b[0m`;
	};
}

export const colors = {
	bold: ansi("1"),
	dim: ansi("2"),
	green: ansi("32"),
	red: ansi("31"),
	yellow: ansi("33"),
	cyan: ansi("36"),
};

const STATUS_ICONS: Record<IntentStatus, string> = {
	pending: "o",
	approved: "+",
	rejected: "x",
	broadcasting: ">",
	authorized: "*",
	executing: "~",
	confirmed: "v",
	failed: "!",
	expired: "-",
};

const STATUS_COLORS: Record<IntentStatus, (text: string) => string> = {
	pending: colors.yellow,
	approved: colors.green,
	rejected: colors.red,
	broadcasting: colors.cyan,
	authorized: colors.green,
	executing: colors.cyan,
	confirmed: colors.green,
	failed: colors.red,
	expired: colors.dim,
};

export function statusLabel(status: IntentStatus): string {
	const icon = STATUS_ICONS[status] ?? "?";
	const colorFn = STATUS_COLORS[status] ?? colors.dim;
	return colorFn(`[${icon}] ${status}`);
}

export function formatIntent(intent: Intent): string {
	const { details } = intent;
	const lines: string[] = [];
	lines.push(`${colors.bold("Intent:")} ${intent.id}`);
	lines.push(`  Status:    ${statusLabel(intent.status)}`);

	if (isTransferIntent(details)) {
		lines.push(`  Amount:    ${colors.bold(details.amount)} ${details.token}`);
		lines.push(`  To:        ${details.recipient}`);
	} else if (isContractCallIntent(details)) {
		lines.push(`  Type:      ${colors.yellow("Contract Call")}`);
		lines.push(`  Contract:  ${details.to}`);
		lines.push(`  Data:      ${details.data.slice(0, 22)}...`);
		if (details.value && details.value !== "0") {
			lines.push(`  Value:     ${details.value} wei`);
		}
	}

	lines.push(`  Chain:     ${getChainName(details.chainId)} (${details.chainId})`);
	if (details.memo) {
		lines.push(`  Memo:      ${details.memo}`);
	}
	if (intent.agentName) {
		lines.push(`  Agent:     ${intent.agentName}`);
	}
	lines.push(`  Created:   ${intent.createdAt}`);
	if (intent.expiresAt) {
		lines.push(`  Expires:   ${intent.expiresAt}`);
	}
	if (intent.txHash) {
		lines.push(`  Tx:        ${intent.txHash}`);
	}
	if (intent.txUrl) {
		lines.push(`  Explorer:  ${intent.txUrl}`);
	}
	return lines.join("\n");
}

export function formatIntentRow(intent: Intent): string {
	const { details } = intent;
	const status = statusLabel(intent.status);
	const memo = details.memo ? ` "${details.memo}"` : "";

	if (isTransferIntent(details)) {
		const amount = `${details.amount} ${details.token}`;
		const to = `${details.recipient.slice(0, 10)}...`;
		return `${status}  ${intent.id}\n   ${amount} -> ${to}${memo}`;
	}
	if (isContractCallIntent(details)) {
		const to = `${details.to.slice(0, 10)}...`;
		const selector = details.data.slice(0, 10);
		return `${status}  ${intent.id}\n   Contract ${to} ${selector}${memo}`;
	}

	return `${status}  ${intent.id}${memo}`;
}

export function formatError(err: unknown): string {
	const message = err instanceof Error ? err.message : String(err);
	return colors.red(`Error: ${message}`);
}
