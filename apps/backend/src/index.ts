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
	type TransferIntent,
	getExplorerTxUrl,
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

// In-memory store (replace with DB for production)
const intents = new Map<string, Intent>();

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

// Update intent status (called by Live App after signing)
app.patch("/api/intents/:id/status", (req, res) => {
	const intent = intents.get(req.params.id);

	if (!intent) {
		res.status(404).json({ success: false, error: "Intent not found" });
		return;
	}

	const { status, txHash, note } = req.body as {
		status: IntentStatus;
		txHash?: string;
		note?: string;
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
	} else if (status === "confirmed") {
		intent.confirmedAt = now;
	} else if (status === "rejected") {
		intent.reviewedAt = now;
	}

	console.log(`[Intent ${status.toUpperCase()}] ${intent.id}${txHash ? ` tx: ${txHash}` : ""}`);

	res.json({ success: true, intent });
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
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
