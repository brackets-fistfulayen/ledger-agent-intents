import { ContextModuleBuilder } from "@ledgerhq/context-module";
import {
	DeviceActionStatus,
	type DeviceManagementKit,
	DeviceManagementKitBuilder,
	type DeviceModelId,
	type DeviceSessionId,
	DeviceSessionStateType,
	DeviceStatus,
	type DiscoveredDevice,
	type DmkError,
	OpenAppWithDependenciesDeviceAction,
	UserInteractionRequired,
	hexaStringToBuffer,
} from "@ledgerhq/device-management-kit";
import {
	type Signature as EthSignature,
	SignerEthBuilder,
	type TypedData,
} from "@ledgerhq/device-signer-kit-ethereum";
import { webBleIdentifier, webBleTransportFactory } from "@ledgerhq/device-transport-kit-web-ble";
import { webHidIdentifier, webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { filter, timeout } from "rxjs/operators";
import {
	http,
	type Chain,
	type TransactionSerializable,
	createPublicClient,
	serializeTransaction,
} from "viem";
import { base, baseSepolia, sepolia } from "viem/chains";

// =============================================================================
// Types
// =============================================================================

export type TransportType = "usb" | "ble";

export interface DerivedAddress {
	address: string;
	derivationPath: string;
}

interface TransactionRequest {
	to: string;
	data: string;
	value?: string;
}

export type DeviceActionUiState = {
	status:
		| "unlock-device"
		| "allow-secure-connection"
		| "open-app"
		| "confirm-open-app"
		| "installing-app"
		| "sign-transaction"
		| "sign-message"
		| "sign-typed-data"
		| "verify-address"
		| "success"
		| "error";
	message: string;
	error?: Error;
	/** If true, the user can retry the failed operation. */
	canRetry?: boolean;
};

interface LedgerContextType {
	account: string | null;
	chainId: number | null;
	isConnected: boolean;
	isConnecting: boolean;
	error: Error | null;
	connect: (transport?: TransportType) => Promise<void>;
	disconnect: () => void;
	sendTransaction: (tx: TransactionRequest) => Promise<string>;
	signTypedDataV4: (typedData: unknown) => Promise<string>;
	personalSign: (message: string) => Promise<string>;
	openLedgerModal: () => void;
	deviceActionState: DeviceActionUiState | null;
	setShowConnectDialog: (show: boolean) => void;
	showConnectDialog: boolean;
	/** The model of the connected device, if known. */
	deviceModelId: DeviceModelId | null;
	/** Dismiss the current device action state (e.g. close an error dialog). */
	dismissDeviceAction: () => void;
	/** The transport currently being used to connect, if any. */
	connectingTransport: TransportType | null;
	/** Derived addresses available for selection after connecting. */
	derivedAddresses: DerivedAddress[];
	/** Whether the address picker dialog is open. */
	showAddressPicker: boolean;
	/** Select a derived address and finish connection. */
	selectAddress: (address: DerivedAddress) => void;
	/** Derive a custom address from a manual derivation path. */
	deriveCustomAddress: (path: string) => Promise<void>;
	/** Whether addresses are currently being derived. */
	isDerivingAddresses: boolean;
	/** Retry the last failed operation (signing, opening app, etc.). */
	retry: () => Promise<void>;
	/** Whether there is an active DMK session (device physically connected). */
	hasActiveSession: boolean;
}

const LedgerContext = createContext<LedgerContextType | null>(null);

// =============================================================================
// DMK Singleton (persists across HMR)
// =============================================================================

let dmkInstance: DeviceManagementKit | null = null;

/**
 * DMK clear-signing API calls are proxied through /api/ledger-proxy/
 * so the Ledger API key stays server-side. The originToken sent by the
 * browser SDK is empty; the proxy injects the real key.
 */
const LEDGER_API_KEY = "";

// =============================================================================
// Global HTTP interceptor: rewrite Ledger API URLs through our backend proxy
// =============================================================================
// The DMK uses its own bundled axios (isolated by pnpm), so a regular axios
// interceptor from our app won't catch its requests. We intercept at the
// browser's XMLHttpRequest level instead, which catches ALL XHR calls.

const LEDGER_API_REWRITES: Array<{ pattern: RegExp; prefix: string }> = [
	{
		pattern: /^https:\/\/crypto-assets-service\.api\.ledger\.com\/v1(\/.*)?/,
		prefix: "/api/ledger-proxy/cal",
	},
	{
		pattern: /^https:\/\/web3checks-backend\.api\.ledger\.com\/v3(\/.*)?/,
		prefix: "/api/ledger-proxy/web3checks",
	},
	{
		pattern: /^https:\/\/nft\.api\.live\.ledger\.com(\/.*)?/,
		prefix: "/api/ledger-proxy/metadata",
	},
];

/**
 * Rewrite a URL if it matches a known Ledger API domain.
 * Returns the rewritten URL or the original if no match.
 */
function rewriteLedgerUrl(url: string): string {
	for (const { pattern, prefix } of LEDGER_API_REWRITES) {
		const match = url.match(pattern);
		if (match) {
			// match[1] contains everything after the base (path + query string)
			// e.g. "/tokens?contract_address=0x..." or undefined
			const rest = match[1] ?? "";
			return `${window.location.origin}${prefix}${rest}`;
		}
	}
	return url;
}

// Patch XMLHttpRequest.prototype.open (axios default browser adapter)
{
	const OriginalOpen = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function patchedOpen(
		method: string,
		url: string | URL,
		...rest: unknown[]
	) {
		const urlStr = typeof url === "string" ? url : url.toString();
		const rewritten = rewriteLedgerUrl(urlStr);
		if (rewritten !== urlStr) {
			console.info("[LedgerProxy] XHR rewrite:", urlStr, "→", rewritten);
		}
		// biome-ignore lint/suspicious/noExplicitAny: patching native API
		return (OriginalOpen as any).call(this, method, rewritten, ...rest);
	};
}

// Also patch fetch (in case some code paths use it)
{
	const OriginalFetch = window.fetch;
	window.fetch = function patchedFetch(
		input: RequestInfo | URL,
		init?: RequestInit,
	): Promise<Response> {
		if (typeof input === "string") {
			const rewritten = rewriteLedgerUrl(input);
			if (rewritten !== input) {
				console.info("[LedgerProxy] fetch rewrite:", input, "→", rewritten);
			}
			return OriginalFetch.call(this, rewritten, init);
		}
		if (input instanceof URL) {
			const rewritten = rewriteLedgerUrl(input.toString());
			if (rewritten !== input.toString()) {
				console.info("[LedgerProxy] fetch rewrite:", input.toString(), "→", rewritten);
			}
			return OriginalFetch.call(this, rewritten, init);
		}
		if (input instanceof Request) {
			const rewritten = rewriteLedgerUrl(input.url);
			if (rewritten !== input.url) {
				console.info("[LedgerProxy] fetch rewrite:", input.url, "→", rewritten);
				const newReq = new Request(rewritten, input);
				return OriginalFetch.call(this, newReq, init);
			}
		}
		return OriginalFetch.call(this, input, init);
	};
}

function getDmk(): DeviceManagementKit {
	if (!dmkInstance) {
		const builder = new DeviceManagementKitBuilder();
		builder.addTransport(webHidTransportFactory).addTransport(webBleTransportFactory);
		dmkInstance = builder.build();
	}
	return dmkInstance;
}

// =============================================================================
// Chain configuration
// =============================================================================

const CHAIN_MAP: Record<number, Chain> = {
	8453: base,
	84532: baseSepolia,
	11155111: sepolia,
};

// Default chain: Base mainnet
const DEFAULT_CHAIN_ID = 8453;

function getChain(chainId: number): Chain {
	return CHAIN_MAP[chainId] ?? base;
}

function getRpcUrl(chainId: number): string {
	if (chainId === 8453) {
		const customRpc = import.meta.env.VITE_BASE_MAINNET_RPC_URL;
		if (typeof customRpc === "string" && customRpc.trim().length > 0) {
			return customRpc.trim();
		}
	}
	const chain = getChain(chainId);
	return chain.rpcUrls.default.http[0] ?? "https://mainnet.base.org";
}

// Default derivation path (Ledger Live)
const DEFAULT_DERIVATION_PATH = "44'/60'/0'/0/0";

// localStorage keys for persisting the selected address across refreshes
const LS_ACCOUNT_KEY = "ledger:account";
const LS_DERIVATION_PATH_KEY = "ledger:derivationPath";

/**
 * Derivation paths to present in the address picker.
 * Mix of Ledger Live paths (44'/60'/N'/0/0) and BIP44 paths (44'/60'/0'/0/N).
 */
const DERIVATION_PATHS = ["44'/60'/0'/0/0", "44'/60'/1'/0/0", "44'/60'/0'/0/1", "44'/60'/2'/0/0"];

// =============================================================================
// Helper: convert Signature to hex
// =============================================================================

function signatureToHex(sig: EthSignature): string {
	const r = sig.r.startsWith("0x") ? sig.r.slice(2) : sig.r;
	const s = sig.s.startsWith("0x") ? sig.s.slice(2) : sig.s;
	const v = sig.v.toString(16).padStart(2, "0");
	return `0x${r}${s}${v}`;
}

// =============================================================================
// Helper: DmkError handling
// =============================================================================

function isDmkError(error: unknown): error is DmkError {
	return typeof error === "object" && error !== null && "_tag" in error;
}

/**
 * Recursively collect all `_tag` values and APDU error codes from a DMK
 * error and its nested causes / original errors.
 */
function collectErrorTags(error: unknown): { tags: string[]; codes: string[] } {
	const tags: string[] = [];
	const codes: string[] = [];
	const visited = new Set<unknown>();

	function walk(e: unknown) {
		if (!e || typeof e !== "object" || visited.has(e)) return;
		visited.add(e);

		if ("_tag" in e && typeof (e as { _tag: unknown })._tag === "string") {
			tags.push((e as { _tag: string })._tag);
		}
		if ("errorCode" in e) {
			codes.push(String((e as { errorCode: unknown }).errorCode));
		}
		// Walk into nested error wrappers — DMK uses various field names
		for (const key of ["cause", "originalError", "error", "err"]) {
			if (key in e) {
				walk((e as Record<string, unknown>)[key]);
			}
		}
	}

	walk(error);

	// Also check the string representation for locked-device patterns
	return { tags, codes };
}

/** Check if any string in a serialised error indicates a locked device. */
function looksLikeLocked(error: unknown): boolean {
	try {
		// Stringify the full object so we catch deeply-nested fields
		const str = typeof error === "string" ? error : JSON.stringify(error);
		if (/locked|5515|6faa/i.test(str ?? "")) return true;

		// Also check the message separately (Error instances may have
		// non-enumerable properties that JSON.stringify misses)
		if (error instanceof Error && /locked|5515|6faa/i.test(error.message)) return true;

		return false;
	} catch {
		return false;
	}
}

/** Check if an error indicates the Ethereum app is not open on the device. */
function isAppNotOpenError(error: unknown): boolean {
	const { tags, codes } = collectErrorTags(error);
	if (codes.includes("6d00")) return true;
	if (tags.includes("OpenAppDeviceActionError")) return true;
	// Also check serialised error for common patterns
	try {
		const str = typeof error === "string" ? error : JSON.stringify(error);
		if (/6d00|app.*not.*open|wrong.*app/i.test(str ?? "")) return true;
		if (error instanceof Error && /6d00|app.*not.*open|wrong.*app/i.test(error.message))
			return true;
	} catch {
		// ignore
	}
	return false;
}

/**
 * Classify a DMK error into a device-action UI state if it maps to a
 * recoverable device interaction (locked, refused, etc.), or return null
 * if it's a generic/fatal error.
 *
 * This performs a deep inspection: DMK often wraps the real error inside
 * `UnknownDAError` → `originalError` → `DeviceLockedError`.
 */
function classifyRecoverableError(
	error: unknown,
): Pick<DeviceActionUiState, "status" | "message" | "canRetry"> | null {
	// Log the full error structure for debugging
	console.debug("[DMK error]", error);

	const { tags, codes } = collectErrorTags(error);

	// --- Locked device (anywhere in the error chain) ---
	if (tags.includes("DeviceLockedError") || codes.includes("5515") || codes.includes("6faa")) {
		return {
			status: "unlock-device",
			message: "Please unlock your Ledger device",
		};
	}

	// --- User refused (retryable) ---
	if (tags.includes("RefusedByUserDAError") || codes.includes("6985") || codes.includes("5501")) {
		return {
			status: "error",
			message: "Action was rejected on the device.",
			canRetry: true,
		};
	}

	// --- Device not onboarded ---
	if (tags.includes("DeviceNotOnboardedError")) {
		return {
			status: "error",
			message: "Please set up your Ledger device first.",
		};
	}

	// --- Need to open app ---
	if (codes.includes("6d00")) {
		return {
			status: "open-app",
			message: "Please open the Ethereum app on your device.",
		};
	}

	// --- Fallback: check serialised error string for locked keywords ---
	if (looksLikeLocked(error)) {
		return {
			status: "unlock-device",
			message: "Please unlock your Ledger device",
		};
	}

	return null;
}

function humanizeError(error: unknown): string {
	// Deep-inspect first — the real error may be nested
	const { tags, codes } = collectErrorTags(error);

	// --- Map well-known tags (checked in priority order) ---
	if (tags.includes("DeviceLockedError") || codes.includes("5515") || codes.includes("6faa")) {
		return "Your Ledger device is locked. Please unlock it.";
	}
	if (tags.includes("RefusedByUserDAError") || codes.includes("6985") || codes.includes("5501")) {
		return "Action was rejected on the device.";
	}
	if (tags.includes("DeviceNotOnboardedError")) {
		return "Please set up your Ledger device first.";
	}
	if (tags.includes("OpeningConnectionError") || tags.includes("OpenAppDeviceActionError")) {
		return "Could not connect to the device. Make sure it's connected and unlocked.";
	}
	if (
		tags.includes("DeviceDisconnectedWhileSendingError") ||
		tags.includes("DeviceDisconnectedBeforeSendingApdu")
	) {
		return "Device was disconnected during the operation.";
	}
	if (tags.includes("TransportNotSupportedError")) {
		return "This browser does not support the selected transport. Please try Chrome or Edge.";
	}
	if (tags.includes("NoAccessibleDeviceError")) {
		return "No Ledger device found. Make sure it's connected and unlocked.";
	}
	if (tags.includes("DeviceAlreadyConnectedError")) {
		return "This device is already connected.";
	}
	if (
		tags.includes("DeviceBusyError") ||
		tags.includes("SendApduConcurrencyError") ||
		tags.includes("AlreadySendingApduError")
	) {
		return "Device is busy. Please wait and try again.";
	}
	if (tags.includes("UnsupportedFirmwareDAError")) {
		return "Your device firmware is not supported. Please update your Ledger.";
	}
	if (tags.includes("UnsupportedApplicationDAError")) {
		return "The Ethereum app on your device is not supported. Please update it via Ledger Live.";
	}
	if (tags.includes("OutOfMemoryDAError")) {
		return "Not enough storage on your device. Please free up space via Ledger Live.";
	}
	if (tags.includes("UnsupportedFirmwareDAError")) {
		return "Your device firmware is out of date. Please update via Ledger Live.";
	}

	// --- APDU error codes ---
	if (codes.includes("6a80")) {
		return "Blind signing is disabled. Enable it in the Ethereum app settings on your device.";
	}
	if (codes.includes("6d00")) {
		return "The Ethereum app is not open on your device. Please open it.";
	}

	// --- Fallback: check serialised string for locked keywords ---
	if (looksLikeLocked(error)) {
		return "Your Ledger device is locked. Please unlock it.";
	}

	// --- Generic fallback ---
	if (isDmkError(error)) {
		if (tags.includes("UnknownDAError") || tags.includes("UnknownDeviceExchangeError")) {
			return "An unexpected error occurred. Please reconnect your device and try again.";
		}
		return error.message ?? `Device error: ${error._tag}`;
	}

	if (error instanceof Error) return error.message;
	return String(error);
}

// =============================================================================
// Helper: build an Ethereum signer with context module
// =============================================================================

function buildEthSigner(dmk: DeviceManagementKit, sessionId: DeviceSessionId) {
	// The global HTTP interceptor (see above) rewrites all Ledger API
	// domain requests to go through /api/ledger-proxy/*, so the context
	// module can use the default URLs. The proxy injects the API key.
	const contextModule = new ContextModuleBuilder({
		originToken: LEDGER_API_KEY,
		loggerFactory: dmk.getLoggerFactory(),
	})
		.setDatasourceConfig({ proxy: "safe" })
		.build();

	return new SignerEthBuilder({
		dmk,
		sessionId,
		originToken: LEDGER_API_KEY,
	})
		.withContextModule(contextModule)
		.build();
}

// =============================================================================
// Provider Component
// =============================================================================

export function LedgerProvider({ children }: { children: ReactNode }) {
	const [account, setAccountRaw] = useState<string | null>(
		() => localStorage.getItem(LS_ACCOUNT_KEY) ?? null,
	);
	const [chainId, setChainId] = useState<number | null>(DEFAULT_CHAIN_ID);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [deviceActionState, setDeviceActionState] = useState<DeviceActionUiState | null>(null);
	const [showConnectDialog, setShowConnectDialog] = useState(false);
	const [deviceModelId, setDeviceModelId] = useState<DeviceModelId | null>(null);
	const [connectingTransport, setConnectingTransport] = useState<TransportType | null>(null);
	const [derivedAddresses, setDerivedAddresses] = useState<DerivedAddress[]>([]);
	const [showAddressPicker, setShowAddressPicker] = useState(false);
	const [isDerivingAddresses, setIsDerivingAddresses] = useState(false);
	const [hasActiveSession, setHasActiveSession] = useState(false);

	const sessionIdRef = useRef<DeviceSessionId | null>(null);
	const derivationPathRef = useRef<string>(
		localStorage.getItem(LS_DERIVATION_PATH_KEY) ?? DEFAULT_DERIVATION_PATH,
	);
	// Timer ref for auto-dismissing the success state in observeDeviceAction.
	// Stored so it can be cancelled if a new device action starts before it fires.
	const successDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Generic retry callback — set by each operation so that the "Retry"
	// button in DeviceActionDialog re-runs the correct action (signing,
	// opening app, etc.) instead of always going through the full connect flow.
	const retryCallbackRef = useRef<(() => Promise<void>) | null>(null);

	// Resolver for pending signing operations waiting for a session
	const pendingSessionResolverRef = useRef<{
		resolve: (value: { dmk: DeviceManagementKit; sessionId: DeviceSessionId }) => void;
		reject: (reason?: unknown) => void;
	} | null>(null);

	// Wrap setAccount to sync with localStorage
	const setAccount = useCallback((value: string | null) => {
		setAccountRaw(value);
		if (value) {
			localStorage.setItem(LS_ACCOUNT_KEY, value);
		} else {
			localStorage.removeItem(LS_ACCOUNT_KEY);
		}
	}, []);

	// Also persist derivation path when selecting an address
	const persistDerivationPath = useCallback((path: string) => {
		derivationPathRef.current = path;
		localStorage.setItem(LS_DERIVATION_PATH_KEY, path);
	}, []);
	const deviceSessionSubRef = useRef<{ unsubscribe: () => void } | null>(null);

	// -----------------------------------------------------------------------
	// Cleanup on unmount
	// -----------------------------------------------------------------------
	useEffect(() => {
		return () => {
			deviceSessionSubRef.current?.unsubscribe();
			if (pendingSessionResolverRef.current) {
				pendingSessionResolverRef.current.reject(new Error("Component unmounted"));
				pendingSessionResolverRef.current = null;
			}
		};
	}, []);

	// Reject any pending session promise when the connect dialog is
	// closed without a successful connection (user clicked X / escaped).
	useEffect(() => {
		if (!showConnectDialog && pendingSessionResolverRef.current && !sessionIdRef.current) {
			pendingSessionResolverRef.current.reject(
				new Error("Please connect your Ledger device to continue."),
			);
			pendingSessionResolverRef.current = null;
		}
	}, [showConnectDialog]);

	// -----------------------------------------------------------------------
	// Monitor device session state for disconnection
	// -----------------------------------------------------------------------
	const monitorSession = useCallback((sessionId: DeviceSessionId) => {
		const dmk = getDmk();
		deviceSessionSubRef.current?.unsubscribe();

		const subscription = dmk.getDeviceSessionState({ sessionId }).subscribe({
			next: (state) => {
				if (state.deviceStatus === DeviceStatus.NOT_CONNECTED) {
					// Device physically disconnected — clear the session
					// but keep the persisted address so the UI still shows
					// the account. The user will need to reconnect for
					// signing operations.
					setDeviceModelId(null);
					sessionIdRef.current = null;
					setHasActiveSession(false);
				}
				// NOTE: We intentionally do NOT react to DeviceStatus.LOCKED
				// here. Lock errors are surfaced naturally when the user
				// attempts an operation (sign, connect, derive). Showing
				// an unlock dialog while the user is just browsing is
				// disruptive and unnecessary.
			},
			error: () => {
				setDeviceModelId(null);
				sessionIdRef.current = null;
				setHasActiveSession(false);
			},
		});

		deviceSessionSubRef.current = subscription;
	}, []);

	// -----------------------------------------------------------------------
	// Ensure the Ethereum app is open (shared by connect + reconnect flows)
	// Returns true if the app was already open (via skipOpenApp probe).
	// -----------------------------------------------------------------------
	const ensureEthereumApp = useCallback(async (): Promise<boolean> => {
		const sessionId = sessionIdRef.current;
		if (!sessionId) {
			throw new Error("No device connected.");
		}
		const dmk = getDmk();

		// ---------------------------------------------------------------
		// Step 1: Wait for the DMK session to reach a "Ready" state.
		//         If the device is locked the session stays in "Connected"
		//         with deviceStatus LOCKED. We show the unlock Lottie and
		//         wait for the session to advance to Ready* (which means
		//         the device is unlocked and the DMK has queried the
		//         running app).
		// ---------------------------------------------------------------
		const initialState = await firstValueFrom(dmk.getDeviceSessionState({ sessionId }));
		console.log(
			"[ensureEthereumApp] initial session state:",
			initialState.sessionStateType,
			"deviceStatus:",
			initialState.deviceStatus,
		);

		let readyState = initialState;

		if (
			initialState.deviceStatus === DeviceStatus.LOCKED ||
			initialState.sessionStateType === DeviceSessionStateType.Connected
		) {
			// Show unlock UI if the device is locked
			if (initialState.deviceStatus === DeviceStatus.LOCKED) {
				setDeviceActionState({
					status: "unlock-device",
					message: "Please unlock your Ledger device",
				});
			}

			// Wait for the session to reach a Ready state (up to 2 min)
			try {
				readyState = await firstValueFrom(
					dmk.getDeviceSessionState({ sessionId }).pipe(
						filter(
							(s) =>
								s.sessionStateType === DeviceSessionStateType.ReadyWithoutSecureChannel ||
								s.sessionStateType === DeviceSessionStateType.ReadyWithSecureChannel,
						),
						timeout(120_000),
					),
				);
				console.log(
					"[ensureEthereumApp] session ready:",
					readyState.sessionStateType,
					"deviceStatus:",
					readyState.deviceStatus,
				);
			} catch {
				// Timeout or error — clear unlock UI and proceed to OpenApp
				console.log("[ensureEthereumApp] timed out waiting for session ready");
				setDeviceActionState(null);
			}
		}

		// Clear the unlock UI if we showed it
		setDeviceActionState(null);

		// ---------------------------------------------------------------
		// Step 2: Check the currentApp from the ready session state.
		//         Ready states include a `currentApp` field that tells us
		//         which app is running without sending any APDU.
		// ---------------------------------------------------------------
		if (
			readyState.sessionStateType === DeviceSessionStateType.ReadyWithoutSecureChannel ||
			readyState.sessionStateType === DeviceSessionStateType.ReadyWithSecureChannel
		) {
			const currentApp = (readyState as { currentApp?: { name: string } }).currentApp;
			console.log("[ensureEthereumApp] currentApp:", currentApp?.name);
			if (currentApp?.name === "Ethereum") {
				console.log("[ensureEthereumApp] Ethereum app already open — skipping OpenApp");
				return true;
			}
		}

		// ---------------------------------------------------------------
		// Step 3: Ethereum app is not open — use OpenAppWithDependencies.
		// ---------------------------------------------------------------
		console.log("[ensureEthereumApp] opening Ethereum app via OpenAppWithDependencies");
		const openAppAction = new OpenAppWithDependenciesDeviceAction({
			input: {
				application: { name: "Ethereum" },
				dependencies: [],
			},
		});

		const { observable: openAppObservable } = dmk.executeDeviceAction({
			sessionId,
			deviceAction: openAppAction,
		});

		await observeDeviceAction(openAppObservable, "Ethereum app setup");
		return false;
	}, []);

	// -----------------------------------------------------------------------
	// Open Ethereum app + derive addresses + show picker (fresh connect)
	// -----------------------------------------------------------------------
	const openAppAndDeriveAddresses = useCallback(async () => {
		const appWasOpen = await ensureEthereumApp();

		const sessionId = sessionIdRef.current!;
		const dmk = getDmk();
		const ethSigner = buildEthSigner(dmk, sessionId);
		const addresses: DerivedAddress[] = [];

		// Transition to "deriving addresses" view
		setConnectingTransport(null);
		setDeviceActionState(null);
		setIsDerivingAddresses(true);

		// If the app was already open, we already probed the first path
		// in ensureEthereumApp — re-derive it here to populate the list.
		for (const derivPath of DERIVATION_PATHS) {
			if (!derivPath) continue;
			try {
				const { observable } = ethSigner.getAddress(derivPath, {
					checkOnDevice: false,
					skipOpenApp: true,
				});
				const result = await lastValueFrom(observable);
				if (result.status === DeviceActionStatus.Completed) {
					addresses.push({
						address: result.output.address,
						derivationPath: derivPath,
					});
				}
			} catch {
				// Skip addresses that fail to derive
			}
		}

		// All addresses derived — open the address picker
		setIsDerivingAddresses(false);
		setShowConnectDialog(false);
		setDerivedAddresses(addresses);
		setShowAddressPicker(true);
	}, [ensureEthereumApp]);

	// -----------------------------------------------------------------------
	// Retry opening the Ethereum app on the already-connected device
	// -----------------------------------------------------------------------
	const retryOpenApp = useCallback(async () => {
		setDeviceActionState(null);
		setShowConnectDialog(true);
		setConnectingTransport("usb"); // show "waiting" view

		try {
			await openAppAndDeriveAddresses();
			monitorSession(sessionIdRef.current!);
		} catch (err) {
			setConnectingTransport(null);
			setIsDerivingAddresses(false);
			setShowConnectDialog(false);

			const recoverable = classifyRecoverableError(err);
			if (recoverable) {
				setDeviceActionState((prev) => {
					if (prev && prev.status !== "error" && prev.status !== "success") return prev;
					return {
						...recoverable,
						canRetry: recoverable.canRetry === true || recoverable.status === "open-app",
					};
				});
			} else {
				setDeviceActionState((prev) => {
					if (prev && prev.status !== "error" && prev.status !== "success") return prev;
					const message = humanizeError(err);
					const errorObj = new Error(message);
					setError(errorObj);
					return { status: "error", message, error: errorObj };
				});
			}
		}
	}, [openAppAndDeriveAddresses, monitorSession]);

	// -----------------------------------------------------------------------
	// Generic retry: delegates to the stored retry callback, or falls back
	// to retryOpenApp for open-app/connect related errors.
	// -----------------------------------------------------------------------
	const retry = useCallback(async () => {
		const cb = retryCallbackRef.current;
		if (cb) {
			retryCallbackRef.current = null;
			setDeviceActionState(null);
			await cb();
		} else {
			await retryOpenApp();
		}
	}, [retryOpenApp]);

	// -----------------------------------------------------------------------
	// Connect
	// -----------------------------------------------------------------------
	const connect = useCallback(
		async (transport: TransportType = "usb") => {
			// Keep the ConnectDeviceDialog open — it shows a "waiting for device"
			// screen while the browser's native device picker is displayed.
			setIsConnecting(true);
			setConnectingTransport(transport);
			setError(null);
			setDeviceActionState(null);

			try {
				const dmk = getDmk();

				// Check environment support
				if (!dmk.isEnvironmentSupported()) {
					throw new Error(
						"Your browser does not support WebHID or Web Bluetooth. Please use Chrome or Edge.",
					);
				}

				const transportIdentifier = transport === "usb" ? webHidIdentifier : webBleIdentifier;

				// Start discovery — browser shows the native device picker here
				const device: DiscoveredDevice = await firstValueFrom(
					dmk.startDiscovering({ transport: transportIdentifier }),
				);
				await dmk.stopDiscovering();

				// Connect to device — session refresher enabled so DMK can
				// detect locked/unlocked state and surface it in device actions.
				const sessionId = await dmk.connect({ device });

				sessionIdRef.current = sessionId;
				setHasActiveSession(true);

				// Retrieve connected device info for model detection
				try {
					const connectedDevice = dmk.getConnectedDevice({
						sessionId,
					});
					setDeviceModelId(connectedDevice.modelId);
				} catch {
					// Non-fatal: animations will fall back to generic
				}

				// ---------------------------------------------------------------
				// DMK device actions (getAddress, OpenAppWithDependencies,
				// signTransaction, etc.) handle the locked device state
				// natively via their built-in state machine. They emit
				// UserInteractionRequired.UnlockDevice and wait for the
				// user to enter their PIN before continuing.
				//
				// We rely on observeDeviceAction to map these intermediate
				// states to the correct UI (unlock Lottie, etc.) rather
				// than trying to detect and handle the locked state manually.
				// ---------------------------------------------------------------

				// If we already have a persisted account (e.g. reconnecting
				// after a page refresh), just ensure the Ethereum app is open
				// and skip the address picker — go straight to ready state.
				if (account) {
					await ensureEthereumApp();
					setConnectingTransport(null);
					setDeviceActionState(null);
					setIsDerivingAddresses(false);
					setShowConnectDialog(false);

					// If a signing operation is waiting for a session,
					// resolve it now so it can proceed automatically.
					if (pendingSessionResolverRef.current) {
						pendingSessionResolverRef.current.resolve({
							dmk,
							sessionId,
						});
						pendingSessionResolverRef.current = null;
					}
				} else {
					// Fresh connect — derive addresses and show the picker
					await openAppAndDeriveAddresses();
				}

				// Start monitoring the session for disconnects
				monitorSession(sessionId);
			} catch (err) {
				setConnectingTransport(null);
				setIsDerivingAddresses(false);
				setShowConnectDialog(false);

				// Reject any pending signing operation waiting for a session
				if (pendingSessionResolverRef.current) {
					pendingSessionResolverRef.current.reject(err);
					pendingSessionResolverRef.current = null;
				}

				// observeDeviceAction may have already set a recoverable
				// deviceActionState (e.g. unlock-device). Use a functional
				// update so we don't overwrite it with a generic error.
				const recoverable = classifyRecoverableError(err);
				if (recoverable) {
					setDeviceActionState((prev) => {
						// Keep existing recoverable state if already set
						if (prev && prev.status !== "error" && prev.status !== "success") return prev;
						return {
							...recoverable,
							canRetry:
								recoverable.canRetry === true ||
								recoverable.status === "unlock-device" ||
								recoverable.status === "open-app",
						};
					});
				} else {
					setDeviceActionState((prev) => {
						// Keep existing recoverable state from observeDeviceAction
						if (prev && prev.status !== "error" && prev.status !== "success") return prev;
						const message = humanizeError(err);
						const errorObj = new Error(message);
						setError(errorObj);
						return { status: "error", message, error: errorObj };
					});
				}
			} finally {
				setIsConnecting(false);
				try {
					getDmk().stopDiscovering();
				} catch {
					// Ignore if already stopped
				}
			}
		},
		[monitorSession, openAppAndDeriveAddresses, ensureEthereumApp, account],
	);

	// -----------------------------------------------------------------------
	// Disconnect
	// -----------------------------------------------------------------------
	const disconnect = useCallback(() => {
		const sessionId = sessionIdRef.current;
		if (sessionId) {
			try {
				getDmk().disconnect({ sessionId });
			} catch {
				// Ignore disconnect errors
			}
		}
		deviceSessionSubRef.current?.unsubscribe();
		deviceSessionSubRef.current = null;
		sessionIdRef.current = null;
		setHasActiveSession(false);
		setAccount(null);
		setDeviceModelId(null);
		setError(null);
		setDeviceActionState(null);
		setConnectingTransport(null);
		setDerivedAddresses([]);
		setShowAddressPicker(false);
		localStorage.removeItem(LS_ACCOUNT_KEY);
		localStorage.removeItem(LS_DERIVATION_PATH_KEY);
	}, [setAccount]);

	// -----------------------------------------------------------------------
	// Select a derived address from the picker
	// -----------------------------------------------------------------------
	const selectAddress = useCallback(
		(derived: DerivedAddress) => {
			persistDerivationPath(derived.derivationPath);
			setAccount(derived.address);
			setShowAddressPicker(false);
			setDerivedAddresses([]);
			// Keep the DeviceActionDialog open with a transitional state so
			// authentication (personal_sign) can proceed without the modal
			// closing and reopening. useWalletAuth will dismiss it once the
			// session is established (or already valid).
			setDeviceActionState({
				status: "open-app",
				message: "Authenticating…",
			});
		},
		[setAccount, persistDerivationPath],
	);

	// -----------------------------------------------------------------------
	// Derive a custom address from a manually entered path
	// -----------------------------------------------------------------------
	const deriveCustomAddress = useCallback(async (path: string) => {
		const sessionId = sessionIdRef.current;
		if (!sessionId) {
			throw new Error("No device connected.");
		}
		const dmk = getDmk();
		const ethSigner = buildEthSigner(dmk, sessionId);

		setIsDerivingAddresses(true);
		try {
			const { observable } = ethSigner.getAddress(path, {
				checkOnDevice: false,
				skipOpenApp: true,
			});
			const result = await lastValueFrom(observable);
			if (result.status === DeviceActionStatus.Completed) {
				const newAddr: DerivedAddress = {
					address: result.output.address,
					derivationPath: path,
				};
				// Add to the front of the list if not already present
				setDerivedAddresses((prev) => {
					const exists = prev.some((a) => a.derivationPath === path);
					return exists ? prev : [newAddr, ...prev];
				});
			} else {
				throw new Error("Failed to derive address for this path.");
			}
		} finally {
			setIsDerivingAddresses(false);
		}
	}, []);

	// -----------------------------------------------------------------------
	// Ensure we have a connected session for signing operations.
	// If the session is missing (e.g. after a page refresh), open the
	// connect dialog so the user can re-pair the device.
	// -----------------------------------------------------------------------
	const ensureSession = useCallback((): Promise<{
		dmk: DeviceManagementKit;
		sessionId: DeviceSessionId;
	}> => {
		const sessionId = sessionIdRef.current;
		if (sessionId) {
			return Promise.resolve({ dmk: getDmk(), sessionId });
		}

		// No active session — open the connect dialog and return a
		// Promise that will be resolved once the connect flow completes.
		setShowConnectDialog(true);

		return new Promise((resolve, reject) => {
			pendingSessionResolverRef.current = { resolve, reject };
		});
	}, []);

	// -----------------------------------------------------------------------
	// Helper: observe a device action and update UI state
	// -----------------------------------------------------------------------
	const observeDeviceAction = useCallback(
		<T,>(
			observable: import("rxjs").Observable<
				import("@ledgerhq/device-management-kit").DeviceActionState<
					T,
					// biome-ignore lint/suspicious/noExplicitAny: DMK error types are complex union types
					any,
					{ requiredUserInteraction: string; [key: string]: unknown }
				>
			>,
			operationLabel: string,
		): Promise<T> => {
			// Cancel any pending success-dismiss timer from a previous action
			if (successDismissTimerRef.current) {
				clearTimeout(successDismissTimerRef.current);
				successDismissTimerRef.current = null;
			}

			return new Promise<T>((resolve, reject) => {
				const subscription = observable.subscribe({
					next: (state) => {
						switch (state.status) {
							case DeviceActionStatus.Pending: {
								const interaction = state.intermediateValue?.requiredUserInteraction;

								// Check for install plan progress (from OpenAppWithDependencies)
								const installPlan = (
									state.intermediateValue as
										| { installPlan?: { currentIndex: number; installPlan: unknown[] } }
										| undefined
								)?.installPlan;

								if (installPlan && installPlan.installPlan.length > 0) {
									setDeviceActionState({
										status: "installing-app",
										message: `Installing app${installPlan.installPlan.length > 1 ? ` (${installPlan.currentIndex + 1}/${installPlan.installPlan.length})` : ""}…`,
									});
									break;
								}

								switch (interaction) {
									case UserInteractionRequired.UnlockDevice:
										setDeviceActionState({
											status: "unlock-device",
											message: "Please unlock your Ledger device",
										});
										break;
									case UserInteractionRequired.AllowSecureConnection:
										setDeviceActionState({
											status: "allow-secure-connection",
											message: "Please allow the secure connection on your device",
										});
										break;
									case UserInteractionRequired.ConfirmOpenApp:
										setDeviceActionState({
											status: "confirm-open-app",
											message: "Please confirm opening the Ethereum app on your device",
										});
										break;
									case UserInteractionRequired.AllowListApps:
										setDeviceActionState({
											status: "allow-secure-connection",
											message: "Please allow the request on your device",
										});
										break;
									case UserInteractionRequired.SignTransaction:
										setDeviceActionState({
											status: "sign-transaction",
											message: `Review and confirm the ${operationLabel} on your device`,
										});
										break;
									case UserInteractionRequired.SignPersonalMessage:
										setDeviceActionState({
											status: "sign-message",
											message: "Review and sign the message on your device",
										});
										break;
									case UserInteractionRequired.SignTypedData:
										setDeviceActionState({
											status: "sign-typed-data",
											message: "Review and sign the data on your device",
										});
										break;
									case UserInteractionRequired.VerifyAddress:
										setDeviceActionState({
											status: "verify-address",
											message: "Verify the address on your device",
										});
										break;
									case UserInteractionRequired.None:
										break;
									default:
										setDeviceActionState({
											status: "open-app",
											message: `Please check your device… (${interaction})`,
										});
										break;
								}
								break;
							}
							case DeviceActionStatus.Completed:
								setDeviceActionState({
									status: "success",
									message: `${operationLabel} confirmed`,
								});
								successDismissTimerRef.current = setTimeout(() => {
									successDismissTimerRef.current = null;
									setDeviceActionState(null);
								}, 1500);
								subscription.unsubscribe();
								resolve(state.output);
								break;
							case DeviceActionStatus.Error: {
								const recoverable = classifyRecoverableError(state.error);
								if (recoverable) {
									setDeviceActionState({
										...recoverable,
										canRetry:
											recoverable.canRetry === true ||
											recoverable.status === "unlock-device" ||
											recoverable.status === "open-app",
									});
								} else {
									const message = humanizeError(state.error);
									setDeviceActionState({
										status: "error",
										message,
										error: new Error(message),
									});
								}
								subscription.unsubscribe();
								reject(state.error);
								break;
							}
							case DeviceActionStatus.Stopped:
								subscription.unsubscribe();
								reject(new Error(`${operationLabel} was cancelled`));
								break;
						}
					},
					error: (err) => {
						const recoverable = classifyRecoverableError(err);
						if (recoverable) {
							setDeviceActionState({
								...recoverable,
								canRetry:
									recoverable.canRetry === true ||
									recoverable.status === "unlock-device" ||
									recoverable.status === "open-app",
							});
						} else {
							const message = humanizeError(err);
							setDeviceActionState({
								status: "error",
								message,
								error: new Error(message),
							});
						}
						reject(err);
					},
				});
			});
		},
		[],
	);

	// -----------------------------------------------------------------------
	// sendTransaction: sign + broadcast via RPC
	// -----------------------------------------------------------------------
	const sendTransaction = useCallback(
		async (tx: TransactionRequest): Promise<string> => {
			const { dmk, sessionId } = await ensureSession();
			const currentChainId = chainId ?? DEFAULT_CHAIN_ID;
			const chain = getChain(currentChainId);
			const rpcUrl = getRpcUrl(currentChainId);

			console.info("[sendTransaction] Starting", {
				chainId: currentChainId,
				rpcUrl,
				to: tx.to,
				hasData: !!tx.data,
				value: tx.value,
				account,
			});

			setDeviceActionState({
				status: "open-app",
				message: "Preparing transaction…",
			});

			// Declared before try so it can be captured by the retry callback in catch
			let doSign: (() => Promise<{ r: string; s: string; v: number }>) | null = null;

			try {
				const publicClient = createPublicClient({
					chain,
					transport: http(rpcUrl),
				});

				const senderAddress = account as `0x${string}`;

				console.info("[sendTransaction] Fetching nonce + gas…");

				// Get nonce and gas estimates in parallel
				const [nonce, gasPrice, estimatedGas] = await Promise.all([
					publicClient.getTransactionCount({ address: senderAddress }),
					publicClient.getGasPrice(),
					publicClient.estimateGas({
						account: senderAddress,
						to: tx.to as `0x${string}`,
						data: tx.data as `0x${string}`,
						value: tx.value ? BigInt(tx.value) : 0n,
					}),
				]);

				console.info("[sendTransaction] Gas OK", {
					nonce,
					gasPrice: gasPrice.toString(),
					estimatedGas: estimatedGas.toString(),
				});

				const unsignedTx: TransactionSerializable = {
					to: tx.to as `0x${string}`,
					data: tx.data as `0x${string}`,
					value: tx.value ? BigInt(tx.value) : 0n,
					nonce,
					gas: estimatedGas + (estimatedGas * 20n) / 100n,
					gasPrice,
					chainId: currentChainId,
					type: "legacy" as const,
				};

				const serializedTx = serializeTransaction(unsignedTx);
				const txBytes = hexaStringToBuffer(serializedTx);
				if (!txBytes) {
					throw new Error("Failed to serialize transaction");
				}

				// Inner helper for the signing step so retry can re-invoke it
				doSign = async (): Promise<{ r: string; s: string; v: number }> => {
					console.info("[sendTransaction] Starting device signing…");
					const signer = buildEthSigner(dmk, sessionId);
					const { observable } = signer.signTransaction(derivationPathRef.current, txBytes, {
						skipOpenApp: true,
					});
					return observeDeviceAction(observable, "Transaction");
				};

				let signature: { r: string; s: string; v: number };
				try {
					signature = await doSign();
				} catch (firstErr) {
					console.warn("[sendTransaction] First sign attempt failed:", firstErr);
					if (!isAppNotOpenError(firstErr)) throw firstErr;
					await ensureEthereumApp();
					signature = await doSign();
				}
				console.info("[sendTransaction] Signature obtained");

				const r = signature.r.startsWith("0x") ? signature.r : `0x${signature.r}`;
				const s = signature.s.startsWith("0x") ? signature.s : `0x${signature.s}`;

				const signedTx = serializeTransaction(unsignedTx, {
					r: r as `0x${string}`,
					s: s as `0x${string}`,
					v: BigInt(signature.v),
				});

				setDeviceActionState({
					status: "success",
					message: "Broadcasting transaction…",
				});

				const txHash = await publicClient.sendRawTransaction({
					serializedTransaction: signedTx,
				});

				setDeviceActionState({
					status: "success",
					message: "Transaction broadcast successfully",
				});
				successDismissTimerRef.current = setTimeout(() => {
					successDismissTimerRef.current = null;
					setDeviceActionState(null);
				}, 2000);

				return txHash;
			} catch (err) {
				console.error("[sendTransaction] FAILED:", err);
				if (doSign) {
					const capturedDoSign = doSign;
					retryCallbackRef.current = async () => {
						setDeviceActionState({ status: "open-app", message: "Preparing transaction…" });
						try {
							await capturedDoSign();
						} catch (retryErr) {
							setDeviceActionState((prev) => {
								if (prev) return prev;
								const msg = humanizeError(retryErr);
								return { status: "error", message: msg, error: new Error(msg) };
							});
						}
					};
				}
				setDeviceActionState((prev) => {
					if (prev) return prev;
					const msg = humanizeError(err);
					return { status: "error", message: msg, error: new Error(msg) };
				});
				throw err instanceof Error ? err : new Error(humanizeError(err));
			}
		},
		[account, chainId, ensureSession, observeDeviceAction, ensureEthereumApp],
	);

	// -----------------------------------------------------------------------
	// signTypedDataV4: sign EIP-712 typed data
	// -----------------------------------------------------------------------
	const signTypedDataV4 = useCallback(
		async (typedData: unknown): Promise<string> => {
			const { dmk, sessionId } = await ensureSession();

			setDeviceActionState({
				status: "open-app",
				message: "Preparing to sign typed data…",
			});

			const parsed: TypedData =
				typeof typedData === "string" ? JSON.parse(typedData) : (typedData as TypedData);

			const doSign = async (): Promise<string> => {
				const ethSigner = buildEthSigner(dmk, sessionId);
				const { observable } = ethSigner.signTypedData(derivationPathRef.current, parsed, {
					skipOpenApp: true,
				});
				const signature = await observeDeviceAction(observable, "Typed data signing");
				return signatureToHex(signature);
			};

			try {
				try {
					return await doSign();
				} catch (firstErr) {
					if (!isAppNotOpenError(firstErr)) throw firstErr;
					await ensureEthereumApp();
					return await doSign();
				}
			} catch (err) {
				retryCallbackRef.current = async () => {
					setDeviceActionState({
						status: "open-app",
						message: "Preparing to sign typed data…",
					});
					try {
						await doSign();
					} catch (retryErr) {
						setDeviceActionState((prev) => {
							if (prev) return prev;
							const msg = humanizeError(retryErr);
							return { status: "error", message: msg, error: new Error(msg) };
						});
					}
				};
				setDeviceActionState((prev) => {
					if (prev) return prev;
					const msg = humanizeError(err);
					return { status: "error", message: msg, error: new Error(msg) };
				});
				throw err instanceof Error ? err : new Error(humanizeError(err));
			}
		},
		[ensureSession, observeDeviceAction, ensureEthereumApp],
	);

	// -----------------------------------------------------------------------
	// personalSign: sign a personal message (EIP-191)
	// -----------------------------------------------------------------------
	const personalSign = useCallback(
		async (message: string): Promise<string> => {
			const { dmk, sessionId } = await ensureSession();

			setDeviceActionState({
				status: "open-app",
				message: "Preparing to sign message…",
			});

			// Inner helper so we can store it as a retry callback
			const doSign = async (): Promise<string> => {
				const ethSigner = buildEthSigner(dmk, sessionId);
				const { observable } = ethSigner.signMessage(derivationPathRef.current, message, {
					skipOpenApp: true,
				});
				const signature = await observeDeviceAction(observable, "Message signing");
				return signatureToHex(signature);
			};

			try {
				try {
					return await doSign();
				} catch (firstErr) {
					if (!isAppNotOpenError(firstErr)) throw firstErr;
					await ensureEthereumApp();
					return await doSign();
				}
			} catch (err) {
				// Store retry callback so the Retry button re-sends the signing
				retryCallbackRef.current = async () => {
					setDeviceActionState({ status: "open-app", message: "Preparing to sign message…" });
					try {
						await doSign();
					} catch (retryErr) {
						setDeviceActionState((prev) => {
							if (prev) return prev;
							const msg = humanizeError(retryErr);
							return { status: "error", message: msg, error: new Error(msg) };
						});
					}
				};
				setDeviceActionState((prev) => {
					if (prev) return prev;
					const msg = humanizeError(err);
					return { status: "error", message: msg, error: new Error(msg) };
				});
				throw err instanceof Error ? err : new Error(humanizeError(err));
			}
		},
		[ensureSession, observeDeviceAction, ensureEthereumApp],
	);

	// -----------------------------------------------------------------------
	// openLedgerModal: show the connect dialog
	// -----------------------------------------------------------------------
	const openLedgerModal = useCallback(() => {
		setShowConnectDialog(true);
	}, []);

	const dismissDeviceAction = useCallback(() => {
		if (successDismissTimerRef.current) {
			clearTimeout(successDismissTimerRef.current);
			successDismissTimerRef.current = null;
		}
		setDeviceActionState(null);
	}, []);

	// -----------------------------------------------------------------------
	// Context value
	// -----------------------------------------------------------------------
	const contextValue = useMemo(
		() => ({
			account,
			chainId,
			isConnected: !!account,
			isConnecting,
			error,
			connect,
			disconnect,
			sendTransaction,
			signTypedDataV4,
			personalSign,
			openLedgerModal,
			deviceActionState,
			setShowConnectDialog,
			showConnectDialog,
			deviceModelId,
			dismissDeviceAction,
			connectingTransport,
			derivedAddresses,
			showAddressPicker,
			selectAddress,
			deriveCustomAddress,
			isDerivingAddresses,
			retry,
			hasActiveSession,
		}),
		[
			account,
			chainId,
			isConnecting,
			error,
			connect,
			disconnect,
			sendTransaction,
			signTypedDataV4,
			personalSign,
			openLedgerModal,
			deviceActionState,
			showConnectDialog,
			deviceModelId,
			dismissDeviceAction,
			connectingTransport,
			derivedAddresses,
			showAddressPicker,
			selectAddress,
			deriveCustomAddress,
			isDerivingAddresses,
			retry,
			hasActiveSession,
		],
	);

	return <LedgerContext.Provider value={contextValue}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
	const ctx = useContext(LedgerContext);
	if (!ctx) {
		throw new Error("useLedger must be used within LedgerProvider");
	}
	return ctx;
}
