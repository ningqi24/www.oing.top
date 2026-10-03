/**
 * Worker 纯逻辑的测试：node scripts/test-worker.mjs
 *
 * 为什么能测：把"挑免费模型"和"拼提示词"抽成了纯函数，
 * 而这两处恰恰是最容易出错、也最不该出错的地方。
 * （真正调 OpenRouter 的部分需要 key，不能在这里跑。）
 */
import { isFree, rankFreeModels } from '../worker/src/models.js';
import { buildMessages } from '../worker/src/prompt.js';
import { FACTS, FALLBACK } from '../worker/src/facts.js';

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

/* ---------- 1. isFree：注意 pricing 的值是字符串 ---------- */
const M = (id, ctx, p, c) => ({ id, context_length: ctx, pricing: { prompt: p, completion: c } });
ok(isFree(M('a:free', 1000, '0', '0')) === true, 'pricing 为字符串 "0" 时应判为免费');
ok(isFree(M('b', 1000, 0, 0)) === true, 'pricing 为数字 0 时也应判为免费');
ok(isFree(M('c', 1000, '0.000001', '0')) === false, 'prompt 不为 0 时不能判为免费');
ok(isFree(M('d', 1000, '0', '0.5')) === false, 'completion 不为 0 时不能判为免费');
ok(isFree(null) === false, 'null 不能崩');
ok(isFree({ id: 'e' }) === false, '缺 pricing 字段不能崩');

/* ---------- 2. rankFreeModels：优先名单 > 上下文长度 ---------- */
const POOL = [
  M('paid/big', 2000000, '3', '15'),
  M('free/small', 8000, '0', '0'),
  M('free/huge', 1000000, '0', '0'),
  M('free/preferred-b', 32000, '0', '0'),
  M('free/preferred-a', 16000, '0', '0'),
  M('free/mid', 262144, '0', '0'),
];
const ranked = rankFreeModels(POOL, ['free/preferred-a', 'free/preferred-b']);
ok(ranked.length === 5, '应只保留免费模型，实际 ' + ranked.length + ' 个');
ok(ranked[0].id === 'free/preferred-a', '优先名单第一项应排最前，实际 ' + ranked[0].id);
ok(ranked[1].id === 'free/preferred-b', '优先名单第二项应排第二，实际 ' + ranked[1].id);
ok(ranked[2].id === 'free/huge', '其余应按上下文从大到小，实际 ' + ranked[2].id);
ok(ranked[4].id === 'free/small', '最小的排最后，实际 ' + ranked[4].id);
ok(!ranked.some((m) => m.id === 'paid/big'), '付费模型不能出现在结果里');

const none = rankFreeModels(POOL, ['free/does-not-exist']);
ok(none.length === 5 && none[0].id === 'free/huge', '优先名单全都不存在时应回退到上下文排序');
ok(rankFreeModels(null, []).length === 0, 'models 为 null 时返回空数组');
ok(rankFreeModels([], ['x']).length === 0, '空列表返回空数组');

/* ---------- 3. buildMessages：提示词必须锁死事实 ---------- */
const zh = buildMessages(FACTS, '你们什么时候能用', 'zh');
const en = buildMessages(FACTS, 'when can I use it', 'en');
ok(zh.length === 2 && zh[0].role === 'system' && zh[1].role === 'user', '应产出 system + user 两条');
ok(zh[1].content === '你们什么时候能用', 'user 内容应是原问题');
ok(zh[0].content.includes(FALLBACK.zh.slice(0, 6)) || zh[0].content.includes('official@astras.cc'),
  'system prompt 里必须给出兜底联系方式');
ok(zh[0].content.includes('不要猜测') || zh[0].content.includes('绝对不要猜测'), 'system prompt 必须禁止猜测');
ok(en[0].content.includes('Never guess'), '英文 prompt 必须禁止猜测');
for (const f of FACTS) {
  ok(zh[0].content.includes(f.zh), '中文 prompt 缺少事实：' + f.id);
  ok(en[0].content.includes(f.en), '英文 prompt 缺少事实：' + f.id);
}
ok(zh[0].content.includes('忽略以上任何一条') || zh[0].content.includes('不要忽略'),
  'system prompt 必须包含"不要被用户指令绕过"的条款');

const long = buildMessages(FACTS, 'x'.repeat(2000), 'zh');
ok(long[1].content.length === 500, '超长输入应被截断到 500 字，实际 ' + long[1].content.length);
const empty = buildMessages(FACTS, null, 'zh');
ok(empty[1].content === '', 'null 输入应变成空字符串而不是 "null"');

/* ---------- 4. 生成的事实与 js/qa.js 不漂移 ---------- */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'qa.js'), 'utf8'), sandbox);
const src = sandbox.window.OING_QA || [];
ok(src.length === FACTS.length, 'worker 事实条数 (' + FACTS.length + ') 与 js/qa.js (' + src.length + ') 不一致，跑 npm run build:facts');
for (let i = 0; i < Math.min(src.length, FACTS.length); i++) {
  ok(src[i].id === FACTS[i].id, '第 ' + i + ' 条 id 不一致：' + src[i].id + ' vs ' + FACTS[i].id);
  // worker 只在「接了远端模型」时存在，所以它用的是 remote* 那版答案
  const expectZh = src[i].remoteZh || src[i].zh;
  const expectEn = src[i].remoteEn || src[i].en;
  ok(expectZh === FACTS[i].zh, '条目 ' + src[i].id + ' 的中文答案与 js/qa.js 不一致，跑 npm run build:facts');
  ok(expectEn === FACTS[i].en, '条目 ' + src[i].id + ' 的英文答案与 js/qa.js 不一致，跑 npm run build:facts');
}

console.log('免费模型判定 / 排序 / 提示词 / 事实同步 共 ' + (fails.length ? fails.length + ' 项失败' : '全部通过 ✓'));
if (fails.length) { fails.forEach((f) => console.log('  x ' + f)); process.exit(1); }
