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
import { Button, Tag } from "@ledgerhq/lumen-ui-react";
import { Copy, Check } from "@ledgerhq/lumen-ui-react/symbols";
import { useState } from "react";

// =============================================================================
// Types
// =============================================================================

interface IntentDetailContentProps {
	intent: Intent;
}

interface IntentActionsProps {
	intent: Intent;
	onClose: () => void;
}

// =============================================================================
// Chain Logo Component (reused from IntentTable)
// =============================================================================

function ChainLogo({ chainId, className }: { chainId: number; className?: string }) {
	if (chainId === 11155111 || chainId === 1) {
		return (
			<div
				className={cn(
					"flex items-center justify-center size-24 rounded-full bg-[#627EEA]",
					className,
				)}
				title="Ethereum"
			>
				<svg
					width="12"
					height="12"
					viewBox="0 0 256 417"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z"
						fill="white"
						fillOpacity="0.6"
					/>
					<path d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z" fill="white" />
					<path
						d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z"
						fill="white"
						fillOpacity="0.6"
					/>
					<path d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z" fill="white" />
				</svg>
			</div>
		);
	}

	if (chainId === 84532 || chainId === 8453) {
		return (
			<div
				className={cn(
					"flex items-center justify-center size-24 rounded-full bg-[#0052FF]",
					className,
				)}
				title="Base"
			>
				<svg
					width="12"
					height="12"
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

	return (
		<div
			className={cn(
				"flex items-center justify-center size-24 rounded-full bg-muted body-4-semi-bold text-base",
				className,
			)}
			title={`Chain ${chainId}`}
		>
			?
		</div>
	);
}

// =============================================================================
// Copy Button Component
// =============================================================================

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="p-6 rounded-sm hover:bg-muted-transparent transition-colors"
			title="Copy address"
		>
			{copied ? (
				<Check className="size-16 text-success" />
			) : (
				<Copy className="size-16 text-muted" />
			)}
		</button>
	);
}

// =============================================================================
// Category Badge Component
// =============================================================================

function CategoryBadge({ category }: { category: string }) {
	const labels: Record<string, string> = {
		api_payment: "API Payment",
		subscription: "Subscription",
		purchase: "Purchase",
		p2p_transfer: "P2P Transfer",
		defi: "DeFi",
		bill_payment: "Bill Payment",
		donation: "Donation",
		other: "Other",
	};

	return (
		<Tag appearance="gray" size="sm">
			{labels[category] ?? category}
		</Tag>
	);
}

// =============================================================================
// Urgency Badge Component
// =============================================================================

function UrgencyBadge({ urgency }: { urgency: string }) {
	const appearances: Record<string, "gray" | "warning" | "error"> = {
		low: "gray",
		normal: "gray",
		high: "warning",
		critical: "error",
	};

	if (urgency === "low" || urgency === "normal") return null;

	return (
		<Tag appearance={appearances[urgency] ?? "gray"} size="sm">
			{urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
		</Tag>
	);
}

// =============================================================================
// Hero Section Component
// =============================================================================

function HeroSection({ intent }: { intent: Intent }) {
	const { details } = intent;
	const chainId = details.chainId as SupportedChainId;
	const chain = SUPPORTED_CHAINS[chainId];

	return (
		<div className="flex flex-col items-center gap-8 py-16">
			<div className="heading-2-semi-bold text-base">
				{details.amount} {details.token}
			</div>
			<div className="flex items-center gap-8">
				<ChainLogo chainId={chainId} />
				<span className="body-2 text-muted">on {chain?.name ?? `Chain ${chainId}`}</span>
			</div>
			<div className="flex items-center gap-8 mt-8">
				<StatusBadge status={intent.status} />
				<UrgencyBadge urgency={intent.urgency} />
			</div>
		</div>
	);
}

// =============================================================================
// Recipient Section Component
// =============================================================================

function RecipientSection({ intent }: { intent: Intent }) {
	const { details } = intent;

	return (
		<div className="rounded-lg bg-muted-transparent p-16">
			<div className="body-3 text-muted mb-6">To</div>
			<div className="flex items-center justify-between gap-8">
				<div className="flex flex-col gap-2">
					<code className="font-mono body-2 text-base">
						{formatAddress(details.recipient)}
					</code>
					{details.recipientEns && (
						<span className="body-3 text-muted">{details.recipientEns}</span>
					)}
				</div>
				<CopyButton text={details.recipient} />
			</div>
		</div>
	);
}

// =============================================================================
// Merchant Section Component
// =============================================================================

function MerchantSection({ intent }: { intent: Intent }) {
	const { details } = intent;
	const { merchant, category, memo } = details;

	if (!merchant && !category && !memo) return null;

	return (
		<div className="rounded-lg bg-muted-transparent p-16 flex flex-col gap-12">
			{merchant && (
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-12">
						{merchant.logo ? (
							<img
								src={merchant.logo}
								alt={merchant.name}
								className="size-32 rounded-full"
							/>
						) : (
							<div className="size-32 rounded-full bg-muted flex items-center justify-center body-3-semi-bold text-muted">
								{merchant.name.charAt(0)}
							</div>
						)}
						<span className="body-1-semi-bold text-base">{merchant.name}</span>
					</div>
					{merchant.verified && (
						<Tag appearance="success" size="sm">
							Verified
						</Tag>
					)}
				</div>
			)}

			{category && (
				<div className="flex items-center gap-8">
					<CategoryBadge category={category} />
				</div>
			)}

			{memo && (
				<div className="border-t border-muted-subtle pt-12">
					<p className="body-2 text-muted italic">"{memo}"</p>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Agent Section Component
// =============================================================================

function AgentSection({ intent }: { intent: Intent }) {
	const { details } = intent;

	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-8">
					<div className="size-24 rounded-full bg-interactive flex items-center justify-center">
						<span className="body-4-semi-bold text-on-interactive">
							{intent.agentName.charAt(0)}
						</span>
					</div>
					<span className="body-2 text-base">{intent.agentName}</span>
				</div>
				<span className="body-3 text-muted">{formatTimeAgo(intent.createdAt)}</span>
			</div>

			{details.resource && (
				<div className="body-3 text-muted truncate" title={details.resource}>
					Resource: {details.resource}
				</div>
			)}

			{intent.expiresAt && (
				<div className="body-3 text-warning">
					Expires {formatTimeAgo(intent.expiresAt)}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Technical Details Section Component
// =============================================================================

function TechnicalDetailsSection({ intent }: { intent: Intent }) {
	const [isExpanded, setIsExpanded] = useState(false);
	const { details } = intent;

	const tokenInfo = SUPPORTED_TOKENS[details.chainId as SupportedChainId]?.[details.token];
	const tokenAddress =
		(details.tokenAddress as string | undefined) ?? tokenInfo?.address;

	return (
		<div className="border-t border-muted-subtle pt-16">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center gap-8 body-3-semi-bold text-muted hover:text-base transition-colors w-full"
			>
				<span className={cn("transition-transform", isExpanded && "rotate-90")}>▶</span>
				Technical Details
			</button>

			{isExpanded && (
				<div className="mt-12 flex flex-col gap-8 body-3 text-muted">
					<div className="flex justify-between">
						<span>Intent ID</span>
						<code className="font-mono text-base">{intent.id.slice(0, 16)}...</code>
					</div>
					{tokenAddress && (
						<div className="flex justify-between">
							<span>Token Contract</span>
							<code className="font-mono text-base">{formatAddress(tokenAddress)}</code>
						</div>
					)}
					<div className="flex justify-between">
						<span>Agent ID</span>
						<code className="font-mono text-base">{intent.agentId}</code>
					</div>
					{intent.statusHistory.length > 0 && (
						<div className="flex flex-col gap-4 mt-8">
							<span className="body-3-semi-bold">Status History</span>
							{intent.statusHistory.map((entry, idx) => (
								<div key={idx} className="flex justify-between text-muted">
									<span>{entry.status}</span>
									<span>{formatTimeAgo(entry.timestamp)}</span>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Actions Component
// =============================================================================

function IntentActions({ intent, onClose }: IntentActionsProps) {
	const { chainId: walletChainId, sendTransaction } = useLedger();
	const updateStatus = useUpdateIntentStatus();

	const [isSigning, setIsSigning] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { details } = intent;
	const intentChainId = details.chainId as SupportedChainId;
	const chain = SUPPORTED_CHAINS[intentChainId];
	const isWrongChain = walletChainId !== null && walletChainId !== intentChainId;
	const isPending = intent.status === "pending";

	const tokenInfo = SUPPORTED_TOKENS[intentChainId]?.[details.token];
	const tokenAddress =
		(details.tokenAddress as `0x${string}` | undefined) ??
		(tokenInfo?.address as `0x${string}` | undefined);
	const tokenDecimals = tokenInfo?.decimals ?? 6;

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

			onClose();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Transaction failed";

			// Check if this is a user-initiated cancellation (not a real failure)
			// This includes: rejecting on device, closing modal, cancelling action
			const lowerMessage = message.toLowerCase();
			const isUserRejection =
				lowerMessage.includes("reject") ||
				lowerMessage.includes("cancel") ||
				lowerMessage.includes("denied") ||
				lowerMessage.includes("closed") ||
				lowerMessage.includes("close") ||
				lowerMessage.includes("user") ||
				lowerMessage.includes("abort");

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
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to reject");
		} finally {
			setIsRejecting(false);
		}
	};

	if (!isPending) {
		return (
			<Button appearance="base" onClick={onClose} isFull>
				Close
			</Button>
		);
	}

	return (
		<div className="flex flex-col gap-12 w-full">
			{error && (
				<div className="rounded-sm bg-error-transparent px-12 py-8 body-3 text-error">
					{error}
				</div>
			)}

			{isWrongChain && (
				<div className="rounded-sm bg-warning-transparent px-12 py-8 body-3 text-warning">
					Switch to {chain?.name ?? "the correct network"} to sign
				</div>
			)}

			<div className="flex gap-12 w-full">
				<Button
					appearance="gray"
					onClick={handleReject}
					disabled={isSigning || isRejecting}
					className="flex-1"
				>
					{isRejecting ? <Spinner size="sm" /> : "Reject"}
				</Button>
				<Button
					appearance="base"
					onClick={handleSign}
					disabled={isSigning || isRejecting || isWrongChain}
					className="flex-1"
				>
					{isSigning ? <Spinner size="sm" /> : "Sign with Ledger"}
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// Main Content Component
// =============================================================================

export function IntentDetailContent({ intent }: IntentDetailContentProps) {
	return (
		<div className="flex flex-col gap-16">
			<HeroSection intent={intent} />
			<RecipientSection intent={intent} />
			<MerchantSection intent={intent} />
			<AgentSection intent={intent} />
			<TechnicalDetailsSection intent={intent} />
		</div>
	);
}

// Attach Actions as a static property for use in DialogFooter
IntentDetailContent.Actions = IntentActions;
