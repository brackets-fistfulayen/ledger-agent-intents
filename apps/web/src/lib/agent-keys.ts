/**
 * Agent Key utilities for LKRP agent provisioning.
 *
 * Key generation uses LKRP's NobleCryptoService with Curve.K256 (secp256k1),
 * the same crypto primitives used by Ledger Key Ring Protocol internally.
 *
 * The agent authenticates API requests using EIP-191 personal_sign over a
 * `<timestamp>.<bodyHash>` message.  The backend recovers the signer address
 * and checks it against the registered public key.
 */

import {
	Curve,
	type KeyPair,
	NobleCryptoService,
} from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol";

// Re-export KeyPair so callers don't need the LKRP import directly
export type { KeyPair };

// =============================================================================
// Key Generation (LKRP NobleCryptoService)
// =============================================================================

export interface AgentKeyMaterial {
	/** LKRP KeyPair instance – carries sign/verify methods. */
	keyPair: KeyPair;
	/** Hex-encoded private key (0x-prefixed).  Show ONCE to the user. */
	privateKeyHex: string;
	/** Hex-encoded public key (compressed, 0x-prefixed). Stored on the backend. */
	publicKeyHex: string;
}

/**
 * Generate a fresh secp256k1 agent keypair using LKRP's crypto service.
 * The private key MUST be shown/downloaded to the user exactly once and never stored.
 */
export async function generateAgentKeyPair(): Promise<AgentKeyMaterial> {
	const crypto = new NobleCryptoService();
	const keyPair = await crypto.createKeyPair(Curve.K256);

	// NobleKeyPair.id is 0x-prefixed; getPublicKeyToHex() may not be
	const rawPub = keyPair.getPublicKeyToHex();
	const publicKeyHex = rawPub.startsWith("0x") ? rawPub : `0x${rawPub}`;

	return {
		keyPair,
		privateKeyHex: keyPair.id, // NobleKeyPair.id is the 0x-prefixed private key hex
		publicKeyHex,
	};
}

// =============================================================================
// Downloadable Agent Credential (JSON keyfile)
// =============================================================================

export interface AgentCredentialFile {
	/** Schema version for forward-compatibility. */
	version: 1;
	/** User-friendly label. */
	label: string;
	/** Trustchain (user identity) this agent belongs to. */
	trustchainId: string;
	/** Hex-encoded secp256k1 private key (0x-prefixed). */
	privateKey: string;
	/** Hex-encoded secp256k1 compressed public key (0x-prefixed). */
	publicKey: string;
	/** ISO timestamp when the credential was created. */
	createdAt: string;
}

/**
 * Build the JSON content for the downloadable agent credential file.
 */
export function buildAgentCredentialFile(params: {
	label: string;
	trustchainId: string;
	privateKeyHex: string;
	publicKeyHex: string;
}): AgentCredentialFile {
	return {
		version: 1,
		label: params.label,
		trustchainId: params.trustchainId,
		privateKey: params.privateKeyHex,
		publicKey: params.publicKeyHex,
		createdAt: new Date().toISOString(),
	};
}

/**
 * Trigger a browser download of the agent credential JSON file.
 */
export function downloadAgentCredential(credential: AgentCredentialFile): void {
	const json = JSON.stringify(credential, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `agent-${credential.label.toLowerCase().replace(/\s+/g, "-")}-credential.json`;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
}

// =============================================================================
// Device Authorization (EIP-191 personal_sign on Ledger)
// =============================================================================

/**
 * Build the EIP-191 message the user signs on their Ledger device to
 * authorize a new agent key.  Both frontend and backend MUST use this
 * exact format so the recovered address matches.
 */
export function buildAuthorizationMessage(params: {
	agentPublicKey: string;
	agentLabel: string;
	trustchainId: string;
}): string {
	return [
		"Authorize agent key for Ledger Agent Payments",
		`Key: ${params.agentPublicKey}`,
		`Label: ${params.agentLabel}`,
		`Identity: ${params.trustchainId}`,
	].join("\n");
}

/**
 * Build the EIP-191 message the user signs on their Ledger device to
 * revoke an agent key.  Both frontend and backend MUST use this
 * exact format so the recovered address matches.
 */
export function buildRevocationMessage(params: {
	agentId: string;
	agentPublicKey: string;
	trustchainId: string;
}): string {
	return [
		"Revoke agent key for Ledger Agent Payments",
		`Agent ID: ${params.agentId}`,
		`Key: ${params.agentPublicKey}`,
		`Identity: ${params.trustchainId}`,
	].join("\n");
}

// =============================================================================
// Agent Request Signing (used by the agent to authenticate API calls)
// =============================================================================

/**
 * Create a signed Authorization header value for an agent API request.
 *
 * Format: `AgentAuth <timestamp>.<bodyHash>.<signature>`
 *
 * - timestamp: Unix epoch seconds (must be within 5 min of server time)
 * - bodyHash: keccak256 of the JSON request body (or "0x" for GET requests)
 * - signature: EIP-191 personal_sign of `<timestamp>.<bodyHash>`
 *
 * This function is intended to run in the agent's runtime (Node.js, etc.),
 * where the private key is imported into a viem account.  The LKRP-generated
 * private key is a standard secp256k1 key and works with viem/ethers directly.
 *
 * Example (agent-side, Node.js):
 * ```ts
 * import { privateKeyToAccount } from "viem/accounts";
 * import { keccak256, toHex } from "viem";
 *
 * const account = privateKeyToAccount(credential.privateKey as `0x${string}`);
 * const timestamp = Math.floor(Date.now() / 1000).toString();
 * const bodyHash = body ? keccak256(toHex(body)) : "0x";
 * const message = `${timestamp}.${bodyHash}`;
 * const signature = await account.signMessage({ message });
 * const header = `AgentAuth ${timestamp}.${bodyHash}.${signature}`;
 * ```
 */
// NOTE: This is documentation-only.  The actual signing runs in the agent
// runtime, not in the browser.  See the agent SDK / backend examples.
