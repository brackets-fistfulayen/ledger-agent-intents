/**
 * Creates multiple test intents with different USDC amounts
 * Same wallet, same destination, varying amounts
 *
 * Usage: npx tsx src/create-random-intents.ts
 */

import type { CreateIntentRequest } from "@agent-intents/shared";

const API_BASE = process.env.API_URL || "http://localhost:3005";

// Chain ID - using ETH Mainnet
const CHAIN_ID = 1;

// USDC on ETH Mainnet
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_LOGO = "https://assets.coingecko.com/coins/images/6319/large/usdc.png";

// Fixed wallet and destination
const USER_WALLET = "0x55862D0711Fe9CE125dCe1b46973Be99E5Fd2592";
const RECIPIENT = "0x73F3e0b80D7826F872CfF58d6FE06d87fBd13ACc";

// Different amounts to create intents for
const AMOUNTS = ["5", "25", "100", "42.50", "250"];

// Agent names for variety
const AGENTS = [
	{ id: "shopping-agent", name: "Shopping Assistant" },
	{ id: "bill-pay-agent", name: "Bill Pay Agent" },
	{ id: "savings-agent", name: "Savings Bot" },
	{ id: "subscription-agent", name: "Subscription Manager" },
	{ id: "expense-agent", name: "Expense Tracker" },
];

// Memos for each transaction
const MEMOS = [
	"Coffee subscription renewal",
	"Online purchase payment",
	"Monthly savings transfer",
	"Utility bill payment",
	"API credits top-up",
];

async function createIntent(amount: string, index: number) {
	const agent = AGENTS[index % AGENTS.length]!;
	const memo = MEMOS[index % MEMOS.length]!;

	const intentRequest: CreateIntentRequest & { userId: string } = {
		userId: USER_WALLET,
		agentId: agent.id,
		agentName: agent.name,
		details: {
			type: "transfer",
			token: "USDC",
			tokenAddress: USDC_ADDRESS,
			tokenLogo: USDC_LOGO,
			amount: amount,
			recipient: RECIPIENT,
			chainId: CHAIN_ID,
			memo: `${memo} - ${amount} USDC`,
		},
		urgency: index % 3 === 0 ? "high" : index % 2 === 0 ? "low" : "normal",
		expiresInMinutes: 60,
	};

	console.log(`\n📤 Creating intent #${index + 1}: ${amount} USDC...`);

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
			console.log(`   ✅ Created! ID: ${data.intent?.id}`);
			console.log(`   📋 Agent: ${agent.name}, Amount: ${amount} USDC`);
			return data.intent;
		} else {
			console.error(`   ❌ Failed: ${data.error || response.status}`);
			return null;
		}
	} catch (error) {
		console.error(`   ❌ Error:`, error);
		return null;
	}
}

async function main() {
	console.log("╔═══════════════════════════════════════════════════════════╗");
	console.log("║           CREATING RANDOM TEST INTENTS                    ║");
	console.log("╠═══════════════════════════════════════════════════════════╣");
	console.log(`║  Wallet:      ${USER_WALLET.slice(0, 20)}...       ║`);
	console.log(`║  Recipient:   ${RECIPIENT.slice(0, 20)}...       ║`);
	console.log(`║  Token:       USDC (ETH Mainnet)                          ║`);
	console.log(`║  Amounts:     ${AMOUNTS.join(", ")} USDC                 ║`);
	console.log("╚═══════════════════════════════════════════════════════════╝");

	const results = [];

	for (let i = 0; i < AMOUNTS.length; i++) {
		const intent = await createIntent(AMOUNTS[i]!, i);
		if (intent) {
			results.push(intent);
		}
		// Small delay between requests
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	console.log("\n════════════════════════════════════════════════════════════");
	console.log(`✅ Successfully created ${results.length}/${AMOUNTS.length} intents`);
	console.log("════════════════════════════════════════════════════════════\n");
}

main();
