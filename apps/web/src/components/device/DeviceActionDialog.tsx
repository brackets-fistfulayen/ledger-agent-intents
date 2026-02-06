import { type DeviceActionUiState, useLedger } from "@/lib/ledger-provider";
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Spot,
} from "@ledgerhq/lumen-ui-react";
import { LedgerLogo, Usb } from "@ledgerhq/lumen-ui-react/symbols";
import * as RadixDialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Lottie from "lottie-react";
import { useMemo } from "react";
import { type AnimationKey, getDeviceAnimation } from "./animations";

// =============================================================================
// Map UI state → animation key
// =============================================================================

function getAnimationKey(status: DeviceActionUiState["status"]): AnimationKey | null {
	switch (status) {
		case "unlock-device":
			return "pin";
		case "allow-secure-connection":
		case "verify-address":
			return "continueOnLedger";
		case "sign-transaction":
		case "sign-message":
		case "sign-typed-data":
			return "signTransaction";
		default:
			return null;
	}
}

// =============================================================================
// Status configuration
// =============================================================================

type StatusConfig = {
	title: string;
	subtitle: string | null;
	/** Show the USB icon instead of a Lottie animation. */
	useUsbIcon?: boolean;
};

function getStatusConfig(status: DeviceActionUiState["status"]): StatusConfig {
	switch (status) {
		case "unlock-device":
			return {
				title: "Unlock your Ledger",
				subtitle: "Enter your PIN code on your device.",
			};
		case "allow-secure-connection":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "open-app":
		case "confirm-open-app":
			return {
				title: "Open Ethereum app",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
				useUsbIcon: true,
			};
		case "installing-app":
			return {
				title: "Installing Ethereum app",
				subtitle: "Please wait while the app is being installed on your device.",
				useUsbIcon: true,
			};
		case "sign-transaction":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "sign-message":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "sign-typed-data":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "verify-address":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "success":
			return { title: "Success", subtitle: null };
		case "error":
			return { title: "Error", subtitle: null };
	}
}

// =============================================================================
// Component
// =============================================================================

export function DeviceActionDialog() {
	const { deviceActionState, deviceModelId, dismissDeviceAction, retry } = useLedger();

	const animationData = useMemo(() => {
		if (!deviceActionState) return null;
		const key = getAnimationKey(deviceActionState.status);
		if (!key) return null;
		return getDeviceAnimation(deviceModelId, key);
	}, [deviceActionState, deviceModelId]);

	if (!deviceActionState) return null;

	const config = getStatusConfig(deviceActionState.status);
	const isError = deviceActionState.status === "error";
	const isSuccess = deviceActionState.status === "success";
	const isOpenApp =
		deviceActionState.status === "open-app" ||
		deviceActionState.status === "confirm-open-app" ||
		deviceActionState.status === "installing-app";
	const canRetry = deviceActionState.canRetry === true;

	// -------------------------------------------------------------------------
	// "Open Ethereum app" layout — matches the Ledger reference design
	// -------------------------------------------------------------------------
	if (isOpenApp) {
		// "confirm-open-app" is an actual device interaction (user must approve
		// on-screen); all other isOpenApp statuses are preparation/loading states
		// (authenticating, preparing to sign, etc.).
		const isDeviceInteraction = deviceActionState.status === "confirm-open-app";
		const displayTitle = deviceActionState.message || config.title;

		return (
			<Dialog
				open
				onOpenChange={() => {
					/* managed programmatically */
				}}
			>
				<DialogContent aria-describedby={undefined}>
					{/* Visually-hidden Radix title — satisfies accessibility requirement */}
					<VisuallyHidden.Root asChild>
						<RadixDialog.Title>{displayTitle}</RadixDialog.Title>
					</VisuallyHidden.Root>

					{/* Minimal header with just the Ledger logo */}
					<div className="p-16">
						<LedgerLogo size={24} className="text-base" />
					</div>
					<DialogBody>
						<div className="flex flex-col items-center gap-16 py-24">
							{isDeviceInteraction ? (
								<Spot appearance="icon" icon={Usb} size={56} />
							) : (
								<Spot appearance="loader" size={56} />
							)}
							<p className="heading-4 text-center text-base">{displayTitle}</p>
							{isDeviceInteraction && config.subtitle && (
								<p className="body-2 text-muted text-center">{config.subtitle}</p>
							)}
						</div>
					</DialogBody>
				</DialogContent>
			</Dialog>
		);
	}

	// -------------------------------------------------------------------------
	// Standard device-action layout (Lottie + title + subtitle)
	// -------------------------------------------------------------------------
	return (
		<Dialog
			open={!!deviceActionState}
			onOpenChange={() => {
				/* managed programmatically */
			}}
		>
			<DialogContent aria-describedby={undefined}>
				{/* Visually-hidden Radix title — satisfies accessibility requirement */}
				<VisuallyHidden.Root asChild>
					<RadixDialog.Title>{config.title}</RadixDialog.Title>
				</VisuallyHidden.Root>

				<DialogHeader appearance="compact" title={config.title} onClose={dismissDeviceAction} />
				<DialogBody>
					<div className="flex flex-col items-center gap-16 py-24">
						{/* Lottie animation or fallback icon.
					   The Lottie files are dark-theme assets (white/light outlines
					   on transparent bg). In dark mode they render naturally on the
					   dark dialog surface. In light mode we apply CSS invert() so
					   the outlines become dark on the light dialog background. */}
						{animationData ? (
							<div className="w-[200px] h-[200px] flex items-center justify-center dark:invert-0 invert">
								<Lottie
									animationData={animationData}
									loop
									autoplay
									style={{ width: "100%", height: "100%" }}
								/>
							</div>
						) : isSuccess ? (
							<Spot appearance="check" size={56} />
						) : isError ? (
							<Spot appearance="error" size={56} />
						) : (
							<Spot appearance="loader" size={56} />
						)}

						{/* Title below animation for device-interaction states */}
						{config.subtitle && <p className="heading-5 text-center text-base">{config.title}</p>}

						{/* Subtitle / instructions */}
						{config.subtitle ? (
							<p className="body-2 text-muted text-center">{config.subtitle}</p>
						) : (
							<p className={`body-1 text-center ${isError ? "text-error" : "text-base"}`}>
								{deviceActionState.message}
							</p>
						)}
					</div>
				</DialogBody>

				{/* Footer: retry for recoverable states, close for errors */}
				{(isError || canRetry) && (
					<DialogFooter>
						<div className="flex items-center gap-8">
							<Button appearance="transparent" size="md" onClick={dismissDeviceAction}>
								Close
							</Button>
							{canRetry && (
								<Button
									appearance="accent"
									size="md"
									onClick={() => {
										retry();
									}}
								>
									Retry
								</Button>
							)}
						</div>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
