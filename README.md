# www.oing.top

Oing 官网。纯静态站点：无构建步骤、无运行时依赖、无 npm 包。
推送到 GitHub 后由 GitHub Pages 托管，自定义域名 `www.oing.top`。

线上：<https://www.oing.top/> ｜ 仓库：<https://github.com/ningqi24/www.oing.top>

---

## 一、版权边界

页面结构与观感参考了主流 AI 产品官网的通行做法。

| 借鉴（不受著作权保护的设计语言） | 未使用（受保护内容） |
| --- | --- |
| 顶部固定页头 + 居中主视觉 + 大输入框的构图 | 第三方公司名、产品名、商标、图形 Logo |
| 天空渐变背景 + 流场动画的视觉母题 | 官网原文案、标语、产品描述 |
| 配色、圆角、间距、字号刻度 | 图片 / 视频 / 插画素材 |
| 磨砂玻璃卡片的层次处理 | 站点源代码与 CSS |
| 极宽的标语字距、编辑式细线列表 | 备案号、公司主体信息、公众号二维码 |

站内所有内容为原创或来自开源许可：品牌名 `Oing`、圆环 + 轨道点图形、全部中英文案、
全部 CSS 与 JS、由 `scripts/gen-icons.mjs` 代码绘制的图标、
DM Sans 与 Montserrat 字体（SIL OFL 1.1，授权原文见 `assets/fonts/`）。

判断依据：设计语言（配色、留白、排版、交互方式）不受著作权保护；商标、文案、
图片素材、源代码受保护。

自 2026-10 起这条边界由人工把关，不再有自动检查。
唯一的例外是站内问答中那几句明确声明与第三方无关联的话。

---

## 二、目录结构

```
.
├── index.html / legal.html / 404.html
├── favicon.svg / favicon.ico / CNAME
├── robots.txt / sitemap.xml / site.webmanifest
├── css/
│   ├── fonts.css               @font-face 声明（自托管）
│   └── style.css               设计令牌 + 明暗双主题 + 响应式 + 项目卡片
├── js/
│   ├── config.js               站点配置：邮箱、入口地址、问答端点
│   ├── i18n.js                 中英词条 + oingApplyLang() + oingT()
│   ├── qa.js                   站内问答的事实库（15 条手写问答）
│   ├── ask.js                  问答检索与界面接线
│   ├── flowfield.js            首屏流场（零依赖）
│   ├── header.js               悬浮玻璃页头（弹簧积分驱动）
│   └── main.js                 主题、语言、提示条、入口链接、滚动动效
├── assets/                     字体 / 图标 / 分享封面
├── worker/                     问答后端（Cloudflare Worker，见 worker/README.md）
├── scripts/
│   ├── check.mjs               自检：npm run check
│   ├── audit.mjs               多视口溢出 + 控制台 + 截图
│   ├── serve.mjs               本地预览服务器
│   ├── bump.mjs                版本号 + ?v= + 资源指纹
│   ├── sync-html-text.mjs      HTML 兜底文案同步
│   ├── build-facts.mjs         由 qa.js 生成 worker 的事实库
│   ├── deploy-worker.mjs       生成事实库并部署 Worker
│   ├── test-qa.mjs / test-worker.mjs / test-live.mjs
│   └── gen-icons.mjs           零依赖 PNG 生成（自写编码 + 栅格化）
└── .github/check-workflow.yml  CI 配置（未启用，见第六节）
```

---

## 三、本地开发

需要 Node 18+。没有依赖，不需要 `npm install`。

| 命令 | 用途 |
| --- | --- |
| `npm run serve` | 本地预览 <http://127.0.0.1:4173/> |
| `npm run check` | 自检。提交前跑 |
| `npm test` | 问答检索 + Worker 纯逻辑（离线） |
| `npm run test:live` | 打真实域名的线上验收 |
| `npm run bump -- 2.14.0` | 改版本号 + 全部 `?v=` + 资源指纹 |
| `npm run sync:html` | 把 HTML 兜底文案从中文词条同步过去 |
| `npm run deploy:worker` | 生成事实库并部署 Worker |
| `npm run audit` | 实测 390 / 768 / 1440 三个宽度并截图到 `.tmp/` |
| `npm run icons` | 重新生成图标与分享封面 |

`npm run audit` 需要先开着 `npm run serve`。它通过 DevTools 协议报告每个视口下
具体哪个元素越界了多少像素。

不要用 `--headless --screenshot --window-size=390,900` 判断布局：那种方式会裁掉内容，
看起来像严重横向溢出。布局问题一律以 `npm run audit` 的数值为准。

---

## 四、日常改动

### 入口地址与邮箱

改 `js/config.js`。`links` 里留空的入口不会渲染，点击也不会跳死链。
邮箱同理：页面不写死地址，所有联系入口带 `data-email`，由 `main.js` 注入 `href`；
法务页需要显示地址的那个额外带 `data-email-text`。
改邮箱时 `config.js` 与三个 HTML 里的 `mailto:` 兜底都要改。

### 文案

全部在 `js/i18n.js`，页面用 `data-i18n="key"` 引用。新 key 必须中英两份都加。
改完跑 `npm run sync:html` 把 HTML 里的兜底文字同步过去。

### 配色与刻度

`css/style.css` 顶部的 `:root` 是全部设计令牌，`[data-theme="dark"]` 是深色覆盖。
`--brand` 是主色，`--hero-sky-*` 是首屏渐变，`--flow-alpha` 是流场强度，`--blur` 是磨砂半径。

### 页头

页头是悬浮玻璃胶囊：未滚动时贴边占满容器，滚过 `80px` 后横向内缩、纵向变薄，
磨砂玻璃淡入。设计数值全在 CSS 变量 `--hdr-*`，`js/header.js` 只做弹簧插值。

| 变量 | 未滚动 | 滚动后 | 含义 |
| --- | --- | --- | --- |
| `--hdr-top` / `--hdr-top-on` | 8px | 5px | 容器顶部留白 |
| `--hdr-pad-y` / `--hdr-pad-y-on` | 4px | 2px | 胶囊纵向内边距 |
| `--hdr-inner-h` / `--hdr-inner-h-on` | 48px | 42px | 胶囊内容高度 |
| `--hdr-inset` | — | 80px | 滚动后左右各内缩多少 |
| `--hdr-pad-l-on` / `--hdr-pad-r-on` | — | 18 / 12px | 滚动后内容内缩 |
| `--hdr-inset-min` | — | 720 | 容器窄于此值不内缩 |

内缩用相对距离而非固定宽度，是为了让页头在内容变多时不挤。
弹簧参数与临界阻尼的推导写在 `js/header.js` 顶部注释里。

### 首屏流场

`js/flowfield.js`。粒子数在 `seed()` 按视口宽度分档，矢量场在 `angleAt()`。
**触屏设备与 760px 以下窗口不创建画布**，只保留 CSS 渐变 —— 原因见该文件 `shouldMount()`
的注释（Android 上这块大透明画布会导致整屏持续闪烁，真机验证过）。
加 `?canvas=1` 可以强制创建。

### 图标

由 `scripts/gen-icons.mjs` 代码绘制。改 `drawIcon()` / `drawOg()` 后跑 `npm run icons`；
也可以直接替换 `assets/` 下的 PNG 与 `favicon.ico`。

### 改完必做

改了 `css/` 或 `js/` 下任何文件，都要跑：

```bash
npm run bump -- 2.14.0    # 版本号 + 全部 ?v= + 资源指纹
npm run check
```

`?v=` 查询参数是本站唯一的缓存穿透手段，用来绕过 CDN 与浏览器强缓存。
本站没有 Service Worker，静态展示站不需要它，多一层缓存只会造成"改了看不到"。

---

## 五、站内问答

首屏输入框走三层：

```
用户提问
  └─ 1. 本地事实库检索（js/qa.js，bigram 匹配）
       命中 → 直接回答，不联网
       未命中 ↓
  └─ 2. Cloudflare Worker → OpenRouter 免费模型
       Worker 把 15 条事实写进 system prompt，限制模型只能据此作答
       失败 / 超时 / 额度用完 ↓
  └─ 3. 本地兜底文案（说明不知道，并给出邮箱）
```

分层的目的是：常见问题永远由手写答案回答，不消耗额度、不经过模型，因此不可能编造。

| 文件 | 作用 |
| --- | --- |
| `js/qa.js` | 事实库，15 条，中英双语 |
| `js/ask.js` | 检索引擎与界面接线。`match()` 与界面分离，换后端只改 `remoteAsk()` |
| `worker/` | 远端层，部署见 `worker/README.md` |
| `scripts/test-qa.mjs` | 57 条用例锁住路由，含应当兜底的负例 |
| `scripts/test-worker.mjs` | 免费模型判定 / 排序 / 提示词 / 事实同步 |

### 加一条问答

1. 往 `js/qa.js` 加一条，`keys` 列出用户可能用的说法，中英都写；
2. 不要放「什么关系」「copy」这类通用词，会把无关提问吸过来；
3. 在 `scripts/test-qa.mjs` 加至少一条用例；
4. 跑 `npm test`；
5. 跑 `npm run deploy:worker`，再跑 `npm run check`。

### 两条硬约束

`is-this-ai` 那条分两套答案：`zh` / `en` 是纯本地版，`remoteZh` / `remoteEn` 是接了模型版。
`ask.js` 按 `config.askEndpoint` 选择。接了远端却还用本地版就是不实陈述。

一旦 `config.js` 里配了 `askEndpoint`，访客提问会离开本站，`legal.html` 的隐私政策
必须写明「提问会发给 OpenRouter」和「本站不保存提问内容」。这条自 2026-10 起由人工把关。

### 上线后

`npm run test:live` 打真实域名，验证接口契约、拒绝编造与挡住提示词注入这两条安全断言，
以及线上 Worker 的事实库指纹是否与本地一致。被跳过的断言会单独列出，不计入通过。

---

## 六、部署

仓库 <https://github.com/ningqi24/www.oing.top>，Pages 用 `main` 分支根目录，
自定义域名写在 `CNAME`。DNS 在 Cloudflare，`www.oing.top` 代理到 `ningqi24.github.io`，
`oing.top` 已 301 到 www。

```bash
npm run check
git add -A && git commit -m "chore: 更新内容"
git push
```

推送后 Cloudflare 有缓存，通常十几秒到几分钟生效。确认方式：轮询线上做字符串断言，
而不是刷新自己的浏览器。

**但不要一推送就去请求带 `?v=` 的地址。** GitHub Pages 自己也要几十秒到几分钟才重建完，
在这段窗口里请求新版本号，Cloudflare 会把**旧文件**缓存到**新版本号**下面
（js/css 的 `cache-control: max-age=7200`，HTML 是 600），于是访客会拿到旧文件 ——
而这正是 `?v=` 本来要避免的情况。正确顺序：

1. 先轮询**不带版本号**的地址（或源站 `ningqi24.github.io`），确认内容已更新；
2. 再去请求带 `?v=` 的地址，此时缓存里不会留下旧副本。

### GitHub Actions 自检（未启用）

`.github/check-workflow.yml` 已写好但未启用：把它放进 `.github/workflows/` 需要
带 `workflow` 权限的令牌，普通 `repo` 权限的令牌会被 GitHub 拒收，
且 GitHub 屏蔽的是整个 `.github/workflows/` 目录，改后缀名绕不过去。

启用方式二选一：网页上新建 `.github/workflows/check.yml` 并粘贴其内容；
或换用带 `workflow` 权限的令牌后 `git mv .github/check-workflow.yml .github/workflows/check.yml`。

---

## 七、维护备忘

### 自检查什么

`npm run check` 在 2026-10 精简为三类，只保留真正抓到过 bug 的：

1. **i18n key 存在性** —— 中英两份都要有，词条数一致；
2. **HTML 兜底文案与中文词条一致** —— 元素文字、`placeholder`、`aria-label`。
   页面在 JS 执行前用兜底文本渲染，漂移了无脚本用户会看到过期内容；
3. **资源版本与指纹** —— `css/` 或 `js/` 内容变了就必须 `npm run bump`。
   否则浏览器与 CDN 继续用旧文件，表现是推上去了却没变化。

曾经还查资源存在性、标签配平、id 重复、`data-link` 合法性、第三方品牌词、字体文件、
流场接线、问答结构，都没有抓到过实际 bug，已移除。需要时从 git 历史找回来。

### 页面上的「只说真话」

- 留空的地址不在 HTML 里挂 `data-link`。点了没反应的按钮比没有这个按钮更差。
  目前只用了 `github`、`astras`、`minichat`。
- 动态、公告、项目区只写真实状态。
- 首屏输入框下方那行 `composer.note` 如实说明答案来源。
- `legal.html` 三节按本站实际情况撰写，不是模板占位文本。以后接入统计、登录或
  任何第三方脚本，必须同步隐私政策。

### 联系方式

邮箱 `official@astras.cc`，配置在 `config.js`。

很多机器没有注册 `mailto:` 处理程序（没装邮件客户端的 Windows 大多如此），点击毫无反应。
因此联系入口除 `mailto:` 外都带 `data-copy-email`，点击时复制地址到剪贴板并提示。

Cloudflare 的 Scrape Shield「电子邮件混淆」会把 HTML 里的 `mailto:` 改写成
`/cdn-cgi/l/email-protection#...`，靠注入脚本运行时还原。`main.js` 会用 `config.email`
重设 href，所以运行时正常，但无脚本环境下源码里的链接是坏的。
建议在 Cloudflare 控制台关掉 Email Address Obfuscation。

### 其它

- 本站托管在境外，不做 ICP 备案，页脚不显示备案号，相关代码已移除。
  若改为境内托管并完成备案，再补回 `#filing` 元素与渲染逻辑。
- 页脚二维码在拿到真实二维码前不显示。拿到后放进 `assets/`，填好 `config.js` 的
  `qrImage`，再把 `.qr-box` 加回三个页面。
- 不要加 Service Worker。

---

## 八、许可

站点代码以 MIT 许可发布，见 `LICENSE`。
`Oing` 名称、圆环图形与站内文案属于站点所有者。
`assets/fonts/` 下的字体为 SIL Open Font License 1.1，授权原文随附。
