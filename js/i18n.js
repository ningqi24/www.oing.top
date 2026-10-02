/**
 * 多语言词条。
 * 只改这里就能改全站文案（HTML 里用 data-i18n / data-i18n-placeholder 引用 key）。
 * scripts/check.mjs 会校验：页面里出现的每个 key 在 zh / en 中都必须存在。
 */
window.OING_I18N = {
  zh: {
    'meta.title': 'Oing — 让智能更近一步',
    'meta.description': 'Oing 是一个专注于理解与创造的通用智能助手。提问、写作、编程、分析，从一句话开始。',

    'a11y.skip': '跳到主要内容',

    'nav.product': '产品',
    'nav.capability': '能力',
    'nav.news': '动态',
    'nav.docs': '开发文档',
    'nav.legal': '法务',
    'header.cta': '开始使用',

    'announce.text': 'Oing v1.0 正式发布：更快、更准、更省。',
    'announce.more': '查看详情',

    'hero.slogan': '让智能更近一步',
    'composer.label': '输入你的问题',
    'composer.placeholder': '有什么想知道的？',
    'composer.attach': '添加附件',
    'composer.reason': '深度思考',
    'composer.search': '联网搜索',
    'hero.action.chat': '开始对话',
    'hero.action.platform': '开放平台',
    'hero.action.docs': '开发文档',

    'cap.eyebrow': 'Capabilities',
    'cap.title': '能力',
    'cap.1.t': '深度推理',
    'cap.1.d': '面对多步难题先想清楚再回答，推理路径可追溯。',
    'cap.2.t': '联网搜索',
    'cap.2.d': '需要最新信息时自动检索，并给出可核对的来源。',
    'cap.3.t': '超长上下文',
    'cap.3.d': '整本手册、整份财报一次读进来，不丢细节。',
    'cap.4.t': '代码与工具',
    'cap.4.d': '读懂整个仓库，调用函数与外部工具完成任务。',
    'cap.5.t': '多模态理解',
    'cap.5.d': '图片、表格、扫描件，看懂之后再动笔。',
    'cap.6.t': '可控与安全',
    'cap.6.d': '数据用途透明，权限边界清晰，随时可以撤回。',

    'news.eyebrow': 'Updates',
    'news.title': '动态',
    'news.1.t': 'Oing v1.0 正式发布',
    'news.1.d': '首版开放对话、推理与联网能力。',
    'news.2.t': '开放平台开始公测',
    'news.2.d': '开发者可以申请密钥并接入自己的应用。',
    'news.3.t': '桌面端上线',
    'news.3.d': '支持全局唤起与本地文件读取。',

    'footer.slogan': '让智能更近一步。',
    'footer.qr': '关注我们',
    'footer.col1': '产品',
    'footer.chat': '对话',
    'footer.download': '客户端',
    'footer.platform': '开放平台',
    'footer.status': '服务状态',
    'footer.col2': '资源',
    'footer.docs': '开发文档',
    'footer.blog': '更新日志',
    'footer.terms': '服务条款',
    'footer.privacy': '隐私政策',
    'footer.col3': '关于',
    'footer.about': '关于我们',
    'footer.contact': '联系我们',
    'footer.github': 'GitHub',
    'footer.rights': '保留所有权利',

    'msg.notConfigured': '这个入口还没有配置，在 js/config.js 里填上地址即可。',
    'msg.sent': '演示站点：请把这段消息接到你自己的对话服务。',
    'msg.attached': '演示站点暂不支持上传附件。',
    'msg.theme.light': '已切换为浅色',
    'msg.theme.dark': '已切换为深色',

    'legal.title': '法务信息',
    'legal.updated': '最近更新：2026-09-28',
    'legal.terms.t': '服务条款',
    'legal.terms.p': '本页为站点模板示例文本，正式上线前请替换为你自己的条款。使用本网站即表示你同意遵守适用的法律法规以及本条款。',
    'legal.privacy.t': '隐私政策',
    'legal.privacy.p': '本页为站点模板示例文本。本站是纯静态页面，默认不收集任何个人数据；若后续接入统计或登录服务，请在此如实说明收集范围、用途与保留期限。',
    'legal.disclaimer.t': '免责声明',
    'legal.disclaimer.p': '本站展示的产品名称、图形与文案均为本站原创或已获授权，不代表任何第三方。',
    'legal.contact.t': '联系我们',
    'legal.contact.p': '如有任何疑问，欢迎邮件联系。',
    'legal.back': '返回首页',

    'nf.title': '页面走丢了',
    'nf.sub': '你访问的地址不存在，或者已经被移动到别处。',
    'nf.home': '回到首页',
  },

  en: {
    'meta.title': 'Oing — Closer to intelligence',
    'meta.description': 'Oing is a general-purpose assistant built for understanding and creating. Ask, write, code, analyse — starting from one sentence.',

    'a11y.skip': 'Skip to main content',

    'nav.product': 'Product',
    'nav.capability': 'Capabilities',
    'nav.news': 'Updates',
    'nav.docs': 'Docs',
    'nav.legal': 'Legal',
    'header.cta': 'Get started',

    'announce.text': 'Oing v1.0 is out: faster, sharper, cheaper.',
    'announce.more': 'Read more',

    'hero.slogan': 'Closer to intelligence',
    'composer.label': 'Type your question',
    'composer.placeholder': "What's on your mind?",
    'composer.attach': 'Attach a file',
    'composer.reason': 'Deep think',
    'composer.search': 'Web search',
    'hero.action.chat': 'Start a chat',
    'hero.action.platform': 'Open Platform',
    'hero.action.docs': 'Documentation',

    'cap.eyebrow': 'Capabilities',
    'cap.title': 'Capabilities',
    'cap.1.t': 'Deep reasoning',
    'cap.1.d': 'Thinks a multi-step problem through before answering, with a traceable path.',
    'cap.2.t': 'Web search',
    'cap.2.d': 'Retrieves fresh information when needed and cites verifiable sources.',
    'cap.3.t': 'Long context',
    'cap.3.d': 'Reads a whole manual or filing in one pass without losing the details.',
    'cap.4.t': 'Code & tools',
    'cap.4.d': 'Understands a full repository and calls functions or external tools.',
    'cap.5.t': 'Multimodal',
    'cap.5.d': 'Images, tables and scans — understood before a word is written.',
    'cap.6.t': 'Control & safety',
    'cap.6.d': 'Transparent data use, clear permission boundaries, revocable at any time.',

    'news.eyebrow': 'Updates',
    'news.title': 'Updates',
    'news.1.t': 'Oing v1.0 released',
    'news.1.d': 'The first release ships chat, reasoning and web search.',
    'news.2.t': 'Open Platform in public beta',
    'news.2.d': 'Developers can request a key and integrate their own apps.',
    'news.3.t': 'Desktop app available',
    'news.3.d': 'Global hotkey and local file reading supported.',

    'footer.slogan': 'Closer to intelligence.',
    'footer.qr': 'Follow us',
    'footer.col1': 'Product',
    'footer.chat': 'Chat',
    'footer.download': 'Apps',
    'footer.platform': 'Open Platform',
    'footer.status': 'Status',
    'footer.col2': 'Resources',
    'footer.docs': 'Documentation',
    'footer.blog': 'Changelog',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.col3': 'Company',
    'footer.about': 'About us',
    'footer.contact': 'Contact',
    'footer.github': 'GitHub',
    'footer.rights': 'All rights reserved',

    'msg.notConfigured': 'This entry is not configured yet — add the URL in js/config.js.',
    'msg.sent': 'Demo site: wire this message up to your own chat service.',
    'msg.attached': 'File upload is not available on this demo site.',
    'msg.theme.light': 'Switched to light mode',
    'msg.theme.dark': 'Switched to dark mode',

    'legal.title': 'Legal',
    'legal.updated': 'Last updated: 2026-09-28',
    'legal.terms.t': 'Terms of Service',
    'legal.terms.p': 'This page is template placeholder text. Replace it with your own terms before going live. By using this website you agree to comply with applicable laws and these terms.',
    'legal.privacy.t': 'Privacy Policy',
    'legal.privacy.p': 'This page is template placeholder text. This site is fully static and collects no personal data by default. If you later add analytics or sign-in, describe the scope, purpose and retention period here honestly.',
    'legal.disclaimer.t': 'Disclaimer',
    'legal.disclaimer.p': 'All product names, graphics and copy shown on this site are original to this site or used with permission, and do not represent any third party.',
    'legal.contact.t': 'Contact us',
    'legal.contact.p': 'For any question, feel free to email us.',
    'legal.back': 'Back to home',

    'nf.title': 'Page not found',
    'nf.sub': 'The address you visited does not exist, or has been moved elsewhere.',
    'nf.home': 'Back to home',
  },
};

/** 把指定语言应用到当前文档。 */
window.oingApplyLang = function (lang) {
  var dict = window.OING_I18N || {};
  var table = dict[lang] || dict.zh || {};
  var fallback = dict.zh || {};

  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    var value = table[key] || fallback[key];
    if (typeof value === 'string') el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-placeholder');
    var value = table[key] || fallback[key];
    if (typeof value === 'string') el.setAttribute('placeholder', value);
  });

  document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-label');
    var value = table[key] || fallback[key];
    if (typeof value === 'string') el.setAttribute('aria-label', value);
  });

  var title = table['meta.title'] || fallback['meta.title'];
  if (title) document.title = title;
  var desc = document.querySelector('meta[name="description"]');
  if (desc) {
    var d = table['meta.description'] || fallback['meta.description'];
    if (d) desc.setAttribute('content', d);
  }
};

/** 取当前语言下的词条，供脚本内部使用。 */
window.oingT = function (key) {
  var dict = window.OING_I18N || {};
  var lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
  var table = dict[lang] || {};
  return table[key] || (dict.zh || {})[key] || key;
};
