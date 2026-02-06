/**
 * Test script: create an x402 payment intent using an agent JSON credential.
 *
 * This script demonstrates the full authenticated agent flow:
 *   1. Load the agent credential file (JSON keyfile downloaded during provisioning)
 *   2. Build the AgentAuth header (EIP-191 personal_sign)
 *   3. POST an x402 payment intent to the API
 *
 * Usage:
 *   npx tsx src/test-intent-x402-credential.ts <recipient-address> <credential-file>
 *
 * Examples:
 *   # Against local backend
 *   npx tsx src/test-intent-x402-credential.ts 0x73F3e0b80D7826F872CfF58d6FE06d87fBd13ACc ./agent-credential.json
 *
 *   # Against Vercel deployment
 *   API_URL=https://your-app.vercel.app npx tsx src/test-intent-x402-credential.ts 0xRecipient ./agent-credential.json
 *
 * Environment variables:
 *   API_URL       – Backend URL (default: http://localhost:3005)
 *   AMOUNT        – USDC amount in human-readable units (default: 0.01)
 *   RESOURCE_URL  – x402 resource URL (default: https://api.example.com/v1/ai/completion)
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, toHex } from "viem";
import type {
	CreateIntentRequest,
	X402AcceptedExactEvm,
	X402Resource,
} from "@agent-intents/shared";

// =============================================================================
// Configuration
// =============================================================================

const API_BASE = (process.env.API_URL || "http://localhost:3005").replace(/\/+$/, "");
const AMOUNT = process.env.AMOUNT || "0.01";
const RESOURCE_URL =
	process.env.RESOURCE_URL || "https://api.example.com/v1/ai/completion";

// Base Mainnet USDC
const CHAIN_ID = 8453;
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_LOGO =
	"https://assets.coingecko.com/coins/images/6319/large/usdc.png";
const USDC_DECIMALS = 6;

// =============================================================================
// Credential loading
// =============================================================================

interface AgentCredentialFile {
	version: number;
	label: string;
	trustchainId: string;
	privateKey: string;
	publicKey: string;
	createdAt: string;
}

function loadCredential(filePath: string): AgentCredentialFile {
	const absPath = resolve(filePath);
	const raw = readFileSync(absPath, "utf-8");
	const cred = JSON.parse(raw) as AgentCredentialFile;

	if (!cred.privateKey || !cred.trustchainId) {
		throw new Error(
			"Invalid credential file: missing privateKey or trustchainId",
		);
	}
	return cred;
}

// =============================================================================
// AgentAuth header
// =============================================================================

async function buildAgentAuthHeader(
	privateKey: `0x${string}`,
	body: string,
): Promise<string> {
	const account = privateKeyToAccount(privateKey);
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const bodyHash = keccak256(toHex(body));
	const message = `${timestamp}.${bodyHash}`;
	const signature = await account.signMessage({ message });
	return `AgentAuth ${timestamp}.${bodyHash}.${signature}`;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Convert a human-readable amount (e.g. "0.01") to atomic units string.
 */
function toAtomicUnits(amount: string, decimals: number): string {
	const parts = amount.split(".");
	const intPart = parts[0] || "0";
	const fracPart = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals);
	return BigInt(`${intPart}${fracPart}`).toString();
}

function extractDomain(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

function log(emoji: string, message: string, data?: unknown) {
	console.log(`${emoji} ${message}`);
	if (data) {
		console.log(JSON.stringify(data, null, 2));
	}
}

// =============================================================================
// Main
// =============================================================================

async function main() {
	// ---- Parse CLI arguments ----
	const args = process.argv.slice(2);
	if (args.length < 2) {
		console.error(
			"Usage: npx tsx src/test-intent-x402-credential.ts <recipient-address> <credential-file>",
		);
		console.error(
			"\nExample: npx tsx src/test-intent-x402-credential.ts 0x73F3...ACc ./agent-credential.json",
		);
		process.exit(1);
	}

	const recipientAddress = args[0]!;
	const credentialPath = args[1]!;

	// ---- Load credential ----
	log("🔑", `Loading credential from: ${credentialPath}`);
	const credential = loadCredential(credentialPath);
	log("✅", `Credential loaded: "${credential.label}" (trustchain: ${credential.trustchainId})`);

	// ---- Build the intent request body ----
	const atomicAmount = toAtomicUnits(AMOUNT, USDC_DECIMALS);

	const x402Resource: X402Resource = {
		url: RESOURCE_URL,
		description: `API endpoint at ${extractDomain(RESOURCE_URL)}`,
		mimeType: "application/json",
	};

	const x402Accepted: X402AcceptedExactEvm = {
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
	};

	const intentRequest: CreateIntentRequest = {
		agentId: `agent-${credential.label.toLowerCase().replace(/\s+/g, "-")}`,
		agentName: credential.label,
		details: {
			type: "transfer",
			token: "USDC",
			tokenAddress: USDC_ADDRESS,
			tokenLogo: USDC_LOGO,
			amount: AMOUNT,
			amountWei: atomicAmount,
			recipient: recipientAddress,
			chainId: CHAIN_ID,
			memo: `x402 API payment: ${AMOUNT} USDC to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)} for ${extractDomain(RESOURCE_URL)}`,
			resource: RESOURCE_URL,
			category: "api_payment",
			merchant: {
				name: extractDomain(RESOURCE_URL),
				url: RESOURCE_URL,
			},
			x402: {
				resource: x402Resource,
				accepted: x402Accepted,
			},
		},
		urgency: "normal",
		expiresInMinutes: 30,
	};

	const body = JSON.stringify(intentRequest);

	// ---- Sign the request ----
	log("🔏", "Signing request with agent key...");
	const authHeader = await buildAgentAuthHeader(
		credential.privateKey as `0x${string}`,
		body,
	);
	log("✅", "AgentAuth header created");

	// ---- POST the intent ----
	const url = `${API_BASE}/api/intents`;
	log("📤", `Posting x402 intent to: ${url}`);
	log("📋", "Request payload:", intentRequest);

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: authHeader,
			},
			body,
		});

		const contentType = response.headers.get("content-type") ?? "";

		if (!contentType.includes("application/json")) {
			const text = await response.text();
			console.error(`\n❌ Expected JSON but got ${contentType}`);
			console.error("Response snippet:", text.slice(0, 300));
			process.exit(1);
		}

		const data = await response.json();

		if (response.ok) {
			log("✅", "Intent created successfully!");
			log("📦", "Response:", data);
			log("🆔", `Intent ID: ${data.intent?.id}`);
			log(
				"👆",
				"Open the web app and approve this intent with your Ledger device",
			);
		} else {
			console.error("\n❌ Failed to create intent");
			console.error("Status:", response.status);
			console.error("Response:", JSON.stringify(data, null, 2));
			process.exit(1);
		}
	} catch (error) {
		console.error("\n❌ Error posting intent:", error);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
