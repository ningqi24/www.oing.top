/**
 * 零依赖图标生成器。
 * 手写 PNG 编码（zlib deflate + CRC32），用超采样把矢量形状栅格化成位图。
 * 产物：assets/icon-192.png、assets/icon-512.png、assets/apple-touch-icon.png、
 *       assets/og-cover.png、favicon.ico
 *
 * 运行：node scripts/gen-icons.mjs   （或 npm run icons）
 */
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..', 'assets');

/* ---------------------------------------------------------------- PNG 编码 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** rgba: Uint8Array(width*height*4) */
function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** ICO 容器，内嵌 PNG（Windows Vista+ / 现代浏览器均支持）。 */
function encodeICO(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach((e, i) => {
    const b = i * 16;
    dir[b] = e.size >= 256 ? 0 : e.size;
    dir[b + 1] = e.size >= 256 ? 0 : e.size;
    dir[b + 2] = 0;
    dir[b + 3] = 0;
    dir.writeUInt16LE(1, b + 4);
    dir.writeUInt16LE(32, b + 6);
    dir.writeUInt32LE(e.png.length, b + 8);
    dir.writeUInt32LE(offset, b + 12);
    offset += e.png.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

/* ------------------------------------------------------------ 形状 / 绘制 */

const hex = (h) => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 圆角矩形的有符号距离（负数在内部）；(x,y) 为相对中心的坐标。 */
function sdRoundRect(x, y, halfW, halfH, r) {
  const qx = Math.abs(x) - (halfW - r);
  const qy = Math.abs(y) - (halfH - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - r;
}

function sdCircle(x, y, r) {
  return Math.hypot(x, y) - r;
}

/**
 * 绘制尺寸为 size 的方形图标（应用图标 / favicon）。
 * 背景：品牌蓝→青的斜向渐变圆角方；前景：白色圆环 + 轨道点。
 */
function drawIcon(size) {
  const S = size;
  const half = S / 2;
  const radius = S * 0.235;
  const ringOuter = S * 0.30;
  const ringInner = S * 0.165;
  const dotR = S * 0.058;
  const dotDist = S * 0.395;
  const dotAng = -Math.PI / 4.6;
  const dotX = Math.cos(dotAng) * dotDist;
  const dotY = Math.sin(dotAng) * dotDist;

  const c1 = hex('#3355d8');
  const c2 = hex('#7ba6ff');
  const px = new Uint8Array(S * S * 4);
  const SS = 4; // 每个像素 4x4 超采样
  const inv = 1 / (SS * SS);

  for (let py = 0; py < S; py++) {
    for (let pxi = 0; pxi < S; pxi++) {
      let bgA = 0;
      let fgA = 0;
      let rSum = 0, gSum = 0, bSum = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = pxi + (sx + 0.5) / SS - half;
          const y = py + (sy + 0.5) / SS - half;

          // 背景圆角方
          const dBg = sdRoundRect(x, y, half, half, radius);
          const bgCov = clamp01(0.5 - dBg);
          if (bgCov > 0) {
            const t = clamp01((x / S + y / S) + 0.5);
            bgA += bgCov;
            rSum += lerp(c1[0], c2[0], t) * bgCov;
            gSum += lerp(c1[1], c2[1], t) * bgCov;
            bSum += lerp(c1[2], c2[2], t) * bgCov;
          }

          // 前景：圆环
          const ringCov = Math.min(
            clamp01(0.5 - sdCircle(x, y, ringOuter)),
            clamp01(0.5 + sdCircle(x, y, ringInner)),
          );
          const dotCov = clamp01(0.5 - sdCircle(x - dotX, y - dotY, dotR));
          fgA += Math.max(ringCov, dotCov);
        }
      }
      bgA *= inv;
      fgA *= inv;

      const r = (rSum * inv) / (bgA || 1);
      const g = (gSum * inv) / (bgA || 1);
      const b = (bSum * inv) / (bgA || 1);
      const o = (py * S + pxi) * 4;
      const a = bgA;
      // 白色前景按覆盖率叠在渐变背景上
      px[o + 0] = Math.round(lerp(r, 255, fgA));
      px[o + 1] = Math.round(lerp(g, 255, fgA));
      px[o + 2] = Math.round(lerp(b, 255, fgA));
      px[o + 3] = Math.round(a * 255);
    }
  }
  return encodePNG(S, S, px);
}

/** 1200x630 社交分享封面：全幅渐变 + 柔光 + 图标主体。 */
function drawOg(w, h) {
  const c1 = hex('#1d2f6b');
  const c2 = hex('#3a63e8');
  const c3 = hex('#8fb4ff');
  const px = new Uint8Array(w * h * 4);
  const SS = 3;
  const inv = 1 / (SS * SS);

  const ringOuter = h * 0.185;
  const ringInner = h * 0.102;
  const dotR = h * 0.036;
  const dotDist = h * 0.245;
  const dotAng = -Math.PI / 4.6;
  const dotX = Math.cos(dotAng) * dotDist;
  const dotY = Math.sin(dotAng) * dotDist;

  for (let py = 0; py < h; py++) {
    for (let pxi = 0; pxi < w; pxi++) {
      let r = 0, g = 0, b = 0, fg = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const X = pxi + (sx + 0.5) / SS;
          const Y = py + (sy + 0.5) / SS;
          const t = clamp01((X / w) * 0.75 + (Y / h) * 0.35);
          let cr = lerp(c1[0], c2[0], Math.min(t, 0.6) / 0.6);
          let cg = lerp(c1[1], c2[1], Math.min(t, 0.6) / 0.6);
          let cb = lerp(c1[2], c2[2], Math.min(t, 0.6) / 0.6);
          if (t > 0.6) {
            const u = (t - 0.6) / 0.4;
            cr = lerp(cr, c3[0], u);
            cg = lerp(cg, c3[1], u);
            cb = lerp(cb, c3[2], u);
          }
          const glow = Math.max(0, 1 - Math.hypot(X - w * 0.82, Y - h * 0.18) / (h * 0.75));
          cr = Math.min(255, cr + glow * 60);
          cg = Math.min(255, cg + glow * 70);
          cb = Math.min(255, cb + glow * 55);
          r += cr; g += cg; b += cb;

          const x = X - w / 2;
          const y = Y - h / 2;
          const ringCov = Math.min(
            clamp01(0.5 - sdCircle(x, y, ringOuter)),
            clamp01(0.5 + sdCircle(x, y, ringInner)),
          );
          const dotCov = clamp01(0.5 - sdCircle(x - dotX, y - dotY, dotR));
          fg += Math.max(ringCov, dotCov);
        }
      }
      r *= inv; g *= inv; b *= inv; fg *= inv;
      const o = (py * w + pxi) * 4;
      px[o + 0] = Math.round(lerp(r, 255, fg));
      px[o + 1] = Math.round(lerp(g, 255, fg));
      px[o + 2] = Math.round(lerp(b, 255, fg));
      px[o + 3] = 255;
    }
  }
  return encodePNG(w, h, px);
}

/* ------------------------------------------------------------------ 输出 */

fs.mkdirSync(OUT, { recursive: true });

const icon512 = drawIcon(512);
const icon192 = drawIcon(192);
const apple = drawIcon(180);
const og = drawOg(1200, 630);

fs.writeFileSync(path.join(OUT, 'icon-512.png'), icon512);
fs.writeFileSync(path.join(OUT, 'icon-192.png'), icon192);
fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), apple);
fs.writeFileSync(path.join(OUT, 'og-cover.png'), og);
fs.writeFileSync(
  path.resolve(HERE, '..', 'favicon.ico'),
  encodeICO([
    { size: 32, png: drawIcon(32) },
    { size: 16, png: drawIcon(16) },
  ]),
);

const report = [
  ['icon-512.png', icon512],
  ['icon-192.png', icon192],
  ['apple-touch-icon.png', apple],
  ['og-cover.png', og],
].map(([n, b]) => `${n}  ${(b.length / 1024).toFixed(1)} KB  ${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`);
console.log('生成完成：');
console.log(report.join('\n'));
console.log('favicon.ico  ' + (fs.statSync(path.resolve(HERE, '..', 'favicon.ico')).size / 1024).toFixed(1) + ' KB');
