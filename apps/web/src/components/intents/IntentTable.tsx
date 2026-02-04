import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { encodeERC20Transfer } from "@/lib/erc20";
import { useLedger } from "@/lib/ledger-provider";
import { cn, formatAddress } from "@/lib/utils";
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

interface IntentTableProps {
	intents?: Intent[];
	isLoading?: boolean;
	isConnected?: boolean;
	className?: string;
}

interface IntentRowProps {
	intent: Intent;
}

// =============================================================================
// Chain Logo Component
// =============================================================================

function ChainLogo({ chainId, className }: { chainId: number; className?: string }) {
	// Ethereum/Sepolia logo
	if (chainId === 11155111 || chainId === 1) {
		return (
			<div
				className={cn(
					"flex items-center justify-center size-32 rounded-full bg-[#627EEA]",
					className,
				)}
				title="Sepolia"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 256 417"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z"
						fill="white"
						fillOpacity="0.6"
					/>
					<path
						d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z"
						fill="white"
					/>
					<path
						d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z"
						fill="white"
						fillOpacity="0.6"
					/>
					<path
						d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z"
						fill="white"
					/>
				</svg>
			</div>
		);
	}

	// Base/Base Sepolia logo
	if (chainId === 84532 || chainId === 8453) {
		return (
			<div
				className={cn(
					"flex items-center justify-center size-32 rounded-full bg-[#0052FF]",
					className,
				)}
				title="Base Sepolia"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 111 111"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
						fill="white"
					/>
				</svg>
			</div>
		);
	}

	// Unknown chain fallback
	return (
		<div
			className={cn(
				"flex items-center justify-center size-32 rounded-full bg-muted body-4-semi-bold text-base",
				className,
			)}
			title={`Chain ${chainId}`}
		>
			?
		</div>
	);
}

// =============================================================================
// Table Header Component
// =============================================================================

function TableHeader() {
	return (
		<thead>
			<tr className="border-b border-muted">
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					Intent ID
				</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					From
				</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					To
				</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					Amount
				</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					Chain
				</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					Status
				</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					Actions
				</th>
			</tr>
		</thead>
	);
}

// =============================================================================
// Empty Row Component
// =============================================================================

function EmptyRow({ message }: { message: string }) {
	return (
		<tr>
			<td colSpan={7} className="py-64 px-24 text-center">
				<span className="body-1 text-muted">{message}</span>
			</td>
		</tr>
	);
}

// =============================================================================
// Loading Row Component
// =============================================================================

function LoadingRow() {
	return (
		<tr>
			<td colSpan={7} className="py-64 px-24 text-center">
				<div className="flex items-center justify-center gap-12">
					<Spinner size="lg" className="text-muted" />
					<span className="body-1 text-muted">Loading intents...</span>
				</div>
			</td>
		</tr>
	);
}

// =============================================================================
// Intent Row Component
// =============================================================================

function IntentRow({ intent }: IntentRowProps) {
	const { chainId: walletChainId, sendTransaction, account } = useLedger();
	const updateStatus = useUpdateIntentStatus();

	const [isSigning, setIsSigning] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { details } = intent;
	const intentChainId = details.chainId as SupportedChainId;
	const chain = SUPPORTED_CHAINS[intentChainId];
	const isPending = intent.status === "pending";

	// Check chain mismatch - only if we know the wallet chain
	const isWrongChain = walletChainId !== null && walletChainId !== intentChainId;

	// Get token info
	const tokenInfo = SUPPORTED_TOKENS[intentChainId]?.[details.token];
	const tokenAddress =
		(details.tokenAddress as `0x${string}` | undefined) ??
		(tokenInfo?.address as `0x${string}` | undefined);
	const tokenDecimals = tokenInfo?.decimals ?? 6;

	// Format intent ID (first 8 chars)
	const shortId = intent.id.slice(0, 8);

	// ==========================================================================
	// Handlers
	// ==========================================================================

	const handleSign = async () => {
		setError(null);

		if (isWrongChain) {
			setError(`Please switch to ${chain?.name ?? "the correct network"} to sign`);
			return;
		}

		if (!tokenAddress) {
			setError(`Unknown token address for ${details.token}`);
			return;
		}

		const encodeResult = encodeERC20Transfer(
			details.recipient as `0x${string}`,
			details.amount,
			tokenDecimals,
		);

		if (!encodeResult.success) {
			setError(encodeResult.error);
			return;
		}

		setIsSigning(true);

		try {
			const txHash = await sendTransaction({
				to: tokenAddress,
				data: encodeResult.data,
				value: "0x0",
			});

			await updateStatus.mutateAsync({
				id: intent.id,
				status: "signed",
				txHash,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : "Transaction failed";

			const isUserRejection =
				message.toLowerCase().includes("reject") ||
				message.toLowerCase().includes("cancel") ||
				message.toLowerCase().includes("denied");

			if (!isUserRejection) {
				try {
					await updateStatus.mutateAsync({
						id: intent.id,
						status: "failed",
						note: message,
					});
				} catch {
					// Ignore status update failure
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
		<>
			<tr className="group border-b border-muted-subtle last:border-b-0 transition-colors hover:bg-muted-transparent">
				{/* Intent ID */}
				<td className="py-20 px-24">
					<code className="font-mono body-2 text-muted">{shortId}...</code>
				</td>

				{/* From */}
				<td className="py-20 px-24">
					<code className="font-mono body-2 text-base">
						{account ? formatAddress(account) : "—"}
					</code>
				</td>

				{/* To */}
				<td className="py-20 px-24">
					<div className="flex flex-col gap-2">
						<code className="font-mono body-2 text-base">
							{formatAddress(details.recipient)}
						</code>
						{details.recipientEns && (
							<span className="body-3 text-muted">{details.recipientEns}</span>
						)}
					</div>
				</td>

				{/* Amount */}
				<td className="py-20 px-24">
					<span className="body-1-semi-bold text-base">
						{details.amount} {details.token}
					</span>
				</td>

				{/* Chain */}
				<td className="py-20 px-24">
					<ChainLogo chainId={intentChainId} />
				</td>

				{/* Status */}
				<td className="py-20 px-24">
					<StatusBadge status={intent.status} />
				</td>

				{/* Actions */}
				<td className="py-20 px-24">
					{isPending ? (
						<div className="flex items-center gap-12">
							<Button
								appearance="accent"
								size="sm"
								onClick={handleSign}
								disabled={isSigning || isRejecting}
							>
								{isSigning ? <Spinner size="sm" /> : "Sign"}
							</Button>
							<Button
								appearance="gray"
								size="sm"
								onClick={handleReject}
								disabled={isSigning || isRejecting}
							>
								{isRejecting ? <Spinner size="sm" /> : "Reject"}
							</Button>
							{isWrongChain && (
								<span className="body-3 text-warning">
									({chain?.name ?? "Wrong network"})
								</span>
							)}
						</div>
					) : intent.txUrl ? (
						<a
							href={intent.txUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="body-3 text-interactive hover:text-interactive-hover hover:underline"
						>
							View tx ↗
						</a>
					) : (
						<span className="body-3 text-muted-subtle">—</span>
					)}
				</td>
			</tr>

			{/* Error row */}
			{error && (
				<tr>
					<td colSpan={7} className="px-24 pb-16">
						<div className="rounded-sm bg-error-transparent px-16 py-10 body-2 text-error">
							{error}
						</div>
					</td>
				</tr>
			)}
		</>
	);
}

// =============================================================================
// Intent Table Component
// =============================================================================

export function IntentTable({
	intents,
	isLoading = false,
	isConnected = false,
	className,
}: IntentTableProps) {
	// Determine what to show in the table body
	const renderTableBody = () => {
		// Loading state
		if (isLoading) {
			return <LoadingRow />;
		}

		// Not connected - show empty table
		if (!isConnected) {
			return <EmptyRow message="Connect your Ledger to view intents" />;
		}

		// Connected but no intents
		if (!intents || intents.length === 0) {
			return <EmptyRow message="No intent yet" />;
		}

		// Show intents
		return intents.map((intent) => <IntentRow key={intent.id} intent={intent} />);
	};

	return (
		<div className={cn("rounded-xl bg-muted-transparent overflow-hidden w-full", className)}>
			<div className="overflow-x-auto">
				<table className="w-full table-auto">
					<TableHeader />
					<tbody>{renderTableBody()}</tbody>
				</table>
			</div>
		</div>
	);
}
