/**
 * Generate a test secp256k1 keypair for XSS exploitation testing.
 *
 * This script creates a random Ethereum keypair and saves it in the format
 * expected by the agent credential system.
 *
 * Usage:
 *   npx tsx scripts/generate-test-keypair.ts [output-file]
 *
 * Example:
 *   npx tsx scripts/generate-test-keypair.ts ./test-agent-credential.json
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generatePrivateKey, privateKeyToAccount, privateKeyToPublicKey } from "viem/accounts";

interface AgentCredentialFile {
	version: number;
	label: string;
	trustchainId: string;
	privateKey: string;
	publicKey: string;
	address: string;
	createdAt: string;
}

function main() {
	// Parse CLI arguments
	const args = process.argv.slice(2);
	const outputPath = args[0] || "./test-agent-credential.json";
	const absPath = resolve(outputPath);

	console.log("🔐 Generating test secp256k1 keypair...\n");

	// Generate random private key
	const privateKey = generatePrivateKey();

	// Derive public key and address
	const publicKey = privateKeyToPublicKey(privateKey);
	const account = privateKeyToAccount(privateKey);
	const address = account.address;

	// Create credential object
	const credential: AgentCredentialFile = {
		version: 1,
		label: "XSS Test Agent",
		trustchainId: "test-trustchain-xss-exploit",
		privateKey: privateKey,
		publicKey: publicKey,
		address: address,
		createdAt: new Date().toISOString(),
	};

	// Save to file
	writeFileSync(absPath, JSON.stringify(credential, null, 2), "utf-8");

	// Display the credentials
	console.log("✅ Test keypair generated successfully!\n");
	console.log("📋 Credentials:");
	console.log("━".repeat(80));
	console.log(`Private Key: ${privateKey}`);
	console.log(`Public Key:  ${publicKey}`);
	console.log(`Address:     ${address}`);
	console.log("━".repeat(80));
	console.log(`\n💾 Saved to: ${absPath}\n`);
	console.log("⚠️  WARNING: This is a TEST keypair. Do NOT use for real funds!\n");
}

main();
