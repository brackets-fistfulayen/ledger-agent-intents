import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

// =============================================================================
// Spinner Variants
// =============================================================================

const spinnerVariants = cva("animate-spin text-current", {
	variants: {
		size: {
			sm: "size-16",
			md: "size-24",
			lg: "size-32",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

// =============================================================================
// Types
// =============================================================================

interface SpinnerProps
	extends React.SVGAttributes<SVGSVGElement>,
		VariantProps<typeof spinnerVariants> {}

// =============================================================================
// Component
// =============================================================================

export function Spinner({ className, size, ...props }: SpinnerProps) {
	return (
		<svg
			className={cn(spinnerVariants({ size }), className)}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			role="img"
			aria-label="Loading"
			{...props}
		>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}
