# oing-ask —— 站内问答的后端

只做一件事：把「本地事实库没覆盖到」的问题发给 OpenRouter 的免费模型，
并在 system prompt 里把它**锁死在已确认事实上**（见 `src/prompt.js`）。

## 为什么需要它

静态站放不了 API key。这个 Worker 通过 Route 拦下 `www.oing.top/api/*`，
其余请求照常回 GitHub Pages —— **同源、无 CORS、key 不落到前端**。
（oing.top 的域名解析本来就在 Cloudflare 上，所以这条路是通的。）

## 部署

```bash
cd worker
npx wrangler login
npx wrangler kv namespace create RATE        # 把返回的 id 填进 wrangler.toml
npx wrangler secret put OPENROUTER_API_KEY   # 粘贴你的 OpenRouter key
npx wrangler deploy
```

部署完，`https://www.oing.top/api/chat` 就由这个 Worker 接管。

### 配置项

| 位置 | 名称 | 说明 |
| --- | --- | --- |
| Secret | `OPENROUTER_API_KEY` | OpenRouter 的 key。**必须**用 secret，不要写进 wrangler.toml。没配时接口返回 503，前端会回退到本地兜底文案 |
| Var | `PREFERRED_MODELS` | 逗号分隔的免费模型优先名单，按顺序尝试 |
| KV | `RATE` | 限流计数器。不绑的话 Worker 会跳过限流（不推荐） |

### 关于「自动获取最新免费模型」

`GET https://openrouter.ai/api/v1/models` 是公开接口，不需要 key。代码会：

1. 取全部模型，筛出 `pricing.prompt` 与 `pricing.completion` 都为 0 的
   （注意这两个值是**字符串** `"0"`，必须 `Number()` 之后再比较，直接 `=== 0` 会全部判错）；
2. 优先名单里的排最前，其余按 `context_length` 从大到小；
3. 最多试前 4 个，遇到 429 或报错就换下一个。

**为什么保留人工优先名单**：上下文最长 ≠ 中文最好、≠ 最稳。全自动挑出来的模型
可能中文很糟。名单是主路径，自动挑选只是名单全部不可用时的兜底。

列表用 Cache API 缓存 6 小时，不占 KV 写额度。

## 接口

```
POST /api/chat
  { "query": "...", "lang": "zh" | "en" }

200 { text, model }
400 { error: "empty" }
404 { error: "not_found" }
405 { error: "method_not_allowed" }
429 { error: "rate_limited", scope: "global" | "ip" }
502 { error: "upstream", fallback }   // 上游全挂，附带本地兜底文案
503 { error: "not_configured" }       // 没配 OPENROUTER_API_KEY
```

前端拿到 `fallback` 或请求失败时，都会回退到本地兜底 —— **任何情况下都不会「点了没反应」**。

## 限流（重要）

免费额度是有限的，而这是个公开接口 —— 没有上限等于把 key 半公开。

当前实现：每 IP 每分钟 6 次 + 全局每天 600 次；输入最多 500 字，输出最多 300 tokens。

**局限**：计数器用 KV，而 KV 是最终一致的，高并发下计数可能不准；而且 KV 免费版
每天只有 1000 次写入，所以它本身也是个自然上限。写额度用尽时会放行（宁可漏限也不要 500）。

要更严谨就把计数器换成 Durable Object，或者用 Cloudflare 的 Rate limiting 规则。
以现在这个站的流量，KV 这层够用。

## ⚠️ 隐私政策必须同步

一旦 `js/config.js` 里配了 `askEndpoint`，访客的提问就会离开本站。
`legal.html` 的隐私政策必须如实写明这件事，否则就是不实陈述。

`npm run check` 里有一条硬规则盯着这个：配了 `askEndpoint` 却没写「提问会发给
OpenRouter」或者没写「本站不保存提问内容」，自检直接失败。
