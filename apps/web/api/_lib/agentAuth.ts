/**
 * Agent authentication utilities for Vercel Functions.
 *
 * Verifies the `AgentAuth` header produced by an agent's LKRP-generated
 * private key on every API call.
 *
 * Header format: `AgentAuth <timestamp>.<bodyHash>.<signature>`
 * - timestamp: Unix epoch seconds (must be within 5 min of server time)
 * - bodyHash: keccak256 of the request body (or "0x" for GET)
 * - signature: EIP-191 personal_sign of `<timestamp>.<bodyHash>`
 *
 * The recovered address is matched against registered agent public keys
 * in the `trustchain_members` table.
 */
import type { VercelRequest } from "@vercel/node";
import { recoverMessageAddress, keccak256, toHex, isAddress } from "viem";
import { getActiveMemberByPubkey } from "./agentsRepo.js";
import type { TrustchainMember } from "@agent-intents/shared";
import { logger } from "./logger.js";

/** Maximum clock skew tolerance for agent-signed timestamps (5 minutes). */
const MAX_TIMESTAMP_DRIFT_SECONDS = 300;

export interface AgentAuthResult {
	member: TrustchainMember;
}

/**
 * Parse and verify the `Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>`
 * header from an incoming request.
 *
 * Returns the authenticated TrustchainMember or throws an Error.
 */
const AUTH_FAILED = "Authentication failed";

export async function verifyAgentAuth(req: VercelRequest): Promise<AgentAuthResult> {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		logger.warn("AgentAuth: Missing Authorization header");
		throw new Error(AUTH_FAILED);
	}

	if (!authHeader.startsWith("AgentAuth ")) {
		logger.warn("AgentAuth: Invalid authorization scheme – expected AgentAuth");
		throw new Error(AUTH_FAILED);
	}

	const payload = authHeader.slice("AgentAuth ".length);
	const parts = payload.split(".");

	if (parts.length < 3) {
		logger.warn("AgentAuth: Malformed AgentAuth header");
		throw new Error(AUTH_FAILED);
	}

	const timestamp = parts[0];
	const bodyHash = parts[1];
	const signature = parts.slice(2).join(".") as `0x${string}`;

	const ts = Number.parseInt(timestamp, 10);
	if (Number.isNaN(ts)) {
		logger.warn("AgentAuth: Invalid timestamp in AgentAuth header");
		throw new Error(AUTH_FAILED);
	}

	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - ts) > MAX_TIMESTAMP_DRIFT_SECONDS) {
		logger.warn("AgentAuth: Timestamp expired or too far in the future");
		throw new Error(AUTH_FAILED);
	}

	if (req.method !== "GET" && req.method !== "HEAD") {
		const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
		const expectedHash = keccak256(toHex(rawBody));
		if (bodyHash !== expectedHash) {
			logger.warn("AgentAuth: Body hash mismatch");
			throw new Error(AUTH_FAILED);
		}
	}

	const message = `${timestamp}.${bodyHash}`;
	let recoveredAddress: string;
	try {
		recoveredAddress = await recoverMessageAddress({
			message,
			signature,
		});
	} catch (err) {
		// viem can throw its own errors for malformed signatures (e.g.
		// "Invalid yParityOrV value"). Wrap so we never leak internals.
		logger.warn({ err }, "AgentAuth: Signature recovery failed");
		throw new Error(AUTH_FAILED);
	}

	const normalizedAddress = recoveredAddress.toLowerCase();
	if (!isAddress(normalizedAddress)) {
		logger.warn("AgentAuth: Recovered address is not valid");
		throw new Error(AUTH_FAILED);
	}

	const member = await getActiveMemberByPubkey(normalizedAddress);
	if (!member) {
		logger.warn("AgentAuth: Agent not registered or revoked");
		throw new Error(AUTH_FAILED);
	}

	return { member };
}
