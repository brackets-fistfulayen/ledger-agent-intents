import { Button, Menu, MenuContent, MenuItem, MenuTrigger } from "@ledgerhq/lumen-ui-react";
import { Check, Copy, Devices, ExitLogout } from "@ledgerhq/lumen-ui-react/symbols";
import { Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";

import { AgentIntentsLogo, ChainLogo } from "@/components/ui";
import { useLedger } from "@/lib/ledger-provider";

export function Header() {
	const { account, chainId, isConnected, isConnecting, openLedgerModal, disconnect } = useLedger();

	const [copied, setCopied] = useState(false);
	const pillRef = useRef<HTMLDivElement>(null);
	const [pillWidth, setPillWidth] = useState<number | undefined>(undefined);

	const handleCopy = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (!account) return;
			navigator.clipboard.writeText(account);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		},
		[account],
	);

	const handleMenuOpen = useCallback((open: boolean) => {
		if (open && pillRef.current) {
			setPillWidth(pillRef.current.offsetWidth);
		}
	}, []);

	return (
		<header className="flex h-80 items-center justify-between px-40">
			{/* Left: Logo + brand */}
			<Link to="/" className="flex items-center gap-10 hover:opacity-80 transition-opacity">
				<AgentIntentsLogo size={28} className="text-base" />
				<span className="body-1-semi-bold text-base">Agent Intents</span>
			</Link>

			{/* Right: Actions */}
			<div className="flex items-center gap-16">
				<Link to="/docs" className="body-2-semi-bold text-muted hover:text-base transition-colors">
					API Docs
				</Link>
				{isConnected ? (
					<Menu onOpenChange={handleMenuOpen}>
						<MenuTrigger asChild>
							<div
								ref={pillRef}
								className="flex items-center rounded-full bg-muted overflow-hidden cursor-pointer"
							>
								{/* Address section */}
								<div className="flex items-center gap-8 py-8 pl-12 pr-4 hover:bg-muted-hover transition-colors body-2-semi-bold text-base">
									<ChainLogo chainId={chainId} size={20} />
									<span>
										{account?.slice(0, 6)}...{account?.slice(-4)}
									</span>
								</div>

								{/* Copy button (separated by a subtle divider) */}
								<div className="w-1 h-20 bg-muted-strong" />
							<button
								type="button"
								onClick={handleCopy}
								onPointerDown={(e) => e.stopPropagation()}
								className="flex items-center justify-center size-36 hover:bg-muted-hover transition-colors"
								aria-label="Copy address"
							>
									{copied ? (
										<Check size={16} className="text-success" />
									) : (
										<Copy size={16} className="text-muted" />
									)}
								</button>
							</div>
						</MenuTrigger>
						<MenuContent
							align="end"
							sideOffset={4}
							className="!outline-none"
							style={pillWidth ? { minWidth: pillWidth } : undefined}
						>
							<MenuItem onSelect={() => disconnect()} className="!outline-none !ring-0 !border-0">
								<ExitLogout size={16} />
								<span>Disconnect</span>
							</MenuItem>
						</MenuContent>
					</Menu>
				) : (
					<Button
						appearance="gray"
						size="md"
						icon={Devices}
						onClick={openLedgerModal}
						disabled={isConnecting}
						loading={isConnecting}
					>
						Connect
					</Button>
				)}
			</div>
		</header>
	);
}
