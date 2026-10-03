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
  /** 备案号等信息，留空则不显示 */
  icp: '',
  police: '',
  email: 'hi@oing.top',

  /** 各入口地址。目前只有 github 是真实可用的，页面也只渲染了这一个。 */
  links: {
    github: 'https://github.com/ningqi24',  // 真实存在
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
