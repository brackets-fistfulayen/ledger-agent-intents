import { createFileRoute } from "@tanstack/react-router";
import { useLedger } from "@/lib/ledger-provider";
import { useWalletAuth } from "@/lib/wallet-auth";
import { intentsQueryOptions } from "@/queries/intents";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { formatAddress } from "@/lib/utils";
import { ChainLogo } from "@/components/ui/ChainLogo";
import { IntentDetailDialog } from "@/components/intents/IntentDetailDialog";
import type { Intent, SupportedChainId } from "@agent-intents/shared";
import { SUPPORTED_CHAINS } from "@agent-intents/shared";
import { AmountDisplay, Tag, type FormattedValue } from "@ledgerhq/lumen-ui-react";
import { useState } from "react";

export const Route = createFileRoute("/history")({
	component: HistoryPage,
});

/** Statuses that represent a "completed" intent (not pending). */
const COMPLETED_STATUSES = new Set([
	"approved",
	"broadcasting",
	"authorized",
	"confirmed",
	"rejected",
	"failed",
	"expired",
]);

/** Statuses that count as a successful transaction. */
const SUCCESS_STATUSES = new Set([
	"approved",
	"broadcasting",
	"authorized",
	"confirmed",
]);

/**
 * Format amount for AmountDisplay component
 */
const usdcFormatter = (value: number): FormattedValue => {
	const [integerPart = "0", decimalPart = "00"] = value.toFixed(2).split(".");
	return {
		integerPart,
		decimalPart,
		currencyText: "$",
		decimalSeparator: ".",
		currencyPosition: "start",
	};
};

function HistoryPage() {
	const { account, isConnected } = useLedger();
	const { status: authStatus } = useWalletAuth();

	const { data: intents, isLoading } = useQuery({
		...intentsQueryOptions(account?.toLowerCase() ?? ""),
		enabled: isConnected && !!account && authStatus === "authed",
	});

	// Filter to only completed intents, newest first
	const completedIntents = intents
		?.filter((i) => COMPLETED_STATUSES.has(i.status))
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);

	const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Stats: only count successful transactions
	const successfulIntents = completedIntents?.filter((i) => SUCCESS_STATUSES.has(i.status));
	const successCount = successfulIntents?.length ?? 0;
	const totalSpent = successfulIntents
		?.reduce((sum, i) => sum + Number.parseFloat(i.details.amount), 0) ?? 0;

	return (
		<div className="flex flex-col gap-32">
			{/* Page header */}
			<div className="flex flex-col gap-8 text-center">
				<h1 className="heading-0-semi-bold text-base">
					Transaction History
				</h1>
				<p className="body-1 text-muted">
					View your signed and completed transactions
				</p>
			</div>

			{/* Stats Tiles */}
			{isConnected && completedIntents && completedIntents.length > 0 && (
				<div className="flex gap-16">
					{/* Total Spent */}
					<div className="flex flex-1 flex-col gap-8 rounded-md bg-muted-transparent p-16">
						<span className="body-2 text-muted">Total Spent</span>
						<AmountDisplay value={totalSpent} formatter={usdcFormatter} />
					</div>

					{/* Total Transactions */}
					<div className="flex flex-1 flex-col gap-8 rounded-md bg-muted-transparent p-16">
						<span className="body-2 text-muted">Total Transactions</span>
						<div>
							<span className="heading-1-semi-bold text-base">{successCount}</span>
							<span className="heading-2-semi-bold text-muted"> transaction{successCount !== 1 ? "s" : ""}</span>
						</div>
					</div>
				</div>
			)}

			{/* Content */}
			{!isConnected ? (
				<div className="rounded-lg bg-surface border border-muted p-24 text-center">
					<p className="body-1 text-muted">
						Connect your Ledger to view transaction history
					</p>
				</div>
			) : isLoading ? (
				<div className="flex items-center justify-center py-48">
					<Spinner size="lg" />
				</div>
			) : !completedIntents || completedIntents.length === 0 ? (
				<div className="rounded-lg bg-surface border border-muted p-24 text-center">
					<p className="body-1 text-muted">No transactions yet</p>
					<p className="body-2 text-muted-subtle mt-8">
						Transactions you sign will appear here
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-8">
					{completedIntents.map((intent) => (
						<HistoryRow
							key={intent.id}
							intent={intent}
							account={account}
							onSelect={() => {
								setSelectedIntent(intent);
								setIsDialogOpen(true);
							}}
						/>
					))}
				</div>
			)}

			<IntentDetailDialog
				intent={selectedIntent}
				open={isDialogOpen}
				onOpenChange={(open) => {
					setIsDialogOpen(open);
					if (!open) setSelectedIntent(null);
				}}
			/>
		</div>
	);
}

// =============================================================================
// History Row
// =============================================================================

/** Get the broadcasted/completed timestamp from status history */
function getBroadcastedDate(intent: Intent): Date {
	// Look for broadcasting or confirmed status in history (most recent success state)
	const broadcastEntry = intent.statusHistory
		.slice()
		.reverse()
		.find((e) => e.status === "broadcasting" || e.status === "confirmed" || e.status === "authorized");
	if (broadcastEntry) return new Date(broadcastEntry.timestamp);
	// Fallback to createdAt
	return new Date(intent.createdAt);
}

/** USDC Logo for history rows */
function UsdcLogo() {
	return (
		<svg
			className="size-20 rounded-full shrink-0"
			viewBox="0 0 2000 2000"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
				fill="#2775ca"
			/>
			<path
				d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
				fill="#fff"
			/>
			<path
				d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
				fill="#fff"
			/>
		</svg>
	);
}

/** External link icon (from Lucide) */
function ExternalLinkIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M15 3h6v6" />
			<path d="M10 14 21 3" />
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
		</svg>
	);
}

function HistoryRow({
	intent,
	account,
	onSelect,
}: {
	intent: Intent;
	account: string | null;
	onSelect: () => void;
}) {
	const { details } = intent;
	const chainId = details.chainId as SupportedChainId;
	const chain = SUPPORTED_CHAINS[chainId];

	// Use the broadcasted date (from status history) instead of createdAt
	const txDate = getBroadcastedDate(intent);
	const formattedDate = txDate.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
	const formattedTime = txDate.toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<button
			type="button"
			onClick={onSelect}
			className="flex items-center gap-16 rounded-lg bg-surface hover:bg-surface-hover transition-colors p-16 text-left w-full"
		>
			{/* Chain logo */}
			<ChainLogo chainId={chainId} />

			{/* Main info */}
			<div className="flex flex-col gap-2 flex-1 min-w-0">
				<div className="flex items-center gap-8">
					<span className="body-2-semi-bold text-base truncate">
						{details.memo || `${details.amount} ${details.token} transfer`}
					</span>
				</div>
				<div className="flex items-center gap-8">
					<span className="body-3 text-muted">
						{account ? formatAddress(account) : "—"}
					</span>
					<span className="body-3 text-muted-subtle">→</span>
					<span className="body-3 text-muted">
						{formatAddress(details.recipient)}
					</span>
					{chain && (
						<>
							<span className="body-3 text-muted-subtle">·</span>
							<span className="body-3 text-muted-subtle">{chain.name}</span>
						</>
					)}
				</div>
			</div>

			{/* Date/time (broadcasted) */}
			<div className="flex flex-col items-end gap-2 shrink-0">
				<span className="body-3 text-muted-subtle">{formattedDate}</span>
				<span className="body-3 text-muted-subtle">{formattedTime}</span>
			</div>

			{/* Amount + USDC logo */}
			<div className="flex items-center gap-8 shrink-0">
				<span className="body-2-semi-bold text-base">
					{details.amount} {details.token}
				</span>
				{details.token === "USDC" && <UsdcLogo />}
			</div>

			{/* Status */}
			<div className="shrink-0">
				<StatusBadge status={intent.status} />
			</div>

			{/* Tx link - Tag with external link icon */}
			<div className="shrink-0" onClick={(e) => e.stopPropagation()}>
				{intent.txUrl ? (
					<a
						href={intent.txUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-6 rounded-xs bg-muted-transparent px-8 py-4 body-3 text-muted hover:text-base hover:bg-muted-hover transition-colors"
					>
						{formatAddress(intent.txUrl.split("/").pop() ?? "")}
						<ExternalLinkIcon className="size-14" />
					</a>
				) : (
					<span className="body-3 text-muted-subtle">—</span>
				)}
			</div>
		</button>
	);
}
