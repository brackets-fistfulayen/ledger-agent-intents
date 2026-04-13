import {
	SUPPORTED_CHAINS,
	SUPPORTED_TOKENS,
	type SupportedChainId,
	resolveToken,
} from "@agent-intents/shared";
import { createPublicClient, formatEther, formatUnits, http } from "viem";
import { base, baseSepolia, sepolia } from "viem/chains";
import type { AgentCredentialFile } from "../lib/credential.js";
import { colors } from "../lib/format.js";

const CHAIN_MAP: Record<number, Parameters<typeof createPublicClient>[0]["chain"]> = {
	8453: base,
	84532: baseSepolia,
	11155111: sepolia,
};

function getClient(chainId: number) {
	const chain = CHAIN_MAP[chainId];
	if (!chain) return null;
	return createPublicClient({ chain, transport: http() });
}

export async function handleBalance(
	args: string[],
	credential: AgentCredentialFile,
): Promise<void> {
	const address = credential.trustchainId as `0x${string}`;

	// Parse optional --chain flag, default to all supported chains
	let chainIds = Object.keys(SUPPORTED_CHAINS).map(Number);
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--chain" && args[i + 1]) {
			chainIds = [Number.parseInt(args[i + 1] ?? "", 10)];
			i++;
		}
	}

	console.log(`${colors.bold("Wallet:")} ${address}`);
	console.log("");

	for (const chainId of chainIds) {
		const chain = SUPPORTED_CHAINS[chainId as SupportedChainId];
		if (!chain) continue;

		const client = getClient(chainId);
		if (!client) continue;

		console.log(`${colors.bold(chain.name)} (${chainId})`);

		// Native ETH balance
		try {
			const ethBalance = await client.getBalance({ address });
			console.log(`  ${chain.symbol}: ${formatEther(ethBalance)}`);
		} catch {
			console.log(`  ${chain.symbol}: ${colors.red("failed to fetch")}`);
		}

		// ERC-20 balances from SUPPORTED_TOKENS
		const tokens = SUPPORTED_TOKENS[chainId as SupportedChainId];
		if (tokens) {
			for (const [ticker, token] of Object.entries(tokens)) {
				try {
					const balance = await client.readContract({
						address: token.address as `0x${string}`,
						abi: [
							{
								type: "function",
								name: "balanceOf",
								inputs: [{ name: "account", type: "address" }],
								outputs: [{ name: "", type: "uint256" }],
								stateMutability: "view",
							},
						],
						functionName: "balanceOf",
						args: [address],
					});
					console.log(`  ${ticker}: ${formatUnits(balance, token.decimals)}`);
				} catch {
					console.log(`  ${ticker}: ${colors.red("failed to fetch")}`);
				}
			}
		}

		// Also check any token passed as --token
		for (let i = 0; i < args.length; i++) {
			if (args[i] === "--token" && args[i + 1]) {
				const ticker = (args[i + 1] ?? "").toUpperCase();
				if (tokens?.[ticker]) {
					i++;
					continue;
				}
				const resolved = await resolveToken(chainId, ticker);
				if (resolved) {
					try {
						const balance = await client.readContract({
							address: resolved.address as `0x${string}`,
							abi: [
								{
									type: "function",
									name: "balanceOf",
									inputs: [{ name: "account", type: "address" }],
									outputs: [{ name: "", type: "uint256" }],
									stateMutability: "view",
								},
							],
							functionName: "balanceOf",
							args: [address],
						});
						console.log(`  ${ticker}: ${formatUnits(balance, resolved.decimals)}`);
					} catch {
						console.log(`  ${ticker}: ${colors.red("failed to fetch")}`);
					}
				}
				i++;
			}
		}

		console.log("");
	}
}
