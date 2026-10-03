/**
 * 站点配置。
 *
 * ⚠️ 原则：**页面上只渲染真实存在的入口**。
 * 留空的地址不要在 HTML 里挂 data-link —— 一个点了没反应的按钮，
 * 比根本没有这个按钮更伤。等某个入口真的可用了，再把对应的
 * data-link 加回 index.html。
 */
window.OING_CONFIG = {
  /** 站点主域名（用于 canonical / 分享链接，末尾不要加斜杠） */
  site: 'https://www.oing.top',

  /** 品牌信息 */
  brand: 'Oing',

  /**
   * 联系邮箱。页脚与法务页的联系入口都从这里取，
   * 页面上不写死地址（HTML 里的 mailto 只是无脚本时的兜底）。
   */
  email: 'official@astras.cc',

  /**
   * 站内问答的远端端点。留空 = 纯本地（只用手写事实库回答，不可能编造）。
   * 填上（例如 '/api/chat'）= 分层：先查本地事实库，没命中才调它。
   *
   * ⚠️ 一旦填了这里，就表示「访客的提问会被发送到该端点」——
   * legal.html 的隐私政策必须同步如实说明，否则就是不实陈述。
   * 端点实现见 worker/ 目录。
   */
  askEndpoint: '/api/chat',

  /**
   * 本站托管在境外（GitHub Pages + Cloudflare），不做 ICP 备案，
   * 页脚因此不显示备案号，相关代码已移除。
   * 若将来改为境内托管并完成备案，再补回页脚的备案号元素与渲染逻辑。
   */

  /** 各入口地址。页面上只渲染这里填了值的入口（留空的不渲染，避免点了没反应）。 */
  links: {
    github: 'https://github.com/ningqi24',  // 真实存在
    astras: 'https://www.astras.cc/',       // 个人精选工具导航站
    minichat: 'https://minichat.astras.cc/', // 轻量实时聊天
    chat: '',       // 对话产品，例如 https://chat.oing.top/
    platform: '',   // 开放平台控制台
    docs: '',       // 开发文档
    download: '',   // 客户端下载
    status: '',     // 服务状态
    blog: '',       // 更新日志 / 动态
  },

  /**
   * 页脚二维码图片。留空则页脚不显示二维码。
   * 拿到真实二维码后，把图片放到 assets/ 并把路径填在这里，
   * 同时在 index.html 的页脚里加回 .qr-box 那段。
   */
  qrImage: '',
};
