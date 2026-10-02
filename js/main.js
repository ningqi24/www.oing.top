/**
 * 站点交互脚本 —— 无依赖，原生 JS。
 * 覆盖：主题切换、移动端菜单、公告条、输入框、入口链接、滚动动效、滚动高亮。
 */
(function () {
  'use strict';

  var CFG = window.OING_CONFIG || {};
  var LINKS = CFG.links || {};
  var STORE = {
    theme: 'oing:theme',
    lang: 'oing:lang',
    announce: 'oing:announce:hidden',
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) { /* 隐私模式下忽略 */ }
    return null;
  }

  /* ------------------------------------------------------------- 提示条 */
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
      setTimeout(function () { toastEl.hidden = true; }, 260);
    }, 2800);
  }

  /* ------------------------------------------------------------- 多语言 */
  function setLang(lang) {
    store(STORE.lang, lang);
    if (typeof window.oingApplyLang === 'function') window.oingApplyLang(lang);
    $$('.lang-switch button').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-lang') === lang);
    });
  }
  $$('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang') || 'zh'); });
  });

  /* --------------------------------------------------------------- 主题 */
  var themeBtn = $('#theme-toggle');
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0e14' : '#ffffff');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store(STORE.theme, next);
      var key = next === 'dark' ? 'msg.theme.dark' : 'msg.theme.light';
      var table = (window.OING_I18N || {})[document.documentElement.lang === 'en' ? 'en' : 'zh'] || {};
      if (table[key]) toast(table[key]);
    });
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!store(STORE.theme)) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* --------------------------------------------------------- 移动端菜单 */
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
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* --------------------------------------------------------- 页头滚动态 */
  var header = $('#site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ----------------------------------------------------------- 公告条 */
  var announce = $('#announce');
  var announceClose = $('#announce-close');
  if (announce) {
    if (store(STORE.announce) !== '1') announce.hidden = false;
    if (announceClose) {
      announceClose.addEventListener('click', function () {
        announce.hidden = true;
        store(STORE.announce, '1');
      });
    }
  }

  /* ------------------------------------------------------------- 入口链接 */
  $$('[data-link]').forEach(function (el) {
    var key = el.getAttribute('data-link');
    var url = LINKS[key];
    if (url) {
      el.setAttribute('href', url);
      if (/^https?:/i.test(url)) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    } else {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var table = (window.OING_I18N || {})[document.documentElement.lang === 'en' ? 'en' : 'zh'] || {};
        toast(table['msg.notConfigured'] || 'Not configured');
      });
    }
  });

  /* --------------------------------------------------------- 输入框 / 发送 */
  var form = $('#composer');
  var textarea = $('#prompt');
  var sendBtn = $('#send-btn');

  function autoGrow() {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 220) + 'px';
    if (sendBtn) sendBtn.disabled = textarea.value.trim().length === 0;
  }

  if (textarea) {
    textarea.addEventListener('input', autoGrow);
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        if (textarea.value.trim()) form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
    autoGrow();
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var table = (window.OING_I18N || {})[document.documentElement.lang === 'en' ? 'en' : 'zh'] || {};
      if (LINKS.chat) {
        var q = textarea ? textarea.value.trim() : '';
        var joiner = LINKS.chat.indexOf('?') === -1 ? '?' : '&';
        window.open(LINKS.chat + (q ? joiner + 'q=' + encodeURIComponent(q) : ''), '_blank', 'noopener');
        return;
      }
      toast(table['msg.sent'] || 'Demo');
    });
  }

  var attachBtn = $('#attach-btn');
  if (attachBtn) {
    attachBtn.addEventListener('click', function () {
      var table = (window.OING_I18N || {})[document.documentElement.lang === 'en' ? 'en' : 'zh'] || {};
      toast(table['msg.attached'] || 'Not supported');
    });
  }

  $$('.tool-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', on ? 'false' : 'true');
    });
  });

  $$('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (!textarea) return;
      textarea.value = chip.getAttribute('data-prompt') || chip.textContent.trim();
      autoGrow();
      textarea.focus();
    });
  });

  /* ------------------------------------------------------------- 滚动动效 */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* --------------------------------------------------------- 导航滚动高亮 */
  var sections = ['product', 'capability', 'news', 'about']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = $$('#primary-nav a[href^="#"]');
  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.style.color = a.getAttribute('href') === '#' + entry.target.id ? 'var(--text)' : '';
          a.style.background = a.getAttribute('href') === '#' + entry.target.id ? 'var(--surface-2)' : '';
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------------ 配置注入 */
  var qr = $('#qr-img');
  if (qr && CFG.qrImage) qr.setAttribute('src', CFG.qrImage);

  var contact = $('#contact-link');
  if (contact && CFG.email) contact.setAttribute('href', 'mailto:' + CFG.email);

  var copyright = $('#copyright');
  if (copyright) copyright.textContent = '© ' + new Date().getFullYear() + ' ' + (CFG.brand || 'Oing');

  var filing = $('#filing');
  if (filing && (CFG.icp || CFG.police)) {
    filing.hidden = false;
    if (CFG.icp) {
      var a = document.createElement('a');
      a.href = 'https://beian.miit.gov.cn/';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = CFG.icp;
      filing.appendChild(a);
    }
    if (CFG.police) {
      var b = document.createElement('a');
      b.href = 'https://beian.mps.gov.cn/';
      b.target = '_blank';
      b.rel = 'noopener';
      b.textContent = CFG.police;
      filing.appendChild(b);
    }
  }

  /* ------------------------------------------------------------- 初始化 */
  setLang(store(STORE.lang) === 'en' ? 'en' : 'zh');
})();
