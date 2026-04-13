import { type Abi, decodeFunctionData } from "viem";

const ERC20_ABI: Abi = [
	{
		type: "function",
		name: "transfer",
		inputs: [
			{ name: "to", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		outputs: [{ type: "bool", name: "" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "approve",
		inputs: [
			{ name: "spender", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		outputs: [{ type: "bool", name: "" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "transferFrom",
		inputs: [
			{ name: "from", type: "address" },
			{ name: "to", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		outputs: [{ type: "bool", name: "" }],
		stateMutability: "nonpayable",
	},
];

const MULTICALL_ABI: Abi = [
	{
		type: "function",
		name: "multicall",
		inputs: [{ name: "data", type: "bytes[]" }],
		outputs: [{ type: "bytes[]", name: "" }],
		stateMutability: "payable",
	},
];

interface KnownAbi {
	label: string;
	abi: Abi;
	describe: (functionName: string, args: readonly unknown[]) => string;
}

const KNOWN_ABIS: KnownAbi[] = [
	{
		label: "ERC-20",
		abi: ERC20_ABI,
		describe: (fn, args) => {
			if (fn === "transfer") return `Transfer ${args[1]} to ${fmtAddr(args[0] as string)}`;
			if (fn === "approve") return `Approve ${fmtAddr(args[0] as string)} to spend ${args[1]}`;
			if (fn === "transferFrom")
				return `TransferFrom ${fmtAddr(args[0] as string)} to ${fmtAddr(args[1] as string)}`;
			return fn;
		},
	},
	{
		label: "Multicall",
		abi: MULTICALL_ABI,
		describe: (_fn, args) => `Multicall with ${(args[0] as unknown[]).length} calls`,
	},
];

export interface DecodedCall {
	label: string;
	description: string;
	functionName: string;
	args: readonly unknown[];
}

/**
 * Try to decode calldata against known function signatures.
 * Returns null for unknown functions.
 */
export function decodeCalldata(data: string): DecodedCall | null {
	if (!data || data === "0x" || data.length < 10) return null;

	for (const entry of KNOWN_ABIS) {
		try {
			const decoded = decodeFunctionData({ abi: entry.abi, data: data as `0x${string}` });
			return {
				label: entry.label,
				description: entry.describe(decoded.functionName, decoded.args ?? []),
				functionName: decoded.functionName,
				args: decoded.args ?? [],
			};
		} catch {
			// Selector didn't match, try next
		}
	}

	return null;
}

/** Get the 4-byte function selector. */
export function getFunctionSelector(data: string): string | null {
	if (!data || data.length < 10) return null;
	return data.slice(0, 10);
}

function fmtAddr(addr: string): string {
	if (addr.length <= 10) return addr;
	return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
