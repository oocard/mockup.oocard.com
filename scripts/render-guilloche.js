#!/usr/bin/env node
// Renders guilloche pattern to PNG using pure Node.js (no Canvas, no Puppeteer)
// Outputs base64 to stdout. Usage: node scripts/render-guilloche.js

const zlib = require('zlib');

const W = 512, H = 323;
const pixels = new Uint8Array(W * H); // grayscale: 0=black, 255=white

// Guilloche: concentric ellipses (rx=20, ry=99 in 200-unit viewbox)
// rotated at 15-degree intervals, scaled at 7 levels
const cx = W / 2, cy = H / 2;
const vs = H / 200; // viewbox scale
const strokeHalf = (0.76 * vs) / 2 + 0.5; // half stroke width + AA margin
const scales = [1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7];

for (let deg = 0; deg < 180; deg += 15) {
  const rad = deg * Math.PI / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  for (const s of scales) {
    const rx = 20 * vs * s;
    const ry = 99 * vs * s;

    // Bounding box for this rotated ellipse
    const bx = Math.sqrt(rx * rx * cosA * cosA + ry * ry * sinA * sinA);
    const by = Math.sqrt(rx * rx * sinA * sinA + ry * ry * cosA * cosA);
    const x0 = Math.max(0, Math.floor(cx - bx - strokeHalf - 1));
    const x1 = Math.min(W - 1, Math.ceil(cx + bx + strokeHalf + 1));
    const y0 = Math.max(0, Math.floor(cy - by - strokeHalf - 1));
    const y1 = Math.min(H - 1, Math.ceil(cy + by + strokeHalf + 1));

    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        // Rotate point into ellipse-local coords
        const dx = px - cx;
        const dy = py - cy;
        const lx = dx * cosA + dy * sinA;
        const ly = -dx * sinA + dy * cosA;

        // Distance from ellipse: (lx/rx)^2 + (ly/ry)^2 = 1
        const t = (lx * lx) / (rx * rx) + (ly * ly) / (ry * ry);
        // Approximate distance to ellipse boundary
        const dist = Math.abs(Math.sqrt(t) - 1.0) * Math.min(rx, ry);

        if (dist < strokeHalf) {
          // Anti-aliased intensity
          const intensity = Math.max(0, 1.0 - dist / strokeHalf);
          const val = Math.round(intensity * 255);
          const idx = py * W + px;
          pixels[idx] = Math.max(pixels[idx], val);
        }
      }
    }
  }
}

// Encode as PNG (grayscale, 8-bit)
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crc32Table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const crc32Table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crc32Table[n] = c >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crc]);
}

// IHDR
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 0;  // color type: grayscale
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

// Raw scanlines with filter byte (0 = None)
const raw = Buffer.alloc(H * (1 + W));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W)] = 0; // filter: none
  for (let x = 0; x < W; x++) {
    raw[y * (1 + W) + 1 + x] = pixels[y * W + x];
  }
}

const compressed = zlib.deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
  makeChunk('IHDR', ihdr),
  makeChunk('IDAT', compressed),
  makeChunk('IEND', Buffer.alloc(0))
]);

process.stdout.write(png.toString('base64'));
