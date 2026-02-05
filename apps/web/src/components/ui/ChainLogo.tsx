import { cn } from "@/lib/utils";

const CRYPTO_ICONS_BASE_URL = "https://crypto-icons.ledger.com/";

// Map EVM chainId to Ledger icon filename
const CHAIN_ID_TO_ICON: Record<number, string> = {
	// Ethereum
	1: "ETH.png",
	11155111: "ETH.png", // Sepolia
	// BNB Smart Chain
	56: "BNB.png",
	97: "BNB.png", // BSC Testnet
	// Base
	8453: "BASE.png",
	84532: "BASE.png", // Base Sepolia
	// Arbitrum
	42161: "ARB.png",
	421614: "ARB.png", // Arbitrum Sepolia
	// Optimism
	10: "OP.png",
	11155420: "OP.png", // Optimism Sepolia
	// Polygon
	137: "MATIC.png",
	80002: "MATIC.png", // Polygon Amoy
	// zkSync
	324: "ZKSYNC.png",
	300: "ZKSYNC.png", // zkSync Sepolia
	// Linea
	59144: "LINEA.png",
	59141: "LINEA.png", // Linea Sepolia
	// Scroll
	534352: "SCROLL.png",
	534351: "SCROLL.png", // Scroll Sepolia
	// Blast
	81457: "BLAST.png",
	168587773: "BLAST.png", // Blast Sepolia
	// Avalanche
	43114: "AVAX.png",
	43113: "AVAX.png", // Fuji Testnet
	// Fantom
	250: "FTM.png",
	4002: "FTM.png", // Fantom Testnet
	// Cronos
	25: "CRO.png",
	338: "CRO.png", // Cronos Testnet
};

interface ChainLogoProps {
	chainId: number | null;
	className?: string;
	size?: number;
}

export function ChainLogo({ chainId, className, size = 24 }: ChainLogoProps) {
	// No chainId, don't render
	if (chainId === null) {
		return null;
	}

	const iconFilename = CHAIN_ID_TO_ICON[chainId];
	
	// Use Ledger crypto icons CDN
	if (iconFilename) {
		return (
			<div
				className={cn(
					"flex items-center justify-center overflow-hidden rounded-full",
					className,
				)}
				style={{ width: size, height: size }}
			>
				<img
					src={`${CRYPTO_ICONS_BASE_URL}${iconFilename}`}
					alt={`Chain ${chainId}`}
					className="h-full w-full object-cover"
				/>
			</div>
		);
	}

	// Fallback for unknown chains
	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-full bg-muted body-4-semi-bold text-base",
				className,
			)}
			style={{ width: size, height: size }}
			title={`Chain ${chainId}`}
		>
			?
		</div>
	);
}
