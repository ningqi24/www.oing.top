/**
 * 站点问答检索的测试：node scripts/test-qa.mjs   （或 npm run test:qa）
 *
 * 为什么要测：检索是"按关键词打分取最高"，很容易出现"问 A 答 B"或"该兜底却答了"。
 * 这种错误在页面上肉眼几乎看不出来，只能靠用例。
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

function load(lang) {
  const sandbox = { window: {}, document: { documentElement: { lang } } };
  sandbox.window.document = sandbox.document;
  vm.createContext(sandbox);
  vm.runInContext(read('js/qa.js'), sandbox);
  vm.runInContext(read('js/ask.js'), sandbox);
  return sandbox.window.OingAsk;
}

const zh = load('zh');
const en = load('en');

// [提问, 期望的条目 id（null = 应当兜底）]
const CASES = [
  // —— 中文 ——
  ['这到底是什么？', 'what'],
  ['Oing 是做什么的', 'what'],
  ['介绍一下你们', 'what'],
  ['什么时候能用？', 'when'],
  ['何时可以使用？', 'when'],
  ['有发布时间表吗', 'when'],
  ['啥时候上线啊', 'when'],
  ['现在能试用吗', 'usable'],
  ['怎么用啊', 'usable'],
  ['怎么联系你们？', 'contact'],
  ['如何联系你们？', 'contact'],
  ['你们的邮箱是多少', 'contact'],
  ['有问题找谁', 'contact'],
  ['会不会收费？', 'price'],
  ['是否收费？', 'price'],
  ['多少钱一年', 'price'],
  ['现在免费吗', 'price'],
  ['和 DeepSeek 什么关系？', 'deepseek'],
  ['与 DeepSeek 是什么关系？', 'deepseek'],
  ['是不是抄 deepseek 的', 'deepseek'],
  ['你们和深度求索有关吗', 'deepseek'],
  ['会收集我的数据吗', 'privacy'],
  ['隐私政策在哪', 'privacy'],
  ['我的数据安全吗', 'privacy'],
  ['为什么还没有产品', 'why-no-product'],
  ['你们是不是空壳', 'why-no-product'],
  ['你们开源吗', 'github'],
  ['代码在哪', 'github'],
  ['会有什么能力', 'capability'],
  ['支持什么功能', 'capability'],
  ['支持中文吗', 'language'],
  ['谁做的', 'who-made-it'],
  ['哪个公司做的', 'who-made-it'],
  ['你是 AI 吗', 'is-this-ai'],
  ['你是不是机器人', 'is-this-ai'],
  ['官网用什么做的', 'tech'],
  ['什么技术栈', 'tech'],
  ['为什么邮箱不是 oing.top', 'email-domain'],
  ['你们的邮箱为什么是 astras.cc 的', 'email-domain'],
  ['Astras.CC 是什么', 'project-astras'],
  ['那个工具导航站是什么', 'project-astras'],
  ['MiniChat 是什么', 'project-minichat'],
  ['minichat.astras.cc 是什么', 'project-minichat'],
  ['首页推的那个聊天是什么', 'project-minichat'],
  // —— 英文 ——
  ['What is this?', 'what'],
  ['When can I use it?', 'when'],
  ['How do I contact you?', 'contact'],
  ['Will it cost money?', 'price'],
  ['Are you related to DeepSeek?', 'deepseek'],
  ['Are you an AI?', 'is-this-ai'],
  ['Do you collect my data?', 'privacy'],
  ['Is it open source?', 'github'],
  ['What features will it have?', 'capability'],
  // —— 应当兜底：站上确实没有这些信息 ——
  ['今天天气怎么样', null],
  ['支持多少 token', null],
  ['你们老板是谁', null],
  ['帮我写一首诗', null],
  ['asdfghjkl', null],
  ['1 + 1 = ?', null],
  ['你们和 OpenAI 什么关系', null],
  ['怎么复制你们的代码', null],
  ['can I use it now', 'usable'],
];

let pass = 0;
const fails = [];

/*
 * 首页那 5 个建议问题：**直接从 js/i18n.js 里读文字来测**。
 *
 * 为什么这么做：之前是手写死在这儿的，改了词条但忘了改测试，测试就变成
 * 「测一段用户根本点不到的文字」。现在词条一改，测试自动跟着测新文案。
 */
const CHIP_EXPECT = ['what', 'when', 'contact', 'deepseek', 'price'];
(function testChips() {
  const sb = { window: {} };
  vm.createContext(sb);
  vm.runInContext(read('js/i18n.js'), sb);
  const dict = (sb.window.OING_I18N || {}) || {};
  ['zh', 'en'].forEach((lang) => {
    if (!dict[lang]) { fails.push('js/i18n.js 缺少 ' + lang + ' 词条'); return; }
    CHIP_EXPECT.forEach((expect, i) => {
      const text = dict[lang]['ask.chip' + (i + 1)];
      if (!text) { fails.push(lang + ' 缺少 ask.chip' + (i + 1)); return; }
      const engine = lang === 'en' ? en : zh;
      const r = engine.match(text);
      if (r.id !== expect) {
        fails.push(lang + ' 建议问题「' + text + '」期望 ' + expect + '，实际 ' + (r.id || '兜底') +
          '（分数 ' + r.score.toFixed(2) + '）');
      }
    });
  });
})();

function run(engine, langLabel) {
  for (const [q, expect] of CASES) {
    const r = engine.match(q);
    const got = r.id;
    if (got === expect) { pass++; continue; }
    fails.push(langLabel + ' 「' + q + '」 期望 ' + (expect || '兜底') + '，实际 ' +
      (got || '兜底') + '（分数 ' + r.score.toFixed(2) + '）');
  }
}

// 中文用例跑中文引擎；英文用例（含问号且是 ASCII 的）跑英文引擎
const isAscii = (s) => /^[\x20-\x7e]+$/.test(s);
run(zh, 'zh');
// 英文用例单独在 en 引擎下再跑一遍（语言只影响取哪段答案，不影响路由，但要确认不会崩）
let enPass = 0;
for (const [q] of CASES) { if (isAscii(q)) { en.match(q); enPass++; } }

// 覆盖率：每个条目至少要有一个用例打到
const ids = (function () {
  const sandbox = { window: {}, document: { documentElement: { lang: 'zh' } } };
  sandbox.window.document = sandbox.document;
  vm.createContext(sandbox);
  vm.runInContext(read('js/qa.js'), sandbox);
  return sandbox.window.OING_QA.map((e) => e.id);
})();
const covered = new Set();
for (const [, expect] of CASES) if (expect) covered.add(expect);
for (const id of ids) if (!covered.has(id)) fails.push('条目「' + id + '」没有任何测试用例覆盖');

// 每条目的 zh / en 都必须有，且非空
for (const id of ids) {
  const e = (function () { const s = { window: {}, document: { documentElement: { lang: 'zh' } } }; s.window.document = s.document; vm.createContext(s); vm.runInContext(read('js/qa.js'), s); return s.window.OING_QA.find((x) => x.id === id); })();
  if (!e.zh || !e.zh.trim()) fails.push('条目「' + id + '」缺少中文答案');
  if (!e.en || !e.en.trim()) fails.push('条目「' + id + '」缺少英文答案');
  if (!e.keys || !e.keys.length) fails.push('条目「' + id + '」没有关键词');
}

console.log('事实库 ' + ids.length + ' 条 · 用例 ' + CASES.length + ' 个 · 通过 ' + pass + ' · 英文引擎额外跑 ' + enPass);
if (fails.length) {
  console.log('\n失败 ' + fails.length + ' 项：');
  fails.forEach((f) => console.log('  x ' + f));
  process.exit(1);
}
console.log('全部通过 ✓');
