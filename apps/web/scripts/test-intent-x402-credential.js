/**
 * Test script: create an x402-like payment intent against the *real* API
 * (Vercel Functions under apps/web/api).
 *
 * It matches the production AgentAuth algorithm implemented in:
 *   apps/web/api/_lib/agentAuth.ts
 *
 * Usage (from repo root):
 *   pnpm --filter @agent-intents/web run test:intent:x402 -- \
 *     0xRecipient \
 *     "/absolute/path/to/agent-credential.json"
 *
 * Or:
 *   API_URL="https://agent-intents-web.vercel.app" AMOUNT="0.01" RESOURCE_URL="https://api.example.com/v1/ai" \
 *   node apps/web/scripts/test-intent-x402-credential.js 0xRecipient "/path/to/credential.json"
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const API_BASE = (process.env.API_URL || "https://agent-intents-web.vercel.app").replace(
	/\/+$/,
	"",
);

const AMOUNT = process.env.AMOUNT || "0.01";
const RESOURCE_URL = process.env.RESOURCE_URL || "https://api.example.com/v1/ai/completion";

// Base mainnet (x402 demo in this repo uses USDC on Base)
const CHAIN_ID = 8453;
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_LOGO = "https://assets.coingecko.com/coins/images/6319/large/usdc.png";
const USDC_DECIMALS = 6;

function toAtomicUnits(amount, decimals) {
	const [intPartRaw, fracPartRaw = ""] = amount.split(".");
	const intPart = intPartRaw?.length ? intPartRaw : "0";
	const fracPart = fracPartRaw.padEnd(decimals, "0").slice(0, decimals);
	return BigInt(`${intPart}${fracPart}`).toString();
}

function extractDomain(url) {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

function loadCredential(filePath) {
	const absPath = resolve(filePath);
	const raw = readFileSync(absPath, "utf-8");
	const cred = JSON.parse(raw);

	if (!cred?.privateKey || !cred?.trustchainId) {
		throw new Error("Invalid credential file: missing privateKey or trustchainId");
	}

	return /** @type {{ label?: string; trustchainId: string; privateKey: `0x${string}` }} */ (cred);
}

/**
 * Build Authorization header: `AgentAuth <timestamp>.<bodyHash>.<signature>`
 *
 * - timestamp: epoch seconds
 * - bodyHash: keccak256(toHex(rawJsonBodyString))
 * - signature: EIP-191 personal_sign over `${timestamp}.${bodyHash}`
 */
async function buildAgentAuthHeader(privateKey, rawBody) {
	const account = privateKeyToAccount(privateKey);
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const bodyHash = keccak256(toHex(rawBody));
	const message = `${timestamp}.${bodyHash}`;
	const signature = await account.signMessage({ message });
	return `AgentAuth ${timestamp}.${bodyHash}.${signature}`;
}

async function main() {
	const args = process.argv.slice(2);
	// pnpm sometimes forwards an extra `--` to the underlying command
	while (args[0] === "--") args.shift();

	const [recipientAddress, credentialPath] = args;

	if (!recipientAddress || !credentialPath) {
		// eslint-disable-next-line no-console
		console.error(
			"Usage: node apps/web/scripts/test-intent-x402-credential.js <recipient-address> <credential-file>",
		);
		process.exit(1);
	}

	const credential = loadCredential(credentialPath);
	const agentLabel = credential.label || "agent";

	// x402 demo payload: accepted requirements for EVM exact (EIP-3009)
	const atomicAmount = toAtomicUnits(AMOUNT, USDC_DECIMALS);

	const intentRequest = {
		agentId: `agent-${agentLabel.toLowerCase().replace(/\s+/g, "-")}`,
		agentName: agentLabel,
		details: {
			type: "transfer",
			token: "USDC",
			tokenAddress: USDC_ADDRESS,
			tokenLogo: USDC_LOGO,
			amount: AMOUNT,
			amountWei: atomicAmount,
			recipient: recipientAddress,
			chainId: CHAIN_ID,
			memo: `x402 API payment: ${AMOUNT} USDC for ${extractDomain(RESOURCE_URL)}`,
			resource: RESOURCE_URL,
			category: "api_payment",
			merchant: {
				name: extractDomain(RESOURCE_URL),
				url: RESOURCE_URL,
			},
			x402: {
				resource: {
					url: RESOURCE_URL,
					description: `API endpoint at ${extractDomain(RESOURCE_URL)}`,
					mimeType: "application/json",
				},
				accepted: {
					scheme: "exact",
					network: `eip155:${CHAIN_ID}`,
					amount: atomicAmount,
					asset: USDC_ADDRESS,
					payTo: recipientAddress,
					maxTimeoutSeconds: 300,
					extra: {
						name: "USD Coin",
						version: "2",
						decimals: USDC_DECIMALS,
					},
				},
			},
		},
		urgency: "normal",
		expiresInMinutes: 30,
	};

	// IMPORTANT: the body hash is computed from the exact string sent over the wire.
	const body = JSON.stringify(intentRequest);
	const authHeader = await buildAgentAuthHeader(credential.privateKey, body);

	const url = `${API_BASE}/api/intents`;

	// eslint-disable-next-line no-console
	console.log(`Posting intent to ${url}`);
	// eslint-disable-next-line no-console
	console.log(`Using trustchainId ${credential.trustchainId} (agent "${agentLabel}")`);

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: authHeader,
		},
		body,
	});

	const contentType = response.headers.get("content-type") ?? "";
	const text = await response.text();

	if (!contentType.includes("application/json")) {
		// eslint-disable-next-line no-console
		console.error(`Expected JSON but got ${contentType || "(no content-type)"}`);
		// eslint-disable-next-line no-console
		console.error(text.slice(0, 500));
		process.exit(1);
	}

	const data = JSON.parse(text);

	if (!response.ok) {
		// eslint-disable-next-line no-console
		console.error(`Request failed (${response.status})`);
		// eslint-disable-next-line no-console
		console.error(JSON.stringify(data, null, 2));
		if (response.status === 401 && String(data?.error || "").includes("Agent not registered")) {
			// eslint-disable-next-line no-console
			console.error(
				"\nThis agent key is not registered on that deployment. Register it via POST /api/agents/register (requires Ledger device authorizationSignature), then retry.",
			);
		}
		process.exit(1);
	}

	// eslint-disable-next-line no-console
	console.log("Intent created:");
	// eslint-disable-next-line no-console
	console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exit(1);
});
