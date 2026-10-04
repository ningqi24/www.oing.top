/**
 * 站点自检 —— node scripts/check.mjs   （或 npm run check）
 *
 * 2026-10 精简：只保留**真正抓到过 bug** 的三类检查。
 *
 *   1. i18n key 存在性 —— HTML 里用到的 key 必须在 zh / en 里都有，且两边词条数一致
 *   2. HTML 文案与词条一致 —— 元素文字 / placeholder / aria-label 必须等于 zh 词条
 *      （不一致时，无脚本环境下访客看到的是旧文案）
 *   3. 资源版本与指纹 —— css/js 的内容变了就必须改版本号
 *      （否则浏览器/CDN 继续用旧文件，表现是「明明推上去了却没变化」）
 *
 * 曾经还查过：本地资源存在性、CNAME/sitemap/manifest、HTML 标签配平、id 重复、
 * data-link 合法性、第三方品牌词、字体文件、流场接线、问答结构、i18n 导出函数。
 * 这些没有抓到过实际 bug，按决定精简掉了 —— 需要时从 git 历史里找回来。
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { computeAssetHash } from './asset-hash.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const errors = [];
const fail = (m) => errors.push(m);

const pkg = JSON.parse(read('package.json'));
const VERSION = pkg.version;
const HTML_FILES = ['index.html', 'legal.html', '404.html', 'ask.html'];

/* 词条 */
const sb = { window: {} };
vm.createContext(sb);
vm.runInContext(read('js/i18n.js'), sb);
const DICT = sb.window.OING_I18N || {};
const ZH = DICT.zh || {};
const EN = DICT.en || {};

/* ---------------------------------------- 1. i18n key 存在性 */
for (const f of HTML_FILES) {
  const src = read(f);
  const re = /data-i18n(?:-placeholder|-label)?="([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) {
    const key = m[1];
    if (!(key in ZH)) fail(f + ' 用到 key「' + key + '」，但 zh 词条里没有');
    if (!(key in EN)) fail(f + ' 用到 key「' + key + '」，但 en 词条里没有');
  }
}
for (const k of Object.keys(ZH)) if (!(k in EN)) fail('zh 有词条「' + k + '」，en 没有');
for (const k of Object.keys(EN)) if (!(k in ZH)) fail('en 有词条「' + k + '」，zh 没有');

/* ---------------------------------------- 2. HTML 兜底文案与 zh 词条一致 */
for (const f of HTML_FILES) {
  const src = read(f);

  // 2a 元素文字
  const reText = /<([a-z0-9]+)([^>]*\sdata-i18n="([^"]+)"[^>]*)>([^<]*)<\/\1>/gi;
  let m;
  while ((m = reText.exec(src))) {
    const key = m[3], inner = m[4];
    if (!inner.trim()) continue;                       // 故意留空（交给 JS 填）的跳过
    if (ZH[key] && inner !== ZH[key]) {
      fail(f + ' 的 data-i18n="' + key + '" 兜底文字不一致：' + JSON.stringify(inner) +
        ' ≠ ' + JSON.stringify(ZH[key]) + '（跑 npm run sync:html）');
    }
  }

  // 2b placeholder / aria-label（曾经漏同步过 placeholder，浏览器里看不出来）
  const checkAttr = (marker, attr) => {
    const re = new RegExp('<[a-z0-9]+[^>]*\\s' + attr + '="([^"]*)"[^>]*\\s' + marker + '="([^"]+)"[^>]*>', 'gi');
    let x;
    while ((x = re.exec(src))) {
      const value = x[1], key = x[2];
      if (!value.trim()) continue;
      if (ZH[key] && value !== ZH[key]) {
        fail(f + ' 的 ' + marker + '="' + key + '" 兜底值不一致：' + JSON.stringify(value) +
          ' ≠ ' + JSON.stringify(ZH[key]) + '（跑 npm run sync:html）');
      }
    }
  };
  checkAttr('data-i18n-placeholder', 'placeholder');
  checkAttr('data-i18n-label', 'aria-label');
}

/* ---------------------------------------- 3. 资源版本与指纹 */
for (const f of HTML_FILES) {
  const src = read(f);
  for (const m of src.matchAll(/\?v=([0-9]+\.[0-9]+\.[0-9]+)/g)) {
    if (m[1] !== VERSION) fail(f + ' 的 ?v=' + m[1] + ' 与 package.json 的版本 ' + VERSION + ' 不一致');
  }
}
const nowHash = computeAssetHash(ROOT);
if (!pkg.assetHash) {
  fail('package.json 缺 assetHash —— 跑 npm run bump -- <版本号>');
} else if (pkg.assetHash !== nowHash) {
  fail('css/js 内容变了但版本号没跟着改（指纹 ' + pkg.assetHash + ' → ' + nowHash +
    '）—— 访客会看到旧文件。跑 npm run bump -- <新版本号>');
}

/* ---------------------------------------- 汇总 */
const line = '-'.repeat(52);
console.log(line);
console.log('Oing 站点自检   版本 ' + VERSION);
console.log(line);
console.log('页面 ' + HTML_FILES.length + ' 个 · 词条 ' + Object.keys(ZH).length + ' 条 · 指纹 ' + nowHash);
if (errors.length) {
  console.log('');
  console.log('错误（' + errors.length + '）：');
  errors.forEach((e) => console.log('  x ' + e));
  console.log(line);
  console.log('自检未通过');
  process.exit(1);
}
console.log('');
console.log('全部通过 ✓');
