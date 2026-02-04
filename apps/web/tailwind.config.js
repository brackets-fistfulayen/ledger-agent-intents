import { ledgerLivePreset } from "@ledgerhq/lumen-design-core";

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./src/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@ledgerhq/lumen-ui-react/dist/lib/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: "class",
	presets: [ledgerLivePreset],
	theme: {
		extend: {},
	},
	plugins: [],
};
