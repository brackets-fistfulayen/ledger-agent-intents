import { createFileRoute } from "@tanstack/react-router";
import { IntentList } from "@/components/intents";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="flex flex-col gap-32">
			{/* Page header */}
			<div className="flex flex-col gap-8">
				<h1 className="heading-1-semi-bold text-base">Ledger Agent Payments</h1>
				<p className="body-1 text-muted">
					Agents propose, humans sign with hardware
				</p>
			</div>

			{/* Intent List (handles all states internally) */}
			<IntentList />
		</div>
	);
}
