import path from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// Plugin to redirect ledger-button's Shadow DOM styles to the pre-built CSS
// This is needed because the source ./styles.css contains raw Tailwind directives,
// but Shadow DOM needs the compiled CSS with lb-* prefixed classes
function ledgerButtonStylesPlugin(): Plugin {
	const ledgerButtonSrcDir = path.resolve(
		__dirname,
		"../../packages/ledger-button/src",
	);
	const builtStylesPath = path.resolve(
		__dirname,
		"../../packages/ledger-button/dist/styles.css",
	);

	return {
		name: "ledger-button-styles",
		enforce: "pre",
		resolveId(source, importer) {
			// Intercept ./styles.css?inline imports from ledger-button source files
			if (
				source === "./styles.css?inline" &&
				importer &&
				importer.includes(ledgerButtonSrcDir)
			) {
				// Redirect to the pre-built CSS file
				return `${builtStylesPath}?inline`;
			}
			return null;
		},
	};
}

export default defineConfig(({ command }) => ({
	plugins: [
		// Only use the styles redirect plugin in dev mode
		command === "serve" && ledgerButtonStylesPlugin(),
		TanStackRouterVite(),
		react(),
	].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			// In dev mode, resolve workspace packages to their source for HMR
			...(command === "serve" && {
				// Map styles.css to dist (pre-built by build:styles task)
				"@ledgerhq/ledger-wallet-provider/styles.css": path.resolve(
					__dirname,
					"../../packages/ledger-button/dist/styles.css",
				),
				// Map JS to source for HMR
				"@ledgerhq/ledger-wallet-provider-core": path.resolve(
					__dirname,
					"../../packages/ledger-button-core/src/index.ts",
				),
				"@ledgerhq/ledger-wallet-provider": path.resolve(
					__dirname,
					"../../packages/ledger-button/src/index.ts",
				),
			}),
		},
	},
	server: {
		proxy: {
			"/api": {
				target: process.env.BACKEND_URL || "http://localhost:3001",
				changeOrigin: true,
			},
		},
	},
	// Optimize deps - exclude workspace packages in dev mode
	optimizeDeps: {
		exclude: command === "serve" ? [
			"@ledgerhq/ledger-wallet-provider",
			"@ledgerhq/ledger-wallet-provider-core",
		] : [],
	},
}));
