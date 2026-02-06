/**
 * Generate a minimal 32x32 favicon.ico from hand-drawn pixel data.
 * No external dependencies — uses only Node built-ins.
 *
 * Draws a simplified shield + chevron in purple (#A78BFA) on transparent bg.
 * Run: node scripts/generate-favicon-ico.mjs
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIZE = 32;

// ── Draw a 32×32 BGRA pixel buffer ────────────────────────────────────

const pixels = Buffer.alloc(SIZE * SIZE * 4, 0); // transparent

function setPixel(x, y, r, g, b, a = 255) {
	if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
	const i = (y * SIZE + x) * 4;
	pixels[i] = b;
	pixels[i + 1] = g;
	pixels[i + 2] = r;
	pixels[i + 3] = a;
}

function drawLine(x0, y0, x1, y1, r, g, b, a = 255, thickness = 1) {
	const dx = Math.abs(x1 - x0);
	const dy = Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let err = dx - dy;
	const halfT = Math.floor(thickness / 2);

	while (true) {
		for (let tx = -halfT; tx <= halfT; tx++) {
			for (let ty = -halfT; ty <= halfT; ty++) {
				setPixel(x0 + tx, y0 + ty, r, g, b, a);
			}
		}
		if (x0 === x1 && y0 === y1) break;
		const e2 = 2 * err;
		if (e2 > -dy) { err -= dy; x0 += sx; }
		if (e2 < dx) { err += dx; y0 += sy; }
	}
}

// Purple color: #A78BFA → r=167 g=139 b=250
const PR = 167, PG = 139, PB = 250;

// Draw shield outline (simplified polygon)
const shieldPoints = [
	[16, 2], [5, 7], [5, 16], [8, 22], [12, 26], [16, 28],
	[20, 26], [24, 22], [27, 16], [27, 7], [16, 2],
];
for (let i = 0; i < shieldPoints.length - 1; i++) {
	const [x0, y0] = shieldPoints[i];
	const [x1, y1] = shieldPoints[i + 1];
	drawLine(x0, y0, x1, y1, PR, PG, PB, 200);
}

// Fill shield with semi-transparent purple
for (let y = 3; y < 28; y++) {
	let inside = false;
	let minX = SIZE, maxX = 0;
	for (let x = 0; x < SIZE; x++) {
		const i = (y * SIZE + x) * 4;
		if (pixels[i + 3] > 100) {
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
		}
	}
	if (minX < maxX) {
		for (let x = minX + 1; x < maxX; x++) {
			const i = (y * SIZE + x) * 4;
			if (pixels[i + 3] === 0) {
				setPixel(x, y, PR, PG, PB, 30);
			}
		}
	}
}

// Draw chevron-right (>) inside the shield
drawLine(13, 11, 19, 16, PR, PG, PB, 255, 2);
drawLine(19, 16, 13, 21, PR, PG, PB, 255, 2);

// ── Encode as ICO ─────────────────────────────────────────────────────

// BMP rows are bottom-to-top, so flip vertically
const flippedPixels = Buffer.alloc(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
	const srcOffset = y * SIZE * 4;
	const dstOffset = (SIZE - 1 - y) * SIZE * 4;
	pixels.copy(flippedPixels, dstOffset, srcOffset, srcOffset + SIZE * 4);
}

// BITMAPINFOHEADER (40 bytes)
const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);          // biSize
bmpHeader.writeInt32LE(SIZE, 4);         // biWidth
bmpHeader.writeInt32LE(SIZE * 2, 8);     // biHeight (doubled for ICO: includes AND mask)
bmpHeader.writeUInt16LE(1, 12);          // biPlanes
bmpHeader.writeUInt16LE(32, 14);         // biBitCount
bmpHeader.writeUInt32LE(0, 16);          // biCompression (BI_RGB)

const andMaskRowBytes = Math.ceil(SIZE / 8);
const andMaskRowPadded = Math.ceil(andMaskRowBytes / 4) * 4;
const andMask = Buffer.alloc(andMaskRowPadded * SIZE, 0); // all opaque

const imageData = Buffer.concat([bmpHeader, flippedPixels, andMask]);

// ICONDIR (6 bytes)
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0);   // reserved
iconDir.writeUInt16LE(1, 2);   // type = ICO
iconDir.writeUInt16LE(1, 4);   // count = 1

// ICONDIRENTRY (16 bytes)
const entry = Buffer.alloc(16);
entry.writeUInt8(SIZE, 0);               // width
entry.writeUInt8(SIZE, 1);               // height
entry.writeUInt8(0, 2);                  // color count
entry.writeUInt8(0, 3);                  // reserved
entry.writeUInt16LE(1, 4);              // planes
entry.writeUInt16LE(32, 6);             // bit count
entry.writeUInt32LE(imageData.length, 8); // size
entry.writeUInt32LE(6 + 16, 12);        // offset (after header + 1 entry)

const ico = Buffer.concat([iconDir, entry, imageData]);
const outPath = resolve(__dirname, "../public/favicon.ico");
writeFileSync(outPath, ico);
console.log(`✓ Written ${outPath} (${ico.length} bytes)`);
