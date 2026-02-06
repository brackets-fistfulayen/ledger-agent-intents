import path from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
	plugins: [TanStackRouterVite(), react()],
	build: {
		sourcemap: command === "build" ? "hidden" : true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		proxy: process.env.BACKEND_URL
			? {
					"/api": {
						target: process.env.BACKEND_URL,
						changeOrigin: true,
					},
				}
			: undefined,
	},
}));
