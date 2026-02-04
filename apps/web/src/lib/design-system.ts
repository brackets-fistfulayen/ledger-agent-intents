/**
 * Lumen Design System Reference
 *
 * This file documents the design tokens and patterns from @ledgerhq/lumen-design-core.
 * Use these tokens instead of arbitrary Tailwind values for consistency.
 *
 * Full documentation: https://lumen-ldls.vercel.app
 */

// =============================================================================
// TYPOGRAPHY
// =============================================================================
// Do NOT use Tailwind typography utilities (font-bold, text-sm, etc.)
// Use these typography classes instead:

export const typography = {
	// Responsive displays (largest)
	display: {
		1: "responsive-display-1", // 112px, bold
		2: "responsive-display-2", // 80px, semi-bold
		3: "responsive-display-3", // 64px, semi-bold
		4: "responsive-display-4", // 52px, semi-bold
	},

	// Headings
	heading: {
		0: "heading-0", // 48px, medium
		"0-semi-bold": "heading-0-semi-bold",
		1: "heading-1", // 40px, medium
		"1-semi-bold": "heading-1-semi-bold",
		2: "heading-2", // 28px, medium
		"2-semi-bold": "heading-2-semi-bold",
		3: "heading-3", // 24px, medium
		"3-semi-bold": "heading-3-semi-bold",
		4: "heading-4", // 20px, medium
		"4-semi-bold": "heading-4-semi-bold",
		5: "heading-5", // 18px, medium
		"5-semi-bold": "heading-5-semi-bold",
	},

	// Body text
	body: {
		1: "body-1", // 16px, medium
		"1-semi-bold": "body-1-semi-bold",
		2: "body-2", // 14px, medium
		"2-semi-bold": "body-2-semi-bold",
		3: "body-3", // 12px, medium
		"3-semi-bold": "body-3-semi-bold",
		4: "body-4", // 10px, medium
		"4-semi-bold": "body-4-semi-bold",
	},
} as const;

// =============================================================================
// COLORS (Semantic Tokens)
// =============================================================================
// Do NOT use Tailwind default colors (text-gray-500, bg-blue-600, etc.)
// Use these semantic color tokens:

export const colors = {
	// Background colors (use with bg-*)
	background: {
		// Canvas (page backgrounds)
		canvas: "bg-canvas",
		canvasMuted: "bg-canvas-muted",
		canvasSheet: "bg-canvas-sheet",
		canvasOverlay: "bg-canvas-overlay",

		// Surface (card backgrounds)
		surface: "bg-surface",
		surfaceHover: "bg-surface-hover",
		surfacePressed: "bg-surface-pressed",

		// Base
		base: "bg-base",
		baseHover: "bg-base-hover",
		basePressed: "bg-base-pressed",
		baseTransparent: "bg-base-transparent",

		// Muted
		muted: "bg-muted",
		mutedHover: "bg-muted-hover",
		mutedPressed: "bg-muted-pressed",
		mutedTransparent: "bg-muted-transparent",
		mutedStrong: "bg-muted-strong",

		// Accent
		accent: "bg-accent",
		accentHover: "bg-accent-hover",
		accentPressed: "bg-accent-pressed",

		// Interactive
		interactive: "bg-interactive",
		interactiveHover: "bg-interactive-hover",
		interactivePressed: "bg-interactive-pressed",

		// Status
		error: "bg-error",
		errorStrong: "bg-error-strong",
		errorTransparent: "bg-error-transparent",
		warning: "bg-warning",
		warningStrong: "bg-warning-strong",
		success: "bg-success",
		successStrong: "bg-success-strong",
		successTransparent: "bg-success-transparent",

		// Utility
		disabled: "bg-disabled",
		white: "bg-white",
		black: "bg-black",
	},

	// Text colors (use with text-*)
	text: {
		base: "text-base",
		baseHover: "text-base-hover",
		basePressed: "text-base-pressed",
		muted: "text-muted",
		mutedHover: "text-muted-hover",
		mutedSubtle: "text-muted-subtle",
		interactive: "text-interactive",
		interactiveHover: "text-interactive-hover",
		error: "text-error",
		warning: "text-warning",
		success: "text-success",
		onAccent: "text-on-accent",
		onInteractive: "text-on-interactive",
		disabled: "text-disabled",
		white: "text-white",
		black: "text-black",
	},

	// Border colors (use with border-*)
	border: {
		base: "border-base",
		baseHover: "border-base-hover",
		muted: "border-muted",
		mutedHover: "border-muted-hover",
		mutedSubtle: "border-muted-subtle",
		focus: "border-focus",
		active: "border-active",
		error: "border-error",
		warning: "border-warning",
		success: "border-success",
		disabled: "border-disabled",
		white: "border-white",
		black: "border-black",
	},
} as const;

// =============================================================================
// SPACING (1:1 pixel mapping)
// =============================================================================
// Each number equals its pixel value: p-16 = 16px, gap-24 = 24px

export const spacing = {
	values: [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 256],
	// Use: p-{value}, px-{value}, py-{value}, m-{value}, gap-{value}, etc.
} as const;

// =============================================================================
// SIZE (1:1 pixel mapping)
// =============================================================================
// For width, height, and size utilities: w-64 = 64px, h-160 = 160px

export const size = {
	values: [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96, 112, 128, 144, 176, 192, 208, 224, 256, 288, 320, 400, 480, 560],
	// Use: w-{value}, h-{value}, size-{value}, min-w-{value}, max-h-{value}, etc.
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
	none: "rounded-none", // 0px
	xs: "rounded-xs", // 4px
	sm: "rounded-sm", // 8px
	md: "rounded-md", // 12px
	lg: "rounded-lg", // 16px
	xl: "rounded-xl", // 24px
	"2xl": "rounded-2xl", // 32px
	full: "rounded-full", // 10000px (pill shape)
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
	sm: "shadow-sm",
	md: "shadow-md",
	lg: "shadow-lg",
	xl: "shadow-xl",
	"2xl": "shadow-2xl",
	// Drop shadows
	dropSm: "drop-shadow-sm",
	dropMd: "drop-shadow-md",
	dropLg: "drop-shadow-lg",
	dropXl: "drop-shadow-xl",
	drop2xl: "drop-shadow-2xl",
} as const;

// =============================================================================
// GRADIENTS
// =============================================================================

export const gradients = {
	top: "bg-gradient-top",
	bottom: "bg-gradient-bottom",
	error: "bg-gradient-error",
	success: "bg-gradient-success",
	muted: "bg-gradient-muted",
	// Crypto gradients: bg-gradient-bitcoin, bg-gradient-ethereum, etc.
} as const;

// =============================================================================
// ICON SIZES
// =============================================================================

export const iconSizes = {
	12: "size-12",
	16: "size-16",
	20: "size-20",
	24: "size-24",
	32: "size-32",
	40: "size-40",
	48: "size-48",
	56: "size-56",
} as const;

// =============================================================================
// COMPONENT PATTERNS
// =============================================================================

/**
 * Standard component styling patterns to use across the app.
 * These combine multiple design tokens for common use cases.
 */
export const patterns = {
	// Card pattern
	card: "bg-surface border border-muted rounded-lg p-16",
	cardHover: "bg-surface hover:bg-surface-hover border border-muted rounded-lg p-16 transition-colors",

	// Interactive button base
	buttonBase: "inline-flex items-center justify-center rounded-lg transition-all duration-200",

	// Input field
	input: "bg-base border border-muted rounded-md px-12 py-8 body-2 text-base placeholder:text-muted-subtle focus:border-focus focus:outline-none",

	// List item
	listItem: "flex items-center gap-12 p-12 rounded-md hover:bg-muted-transparent transition-colors",

	// Nav item
	navItem: "flex items-center justify-center size-36 rounded-full transition-all duration-200",
	navItemActive: "bg-base-transparent text-base",
	navItemInactive: "bg-transparent text-muted hover:bg-muted-transparent hover:text-base",
} as const;
