import { Button } from "@ledgerhq/lumen-ui-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@tanstack/react-router";
import { useLedger } from "@/lib/ledger-provider";

// Ledger logo SVG
function LedgerLogo() {
	return (
		<svg
			width="28"
			height="24"
			viewBox="0 0 768.91 669.35"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M0,479.29v190.06h289.22V627.2H42.14V479.29H0z M726.77,479.29V627.2H479.69v42.14h289.22V479.29H726.77z M289.64,190.06v289.22h190.05v-38.01H331.78V190.06H289.64z M0,0v190.06h42.14V42.14h247.08V0H0z M479.69,0v42.14h247.08v147.92h42.14V0H479.69z"
				fill="white"
			/>
		</svg>
	);
}

export function Header() {
	const { account, isConnected, isConnecting, connect, disconnect } =
		useLedger();

	return (
		<header className="flex h-80 items-center justify-between px-40">
			{/* Left: Logo */}
			<Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
				<LedgerLogo />
			</Link>

			{/* Right: Actions */}
			<div className="flex items-center gap-16">
				<Link
					to="/docs"
					className="body-2-semi-bold text-muted hover:text-base transition-colors"
				>
					API Docs
				</Link>
				{isConnected ? (
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<Button appearance="transparent" size="md">
								{account?.slice(0, 6)}...{account?.slice(-4)}
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Portal>
							<DropdownMenu.Content
								className="min-w-[160px] rounded-md bg-surface p-4 shadow-lg border border-muted"
								sideOffset={8}
								align="end"
							>
								<DropdownMenu.Item
									className="flex cursor-pointer select-none items-center rounded-sm px-12 py-8 body-2 text-base outline-none hover:bg-muted-transparent focus:bg-muted-transparent"
									onSelect={disconnect}
								>
									Disconnect
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Portal>
					</DropdownMenu.Root>
				) : (
				<Button
					appearance="transparent"
					size="md"
					onClick={connect}
					disabled={isConnecting}
				>
					{isConnecting ? "Connecting..." : "Connect"}
				</Button>
				)}
			</div>
		</header>
	);
}
