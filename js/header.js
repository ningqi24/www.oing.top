/**
 * 悬浮玻璃胶囊页头 —— 原创实现，零依赖。
 *
 * 行为：未滚动时胶囊贴边、占满容器、完全透明；滚过 80px 后同时做两件事——
 *   ① 横向内缩（--hdr-inset）浮起来
 *   ② 纵向变薄（--hdr-pad-y / --hdr-inner-h 各收一档）
 * 同时磨砂玻璃淡入，像一颗浮起来的液态玻璃药丸。
 *
 * 为什么横向不写死绝对值：参考站收窄到固定 980px，那是按它"页头只有 logo + 一个
 * 按钮 + 语言切换"的内容量定的。本站页头有 logo + 4 个导航 + 语言 + 主题 + 主按钮，
 * 写死会憋。所以改成"相对容器内缩固定距离"，内容再多也不会挤。
 *
 * 为什么不用 CSS transition：width / padding / height 走 CSS 过渡是"匀速收束 +
 * 固定时长"，看着机械。这里用弹簧积分（stiffness 180 / damping 28 / mass 1），
 * 目标值中途翻转时会从当前位置带着速度继续走，所以连续上下滚动时手感是"液态"的。
 * 取 c = 28 ≈ 2·√(k·m) = 2·√180 ≈ 26.8，刚好在临界阻尼稍过一点：不回弹、平滑收束。
 *
 * 所有设计数值都由 CSS 变量提供（见 css/style.css 的 --hdr-*），这里只负责插值。
 * 工程处理：prefers-reduced-motion 下直接落值；首帧不做进场动画；
 * 窗口缩放 / 断点切换时直接落值；弹簧静止后停掉 rAF，不空转。
 */
(function () {
  'use strict';

  var shell = document.querySelector('.site-header');
  var bar = document.querySelector('.header-bar');
  if (!shell || !bar) return;
  var inner = bar.querySelector('.header-inner');
  if (!inner) return;

  var THRESHOLD = 80;        // 滚动阈值，单位 px
  var MOBILE = 760;          // 与 CSS 里的断点保持一致，用于刷新令牌
  var STIFFNESS = 180;       // k
  var DAMPING = 28;          // c（≈ 临界阻尼）
  var MASS = 1;              // m
  var REST_VALUE = 0.05;
  var REST_VELOCITY = 0.05;

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 参与弹簧动画的数值属性，以及各自的落值方式
  var SPEC = [
    { key: 'maxWidth', settle: function (v) { bar.style.maxWidth = v + 'px'; } },
    { key: 'padL', settle: function (v) { bar.style.paddingLeft = v + 'px'; } },
    { key: 'padR', settle: function (v) { bar.style.paddingRight = v + 'px'; } },
    { key: 'padY', settle: function (v) { bar.style.paddingTop = v + 'px'; bar.style.paddingBottom = v + 'px'; } },
    { key: 'innerH', settle: function (v) { inner.style.height = v + 'px'; } },
    { key: 'topPad', settle: function (v) { shell.style.paddingTop = v + 'px'; } },
  ];

  var current = {};
  var target = {};
  var velocity = {};
  var tokens = null;

  var raf = 0;
  var lastTime = 0;

  /** 读取 CSS 里的 --hdr-* 数值令牌（只在初始化与缩放时读，滚动时不读，避免反复计算样式） */
  function readTokens() {
    var cs = getComputedStyle(document.documentElement);
    var get = function (name, fallback) {
      var v = parseFloat(cs.getPropertyValue(name));
      return isFinite(v) ? v : fallback;
    };
    return {
      top: get('--hdr-top', 8),
      topOn: get('--hdr-top-on', 5),
      padY: get('--hdr-pad-y', 4),
      padYOn: get('--hdr-pad-y-on', 2),
      innerH: get('--hdr-inner-h', 48),
      innerHOn: get('--hdr-inner-h-on', 42),
      inset: get('--hdr-inset', 80),
      padLOn: get('--hdr-pad-l-on', 18),
      padROn: get('--hdr-pad-r-on', 12),
      insetMin: get('--hdr-inset-min', 720),
    };
  }

  function computeTarget() {
    if (!tokens) tokens = readTokens();
    var scrolled = window.scrollY > THRESHOLD;
    shell.classList.toggle('is-scrolled', scrolled);
    bar.classList.toggle('is-scrolled', scrolled);

    var avail = shell.clientWidth;
    var inset = tokens.inset > 0 && avail > tokens.insetMin ? tokens.inset : 0;

    target.maxWidth = scrolled ? avail - inset : avail;
    target.padL = scrolled ? tokens.padLOn : 0;
    target.padR = scrolled ? tokens.padROn : 0;
    target.padY = scrolled ? tokens.padYOn : tokens.padY;
    target.innerH = scrolled ? tokens.innerHOn : tokens.innerH;
    target.topPad = scrolled ? tokens.topOn : tokens.top;
  }

  function paint() {
    for (var i = 0; i < SPEC.length; i++) SPEC[i].settle(current[SPEC[i].key]);
  }

  function snap() {
    for (var i = 0; i < SPEC.length; i++) {
      var k = SPEC[i].key;
      current[k] = target[k];
      velocity[k] = 0;
    }
    cancelAnimationFrame(raf);
    raf = 0;
    paint();
  }

  function tick(now) {
    var dt = (now - lastTime) / 1000;
    lastTime = now;
    if (!isFinite(dt) || dt <= 0) dt = 1 / 60;
    if (dt > 1 / 30) dt = 1 / 30;      // 掉帧或切回标签页时夹住步长，避免积分炸掉

    var settled = true;
    for (var i = 0; i < SPEC.length; i++) {
      var k = SPEC[i].key;
      var x = current[k];
      var v = velocity[k];
      var t = target[k];
      var a = (-STIFFNESS * (x - t) - DAMPING * v) / MASS;
      v += a * dt;
      x += v * dt;
      if (Math.abs(x - t) < REST_VALUE && Math.abs(v) < REST_VELOCITY) { x = t; v = 0; }
      else settled = false;
      current[k] = x;
      velocity[k] = v;
    }
    paint();

    if (settled) { raf = 0; return; }
    raf = requestAnimationFrame(tick);
  }

  function kick() {
    if (reduceQuery.matches) { snap(); return; }
    if (!raf) {
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function onScroll() { computeTarget(); kick(); }

  window.addEventListener('scroll', onScroll, { passive: true });
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onScroll);
  // 断点切换会换掉整组令牌（比如手机上 --hdr-inset 变成 0）
  var mobileQuery = window.matchMedia('(max-width: ' + (MOBILE - 1) + 'px)');
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', function () { tokens = null; computeTarget(); snap(); });
  }

  var resizeTimer = 0;
  var onResize = function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { tokens = null; computeTarget(); snap(); }, 120);
  };
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });

  // 首帧：不做进场动画，直接落在正确状态
  computeTarget();
  snap();

  window.OingHeader = { computeTarget: computeTarget, snap: snap, readTokens: function () { return (tokens = readTokens()); } };
})();
