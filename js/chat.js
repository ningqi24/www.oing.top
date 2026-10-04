/**
 * /ask 页 —— 带上下文的多轮站内问答。
 *
 * 与首页共用检索引擎（js/ask.js）：先查本地事实库，未命中才调远端。
 * 区别是这里保留会话历史，追问时把最近几轮一起发过去
 * （服务端会重新过滤，见 worker/src/prompt.js 的 sanitizeHistory）。
 */
(function () {
  'use strict';

  var Ask = window.OingAsk;
  var list = document.getElementById('chat-list');
  var empty = document.getElementById('chat-empty');
  var form = document.getElementById('chat-form');
  var input = document.getElementById('chat-input');
  var send = document.getElementById('chat-send');
  if (!Ask || !list || !form || !input) return;

  var history = [];        // [{ role: 'user' | 'assistant', content }]
  var busy = false;

  function t(key) { return window.oingT ? window.oingT(key) : key; }

  /** 追加一轮。全部用 textContent 写入，不拼 HTML。 */
  function turn(role, text) {
    var li = document.createElement('li');
    li.className = 'chat-turn is-' + (role === 'user' ? 'user' : 'bot');
    var bubble = document.createElement('p');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    li.appendChild(bubble);
    list.appendChild(li);
    try { li.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    return { li: li, bubble: bubble };
  }

  function meta(li, text) {
    if (!text) return;
    var m = document.createElement('p');
    m.className = 'chat-meta';
    m.textContent = text;
    li.appendChild(m);
  }

  function idle() {
    busy = false;
    if (send) send.disabled = true;
  }

  function ask(raw) {
    var q = String(raw == null ? '' : raw).trim();
    if (!q || busy) return;
    busy = true;
    if (empty) empty.hidden = true;

    turn('user', q);
    history.push({ role: 'user', content: q });
    if (input) { input.value = ''; input.style.height = 'auto'; }

    var local = Ask.match(q);

    // 本地命中：直接出答案，不联网
    if (local.id) {
      turn('bot', local.text);
      history.push({ role: 'assistant', content: local.text });
      idle();
      return;
    }

    // 未命中：先挂上「查询中」，再带着历史问远端
    var pending = turn('bot', t('ask.thinking'));
    pending.li.classList.add('is-pending');
    Ask.remoteAsk(q, history.slice(0, -1)).then(function (out) {
      var text = local.text;
      var note = '';
      if (out && out.text) {
        text = out.text;
        note = t('ask.remoteSrc');
      } else if (out && out.quota) {
        note = t('ask.quotaNote');
      }
      pending.li.classList.remove('is-pending');
      pending.bubble.textContent = text;
      meta(pending.li, note);
      history.push({ role: 'assistant', content: text });
      idle();
    });
  }

  /* ---- 输入框：自动增高 + 有内容才允许发送 ---- */
  function autoGrow() {
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 180) + 'px';
  }
  input.addEventListener('input', function () {
    autoGrow();
    if (send) send.disabled = !input.value.trim() || busy;
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.value.trim() && !busy) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
  });

  /* ---- 建议问题 ---- */
  document.querySelectorAll('[data-ask]').forEach(function (btn) {
    btn.addEventListener('click', function () { ask(btn.textContent.trim()); });
  });

  /* ---- 从首页「继续追问」带过来的问题 ---- */
  var fromUrl = '';
  try { fromUrl = new URLSearchParams(location.search).get('q') || ''; } catch (e) {}
  if (fromUrl.trim()) ask(fromUrl);
})();
