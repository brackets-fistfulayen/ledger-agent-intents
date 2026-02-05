"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
	useRef,
	type ReactNode,
} from "react";
import type { EIP6963ProviderDetail } from "@ledgerhq/ledger-wallet-provider";

interface TransactionRequest {
	to: string;
	data: string;
	value?: string;
}

interface LedgerContextType {
	account: string | null;
	chainId: number | null;
	isConnected: boolean;
	isConnecting: boolean;
	error: Error | null;
	connect: () => Promise<void>;
	disconnect: () => void;
	sendTransaction: (tx: TransactionRequest) => Promise<string>;
	signTypedDataV4: (typedData: unknown) => Promise<string>;
	personalSign: (message: string) => Promise<string>;
	openLedgerModal: () => void;
}

const LedgerContext = createContext<LedgerContextType | null>(null);

// Module-level singleton to prevent re-initialization during HMR
let ledgerInitialized = false;
let ledgerCleanupFn: (() => void) | undefined;
let ledgerAppReady = false;

/**
 * Dismiss the Ledger SDK overlay modal (success, rejection, or error).
 * The SDK's `<ledger-core-modal>` uses a Shadow DOM. We try to click its
 * close button first; if that doesn't work we remove the element entirely
 * so the user is never stuck on a frozen overlay.
 */
function dismissLedgerModal(): void {
	requestAnimationFrame(() => {
		const modal = document.querySelector("ledger-core-modal");
		if (modal?.shadowRoot) {
			const closeBtn = modal.shadowRoot.querySelector<HTMLElement>(
				"button, [data-dismiss], .close-button, [aria-label='Close']",
			);
			closeBtn?.click();
		}
		// Fallback: remove the modal element entirely if click didn't work
		setTimeout(() => {
			document.querySelector("ledger-core-modal")?.remove();
		}, 300);
	});
}

export function LedgerProvider({ children }: { children: ReactNode }) {
	const [provider, setProvider] = useState<EIP6963ProviderDetail | null>(null);
	const [account, setAccount] = useState<string | null>(null);
	const [chainId, setChainId] = useState<number | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Track the provider UUID to avoid re-setting state for the same provider
	const providerUuidRef = useRef<string | null>(null);

	const useStubDAppConfig =
		import.meta.env.VITE_LEDGER_STUB_DAPP_CONFIG === "true";

	// Helper: query the provider for current account & chain and update React state.
	// Uses eth_accounts (passive, never opens a modal) and eth_chainId.
	const syncProviderState = useCallback(
		(p: EIP6963ProviderDetail) => {
			p.provider
				.request({ method: "eth_accounts", params: [] })
				.then((raw: unknown) => {
					const accounts = Array.isArray(raw) ? (raw as string[]) : [];
					setAccount(accounts[0] || null);
				})
				.catch(() => {});

			p.provider
				.request({ method: "eth_chainId", params: [] })
				.then((raw: unknown) => {
					if (typeof raw === "string") {
						setChainId(Number.parseInt(raw, 16));
					}
				})
				.catch(() => {});
		},
		[],
	);

	// Initialize Ledger Button Provider
	useEffect(() => {
		if (typeof window === "undefined") return;

		// Set up provider listener - this needs to run on every mount
		// to update React state when provider announces itself
		const handleProvider = (e: Event) => {
			const detail = (e as CustomEvent<EIP6963ProviderDetail>).detail;
			if (detail.info.name.toLowerCase().includes("ledger")) {
				// Only update state if this is a different provider (by UUID)
				// This prevents re-renders from repeated announcements
				if (providerUuidRef.current !== detail.info.uuid) {
					providerUuidRef.current = detail.info.uuid;
					setProvider(detail);

					// Immediately try to recover existing account/chain from the SDK.
					// Uses eth_accounts (passive, no modal) so a page refresh won't
					// prompt the user unnecessarily.
					syncProviderState(detail);
				}
			}
		};

		window.addEventListener("eip6963:announceProvider", handleProvider);

		// Only initialize the Ledger button once (survives HMR)
		if (!ledgerInitialized) {
			ledgerInitialized = true;

			const initProvider = async () => {
				try {
					const { initializeLedgerProvider } = await import(
						"@ledgerhq/ledger-wallet-provider"
					);

					ledgerCleanupFn = initializeLedgerProvider({
						target: document.body,
						floatingButtonPosition: false,
						dAppIdentifier: "multisig",
						apiKey: import.meta.env.VITE_LEDGER_API_KEY || "",
						// IMPORTANT: do not pass `undefined` values (can cause runtime errors in downstream code)
						// Base mainnet override for fee estimation / nonce / etc.
						rpcUrls: (() => {
							const out: Record<string, string> = {};
							const baseMainnet = import.meta.env.VITE_BASE_MAINNET_RPC_URL;
							if (typeof baseMainnet === "string" && baseMainnet.trim().length > 0) {
								out["8453"] = baseMainnet.trim();
							}
							return out;
						})(),
						loggerLevel: "info",
						devConfig: useStubDAppConfig
							? {
									stub: {
										dAppConfig: true,
									},
								}
							: undefined,
					});
					// Mark the app as ready after a short delay to allow it to mount
					setTimeout(() => {
						ledgerAppReady = true;
					}, 100);
				} catch (err) {
					console.error("Failed to initialize Ledger provider:", err);
					ledgerInitialized = false; // Allow retry on error
				}
			};

			initProvider();
		}

		return () => {
			window.removeEventListener("eip6963:announceProvider", handleProvider);
			// Don't cleanup the Ledger button on unmount - it should persist
			// across HMR and React Strict Mode double-mounting.
			// The button will be cleaned up when the page is unloaded.
		};
	}, [useStubDAppConfig, syncProviderState]);

	// Listen for account/chain changes
	useEffect(() => {
		if (!provider?.provider.on) return;

		// The Ledger Button SDK dispatches DOM CustomEvents on its HTMLElement
		// provider. Depending on whether `on()` unwraps the event, the callback
		// may receive the payload directly (EventEmitter style) or as a
		// CustomEvent whose `.detail` holds the payload. Handle both.
		const handleAccountsChanged = (accountsOrEvent: unknown) => {
			const accounts =
				(accountsOrEvent as CustomEvent)?.detail ?? accountsOrEvent;
			if (!Array.isArray(accounts)) {
				setAccount(null);
				return;
			}
			setAccount((accounts[0] as string | undefined) || null);
		};

		const handleChainChanged = (chainIdOrEvent: unknown) => {
			const raw =
				(chainIdOrEvent as CustomEvent)?.detail ?? chainIdOrEvent;
			if (typeof raw === "string") {
				setChainId(Number.parseInt(raw, 16));
			} else if (typeof raw === "number") {
				setChainId(raw);
			}
		};

		provider.provider.on("accountsChanged", handleAccountsChanged);
		provider.provider.on("chainChanged", handleChainChanged);

		return () => {
			provider.provider.removeListener?.(
				"accountsChanged",
				handleAccountsChanged,
			);
			provider.provider.removeListener?.("chainChanged", handleChainChanged);
		};
	}, [provider]);

	const connect = useCallback(async () => {
		if (!provider) {
			setError(new Error("Click the Ledger button to connect"));
			return;
		}

		setIsConnecting(true);
		setError(null);

		try {
			const accountsRaw = await provider.provider.request({
				method: "eth_requestAccounts",
				params: [],
			});

			const accounts = Array.isArray(accountsRaw) ? (accountsRaw as string[]) : [];

			if (accounts.length > 0 && accounts[0]) {
				setAccount(accounts[0]);
			}

			const chain = (await provider.provider.request({
				method: "eth_chainId",
				params: [],
			})) as string;
			setChainId(Number.parseInt(chain, 16));
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Connection failed");
			setError(error);
			throw error;
		} finally {
			setIsConnecting(false);
		}
	}, [provider]);

	const disconnect = useCallback(() => {
		setAccount(null);
		setChainId(null);
		setError(null);
	}, []);

	const openLedgerModal = useCallback(() => {
		const tryOpenModal = () => {
			// Find the ledger-button-app element and call its navigationIntent method directly
			const app = document.querySelector("ledger-button-app") as HTMLElement & {
				navigationIntent?: (intent: string, params?: unknown, mode?: string) => void;
			};

			if (app?.navigationIntent) {
				app.navigationIntent("selectAccount", undefined, "panel");
				return true;
			}
			return false;
		};

		// Safety-net: after the user picks an account in the SDK modal,
		// re-sync React state in case the `accountsChanged` event didn't
		// fire or arrived in an unexpected format.
		const onAccountSelected = () => {
			if (provider) {
				syncProviderState(provider);
			}
		};
		window.addEventListener(
			"ledger-provider-account-selected",
			onAccountSelected,
			{ once: true },
		);

		// Try immediately
		if (tryOpenModal()) {
			return;
		}

		// If app not ready yet, retry after a short delay
		if (!ledgerAppReady) {
			const retryInterval = setInterval(() => {
				if (tryOpenModal()) {
					clearInterval(retryInterval);
				}
			}, 100);

			// Stop retrying after 3 seconds
			setTimeout(() => {
				clearInterval(retryInterval);
				// Clean up the one-time listener if modal never opened
				window.removeEventListener(
					"ledger-provider-account-selected",
					onAccountSelected,
				);
				console.warn("Ledger modal could not be opened - app not ready");
			}, 3000);
		}
	}, [provider, syncProviderState]);

	// -----------------------------------------------------------------------
	// ensureAccount: resolve the current account for a signing operation.
	//
	// Priority order:
	//   1. eth_accounts (passive, no modal) – SDK may already have one.
	//   2. React state `account` – set by accountsChanged / connect() / sync.
	//      The SDK's EIP-1193 provider sometimes returns [] even after the
	//      user selected an account via the connect-button panel, but the
	//      accountsChanged event DID fire and updated React state.
	//   3. eth_requestAccounts (interactive) – last resort, opens the modal.
	// -----------------------------------------------------------------------
	const ensureAccount = useCallback(
		async (): Promise<string> => {
			if (!provider) throw new Error("No provider available");

			// 1. Passive provider check
			try {
				const passiveRaw = await provider.provider.request({
					method: "eth_accounts",
					params: [],
				});
				const passive = Array.isArray(passiveRaw)
					? (passiveRaw as string[])
					: [];

				if (passive[0]) {
					if (passive[0] !== account) setAccount(passive[0]);
					return passive[0];
				}
			} catch {
				// ignore – fall through
			}

			// 2. React state fallback (set by events / connect / sync)
			if (account) {
				return account;
			}

			// 3. Interactive prompt – opens account selection if needed
			try {
				const activeRaw = await provider.provider.request({
					method: "eth_requestAccounts",
					params: [],
				});
				const active = Array.isArray(activeRaw)
					? (activeRaw as string[])
					: [];

				if (active[0]) {
					setAccount(active[0]);

					// Also sync chain
					provider.provider
						.request({ method: "eth_chainId", params: [] })
						.then((raw: unknown) => {
							if (typeof raw === "string")
								setChainId(Number.parseInt(raw, 16));
						})
						.catch(() => {});

					return active[0];
				}
			} catch {
				// ignore – fall through
			}

			throw new Error("No account selected");
		},
		[provider, account],
	);

	const sendTransaction = useCallback(
		async (tx: TransactionRequest): Promise<string> => {
			const currentAccount = await ensureAccount();

			try {
				const txHash = (await provider!.provider.request({
					method: "eth_sendTransaction",
					params: [
						{
							from: currentAccount,
							to: tx.to,
							data: tx.data,
							value: tx.value || "0x0",
						},
					],
				})) as string;

				dismissLedgerModal();
				return txHash;
			} catch (err) {
				dismissLedgerModal();
				throw err;
			}
		},
		[provider, ensureAccount],
	);

	const signTypedDataV4 = useCallback(
		async (typedData: unknown): Promise<string> => {
			const currentAccount = await ensureAccount();

			try {
				const signature = (await provider!.provider.request({
					method: "eth_signTypedData_v4",
					params: [currentAccount, JSON.stringify(typedData)],
				})) as string;

				dismissLedgerModal();
				return signature;
			} catch (err) {
				dismissLedgerModal();
				throw err;
			}
		},
		[provider, ensureAccount],
	);

	const personalSign = useCallback(
		async (message: string): Promise<string> => {
			const currentAccount = await ensureAccount();

			// Convert the human-readable message to a hex-encoded string for personal_sign
			const hexMessage = `0x${Array.from(new TextEncoder().encode(message))
				.map((b) => b.toString(16).padStart(2, "0"))
				.join("")}`;

			try {
				const signature = (await provider!.provider.request({
					method: "personal_sign",
					params: [hexMessage, currentAccount],
				})) as string;

				dismissLedgerModal();
				return signature;
			} catch (err) {
				dismissLedgerModal();
				throw err;
			}
		},
		[provider, ensureAccount],
	);

	// Memoize the context value to prevent unnecessary re-renders of consumers
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
		],
	);

	return (
		<LedgerContext.Provider value={contextValue}>
			{children}
		</LedgerContext.Provider>
	);
}

export function useLedger() {
	const ctx = useContext(LedgerContext);
	if (!ctx) {
		throw new Error("useLedger must be used within LedgerProvider");
	}
	return ctx;
}
