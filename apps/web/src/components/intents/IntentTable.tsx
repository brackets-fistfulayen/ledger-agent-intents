import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { encodeERC20Transfer } from "@/lib/erc20";
import { useLedger } from "@/lib/ledger-provider";
import { cn, formatAddress } from "@/lib/utils";
import {
	parseEip155ChainId,
	validateX402ForSigning,
	isValidEvmAddress,
} from "@/lib/x402-validation";
import { useUpdateIntentStatus } from "@/queries/intents";
import {
	type Intent,
	SUPPORTED_CHAINS,
	SUPPORTED_TOKENS,
	type SupportedChainId,
	type X402PaymentPayload,
} from "@agent-intents/shared";
import { Button } from "@ledgerhq/lumen-ui-react";
import { useState } from "react";
import { verifyTypedData } from "viem";
import { IntentDetailDialog } from "./IntentDetailDialog";

function base64EncodeUtf8(input: string) {
	const bytes = new TextEncoder().encode(input);
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary);
}

function randomNonce32BytesHex() {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return `0x${Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")}`;
}

// =============================================================================
// Types
// =============================================================================

interface IntentTableProps {
	intents?: Intent[];
	isLoading?: boolean;
	isConnected?: boolean;
	className?: string;
}

interface IntentRowProps {
	intent: Intent;
	onSelectIntent: (intent: Intent) => void;
}

// =============================================================================
// Chain Logo Component
// =============================================================================

function ChainLogo({ chainId, className }: { chainId: number; className?: string }) {
	// Ethereum/Sepolia logo
	if (chainId === 11155111 || chainId === 1) {
		return (
			<div
				className={cn(
					"flex items-center justify-center size-32 rounded-full bg-[#627EEA]",
					className,
				)}
				title="Sepolia"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 256 417"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z"
						fill="white"
						fillOpacity="0.6"
					/>
					<path
						d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z"
						fill="white"
					/>
					<path
						d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z"
						fill="white"
						fillOpacity="0.6"
					/>
					<path
						d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z"
						fill="white"
					/>
				</svg>
			</div>
		);
	}

	// Base/Base Sepolia logo
	if (chainId === 84532 || chainId === 8453) {
		return (
			<div
				className={cn(
					"flex items-center justify-center size-32 rounded-full bg-[#0052FF]",
					className,
				)}
				title="Base Sepolia"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 111 111"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
						fill="white"
					/>
				</svg>
			</div>
		);
	}

	// Unknown chain fallback
	return (
		<div
			className={cn(
				"flex items-center justify-center size-32 rounded-full bg-muted body-4-semi-bold text-base",
				className,
			)}
			title={`Chain ${chainId}`}
		>
			?
		</div>
	);
}

// =============================================================================
// USDC Logo Component
// =============================================================================

function UsdcLogo({ className }: { className?: string }) {
	return (
		<svg
			className={cn("size-24 rounded-full", className)}
			viewBox="0 0 2000 2000"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
				fill="#2775ca"
			/>
			<path
				d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
				fill="#fff"
			/>
			<path
				d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
				fill="#fff"
			/>
		</svg>
	);
}

// =============================================================================
// Address Tooltip Component
// =============================================================================

function AddressWithTooltip({ address, children }: { address: string; children: React.ReactNode }) {
	return (
		<span className="relative group/tooltip">
			{children}
			<span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-8 hidden group-hover/tooltip:flex whitespace-nowrap rounded-sm bg-[#000000] px-12 py-6 font-mono body-3 text-[#FFFFFF] shadow-lg z-50">
				{address}
			</span>
		</span>
	);
}

// =============================================================================
// Table Header Component
// =============================================================================

function TableHeader() {
	return (
		<thead>
			<tr className="border-b border-muted">
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					Intent ID
				</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					From
				</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					To
				</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					Amount
				</th>
			<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
				Created At
			</th>
			<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
				Status
			</th>
				<th className="py-12 px-24 text-left body-3-semi-bold text-muted">
					Actions
				</th>
			</tr>
		</thead>
	);
}

// =============================================================================
// Empty Row Component
// =============================================================================

function EmptyRow({ message }: { message: string }) {
	return (
		<tr>
			<td colSpan={7} className="py-64 px-24 text-center">
				<span className="body-1 text-muted">{message}</span>
			</td>
		</tr>
	);
}

// =============================================================================
// Loading Row Component
// =============================================================================

function LoadingRow() {
	return (
		<tr>
			<td colSpan={7} className="py-64 px-24 text-center">
				<div className="flex items-center justify-center gap-12">
					<Spinner size="lg" className="text-muted" />
					<span className="body-1 text-muted">Loading intents...</span>
				</div>
			</td>
		</tr>
	);
}

// =============================================================================
// Intent Row Component
// =============================================================================

function IntentRow({ intent, onSelectIntent }: IntentRowProps) {
	const { chainId: walletChainId, sendTransaction, signTypedDataV4, account } = useLedger();
	const updateStatus = useUpdateIntentStatus();

	const [isSigning, setIsSigning] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { details } = intent;
	const intentChainId = details.chainId as SupportedChainId;
	const chain = SUPPORTED_CHAINS[intentChainId];
	const isPending = intent.status === "pending";

	// Check chain mismatch - only if we know the wallet chain
	const isWrongChain = walletChainId !== null && walletChainId !== intentChainId;

	// Get token info
	const tokenInfo = SUPPORTED_TOKENS[intentChainId]?.[details.token];
	const tokenAddress =
		(details.tokenAddress as `0x${string}` | undefined) ??
		(tokenInfo?.address as `0x${string}` | undefined);
	const tokenDecimals = tokenInfo?.decimals ?? 6;
	const isX402 = !!details.x402?.accepted;

	// Shortened intent ID: first 8 chars + ... + last 4 chars
	const shortId = `${intent.id.slice(0, 8)}...${intent.id.slice(-4)}`;

	// ==========================================================================
	// Handlers
	// ==========================================================================

	const handleSign = async () => {
		setError(null);

		// x402 path: sign an EIP-712 authorization (EIP-3009)
		if (isX402) {
			if (!account) {
				setError("Connect your Ledger device to authorize this payment");
				return;
			}

			// Validate account address
			if (!isValidEvmAddress(account)) {
				setError("Invalid wallet address");
				return;
			}

			const x402 = details.x402;

			// Strong validation of x402 requirements
			const validation = validateX402ForSigning(x402?.resource, x402?.accepted);
			if (!validation.valid) {
				setError(validation.error ?? "Invalid x402 payment requirements");
				return;
			}

			// At this point x402, resource, and accepted are guaranteed to exist
			const resource = x402!.resource;
			const accepted = x402!.accepted;

			const chainId = parseEip155ChainId(accepted.network);
			if (!chainId) {
				setError(`Unsupported x402 network: ${accepted.network}`);
				return;
			}

			// Require wallet to be on the correct chain
			if (walletChainId === null) {
				setError("Wallet must be connected to sign");
				return;
			}
			if (walletChainId !== chainId) {
				setError(
					`Switch to ${SUPPORTED_CHAINS[chainId as SupportedChainId]?.name ?? `Chain ${chainId}`} to authorize this API payment`,
				);
				return;
			}

			const nowSec = Math.floor(Date.now() / 1000);
			const timeout = accepted.maxTimeoutSeconds ?? 300; // 5 minutes default
			const authorization = {
				from: account,
				to: accepted.payTo,
				value: accepted.amount,
				validAfter: String(nowSec),
				validBefore: String(nowSec + timeout),
				nonce: randomNonce32BytesHex(),
			};

			// Build EIP-712 typed data for TransferWithAuthorization (EIP-3009)
			// Note: extra.name and extra.version are required (validated above)
			const domain = {
				name: accepted.extra!.name,
				version: accepted.extra!.version,
				chainId: BigInt(chainId),
				verifyingContract: accepted.asset as `0x${string}`,
			};

			const types = {
				TransferWithAuthorization: [
					{ name: "from", type: "address" },
					{ name: "to", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "validAfter", type: "uint256" },
					{ name: "validBefore", type: "uint256" },
					{ name: "nonce", type: "bytes32" },
				],
			} as const;

			const message = {
				from: account as `0x${string}`,
				to: accepted.payTo as `0x${string}`,
				value: BigInt(accepted.amount),
				validAfter: BigInt(authorization.validAfter),
				validBefore: BigInt(authorization.validBefore),
				nonce: authorization.nonce as `0x${string}`,
			};

			// Format for eth_signTypedData_v4 (includes EIP712Domain type)
			const typedDataForSign = {
				types: {
					EIP712Domain: [
						{ name: "name", type: "string" },
						{ name: "version", type: "string" },
						{ name: "chainId", type: "uint256" },
						{ name: "verifyingContract", type: "address" },
					],
					...types,
				},
				primaryType: "TransferWithAuthorization" as const,
				domain: {
					...domain,
					chainId: Number(domain.chainId),
				},
				message: {
					...authorization,
					value: authorization.value,
				},
			};

			setIsSigning(true);
			try {
				const signature = await signTypedDataV4(typedDataForSign);

				// Best-effort local verification – proceed even if it fails
				try {
					const isValid = await verifyTypedData({
						address: account as `0x${string}`,
						domain,
						types,
						primaryType: "TransferWithAuthorization",
						message,
						signature: signature as `0x${string}`,
					});

					if (!isValid) {
						console.warn("Local signature verification returned false – proceeding anyway");
					}
				} catch (verifyErr) {
					console.warn("Local signature verification failed:", verifyErr);
				}

				const paymentPayload: X402PaymentPayload = {
					x402Version: 2,
					resource,
					accepted,
					payload: { signature, authorization },
					extensions: {},
				};

				const paymentSignatureHeader = base64EncodeUtf8(JSON.stringify(paymentPayload));

				await updateStatus.mutateAsync({
					id: intent.id,
					status: "authorized", // x402 payment authorized
					paymentSignatureHeader,
					paymentPayload,
				});
			} catch (err) {
				const message = err instanceof Error ? err.message : "Signature failed";
				const lowerMessage = message.toLowerCase();
				const isUserRejection =
					lowerMessage.includes("reject") ||
					lowerMessage.includes("cancel") ||
					lowerMessage.includes("denied") ||
					lowerMessage.includes("user");
				if (isUserRejection) {
					setError("Authorization cancelled");
				} else {
					setError(message);
				}
			} finally {
				setIsSigning(false);
			}

			return;
		}

		// Check chain mismatch for standard transfers
		if (isWrongChain) {
			setError(`Please switch to ${chain?.name ?? "the correct network"} to sign`);
			return;
		}

		if (!tokenAddress) {
			setError(`Unknown token address for ${details.token}`);
			return;
		}

		const encodeResult = encodeERC20Transfer(
			details.recipient as `0x${string}`,
			details.amount,
			tokenDecimals,
		);

		if (!encodeResult.success) {
			setError(encodeResult.error);
			return;
		}

		setIsSigning(true);

		try {
			const txHash = await sendTransaction({
				to: tokenAddress,
				data: encodeResult.data,
				value: "0x0",
			});

			await updateStatus.mutateAsync({
				id: intent.id,
				status: "broadcasting",
				txHash,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : "Transaction failed";

			// Check if this is a user-initiated cancellation (not a real failure)
			// This includes: rejecting on device, closing modal, cancelling action
			const lowerMessage = message.toLowerCase();
			const isUserRejection =
				lowerMessage.includes("reject") ||
				lowerMessage.includes("cancel") ||
				lowerMessage.includes("denied") ||
				lowerMessage.includes("closed") ||
				lowerMessage.includes("close") ||
				lowerMessage.includes("user") ||
				lowerMessage.includes("abort");

			if (!isUserRejection) {
				try {
					await updateStatus.mutateAsync({
						id: intent.id,
						status: "failed",
						note: message,
					});
				} catch {
					// Ignore status update failure
				}
			}

			setError(message);
		} finally {
			setIsSigning(false);
		}
	};

	const handleReject = async () => {
		setError(null);
		setIsRejecting(true);

		try {
			await updateStatus.mutateAsync({
				id: intent.id,
				status: "rejected",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to reject");
		} finally {
			setIsRejecting(false);
		}
	};

	// ==========================================================================
	// Render
	// ==========================================================================

	const handleRowClick = () => {
		onSelectIntent(intent);
	};

	return (
		<>
			<tr
				className="group border-b border-muted-subtle last:border-b-0 transition-colors hover:bg-muted-transparent cursor-pointer"
				onClick={handleRowClick}
			>
				{/* Intent ID */}
				<td className="py-20 px-24">
					<div className="flex items-center gap-8">
						<code className="font-mono body-2 text-muted" title={intent.id}>{shortId}</code>
						<span className="body-2 text-base">{intent.agentName}</span>
					</div>
				</td>

		{/* From */}
		<td className="py-20 px-24">
			{account ? (
				<AddressWithTooltip address={account}>
					<code className="font-mono body-2 text-base cursor-default">
						{formatAddress(account)}
					</code>
				</AddressWithTooltip>
			) : (
				<span className="body-2 text-muted">—</span>
			)}
		</td>

		{/* To */}
		<td className="py-20 px-24">
			<div className="flex flex-col gap-2">
				<AddressWithTooltip address={details.recipient}>
					<code className="font-mono body-2 text-base cursor-default">
						{formatAddress(details.recipient)}
					</code>
				</AddressWithTooltip>
				{details.recipientEns && (
					<span className="body-3 text-muted">{details.recipientEns}</span>
				)}
			</div>
		</td>

			{/* Amount */}
			<td className="py-20 px-24">
				<div className="flex items-center gap-8">
					<span className="body-1-semi-bold text-base">
						{details.amount} {details.token}
					</span>
					{details.token === "USDC" && <UsdcLogo />}
				</div>
			</td>

	{/* Created At */}
		<td className="py-20 px-24">
			<div className="flex flex-col">
				<span className="body-2 text-base">
					{new Date(intent.createdAt).toLocaleDateString(undefined, {
						year: "numeric",
						month: "short",
						day: "numeric",
					})}
				</span>
				<span className="body-3 text-muted">
					{new Date(intent.createdAt).toLocaleTimeString(undefined, {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>
		</td>

			{/* Status */}
				<td className="py-20 px-24">
					<StatusBadge status={intent.status} />
				</td>

				{/* Actions */}
				<td className="py-20 px-24" onClick={(e) => e.stopPropagation()}>
					{isPending ? (
						<div className="flex items-center gap-12">
							<Button
								appearance="base"
								size="sm"
								onClick={handleSign}
								disabled={isSigning || isRejecting || updateStatus.isPending}
							>
								{isSigning ? <Spinner size="sm" /> : "Sign"}
							</Button>
							<Button
								appearance="gray"
								size="sm"
								onClick={handleReject}
								disabled={isSigning || isRejecting || updateStatus.isPending}
							>
								{isRejecting ? <Spinner size="sm" /> : "Reject"}
							</Button>
							{isWrongChain && (
								<span className="body-3 text-warning">
									({chain?.name ?? "Wrong network"})
								</span>
							)}
						</div>
					) : intent.txUrl ? (
						<a
							href={intent.txUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="body-3 text-interactive hover:text-interactive-hover hover:underline"
						>
							View tx ↗
						</a>
					) : (
						<span className="body-3 text-muted-subtle">—</span>
					)}
				</td>
			</tr>

			{/* Error row */}
			{error && (
				<tr>
					<td colSpan={7} className="px-24 pb-16">
						<div className="rounded-sm bg-error-transparent px-16 py-10 body-2 text-error">
							{error}
						</div>
					</td>
				</tr>
			)}
		</>
	);
}

// =============================================================================
// Intent Table Component
// =============================================================================

export function IntentTable({
	intents,
	isLoading = false,
	isConnected = false,
	className,
}: IntentTableProps) {
	const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleSelectIntent = (intent: Intent) => {
		setSelectedIntent(intent);
		setIsDialogOpen(true);
	};

	const handleDialogClose = (open: boolean) => {
		setIsDialogOpen(open);
		if (!open) {
			setSelectedIntent(null);
		}
	};

	// Determine what to show in the table body
	const renderTableBody = () => {
		// Loading state
		if (isLoading) {
			return <LoadingRow />;
		}

		// Not connected - show empty table
		if (!isConnected) {
			return <EmptyRow message="Connect your Ledger to view intents" />;
		}

		// Connected but no intents
		if (!intents || intents.length === 0) {
			return <EmptyRow message="No intent yet" />;
		}

		// Show intents
		return intents.map((intent) => (
			<IntentRow key={intent.id} intent={intent} onSelectIntent={handleSelectIntent} />
		));
	};

	return (
		<>
			<div className={cn("rounded-xl bg-muted-transparent overflow-hidden w-full", className)}>
				<div className="overflow-x-auto">
					<table className="w-full table-auto">
						<TableHeader />
						<tbody>{renderTableBody()}</tbody>
					</table>
				</div>
			</div>

			<IntentDetailDialog
				intent={selectedIntent}
				open={isDialogOpen}
				onOpenChange={handleDialogClose}
			/>
		</>
	);
}
