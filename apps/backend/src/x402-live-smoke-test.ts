/**
 * x402 Live Smoke Test -- manual validation gate before releases.
 *
 * Tests x402Fetch() against a real x402 endpoint on Base mainnet.
 * NOT for CI -- requires a pre-funded wallet and Ledger device for signing.
 *
 * Prerequisites:
 *   - A running intents API (local or deployed)
 *   - A funded wallet with USDC on Base (at least $0.01)
 *   - User must approve the payment in the web UI when prompted
 *
 * Cost: ~$0.001 USDC per run
 *
 * Usage:
 *   npx tsx src/x402-live-smoke-test.ts
 *
 * Environment variables:
 *   API_URL          -- Intents API base URL (default: http://localhost:5173)
 *   USER_WALLET      -- User wallet address (required)
 *   X402_ENDPOINT    -- x402 protected endpoint to test against
 *                       (default: https://x402-demo-discovery-endpoint.vercel.app/protected)
 */

import { type X402ClientConfig, x402Fetch } from "./x402-client.js";

// =============================================================================
// Configuration
// =============================================================================

const API_URL = (process.env.API_URL || "http://localhost:5173").replace(/\/+$/, "");
const USER_WALLET = process.env.USER_WALLET;
const X402_ENDPOINT =
	process.env.X402_ENDPOINT || "https://x402-demo-discovery-endpoint.vercel.app/protected";

// =============================================================================
// Main
// =============================================================================

async function main() {
	console.log("=".repeat(60));
	console.log("x402 Live Smoke Test");
	console.log("=".repeat(60));
	console.log();

	if (!USER_WALLET) {
		console.error("ERROR: USER_WALLET environment variable is required.");
		console.error("Example: USER_WALLET=0xYourWallet npx tsx src/x402-live-smoke-test.ts");
		process.exit(1);
	}

	console.log(`  API URL:       ${API_URL}`);
	console.log(`  User wallet:   ${USER_WALLET}`);
	console.log(`  x402 endpoint: ${X402_ENDPOINT}`);
	console.log();
	console.log("  This test costs ~$0.001 USDC on Base mainnet.");
	console.log("  You will need to approve the payment in the web UI.");
	console.log();

	const config: X402ClientConfig = {
		apiBaseUrl: API_URL,
		userWallet: USER_WALLET,
		agentId: "smoke-test-agent",
		agentName: "Smoke Test Agent",
		pollIntervalMs: 3000,
		maxWaitMs: 300000, // 5 minutes to allow manual signing
	};

	console.log("Step 1: Calling x402 endpoint...");
	console.log(`         ${X402_ENDPOINT}`);
	console.log();

	try {
		const result = await x402Fetch(X402_ENDPOINT, {}, config);

		if (result.success) {
			console.log("SUCCESS: Full x402 flow completed!");
			console.log();
			console.log("  Resource data:", JSON.stringify(result.data, null, 2));
			console.log();
			if (result.settlementReceipt) {
				console.log("  Settlement receipt:");
				console.log(`    txHash:    ${result.settlementReceipt.txHash}`);
				console.log(`    network:   ${result.settlementReceipt.network}`);
				console.log(`    amount:    ${result.settlementReceipt.amount}`);
				console.log(`    settledAt: ${result.settlementReceipt.settledAt}`);
			}
			if (result.intent) {
				console.log();
				console.log(`  Intent ID:   ${result.intent.id}`);
				console.log(`  Intent status: ${result.intent.status}`);
			}
		} else {
			console.error("FAILED:", result.error);
			if (result.intent) {
				console.error(`  Intent ID: ${result.intent.id}`);
				console.error(`  Intent status: ${result.intent.status}`);
			}
			process.exit(1);
		}
	} catch (err) {
		console.error("FATAL ERROR:", err);
		process.exit(1);
	}

	console.log();
	console.log("=".repeat(60));
	console.log("Smoke test passed.");
	console.log("=".repeat(60));
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
