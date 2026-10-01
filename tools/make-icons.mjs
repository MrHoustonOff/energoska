// Генерирует PNG-иконки без зависимостей: чёрный фон (без прозрачности) + круг цвета игрока.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };

function png(size, radiusK) {
  const row = size * 3 + 1, raw = Buffer.alloc(row * size), c = size / 2, r = size * radiusK;
  for (let y = 0; y < size; y++) {
    raw[y * row] = 0;
    for (let x = 0; x < size; x++) {
      const inside = (x + .5 - c) ** 2 + (y + .5 - c) ** 2 <= r * r;
      const o = y * row + 1 + x * 3;
      raw[o] = inside ? 0xb6 : 0; raw[o + 1] = inside ? 0xff : 0; raw[o + 2] = inside ? 0x3d : 0;
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/apple-touch-icon-180.png', png(180, .3));
writeFileSync('public/icons/icon-192.png', png(192, .3));
writeFileSync('public/icons/icon-512.png', png(512, .3));
writeFileSync('public/icons/icon-512-maskable.png', png(512, .26));
