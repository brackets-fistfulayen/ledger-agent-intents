/**
 * Test script to post an intent to send 2 USDC on Base.
 *
 * Usage:
 *   pnpm --filter @agent-intents/backend run test:intent:base-usdc-2
 *
 * Optional overrides:
 *   USER_WALLET=0xYourAddress RECIPIENT=0xRecipient API_URL=http://localhost:3005 ...
 */

import type { CreateIntentRequest } from "@agent-intents/shared";

const API_BASE = process.env.API_URL || "http://localhost:3005";

// Base Mainnet
const CHAIN_ID = 8453;

// USDC on Base Mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_LOGO = "https://assets.coingecko.com/coins/images/6319/large/usdc.png";

const USER_WALLET =
	process.env.USER_WALLET || "0x55862D0711Fe9CE125dCe1b46973Be99E5Fd2592";
const RECIPIENT =
	process.env.RECIPIENT || "0x73F3e0b80D7826F872CfF58d6FE06d87fBd13ACc";

const intentRequest: CreateIntentRequest & { userId: string } = {
	userId: USER_WALLET,
	agentId: "test-agent",
	agentName: "Test Agent",
	details: {
		type: "transfer",
		token: "USDC",
		tokenAddress: USDC_ADDRESS,
		tokenLogo: USDC_LOGO,
		amount: "2",
		recipient: RECIPIENT,
		chainId: CHAIN_ID,
		memo: "Transfer of 2 USDC on Base",
	},
	urgency: "normal",
	expiresInMinutes: 60,
};

async function postIntent() {
	console.log("📤 Posting intent to:", `${API_BASE}/api/intents`);
	console.log("📋 Request payload:", JSON.stringify(intentRequest, null, 2));

	try {
		const response = await fetch(`${API_BASE}/api/intents`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(intentRequest),
		});

		const data = await response.json();

		if (response.ok) {
			console.log("\n✅ Intent created successfully!");
			console.log("📦 Response:", JSON.stringify(data, null, 2));
			console.log("\n🔗 Intent ID:", data.intent?.id);
		} else {
			console.error("\n❌ Failed to create intent");
			console.error("Status:", response.status);
			console.error("Response:", JSON.stringify(data, null, 2));
		}
	} catch (error) {
		console.error("\n❌ Error posting intent:", error);
	}
}

postIntent();
