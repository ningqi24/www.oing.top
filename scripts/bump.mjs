/**
 * 改版本号 + 更新资源指纹，一步做完。
 * 用法：node scripts/bump.mjs 2.8.0     （或 npm run bump -- 2.8.0）
 *
 * 它做三件事：
 *   1. package.json 的 version
 *   2. 三个 HTML 里所有 ?v=xxx 查询参数
 *   3. package.json 的 assetHash（供 check.mjs 比对）
 *
 * 为什么必须一起做：改了 js/css 却没改版本号，浏览器与 CDN 会继续用旧文件，
 * 页面表现是「推上去了但没变化」。check.mjs 会拦住这种情况。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeAssetHash } from './asset-hash.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const next = (process.argv[2] || '').trim();

if (!/^\d+\.\d+\.\d+$/.test(next)) {
  console.error('用法：node scripts/bump.mjs 2.8.0');
  process.exit(1);
}

const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const prev = pkg.version;

const HTML = ['index.html', 'legal.html', '404.html', 'ask.html'];
let htmlHits = 0;
for (const f of HTML) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const before = fs.readFileSync(p, 'utf8');
  const after = before.replace(/\?v=[0-9]+\.[0-9]+\.[0-9]+/g, () => { htmlHits++; return '?v=' + next; });
  if (after !== before) fs.writeFileSync(p, after);
}

pkg.version = next;
pkg.assetHash = computeAssetHash(ROOT);
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log('版本 ' + prev + ' → ' + next);
console.log('HTML 里替换 ?v= ' + htmlHits + ' 处');
console.log('资源指纹 ' + pkg.assetHash);
