/**
 * 站点问答 —— 检索引擎 + 界面接线。
 *
 * 分层设计：
 *   1. 先查本地「事实库」（js/qa.js）。命中就直接回答 —— 免费、瞬时、**不可能编造**。
 *   2. 没命中、并且配了 config.askEndpoint，才把问题发给远端（worker/ 里的 Cloudflare
 *      Worker，由它带着事实库去问 OpenRouter 的免费模型，并在 system prompt 里
 *      把模型锁死在已确认事实上）。
 *   3. 远端失败或超时，回退到本地兜底文案 —— 任何时候都不会"点了没反应"。
 *
 * 检索方式：把提问与关键词都归一化（只留汉字/字母/数字、转小写），先看完整短语是否
 * 被包含（强信号），再退到二元组重合率（容忍换个说法）。低于阈值就当答不上来。
 *
 * 想换成别的后端？只改 remoteAsk() 一个函数即可，界面一行不用动。
 */
(function () {
  'use strict';

  var THRESHOLD = 0.42;
  // 远端是免费模型，实测 1.5s ~ 43s 都有（免费额度会排队）。
  // Worker 那边有自己的时间预算（单模型 8 秒、整体 20 秒，见 worker/src/index.js），
  // 所以这里只要略大于那个预算即可 —— 留太多会白等，留太少会把刚要返回的回答丢掉。
  var REMOTE_TIMEOUT = 26000;

  var CFG = (typeof window !== 'undefined' && window.OING_CONFIG) || {};
  var ENDPOINT = typeof CFG.askEndpoint === 'string' ? CFG.askEndpoint.trim() : '';

  /* ------------------------------------------------------------ 检索引擎 */

  function normalize(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '');
  }

  function bigrams(s) {
    var out = [];
    if (s.length < 2) { if (s) out.push(s); return out; }
    for (var i = 0; i < s.length - 1; i++) out.push(s.substr(i, 2));
    return out;
  }

  /*
   * 单条打分：0 ~ 1
   *
   * 两种命中方式：
   *   1. 完整短语被包含（强信号）：0.6 + 0.4 × 关键词长度 / 问题长度
   *   2. 二元组重合率（容忍换个说法）：逐关键词算，要求 ≥ 50%
   * 问题短于 6 个字时完全不做模糊匹配 —— 短串上二元组极不可靠。
   */
  function scoreEntry(qn, entry) {
    var best = 0;
    var keys = entry.keys || [];
    var bg = bigrams(qn);
    var useBigrams = bg.length > 0 && qn.length >= 6;

    for (var i = 0; i < keys.length; i++) {
      var k = normalize(keys[i]);
      if (!k) continue;

      if (qn.indexOf(k) >= 0) {
        var s = 0.6 + 0.4 * Math.min(1, k.length / Math.max(2, qn.length));
        if (s > best) best = s;
      }

      // 二元组**逐关键词**算，不把所有关键词拼成一个大串。
      // 拼串会跨边界命中无关片段：实测「x.ai 是什么」命中了 email-domain，
      // 因为 'whyistheemail' 里的 'ai' 和问题里的 'ai' 撞上了。
      // 另外要求 ≥ 50% 命中，否则「什么是 Rust」也会被蹭到（0.5 就能过 0.42 阈值）。
      if (useBigrams) {
        var kb = bigrams(k);
        var seen = {};
        for (var a = 0; a < kb.length; a++) seen[kb[a]] = 1;
        var hit = 0;
        for (var b = 0; b < bg.length; b++) if (seen[bg[b]]) hit++;
        var ratio = hit / bg.length;
        if (ratio >= 0.5 && ratio > best) best = ratio;
      }
    }
    return best;
  }

  function currentLang() {
    try { return document.documentElement.lang === 'en' ? 'en' : 'zh'; } catch (e) { return 'zh'; }
  }

  function t(key) {
    if (typeof window !== 'undefined' && typeof window.oingT === 'function') return window.oingT(key);
    return key;
  }

  /** 本地检索：返回 { id, score, text }，id 为 null 表示没匹配上 */
  function match(query) {
    var qn = normalize(query);
    var data = (typeof window !== 'undefined' && window.OING_QA) || [];
    var lang = currentLang();
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < data.length; i++) {
      var s = scoreEntry(qn, data[i]);
      if (s > bestScore) { bestScore = s; best = data[i]; }
    }
    if (!qn || !best || bestScore < THRESHOLD) {
      var fb = (typeof window !== 'undefined' && window.OING_QA_FALLBACK) || {};
      return { id: null, score: bestScore, text: fb[lang] || fb.zh || '' };
    }
    // 有的条目分「本地版」与「接了模型版」两种答案（比如「你是不是 AI」）
    var text = (ENDPOINT && best['remote' + (lang === 'en' ? 'En' : 'Zh')]) ||
      best[lang] || best.zh;
    return { id: best.id, score: bestScore, text: text };
  }

  /* ------------------------------------------------------------ 远端调用 */

  /**
   * 返回 Promise<{text}|{quota:true}|null>：成功给文本，额度用完单独标记，其余给 null（由调用方回退）。
   * history 可选，形如 [{ role:'user'|'assistant', content }]，用于 /ask 页的连续追问。
   * 服务端会把它当不可信输入重新过滤（角色白名单、单条 500 字、最多 6 轮）。
   */
  function remoteAsk(query, history) {
    if (!ENDPOINT || typeof fetch !== 'function') return Promise.resolve(null);
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, REMOTE_TIMEOUT);
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: query, lang: currentLang(), history: history || [] }),
      signal: ctl ? ctl.signal : undefined,
    }).then(function (res) {
      clearTimeout(timer);
      return res.json().catch(function () { return null; });
    }).then(function (data) {
      // 上游免费额度当天用完（每天只有 50 次）。这不是故障，
      // 要如实告诉用户原因，否则他会以为功能坏了。
      if (data && data.error === 'quota') return { quota: true };
      if (data && typeof data.text === 'string' && data.text.trim()) return { text: data.text.trim() };
      // 后端明确说上游全挂了：它会把本地兜底文案一起带回来
      if (data && typeof data.fallback === 'string' && data.fallback.trim()) return { text: data.fallback.trim() };
      return null;
    }).catch(function () {
      clearTimeout(timer);
      return null;
    });
  }

  /* ------------------------------------------------------------ 界面接线 */

  var els = {};
  var seq = 0;

  function render(query, state) {
    if (!els.answer) return;
    els.q.textContent = query;
    els.a.textContent = state.text;
    els.answer.hidden = false;
    els.answer.classList.toggle('is-miss', !!state.miss);
    els.answer.classList.toggle('is-pending', !!state.pending);
    if (els.src) {
      els.src.textContent = state.src || (state.remote ? t('ask.remoteSrc') : '');
      els.src.hidden = !els.src.textContent;
    }
    // 「继续追问」把这个问题带到 /ask，那边保留上下文可以接着问
    if (els.more) els.more.setAttribute('href', 'ask.html?q=' + encodeURIComponent(query));
    if (els.answer.scrollIntoView) {
      try { els.answer.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    }
  }

  function clearInput() {
    if (!els.input) return;
    els.input.value = '';
    els.input.style.height = 'auto';
    if (els.send) els.send.disabled = true;
  }

  /** 回答一个问题。返回 true 表示已处理。 */
  function answer(query) {
    var text = String(query == null ? '' : query).trim();
    if (!text) return false;
    var mine = ++seq;
    var local = match(text);

    render(text, { text: local.text, miss: !local.id, pending: false, remote: false });
    clearInput();

    if (!local.id && ENDPOINT) {
      render(text, { text: t('ask.thinking'), miss: false, pending: true, remote: false });
      remoteAsk(text).then(function (out) {
        if (mine !== seq) return;                       // 期间又问了别的，丢弃这次结果
        if (out && out.text) {
          render(text, { text: out.text, miss: false, pending: false, remote: true });
        } else if (out && out.quota) {
          // 额度用完：给本地兜底，并说明原因
          render(text, { text: local.text, miss: true, pending: false, remote: false, src: t('ask.quotaNote') });
        } else {
          render(text, { text: local.text, miss: true, pending: false, remote: false });
        }
      });
    }
    return true;
  }

  function boot() {
    if (typeof document === 'undefined' || !document.getElementById) return;
    els.answer = document.getElementById('answer');
    if (!els.answer) return;
    els.q = document.getElementById('answer-q');
    els.a = document.getElementById('answer-a');
    els.src = document.getElementById('answer-src');
    els.more = document.getElementById('answer-more');
    els.input = document.getElementById('prompt');
    els.send = document.getElementById('send-btn');

    var chips = document.querySelectorAll('[data-ask]');
    Array.prototype.forEach.call(chips, function (btn) {
      btn.addEventListener('click', function () { answer(btn.textContent.trim()); });
    });
  }

  // 接了远端时，输入框下面那句说明要换成对应的说法。
  // ⚠️ 必须在这里**同步**做掉：main.js 排在 ask.js 后面，它会在解析阶段就按当前
  // data-i18n 渲染一遍。如果等 DOMContentLoaded 再换属性，页面就会先渲染成旧文案，
  // 而后不会再重新渲染。这个元素在脚本之前就已经解析出来了，所以现在就能改。
  if (typeof document !== 'undefined' && ENDPOINT) {
    try {
      var noteEl = document.querySelector('.composer-note');
      if (noteEl) noteEl.setAttribute('data-i18n', 'ask.noteRemote');
    } catch (e) { /* 元素不存在就算了 */ }
  }

  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  var api = {
    match: match, answer: answer, remoteAsk: remoteAsk,
    scoreEntry: scoreEntry, normalize: normalize,
    THRESHOLD: THRESHOLD, endpoint: ENDPOINT,
  };
  if (typeof window !== 'undefined') window.OingAsk = api;
})();
