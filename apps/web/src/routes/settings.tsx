import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ledgerhq/lumen-ui-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
	if (typeof window !== "undefined") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}
	return "dark";
}

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	const effectiveTheme = theme === "system" ? getSystemTheme() : theme;

	if (effectiveTheme === "dark") {
		root.classList.add("dark");
		root.style.colorScheme = "dark";
	} else {
		root.classList.remove("dark");
		root.style.colorScheme = "light";
	}
}

function SettingsPage() {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window !== "undefined") {
			return (localStorage.getItem("theme") as Theme) || "dark";
		}
		return "dark";
	});

	useEffect(() => {
		applyTheme(theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	// Listen for system theme changes when in system mode
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => applyTheme("system");

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	return (
		<div className="flex flex-col gap-32">
			{/* Page header */}
			<div className="flex flex-col gap-8 text-center">
				<h1 className="heading-0-semi-bold text-base">Settings</h1>
				<p className="body-1 text-muted">Configure your preferences</p>
			</div>

			{/* Theme selector */}
			<div className="flex flex-col gap-16">
				<div className="rounded-lg bg-surface p-24">
					<div className="flex flex-col gap-16">
						<div className="flex flex-col gap-4">
							<h2 className="heading-5-semi-bold text-base">Appearance</h2>
							<p className="body-2 text-muted">
								Choose how the app looks
							</p>
						</div>

						<div className="flex gap-12">
							<Button
								appearance={theme === "light" ? "base" : "gray"}
								size="md"
								onClick={() => setTheme("light")}
							>
								Light
							</Button>
							<Button
								appearance={theme === "dark" ? "base" : "gray"}
								size="md"
								onClick={() => setTheme("dark")}
							>
								Dark
							</Button>
							<Button
								appearance={theme === "system" ? "base" : "gray"}
								size="md"
								onClick={() => setTheme("system")}
							>
								System
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
