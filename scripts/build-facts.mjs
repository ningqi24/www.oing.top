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
].join('\n');

const dest = path.join(ROOT, 'worker', 'src', 'facts.js');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log('生成 worker/src/facts.js：' + FACTS.length + ' 条事实');
