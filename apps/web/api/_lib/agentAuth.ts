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
export async function verifyAgentAuth(req: VercelRequest): Promise<AgentAuthResult> {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		throw new Error("Missing Authorization header");
	}

	if (!authHeader.startsWith("AgentAuth ")) {
		throw new Error("Invalid authorization scheme – expected AgentAuth");
	}

	const payload = authHeader.slice("AgentAuth ".length);
	const parts = payload.split(".");

	// Format: <timestamp>.<bodyHash>.<signature>
	// The signature is itself 0x-prefixed and may contain '.' in theory,
	// so we split into exactly 3 parts: timestamp, bodyHash, rest-is-signature.
	if (parts.length < 3) {
		throw new Error("Malformed AgentAuth header");
	}

	const timestamp = parts[0];
	const bodyHash = parts[1];
	const signature = parts.slice(2).join(".") as `0x${string}`;

	// 1. Validate timestamp freshness
	const ts = Number.parseInt(timestamp, 10);
	if (Number.isNaN(ts)) {
		throw new Error("Invalid timestamp in AgentAuth header");
	}

	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - ts) > MAX_TIMESTAMP_DRIFT_SECONDS) {
		throw new Error("AgentAuth timestamp expired or too far in the future");
	}

	// 2. Validate body hash (for non-GET requests)
	if (req.method !== "GET" && req.method !== "HEAD") {
		const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
		const expectedHash = keccak256(toHex(rawBody));
		if (bodyHash !== expectedHash) {
			throw new Error("AgentAuth body hash mismatch");
		}
	}

	// 3. Recover signer address from the EIP-191 personal_sign signature
	const message = `${timestamp}.${bodyHash}`;
	const recoveredAddress = await recoverMessageAddress({
		message,
		signature,
	});

	const normalizedAddress = recoveredAddress.toLowerCase();
	if (!isAddress(normalizedAddress)) {
		throw new Error("Recovered address is not valid");
	}

	// 4. Look up the agent in the trustchain_members registry
	const member = await getActiveMemberByPubkey(normalizedAddress);
	if (!member) {
		throw new Error("Agent not registered or revoked");
	}

	return { member };
}
