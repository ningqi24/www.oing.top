# www.oing.top

**Oing** 官网首页 —— 纯静态站点，无构建步骤、无运行时依赖、无 npm 第三方包。
推送到 GitHub 后由 GitHub Pages 直接托管，自定义域名 `www.oing.top`。

---

## 一、先说清楚版权边界

这个站点的**页面骨架与交互方式**参考了当下主流 AI 产品官网的通用做法
（顶部导航 + 居中主视觉 + 大输入框 + 卡片式产品入口 + 多列页脚 + 中英切换），
但**所有内容都是原创的**。以下这些一律没有复制，也请不要在后续修改中加回来：

| 不复刻的内容 | 本项目的做法 |
| --- | --- |
| 第三方公司名称、产品名、商标、Logo 图形 | 自绘"圆环 + 轨道点"图形，品牌名 Oing |
| 官网原文案、标语、产品描述 | `js/i18n.js` 中全部为原创文案 |
| 图片、视频、插画、图表素材 | `scripts/gen-icons.mjs` 用代码生成，或自绘 SVG |
| 站点源代码、CSS、JS | 100% 手写 |
| 备案号、公司主体信息、公众号二维码 | 留空占位，由你在 `js/config.js` 填写自己的 |
| 第三方业务链接（对话站 / 开放平台 / 文档站） | 全部留空占位，配置后才会跳转 |

`npm run check` 里有一道**硬门禁**：只要 `index.html` / `legal.html` / `404.html` /
`css/style.css` / `js/*.js` 里出现第三方品牌词或备案号，自检直接失败。
这条规则是为了防止以后不小心把别人的东西带进来。

> 视觉风格（配色、留白、排版这类设计语言）本身不受著作权保护，
> 但商标、文案、图片素材、源代码受保护 —— 边界就在这里。

---

## 二、目录结构

```
.
├── index.html               首页（唯一的主页面）
├── legal.html               服务条款 / 隐私政策 / 免责声明
├── 404.html                 404 页（GitHub Pages 自动使用）
├── favicon.svg / favicon.ico
├── CNAME                    GitHub Pages 自定义域名，内容固定为 www.oing.top
├── robots.txt / sitemap.xml / site.webmanifest
├── css/
│   └── style.css            全部样式，含明暗两套主题与全部响应式规则
├── js/
│   ├── config.js            ← 只改这个文件就能接上你自己的服务
│   ├── i18n.js              ← 中英文案都在这里
│   └── main.js              交互逻辑（无依赖原生 JS）
├── assets/                  图标与分享封面（由脚本生成）
├── scripts/
│   ├── gen-icons.mjs        零依赖 PNG 生成器（自己写的 PNG 编码 + 栅格化）
│   ├── check.mjs            自检门禁：npm run check
│   ├── audit.mjs            浏览器实测：多视口横向溢出 + 控制台报错 + 截图
│   └── serve.mjs            本地预览服务器
└── .github/check-workflow.yml    CI 配置（启用方法见第五节末尾）
```

---

## 三、本地开发

需要 Node 18+（本机是 v25）。**不需要 `npm install`**，因为没有任何依赖。

```bash
npm run serve     # 启动本地预览 http://127.0.0.1:4173/
npm run check     # 自检（提交前务必跑一遍）
npm run audit     # 用无头 Edge/Chrome 实测 390 / 768 / 1440 三个宽度并截图到 .tmp/
npm run icons     # 重新生成图标与分享封面
```

`npm run audit` 需要先开着 `npm run serve`。它会用 DevTools 协议直连浏览器，
报告每个视口下**具体哪个元素越界了多少像素**，比肉眼看截图快得多。

---

## 四、改成你自己的内容

### 1. 接上真实入口（最重要）

打开 `js/config.js`，把 `links` 里的地址填上：

```js
links: {
  chat: 'https://chat.oing.top/',   // 填了就会跳转；留空则点击时提示"尚未配置"
  platform: '',
  docs: '',
  download: '',
  status: '',
  blog: '',
  github: '',
}
```

同一个文件里还能改：品牌名、联系邮箱、备案号（填了页脚才会显示）、二维码图片。

### 2. 改文案

所有中英文案都在 `js/i18n.js`。HTML 里用 `data-i18n="key"` 引用。
**加了新 key 记得中英两份都加**，否则 `npm run check` 会失败。

### 3. 改配色

`css/style.css` 顶部的 `:root` 变量就是全部设计令牌，
`[data-theme="dark"]` 是深色模式覆盖值。改 `--brand-500` 就能换主色。

### 4. 换图标与分享封面

图标是 `scripts/gen-icons.mjs` 用代码画出来的（手写 PNG 编码，零依赖）。
改 `drawIcon()` / `drawOg()` 里的尺寸参数，然后 `npm run icons`。
想直接用设计稿也行，覆盖 `assets/icon-192.png`、`icon-512.png`、
`apple-touch-icon.png`、`og-cover.png` 和 `favicon.ico` 即可。

### 5. 改完必须做

改完 `npm run check`，**并且把 `package.json` 的 `version` 加一位**，
再同步三个 HTML 里 `css/style.css?v=` 和 `js/*.js?v=` 的版本号
（`npm run check` 会校验三者一致）。

加版本号是为了绕过 CDN / 浏览器的强缓存。本站**没有** Service Worker ——
静态展示站不需要它，多一层缓存反而会造成"改了看不到"，得不偿失。

---

## 五、部署到 GitHub Pages

### 第 1 步：在 GitHub 上创建仓库

仓库名建议就用 **`www.oing.top`**（和域名同名，最直观）。

### 第 2 步：推送本地代码

```bash
git remote add origin https://github.com/<你的用户名>/www.oing.top.git
git branch -M main
git push -u origin main
```

### 第 3 步：开启 Pages

仓库 → **Settings** → **Pages**：

- **Source** 选 `Deploy from a branch`
- **Branch** 选 `main`，目录选 `/ (root)`
- 保存，等 1～2 分钟

> 本仓库已包含 `CNAME`（内容 `www.oing.top`）和 `.nojekyll`，
> 所以不需要在网页里再填域名，也不会因为下划线开头的文件被 Jekyll 处理掉。

### 第 4 步：配置 DNS

到你的域名服务商（oing.top 的 DNS 管理页）添加：

| 类型 | 主机记录 | 记录值 | 说明 |
| --- | --- | --- | --- |
| CNAME | `www` | `<你的用户名>.github.io` | www.oing.top |
| A | `@` | `185.199.108.153` | 让 apex 域名 oing.top 也能访问 |
| A | `@` | `185.199.109.153` | |
| A | `@` | `185.199.110.153` | |
| A | `@` | `185.199.111.153` | |

配好后 GitHub 会把 `oing.top` **自动 301 跳转**到 `www.oing.top`（因为 CNAME 文件写的是 www）。

### 第 5 步：开 HTTPS

DNS 生效（通常几分钟到 1 小时）后回到 Pages 设置页，
勾选 **Enforce HTTPS**。让 GitHub 自动签发 Let's Encrypt 证书，可能要等十几分钟。

### 第 6 步：确认线上真的生效

DNS 是分层的，别只信浏览器。直接抓线上文件断言：

```bash
curl -sI https://www.oing.top/ | findstr /i "HTTP"
curl -s https://www.oing.top/ | findstr /i "Oing"
curl -s https://www.oing.top/css/style.css | findstr /i "brand-500"
```

### 可选：开启 GitHub Actions 自检

`.github/check-workflow.yml` 已经写好，但**默认没有启用**。
原因是：把文件放进 `.github/workflows/` 属于「修改仓库工作流」，
推送它的令牌必须带 `workflow` 权限，普通 `repo` 权限的令牌会被 GitHub 直接拒收
（报错 `refusing to allow a Personal Access Token to create or update workflow`）。
而且 GitHub 屏蔽的是整个 `.github/workflows/` 目录，改后缀名也绕不过去。

想启用，二选一：

**A. 网页上加（最省事）**
GitHub 仓库 → Add file → Create new file → 文件名填
`.github/workflows/check.yml` → 把 `.github/check-workflow.yml` 的内容粘进去 → 提交。

**B. 用带 workflow 权限的令牌**

```bash
git mv .github/check-workflow.yml .github/workflows/check.yml
git commit -m "ci: 启用自检工作流"
git push
```

---

## 六、维护备忘

- **改完先 `npm run check`**：它会一次性检查 i18n 词条完整性、资源引用是否存在、
  版本号是否同步、标签是否闭合、id 是否重复、data-link 是否合法、有没有混入第三方品牌词。
- **`npm run audit` 看移动端**：横向溢出是移动端最容易出的问题，靠肉眼很难发现。
- **改了看不到 → 先证明线上文件是否真的变了**（用上面的 curl），再怀疑缓存层。
- **不要加 Service Worker**。
- 页脚备案号、公众号二维码、`legal.html` 的条款正文都是**占位内容，上线前必须替换**。

---

## 七、许可

站点代码以 MIT 许可发布，见 `LICENSE`。
`Oing` 名称、Logo 图形与站内文案属于站点所有者。
