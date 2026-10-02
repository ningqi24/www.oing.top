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

`npm run check` 里有一道**硬门禁**：只要页面文件里出现第三方品牌词或备案号，自检直接失败。
这条规则是为了防止以后不小心把别人的东西带回来。

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
│   └── main.js                 交互逻辑
├── assets/
│   ├── fonts/                  DM Sans + Montserrat（OFL，含授权原文）
│   ├── icon-*.png / og-cover.png
│   └── qr-placeholder.svg
├── scripts/
│   ├── gen-icons.mjs           零依赖 PNG 生成器（自写 PNG 编码 + 栅格化）
│   ├── check.mjs               自检门禁：npm run check
│   ├── audit.mjs               浏览器实测：多视口溢出 + 控制台 + 截图
│   └── serve.mjs               本地预览服务器
└── .github/check-workflow.yml  CI 配置（启用方法见第六节）
```

---

## 三、本地开发

需要 Node 18+。**不需要 `npm install`**，因为没有任何依赖。

```bash
npm run serve     # 本地预览 http://127.0.0.1:4173/
npm run check     # 自检（提交前务必跑一遍）
npm run audit     # 用无头 Edge/Chrome 实测 390 / 768 / 1440 三个宽度并截图到 .tmp/
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

### 5. 换图标

图标由 `scripts/gen-icons.mjs` 用代码画出来（手写 PNG 编码，零依赖）。
改 `drawIcon()` / `drawOg()` 的参数后跑 `npm run icons`。
想直接覆盖也行：替换 `assets/icon-192.png`、`icon-512.png`、`apple-touch-icon.png`、`og-cover.png`、`favicon.ico`。

### 6. 改完必须做

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

## 六、维护备忘

- **改完先 `npm run check`**：一次检查 i18n 词条完整性、资源引用是否存在、
  字体文件是否存在、版本号是否同步、标签是否闭合、id 是否重复、
  `data-link` 是否合法、有没有混入第三方品牌词。
- **`npm run audit` 看移动端**：横向溢出是移动端最容易出的问题，靠肉眼很难发现。
- **改了看不到 → 先证明线上文件是否真的变了**（用上面的 curl），再怀疑缓存层。
- **不要加 Service Worker。**
- 页脚备案号、公众号二维码、`legal.html` 的条款正文都是**占位内容，上线前必须替换**。

---

## 七、许可

站点代码以 MIT 许可发布，见 `LICENSE`。
`Oing` 名称、圆环图形与站内文案属于站点所有者。
`assets/fonts/` 下的字体为 SIL Open Font License 1.1，授权原文随附。
