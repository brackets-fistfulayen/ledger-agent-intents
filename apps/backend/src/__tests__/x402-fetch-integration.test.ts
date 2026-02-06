/**
 * CI-safe integration test for x402Fetch().
 *
 * Starts a local mock HTTP server that simulates an x402 paywall:
 *   - First request returns 402 with PAYMENT-REQUIRED header
 *   - Second request (with PAYMENT-SIGNATURE) returns 200 with PAYMENT-RESPONSE
 *
 * Also starts a local mock API server that simulates the intents API:
 *   - POST /api/intents -> creates intent
 *   - GET /api/intents/:id -> returns intent with status
 *   - POST /api/intents/status -> updates intent status
 *
 * No real money, no Ledger device required.
 *
 * Usage: npx tsx src/__tests__/x402-fetch-integration.test.ts
 */
import { type IncomingMessage, type Server, type ServerResponse, createServer } from "node:http";
import type {
	Intent,
	X402AcceptedExactEvm,
	X402Resource,
	X402SettlementReceipt,
} from "@agent-intents/shared";
import { type X402ClientConfig, x402Fetch } from "../x402-client.js";

// =============================================================================
// Mock Intents API
// =============================================================================

interface StoredIntent {
	id: string;
	status: string;
	details: Record<string, unknown>;
	userId: string;
	agentId: string;
	agentName: string;
	urgency: string;
	createdAt: string;
	statusHistory: Array<{ status: string; timestamp: string }>;
}

function createMockIntentsApi(): {
	server: Server;
	getIntent: (id: string) => StoredIntent | undefined;
} {
	const intents = new Map<string, StoredIntent>();

	const handler = async (req: IncomingMessage, res: ServerResponse) => {
		const url = new URL(req.url ?? "/", "http://localhost");
		const body = await readBody(req);

		// POST /api/intents -- create intent
		if (req.method === "POST" && url.pathname === "/api/intents") {
			const data = JSON.parse(body);
			const id = `int_test_${Date.now()}`;
			const intent: StoredIntent = {
				id,
				status: "pending",
				details: data.details,
				userId: data.userId || "test-user",
				agentId: data.agentId,
				agentName: data.agentName,
				urgency: data.urgency || "normal",
				createdAt: new Date().toISOString(),
				statusHistory: [{ status: "pending", timestamp: new Date().toISOString() }],
			};
			intents.set(id, intent);

			// Auto-approve and authorize after a short delay (simulate user action)
			setTimeout(() => {
				const i = intents.get(id);
				if (i && i.status === "pending") {
					i.status = "authorized";
					// Simulate the payment signature header being set
					const x402 = (i.details as Record<string, unknown>).x402 as Record<string, unknown>;
					if (x402) {
						const paymentPayload = {
							x402Version: 2,
							resource: x402.resource,
							accepted: x402.accepted,
							payload: {
								signature: "0xmocksignature",
								authorization: {
									from: "0x1111111111111111111111111111111111111111",
									to: (x402.accepted as Record<string, string>).payTo,
									value: (x402.accepted as Record<string, string>).amount,
									validAfter: "0",
									validBefore: String(Math.floor(Date.now() / 1000) + 300),
									nonce: `0x${Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex")}`,
								},
							},
							extensions: {},
						};
						x402.paymentSignatureHeader = Buffer.from(JSON.stringify(paymentPayload)).toString(
							"base64",
						);
						x402.paymentPayload = paymentPayload;
					}
					i.statusHistory.push({ status: "authorized", timestamp: new Date().toISOString() });
				}
			}, 200);

			res.writeHead(201, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ success: true, intent }));
			return;
		}

		// GET /api/intents/:id -- get intent
		const getMatch = url.pathname.match(/^\/api\/intents\/([^/]+)$/);
		if (req.method === "GET" && getMatch) {
			const intentId = getMatch[1] ?? "";
			const intent = intents.get(intentId);
			if (!intent) {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ success: false, error: "Not found" }));
				return;
			}
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ success: true, intent }));
			return;
		}

		// POST /api/intents/status -- update status
		if (req.method === "POST" && url.pathname === "/api/intents/status") {
			const data = JSON.parse(body);
			const intent = intents.get(data.id);
			if (!intent) {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ success: false, error: "Not found" }));
				return;
			}
			intent.status = data.status;
			if (data.settlementReceipt) {
				const x402 = (intent.details as Record<string, unknown>).x402 as Record<string, unknown>;
				if (x402) {
					x402.settlementReceipt = data.settlementReceipt;
				}
			}
			intent.statusHistory.push({ status: data.status, timestamp: new Date().toISOString() });
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ success: true, intent }));
			return;
		}

		res.writeHead(404, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ success: false, error: "Not found" }));
	};

	const server = createServer(handler);
	return { server, getIntent: (id: string) => intents.get(id) };
}

// =============================================================================
// Mock x402 Resource Server
// =============================================================================

function createMockResourceServer(resource: X402Resource, accepted: X402AcceptedExactEvm): Server {
	let requestCount = 0;

	return createServer((req, res) => {
		requestCount++;

		const paymentSigHeader = req.headers["payment-signature"] as string | undefined;

		if (!paymentSigHeader) {
			// First request: return 402 Payment Required
			const paymentRequired = {
				x402Version: 2,
				resource,
				accepted: [accepted],
			};
			const encoded = Buffer.from(JSON.stringify(paymentRequired)).toString("base64");

			res.writeHead(402, {
				"Content-Type": "application/json",
				"PAYMENT-REQUIRED": encoded,
			});
			res.end(JSON.stringify({ error: "Payment required" }));
			return;
		}

		// Second request: verify PAYMENT-SIGNATURE and return 200 with PAYMENT-RESPONSE
		const receipt: X402SettlementReceipt = {
			success: true,
			txHash: `0x${"a".repeat(64)}`,
			network: accepted.network,
			amount: accepted.amount,
			settledAt: new Date().toISOString(),
			blockNumber: 12345678,
		};
		const encodedReceipt = Buffer.from(JSON.stringify(receipt)).toString("base64");

		res.writeHead(200, {
			"Content-Type": "application/json",
			"PAYMENT-RESPONSE": encodedReceipt,
		});
		res.end(JSON.stringify({ data: "protected resource content", requestNumber: requestCount }));
	});
}

// =============================================================================
// Helpers
// =============================================================================

function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve) => {
		const chunks: Buffer[] = [];
		req.on("data", (chunk) => chunks.push(chunk));
		req.on("end", () => resolve(Buffer.concat(chunks).toString()));
	});
}

function listenOnRandomPort(server: Server): Promise<number> {
	return new Promise((resolve) => {
		server.listen(0, () => {
			const addr = server.address();
			const port = typeof addr === "object" && addr ? addr.port : 0;
			resolve(port);
		});
	});
}

function closeServer(server: Server): Promise<void> {
	return new Promise((resolve) => server.close(() => resolve()));
}

// =============================================================================
// Test Runner
// =============================================================================

async function runTests() {
	console.log("=".repeat(60));
	console.log("x402Fetch() Integration Test (CI-safe, mock servers)");
	console.log("=".repeat(60));

	// Set up mock servers
	const resource: X402Resource = {
		url: "http://placeholder", // Will be replaced with actual URL after server starts
		description: "Test protected API endpoint",
		mimeType: "application/json",
	};

	const accepted: X402AcceptedExactEvm = {
		scheme: "exact",
		network: "eip155:8453",
		amount: "1000", // 0.001 USDC
		asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
		payTo: "0x73F3e0b80D7826F872CfF58d6FE06d87fBd13ACc",
		maxTimeoutSeconds: 300,
		extra: { name: "USD Coin", version: "2", decimals: 6 },
	};

	const { server: apiServer, getIntent } = createMockIntentsApi();
	const resourceServer = createMockResourceServer(resource, accepted);

	const [apiPort, resourcePort] = await Promise.all([
		listenOnRandomPort(apiServer),
		listenOnRandomPort(resourceServer),
	]);

	const resourceUrl = `http://localhost:${resourcePort}/protected`;
	const apiBaseUrl = `http://localhost:${apiPort}`;

	console.log(`  Mock API server:      http://localhost:${apiPort}`);
	console.log(`  Mock resource server:  http://localhost:${resourcePort}`);
	console.log();

	const config: X402ClientConfig = {
		apiBaseUrl,
		userWallet: "0x1111111111111111111111111111111111111111",
		agentId: "test-agent",
		agentName: "Test Agent",
		pollIntervalMs: 100,
		maxWaitMs: 10000,
	};

	let passed = 0;
	let failed = 0;

	function assert(condition: boolean, message: string) {
		if (condition) {
			console.log(`  PASS: ${message}`);
			passed++;
		} else {
			console.error(`  FAIL: ${message}`);
			failed++;
		}
	}

	// --- Test 1: Full x402Fetch() flow ---
	console.log("Test 1: Full x402Fetch() flow (402 -> sign -> retry -> 200)");
	try {
		const result = await x402Fetch(resourceUrl, {}, config);

		assert(result.success === true, "result.success is true");
		assert(result.data != null, "result.data is not null");
		assert(result.settlementReceipt != null, "settlementReceipt is present");
		assert(result.settlementReceipt?.success === true, "settlementReceipt.success is true");
		assert(result.settlementReceipt?.txHash != null, "settlementReceipt.txHash is present");
		assert(result.intent != null, "intent is present");
		assert(
			result.intent?.status === "confirmed",
			`intent.status is 'confirmed' (got '${result.intent?.status}')`,
		);
	} catch (err) {
		console.error(`  FAIL: Unexpected error: ${err}`);
		failed++;
	}
	console.log();

	// --- Test 2: Non-402 request passes through ---
	console.log("Test 2: Non-402 request passes through unchanged");
	try {
		// Hit the API server (which returns 404 for unknown routes), not the resource server
		const result = await x402Fetch(`${apiBaseUrl}/api/health`, {}, config);
		assert(result.success === false, "result.success is false for 404");
		assert(result.error != null, "error message is present");
	} catch (err) {
		console.error(`  FAIL: Unexpected error: ${err}`);
		failed++;
	}
	console.log();

	// --- Test 3: Missing PAYMENT-RESPONSE header on 200 is treated as error ---
	console.log("Test 3: Missing PAYMENT-RESPONSE header on 200 -> protocol error");
	// Create a resource server that returns 200 without PAYMENT-RESPONSE
	const badResourceServer = createServer((req, res) => {
		const paymentSig = req.headers["payment-signature"] as string | undefined;
		if (!paymentSig) {
			const paymentRequired = { x402Version: 2, resource, accepted: [accepted] };
			res.writeHead(402, {
				"Content-Type": "application/json",
				"PAYMENT-REQUIRED": Buffer.from(JSON.stringify(paymentRequired)).toString("base64"),
			});
			res.end(JSON.stringify({ error: "Payment required" }));
		} else {
			// Return 200 but WITHOUT PAYMENT-RESPONSE header
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ data: "content" }));
		}
	});
	const badPort = await listenOnRandomPort(badResourceServer);
	try {
		const result = await x402Fetch(`http://localhost:${badPort}/protected`, {}, config);
		assert(result.success === false, "result.success is false (protocol violation)");
		assert(result.error?.includes("PAYMENT-RESPONSE") === true, "error mentions PAYMENT-RESPONSE");
	} catch (err) {
		console.error(`  FAIL: Unexpected error: ${err}`);
		failed++;
	}
	await closeServer(badResourceServer);
	console.log();

	// --- Summary ---
	console.log("=".repeat(60));
	console.log(`Results: ${passed} passed, ${failed} failed`);
	console.log("=".repeat(60));

	// Cleanup
	await Promise.all([closeServer(apiServer), closeServer(resourceServer)]);

	process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
