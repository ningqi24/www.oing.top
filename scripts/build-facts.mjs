/**
 * 从 js/qa.js 生成 worker/src/facts.js
 * 用法：node scripts/build-facts.mjs
 *
 * 为什么要生成而不是让 Worker 直接引用：Worker 跑在 Cloudflare 上，
 * 事实库必须是服务端权威的（客户端传来的内容一律不可信）。
 * 生成 + 自检比对，可以避免两处各改一份导致漂移。
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'qa.js'), 'utf8'), sandbox);

const FACTS = sandbox.window.OING_QA || [];
const FALLBACK = sandbox.window.OING_QA_FALLBACK || { zh: '', en: '' };

/**
 * 事实库指纹。worker 通过 /api/health 把它报出来，
 * scripts/test-live.mjs 拿它和本地对比 —— 用来发现「改了 qa.js 但忘了重新部署 Worker」。
 * 这个坑踩过两次，靠人记不住。
 */
function factsHash(list) {
  const s = JSON.stringify(list);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const out = [
  '/* 由 scripts/build-facts.mjs 从 js/qa.js 生成，请勿手改。 */',
  '/* eslint-disable */',
  '',
  'export const FACTS = [',
  // worker 只在「接了远端模型」时存在，所以它的事实库用 remote* 那版答案
  ...FACTS.map((f) => '  { id: ' + JSON.stringify(f.id) +
    ', zh: ' + JSON.stringify(f.remoteZh || f.zh) +
    ', en: ' + JSON.stringify(f.remoteEn || f.en) + ' },'),
  '];',
  '',
  'export const FALLBACK = {',
  '  zh: ' + JSON.stringify(FALLBACK.zh) + ',',
  '  en: ' + JSON.stringify(FALLBACK.en) + ',',
  '};',
  '',
  '/** 事实库指纹 —— worker 在 /api/health 里报出来，供线上验收比对 */',
  'export const FACTS_HASH = ' + JSON.stringify(factsHash(FACTS.map((f) => ({ id: f.id, zh: f.remoteZh || f.zh, en: f.remoteEn || f.en })))) + ';',
  '',
].join('\n');

const dest = path.join(ROOT, 'worker', 'src', 'facts.js');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log('生成 worker/src/facts.js：' + FACTS.length + ' 条事实 · 指纹 ' +
  factsHash(FACTS.map((f) => ({ id: f.id, zh: f.remoteZh || f.zh, en: f.remoteEn || f.en }))));
