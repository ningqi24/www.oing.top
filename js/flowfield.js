/**
 * 首屏流场动画 —— 原创实现，无依赖。
 *
 * 原理：把一批粒子放进一个随时间缓慢演化的矢量场里，每帧沿场方向走一小步，
 * 并用 destination-out 低透明度擦除上一帧，从而留下逐渐消散的拖尾。
 * 矢量场由几层正弦叠加而成（见 angleAt），不需要任何噪声库。
 *
 * 工程上的处理：
 *   · 画布透明，让底下 CSS 天空渐变透出来；颗粒在下方逐渐淡出，与渐变一起收掉
 *   · 按视口面积决定粒子数；DPR 上限 2，避免高分屏上过度绘制
 *   · 遵循 prefers-reduced-motion：只画一帧静态的"暖机"结果，之后完全不动
 *   · 离开视口或切到后台时暂停，回来再续，不空转烧电
 */
(function () {
  'use strict';

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function mount(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    var w = 0, h = 0, dpr = 1;
    var parts = [];
    var raf = 0, clock = 0;
    var visible = true, active = false;
    var rgb = '77, 107, 254';
    var peak = 0.12;

    function readBrand() {
      var cs = getComputedStyle(document.documentElement);
      var v = cs.getPropertyValue('--brand-rgb');
      if (v && v.trim()) rgb = v.trim().replace(/\s+/g, ' ');
      var a = parseFloat(cs.getPropertyValue('--flow-alpha'));
      if (isFinite(a) && a > 0) peak = a;
    }

    /* 矢量场：三层正弦叠加，得到平滑且不会loop得太明显的旋涡 */
    function angleAt(x, y, time) {
      var nx = x * 0.0017, ny = y * 0.0021;
      var a = Math.sin(nx + time * 0.00013) * Math.cos(ny - time * 0.00009);
      var b = Math.sin((nx + ny) * 1.7 - time * 0.00017);
      var c = Math.cos(ny * 2.3 + time * 0.00007) * 0.5;
      return (a + b + c) * Math.PI * 1.05;
    }

    function spawn(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h * 0.04 + Math.random() * h * 0.22,
        life: 0,
        max: 200 + Math.random() * 320,
        speed: 0.32 + Math.random() * 0.7,
        width: 0.7 + Math.random() * 0.7
      };
    }

    function seed() {
      var count = w < 560 ? 220 : w < 1000 ? 480 : 860;
      parts = new Array(count);
      for (var i = 0; i < count; i++) parts[i] = spawn(true);
    }

    /* 颗粒越靠下越淡，和天空渐变一起收掉，避免出现生硬的底边 */
    function alphaOf(p) {
      var vertical = 1 - p.y / (h * 0.94);
      if (vertical <= 0) return 0;
      var born = Math.min(1, p.life / 45);
      var dying = 1 - p.life / p.max;
      return peak * vertical * born * dying;
    }

    function fade() {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }

    function stepParticles(advanceClock) {
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var angle = angleAt(p.x, p.y, clock);
        // 两个子步，线条更顺
        var mx = p.x + Math.cos(angle) * p.speed * 0.5;
        var my = p.y + Math.sin(angle) * p.speed * 0.5;
        var a2 = angleAt(mx, my, clock);
        var nx = mx + Math.cos(a2) * p.speed * 0.5;
        var ny = my + Math.sin(a2) * p.speed * 0.5;

        var alpha = alphaOf(p);
        if (alpha > 0.002) {
          ctx.strokeStyle = 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')';
          ctx.lineWidth = p.width;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }

        p.x = nx; p.y = ny; p.life++;
        if (p.life > p.max || p.x < -24 || p.x > w + 24 || p.y < -24 || p.y > h + 24) {
          parts[i] = spawn(false);
        }
      }
      if (advanceClock) clock += 16;
    }

    function frame(now) {
      if (!active) return;
      // 约 40fps 封顶即可，动画本身很舒缓，省电
      if (now - frame.last < 24) { raf = requestAnimationFrame(frame); return; }
      frame.last = now;
      fade();
      stepParticles(true);
      raf = requestAnimationFrame(frame);
    }
    frame.last = 0;

    function start() {
      if (active || reduceQuery.matches) return;
      active = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      active = false;
      cancelAnimationFrame(raf);
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.round(rect.width);
      h = Math.round(rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      readBrand();
      seed();
      // 先空跑一段，进去时就已经有成型的气流，而不是从空白慢慢长出来
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < 90; i++) { fade(); stepParticles(true); }
      if (!reduceQuery.matches && visible) start(); else stop();
    }

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (visible && !reduceQuery.matches) start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !reduceQuery.matches) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
    }

    if (reduceQuery.addEventListener) {
      reduceQuery.addEventListener('change', function () { resize(); });
    }

    // 字体/主题变化会改 --brand-rgb，重绘一次静态帧
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        setTimeout(function () { if (!active) resize(); }, 60);
      });
    }

    resize();
    // 主题切换按钮改了 data-theme，这里也跟着重取品牌色
    new MutationObserver(readBrand).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme'],
    });
  }

  function boot() {
    var canvas = document.querySelector('.hero-canvas');
    if (canvas) mount(canvas);
  }

  window.OingFlowField = { mount: mount, boot: boot };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
