import {
	Outlet,
	ScrollRestoration,
	createRootRoute,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LedgerProvider } from "@/lib/ledger-provider";
import { Shell } from "@/components/layout/Shell";
import "@/styles/app.css";
import "@ledgerhq/ledger-wallet-provider/styles.css";

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
			{ title: "Ledger Agent Payments" },
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
					<Outlet />
				</Shell>
				<ScrollRestoration />
			</LedgerProvider>
		</QueryClientProvider>
	);
}
