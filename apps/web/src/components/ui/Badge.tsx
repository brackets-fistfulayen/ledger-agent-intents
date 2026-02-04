import { cn } from "@/lib/utils";
import type { IntentStatus } from "@agent-intents/shared";
import { type VariantProps, cva } from "class-variance-authority";

// =============================================================================
// Badge Variants (following Lumen Tag patterns)
// =============================================================================

const badgeVariants = cva(
	"inline-flex items-center rounded-xs px-8 py-4 body-3 transition-colors",
	{
		variants: {
			variant: {
				default: "bg-muted-transparent text-base",
				pending: "bg-warning text-warning",
				approved: "bg-interactive text-interactive",
				signed: "bg-interactive text-interactive",
				confirmed: "bg-success text-success",
				rejected: "bg-error text-error",
				failed: "bg-error text-error",
				expired: "bg-muted-transparent text-muted",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

// =============================================================================
// Types
// =============================================================================

interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {
	children: React.ReactNode;
}

// =============================================================================
// Component
// =============================================================================

export function Badge({ className, variant, children, ...props }: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ variant }), className)} {...props}>
			{children}
		</span>
	);
}

// =============================================================================
// Status Badge (convenience component for Intent status)
// =============================================================================
// Uses light transparent backgrounds with darker text of the same color family.
// Background uses the "strong" color at low opacity for visibility.
// Text uses the standard semantic color which is darker/more saturated.

const statusBadgeVariants = cva(
	"inline-flex items-center justify-center gap-4 rounded-xs px-8 py-4 body-3",
	{
		variants: {
			status: {
				pending: "bg-warning-strong/25 text-warning",
				approved: "bg-accent/25 text-interactive",
				signed: "bg-accent/25 text-interactive",
				confirmed: "bg-success-strong/25 text-success",
				rejected: "bg-error-strong/25 text-error",
				failed: "bg-error-strong/25 text-error",
				expired: "bg-muted-transparent text-muted",
			},
		},
		defaultVariants: {
			status: "pending",
		},
	},
);

const STATUS_LABELS: Record<IntentStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	signed: "Signed",
	confirmed: "Confirmed",
	rejected: "Rejected",
	failed: "Failed",
	expired: "Expired",
};

interface StatusBadgeProps {
	status: IntentStatus;
	className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
	return (
		<span className={cn(statusBadgeVariants({ status }), className)}>
			{STATUS_LABELS[status]}
		</span>
	);
}
