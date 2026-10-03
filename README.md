# www.oing.top

**Oing** 官网首页 —— 纯静态站点，无构建步骤、无运行时依赖、无第三方 npm 包。
推送到 GitHub 后由 GitHub Pages 托管，自定义域名 `www.oing.top`。

线上地址：<https://www.oing.top/> ｜ 仓库：<https://github.com/ningqi24/www.oing.top>

---

## 一、版权边界

页面结构与观感参考了当下主流 AI 产品官网的通行做法。**受著作权保护的东西一律没有复制。**

| 借鉴的（不受著作权保护的设计语言） | 没有碰的（受保护内容） |
| --- | --- |
| 顶部固定页头 + 居中主视觉 + 大输入框的构图 | 第三方公司名、产品名、商标、图形 Logo |
| 天空渐变背景 + 流场动画的视觉母题 | 官网原文案、标语、产品描述 |
| 配色、圆角刻度、间距刻度、字号刻度 | 图片 / 视频 / 插画素材 |
| 磨砂玻璃卡片的层次处理 | 站点源代码与 CSS |
| 极宽的标语字距、编辑式细线列表 | 备案号、公司主体信息、公众号二维码 |

**本项目的所有内容都是原创或来自开源许可：**
品牌名 `Oing`、圆环 + 轨道点图形、全部中英文案、全部 CSS 与 JS（含流场动画的实现）、
图标（由 `scripts/gen-icons.mjs` 用代码绘制）、字体（DM Sans / Montserrat，SIL OFL 1.1，见 `assets/fonts/LICENSE-*.txt`）。

**这条边界现在靠人守。** 以前 `npm run check` 里有一道硬门禁（页面里出现第三方品牌词或
备案号就失败），2026-10 精简自检时去掉了。规矩没变：不要为了「看起来像」把别人的商标、
素材、文案带回来。唯一的例外是站内问答里那几句**明确声明无关联**的话。

> 判断依据很简单：**设计语言**（配色、留白、排版、交互方式）不受著作权保护；
> **商标、文案、图片素材、源代码**受保护。分界线就在这里。

---

## 二、目录结构

```
.
├── index.html                  首页
├── legal.html                  服务条款 / 隐私政策 / 免责声明
├── 404.html                    404 页（GitHub Pages 自动使用）
├── favicon.svg / favicon.ico
├── CNAME                       GitHub Pages 自定义域名，固定为 www.oing.top
├── robots.txt / sitemap.xml / site.webmanifest
├── css/
│   ├── fonts.css               @font-face 声明（自托管）
│   └── style.css               全部样式：设计令牌 + 明暗双主题 + 全部响应式
├── js/
│   ├── config.js               ← 只改这个文件就能接上你自己的服务
│   ├── i18n.js                 ← 中英文案都在这里
│   ├── flowfield.js            首屏流场动画（原创实现，零依赖）
│   ├── header.js               悬浮玻璃胶囊页头（弹簧积分驱动，零依赖）
│   └── main.js                 交互逻辑
├── assets/
│   ├── fonts/                  DM Sans + Montserrat（OFL，含授权原文）
│   ├── icon-*.png / og-cover.png
│   └── qr-placeholder.svg
├── scripts/
│   ├── gen-icons.mjs           零依赖 PNG 生成器（自写 PNG 编码 + 栅格化）
│   ├── check.mjs               自检：npm run check（词条 / 兜底文案 / 版本指纹）
│   ├── audit.mjs               浏览器实测：多视口溢出 + 控制台 + 截图
│   └── serve.mjs               本地预览服务器
└── .github/check-workflow.yml  CI 配置（启用方法见第六节）
```

---

## 三、本地开发

需要 Node 18+。**不需要 `npm install`**，因为没有任何依赖。

```bash
npm run serve     # 本地预览 http://127.0.0.1:4173/
npm run check     # 自检（提交前跑一遍）
npm run test      # 问答检索 + Worker 纯逻辑
npm run test:live # 打真实域名验收（接口契约 + 安全断言 + Worker 事实库指纹）
npm run audit     # 用无头 Edge/Chrome 实测 390 / 768 / 1440 三个宽度并截图到 .tmp/
npm run bump -- 2.13.0   # 改版本号 + 全部 ?v= + 资源指纹（改完 css/js 必须跑）
npm run sync:html # 把 HTML 兜底文案从中文词条同步过去
npm run deploy:worker    # 重新生成事实库并部署 Worker
npm run icons     # 重新生成图标与分享封面
```

`npm run audit` 需要先开着 `npm run serve`。它用 DevTools 协议直连浏览器，
报告每个视口下**具体哪个元素越界了多少像素**，比肉眼看截图快得多。

> 注意：`--headless --screenshot --window-size=390,900` 这种截图方式会给出**假象**
> （内容被裁掉，看起来像严重横向溢出）。判断布局问题一律以 `npm run audit` 的数值为准。

---

## 四、改成你自己的内容

### 1. 接上真实入口（最重要）

打开 `js/config.js`，把 `links` 填上。留空时点击会提示"尚未配置"，不会跳死链。

```js
links: {
  chat: 'https://chat.oing.top/',   // 填了就会跳转
  platform: '', docs: '', download: '', status: '', blog: '', github: '',
}
```

同一个文件里还能改：品牌名、联系邮箱、备案号（填了页脚才显示）、二维码图片。

### 2. 改文案

所有中英文案都在 `js/i18n.js`，页面用 `data-i18n="key"` 引用。
**新 key 必须中英两份都加**，否则 `npm run check` 会失败。

### 3. 改配色与刻度

`css/style.css` 顶部 `:root` 是全部设计令牌，`[data-theme="dark"]` 是深色覆盖。
改 `--brand` 换主色，改 `--hero-sky-*` 换首屏天空渐变，改 `--flow-alpha` 调流场强度。

### 4. 调流场动画

`js/flowfield.js`。粒子数在 `seed()` 里按视口宽度分档，矢量场在 `angleAt()`。
它已经处理好了：DPR 上限 2、约 40fps 封顶、离开视口/切后台自动暂停、
`prefers-reduced-motion` 下只画一帧静态结果。

### 5. 调页头

页头是一颗**悬浮玻璃胶囊**：未滚动时贴边、占满容器、完全透明；滚过 `80px` 后
**横向内缩 + 纵向变薄**，同时磨砂玻璃淡入浮起来。

**所有设计数值都在 CSS 变量里**（`css/style.css` 的 `--hdr-*`），`js/header.js` 只负责插值：

| 变量 | 未滚动 | 滚动后 | 说明 |
| --- | --- | --- | --- |
| `--hdr-top` / `--hdr-top-on` | 8px | 5px | 容器顶部留白 |
| `--hdr-pad-y` / `--hdr-pad-y-on` | 4px | 2px | 胶囊纵向内边距 |
| `--hdr-inner-h` / `--hdr-inner-h-on` | 48px | 42px | 胶囊内容高度 |
| `--hdr-inset` | — | 80px | 滚动后**左右各内缩**多少 |
| `--hdr-pad-l-on` / `--hdr-pad-r-on` | — | 18 / 12px | 滚动后内容内缩 |
| `--hdr-inset-min` | — | 720 | 容器窄于此值就不内缩 |

想调"多细、多宽"直接改这几个变量，不用碰 JS。

**为什么横向内缩用相对值而不是固定的 980px**：参考站写死 980px，那是按它
"页头只有 logo + 一个按钮 + 语言切换"的内容量定的。本站页头有 logo + 4 个导航 +
语言 + 主题 + 主按钮，写死会憋。改成"相对容器内缩固定距离"，内容再多也不会挤，
窄屏还会自动不内缩。

**为什么用弹簧而不是 CSS transition**：`width`/`padding`/`height` 走 CSS 过渡是
"匀速收束 + 固定时长"，看着机械；弹簧（`stiffness 180 / damping 28 / mass 1`，
`c ≈ 2√(k·m)` 刚好临界阻尼，不回弹）会带着当前速度继续走，连续上下滚动时手感是液态的。
弹簧参数在 `js/header.js` 顶部。玻璃外观在 `.header-bar.is-scrolled`。
`prefers-reduced-motion` 下不做动画，直接落值。

### 6. 换图标

图标由 `scripts/gen-icons.mjs` 用代码画出来（手写 PNG 编码，零依赖）。
改 `drawIcon()` / `drawOg()` 的参数后跑 `npm run icons`。
想直接覆盖也行：替换 `assets/icon-192.png`、`icon-512.png`、`apple-touch-icon.png`、`og-cover.png`、`favicon.ico`。

### 7. 改完必须做

跑 `npm run check`，并把 `package.json` 的 `version` 加一位，
再同步三个 HTML 里 `css/*.css?v=` 和 `js/*.js?v=` 的版本号（自检会校验三者一致）。

加版本号是为了绕过 CDN / 浏览器的强缓存。本站**没有** Service Worker ——
静态展示站不需要它，多一层缓存反而会造成"改了看不到"。

---

## 五、部署（已完成，此节留作备忘）

仓库：<https://github.com/ningqi24/www.oing.top>
Pages：`main` 分支 / root 目录，自定义域名 `www.oing.top`（已写入 `CNAME`）。
DNS 在 Cloudflare，`www.oing.top` 代理到 `ningqi24.github.io`，`oing.top` 已 301 到 www。

更新站点：

```bash
npm run check
git add -A && git commit -m "chore: 更新内容"
git push
```

然后**轮询线上做字符串断言**，确认真的生效（Cloudflare 有缓存，通常十几秒到几分钟）：

```bash
curl -s https://www.oing.top/ | findstr /i "Oing"
curl -s https://www.oing.top/css/style.css | findstr /i "brand"
```

### 可选：开启 GitHub Actions 自检

`.github/check-workflow.yml` 已写好但**默认没有启用**。原因：把文件放进
`.github/workflows/` 属于"修改仓库工作流"，推送它的令牌必须带 `workflow` 权限，
普通 `repo` 权限的令牌会被 GitHub 直接拒收。而且 GitHub 屏蔽的是整个
`.github/workflows/` 目录，改后缀名也绕不过去。

启用方式二选一：

**A. 网页上加**：仓库 → Add file → Create new file → 文件名填
`.github/workflows/check.yml` → 粘贴 `.github/check-workflow.yml` 的内容 → 提交。

**B. 用带 workflow 权限的令牌**：

```bash
git mv .github/check-workflow.yml .github/workflows/check.yml
git commit -m "ci: 启用自检工作流" && git push
```

---

## 六、站内问答（分两层）

首屏那个输入框是真的能用的。它分两层：

```
用户提问
  └─ 1. 本地事实库检索（js/qa.js，15 条手写问答 + bigram 匹配）
       命中 → 直接回答。免费、瞬时、**结构上不可能编造**
       未命中 ↓
  └─ 2. 远端模型（worker/ 里的 Cloudflare Worker → OpenRouter 免费模型）
       Worker 把 15 条事实塞进 system prompt，把模型锁死在事实上
       失败/超时/限流 ↓
  └─ 3. 本地兜底文案（明说不知道，并给出邮箱）
```

**为什么要分两层**：常见问题永远由手写答案回答，不会被模型碰到；罕见问题才交给模型，
而且被事实库约束着。这样既省额度，也不会让「这是什么」这种问题的答案变得不确定。

### 相关文件

| 文件 | 作用 |
| --- | --- |
| `js/qa.js` | 事实库。15 条，中英双语，**手写可核对** |
| `js/ask.js` | 检索引擎 + 界面接线。引擎（`match()`）与界面分离，换后端只改 `remoteAsk()` |
| `scripts/test-qa.mjs` | 53 条用例锁住路由，含 7 条「应当兜底」的负例 |
| `worker/` | 远端那层。部署见 `worker/README.md` |
| `scripts/test-worker.mjs` | 免费模型判定/排序/提示词/事实同步的纯逻辑测试 |

```bash
npm test              # 问答检索 + worker 逻辑（本地，离线可跑）
npm run test:live     # 线上验收：打真实域名，验证 Worker 接口与前端资源
npm run build:facts   # 改了 js/qa.js 之后，重新生成 worker 的事实库
```

`npm run test:live` 不能省 —— **部署之后到底通不通、会不会 500、延迟多长，

### 加一条问答

1. 往 `js/qa.js` 里加一条，`keys` 尽量把用户可能用的说法都列上（中英都写）；
2. **不要放「什么关系」「copy」这类通用词** —— 会把无关提问误吸过来；
3. 在 `scripts/test-qa.mjs` 加至少一条用例，并跑 `npm test`；
4. 跑 `npm run build:facts` 同步 worker 的事实库；
5. 跑 `npm run check`。

### 两个必须记住的约束

- **`is-this-ai` 那条分「本地版」和「接了模型版」两套答案**（`zh`/`en` 与 `remoteZh`/`remoteEn`）。
  有没有接远端，事实是不一样的 —— 接了却还用本地版，就是不实陈述。
- **一旦配了 `askEndpoint`，隐私政策必须同步**：要写明「提问会发给 OpenRouter」和
  「本站不保存提问内容」。这条以前有自检硬规则盯着，精简时去掉了 —— **现在只能靠人记住**。
  改配置时务必一起改 `legal.html` 的隐私政策，否则就是不实陈述。

---

## 七、维护备忘

- **改完先 `npm run check`**（2026-10 已精简，只查三类真正抓到过 bug 的）：
  1. **i18n key 存在性** —— 中英两份都要有，且词条数一致；
  2. **HTML 兜底文案与中文词条一致** —— 元素文字 / `placeholder` / `aria-label`。
     页面在 JS 跑起来之前用兜底文本渲染，漂移了无脚本用户就会看到过期内容
     （`placeholder` 漏同步过一次，浏览器里完全看不出来）。跑 `npm run sync:html` 自动同步；
  3. **资源版本与指纹** —— css/js 内容变了就必须 `npm run bump -- <版本号>`。
     否则浏览器/CDN 继续用旧文件，表现是「明明推上去了却没变化」。这条抓到过两次。

  曾经还查资源存在性、标签配平、id 重复、`data-link` 合法性、第三方品牌词、字体文件、
  流场接线、问答结构 —— 都没有抓到过实际 bug，按决定精简掉了（需要时从 git 历史找回来）。
- **`npm run audit` 看移动端**：横向溢出是移动端最容易出的问题，靠肉眼很难发现。
  它同时会实测页头：滚动前后的实际宽度、`padding-left`、`is-scrolled` 类、`backdrop-filter`
  是否都按预期变化，并截两张对比图（`.tmp/header-top.png` / `.tmp/header-scrolled.png`）。
- **改了看不到 → 先证明线上文件是否真的变了**（用上面的 curl），再怀疑缓存层。
- **不要加 Service Worker。**

### 「只说真话」这条规矩

页面上**只保留真实存在的入口与真实的状态描述**：

- 留空的地址**不要在 HTML 里挂 `data-link`** —— 一个点了没反应的按钮，比根本没有这个按钮更伤。
  某个入口真的可用了，再把对应的 `data-link` 加回去。目前页面上只用了 `github`。
- 动态、公告、能力区都要写真实状态（"开发中"就是"开发中"），不要写不存在产品的发布公告。
- 首屏输入框下面有一行 `composer.note`，明说对话功能还不能用 —— 别让一个看着能用的输入框骗人。
- `legal.html` 的三节（服务条款 / 隐私政策 / 免责声明）已经是**按本站实际情况**写的真条款，
  不是模板占位文本。如果以后接入统计、登录或任何第三方脚本，**必须回来同步隐私政策**。

**联系方式不会「点了没反应」**：很多机器（尤其是没装邮件客户端的 Windows）根本没有注册
`mailto:` 处理程序，点下去毫无动静。所以联系入口除了 `mailto:` 之外还带 `data-copy-email`，
点击时会顺手把地址复制到剪贴板并弹出提示 —— 有邮件客户端就照常打开，没有的话用户至少拿到了地址。

> ⚠️ **Cloudflare 的「电子邮件混淆」**（Scrape Shield）会把 HTML 里的 `mailto:` 改写成
> `/cdn-cgi/l/email-protection#...`，靠它自己注入的脚本在运行时还原。
> 我们的 `main.js` 本来就会用 `config.email` 重设 href，所以**运行时是好的**，
> 但无脚本环境下源码里的链接是坏的。建议去 Cloudflare 控制台 →
> Scrape Shield → Email Address Obfuscation **关掉它**（这个地址本来就是公开的，混淆没有意义）。

**联系邮箱**：`official@astras.cc`，在 `config.js` 的 `email` 里。
页面上不写死地址 —— 所有联系入口都带 `data-email` 属性，由 `main.js` 统一注入
`href`；法务页那个还要显示地址的，额外加 `data-email-text`。
HTML 里保留的 `mailto:` 只是无脚本时的兜底，改邮箱时**两边都要改**（`config.js` 与三个 HTML）。

**本站不做 ICP 备案**：托管在境外（GitHub Pages + Cloudflare），页脚不显示备案号，
相关代码（`#filing` 元素与 `main.js` 里的渲染逻辑）已移除。
若将来改为境内托管并完成备案，再补回页脚的备案号元素和对应渲染。

页脚二维码在拿到真实二维码之前**不显示**（原来那张占位图已经移除）；
拿到之后把图片放进 `assets/`，填好 `config.js` 的 `qrImage`，再把 `.qr-box` 那段加回三个页面的页脚。

---

## 八、许可

站点代码以 MIT 许可发布，见 `LICENSE`。
`Oing` 名称、圆环图形与站内文案属于站点所有者。
`assets/fonts/` 下的字体为 SIL Open Font License 1.1，授权原文随附。
