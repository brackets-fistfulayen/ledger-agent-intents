import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLIError } from "../lib/errors.js";

/**
 * Print the skill markdown to stdout so agents can load it into their context.
 * Usage: ledger-intent context
 *        ledger-intent context >> .claude/skills/ledger-intent.md
 */
export function handleContext(): void {
	const dir = fileURLToPath(new URL("../..", import.meta.url));
	const skillPath = resolve(dir, "SKILL.md");

	let content: string;
	try {
		content = readFileSync(skillPath, "utf-8");
	} catch {
		throw new CLIError(`Could not read SKILL.md at ${skillPath}`);
	}

	process.stdout.write(content);
}
