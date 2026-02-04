import { useEffect, useRef, useMemo } from "react";

interface NebulaAvatarProps {
	/** Size in pixels */
	size?: number;
	/** Seed string to generate deterministic avatar (e.g. wallet address) */
	seed?: string;
	/** Optional className for the canvas */
	className?: string;
}

/**
 * Derives a deterministic color gradient from a seed string (e.g. wallet address)
 * Returns two HSL colors that are visually distinct but harmonious
 */
function deriveColorsFromSeed(seed: string): { colorA: string; colorB: string } {
	// Create a hash from the seed
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Use different parts of the hash for different color properties
	const hue1 = Math.abs(hash % 360);
	// Offset second hue by 40-80 degrees for a harmonious but distinct pairing
	const hueOffset = 40 + Math.abs((hash >> 8) % 40);
	const hue2 = (hue1 + hueOffset) % 360;

	// Very high saturation for flashy colors (85-100%)
	const saturation1 = 85 + Math.abs((hash >> 12) % 15);
	const saturation2 = 85 + Math.abs((hash >> 16) % 15);

	// High lightness for bright, flashy colors (60-75%)
	const lightness1 = 60 + Math.abs((hash >> 20) % 15);
	const lightness2 = 60 + Math.abs((hash >> 24) % 15);

	return {
		colorA: `hsl(${hue1}, ${saturation1}%, ${lightness1}%)`,
		colorB: `hsl(${hue2}, ${saturation2}%, ${lightness2}%)`,
	};
}

/**
 * Color interpolation helper - linearly interpolates between two HSL or RGB colors
 */
function lerpColor(a: string, b: string, t: number): string {
	// Parse HSL colors
	const parseHsl = (color: string) => {
		const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
		if (match) {
			return {
				type: "hsl" as const,
				h: Number.parseInt(match[1], 10),
				s: Number.parseInt(match[2], 10),
				l: Number.parseInt(match[3], 10),
			};
		}
		return null;
	};

	const hslA = parseHsl(a);
	const hslB = parseHsl(b);

	if (hslA && hslB) {
		// Interpolate in HSL space for smoother gradients
		const h = Math.round(hslA.h + (hslB.h - hslA.h) * t);
		const s = Math.round(hslA.s + (hslB.s - hslA.s) * t);
		const l = Math.round(hslA.l + (hslB.l - hslA.l) * t);
		return `hsl(${h}, ${s}%, ${l}%)`;
	}

	// Fallback for hex colors
	const parseHex = (hex: string) => {
		const h = hex.replace("#", "");
		return [
			Number.parseInt(h.slice(0, 2), 16),
			Number.parseInt(h.slice(2, 4), 16),
			Number.parseInt(h.slice(4, 6), 16),
		];
	};

	const [r1, g1, b1] = parseHex(a);
	const [r2, g2, b2] = parseHex(b);

	const r = Math.round(r1 + (r2 - r1) * t);
	const g = Math.round(g1 + (g2 - g1) * t);
	const bl = Math.round(b1 + (b2 - b1) * t);

	return `rgb(${r}, ${g}, ${bl})`;
}

/**
 * NebulaAvatar - A generative avatar with a nebula-like dot pattern
 * Creates a unique, deterministic avatar based on a seed string
 * Colors are automatically derived from the seed (e.g. wallet address)
 */
export function NebulaAvatar({
	size = 32,
	seed = "default",
	className,
}: NebulaAvatarProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Derive colors from the seed (memoized)
	const { colorA, colorB } = useMemo(() => deriveColorsFromSeed(seed), [seed]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Handle high DPI displays
		const dpr = window.devicePixelRatio || 1;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		ctx.scale(dpr, dpr);

		// Seeded random number generator
		let s = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
		const random = () => {
			s = (s * 9301 + 49297) % 233280;
			return s / 233280;
		};

		// Clear canvas
		ctx.clearRect(0, 0, size, size);

		// Create circular clip
		ctx.beginPath();
		ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
		ctx.clip();

		// Dark background
		ctx.fillStyle = "#0d0d14";
		ctx.fillRect(0, 0, size, size);

		// Draw nebula dots
		const numDots = 200;
		for (let i = 0; i < numDots; i++) {
			const angle = random() * Math.PI * 2;
			// Use sqrt for more uniform distribution within circle
			const radius = Math.sqrt(random()) * (size / 2) * 0.92;
			const x = size / 2 + radius * Math.cos(angle);
			const y = size / 2 + radius * Math.sin(angle);

			// Gradient based on distance from center
			const t = radius / (size / 2);
			const dotSize = 0.4 + random() * 0.8; // Bigger dots

			// Draw dot
			ctx.beginPath();
			ctx.arc(x, y, dotSize, 0, Math.PI * 2);
			ctx.fillStyle = lerpColor(colorA, colorB, t);
			ctx.globalAlpha = 0.6 + random() * 0.4;
			ctx.fill();
		}

		// Add larger accent dots for depth
		const numStars = 15;
		for (let i = 0; i < numStars; i++) {
			const angle = random() * Math.PI * 2;
			const radius = Math.sqrt(random()) * (size / 2) * 0.8;
			const x = size / 2 + radius * Math.cos(angle);
			const y = size / 2 + radius * Math.sin(angle);
			const t = radius / (size / 2);

			ctx.beginPath();
			ctx.arc(x, y, 0.8 + random() * 0.8, 0, Math.PI * 2); // Bigger accent dots
			ctx.fillStyle = lerpColor(colorA, colorB, t);
			ctx.globalAlpha = 0.8 + random() * 0.2;
			ctx.fill();
		}

		ctx.globalAlpha = 1;
	}, [size, seed, colorA, colorB]);

	return (
		<canvas
			ref={canvasRef}
			width={size}
			height={size}
			className={className}
			style={{
				width: size,
				height: size,
				borderRadius: "50%",
			}}
		/>
	);
}
