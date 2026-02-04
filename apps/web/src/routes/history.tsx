import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
	component: HistoryPage,
});

function HistoryPage() {
	return (
		<div className="flex flex-col gap-32">
			{/* Page header */}
			<div className="flex flex-col gap-8 text-center">
				<h1 className="heading-0-semi-bold text-base">Transaction History</h1>
				<p className="body-1 text-muted">
					View your signed transactions
				</p>
			</div>

			{/* Transaction list placeholder */}
			<div className="flex flex-col gap-16">
				<div className="rounded-lg bg-surface border border-muted p-24 text-center">
					<p className="body-1 text-muted">No transactions yet</p>
					<p className="body-2 text-muted-subtle mt-8">
						Transactions you sign will appear here
					</p>
				</div>
			</div>
		</div>
	);
}
