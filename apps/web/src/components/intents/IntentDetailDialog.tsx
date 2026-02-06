import type { Intent } from "@agent-intents/shared";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
} from "@ledgerhq/lumen-ui-react";
import { IntentDetailContent } from "./IntentDetailContent";

// =============================================================================
// Types
// =============================================================================

interface IntentDetailDialogProps {
	intent: Intent | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Dialog wrapper for displaying intent details for approval.
 * Uses Lumen Dialog components with controlled open state.
 */
export function IntentDetailDialog({
	intent,
	open,
	onOpenChange,
}: IntentDetailDialogProps) {
	if (!intent) return null;

	const handleClose = () => onOpenChange(false);
	const isX402 = !!intent.details.x402?.accepted;
	const dialogTitle = isX402 ? "Authorize API Payment" : "Review Transfer";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[540px]">
				<DialogHeader
					appearance="compact"
					title={dialogTitle}
					onClose={handleClose}
				/>
				<DialogBody>
					<IntentDetailContent intent={intent} />
				</DialogBody>
				<DialogFooter>
					<IntentDetailContent.Actions intent={intent} onClose={handleClose} />
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
