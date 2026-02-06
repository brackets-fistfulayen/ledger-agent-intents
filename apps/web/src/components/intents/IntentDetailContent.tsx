import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { encodeERC20Transfer } from "@/lib/erc20";
import { useLedger } from "@/lib/ledger-provider";
import { cn, formatAddress, formatTimeAgo } from "@/lib/utils";
import {
	parseEip155ChainId,
	validateX402ForSigning,
	isValidEvmAddress,
	formatAtomicAmount,
	extractDomain,
	checkUsdcBalance,
} from "@/lib/x402-validation";
import { useUpdateIntentStatus } from "@/queries/intents";
import {
	type Intent,
	SUPPORTED_CHAINS,
	SUPPORTED_TOKENS,
	type SupportedChainId,
	type X402PaymentPayload,
} from "@agent-intents/shared";
import { Button, Tag } from "@ledgerhq/lumen-ui-react";
import { Copy, Check } from "@ledgerhq/lumen-ui-react/symbols";
import { useState } from "react";
import { verifyTypedData } from "viem";

// =============================================================================
// Types
// =============================================================================

interface IntentDetailContentProps {
	intent: Intent;
}

interface IntentActionsProps {
	intent: Intent;
	onClose: () => void;
}

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
// Chain Logo Component (reused from IntentTable)
// =============================================================================

function ChainLogo({ chainId, className }: { chainId: number; className?: string }) {
	if (chainId === 11155111 || chainId === 1) {
		return (
			<div
				className={cn(
					"flex items-center justify-center size-24 rounded-full bg-[#627EEA]",
					className,
				)}
				title="Ethereum"
			>
				<svg
					width="12"
					height="12"
					viewBox="0 0 256 417"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z"
						fill="white"
						fillOpacity="0.6"
					/>
					<path d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z" fill="white" />
					<path
						d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z"
						fill="white"
						fillOpacity="0.6"
					/>
					<path d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z" fill="white" />
				</svg>
			</div>
		);
	}

	if (chainId === 84532 || chainId === 8453) {
		return (
			<div
				className={cn(
					"flex items-center justify-center size-24 rounded-full bg-[#0052FF]",
					className,
				)}
				title="Base"
			>
				<svg
					width="12"
					height="12"
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

	return (
		<div
			className={cn(
				"flex items-center justify-center size-24 rounded-full bg-muted body-4-semi-bold text-base",
				className,
			)}
			title={`Chain ${chainId}`}
		>
			?
		</div>
	);
}

// =============================================================================
// Copy Button Component
// =============================================================================

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="p-6 rounded-sm hover:bg-muted-transparent transition-colors"
			title="Copy address"
		>
			{copied ? (
				<Check className="size-16 text-success" />
			) : (
				<Copy className="size-16 text-muted" />
			)}
		</button>
	);
}

// =============================================================================
// Category Badge Component
// =============================================================================

function CategoryBadge({ category }: { category: string }) {
	const labels: Record<string, string> = {
		api_payment: "API Payment",
		subscription: "Subscription",
		purchase: "Purchase",
		p2p_transfer: "P2P Transfer",
		defi: "DeFi",
		bill_payment: "Bill Payment",
		donation: "Donation",
		other: "Other",
	};

	return (
		<Tag appearance="gray" size="sm" label={labels[category] ?? category} />
	);
}

// =============================================================================
// Urgency Badge Component
// =============================================================================

function UrgencyBadge({ urgency }: { urgency: string }) {
	const appearances: Record<string, "gray" | "warning" | "error"> = {
		low: "gray",
		normal: "gray",
		high: "warning",
		critical: "error",
	};

	if (urgency === "low" || urgency === "normal") return null;

	return (
		<Tag
			appearance={appearances[urgency] ?? "gray"}
			size="sm"
			label={`${urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority`}
		/>
	);
}

// =============================================================================
// Hero Section Component
// =============================================================================

function HeroSection({ intent }: { intent: Intent }) {
	const { details } = intent;
	const isX402 = !!details.x402?.accepted;
	
	// For x402, derive chain from the x402 network
	const x402ChainId = isX402 ? parseEip155ChainId(details.x402?.accepted?.network ?? "") : null;
	const effectiveChainId = (isX402 && x402ChainId ? x402ChainId : details.chainId) as SupportedChainId;
	const chain = SUPPORTED_CHAINS[effectiveChainId];
	
	// Format amount - for x402 use atomic amount conversion
	let displayAmount = details.amount;
	let displayToken = details.token;
	if (isX402 && details.x402?.accepted) {
		const accepted = details.x402.accepted;
		// USDC has 6 decimals
		displayAmount = formatAtomicAmount(accepted.amount, 6);
		displayToken = "USDC"; // x402 EVM exact scheme uses USDC
	}

	return (
		<div className="flex flex-col items-center gap-8 py-16">
			{/* Label for x402 API payments */}
			{isX402 && (
				<div className="body-3-semi-bold text-interactive uppercase tracking-wide">
					API Payment
				</div>
			)}
			<div className="heading-2-semi-bold text-base">
				{displayAmount} {displayToken}
			</div>
			<div className="flex items-center gap-8">
				<ChainLogo chainId={effectiveChainId} />
				<span className="body-2 text-muted">on {chain?.name ?? `Chain ${effectiveChainId}`}</span>
			</div>
			<div className="flex items-center gap-8 mt-8">
				<StatusBadge status={intent.status} />
				<UrgencyBadge urgency={intent.urgency} />
			</div>
		</div>
	);
}

// =============================================================================
// Recipient Section Component
// =============================================================================

function RecipientSection({ intent }: { intent: Intent }) {
	const { details } = intent;

	return (
		<div className="rounded-lg bg-muted-transparent p-16">
			<div className="body-3 text-muted mb-6">To</div>
			<div className="flex items-center justify-between gap-8">
			<div className="flex flex-col gap-2 min-w-0">
				<code className="font-mono body-2 text-base break-all">
					{details.recipient}
				</code>
				{details.recipientEns && (
					<span className="body-3 text-muted">{details.recipientEns}</span>
				)}
			</div>
			<CopyButton text={details.recipient} />
		</div>
		</div>
	);
}

// =============================================================================
// X402 Payment Details Section Component
// =============================================================================

function X402PaymentSection({ intent }: { intent: Intent }) {
	const { details } = intent;
	const x402 = details.x402;
	
	if (!x402?.accepted || !x402?.resource) return null;
	
	const resource = x402.resource;
	const accepted = x402.accepted;
	const chainId = parseEip155ChainId(accepted.network);
	const chain = chainId ? SUPPORTED_CHAINS[chainId as SupportedChainId] : null;
	const domain = extractDomain(resource.url);
	
	return (
		<div className="rounded-lg bg-interactive/5 p-16 flex flex-col gap-12">
			<div className="flex items-center gap-8">
				<div className="size-8 rounded-full bg-interactive" />
				<span className="body-2-semi-bold text-interactive">x402 Payment Details</span>
			</div>
			
			{/* Resource/API Endpoint */}
			<div className="flex flex-col gap-4">
				<span className="body-3 text-muted">API Endpoint</span>
				<div className="flex items-center justify-between gap-8">
					<code className="font-mono body-2 text-base truncate flex-1" title={resource.url}>
						{domain}
					</code>
					<CopyButton text={resource.url} />
				</div>
			</div>
			
		{/* Payment Recipient */}
		<div className="flex flex-col gap-4">
			<span className="body-3 text-muted">Payment Recipient</span>
			<div className="flex items-center justify-between gap-8">
				<code className="font-mono body-2 text-base break-all">
					{accepted.payTo}
				</code>
				<CopyButton text={accepted.payTo} />
			</div>
		</div>
			
			{/* Network */}
			<div className="flex items-center justify-between">
				<span className="body-3 text-muted">Network</span>
				<div className="flex items-center gap-6">
					{chainId && <ChainLogo chainId={chainId} className="size-16" />}
					<span className="body-2 text-base">{chain?.name ?? accepted.network}</span>
				</div>
			</div>
			
			{/* Payment Scheme */}
			<div className="flex items-center justify-between">
				<span className="body-3 text-muted">Scheme</span>
				<Tag appearance="gray" size="sm" label={`EIP-3009 ${accepted.scheme}`} />
			</div>
			
			{/* Authorization validity info */}
			{accepted.maxTimeoutSeconds && (
				<div className="border-t border-muted-subtle pt-12">
					<div className="body-3 text-muted">
						Authorization valid for {Math.floor(accepted.maxTimeoutSeconds / 60)} minute{accepted.maxTimeoutSeconds >= 120 ? 's' : ''}
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Settlement Receipt Section Component (x402)
// =============================================================================

function SettlementReceiptSection({ intent }: { intent: Intent }) {
	const { details } = intent;
	const receipt = details.x402?.settlementReceipt;
	
	if (!receipt) return null;
	
	const chainId = receipt.network ? parseEip155ChainId(receipt.network) : null;
	const chain = chainId ? SUPPORTED_CHAINS[chainId as SupportedChainId] : null;
	
	return (
		<div className={cn(
			"rounded-lg p-16 flex flex-col gap-12",
			receipt.success
				? "border border-success/30 bg-success/5"
				: "border border-error/30 bg-error/5"
		)}>
			<div className="flex items-center gap-8">
				<div className={cn(
					"size-8 rounded-full",
					receipt.success ? "bg-success" : "bg-error"
				)} />
				<span className={cn(
					"body-2-semi-bold",
					receipt.success ? "text-success" : "text-error"
				)}>
					{receipt.success ? "Payment Settled" : "Settlement Failed"}
				</span>
			</div>
			
			{/* Transaction hash */}
			{receipt.txHash && (
				<div className="flex flex-col gap-4">
					<span className="body-3 text-muted">Transaction</span>
					<div className="flex items-center justify-between gap-8">
						<code className="font-mono body-2 text-base">
							{formatAddress(receipt.txHash)}
						</code>
						<CopyButton text={receipt.txHash} />
					</div>
				</div>
			)}
			
			{/* Network */}
			{chain && (
				<div className="flex items-center justify-between">
					<span className="body-3 text-muted">Network</span>
					<div className="flex items-center gap-6">
						{chainId && <ChainLogo chainId={chainId} className="size-16" />}
						<span className="body-2 text-base">{chain.name}</span>
					</div>
				</div>
			)}
			
			{/* Block number */}
			{receipt.blockNumber && (
				<div className="flex items-center justify-between">
					<span className="body-3 text-muted">Block</span>
					<span className="body-2 text-base font-mono">{receipt.blockNumber}</span>
				</div>
			)}
			
			{/* Settled at */}
			{receipt.settledAt && (
				<div className="flex items-center justify-between">
					<span className="body-3 text-muted">Settled</span>
					<span className="body-2 text-base">{formatTimeAgo(receipt.settledAt)}</span>
				</div>
			)}
			
			{/* Error message */}
			{receipt.error && (
				<div className="border-t border-error/30 pt-12">
					<p className="body-3 text-error">{receipt.error}</p>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Merchant Section Component
// =============================================================================

function MerchantSection({ intent }: { intent: Intent }) {
	const { details } = intent;
	const { merchant, category, memo } = details;

	if (!merchant && !category && !memo) return null;

	return (
		<div className="rounded-lg bg-muted-transparent p-16 flex flex-col gap-12">
			{merchant && (
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-12">
						{merchant.logo ? (
							<img
								src={merchant.logo}
								alt={merchant.name}
								className="size-32 rounded-full"
							/>
						) : (
							<div className="size-32 rounded-full bg-muted flex items-center justify-center body-3-semi-bold text-muted">
								{merchant.name.charAt(0)}
							</div>
						)}
						<span className="body-1-semi-bold text-base">{merchant.name}</span>
					</div>
					{merchant.verified && (
						<Tag appearance="success" size="sm" label="Verified" />
					)}
				</div>
			)}

			{category && (
				<div className="flex items-center gap-8">
					<CategoryBadge category={category} />
				</div>
			)}

			{memo && (
				<div className="border-t border-muted-subtle pt-12">
					<p className="body-2 text-muted italic">"{memo}"</p>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Agent Section Component
// =============================================================================

function AgentSection({ intent }: { intent: Intent }) {
	const { details } = intent;

	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-8">
					<div className="size-24 rounded-full bg-interactive flex items-center justify-center">
						<span className="body-4-semi-bold text-on-interactive">
							{intent.agentName.charAt(0)}
						</span>
					</div>
					<span className="body-2 text-base">{intent.agentName}</span>
				</div>
				<span className="body-3 text-muted">{formatTimeAgo(intent.createdAt)}</span>
			</div>

			{details.resource && (
				<div className="body-3 text-muted truncate" title={details.resource}>
					Resource: {details.resource}
				</div>
			)}

			{intent.expiresAt && (
				<div className="body-3 text-warning">
					Expires {formatTimeAgo(intent.expiresAt)}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Technical Details Section Component
// =============================================================================

function TechnicalDetailsSection({ intent }: { intent: Intent }) {
	const [isExpanded, setIsExpanded] = useState(false);
	const { details } = intent;

	const tokenInfo = SUPPORTED_TOKENS[details.chainId as SupportedChainId]?.[details.token];
	const tokenAddress =
		(details.tokenAddress as string | undefined) ?? tokenInfo?.address;

	return (
		<div className="border-t border-muted-subtle pt-16">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center gap-8 body-3-semi-bold text-muted hover:text-base transition-colors w-full"
			>
				<span className={cn("transition-transform", isExpanded && "rotate-90")}>▶</span>
				Technical Details
			</button>

			{isExpanded && (
			<div className="mt-12 flex flex-col gap-8 body-3 text-muted">
				<div className="flex flex-col gap-4">
					<span>Intent ID</span>
					<code className="font-mono text-base break-all">{intent.id}</code>
				</div>
				{tokenAddress && (
					<div className="flex flex-col gap-4">
						<span>Token Contract</span>
						<code className="font-mono text-base break-all">{tokenAddress}</code>
					</div>
				)}
					<div className="flex justify-between">
						<span>Agent ID</span>
						<code className="font-mono text-base">{intent.agentId}</code>
					</div>
				{intent.statusHistory.length > 0 && (
					<div className="flex flex-col gap-4 mt-8">
						<span className="body-3-semi-bold">Timeline</span>
						{intent.statusHistory.map((entry, idx) => {
							const date = new Date(entry.timestamp);
							const formatted = `${date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
							const label =
								entry.status === "pending"
									? "Created"
									: entry.status === "broadcasting" || entry.status === "confirmed"
										? "Broadcasted"
										: entry.status === "authorized"
											? "Authorized"
											: entry.status === "rejected"
												? "Rejected"
												: entry.status === "failed"
													? "Failed"
													: entry.status.charAt(0).toUpperCase() + entry.status.slice(1);
							return (
								<div key={idx} className="flex justify-between text-muted">
									<span>{label}</span>
									<span className="font-mono">{formatted}</span>
								</div>
							);
						})}
					</div>
				)}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Actions Component
// =============================================================================

function IntentActions({ intent, onClose }: IntentActionsProps) {
	const { chainId: walletChainId, sendTransaction, signTypedDataV4, account } = useLedger();
	const updateStatus = useUpdateIntentStatus();

	const [isSigning, setIsSigning] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { details } = intent;
	const intentChainId = details.chainId as SupportedChainId;
	const chain = SUPPORTED_CHAINS[intentChainId];
	const isWrongChain = walletChainId !== null && walletChainId !== intentChainId;
	const isPending = intent.status === "pending";

	const tokenInfo = SUPPORTED_TOKENS[intentChainId]?.[details.token];
	const tokenAddress =
		(details.tokenAddress as `0x${string}` | undefined) ??
		(tokenInfo?.address as `0x${string}` | undefined);
	const tokenDecimals = tokenInfo?.decimals ?? 6;
	const isX402 = !!details.x402?.accepted;

	// Compute x402 chain ID for proper chain mismatch detection
	const x402ChainId = isX402 ? parseEip155ChainId(details.x402?.accepted?.network ?? "") : null;
	const effectiveChainId = isX402 && x402ChainId ? x402ChainId : intentChainId;
	const effectiveChain = SUPPORTED_CHAINS[effectiveChainId as SupportedChainId];
	const isEffectiveWrongChain = walletChainId !== null && walletChainId !== effectiveChainId;

	const handleSign = async () => {
		setError(null);

		// x402 path: sign an EIP-712 authorization (EIP-3009), then store PAYMENT-SIGNATURE header.
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

			// Pre-sign USDC balance check: avoid wasting a Ledger interaction if
			// the user doesn't have enough USDC to cover the payment.
			const balanceError = await checkUsdcBalance(
				account,
				accepted.asset,
				accepted.amount,
				chainId,
			);
			if (balanceError) {
				setError(balanceError);
				return;
			}

			const nowSec = Math.floor(Date.now() / 1000);
			const timeout = accepted.maxTimeoutSeconds ?? 300; // Increase default to 5 minutes
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
					chainId: Number(domain.chainId), // JSON serialization needs number
				},
				message: {
					...authorization,
					value: authorization.value, // Keep as string for JSON
				},
			};

			setIsSigning(true);
			try {
				const signature = await signTypedDataV4(typedDataForSign);

				// Best-effort local verification – if it fails (e.g. non-standard
				// signature encoding from the device) we still proceed because the
				// on-chain contract will enforce the real check.
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

			// Compute expiry from validBefore (Unix seconds -> ISO string)
			const expiresAt = new Date(Number(authorization.validBefore) * 1000).toISOString();

			await updateStatus.mutateAsync({
				id: intent.id,
				status: "authorized", // x402 payment authorized
				paymentSignatureHeader,
				paymentPayload,
				expiresAt,
			});

				onClose();
			} catch (err) {
				const message = err instanceof Error ? err.message : "Signature failed";
				// Check for user rejection
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
				status: "signed",
				txHash,
			});

			onClose();
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
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to reject");
		} finally {
			setIsRejecting(false);
		}
	};

	if (!isPending) {
		return (
			<Button appearance="base" onClick={onClose} isFull>
				Close
			</Button>
		);
	}

	return (
		<div className="flex flex-col gap-12 w-full">
			{error && (
				<div className="rounded-sm bg-error-transparent px-12 py-8 body-3 text-error">
					{error}
				</div>
			)}

		{/* Chain mismatch warning - use effective chain for x402 */}
		{isEffectiveWrongChain && (
			<div className="rounded-sm bg-warning-transparent px-12 py-8 body-3 text-warning">
				Switch to {effectiveChain?.name ?? "the correct network"} to {isX402 ? "authorize" : "sign"}
			</div>
		)}

		<div className="flex gap-12 w-full">
			<Button
				appearance="gray"
				onClick={handleReject}
				disabled={isSigning || isRejecting}
				isFull
			>
				{isRejecting ? <Spinner size="sm" /> : "Reject"}
			</Button>
			<Button
				appearance="base"
				onClick={handleSign}
				disabled={isSigning || isRejecting || isEffectiveWrongChain}
				isFull
			>
				{isSigning ? (
					<Spinner size="sm" />
				) : isX402 ? (
					"Authorize"
				) : (
					"Sign with Ledger"
				)}
			</Button>
		</div>
	</div>
);
}

// =============================================================================
// Main Content Component
// =============================================================================

export function IntentDetailContent({ intent }: IntentDetailContentProps) {
	const isX402 = !!intent.details.x402?.accepted;
	const hasSettlementReceipt = !!intent.details.x402?.settlementReceipt;
	
	return (
		<div className="flex flex-col gap-16">
			<HeroSection intent={intent} />
			{/* Show settlement receipt if available (for confirmed x402 payments) */}
			{hasSettlementReceipt && <SettlementReceiptSection intent={intent} />}
			{/* Show x402 payment details for API payments, recipient for standard transfers */}
			{isX402 ? (
				<X402PaymentSection intent={intent} />
			) : (
				<RecipientSection intent={intent} />
			)}
			<MerchantSection intent={intent} />
			<AgentSection intent={intent} />
			<TechnicalDetailsSection intent={intent} />
		</div>
	);
}

// Attach Actions as a static property for use in DialogFooter
IntentDetailContent.Actions = IntentActions;
