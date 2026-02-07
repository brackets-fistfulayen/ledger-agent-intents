import type { ReactNode } from "react";
import { AgentIntentsLogo } from "@/components/ui";
import { Header } from "./Header";
import { LeftNavbar } from "./LeftNavbar";

interface ShellProps {
	children: ReactNode;
}

function MobileGate() {
	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-canvas p-32 lg:hidden">
			<div className="flex flex-col items-center text-center max-w-[400px] gap-24">
				<AgentIntentsLogo size={48} className="text-base" />
				<h1 className="heading-3-semi-bold text-base">Desktop Only</h1>
				<p className="body-1 text-muted">
					Agent Payments with Ledger requires a desktop browser with WebUSB and WebBluetooth support
					to connect your Ledger device.
				</p>
				<div className="flex flex-col gap-12 w-full rounded-lg bg-muted-transparent p-24">
					<div className="flex items-center gap-12">
						<ChromeIcon />
						<div className="text-left">
							<p className="body-2-semi-bold text-base">Google Chrome</p>
							<p className="body-3 text-muted">Recommended</p>
						</div>
					</div>
					<div className="w-full h-1 bg-muted" />
					<div className="flex items-center gap-12">
						<BraveIcon />
						<div className="text-left">
							<p className="body-2-semi-bold text-base">Brave</p>
							<p className="body-3 text-muted">Also supported</p>
						</div>
					</div>
				</div>
				<p className="body-3 text-muted-subtle">
					Open <span className="body-3-semi-bold text-accent">agentintents.io</span> on your desktop
					computer to get started.
				</p>
			</div>
		</div>
	);
}

function ChromeIcon() {
	return (
		<svg
			width="28"
			height="28"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" opacity="0.3" />
			<circle cx="24" cy="24" r="9" stroke="currentColor" strokeWidth="2" />
			<path d="M24 15L38 15" stroke="currentColor" strokeWidth="2" opacity="0.5" />
			<path d="M17 28L10 15" stroke="currentColor" strokeWidth="2" opacity="0.5" />
			<path d="M31 28L38 41" stroke="currentColor" strokeWidth="2" opacity="0.5" />
		</svg>
	);
}

function BraveIcon() {
	return (
		<svg
			width="28"
			height="28"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M24 4L12 10V26C12 34 24 44 24 44C24 44 36 34 36 26V10L24 4Z"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinejoin="round"
			/>
			<path
				d="M24 14L18 18V28L24 34L30 28V18L24 14Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
				opacity="0.5"
			/>
		</svg>
	);
}

export function Shell({ children }: ShellProps) {
	return (
		<>
			{/* Mobile gate — visible below lg breakpoint */}
			<MobileGate />

			{/* Desktop app — hidden below lg breakpoint */}
			<div className="hidden lg:flex min-h-screen flex-col bg-canvas text-base">
				{/* Hackathon disclaimer banner */}
				<div className="w-full bg-black text-white dark:bg-white dark:text-black px-16 py-8 text-center body-3">
					This is a Hackathon project vibe coded — this is not a production-ready project.
				</div>

				{/* Header */}
				<Header />

				{/* Left Navbar - Fixed position on left side, below header + banner */}
				<aside className="fixed left-24 top-[112px] bottom-24 z-50 flex items-center">
					<LeftNavbar />
				</aside>

				{/* Main content - offset for left navbar, centered */}
				<main className="ml-[100px] flex-1 py-48 px-32">
					<div className="mx-auto max-w-[1400px]">{children}</div>
				</main>
			</div>
		</>
	);
}
