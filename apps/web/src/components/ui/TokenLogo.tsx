import { cn } from "@/lib/utils";
import { useState } from "react";

const CRYPTO_ICONS_BASE_URL = "https://crypto-icons.ledger.com/";

interface TokenLogoProps {
	ticker: string;
	className?: string;
	size?: number;
}

export function TokenLogo({ ticker, className, size = 24 }: TokenLogoProps) {
	const [hasError, setHasError] = useState(false);
	const upperTicker = ticker.toUpperCase();

	if (hasError || !ticker) {
		return (
			<div
				className={cn(
					"flex items-center justify-center rounded-full bg-muted body-4-semi-bold text-base",
					className,
				)}
				style={{ width: size, height: size }}
				title={upperTicker}
			>
				{upperTicker.charAt(0) || "?"}
			</div>
		);
	}

	return (
		<div
			className={cn("flex items-center justify-center overflow-hidden rounded-full", className)}
			style={{ width: size, height: size }}
		>
			<img
				src={`${CRYPTO_ICONS_BASE_URL}${upperTicker}.png`}
				alt={upperTicker}
				className="h-full w-full object-cover"
				onError={() => setHasError(true)}
			/>
		</div>
	);
}
