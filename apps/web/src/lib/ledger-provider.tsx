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
	openLedgerModal: () => void;
}

const LedgerContext = createContext<LedgerContextType | null>(null);

// Module-level singleton to prevent re-initialization during HMR
let ledgerInitialized = false;
let ledgerCleanupFn: (() => void) | undefined;
let ledgerAppReady = false;

export function LedgerProvider({ children }: { children: ReactNode }) {
	const [provider, setProvider] = useState<EIP6963ProviderDetail | null>(null);
	const [account, setAccount] = useState<string | null>(null);
	const [chainId, setChainId] = useState<number | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Track the provider UUID to avoid re-setting state for the same provider
	const providerUuidRef = useRef<string | null>(null);

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
						loggerLevel: "info",
						devConfig: {
							stub: {
								dAppConfig: true,
							},
						},
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
	}, []);

	// Listen for account/chain changes
	useEffect(() => {
		if (!provider?.provider.on) return;

		const handleAccountsChanged = (accounts: unknown) => {
			const accts = accounts as string[];
			setAccount(accts[0] || null);
		};

		const handleChainChanged = (chainIdHex: unknown) => {
			setChainId(Number.parseInt(chainIdHex as string, 16));
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
			const accounts = (await provider.provider.request({
				method: "eth_requestAccounts",
				params: [],
			})) as string[];

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
				console.warn("Ledger modal could not be opened - app not ready");
			}, 3000);
		}
	}, []);

	const sendTransaction = useCallback(
		async (tx: TransactionRequest): Promise<string> => {
			if (!provider) throw new Error("No provider available");
			if (!account) throw new Error("Not connected");

			const txHash = (await provider.provider.request({
				method: "eth_sendTransaction",
				params: [
					{
						from: account,
						to: tx.to,
						data: tx.data,
						value: tx.value || "0x0",
					},
				],
			})) as string;

			return txHash;
		},
		[provider, account],
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
			openLedgerModal,
		}),
		[account, chainId, isConnecting, error, connect, disconnect, sendTransaction, openLedgerModal],
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
