import { useLedger } from "@/lib/ledger-provider";
import { useWalletAuth } from "@/lib/wallet-auth";
import { Spinner } from "@/components/ui/Spinner";
import { intentsQueryOptions } from "@/queries/intents";
import type { Intent } from "@agent-intents/shared";
import { AmountDisplay, Button, type FormattedValue } from "@ledgerhq/lumen-ui-react";
import { useQuery } from "@tanstack/react-query";
import { IntentTable } from "./IntentTable";

// =============================================================================
// Helpers
// =============================================================================

/**
 * Sort intents: pending first, then by creation date (newest first)
 */
function sortIntents(intents: Intent[]): Intent[] {
	return [...intents].sort((a, b) => {
		// Pending intents first
		if (a.status === "pending" && b.status !== "pending") return -1;
		if (a.status !== "pending" && b.status === "pending") return 1;

		// Then by date (newest first)
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
}

/**
 * Calculate total pending amount from intents (assumes USDC for now)
 */
function calculatePendingTotal(intents: Intent[]): number {
	return intents
		.filter((i) => i.status === "pending")
		.reduce((sum, i) => sum + Number.parseFloat(i.details.amount), 0);
}

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

// =============================================================================
// Component
// =============================================================================

export function IntentList() {
	const { account, isConnected } = useLedger();
	const { status: authStatus, error: authError, authenticate } = useWalletAuth();

	const {
		data: intents,
		isLoading,
		error,
	} = useQuery({
		...intentsQueryOptions(account?.toLowerCase() ?? ""),
		enabled: isConnected && !!account && authStatus === "authed",
	});

	// Only show pending intents in the main table (completed ones go to history)
	const pendingIntents = intents?.filter((i) => i.status === "pending");
	const sortedIntents = pendingIntents ? sortIntents(pendingIntents) : undefined;
	const pendingCount = pendingIntents?.length ?? 0;
	const pendingTotal = intents ? calculatePendingTotal(intents) : 0;

	return (
		<div className="flex flex-col gap-16">
			{/* Stats Tiles */}
			<div className="flex gap-16">
				{/* Total Pending Amount */}
				<div className="flex flex-1 flex-col gap-8 rounded-md bg-muted-transparent p-16">
					<span className="body-2 text-muted">Total Pending</span>
					<AmountDisplay value={pendingTotal} formatter={usdcFormatter} />
				</div>

				{/* Pending Count */}
				<div className="flex flex-1 flex-col gap-8 rounded-md bg-muted-transparent p-16">
					<span className="body-2 text-muted">Pending Intents</span>
					<div>
						<span className="heading-1-semi-bold text-base">{pendingCount}</span>
						<span className="heading-2-semi-bold text-muted"> intents</span>
					</div>
				</div>
			</div>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-12">
					<h2 className="heading-4-semi-bold text-base">Pending Intents</h2>
					{pendingCount > 0 && (
						<span className="rounded-xs bg-warning px-8 py-4 body-3 text-warning">
							{pendingCount} pending
						</span>
					)}
				</div>
			{intents && intents.length > 0 && (
				<span className="body-2 text-muted">{intents.length} total intents</span>
			)}
			</div>

			{/* Auth prompt — shown when connected but no session yet */}
			{isConnected && (authStatus === "unauthenticated" || authStatus === "error") && (
				<div className="flex flex-col items-center gap-12 rounded-lg bg-muted-transparent p-24">
					<p className="body-2 text-muted text-center">
						Authenticate with your Ledger to view and manage your intents.
					</p>
					{authError && (
						<div className="rounded-sm bg-error-transparent px-12 py-8 body-3 text-error">
							{authError.message}
						</div>
					)}
					<Button
						appearance="accent"
						size="md"
						onClick={authenticate}
						disabled={authStatus === "authing"}
					>
						Authenticate
					</Button>
				</div>
			)}

			{isConnected && authStatus === "authing" && (
				<div className="flex items-center justify-center gap-8 py-12">
					<Spinner size="sm" />
					<span className="body-2 text-muted">Signing authentication challenge…</span>
				</div>
			)}

			{isConnected && authStatus === "checking" && (
				<div className="flex items-center justify-center gap-8 py-12">
					<Spinner size="sm" />
					<span className="body-2 text-muted">Checking session…</span>
				</div>
			)}

			{/* Error display */}
			{error && (
				<div className="rounded-md bg-error-transparent px-16 py-12 body-2 text-error">
					Failed to load intents: {error.message}
				</div>
			)}

			{/* Intent Table */}
			<IntentTable
				intents={sortedIntents}
				isLoading={isLoading}
				isConnected={isConnected}
			/>
		</div>
	);
}
