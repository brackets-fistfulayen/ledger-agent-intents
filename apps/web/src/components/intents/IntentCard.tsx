import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { encodeERC20Transfer } from "@/lib/erc20";
import { useLedger } from "@/lib/ledger-provider";
import { cn, formatAddress, formatTimeAgo } from "@/lib/utils";
import { useUpdateIntentStatus } from "@/queries/intents";
import {
	type Intent,
	SUPPORTED_CHAINS,
	SUPPORTED_TOKENS,
	type SupportedChainId,
} from "@agent-intents/shared";
import { Button } from "@ledgerhq/lumen-ui-react";
import { useState } from "react";

// =============================================================================
// Types
// =============================================================================

interface IntentCardProps {
	intent: Intent;
}

// =============================================================================
// Component
// =============================================================================

export function IntentCard({ intent }: IntentCardProps) {
	const { chainId: walletChainId, sendTransaction } = useLedger();
	const updateStatus = useUpdateIntentStatus();

	const [isSigning, setIsSigning] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { details } = intent;
	const intentChainId = details.chainId as SupportedChainId;
	const chain = SUPPORTED_CHAINS[intentChainId];
	const isWrongChain = walletChainId !== intentChainId;
	const isPending = intent.status === "pending";

	// Get token info
	const tokenInfo = SUPPORTED_TOKENS[intentChainId]?.[details.token];
	const tokenAddress =
		(details.tokenAddress as `0x${string}` | undefined) ??
		(tokenInfo?.address as `0x${string}` | undefined);
	const tokenDecimals = tokenInfo?.decimals ?? 6;

	// ==========================================================================
	// Handlers
	// ==========================================================================

	const handleSign = async () => {
		setError(null);

		// 1. Validate chain
		if (isWrongChain) {
			setError(`Please switch to ${chain?.name ?? "the correct network"} to sign`);
			return;
		}

		// 2. Validate token address
		if (!tokenAddress) {
			setError(`Unknown token address for ${details.token}`);
			return;
		}

		// 3. Encode ERC-20 transfer
		const encodeResult = encodeERC20Transfer(
			details.recipient as `0x${string}`,
			details.amount,
			tokenDecimals,
		);

		if (!encodeResult.success) {
			setError(encodeResult.error);
			return;
		}

		// 4. Send transaction via Ledger
		setIsSigning(true);

		try {
			const txHash = await sendTransaction({
				to: tokenAddress,
				data: encodeResult.data,
				value: "0x0",
			});

			// 5. Update intent status with txHash
			await updateStatus.mutateAsync({
				id: intent.id,
				status: "signed",
				txHash,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : "Transaction failed";

			// Check if user rejected on device - don't update status (allow retry)
			const isUserRejection =
				message.toLowerCase().includes("reject") ||
				message.toLowerCase().includes("cancel") ||
				message.toLowerCase().includes("denied");

			if (!isUserRejection) {
				// Transaction broadcast failed - mark as failed
				try {
					await updateStatus.mutateAsync({
						id: intent.id,
						status: "failed",
						note: message,
					});
				} catch {
					// Ignore status update failure - user will see error anyway
				}
			}

			setError(message);
		} finally {
			setIsSigning(false);
		}
	};

	const handleReject = async () => {
		setError(null);
		setIsRejecting(true);

		try {
			await updateStatus.mutateAsync({
				id: intent.id,
				status: "rejected",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to reject");
		} finally {
			setIsRejecting(false);
		}
	};

	// ==========================================================================
	// Render
	// ==========================================================================

	return (
		<div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-24 transition-colors hover:border-neutral-700">
			{/* Header: Agent + Status */}
			<div className="mb-16 flex items-start justify-between">
				<div className="flex flex-col gap-4">
					<span className="text-sm font-medium text-white">{intent.agentName}</span>
					<span className="text-xs text-neutral-400">{formatTimeAgo(intent.createdAt)}</span>
				</div>
				<StatusBadge status={intent.status} />
			</div>

			{/* Transfer Details */}
			<div className="mb-16 rounded-md bg-neutral-800/50 p-16">
				<div className="mb-12 flex items-baseline justify-between">
					<span className="text-2xl font-semibold text-white">
						{details.amount} {details.token}
					</span>
					<span className="text-xs text-neutral-400">
						on {chain?.name ?? `Chain ${intentChainId}`}
					</span>
				</div>

				<div className="flex items-center gap-8 text-sm">
					<span className="text-neutral-400">To:</span>
					<code className="rounded bg-neutral-700/50 px-8 py-2 font-mono text-xs text-neutral-300">
						{formatAddress(details.recipient)}
					</code>
					{details.recipientEns && (
						<span className="text-neutral-300">({details.recipientEns})</span>
					)}
				</div>

				{details.memo && (
					<div className="mt-12 border-t border-neutral-700 pt-12">
						<p className="text-sm text-neutral-300">"{details.memo}"</p>
					</div>
				)}
			</div>

			{/* Error Display */}
			{error && (
				<div className="mb-16 rounded-md bg-red-500/10 px-12 py-8 text-sm text-red-400">
					{error}
				</div>
			)}

			{/* Actions (only for pending intents) */}
			{isPending && (
				<div className="flex gap-12">
					<Button
						appearance="accent"
						size="md"
						onClick={handleSign}
						disabled={isSigning || isRejecting || isWrongChain}
						className={cn("flex-1", isWrongChain && "cursor-not-allowed opacity-50")}
						title={
							isWrongChain ? `Switch to ${chain?.name ?? "the correct network"} to sign` : undefined
						}
					>
						{isSigning ? (
							<span className="flex items-center gap-8">
								<Spinner size="sm" />
								Signing...
							</span>
						) : isWrongChain ? (
							`Switch to ${chain?.name ?? "Network"}`
						) : (
							"Sign with Ledger"
						)}
					</Button>

					<Button
						appearance="gray"
						size="md"
						onClick={handleReject}
						disabled={isSigning || isRejecting}
					>
						{isRejecting ? (
							<span className="flex items-center gap-8">
								<Spinner size="sm" />
								Rejecting...
							</span>
						) : (
							"Reject"
						)}
					</Button>
				</div>
			)}

			{/* Explorer Link (for signed/confirmed intents) */}
			{intent.txUrl && (
				<div className="mt-16 border-t border-neutral-800 pt-16">
					<a
						href={intent.txUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-6 text-sm text-blue-400 hover:text-blue-300 hover:underline"
					>
						View on Explorer
						<svg
							className="size-14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden="true"
						>
							<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
							<polyline points="15 3 21 3 21 9" />
							<line x1="10" y1="14" x2="21" y2="3" />
						</svg>
					</a>
				</div>
			)}
		</div>
	);
}
