import { keccak256, toHex } from "viem";
import { type PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";

// Cache derived accounts to avoid repeated EC key derivation
const accountCache = new Map<string, PrivateKeyAccount>();

function getAccount(privateKey: `0x${string}`): PrivateKeyAccount {
	let account = accountCache.get(privateKey);
	if (!account) {
		account = privateKeyToAccount(privateKey);
		accountCache.set(privateKey, account);
	}
	return account;
}

/**
 * The header format matches the verification in apps/web/api/_lib/agentAuth.ts:
 * `AgentAuth <timestamp>.<bodyHash>.<signature>`
 */
export async function buildAgentAuthHeader(
	privateKey: `0x${string}`,
	method: "GET" | "POST",
	body?: string,
): Promise<string> {
	const account = getAccount(privateKey);
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const bodyHash = method === "GET" || !body ? "0x" : keccak256(toHex(body));
	const message = `${timestamp}.${bodyHash}`;
	const signature = await account.signMessage({ message });
	return `AgentAuth ${timestamp}.${bodyHash}.${signature}`;
}
