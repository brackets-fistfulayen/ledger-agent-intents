import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AddressPickerDialog } from "@/components/device/AddressPickerDialog";
import { ConnectDeviceDialog } from "@/components/device/ConnectDeviceDialog";
import { DeviceActionDialog } from "@/components/device/DeviceActionDialog";
import { Shell } from "@/components/layout/Shell";
import { LedgerProvider } from "@/lib/ledger-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import "@/styles/app.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5000,
			refetchOnWindowFocus: true,
		},
	},
});

export const Route = createRootRoute({
	component: RootComponent,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Agent Payments with Ledger" },
			{
				name: "description",
				content: "Agents propose, humans sign with hardware.",
			},
		],
	}),
});

function RootComponent() {
	return (
		<QueryClientProvider client={queryClient}>
			<LedgerProvider>
				<Shell>
					<ErrorBoundary>
						<Outlet />
					</ErrorBoundary>
				</Shell>
				<DeviceActionDialog />
				<ConnectDeviceDialog />
				<AddressPickerDialog />
			</LedgerProvider>
		</QueryClientProvider>
	);
}
