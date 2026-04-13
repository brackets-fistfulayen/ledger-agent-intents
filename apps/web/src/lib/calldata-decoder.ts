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

const SWAP_ROUTER_ABI: Abi = [
	{
		type: "function",
		name: "exactInputSingle",
		inputs: [
			{
				name: "params",
				type: "tuple",
				components: [
					{ name: "tokenIn", type: "address" },
					{ name: "tokenOut", type: "address" },
					{ name: "fee", type: "uint24" },
					{ name: "recipient", type: "address" },
					{ name: "deadline", type: "uint256" },
					{ name: "amountIn", type: "uint256" },
					{ name: "amountOutMinimum", type: "uint256" },
					{ name: "sqrtPriceLimitX96", type: "uint160" },
				],
			},
		],
		outputs: [{ name: "amountOut", type: "uint256" }],
		stateMutability: "payable",
	},
	{
		type: "function",
		name: "exactInput",
		inputs: [
			{
				name: "params",
				type: "tuple",
				components: [
					{ name: "path", type: "bytes" },
					{ name: "recipient", type: "address" },
					{ name: "deadline", type: "uint256" },
					{ name: "amountIn", type: "uint256" },
					{ name: "amountOutMinimum", type: "uint256" },
				],
			},
		],
		outputs: [{ name: "amountOut", type: "uint256" }],
		stateMutability: "payable",
	},
	{
		type: "function",
		name: "exactOutputSingle",
		inputs: [
			{
				name: "params",
				type: "tuple",
				components: [
					{ name: "tokenIn", type: "address" },
					{ name: "tokenOut", type: "address" },
					{ name: "fee", type: "uint24" },
					{ name: "recipient", type: "address" },
					{ name: "deadline", type: "uint256" },
					{ name: "amountOut", type: "uint256" },
					{ name: "amountInMaximum", type: "uint256" },
					{ name: "sqrtPriceLimitX96", type: "uint160" },
				],
			},
		],
		outputs: [{ name: "amountIn", type: "uint256" }],
		stateMutability: "payable",
	},
	{
		type: "function",
		name: "exactOutput",
		inputs: [
			{
				name: "params",
				type: "tuple",
				components: [
					{ name: "path", type: "bytes" },
					{ name: "recipient", type: "address" },
					{ name: "deadline", type: "uint256" },
					{ name: "amountOut", type: "uint256" },
					{ name: "amountInMaximum", type: "uint256" },
				],
			},
		],
		outputs: [{ name: "amountIn", type: "uint256" }],
		stateMutability: "payable",
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
	{
		type: "function",
		name: "multicall",
		inputs: [
			{ name: "deadline", type: "uint256" },
			{ name: "data", type: "bytes[]" },
		],
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
		label: "Swap",
		abi: SWAP_ROUTER_ABI,
		describe: (fn, args) => {
			const params = args[0] as Record<string, unknown>;
			if (fn === "exactInputSingle" || fn === "exactOutputSingle") {
				return `${fn}: ${fmtAddr(params.tokenIn as string)} → ${fmtAddr(params.tokenOut as string)}`;
			}
			return fn;
		},
	},
	{
		label: "Multicall",
		abi: MULTICALL_ABI,
		describe: (_fn, args) => {
			const data = Array.isArray(args[0]) ? args[0] : args[1];
			return `Multicall with ${(data as unknown[]).length} calls`;
		},
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
