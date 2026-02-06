/**
 * x402 Agent Demo - End-to-end flow demonstration
 *
 * This script demonstrates the complete x402 payment flow:
 * 1. Agent hits a paywall (receives 402 Payment Required)
 * 2. Agent decodes the PAYMENT-REQUIRED header
 * 3. Agent creates an intent with x402 context
 * 4. Agent polls for human authorization (signature)
 * 5. Agent retries original request with PAYMENT-SIGNATURE header
 * 6. Agent receives PAYMENT-RESPONSE and updates intent with settlement receipt
 *
 * Usage: npx tsx src/x402-agent-demo.ts
 */

import {
	type CreateIntentRequest,
	type Intent,
	type X402AcceptedExactEvm,
	type X402Resource,
	type X402SettlementReceipt,
	parseEip155ChainId,
	formatAtomicAmount,
	extractDomain,
} from "@agent-intents/shared";

// =============================================================================
// Configuration
// =============================================================================

const API_BASE = process.env.API_URL || "http://localhost:3005";
const USER_WALLET = process.env.USER_WALLET || "0x55862D0711Fe9CE125dCe1b46973Be99E5Fd2592";

// Simulated x402 paywall response (what a real API would return)
const MOCK_X402_RESOURCE: X402Resource = {
	url: "https://api.example.com/v1/ai/completion",
	description: "AI completion endpoint",
	mimeType: "application/json",
};

const MOCK_X402_ACCEPTED: X402AcceptedExactEvm = {
	scheme: "exact",
	network: "eip155:84532", // Base Sepolia
	amount: "10000", // 0.01 USDC (6 decimals)
	asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
	payTo: "0x73F3e0b80D7826F872CfF58d6FE06d87fBd13ACc", // Recipient
	maxTimeoutSeconds: 300,
	extra: {
		name: "USD Coin",
		version: "2",
	},
};

// =============================================================================
// Utility Functions
// =============================================================================

function log(emoji: string, message: string, data?: unknown) {
	console.log(`${emoji} ${message}`);
	if (data) {
		console.log(JSON.stringify(data, null, 2));
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Decode base64-encoded PAYMENT-REQUIRED header
 */
function decodePaymentRequired(header: string): {
	resource: X402Resource;
	accepted: X402AcceptedExactEvm[];
} {
	const decoded = Buffer.from(header, "base64").toString("utf-8");
	return JSON.parse(decoded);
}

/**
 * Encode PAYMENT-SIGNATURE header (base64 JSON)
 */
function encodePaymentSignature(payload: unknown): string {
	return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Create an intent with x402 context
 */
async function createX402Intent(
	resource: X402Resource,
	accepted: X402AcceptedExactEvm
): Promise<Intent | null> {
	const intentRequest: CreateIntentRequest & { userId: string } = {
		userId: USER_WALLET,
		agentId: "x402-demo-agent",
		agentName: "x402 Demo Agent",
		details: {
			type: "transfer",
			token: "USDC",
			tokenAddress: accepted.asset,
			amount: formatAtomicAmount(accepted.amount, 6),
			recipient: accepted.payTo,
			chainId: parseEip155ChainId(accepted.network) ?? 84532,
			memo: `API payment for ${extractDomain(resource.url)}`,
			resource: resource.url,
			category: "api_payment",
			x402: {
				resource,
				accepted,
			},
		},
		urgency: "normal",
		expiresInMinutes: 10,
	};

	const response = await fetch(`${API_BASE}/api/intents`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(intentRequest),
	});

	const data = await response.json();
	return data.intent ?? null;
}

/**
 * Get intent by ID
 */
async function getIntent(intentId: string): Promise<Intent | null> {
	const response = await fetch(`${API_BASE}/api/intents/${intentId}`);
	const data = await response.json();
	return data.intent ?? null;
}

/**
 * Update intent status with settlement receipt
 */
async function updateIntentWithReceipt(
	intentId: string,
	receipt: X402SettlementReceipt
): Promise<Intent | null> {
	const response = await fetch(`${API_BASE}/api/intents/${intentId}/status`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			status: "confirmed",
			settlementReceipt: receipt,
		}),
	});

	const data = await response.json();
	return data.intent ?? null;
}

/**
 * Poll for intent authorization (human signature)
 */
async function pollForAuthorization(
	intentId: string,
	maxWaitMs = 300000, // 5 minutes
	pollIntervalMs = 2000
): Promise<Intent | null> {
	const startTime = Date.now();

	while (Date.now() - startTime < maxWaitMs) {
		const intent = await getIntent(intentId);

		if (!intent) {
			log("❌", "Intent not found");
			return null;
		}

		if (intent.status === "authorized") {
			return intent;
		}

		if (intent.status === "rejected") {
			log("❌", "Intent was rejected by user");
			return null;
		}

		if (intent.status === "expired") {
			log("❌", "Intent expired");
			return null;
		}

		log("⏳", `Waiting for authorization... (status: ${intent.status})`);
		await sleep(pollIntervalMs);
	}

	log("❌", "Timeout waiting for authorization");
	return null;
}

// =============================================================================
// Helper Functions
// =============================================================================

// =============================================================================
// Simulated x402 API Interaction
// =============================================================================

/**
 * Simulate hitting a paywall (402 response)
 */
function simulatePaywall(): {
	statusCode: 402;
	headers: { "PAYMENT-REQUIRED": string };
} {
	const paymentRequired = {
		x402Version: 2,
		resource: MOCK_X402_RESOURCE,
		accepted: [MOCK_X402_ACCEPTED],
	};

	return {
		statusCode: 402,
		headers: {
			"PAYMENT-REQUIRED": encodePaymentSignature(paymentRequired),
		},
	};
}

/**
 * Simulate retrying with payment signature and receiving settlement
 */
function simulateSettlement(paymentSignature: string): {
	statusCode: 200;
	headers: { "PAYMENT-RESPONSE": string };
	body: { result: string };
} {
	// Simulate successful settlement
	const settlementReceipt: X402SettlementReceipt = {
		success: true,
		txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
		network: MOCK_X402_ACCEPTED.network,
		amount: MOCK_X402_ACCEPTED.amount,
		settledAt: new Date().toISOString(),
		blockNumber: 12345678,
	};

	return {
		statusCode: 200,
		headers: {
			"PAYMENT-RESPONSE": encodePaymentSignature(settlementReceipt),
		},
		body: {
			result: "AI completion result from the API",
		},
	};
}

// =============================================================================
// Main Demo Flow
// =============================================================================

async function runDemo() {
	console.log("\n" + "=".repeat(60));
	console.log("🚀 x402 Agent Demo - End-to-End Flow");
	console.log("=".repeat(60) + "\n");

	// Step 1: Agent hits a paywall
	log("📡", "Step 1: Agent makes request to API endpoint...");
	const paywallResponse = simulatePaywall();
	log("🚧", `Received ${paywallResponse.statusCode} Payment Required`);

	// Step 2: Decode the PAYMENT-REQUIRED header
	log("🔍", "Step 2: Decoding PAYMENT-REQUIRED header...");
	const paymentRequired = decodePaymentRequired(
		paywallResponse.headers["PAYMENT-REQUIRED"]
	);
	log("📋", "Payment requirements:", paymentRequired);

	// Step 3: Create intent with x402 context
	log("📤", "Step 3: Creating intent with x402 context...");
	const accepted = paymentRequired.accepted[0];
	if (!accepted) {
		log("❌", "No accepted payment scheme found");
		return;
	}
	const intent = await createX402Intent(paymentRequired.resource, accepted);

	if (!intent) {
		log("❌", "Failed to create intent");
		return;
	}

	log("✅", "Intent created successfully!");
	log("🆔", `Intent ID: ${intent.id}`);
	console.log("\n" + "-".repeat(40));
	console.log("👆 User should now review and authorize in the UI");
	console.log("-".repeat(40) + "\n");

	// Step 4: Poll for authorization
	log("⏳", "Step 4: Polling for human authorization...");
	const authorizedIntent = await pollForAuthorization(intent.id);

	if (!authorizedIntent) {
		log("❌", "Authorization failed or timed out");
		return;
	}

	log("✅", "Intent authorized by user!");

	// Extract the payment signature
	const paymentSignatureHeader =
		authorizedIntent.details.x402?.paymentSignatureHeader;

	if (!paymentSignatureHeader) {
		log("❌", "No payment signature header found on authorized intent");
		return;
	}

	log("🔐", "Payment signature ready:", {
		header: paymentSignatureHeader.slice(0, 50) + "...",
	});

	// Step 5: Retry with PAYMENT-SIGNATURE header
	log("📡", "Step 5: Retrying API request with PAYMENT-SIGNATURE header...");
	const settlementResponse = simulateSettlement(paymentSignatureHeader);
	log("✅", `Received ${settlementResponse.statusCode} OK`);
	log("📦", "API response:", settlementResponse.body);

	// Step 6: Parse PAYMENT-RESPONSE and update intent
	log("📝", "Step 6: Parsing PAYMENT-RESPONSE header...");
	const settlementReceipt: X402SettlementReceipt = JSON.parse(
		Buffer.from(
			settlementResponse.headers["PAYMENT-RESPONSE"],
			"base64"
		).toString("utf-8")
	);
	log("🧾", "Settlement receipt:", settlementReceipt);

	// Update intent with receipt
	log("💾", "Updating intent with settlement receipt...");
	const confirmedIntent = await updateIntentWithReceipt(
		intent.id,
		settlementReceipt
	);

	if (confirmedIntent) {
		log("✅", "Intent confirmed with settlement receipt!");
		log("🎉", "Final intent state:", {
			id: confirmedIntent.id,
			status: confirmedIntent.status,
			settlementReceipt: confirmedIntent.details.x402?.settlementReceipt,
		});
	}

	console.log("\n" + "=".repeat(60));
	console.log("🎉 Demo completed successfully!");
	console.log("=".repeat(60) + "\n");
}

// Run the demo
runDemo().catch(console.error);
