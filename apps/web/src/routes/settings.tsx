import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<div className="flex flex-col gap-32">
			{/* Page header */}
			<div className="flex flex-col gap-8 text-center">
				<h1 className="heading-0-semi-bold text-base">Settings</h1>
				<p className="body-1 text-muted">
					Configure your preferences
				</p>
			</div>

			{/* Settings placeholder */}
			<div className="flex flex-col gap-16">
				<div className="rounded-lg bg-surface border border-muted p-24 text-center">
					<p className="body-1 text-muted">Settings coming soon</p>
				</div>
			</div>
		</div>
	);
}
