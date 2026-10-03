/**
 * 站点问答 —— 检索 + 界面接线。**不涉及任何模型。**
 *
 * 检索方式：把提问与「事实库」里的关键词都归一化（只保留汉字/字母/数字、转小写），
 * 先看完整短语是否被包含（强信号），再退到二元组重合率（容忍换个说法）。
 * 最高分低于阈值就当答不上来 —— 宁可明说不知道，也不猜。
 *
 * 想换成真正的模型/RAG？把 OingAsk.answer() 里的 match() 换成一次 fetch，
 * 界面部分一行都不用改。
 */
(function () {
  'use strict';

  var THRESHOLD = 0.42;

  function normalize(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '');
  }

  function bigrams(s) {
    var out = [];
    if (s.length < 2) { if (s) out.push(s); return out; }
    for (var i = 0; i < s.length - 1; i++) out.push(s.substr(i, 2));
    return out;
  }

  /** 单条打分：0 ~ 1 */
  function scoreEntry(qn, entry) {
    var best = 0;
    var blob = '';
    var keys = entry.keys || [];
    for (var i = 0; i < keys.length; i++) {
      var k = normalize(keys[i]);
      if (!k) continue;
      blob += k + '|';
      if (qn.indexOf(k) >= 0) {
        // 完整命中：短语越长、问题越短，分越高
        var s = 0.6 + 0.4 * Math.min(1, k.length / Math.max(2, qn.length));
        if (s > best) best = s;
      }
    }
    var bg = bigrams(qn);
    if (bg.length) {
      var hit = 0;
      for (var j = 0; j < bg.length; j++) if (blob.indexOf(bg[j]) >= 0) hit++;
      var ratio = hit / bg.length;
      if (ratio > best) best = ratio;
    }
    return best;
  }

  function currentLang() {
    try { return document.documentElement.lang === 'en' ? 'en' : 'zh'; } catch (e) { return 'zh'; }
  }

  /** 检索：返回 { id, score, text }，id 为 null 表示没匹配上 */
  function match(query) {
    var qn = normalize(query);
    var data = (typeof window !== 'undefined' && window.OING_QA) || [];
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < data.length; i++) {
      var s = scoreEntry(qn, data[i]);
      if (s > bestScore) { bestScore = s; best = data[i]; }
    }
    var lang = currentLang();
    if (!qn || !best || bestScore < THRESHOLD) {
      var fb = (typeof window !== 'undefined' && window.OING_QA_FALLBACK) || {};
      return { id: null, score: bestScore, text: fb[lang] || fb.zh || '' };
    }
    return { id: best.id, score: bestScore, text: best[lang] || best.zh };
  }

  /* ------------------------------------------------------------ 界面接线 */

  var els = {};

  function render(query, result) {
    if (!els.answer) return;
    els.q.textContent = query;
    els.a.textContent = result.text;
    els.answer.hidden = false;
    els.answer.classList.toggle('is-miss', !result.id);
    // 只在需要时滚动，避免每次回答都跳一下
    if (els.answer.scrollIntoView) {
      try { els.answer.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    }
  }

  /** 回答一个问题。返回 true 表示已处理。 */
  function answer(query) {
    var text = String(query == null ? '' : query).trim();
    if (!text) return false;
    var result = match(text);
    render(text, result);
    if (els.input) {
      els.input.value = '';
      els.input.style.height = 'auto';
      if (els.send) els.send.disabled = true;
    }
    return true;
  }

  function boot() {
    if (typeof document === 'undefined' || !document.getElementById) return;
    els.answer = document.getElementById('answer');
    if (!els.answer) return;
    els.q = document.getElementById('answer-q');
    els.a = document.getElementById('answer-a');
    els.input = document.getElementById('prompt');
    els.send = document.getElementById('send-btn');
    els.form = document.getElementById('composer');

    // 建议问题：直接拿按钮当前显示的文字去问，所以切换语言后问的也是对应语言的词
    var chips = document.querySelectorAll('[data-ask]');
    Array.prototype.forEach.call(chips, function (btn) {
      btn.addEventListener('click', function () { answer(btn.textContent.trim()); });
    });

    // 如果 composer 在（正常情况下会），把它标记成"问答"而不是"未配置"
    if (els.form) els.form.setAttribute('data-ask-ready', '');
  }

  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  var api = { match: match, answer: answer, scoreEntry: scoreEntry, normalize: normalize, THRESHOLD: THRESHOLD };
  if (typeof window !== 'undefined') window.OingAsk = api;
})();
