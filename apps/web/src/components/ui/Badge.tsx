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

const STATUS_LABELS: Record<IntentStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
	signed: "Signed",
	confirmed: "Confirmed",
	failed: "Failed",
	expired: "Expired",
};

interface StatusBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
	status: IntentStatus;
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
	return (
		<Badge variant={status} {...props}>
			{STATUS_LABELS[status]}
		</Badge>
	);
}
