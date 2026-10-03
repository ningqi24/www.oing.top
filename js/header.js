/**
 * 悬浮玻璃胶囊页头 —— 原创实现，零依赖。
 *
 * 行为：未滚动时胶囊贴边、全宽、完全透明；滚过 80px 后收窄并向内缩，
 * 同时磨砂玻璃淡入，像一颗浮起来的液态玻璃药丸。
 *
 * 为什么不用 CSS transition：width / padding 这类属性走 CSS 过渡是"匀速收束 +
 * 固定时长"，看着很机械。这里用弹簧积分（stiffness 180 / damping 28 / mass 1），
 * 目标值中途翻转时会从当前位置带着速度继续走，所以连续上下滚动时手感是"液态"的。
 * 取 c = 28 ≈ 2·√(k·m) = 2·√180 ≈ 26.8，刚好在临界阻尼稍过一点：不回弹、平滑收束。
 *
 * 工程处理：prefers-reduced-motion 下直接落值不做动画；首帧直接落值（不做进场动画）；
 * 弹簧完全静止后自动停掉 rAF，不空转。
 */
(function () {
  'use strict';

  var bar = document.querySelector('.header-bar');
  if (!bar) return;

  var THRESHOLD = 80;                 // 滚动阈值，单位 px
  var WIDE = 1560;                    // 超过这个视口宽度，收窄后的上限更大
  var STIFFNESS = 180;                // k
  var DAMPING = 28;                   // c（≈ 临界阻尼）
  var MASS = 1;                       // m
  var REST_VALUE = 0.05;              // 位移小于它、且速度极小时判定为静止
  var REST_VELOCITY = 0.05;

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wideQuery = window.matchMedia('(min-width: ' + WIDE + 'px)');

  // 参与弹簧动画的三个数值属性
  var KEYS = ['maxWidth', 'padL', 'padR'];

  var current = { maxWidth: 1280, padL: 0, padR: 0 };
  var target = { maxWidth: 1280, padL: 0, padR: 0 };
  var velocity = { maxWidth: 0, padL: 0, padR: 0 };

  var raf = 0;
  var lastTime = 0;

  /** 依据滚动位置与视口宽度，算出目标值并切换玻璃状态类 */
  function computeTarget() {
    var scrolled = window.scrollY > THRESHOLD;
    bar.classList.toggle('is-scrolled', scrolled);
    target.maxWidth = scrolled ? (wideQuery.matches ? 1180 : 980) : 1280;
    target.padL = scrolled ? 16 : 0;
    target.padR = scrolled ? 10 : 0;
  }

  function paint() {
    bar.style.maxWidth = current.maxWidth + 'px';
    bar.style.paddingLeft = current.padL + 'px';
    bar.style.paddingRight = current.padR + 'px';
  }

  /** 不做动画，直接落到目标值 */
  function snap() {
    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
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
    // 掉帧或切回标签页时夹住步长，避免弹簧炸掉
    if (!isFinite(dt) || dt <= 0) dt = 1 / 60;
    if (dt > 1 / 30) dt = 1 / 30;

    var settled = true;
    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
      var x = current[k];
      var v = velocity[k];
      var t = target[k];
      var a = (-STIFFNESS * (x - t) - DAMPING * v) / MASS;
      v += a * dt;
      x += v * dt;
      if (Math.abs(x - t) < REST_VALUE && Math.abs(v) < REST_VELOCITY) {
        x = t;
        v = 0;
      } else {
        settled = false;
      }
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

  function onScroll() {
    computeTarget();
    kick();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  if (wideQuery.addEventListener) wideQuery.addEventListener('change', onScroll);
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onScroll);

  // 首帧：不做进场动画，直接落在正确状态
  computeTarget();
  snap();

  window.OingHeader = { computeTarget: computeTarget, snap: snap };
})();
