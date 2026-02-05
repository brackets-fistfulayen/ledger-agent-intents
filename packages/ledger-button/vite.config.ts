import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ command }) => ({
	assetsInclude: ["**/*.png", "**/*.svg", "**/*.jpg", "**/*.jpeg", "**/*.gif"],
	plugins: [
		// Only generate types during build, not in watch mode
		command === "build" && !process.argv.includes("--watch") &&
		dts({
			entryRoot: "src",
		}),
	].filter(Boolean),
	css: {
		postcss: "./postcss.config.js",
	},
	build: {
		outDir: "./dist",
		// Don't empty dist - styles.css is built separately by build:styles task
		emptyOutDir: false,
		reportCompressedSize: true,
		cssCodeSplit: false,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		lib: {
			entry: "src/index.ts",
			name: "@ledgerhq/ledger-wallet-provider",
			fileName: "index",
			formats: ["es"],
		},
		rollupOptions: {
			external: [],
			output: {
				assetFileNames: (assetInfo) => {
					if (assetInfo.name?.endsWith(".css")) {
						return "styles.css";
					}
					return assetInfo.name ?? "assets/[name]-[hash][extname]";
				},
			},
		},
	},
}));
