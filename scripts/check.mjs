/**
 * 站点自检 —— node scripts/check.mjs   （或 npm run check）
 * 任何一项失败都会以非 0 退出码结束，方便放进 CI 或 git pre-push。
 *
 * 检查项：
 *  1. HTML 里引用的 i18n key 在 zh / en 中都必须存在
 *  2. 本地资源引用（css / js / 图片 / 页面）必须真实存在
 *  3. 资源版本号 ?v= 必须与 package.json 的 version 一致
 *  4. CNAME / sitemap / manifest 内容与文件一致
 *  5. HTML 标签必须闭合配平，id 不能重复
 *  6. data-link 的 key 必须在 js/config.js 中定义
 *  7. 不得出现第三方品牌词（防止把别人的商标、公司名带进来）
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const pkg = JSON.parse(read('package.json'));
const VERSION = pkg.version;
const HTML_FILES = ['index.html', 'legal.html', '404.html'];

/* ------------------------------------------------- 语法：JS 全部能被解析 */
// 浏览器脚本（普通 script）用 vm.Script 解析；ESM 用 node --check，
// 两者都不可用时退化为"剥掉 import/export 再解析"，保证脚本本身不会因为
// 环境限制而误报。
function collectJs() {
  const plain = ['js/config.js', 'js/i18n.js', 'js/main.js', 'js/flowfield.js', 'js/header.js', 'js/qa.js', 'js/ask.js'];
  const modules = ['scripts/gen-icons.mjs', 'scripts/serve.mjs', 'scripts/check.mjs'];

  for (const f of plain) {
    if (!exists(f)) { fail('缺少脚本文件 ' + f); continue; }
    try { new vm.Script(read(f), { filename: f }); }
    catch (e) { fail('语法错误 ' + f + ' :: ' + e.message); }
  }

  let spawnOk = true;
  for (const f of modules) {
    if (!exists(f)) { fail('缺少脚本文件 ' + f); continue; }
    if (spawnOk) {
      try {
        execFileSync(process.execPath, ['--check', path.join(ROOT, f)], { stdio: 'pipe' });
        continue;
      } catch (e) {
        if (e && e.status !== undefined) { fail('语法错误 ' + f + ' :: ' + String(e.stderr || e.message).trim().split('\n').pop()); continue; }
        spawnOk = false; // 无法启动子进程，退化处理
      }
    }
    const stripped = read(f)
      .replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^\s*export\s+/gm, '');
    if (/^\s*(import|export)\s/m.test(stripped)) { warn('未能完全剥离模块语法，跳过 ' + f + ' 的语法校验'); continue; }
    try { new vm.Script(stripped, { filename: f }); }
    catch (e) { fail('语法错误 ' + f + ' :: ' + e.message); }
  }
}
collectJs();

/* ------------------------------------------- 1 i18n key 完整性（zh / en） */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('js/i18n.js'), sandbox);
const DICT = sandbox.window.OING_I18N || {};

const usedKeys = new Set();
for (const f of HTML_FILES) {
  const src = read(f);
  for (const m of src.matchAll(/data-i18n(?:-placeholder)?="([^"]+)"/g)) usedKeys.add(m[1]);
}
for (const key of usedKeys) {
  if (!DICT.zh || !(key in DICT.zh)) fail('i18n 缺少中文词条：' + key);
  if (!DICT.en || !(key in DICT.en)) fail('i18n 缺少英文词条：' + key);
}
for (const lang of ['zh', 'en']) {
  for (const key of Object.keys(DICT[lang] || {})) {
    if (!usedKeys.has(key) && !read('js/main.js').includes("'" + key + "'") && !read('js/i18n.js').includes("'" + key + "'")) {
      warn('词条未被任何页面或脚本使用：' + lang + ' / ' + key);
    }
  }
}

/* ------------------------------- 1.5 HTML 兜底文本必须与中文词条一致 */
// 页面在 JS 跑起来之前用 HTML 里写死的文本渲染；如果它和词条漂移了，
// 无脚本用户（以及首屏前的一瞬间）看到的就是过期内容。这条规则专门防这个。
const FALLBACK = /<([a-z0-9]+)([^>]*?\sdata-i18n="([^"]+)"[^>]*)>([^<]*)<\/\1>/gi;
for (const f of HTML_FILES) {
  const src = read(f);
  for (const m of src.matchAll(FALLBACK)) {
    const key = m[3];
    const shown = m[4].trim();
    if (!shown) continue;                       // 空元素交给 JS 填，不校验
    const expect = (DICT.zh || {})[key];
    if (typeof expect !== 'string') continue;   // 缺词条的问题上面已经报过
    if (shown !== expect) {
      fail(f + ' 的兜底文本与词条不一致：' + key + '\n      页面写的是「' + shown + '」\n      词条里是「' + expect + '」');
    }
  }
}

/* ------------------------------------------------ 2 本地资源引用都存在 */
const ASSET_ATTR = /(?:src|href)="([^"]+)"/g;
for (const f of HTML_FILES) {
  for (const m of read(f).matchAll(ASSET_ATTR)) {
    let url = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/i.test(url)) continue;
    url = url.split('?')[0].split('#')[0];
    if (!url) continue;
    const target = url.startsWith('/') ? url.slice(1) : path.posix.join(path.posix.dirname(f), url);
    if (!exists(target)) fail(f + ' 引用了不存在的文件：' + m[1]);
  }
}

/* ------------------------------------------------------ 3 资源版本号一致 */
for (const f of HTML_FILES) {
  const src = read(f);
  for (const m of src.matchAll(/\?(?:v|ver)=([0-9][\w.-]*)/g)) {
    if (m[1] !== VERSION) fail(f + ' 里的资源版本号 ' + m[1] + ' 与 package.json 的 ' + VERSION + ' 不一致');
  }
}
for (const f of ['css/style.css', 'css/fonts.css', 'js/main.js', 'js/flowfield.js', 'js/header.js', 'js/qa.js', 'js/ask.js']) {
  if (!exists(f)) fail('缺少 ' + f);
}

/* 站内问答：脚本、界面、样式三者必须齐全，事实库不能为空 */
const homeHtml = read('index.html');
if (homeHtml.includes('data-ask')) {
  if (!homeHtml.includes('id="answer"')) fail('index.html 缺少 #answer 回答容器');
  if (!homeHtml.includes('js/qa.js')) fail('index.html 没有加载 js/qa.js');
  if (!homeHtml.includes('js/ask.js')) fail('index.html 没有加载 js/ask.js');
  if (!/\.answer__a/.test(read('css/style.css'))) fail('css/style.css 里缺少 .answer__a 规则');
  var qaSandbox = { window: {} };
  vm.createContext(qaSandbox);
  vm.runInContext(read('js/qa.js'), qaSandbox);
  var entries = qaSandbox.window.OING_QA || [];
  if (entries.length < 5) fail('js/qa.js 的事实库条目太少（' + entries.length + ' 条）');
  for (var qi = 0; qi < entries.length; qi++) {
    var e = entries[qi];
    if (!e.id) fail('js/qa.js 第 ' + (qi + 1) + ' 条缺少 id');
    if (!e.zh || !e.zh.trim()) fail('js/qa.js 条目「' + e.id + '」缺少中文答案');
    if (!e.en || !e.en.trim()) fail('js/qa.js 条目「' + e.id + '」缺少英文答案');
    if (!e.keys || !e.keys.length) fail('js/qa.js 条目「' + e.id + '」没有关键词');
  }
  if (!qaSandbox.window.OING_QA_FALLBACK) fail('js/qa.js 缺少 OING_QA_FALLBACK');
}

/* 悬浮胶囊页头：结构、样式、脚本三者必须齐全 */
for (const f of HTML_FILES) {
  const src = read(f);
  if (!src.includes('class="header-bar"')) continue;
  if (!src.includes('js/header.js')) fail(f + ' 有 .header-bar 但没有加载 js/header.js');
  if (!/\.header-bar[^{]*\{/.test(read('css/style.css'))) fail('css/style.css 里缺少 .header-bar 规则');
  if (!/\.header-bar\.is-scrolled/.test(read('css/style.css'))) fail('css/style.css 里缺少 .header-bar.is-scrolled 规则');
  if (!/OingHeader/.test(read('js/header.js'))) fail('js/header.js 没有注册 window.OingHeader');
}

/* 自托管字体：@font-face 里引用的每个文件都必须真的存在 */
const fontsCss = read('css/fonts.css');
const fontFiles = [...fontsCss.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1].replace(/^\.\.\//, ''));
if (!fontFiles.length) fail('css/fonts.css 里没有任何 @font-face 文件引用');
for (const f of fontFiles) {
  if (!exists(f)) fail('css/fonts.css 引用了不存在的字体文件 ' + f);
}

/* 首屏有流场画布，就必须真的加载流场脚本 */
const indexHtml = read('index.html');
if (indexHtml.includes('hero-canvas')) {
  if (!indexHtml.includes('js/flowfield.js')) fail('index.html 有 .hero-canvas 但没有加载 js/flowfield.js');
  if (indexHtml.includes('flowfield.js') && !/OingFlowField/.test(read('js/flowfield.js'))) {
    fail('js/flowfield.js 没有注册 window.OingFlowField');
  }
}

/* ------------------------------------------------------ 4 配置类文件一致 */
const cname = read('CNAME').trim();
if (cname !== 'www.oing.top') fail('CNAME 内容应为 www.oing.top，实际为 ' + JSON.stringify(cname));

const manifest = JSON.parse(read('site.webmanifest'));
for (const icon of manifest.icons || []) {
  const p = icon.src.replace(/^\//, '');
  if (!exists(p)) fail('manifest 引用了不存在的图标 ' + icon.src);
}
for (const key of ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'og-cover.png']) {
  if (!exists('assets/' + key)) fail('缺少图标 assets/' + key + '（运行 npm run icons 生成）');
}

const sitemap = read('sitemap.xml');
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const p = m[1].replace(/^https:\/\/www\.oing\.top\/?/, '') || 'index.html';
  if (!exists(p)) fail('sitemap 里的 ' + m[1] + ' 对应文件不存在');
}

/* ----------------------------------------- 5 标签配平 / id 唯一（粗略但有效） */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'path', 'circle', 'rect', 'stop', 'use', 'line', 'polyline', 'polygon', 'ellipse']);

function checkStructure(file) {
  let src = read(file).replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  const ids = new Map();
  for (const m of src.matchAll(/<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|[^>"])*?)(\/?)>/g)) {
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrs = m[3] || '';
    const selfClose = m[4] === '/';
    if (closing) {
      const top = stack.pop();
      if (top !== tag) fail(file + ' 标签闭合不匹配：期望 </' + (top || '?') + '>，实际 </' + tag + '>');
    } else if (!selfClose && !VOID.has(tag)) {
      stack.push(tag);
    }
    if (!closing) {
      const idm = /\sid="([^"]+)"/.exec(attrs);
      if (idm) {
        if (ids.has(idm[1])) fail(file + ' 出现重复 id：' + idm[1]);
        ids.set(idm[1], true);
      }
    }
  }
  if (stack.length) fail(file + ' 有未闭合标签：' + stack.join(' > '));
}
HTML_FILES.forEach(checkStructure);

/* --------------------------------------------------- 6 data-link key 合法 */
const cfgSandbox = { window: {} };
vm.createContext(cfgSandbox);
vm.runInContext(read('js/config.js'), cfgSandbox);
const CFG = cfgSandbox.window.OING_CONFIG || {};
const linkKeys = Object.keys(CFG.links || {});
for (const f of HTML_FILES) {
  for (const m of read(f).matchAll(/data-link="([^"]+)"/g)) {
    if (!linkKeys.includes(m[1])) fail(f + ' 使用了未在 js/config.js 中定义的 data-link：' + m[1]);
  }
}
if (!CFG.site || !/^https:\/\//.test(CFG.site)) fail('js/config.js 的 site 必须是 https 地址');

/* --------------------- 6.5 站内问答的远端端点必须与隐私政策一致 */
/*
 * 这是本轮最容易忘、后果最严重的一条：一旦把提问发给第三方模型服务，
 * 隐私政策里那句「本站不收集任何个人数据 / 不接入任何第三方」就变成不实陈述了。
 * 所以只要配置里开了 askEndpoint，就强制要求隐私政策写明这件事。
 */
const askEndpoint = String(CFG.askEndpoint || '').trim();
if (askEndpoint) {
  for (const f of ['worker/src/index.js', 'worker/src/models.js', 'worker/src/prompt.js',
                   'worker/wrangler.toml', 'worker/src/facts.js', 'scripts/build-facts.mjs']) {
    if (!exists(f)) fail('config.js 配了 askEndpoint（' + askEndpoint + '），但缺少 ' + f);
  }
  const i18nSrc = read('js/i18n.js');
  if (i18nSrc.indexOf('OpenRouter') === -1) {
    fail('配了 askEndpoint，但隐私政策里没有写明「提问会被发送给 OpenRouter」—— 属于不实陈述');
  }
  if (i18nSrc.indexOf('不保存提问内容') === -1 || i18nSrc.indexOf('do not store your question') === -1) {
    fail('隐私政策里没有写明「本站不保存提问内容」');
  }
  if (!/[Oo]penRouter/.test(read('legal.html')) && i18nSrc.indexOf('OpenRouter') === -1) {
    fail('法务页没有向访客说明提问会转交第三方');
  }
  // worker 的事实库必须与 js/qa.js 同步
  const qaSandbox2 = { window: {} };
  vm.createContext(qaSandbox2);
  vm.runInContext(read('js/qa.js'), qaSandbox2);
  const qaList = qaSandbox2.window.OING_QA || [];
  const workerFacts = read('worker/src/facts.js');
  for (const entry of qaList) {
    const text = entry.remoteZh || entry.zh;
    if (text && workerFacts.indexOf(JSON.stringify(text)) === -1) {
      fail('worker/src/facts.js 与 js/qa.js 不同步（条目 ' + entry.id + '），跑 npm run build:facts');
      break;
    }
  }
}

/* ----------------------------------- 7 不得带入第三方品牌词 / 备案号 */
/*
 * 规则设计（为什么不是简单地"出现即失败"）：
 * 站内问答**必须**能回答「你们和 DeepSeek 什么关系」—— 答案里必然要指名，
 * 而且要明确写出"无关联、未获授权"。所以正确的规则不是禁止出现，而是：
 *
 *   1. 只允许在**文案层**（js/qa.js、js/i18n.js）指名，HTML / CSS / 其它 JS 里出现一律失败；
 *   2. 一旦文案层指名了，整个项目就必须同时存在**中英双语**的"无关联"声明；
 *   3. 任何一行只要带了免责声明，任何文件里都放行。
 *
 * 效果：可以把关系说清楚，但不能拿别人的商标当卖点。
 */
const BRAND_COPY_FILES = ['js/qa.js', 'js/i18n.js'];
const BRAND_LINE_OK = /无关联|未获授权|not affiliated|endorsed by or authorised|不代表任何第三方/;
const BANNED = [
  { re: /deepseek/i, why: '第三方品牌名' },
  { re: /深度求索/, why: '第三方公司名' },
  { re: /浙ICP备|浙B2-|浙公网安备/, why: '第三方备案号' },
  { re: /chat\.deepseek\.com|platform\.deepseek\.com|api-docs\.deepseek\.com/, why: '第三方业务链接' },
];
const SCAN = ['index.html', 'legal.html', '404.html', 'css/style.css', 'js/main.js', 'js/config.js', 'js/qa.js', 'js/i18n.js', 'README.md'];
for (const f of SCAN) {
  if (!exists(f)) continue;
  if (f === 'README.md') continue;             // README 要用来说清版权边界
  if (BRAND_COPY_FILES.includes(f)) continue;  // 文案层见下面的单独校验
  read(f).split('\n').forEach((text, i) => {
    if (BRAND_LINE_OK.test(text)) return;      // 带免责声明的行放行
    // HTML 里带 data-i18n 的行，文字归属文案层（本脚本还会校验兜底文本与词条完全一致），
    // 所以文案层被允许说的话，这里也允许
    if (/\sdata-i18n(-[a-z]+)?="/.test(text)) return;
    for (const rule of BANNED) {
      const hit = rule.re.exec(text);
      if (hit) fail(f + ' 第 ' + (i + 1) + ' 行出现' + rule.why + '：' + text.trim().slice(0, 70));
    }
  });
}

// 文案层指名了第三方，就必须同时写明中英双语的「无关联」声明
const brandCopy = BRAND_COPY_FILES.filter(exists).map(read).join('\n');
if (/deepseek|深度求索/i.test(brandCopy)) {
  if (!/无关联/.test(brandCopy)) fail('文案里提到了第三方品牌，但没有写明「无关联」的中文声明');
  if (!/not affiliated/i.test(brandCopy)) fail('文案里提到了第三方品牌，但没有写明 not affiliated 的英文声明');
}

/* --------------------------------------------------------------- 汇总输出 */
const line = '-'.repeat(58);
console.log(line);
console.log('Oing 站点自检   版本 ' + VERSION);
console.log(line);
console.log('页面 ' + HTML_FILES.length + ' 个 · i18n 词条 ' + usedKeys.size + ' 条 · 语言 2 种 · 入口 ' + linkKeys.length + ' 个');
if (warnings.length) {
  console.log('\n提示（' + warnings.length + '）：');
  warnings.slice(0, 20).forEach((w) => console.log('  · ' + w));
  if (warnings.length > 20) console.log('  · …还有 ' + (warnings.length - 20) + ' 条');
}
if (errors.length) {
  console.log('\n错误（' + errors.length + '）：');
  errors.forEach((e) => console.log('  x ' + e));
  console.log(line);
  console.log('自检未通过');
  process.exit(1);
}
console.log('\n全部通过 ✓');
console.log(line);
