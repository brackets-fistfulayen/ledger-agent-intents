/**
 * Generate a 32x32 favicon.ico with the Agent Intents robot logo.
 * White on transparent — matches the dark-first brand.
 * No external dependencies — uses only Node built-ins.
 *
 * Run: node scripts/generate-favicon-ico.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIZE = 32;

// ── Draw a 32×32 BGRA pixel buffer ────────────────────────────────────

const pixels = Buffer.alloc(SIZE * SIZE * 4, 0); // transparent black

function setPixel(x, y, r, g, b, a = 255) {
	if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
	const i = (y * SIZE + x) * 4;
	// Only overwrite if higher alpha (avoids erasing previous strokes)
	if (a <= pixels[i + 3]) return;
	pixels[i] = b; // B
	pixels[i + 1] = g; // G
	pixels[i + 2] = r; // R
	pixels[i + 3] = a; // A
}

function drawLine(x0, y0, x1, y1, r, g, b, a = 255) {
	const dx = Math.abs(x1 - x0);
	const dy = Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let err = dx - dy;
	let cx = x0;
	let cy = y0;
	while (true) {
		setPixel(cx, cy, r, g, b, a);
		if (cx === x1 && cy === y1) break;
		const e2 = 2 * err;
		if (e2 > -dy) {
			err -= dy;
			cx += sx;
		}
		if (e2 < dx) {
			err += dx;
			cy += sy;
		}
	}
}

function drawCircle(cx, cy, radius, r, g, b, a = 255) {
	let x = radius;
	let y = 0;
	let err = 1 - radius;
	while (x >= y) {
		setPixel(cx + x, cy + y, r, g, b, a);
		setPixel(cx - x, cy + y, r, g, b, a);
		setPixel(cx + x, cy - y, r, g, b, a);
		setPixel(cx - x, cy - y, r, g, b, a);
		setPixel(cx + y, cy + x, r, g, b, a);
		setPixel(cx - y, cy + x, r, g, b, a);
		setPixel(cx + y, cy - x, r, g, b, a);
		setPixel(cx - y, cy - x, r, g, b, a);
		y++;
		if (err < 0) {
			err += 2 * y + 1;
		} else {
			x--;
			err += 2 * (y - x) + 1;
		}
	}
}

function fillCircle(cx, cy, radius, r, g, b, a = 255) {
	for (let dy = -radius; dy <= radius; dy++) {
		const halfW = Math.floor(Math.sqrt(radius * radius - dy * dy));
		for (let dx = -halfW; dx <= halfW; dx++) {
			setPixel(cx + dx, cy + dy, r, g, b, a);
		}
	}
}

function drawRect(x, y, w, h, r, g, b, a = 255) {
	for (let i = x; i < x + w; i++) {
		setPixel(i, y, r, g, b, a);
		setPixel(i, y + h - 1, r, g, b, a);
	}
	for (let j = y; j < y + h; j++) {
		setPixel(x, j, r, g, b, a);
		setPixel(x + w - 1, j, r, g, b, a);
	}
}

function drawRoundedRect(x, y, w, h, rad, r, g, b, a = 255) {
	// Top and bottom edges (minus corners)
	for (let i = x + rad; i < x + w - rad; i++) {
		setPixel(i, y, r, g, b, a);
		setPixel(i, y + h - 1, r, g, b, a);
	}
	// Left and right edges (minus corners)
	for (let j = y + rad; j < y + h - rad; j++) {
		setPixel(x, j, r, g, b, a);
		setPixel(x + w - 1, j, r, g, b, a);
	}
	// Corner arcs (quarter circles)
	const corners = [
		[x + rad, y + rad], // top-left
		[x + w - 1 - rad, y + rad], // top-right
		[x + rad, y + h - 1 - rad], // bottom-left
		[x + w - 1 - rad, y + h - 1 - rad], // bottom-right
	];
	for (const [cx, cy] of corners) {
		let px = rad;
		let py = 0;
		let err = 1 - rad;
		while (px >= py) {
			// Plot only the octant quadrant that belongs to this corner
			const offsets = [
				[px, py],
				[-px, py],
				[px, -py],
				[-px, -py],
				[py, px],
				[-py, px],
				[py, -px],
				[-py, -px],
			];
			for (const [ox, oy] of offsets) {
				const fx = cx + ox;
				const fy = cy + oy;
				if (fx >= x && fx < x + w && fy >= y && fy < y + h) {
					setPixel(fx, fy, r, g, b, a);
				}
			}
			py++;
			if (err < 0) {
				err += 2 * py + 1;
			} else {
				px--;
				err += 2 * (py - px) + 1;
			}
		}
	}
}

// ── White on transparent ──────────────────────────────────────────────
const W = 255; // white

// 1. Outer coin circle (r=14 centered at 16,16 → in 32px that's r=14)
drawCircle(16, 16, 14, W, W, W);
drawCircle(16, 16, 13, W, W, W); // thicker stroke

// 2. Bot head — rounded rect at (9,12) size 14×10 rx=3
drawRoundedRect(9, 12, 14, 10, 3, W, W, W);

// 3. Left eye (filled circle at 13,17 r=1.5 → r=2 in pixels)
fillCircle(13, 17, 2, W, W, W);

// 4. Right eye (filled circle at 19,17 r=1.5 → r=2 in pixels)
fillCircle(19, 17, 2, W, W, W);

// 5. Antenna stem (line from 16,12 to 16,7)
drawLine(16, 7, 16, 12, W, W, W);
drawLine(15, 7, 15, 12, W, W, W); // thicker

// 6. Antenna tip (filled circle at 16,6 r=1.5 → r=2)
fillCircle(16, 6, 2, W, W, W);

// 7. Signal arc (approximate the curve M12.5,5.5 C13.5,3.5 18.5,3.5 19.5,5.5)
// Simple arc approximation
const arcPoints = [];
for (let t = 0; t <= 1; t += 0.05) {
	const x = Math.round(
		(1 - t) ** 3 * 12.5 + 3 * (1 - t) ** 2 * t * 13.5 + 3 * (1 - t) * t ** 2 * 18.5 + t ** 3 * 19.5,
	);
	const y = Math.round(
		(1 - t) ** 3 * 5.5 + 3 * (1 - t) ** 2 * t * 3.5 + 3 * (1 - t) * t ** 2 * 3.5 + t ** 3 * 5.5,
	);
	setPixel(x, y, W, W, W);
}

// ── Encode as ICO ─────────────────────────────────────────────────────

// BMP rows are bottom-to-top
const flippedPixels = Buffer.alloc(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
	const srcOffset = y * SIZE * 4;
	const dstOffset = (SIZE - 1 - y) * SIZE * 4;
	pixels.copy(flippedPixels, dstOffset, srcOffset, srcOffset + SIZE * 4);
}

// BITMAPINFOHEADER (40 bytes)
const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);
bmpHeader.writeInt32LE(SIZE, 4);
bmpHeader.writeInt32LE(SIZE * 2, 8);
bmpHeader.writeUInt16LE(1, 12);
bmpHeader.writeUInt16LE(32, 14);
bmpHeader.writeUInt32LE(0, 16);

const andMaskRowPadded = Math.ceil(Math.ceil(SIZE / 8) / 4) * 4;
const andMask = Buffer.alloc(andMaskRowPadded * SIZE, 0);

const imageData = Buffer.concat([bmpHeader, flippedPixels, andMask]);

// ICONDIR (6 bytes)
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0);
iconDir.writeUInt16LE(1, 2);
iconDir.writeUInt16LE(1, 4);

// ICONDIRENTRY (16 bytes)
const entry = Buffer.alloc(16);
entry.writeUInt8(SIZE, 0);
entry.writeUInt8(SIZE, 1);
entry.writeUInt8(0, 2);
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(imageData.length, 8);
entry.writeUInt32LE(6 + 16, 12);

const ico = Buffer.concat([iconDir, entry, imageData]);
const outPath = resolve(__dirname, "../public/favicon.ico");
writeFileSync(outPath, ico);
console.log(`✓ Written ${outPath} (${ico.length} bytes)`);
