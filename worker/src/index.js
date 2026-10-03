/**
 * oing.top 的问答后端 —— Cloudflare Worker。
 *
 * 职责只有一件事：把「本地事实库没覆盖到」的问题发给 OpenRouter 的免费模型，
 * 并在 system prompt 里把它锁死在已确认事实上（见 src/prompt.js）。
 *
 * 为什么需要服务端：静态站放不了 API key。这个 Worker 通过 Route 拦下
 * www.oing.top/api/*，其余请求照常回 GitHub Pages —— 同源、无 CORS、key 不落地。
 *
 * 接口：
 *   POST /api/chat   { query: string, lang: 'zh' | 'en' }
 *   200 { text, model }
 *   400 { error: 'empty' }
 *   429 { error: 'rate_limited', scope }
 *   502 { error: 'upstream' }      上游全部失败
 *   503 { error: 'not_configured' } 没配 OPENROUTER_API_KEY
 */
import { FACTS, FALLBACK } from './facts.js';
import { rankFreeModels } from './models.js';
import { buildMessages } from './prompt.js';

const MODELS_URL = 'https://openrouter.ai/api/v1/models';
const CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 限流阈值。免费额度是有限的，而这是个公开接口 —— 没有上限等于把 key 半公开。
const LIMITS = { perIpPerMinute: 6, globalPerDay: 600 };
const MAX_INPUT = 500;        // 输入字符上限
const MAX_TOKENS = 300;       // 输出 token 上限
const MODELS_TTL = 6 * 3600;  // 模型列表缓存 6 小时

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

/** 读取免费模型列表，按优先名单排序。用 Cache API 缓存，不占 KV 写额度。 */
async function pickModels(env) {
  const key = new Request('https://oing-ask.internal/models');
  const cache = caches.default;
  let data = null;
  const hit = await cache.match(key);
  if (hit) { try { data = await hit.json(); } catch (e) { data = null; } }
  if (!data) {
    const res = await fetch(MODELS_URL, { headers: { 'user-agent': 'oing-ask/1.0' } });
    if (!res.ok) throw new Error('models ' + res.status);
    data = await res.json();
    const cached = new Response(JSON.stringify(data), {
      headers: { 'content-type': 'application/json', 'cache-control': 'max-age=' + MODELS_TTL },
    });
    await cache.put(key, cached);
  }
  const preferred = String(env.PREFERRED_MODELS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  return rankFreeModels(data && data.data, preferred).map((m) => m.id);
}

/** KV 计数器。写额度有限，所以这里只在"没超限"的路径上计两次。 */
async function bump(env, key, ttl) {
  const cur = Number(await env.RATE.get(key)) || 0;
  const next = cur + 1;
  await env.RATE.put(key, String(next), { expirationTtl: ttl });
  return next;
}

/** 返回 null 表示放行；否则返回被限制的维度 */
async function checkLimits(env, ip) {
  if (!env.RATE) return null;      // 没绑 KV 就不限流（部署文档里写明了这个风险）
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const minute = now.toISOString().slice(0, 16);
  try {
    const global = await bump(env, 'g:' + day, 90000);
    if (global > LIMITS.globalPerDay) return 'global';
    const perIp = await bump(env, 'm:' + minute + ':' + ip, 120);
    if (perIp > LIMITS.perIpPerMinute) return 'ip';
    return null;
  } catch (e) {
    return null;                   // KV 写额度用完时放行，宁可漏限也不要 500
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/chat') return json({ error: 'not_found' }, 404);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    if (!env.OPENROUTER_API_KEY) return json({ error: 'not_configured' }, 503);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const scope = await checkLimits(env, ip);
    if (scope) return json({ error: 'rate_limited', scope }, 429);

    let body = null;
    try { body = await request.json(); } catch (e) { /* 下面按空处理 */ }
    const lang = body && body.lang === 'en' ? 'en' : 'zh';
    const query = String((body && body.query) || '').trim().slice(0, MAX_INPUT);
    if (!query) return json({ error: 'empty' }, 400);

    let models = [];
    try { models = await pickModels(env); } catch (e) { /* 列表拉不到就退到下面的空数组 */ }

    const messages = buildMessages(FACTS, query, lang);
    let lastStatus = 0;

    // 免费模型经常 429 或临时下线，所以按顺序往下试
    for (const model of models.slice(0, 4)) {
      let res;
      try {
        res = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            authorization: 'Bearer ' + env.OPENROUTER_API_KEY,
            'content-type': 'application/json',
            'HTTP-Referer': 'https://www.oing.top',
            'X-Title': 'oing.top',
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: MAX_TOKENS,
            temperature: 0.2,
            top_p: 0.9,
          }),
        });
      } catch (e) { continue; }
      lastStatus = res.status;
      if (!res.ok) continue;

      let data = null;
      try { data = await res.json(); } catch (e) { continue; }
      const text = data && data.choices && data.choices[0] &&
        data.choices[0].message && data.choices[0].message.content;
      if (!text || !String(text).trim()) continue;
      return json({ text: String(text).trim(), model });
    }

    // 全部失败：把本地兜底文案还回去，让前端至少给出一个诚实的回答
    return json({ error: 'upstream', status: lastStatus, fallback: FALLBACK[lang] }, 502);
  },
};
