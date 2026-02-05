/**
 * Ledger Agent Payments Backend Service
 *
 * REST API for:
 * - Agents to submit transaction intents
 * - Live App to fetch pending intents
 * - Status updates when intents are signed/rejected
 */

import {
	type CreateIntentRequest,
	type Intent,
	type IntentStatus,
	getExplorerTxUrl,
	type X402PaymentPayload,
} from "@agent-intents/shared";
import cors from "cors";
import express from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware - CORS with explicit configuration for development
app.use(
	cors({
		origin: true, // Reflect the request origin (allows any origin in development)
		credentials: true,
		methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);
app.use(express.json());

// In-memory stores (replace with DB for production)
const intents = new Map<string, Intent>();

// ============ Agent / Trustchain In-Memory Store ============
interface TrustchainMember {
	id: string;
	trustchainId: string;
	memberPubkey: string;
	role: string;
	label: string | null;
	createdAt: string;
	revokedAt: string | null;
}
const agents = new Map<string, TrustchainMember>();

// Helper: create intent from request
function createIntent(req: CreateIntentRequest, userId: string): Intent {
	const now = new Date().toISOString();
	const id = `int_${Date.now()}_${uuidv4().slice(0, 8)}`;

	const expiresAt = req.expiresInMinutes
		? new Date(Date.now() + req.expiresInMinutes * 60 * 1000).toISOString()
		: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default 24h

	return {
		id,
		userId,
		agentId: req.agentId,
		agentName: req.agentName,
		details: req.details,
		urgency: req.urgency || "normal",
		status: "pending",
		createdAt: now,
		expiresAt,
		statusHistory: [{ status: "pending", timestamp: now }],
	};
}

// Health check
app.get("/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============ Agent API ============

// Create new intent (called by agents)
app.post("/api/intents", (req, res) => {
	try {
		const body = req.body as CreateIntentRequest & { userId?: string };

		// For hackathon, accept userId in body or default to 'demo'
		const userId = body.userId || "demo-user";

		// Validate required fields
		if (!body.agentId || !body.details) {
			res.status(400).json({ success: false, error: "Missing required fields" });
			return;
		}

		const intent = createIntent(body, userId);
		intents.set(intent.id, intent);

		console.log(
			`[Intent Created] ${intent.id} by ${intent.agentName}: ${intent.details.amount} ${intent.details.token} to ${intent.details.recipient}`,
		);

		res.status(201).json({ success: true, intent });
	} catch (error) {
		console.error("Error creating intent:", error);
		res.status(500).json({ success: false, error: "Internal server error" });
	}
});

// Get intent status (for agents to poll)
app.get("/api/intents/:id", (req, res) => {
	const intent = intents.get(req.params.id);

	if (!intent) {
		res.status(404).json({ success: false, error: "Intent not found" });
		return;
	}

	res.json({ success: true, intent });
});

// ============ Live App API ============

// Get pending intents for a user
app.get("/api/users/:userId/intents", (req, res) => {
	const { userId } = req.params;
	const { status } = req.query;

	const userIntents = Array.from(intents.values())
		.filter((i) => i.userId === userId)
		.filter((i) => !status || i.status === status)
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	res.json({ success: true, intents: userIntents });
});

// Update intent status (POST /api/intents/status – preferred, avoids Vercel dynamic-route issues)
app.post("/api/intents/status", (req, res) => {
	const { id: intentId } = req.body as { id?: string };
	if (!intentId) {
		res.status(400).json({ success: false, error: "Missing intent ID in request body" });
		return;
	}
	const intent = intents.get(intentId);

	if (!intent) {
		res.status(404).json({ success: false, error: "Intent not found" });
		return;
	}

	const { status, txHash, note, paymentSignatureHeader, paymentPayload } = req.body as {
		status: IntentStatus;
		txHash?: string;
		note?: string;
		paymentSignatureHeader?: string;
		paymentPayload?: X402PaymentPayload;
	};

	const now = new Date().toISOString();

	intent.status = status;
	intent.statusHistory.push({ status, timestamp: now, note });

	if (status === "approved") {
		intent.reviewedAt = now;
	} else if (status === "signed" && txHash) {
		intent.signedAt = now;
		intent.txHash = txHash;
		intent.txUrl = getExplorerTxUrl(intent.details.chainId, txHash);
	} else if (status === "signed") {
		intent.signedAt = now;
	} else if (status === "confirmed") {
		intent.confirmedAt = now;
	} else if (status === "rejected") {
		intent.reviewedAt = now;
	}

	if (paymentSignatureHeader || paymentPayload) {
		const existing = intent.details.x402;
		const base =
			paymentPayload
				? { resource: paymentPayload.resource, accepted: paymentPayload.accepted }
				: existing;

		if (base) {
			intent.details = {
				...intent.details,
				x402: {
					...base,
					...(existing ?? {}),
					paymentSignatureHeader:
						paymentSignatureHeader ?? existing?.paymentSignatureHeader,
					paymentPayload: paymentPayload ?? existing?.paymentPayload,
				},
			};
		}
	}

	console.log(`[Intent ${status.toUpperCase()}] ${intent.id}${txHash ? ` tx: ${txHash}` : ""}`);

	res.json({ success: true, intent });
});

// Update intent status (legacy PATCH – kept for backward compat)
app.patch("/api/intents/:id/status", (req, res) => {
	const intent = intents.get(req.params.id);

	if (!intent) {
		res.status(404).json({ success: false, error: "Intent not found" });
		return;
	}

	const { status, txHash, note, paymentSignatureHeader, paymentPayload } = req.body as {
		status: IntentStatus;
		txHash?: string;
		note?: string;
		paymentSignatureHeader?: string;
		paymentPayload?: X402PaymentPayload;
	};

	const now = new Date().toISOString();

	intent.status = status;
	intent.statusHistory.push({ status, timestamp: now, note });

	if (status === "approved") {
		intent.reviewedAt = now;
	} else if (status === "signed" && txHash) {
		intent.signedAt = now;
		intent.txHash = txHash;
		// Generate explorer link using shared helper
		intent.txUrl = getExplorerTxUrl(intent.details.chainId, txHash);
	} else if (status === "signed") {
		// Signed may also mean x402 authorization signature (no onchain tx hash)
		intent.signedAt = now;
	} else if (status === "confirmed") {
		intent.confirmedAt = now;
	} else if (status === "rejected") {
		intent.reviewedAt = now;
	}

	// Persist x402 proof data inside the details blob if provided
	if (paymentSignatureHeader || paymentPayload) {
		const existing = intent.details.x402;
		const base =
			paymentPayload
				? { resource: paymentPayload.resource, accepted: paymentPayload.accepted }
				: existing;

		if (base) {
			intent.details = {
				...intent.details,
				x402: {
					...base,
					...(existing ?? {}),
					paymentSignatureHeader:
						paymentSignatureHeader ?? existing?.paymentSignatureHeader,
					paymentPayload: paymentPayload ?? existing?.paymentPayload,
				},
			};
		}
	}

	console.log(`[Intent ${status.toUpperCase()}] ${intent.id}${txHash ? ` tx: ${txHash}` : ""}`);

	res.json({ success: true, intent });
});

// ============ Agent Provisioning ============

// Register a new agent (with device signature verification)
app.post("/api/agents/register", async (req, res) => {
	try {
		const { trustChainId, agentPublicKey, agentLabel, authorizationSignature } = req.body as {
			trustChainId?: string;
			agentPublicKey?: string;
			agentLabel?: string;
			authorizationSignature?: string;
		};

		if (!trustChainId || !agentPublicKey || !authorizationSignature) {
			res.status(400).json({ success: false, error: "Missing required fields: trustChainId, agentPublicKey, authorizationSignature" });
			return;
		}

		const pubkey = agentPublicKey.toLowerCase();
		const label = agentLabel || "Unnamed Agent";

		// Verify device authorization signature (EIP-191 personal_sign)
		try {
			const { recoverMessageAddress } = await import("viem");
			const message = [
				"Authorize agent key for Ledger Agent Payments",
				`Key: ${agentPublicKey}`,
				`Label: ${label}`,
				`Identity: ${trustChainId}`,
			].join("\n");

			const recovered = await recoverMessageAddress({
				message,
				signature: authorizationSignature as `0x${string}`,
			});

			if (recovered.toLowerCase() !== trustChainId.toLowerCase()) {
				res.status(403).json({ success: false, error: "Authorization signature does not match the connected wallet" });
				return;
			}
		} catch (err) {
			console.error("[Agent Registration] Signature verification failed:", err);
			res.status(400).json({ success: false, error: "Invalid authorization signature" });
			return;
		}

		const existing = Array.from(agents.values()).find(
			(a) => a.memberPubkey === pubkey && !a.revokedAt,
		);
		if (existing) {
			res.status(409).json({ success: false, error: "This agent public key is already registered" });
			return;
		}

		const member: TrustchainMember = {
			id: uuidv4(),
			trustchainId: trustChainId.toLowerCase(),
			memberPubkey: pubkey,
			role: "agent_write_only",
			label,
			createdAt: new Date().toISOString(),
			revokedAt: null,
		};
		agents.set(member.id, member);

		console.log(`[Agent Registered] ${member.id} "${member.label}" for trustchain ${member.trustchainId} (device-authorized)`);
		res.status(201).json({ success: true, member });
	} catch (error) {
		console.error("Error registering agent:", error);
		res.status(500).json({ success: false, error: "Internal server error" });
	}
});

// List agents for a trustchain
app.get("/api/agents", (req, res) => {
	const trustchainId = (req.query.trustchainId as string || "").toLowerCase();
	if (!trustchainId) {
		res.status(400).json({ success: false, error: "Missing required query parameter: trustchainId" });
		return;
	}

	const members = Array.from(agents.values()).filter(
		(a) => a.trustchainId === trustchainId,
	);
	res.json({ success: true, members });
});

// Get agent by ID
app.get("/api/agents/:id", (req, res) => {
	const member = agents.get(req.params.id);
	if (!member) {
		res.status(404).json({ success: false, error: "Agent not found" });
		return;
	}
	res.json({ success: true, member });
});

// Revoke agent (POST /api/agents/revoke – preferred, avoids Vercel dynamic-route issues)
app.post("/api/agents/revoke", (req, res) => {
	const { id } = req.body as { id?: string };
	if (!id) {
		res.status(400).json({ success: false, error: "Missing agent ID in request body" });
		return;
	}
	const member = agents.get(id);
	if (!member || member.revokedAt) {
		res.status(404).json({ success: false, error: "Agent not found or already revoked" });
		return;
	}
	member.revokedAt = new Date().toISOString();
	console.log(`[Agent Revoked] ${member.id} "${member.label}"`);
	res.json({ success: true, member });
});

// Revoke agent (legacy DELETE – kept for backward compat)
app.delete("/api/agents/:id", (req, res) => {
	const member = agents.get(req.params.id);
	if (!member || member.revokedAt) {
		res.status(404).json({ success: false, error: "Agent not found or already revoked" });
		return;
	}
	member.revokedAt = new Date().toISOString();
	console.log(`[Agent Revoked] ${member.id} "${member.label}"`);
	res.json({ success: true, member });
});

// ============ Demo/Debug ============

// List all intents (debug endpoint)
app.get("/api/debug/intents", (_req, res) => {
	res.json({
		success: true,
		count: intents.size,
		intents: Array.from(intents.values()),
	});
});

// Clear all intents (debug endpoint)
app.delete("/api/debug/intents", (_req, res) => {
	intents.clear();
	res.json({ success: true, message: "All intents cleared" });
});

// Start server
app.listen(PORT, () => {
	console.log(`
╔═══════════════════════════════════════════════════════════╗
║           AGENT INTENTS BACKEND                           ║
║                                                           ║
║  "Agents propose, humans sign with hardware."             ║
║                                                           ║
║  Server running on http://localhost:${PORT}                 ║
║                                                           ║
║  Endpoints:                                               ║
║    POST   /api/intents              Create intent         ║
║    GET    /api/intents/:id          Get intent status     ║
║    GET    /api/users/:userId/intents  List user intents   ║
║    PATCH  /api/intents/:id/status   Update status         ║
║    POST   /api/agents/register      Register agent        ║
║    GET    /api/agents               List agents           ║
║    GET    /api/agents/:id           Get agent             ║
║    DELETE /api/agents/:id           Revoke agent          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
