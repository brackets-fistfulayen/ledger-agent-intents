import type { Intent, IntentStatus } from "@agent-intents/shared";
import { getChainName } from "@agent-intents/shared";

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
	const lines: string[] = [];
	lines.push(`${colors.bold("Intent:")} ${intent.id}`);
	lines.push(`  Status:    ${statusLabel(intent.status)}`);
	lines.push(`  Amount:    ${colors.bold(intent.details.amount)} ${intent.details.token}`);
	lines.push(`  To:        ${intent.details.recipient}`);
	lines.push(`  Chain:     ${getChainName(intent.details.chainId)} (${intent.details.chainId})`);
	if (intent.details.memo) {
		lines.push(`  Memo:      ${intent.details.memo}`);
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
	const status = statusLabel(intent.status);
	const amount = `${intent.details.amount} ${intent.details.token}`;
	const to = `${intent.details.recipient.slice(0, 10)}...`;
	const memo = intent.details.memo ? ` "${intent.details.memo}"` : "";
	return `${status}  ${intent.id}\n   ${amount} -> ${to}${memo}`;
}

export function formatError(err: unknown): string {
	const message = err instanceof Error ? err.message : String(err);
	return colors.red(`Error: ${message}`);
}
