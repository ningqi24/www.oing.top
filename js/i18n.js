/**
 * 多语言词条。
 * 只改这里就能改全站文案（HTML 里用 data-i18n / data-i18n-placeholder 引用 key）。
 * scripts/check.mjs 会校验：页面里出现的每个 key 在 zh / en 中都必须存在，
 * 并且 HTML 里的兜底文字必须与 zh 词条完全一致（用 npm run sync:html 自动同步）。
 *
 * 文案风格（2026-10 定）：**技术文档腔**。
 *   · 具体、可验证、少形容词，不拟人（不写"读懂""看懂""动笔"）
 *   · 六条能力描述刻意**不保持句式对仗** —— 整齐划一是批量生成的指纹
 *   · 唯一的例外是 slogan，它负责气质，正文负责信息
 */
window.OING_I18N = {
  zh: {
    'meta.title': 'Oing — 让智能更近一步',
    'meta.description': 'Oing 是一个通用工具，目前仍在开发中。本站为其官方页面，用于说明开发进展。',

    'a11y.skip': '跳到主要内容',

    'nav.projects': '项目',
    'nav.news': '动态',
    'nav.legal': '法务',
    'header.cta': 'GitHub',

    'announce.text': '产品开发中，尚未开放使用。',
    'announce.more': '查看动态',

    'hero.slogan': '让智能更近一步',
    'composer.label': '输入你的问题',
    'composer.placeholder': '输入问题',
    'ask.note': '本框仅回答关于本站、已确认的问题。答案均为手写；无法回答时会直接说明。',
    'ask.noteRemote': '常见问题由手写答案回答；未覆盖的问题交由语言模型处理。问及本站时，它被限制为只能依据站内已确认的事实作答。',
    'ask.thinking': '查询中，可能需要数秒…',
    'ask.remoteSrc': '本条由语言模型生成，可能不准确。',
    'ask.quotaNote': '模型服务当天的免费额度已用完，所以这里给的是站内兜底回答。',
    'ask.you': '提问',
    'ask.continue': '继续追问 →',
    'ask.foot': '以上为手写答案。如有出入，欢迎邮件指出：',
    'chat.meta.title': '站内问答 — Oing',
    'chat.title': '站内问答',
    'chat.note': '常见问题由手写答案回答；未覆盖的会交由语言模型处理。回答可能不准确，重要事项请以邮件确认。',
    'chat.empty': '可以点下面的问题，也可以直接输入：',
    'ask.chipsLabel': '常见问题',
    'ask.chip1': 'Oing 是什么？',
    'ask.chip2': '何时可以使用？',
    'ask.chip3': '如何联系你们？',
    'ask.chip4': '与 DeepSeek 是什么关系？',
    'ask.chip5': '是否收费？',
    'hero.action.github': '在 GitHub 上关注',
    'hero.action.news': '查看进展',

    'proj.eyebrow': 'Projects',
    'proj.title': '项目',
    'proj.note': '同一个维护者的另外两个站点，现在都可以直接使用。',
    'proj.astras.tag': '工具导航',
    'proj.astras.d': '个人维护的精选工具导航站。每条都人工实测、附点评与实测时间，不做机器采集，每季度复核一次。',
    'proj.minichat.tag': '实时聊天',
    'proj.minichat.d': '原生 HTML + Supabase 的轻量实时聊天，无框架依赖。支持实时消息、文件分享与图片压缩，可安装为 PWA 离线使用；开源，MIT 协议。',

    'news.eyebrow': 'Updates',
    'news.title': '动态',
    'news.1.t': '官网已上线',
    'news.1.d': '首页与法务页面已就绪。',
    'news.2.t': '产品开发中',
    'news.2.d': '对话与开放平台尚未开放，后续进展将在此更新。',
    'news.3.t': '首页改版',
    'news.3.d': '移除了尚未确定的能力清单，改为介绍同一维护者的另外两个站点。',

    'footer.slogan': '让智能更近一步。',
    'footer.col2': '法务',
    'footer.terms': '服务条款',
    'footer.privacy': '隐私政策',
    'footer.disclaimer': '免责声明',
    'footer.col3': '关于',
    'footer.contact': '联系我们',
    'footer.github': 'GitHub',
    'footer.rights': '保留所有权利',

    'msg.notConfigured': '该入口尚未配置，暂时不可用。',
    'msg.sent': '对话功能仍在开发中，暂不可用。',
    'msg.emailCopied': '邮箱已复制到剪贴板。',
    'msg.theme.light': '已切换为浅色',
    'msg.theme.dark': '已切换为深色',

    'legal.meta.title': '法务信息 — Oing',
    'legal.title': '法务信息',
    'legal.updated': '最近更新：2026-10-02',
    'legal.terms.t': '服务条款',
    'legal.terms.p1': '本站为 Oing 的官方展示页面，不提供账号系统，也没有付费功能。',
    'legal.terms.p2': '站内文字、图形与代码的知识产权归本站所有或已获授权。你可以自由浏览与分享链接；如需整页转载，请先与我们联系。',
    'legal.terms.p3': '本站可能随时变更内容、暂停或关闭，恕不另行通知。继续浏览即表示你接受本条款。',
    'legal.privacy.t': '隐私政策',
    'legal.privacy.p1': '本站不收集个人数据：无账号、无表单提交、无埋点，也不接入任何第三方统计或广告脚本。',
    'legal.privacy.p2': '本站会在你的浏览器本地存储两项偏好 —— 明暗主题与界面语言。这些数据只保存在你自己的设备上，不会发送到任何服务器；清除浏览器数据即可删除。',
    'legal.privacy.p3': '本站托管于 GitHub Pages，域名解析由 Cloudflare 提供。这两家服务商可能按其各自的隐私政策记录访问日志（如 IP 地址、User-Agent）。本站不主动收集、也不分析这些数据，对它们的记录行为既无法访问也无法控制。',
    'legal.privacy.p4': '如果你在首页的问答框里提问：常见问题由站内预先撰写的答案直接回答，问题内容不会离开你的浏览器。仅当问题不在这些答案范围内时，内容才会发送到本站的服务端接口，并转发至模型服务聚合平台 OpenRouter 用于生成回答。本站不保存提问内容；OpenRouter 及其上游模型提供方可能按其各自政策记录请求。如果你不希望如此，请不要使用该输入框 —— 站内其它内容均不需要联网。',
    'legal.privacy.p5': '如果你通过邮件联系我们，我们只会用你的邮箱地址回复该问题，不会用于其它用途，也不会提供给第三方。',
    'legal.disclaimer.t': '免责声明',
    'legal.disclaimer.p1': '站内介绍的产品与功能处于开发中状态，描述可能随时调整，不构成任何承诺或要约。',
    'legal.disclaimer.p2': '站内的 Oing 名称与图形归本站所有。本站与任何第三方公司、产品或商标均无关联，也未获其授权或认可。',
    'legal.disclaimer.p3': '本站对外部链接指向的内容不承担责任。',
    'legal.contact.t': '联系我们',
    'legal.contact.p': '如有疑问，请邮件联系。',
    'legal.back': '返回首页',

    'nf.meta.title': '页面不存在 — Oing',
    'nf.title': '页面不存在',
    'nf.sub': '该地址不存在，或内容已被移动。',
    'nf.home': '返回首页',
  },

  en: {
    'meta.title': 'Oing — Closer to intelligence',
    'meta.description': 'Oing is a general-purpose tool that is still in development. This site is its official homepage, covering progress.',

    'a11y.skip': 'Skip to main content',

    'nav.projects': 'Projects',
    'nav.news': 'Updates',
    'nav.legal': 'Legal',
    'header.cta': 'GitHub',

    'announce.text': 'The product is in development and not yet available.',
    'announce.more': 'View updates',

    'hero.slogan': 'Closer to intelligence',
    'composer.label': 'Enter your question',
    'composer.placeholder': 'Type a question',
    'ask.note': 'This box only answers confirmed questions about this site. Answers are hand-written; when there is no answer, it says so.',
    'ask.noteRemote': 'Common questions use hand-written answers. Anything not covered goes to a language model; on questions about this site it is restricted to the confirmed facts here.',
    'ask.thinking': 'Looking this up — may take a few seconds…',
    'ask.remoteSrc': 'Generated by a language model; it may be inaccurate.',
    'ask.quotaNote': 'The model service\u2019s free quota for today is used up, so this is the built-in fallback answer.',
    'ask.you': 'Question',
    'ask.continue': 'Keep asking →',
    'ask.foot': 'Hand-written answer. If anything is inaccurate, please email us:',
    'chat.meta.title': 'Site Q&A — Oing',
    'chat.title': 'Site Q&A',
    'chat.note': 'Common questions use hand-written answers; anything else goes to a language model. Answers may be inaccurate — for anything important, confirm by email.',
    'chat.empty': 'Pick a question below, or type your own:',
    'ask.chipsLabel': 'Common questions',
    'ask.chip1': 'What is Oing?',
    'ask.chip2': 'When will it be available?',
    'ask.chip3': 'How can I contact you?',
    'ask.chip4': 'What is your relationship to DeepSeek?',
    'ask.chip5': 'Will it be paid?',
    'hero.action.github': 'Follow on GitHub',
    'hero.action.news': 'View progress',

    'proj.eyebrow': 'Projects',
    'proj.title': 'Projects',
    'proj.note': 'Two other sites by the same maintainer, both usable today.',
    'proj.astras.tag': 'Directory',
    'proj.astras.d': 'A personally curated directory of tools. Every entry is tested by hand and carries a short review and a test date; nothing is scraped, and the whole list is rechecked quarterly.',
    'proj.minichat.tag': 'Chat',
    'proj.minichat.d': 'A lightweight real-time chat built on plain HTML and Supabase, with no framework. Real-time messages, file sharing and image compression, installable as an offline-capable PWA. Open source under MIT.',

    'news.eyebrow': 'Updates',
    'news.title': 'Updates',
    'news.1.t': 'Website is live',
    'news.1.d': 'Homepage and legal pages are ready.',
    'news.2.t': 'Product in development',
    'news.2.d': 'Chat and the Open Platform are not open yet. Further progress will be posted here.',
    'news.3.t': 'Homepage updated',
    'news.3.d': 'The not-yet-settled capability list was removed and replaced with two other sites by the same maintainer.',

    'footer.slogan': 'Closer to intelligence.',
    'footer.col2': 'Legal',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.disclaimer': 'Disclaimer',
    'footer.col3': 'About',
    'footer.contact': 'Contact',
    'footer.github': 'GitHub',
    'footer.rights': 'All rights reserved',

    'msg.notConfigured': 'This entry is not configured and is unavailable.',
    'msg.sent': 'Chat is still in development and unavailable.',
    'msg.emailCopied': 'Email copied to clipboard.',
    'msg.theme.light': 'Switched to light',
    'msg.theme.dark': 'Switched to dark',

    'legal.meta.title': 'Legal — Oing',
    'legal.title': 'Legal',
    'legal.updated': 'Last updated: 2026-10-02',
    'legal.terms.t': 'Terms of Service',
    'legal.terms.p1': 'This site is the official showcase page for Oing. It has no account system and no paid features.',
    'legal.terms.p2': 'Intellectual property in the text, graphics and code on this site is owned by the site or used under licence. You may browse it and share links freely; please contact us before republishing a page in full.',
    'legal.terms.p3': 'The site may change, be suspended or be shut down at any time without notice. Continued browsing constitutes acceptance of these terms.',
    'legal.privacy.t': 'Privacy Policy',
    'legal.privacy.p1': 'This site collects no personal data: no accounts, no form submissions, no tracking, and no third-party analytics or advertising scripts.',
    'legal.privacy.p2': 'The site stores two preferences locally in your browser — light/dark theme and interface language. They stay on your own device and are not sent to any server; clearing your browser data removes them.',
    'legal.privacy.p3': 'This site is hosted on GitHub Pages, with DNS provided by Cloudflare. Those providers may log access data (such as IP address and User-Agent) under their own privacy policies. This site neither collects nor analyses that data, and has no access to or control over those logs.',
    'legal.privacy.p4': 'If you use the question box on the homepage: common questions are answered by replies written into this site, and your text never leaves the browser. Only when a question is not covered is it sent to this site’s server endpoint and forwarded to OpenRouter, a model service aggregator, in order to generate a reply. We do not store your question; OpenRouter and its upstream model providers may log requests under their own policies. If you would rather not have that happen, simply do not use that input box — nothing else on this site requires a network call.',
    'legal.privacy.p5': 'If you email us, your address will only be used to reply to that enquiry. It will not be used for anything else and will not be shared.',
    'legal.disclaimer.t': 'Disclaimer',
    'legal.disclaimer.p1': 'The products and features described here are in development. Descriptions may change at any time and do not constitute a commitment or an offer.',
    'legal.disclaimer.p2': 'The Oing name and graphics are the property of this site. This site is not affiliated with, endorsed by, or authorised by any third-party company, product or trademark.',
    'legal.disclaimer.p3': 'We are not responsible for the content of external sites we link to.',
    'legal.contact.t': 'Contact',
    'legal.contact.p': 'For any question, please email us.',
    'legal.back': 'Back to home',

    'nf.meta.title': 'Page not found — Oing',
    'nf.title': 'Page not found',
    'nf.sub': 'This address does not exist, or the content has been moved.',
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

  // 页面可以用 <title data-i18n="..."> 声明自己的标题（上面的循环已经设置过）。
  // 没有声明的才用站点默认标题 —— 否则法务页、404 页在浏览器里显示的会是首页标题。
  if (!document.querySelector('title[data-i18n]')) {
    var title = table['meta.title'] || fallback['meta.title'];
    if (title) document.title = title;
  }
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

