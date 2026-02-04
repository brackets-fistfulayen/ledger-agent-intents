import { encodeFunctionData, parseUnits } from "viem";

// =============================================================================
// ERC-20 Transfer ABI (minimal for transfer function only)
// =============================================================================

const ERC20_TRANSFER_ABI = [
	{
		name: "transfer",
		type: "function",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "to", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		outputs: [{ type: "bool" }],
	},
] as const;

// =============================================================================
// Types
// =============================================================================

export type EncodeResult =
	| { success: true; data: `0x${string}` }
	| { success: false; error: string };

// =============================================================================
// Functions
// =============================================================================

/**
 * Encode an ERC-20 transfer function call.
 *
 * @param recipient - The recipient address (0x-prefixed)
 * @param amount - Human-readable amount (e.g., "100.50")
 * @param decimals - Token decimals (default: 6 for USDC)
 * @returns Success with encoded data, or failure with error message
 *
 * @example
 * const result = encodeERC20Transfer("0x1234...", "100.00", 6);
 * if (result.success) {
 *   // result.data is ready for eth_sendTransaction
 * }
 */
export function encodeERC20Transfer(
	recipient: `0x${string}`,
	amount: string,
	decimals = 6,
): EncodeResult {
	try {
		// Validate recipient address format
		if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
			return {
				success: false,
				error: "Invalid recipient address format",
			};
		}

		// Parse amount to proper units
		const parsedAmount = parseUnits(amount, decimals);

		// Ensure amount is positive
		if (parsedAmount <= 0n) {
			return {
				success: false,
				error: "Amount must be greater than zero",
			};
		}

		// Encode the transfer function call
		const data = encodeFunctionData({
			abi: ERC20_TRANSFER_ABI,
			functionName: "transfer",
			args: [recipient, parsedAmount],
		});

		return { success: true, data };
	} catch (err) {
		// Handle specific error cases
		if (err instanceof Error) {
			// viem throws specific errors for invalid inputs
			if (err.message.includes("could not be parsed")) {
				return {
					success: false,
					error: `Invalid amount format: ${amount}`,
				};
			}
			return {
				success: false,
				error: err.message,
			};
		}

		return {
			success: false,
			error: "Failed to encode transfer",
		};
	}
}
