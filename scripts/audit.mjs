/**
 * 浏览器实测审计 —— node scripts/audit.mjs [--url http://127.0.0.1:4173/]
 *
 * 用 DevTools 协议直连无头 Edge/Chrome（零依赖，Node 内置 WebSocket），做三件事：
 *   1. 在多个视口宽度下找出"横向溢出"的元素（移动端最常见、最难靠肉眼定位的问题）
 *   2. 收集控制台报错与加载失败
 *   3. 顺带按指定明暗主题截图，产出可直接查看的 PNG
 *
 * 为什么不用 --screenshot：那个方式拿不到布局数据，也没法模拟 prefers-color-scheme。
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SHOT_DIR = path.join(ROOT, '.tmp');

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};
const BASE = arg('--url', 'http://127.0.0.1:4173/');
const PORT = Number(arg('--port', 9333));
const WANT_SHOTS = !argv.includes('--no-shots');

const CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const BROWSER = CANDIDATES.find((p) => fs.existsSync(p));
if (!BROWSER) {
  console.error('找不到 Edge 或 Chrome，跳过浏览器审计。');
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* --------------------------------------------------------------- CDP 客户端 */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        (this.handlers.get(msg.method) || []).forEach((fn) => fn(msg.params));
      }
    });
  }
  send(method, params) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('CDP 超时：' + method)); }
      }, 20000);
    });
  }
  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }
}

async function launch() {
  const proc = spawn(BROWSER, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--hide-scrollbars',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + path.join(SHOT_DIR, 'cdp-profile'),
    'about:blank',
  ], { stdio: 'ignore', detached: false });

  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch('http://127.0.0.1:' + PORT + '/json/version');
      if (res.ok) return proc;
    } catch (e) { /* 还没起来 */ }
    await sleep(250);
  }
  throw new Error('浏览器调试端口未就绪');
}

async function newTarget(url) {
  const res = await fetch('http://127.0.0.1:' + PORT + '/json/new?' + encodeURIComponent(url), { method: 'PUT' });
  if (!res.ok) throw new Error('无法创建标签页：' + res.status);
  return res.json();
}

const OVERFLOW_PROBE = `(() => {
  const vw = window.innerWidth;
  const out = [];
  document.querySelectorAll('*').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if (cs.position === 'fixed') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    const over = Math.round(Math.max(r.right - vw, -r.left));
    if (over > 1) {
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 60),
        id: el.id || '',
        right: Math.round(r.right),
        left: Math.round(r.left),
        width: Math.round(r.width),
        over,
      });
    }
  });
  out.sort((a, b) => b.over - a.over);
  return { vw, docScrollWidth: document.documentElement.scrollWidth, offenders: out.slice(0, 12) };
})()`;

const main = async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const proc = await launch();
  const report = { base: BASE, widths: [], console: [], failed: [], shots: [] };

  try {
    for (const width of [390, 768, 1440]) {
      const target = await newTarget('about:blank');
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
      const cdp = new CDP(ws);

      const logs = [];
      cdp.on('Runtime.consoleAPICalled', (p) => {
        if (p.type === 'error' || p.type === 'warning') {
          logs.push(p.type + ': ' + (p.args || []).map((a) => a.value || a.description || a.type).join(' '));
        }
      });
      cdp.on('Runtime.exceptionThrown', (p) => {
        logs.push('exception: ' + (p.exceptionDetails && p.exceptionDetails.text));
      });
      cdp.on('Network.loadingFailed', (p) => {
        report.failed.push({ width, url: p.requestId, error: p.errorText });
      });

      await cdp.send('Page.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('Network.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width, height: 900, deviceScaleFactor: 1, mobile: width < 760,
      });
      await cdp.send('Page.navigate', { url: BASE + '?theme=light' });
      await sleep(1400);

      const probe = await cdp.send('Runtime.evaluate', { expression: OVERFLOW_PROBE, returnByValue: true });
      const value = probe.result.value || probe.result;
      report.widths.push({ width, ...value });
      logs.forEach((l) => report.console.push('[' + width + 'px] ' + l));

      if (WANT_SHOTS && (width === 1440 || width === 390)) {
        for (const theme of ['light', 'dark']) {
          await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
          await cdp.send('Page.navigate', { url: BASE + '?theme=' + theme });
          await sleep(1200);
          const h = await cdp.send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true });
          const full = Math.min(h.result.value || 900, 4200);
          await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: full, deviceScaleFactor: 1, mobile: width < 760 });
          await sleep(500);
          const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
          const file = path.join(SHOT_DIR, 'audit-' + width + '-' + theme + '.png');
          fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
          report.shots.push(path.relative(ROOT, file).replace(/\\/g, '/'));
          await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 760 });
        }
      }
      ws.close();
    }
    /* ---------- 悬浮胶囊页头：滚动后是否真的收窄 + 玻璃是否淡入 ---------- */
    {
      const target = await newTarget('about:blank');
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
      const cdp = new CDP(ws);
      await cdp.send('Page.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await cdp.send('Page.navigate', { url: BASE + '?theme=light' });
      await sleep(1600);

      const expr = [
        '(async () => {',
        '  const bar = document.querySelector(".header-bar");',
        '  if (!bar) return { error: "页面上没有 .header-bar" };',
        '  const read = () => {',
        '    const cs = getComputedStyle(bar);',
        '    return {',
        '      w: Math.round(bar.getBoundingClientRect().width * 10) / 10,',
        '      h: Math.round(bar.getBoundingClientRect().height * 10) / 10,',
        '      max: cs.maxWidth, pl: cs.paddingLeft, pr: cs.paddingRight, pt: cs.paddingTop,',
        '      glass: bar.classList.contains("is-scrolled"),',
        '      bg: cs.backgroundColor, blur: cs.backdropFilter || cs.webkitBackdropFilter || "none",',
        '    };',
        '  };',
        '  const top = read();',
        '  window.scrollTo(0, 600);',
        '  await new Promise((r) => setTimeout(r, 1700));',
        '  const down = read();',
        '  const shot = null;',
        '  window.scrollTo(0, 0);',
        '  await new Promise((r) => setTimeout(r, 1700));',
        '  const back = read();',
        '  return { top, down, back };',
        '})()',
      ].join('\n');

      const res = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      const v = res.result && res.result.value;
      report.header = v;

      if (v && v.top && v.down) {
        // 收窄 + 内缩 + 玻璃
        // 横向：内缩量应等于 --hdr-inset（80px），不是写死的绝对宽度
        const inset = v.top.w - v.down.w;
        if (!(inset > 20)) fail('滚动后胶囊没有收窄：' + v.top.w + 'px → ' + v.down.w + 'px');
        if (Math.abs(inset - 80) > 3) fail('横向内缩量应为 80px，实际 ' + Math.round(inset) + 'px');
        if (v.down.w < 1000) fail('收窄后只有 ' + v.down.w + 'px，对本站页头内容来说太短了');
        // 纵向：应当变薄
        if (!(v.down.h < v.top.h - 4)) fail('滚动后胶囊没有变薄：' + v.top.h + 'px → ' + v.down.h + 'px');
        if (!v.down.glass) fail('滚动后没有加上 is-scrolled 类');
        if (v.down.blur === 'none') fail('滚动后玻璃没有模糊（backdrop-filter 仍是 none）');
        if (!(parseFloat(v.down.pl) > parseFloat(v.top.pl))) fail('滚动后左侧没有内缩');
        if (v.back && !(Math.abs(v.back.w - v.top.w) < 2)) fail('滚回顶部后胶囊没有复位：' + v.back.w + 'px（应回到 ' + v.top.w + 'px）');
        if (v.back && !(Math.abs(v.back.h - v.top.h) < 2)) fail('滚回顶部后胶囊高度没有复位');
      } else {
        fail('页头探测失败：' + JSON.stringify(v));
      }

      // 滚动状态截图，便于肉眼复核
      await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 600)' });
      await sleep(1700);
      // 注意：clip 用的是文档坐标，滚动后截 y=0 会截到视口外的空白。
      // 这里直接截整个视口，看到的就是用户真实所见。
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const file = path.join(SHOT_DIR, 'header-scrolled.png');
      fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
      report.shots.push(path.relative(ROOT, file).replace(/\\/g, '/'));
      await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
      await sleep(1200);
      const shot2 = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const file2 = path.join(SHOT_DIR, 'header-top.png');
      fs.writeFileSync(file2, Buffer.from(shot2.data, 'base64'));
      report.shots.push(path.relative(ROOT, file2).replace(/\\/g, '/'));
      ws.close();
    }

  } finally {
    proc.kill();
  }

  console.log('=== 横向溢出检查 ===');
  for (const w of report.widths) {
    const bad = w.offenders.filter((o) => o.over > 1);
    console.log('视口 ' + w.width + 'px  scrollWidth=' + w.docScrollWidth + (bad.length ? '  ✗ ' + bad.length + ' 个元素越界' : '  ✓ 无溢出'));
    bad.slice(0, 6).forEach((o) => {
      console.log('    ' + o.tag + (o.id ? '#' + o.id : '') + (o.cls ? '.' + o.cls.split(' ').join('.') : '') +
        '  left=' + o.left + ' right=' + o.right + ' w=' + o.width + ' 越界 ' + o.over + 'px');
    });
  }
  console.log('\n=== 悬浮胶囊页头 ===');
  if (report.header && report.header.top) {
    const h = report.header;
    console.log('  顶部   ' + h.top.w + '×' + h.top.h + 'px   paddingL=' + h.top.pl + ' padY=' + h.top.pt + '  玻璃=' + h.top.glass);
    console.log('  滚动后 ' + h.down.w + '×' + h.down.h + 'px   paddingL=' + h.down.pl + ' padY=' + h.down.pt + '  玻璃=' + h.down.glass);
    console.log('  复位后 ' + h.back.w + '×' + h.back.h + 'px   玻璃=' + h.back.glass);
    console.log('  横向内缩 ' + Math.round(h.top.w - h.down.w) + 'px · 纵向收 ' + Math.round(h.top.h - h.down.h) + 'px');
    console.log('  backdrop-filter: ' + h.down.blur);
  } else {
    console.log('  未能探测：' + JSON.stringify(report.header));
  }

  console.log('\n=== 控制台 ===');
  console.log(report.console.length ? report.console.join('\n') : '无报错 ✓');
  console.log('\n=== 加载失败 ===');
  console.log(report.failed.length ? JSON.stringify(report.failed) : '无 ✓');
  if (report.shots.length) console.log('\n截图：\n' + report.shots.join('\n'));

  const overflow = report.widths.some((w) => w.offenders.some((o) => o.over > 1));
  process.exit(overflow || report.console.length ? 1 : 0);
};

main().catch((e) => { console.error('审计失败：' + e.message); process.exit(2); });
