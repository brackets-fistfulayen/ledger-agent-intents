/**
 * Test script to post an intent to send 2 USDC
 *
 * Usage: npx tsx src/test-intent.ts
 */

import { SUPPORTED_TOKENS, type CreateIntentRequest } from "@agent-intents/shared";

const API_BASE = process.env.API_URL || "http://localhost:3005";

// Chain ID - using Base Sepolia for this test
const CHAIN_ID = 84532;

// Use your connected wallet address as the userId
const USER_WALLET = "0x55862D0711Fe9CE125dCe1b46973Be99E5Fd2592";

const intentRequest: CreateIntentRequest & { userId: string } = {
	userId: USER_WALLET,
	agentId: "test-agent",
	agentName: "Test Agent",
	details: {
		type: "transfer",
		token: "USDC",
		tokenAddress: SUPPORTED_TOKENS[CHAIN_ID].USDC.address,
		amount: "2",
		recipient: "0x73F3e0b80D7826F872CfF58d6FE06d87fBd13ACc",
		chainId: CHAIN_ID,
		memo: "Test transfer of 2 USDC",
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
