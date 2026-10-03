/**
 * 站点交互脚本 —— 原生 JS，无依赖。
 * 主题切换、移动端抽屉、磨砂输入卡、入口链接、滚动动效。
 */
(function () {
  'use strict';

  var CFG = window.OING_CONFIG || {};
  var LINKS = CFG.links || {};
  var KEY = { theme: 'oing:theme', lang: 'oing:lang', announce: 'oing:announce:hidden' };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { /* 隐私模式忽略 */ }
    return null;
  }

  /* --------------------------------------------------------------- 提示条 */
  var toastEl = $('#toast');
  var toastTimer = null;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add('is-visible'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
      setTimeout(function () { toastEl.hidden = true; }, 280);
    }, 2800);
  }

  /* --------------------------------------------------------------- 多语言 */
  function setLang(lang) {
    store(KEY.lang, lang);
    if (typeof window.oingApplyLang === 'function') window.oingApplyLang(lang);
    $$('.lang-switch button').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-lang') === lang);
    });
  }
  $$('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang') || 'zh'); });
  });

  /* ----------------------------------------------------------------- 主题 */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f1115' : '#f9f8f8');
  }
  var themeBtn = $('#theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store(KEY.theme, next);
      toast(window.oingT(next === 'dark' ? 'msg.theme.dark' : 'msg.theme.light'));
    });
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!store(KEY.theme)) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ----------------------------------------------------------- 移动端抽屉 */
  var navToggle = $('#nav-toggle');
  var nav = $('#primary-nav');
  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#primary-nav a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* 页头的悬浮胶囊收放由 js/header.js 负责（弹簧积分），这里不再插手。 */

  /* --------------------------------------------------------------- 公告条 */
  var announce = $('#hero-announce');
  if (announce && store(KEY.announce) === '1') announce.hidden = true;

  /* --------------------------------------------------------------- 入口链接 */
  $$('[data-link]').forEach(function (el) {
    var url = LINKS[el.getAttribute('data-link')];
    if (url) {
      el.setAttribute('href', url);
      if (/^https?:/i.test(url)) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    } else {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        toast(window.oingT('msg.notConfigured'));
      });
    }
  });

  /* --------------------------------------------------------- 输入卡与发送 */
  var form = $('#composer');
  var textarea = $('#prompt');
  var sendBtn = $('#send-btn');

  function autoGrow() {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
    if (sendBtn) sendBtn.disabled = textarea.value.trim().length === 0;
  }

  if (textarea) {
    textarea.addEventListener('input', autoGrow);
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        if (textarea.value.trim() && form) form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
    autoGrow();
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = textarea ? textarea.value.trim() : '';
      // 配了真实对话服务就跳过去；否则用站内问答回答
      if (LINKS.chat) {
        var joiner = LINKS.chat.indexOf('?') === -1 ? '?' : '&';
        window.open(LINKS.chat + (q ? joiner + 'q=' + encodeURIComponent(q) : ''), '_blank', 'noopener');
        return;
      }
      if (window.OingAsk && window.OingAsk.answer(q)) return;
      toast(window.oingT('msg.sent'));
    });
  }

  var attachBtn = $('#attach-btn');
  if (attachBtn) attachBtn.addEventListener('click', function () { toast(window.oingT('msg.attached')); });

  $$('.pill-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* --------------------------------------------------------------- 滚动动效 */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 5, 4) * 55 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* --------------------------------------------------------------- 配置注入 */
  var qr = $('#qr-img');
  if (qr && CFG.qrImage) qr.setAttribute('src', CFG.qrImage);

  // 所有联系入口都从 config.email 取，页面上不写死地址
  if (CFG.email) {
    $$('[data-email]').forEach(function (el) {
      el.setAttribute('href', 'mailto:' + CFG.email);
      if (el.hasAttribute('data-email-text')) el.textContent = CFG.email;
    });
  }

  /* 复制到剪贴板。Clipboard API 在页面没有焦点、或非安全上下文时会直接拒绝，
     所以失败必须回退到 execCommand，不能静默吞掉。 */
  function copyText(text) {
    function legacy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText(text).catch(legacy);
        return;
      } catch (e) { /* 落到下面的兜底 */ }
    }
    legacy();
  }

  /* 很多机器（尤其是没装邮件客户端的 Windows）根本没有 mailto: 处理程序，
     点下去毫无反应。所以点击时顺手把地址复制到剪贴板并给个提示 ——
     有邮件客户端的话照常打开，没有的话用户至少拿到了地址。 */
  $$('[data-copy-email]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (!CFG.email) return;
      copyText(CFG.email);
      toast(window.oingT('msg.emailCopied'));
    });
  });

  var copyright = $('#copyright');
  if (copyright) copyright.textContent = '© ' + new Date().getFullYear() + ' ' + (CFG.brand || 'Oing');

  /* ----------------------------------------------------------------- 初始化 */
  setLang(store(KEY.lang) === 'en' ? 'en' : 'zh');
})();
