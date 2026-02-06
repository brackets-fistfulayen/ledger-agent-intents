/**
 * Agent Intents logo — shield + chevron-right.
 * Uses `currentColor` so it adapts to light/dark themes.
 */
export function AgentIntentsLogo({
	size = 28,
	className,
}: {
	size?: number;
	className?: string;
}) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 32 32"
			fill="none"
			width={size}
			height={size}
			className={className}
			aria-hidden="true"
		>
			{/* Shield outline */}
			<path
				d="M16 2L4 8v8c0 8 5.33 15.47 12 17 6.67-1.53 12-9 12-17V8L16 2z"
				stroke="currentColor"
				strokeWidth="1.5"
				fill="currentColor"
				fillOpacity="0.08"
			/>
			{/* Chevron-right — intent / action */}
			<path
				d="M13 11l5 5-5 5"
				stroke="currentColor"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
