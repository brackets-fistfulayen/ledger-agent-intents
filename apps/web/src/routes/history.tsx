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
	const date = new Date(intent.createdAt);
	const formattedDate = date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
	const formattedTime = date.toLocaleTimeString(undefined, {
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

			{/* Amount */}
			<div className="flex flex-col items-end gap-2 shrink-0">
				<span className="body-2-semi-bold text-base">
					{details.amount} {details.token}
				</span>
				<span className="body-3 text-muted-subtle">
					{formattedDate} {formattedTime}
				</span>
			</div>

			{/* Status */}
			<div className="shrink-0">
				<StatusBadge status={intent.status} />
			</div>

			{/* Tx link */}
			<div className="shrink-0 w-64 text-right">
				{intent.txUrl ? (
					<a
						href={intent.txUrl}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
						className="body-3 text-interactive hover:text-interactive-hover hover:underline"
					>
						View tx ↗
					</a>
				) : (
					<span className="body-3 text-muted-subtle">—</span>
				)}
			</div>
		</button>
	);
}
