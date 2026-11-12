#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const width = 1200;
const height = 630;
const black = [0, 0, 0];
const colors = [
  [0xe2, 0x3b, 0x3b],
  [0x3b, 0x6b, 0xff],
  [0x1a, 0xa5, 0x7a],
  [0xf0, 0x74, 0x1c],
];

function crc32(buf) {
  return zlib.crc32(buf) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

const rows = [];
for (let y = 0; y < height; y++) {
  const row = Buffer.alloc(1 + width * 3);
  row[0] = 0;
  for (let x = 0; x < width; x++) {
    let rgb = black;
    if (x < 80) {
      rgb = colors[Math.min(3, Math.floor((y / height) * 4))];
    }
    const i = 1 + x * 3;
    row[i] = rgb[0];
    row[i + 1] = rgb[1];
    row[i + 2] = rgb[2];
  }
  rows.push(row);
}

const raw = Buffer.concat(rows);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 2;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), "../public/og.png");
writeFileSync(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
