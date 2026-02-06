import type { ReactNode } from "react";
import { Header } from "./Header";
import { LeftNavbar } from "./LeftNavbar";

interface ShellProps {
	children: ReactNode;
}

export function Shell({ children }: ShellProps) {
	return (
		<div className="flex min-h-screen flex-col bg-canvas text-base">
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
	);
}
