/**
 * 把 HTML 里带 data-i18n 的元素文字，从 js/i18n.js 的 zh 词条同步过来。
 * 用法：node scripts/sync-html-text.mjs   （或 npm run sync:html）
 *
 * 为什么要脚本：check.mjs 强制要求「HTML 兜底文字 === zh 词条」，
 * 改文案时手工同步三十多处必漏。只替换**原本就有文字**的元素，
 * 故意留空（交给 JS 填）的元素保持为空。
 *
 * ⚠️ 三类都要同步，漏一类就会出现「运行时正常、无脚本环境是旧文字」：
 *   · data-i18n            → 元素文字（textContent）
 *   · data-i18n-placeholder → placeholder 属性
 *   · data-i18n-label       → aria-label 属性
 *   （曾经只处理了第一类，导致 placeholder 一直是旧文案。）
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8'), sandbox);
const zh = (sandbox.window.OING_I18N || {}).zh || {};

const FILES = ['index.html', 'legal.html', '404.html', 'ask.html'];
const RE = /<([a-z0-9]+)([^>]*\sdata-i18n="([^"]+)"[^>]*)>([^<]*)<\/\1>/gi;

let changed = 0;
let missing = [];

for (const f of FILES) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const before = fs.readFileSync(p, 'utf8');
  const after = before.replace(RE, (m, tag, attrs, key, inner) => {
    if (!inner.trim()) return m;              // 故意留空的，不动
    if (!(key in zh)) { missing.push(f + ' → ' + key); return m; }
    if (inner === zh[key]) return m;
    changed++;
    return '<' + tag + attrs + '>' + zh[key] + '</' + tag + '>';
  });
  // placeholder 属性
  let out = after.replace(/<([a-z0-9]+)([^>]*\sdata-i18n-placeholder="([^"]+)"[^>]*)>/gi,
    (m, tag, attrs, key) => {
      if (!(key in zh)) { missing.push(f + ' → ' + key); return m; }
      const cur = /\splaceholder="([^"]*)"/.exec(attrs);
      if (!cur || !cur[1].trim()) return m;              // 没有或故意留空的，不动
      if (cur[1] === zh[key]) return m;
      changed++;
      return '<' + tag + attrs.replace(/\splaceholder="[^"]*"/, ' placeholder="' + zh[key] + '"') + '>';
    });

  // aria-label 属性
  out = out.replace(/<([a-z0-9]+)([^>]*\sdata-i18n-label="([^"]+)"[^>]*)>/gi,
    (m, tag, attrs, key) => {
      if (!(key in zh)) { missing.push(f + ' → ' + key); return m; }
      const cur = /\saria-label="([^"]*)"/.exec(attrs);
      if (!cur || !cur[1].trim()) return m;
      if (cur[1] === zh[key]) return m;
      changed++;
      return '<' + tag + attrs.replace(/\saria-label="[^"]*"/, ' aria-label="' + zh[key] + '"') + '>';
    });

  if (out !== before) fs.writeFileSync(p, out);
}

console.log('同步完成：更新 ' + changed + ' 处');
if (missing.length) {
  console.log('警告：这些 key 在 zh 词条里不存在');
  missing.forEach((m) => console.log('  ' + m));
}
