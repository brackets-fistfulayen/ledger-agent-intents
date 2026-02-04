import { useLedger } from "@/lib/ledger-provider";
import { intentsQueryOptions } from "@/queries/intents";
import type { Intent } from "@agent-intents/shared";
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

// =============================================================================
// Component
// =============================================================================

export function IntentList() {
	const { account, isConnected } = useLedger();

	const {
		data: intents,
		isLoading,
		error,
	} = useQuery({
		...intentsQueryOptions(account ?? ""),
		enabled: isConnected && !!account,
	});

	// Sort intents if we have them
	const sortedIntents = intents ? sortIntents(intents) : undefined;
	const pendingCount = intents?.filter((i) => i.status === "pending").length ?? 0;

	return (
		<div className="flex flex-col gap-16">
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
					<span className="body-2 text-muted">{intents.length} total</span>
				)}
			</div>

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
