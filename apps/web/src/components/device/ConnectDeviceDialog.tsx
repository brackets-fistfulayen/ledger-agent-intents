import { useLedger } from "@/lib/ledger-provider";
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	Spinner,
	Spot,
} from "@ledgerhq/lumen-ui-react";
import {
	CheckmarkCircle,
	ChevronRight,
	Close,
	LedgerLogo,
	Usb,
} from "@ledgerhq/lumen-ui-react/symbols";
import * as RadixDialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

// =============================================================================
// Sub-views
// =============================================================================

/** Custom header with Ledger icon + close button */
function CustomHeader({ title, onClose }: { title: string; onClose: () => void }) {
	return (
		<div className="flex items-center justify-between p-16">
			<div className="flex items-center gap-12">
				<LedgerLogo size={24} className="text-base" />
				<span className="heading-5 text-base">{title}</span>
			</div>
			<button
				type="button"
				onClick={onClose}
				className="flex size-32 items-center justify-center rounded-full hover:bg-muted-transparent transition-colors"
				aria-label="Close"
			>
				<Close size={20} className="text-muted" />
			</button>
		</div>
	);
}

/** "Select transport" view — USB / Bluetooth cards */
function TransportSelector({
	onSelectUsb,
	onSelectBle,
}: { onSelectUsb: () => void; onSelectBle: () => void }) {
	return (
		<div className="flex flex-col gap-12">
			<button
				type="button"
				onClick={onSelectUsb}
				className="flex items-center gap-16 rounded-lg bg-muted hover:bg-muted-hover p-16 transition-colors"
			>
				<Spot appearance="icon" icon={Usb} size={40} />
				<div className="flex flex-col items-start gap-2 flex-1">
					<span className="body-1-semi-bold text-base">Connect with USB</span>
					<span className="body-2 text-muted">Plug in and unlock your device</span>
				</div>
				<ChevronRight size={20} className="text-muted" />
			</button>

			<button
				type="button"
				onClick={onSelectBle}
				className="flex items-center gap-16 rounded-lg bg-muted hover:bg-muted-hover p-16 transition-colors"
			>
				<Spot appearance="bluetooth" size={40} />
				<div className="flex flex-col items-start gap-2 flex-1">
					<span className="body-1-semi-bold text-base">Connect with bluetooth</span>
					<span className="body-2 text-muted">Power on and unlock your device</span>
				</div>
				<ChevronRight size={20} className="text-muted" />
			</button>
		</div>
	);
}

/** "Waiting for device" view shown while the browser device picker is open */
function WaitingForDevice({ isUsb }: { isUsb: boolean }) {
	return (
		<div className="flex flex-col items-center gap-16 py-32">
			{isUsb ? (
				<Spot appearance="icon" icon={Usb} size={56} />
			) : (
				<Spot appearance="bluetooth" size={56} />
			)}
			<p className="heading-4 text-center text-base">Connect your Ledger signer</p>
			<p className="body-2 text-muted text-center">
				{isUsb
					? "Make sure you connect\nyour Ledger signer via USB."
					: "Make sure your Ledger signer\nhas Bluetooth enabled."}
			</p>
		</div>
	);
}

/** "Deriving addresses" view shown while addresses are being derived from the device */
function DerivingAddresses() {
	return (
		<div className="flex flex-col items-center gap-16 py-32">
			<Spinner size={40} />
			<p className="heading-4 text-center text-base">Deriving addresses</p>
			<p className="body-2 text-muted text-center">
				Please wait while addresses are being derived from your device.
			</p>
		</div>
	);
}

/** "Connected" view */
function ConnectedView({
	account,
	onDisconnect,
}: { account: string | null; onDisconnect: () => void }) {
	return (
		<div className="flex flex-col gap-16 py-16">
			<div className="flex items-center gap-12 rounded-md bg-muted p-16">
				<div className="flex size-40 items-center justify-center rounded-full bg-success-transparent">
					<CheckmarkCircle size={24} className="text-success" />
				</div>
				<div className="flex flex-col gap-2">
					<span className="body-2-semi-bold text-base">Ledger Connected</span>
					<span className="body-3 text-muted font-mono">
						{account?.slice(0, 6)}...{account?.slice(-4)}
					</span>
				</div>
			</div>

			<Button appearance="transparent" size="md" onClick={onDisconnect}>
				Disconnect
			</Button>
		</div>
	);
}

// =============================================================================
// Main component
// =============================================================================

export function ConnectDeviceDialog() {
	const {
		showConnectDialog,
		setShowConnectDialog,
		connect,
		disconnect,
		isConnecting,
		account,
		dismissDeviceAction,
		connectingTransport,
		isDerivingAddresses,
		deviceActionState,
		hasActiveSession,
	} = useLedger();

	const handleClose = () => {
		dismissDeviceAction();
		setShowConnectDialog(false);
	};

	// Hide the connect dialog whenever the DeviceActionDialog is showing
	// anything (interaction, error, success) — it takes priority.
	const deviceActionActive = deviceActionState != null;

	const isOpen = showConnectDialog && !deviceActionActive;

	return (
		<Dialog open={isOpen} onOpenChange={setShowConnectDialog}>
			<DialogContent aria-describedby={undefined}>
				{/* Visually-hidden Radix title — satisfies accessibility requirement */}
				<VisuallyHidden.Root asChild>
					<RadixDialog.Title>Connect a Ledger signer</RadixDialog.Title>
				</VisuallyHidden.Root>

				{hasActiveSession ? (
					<>
						<DialogHeader appearance="compact" title="Connected Device" onClose={handleClose} />
						<DialogBody>
							<ConnectedView account={account} onDisconnect={disconnect} />
						</DialogBody>
					</>
				) : isDerivingAddresses ? (
					<>
						<CustomHeader title="Connect a Ledger signer" onClose={handleClose} />
						<DialogBody>
							<DerivingAddresses />
						</DialogBody>
					</>
				) : isConnecting && connectingTransport ? (
					<>
						<CustomHeader title="Connect a Ledger signer" onClose={handleClose} />
						<DialogBody>
							<WaitingForDevice isUsb={connectingTransport === "usb"} />
						</DialogBody>
					</>
				) : (
					<>
						<CustomHeader title="Connect a Ledger signer" onClose={handleClose} />
						<DialogBody>
							<TransportSelector
								onSelectUsb={() => connect("usb")}
								onSelectBle={() => connect("ble")}
							/>
						</DialogBody>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
