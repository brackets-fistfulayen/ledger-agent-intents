import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ command }) => ({
	plugins: [
		// Only generate types during build, not in watch mode
		command === "build" && !process.argv.includes("--watch") &&
		dts({
			entryRoot: "src",
		}),
	].filter(Boolean),
	build: {
		outDir: "./dist",
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		lib: {
			entry: "src/index.ts",
			name: "@ledgerhq/ledger-wallet-provider-core",
			fileName: "index",
			formats: ["es"],
		},
		rollupOptions: {
			external: [],
		},
	},
}));
