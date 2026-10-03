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
 *   · **触屏设备与小窗口根本不创建画布** —— 见 shouldMount() 的说明
 */
(function () {
  'use strict';

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /*
   * 小屏只画静态帧，不做动画。
   *
   * 原因（实测数据）：画布铺满整个 hero，即便按 DPR 上限 2，手机视口下也是
   * 780×1450 设备像素、约 40fps 重绘。而画布之上叠着 9 个 backdrop-filter 元素
   * （输入框那一块就有 358×210，模糊半径 --blur 是 20px）——**画布每动一帧，
   * 这些磨砂就得把背后的内容重新模糊一遍**。手机 GPU 上这是典型的闪烁成因，
   * 而且 3 秒里 JS 有 1.05 秒（35% CPU）都花在画布上。
   *
   * 静态帧在观感上几乎一样（截图完全一致），但没有了"每帧重新采样背景"的开销。
   *
   * 诊断开关（手机上用来分辨闪烁到底是不是画布造成的）：
   *   ?noanim=1  强制静态        ?anim=1  强制开动画（即使小屏）
   */
  var smallQuery = window.matchMedia('(max-width: 760px)');
  // 触屏设备（手机 / 平板）与小窗口：不创建画布。见 shouldMount()
  var touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
  var search = (typeof location !== 'undefined' && location.search) || '';
  var forceStatic = /[?&]noanim=1/.test(search);
  var forceAnim = /[?&]anim=1/.test(search);
  var forceCanvas = /[?&]canvas=1/.test(search);

  function shouldAnimate() {
    if (forceAnim) return true;
    if (forceStatic) return false;
    return !smallQuery.matches;
  }

  /*
   * 要不要创建画布。
   *
   * 2026-10 真机定论：Android Chrome / app 内置浏览器上整屏持续闪烁。
   * 排查过程：先试过"改成静态帧"和"关掉磨砂"，都无效；
   * 最后把画布元素整个移除后闪烁消失 —— 所以问题出在这块大透明画布被提升为
   * 独立合成图层本身，与动画无关。
   *
   * 结论：触屏设备与小窗口不创建画布，只保留 CSS 渐变。桌面端不受影响。
   * 想在手机上验证画布行为时加 ?canvas=1 强制创建。
   */
  function shouldMount() {
    if (forceCanvas) return true;
    return !smallQuery.matches && !touchQuery.matches;
  }

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

    var sized = false;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      var ndpr = Math.min(window.devicePixelRatio || 1, 2);
      var nw = Math.round(rect.width);
      var nh = Math.round(rect.height);

      // 尺寸真的变了才重做。给 canvas.width 赋值会**清空画布**并重跑整段暖机，
      // 而 Android Chrome 的地址栏伸缩 / 滚动过程中会连续触发 resize ——
      // 每次都重做，看起来就是画面在反复闪（还要同步阻塞主线程）。
      if (sized && nw === w && nh === h && ndpr === dpr) {
        if (shouldAnimate() && !reduceQuery.matches && visible) start(); else stop();
        return;
      }
      sized = true;
      dpr = ndpr;
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      readBrand();
      seed();
      // 先空跑一段，进去时就已经有成型的气流，而不是从空白慢慢长出来
      ctx.clearRect(0, 0, w, h);
      // 静态帧多跑一段，画面更饱满（只算一次）；动画模式照旧 90 步暖机
      // 静态帧也要控量：这段是在解析阶段同步跑的，跑太久会阻塞首屏绘制，
      // 在慢手机上表现成"进去先卡一下 / 闪一下"。120 步已经够饱满。
      var warm = shouldAnimate() ? 90 : 120;
      for (var i = 0; i < warm; i++) { fade(); stepParticles(true); }
      // 小屏只留这张静态帧；只有该动的时候才启动 rAF
      if (shouldAnimate() && !reduceQuery.matches && visible) start(); else stop();
    }

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (visible && shouldAnimate() && !reduceQuery.matches) start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && shouldAnimate() && !reduceQuery.matches) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
    }

    if (reduceQuery.addEventListener) {
      reduceQuery.addEventListener('change', function () { resize(); });
    }
    // 旋屏或跨过断点时重新判断该不该动
    if (smallQuery.addEventListener) {
      smallQuery.addEventListener('change', function () { resize(); });
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
    if (!canvas) return;
    // 不该创建的设备：把元素直接去掉，连图层都不留
    if (!shouldMount()) {
      canvas.parentNode.removeChild(canvas);
      return;
    }
    mount(canvas);
  }

  window.OingFlowField = { mount: mount, boot: boot };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
