/**
 * 站点配置 —— 只需要改这一个文件就能把入口接到你自己的服务上。
 * 留空字符串时，点击对应入口会提示"尚未配置"，不会跳到死链。
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

  /** 各入口地址，留空则提示未配置 */
  links: {
    chat: '',       // 对话产品，例如 https://chat.oing.top/
    platform: '',   // 开放平台控制台
    docs: '',       // 开发文档
    download: '',   // 客户端下载
    status: '',     // 服务状态
    blog: '',       // 更新日志 / 动态
    github: '',     // GitHub 组织或仓库
  },

  /** 页脚"关注公众号"二维码图片，替换 assets/qr-placeholder.svg 即可 */
  qrImage: 'assets/qr-placeholder.svg',
};
