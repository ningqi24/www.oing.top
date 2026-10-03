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
    'meta.description': 'Oing 是一个通用智能助手，目前仍在开发中。本站为其官方页面，用于说明规划中的能力与开发进展。',

    'a11y.skip': '跳到主要内容',

    'nav.capability': '能力',
    'nav.news': '动态',
    'nav.legal': '法务',
    'header.cta': 'GitHub',

    'announce.text': '产品开发中，尚未开放使用。',
    'announce.more': '查看动态',

    'hero.slogan': '让智能更近一步',
    'composer.label': '输入你的问题',
    'composer.placeholder': '输入问题',
    'composer.attach': '添加附件',
    'composer.reason': '深度思考',
    'composer.search': '联网搜索',
    'ask.note': '本框仅回答关于本站、已确认的问题。答案均为手写；无法回答时会直接说明。',
    'ask.noteRemote': '常见问题由手写答案回答；未覆盖的问题交由语言模型处理，该模型被限制为只能依据站内已确认的事实作答。',
    'ask.thinking': '查询中，可能需要数秒…',
    'ask.remoteSrc': '本条由语言模型基于站内已确认事实生成。',
    'ask.quotaNote': '模型服务当天的免费额度已用完，所以这里给的是站内兜底回答。',
    'ask.you': '提问',
    'ask.foot': '以上为手写答案。如有出入，欢迎邮件指出：',
    'ask.chipsLabel': '常见问题',
    'ask.chip1': 'Oing 是什么？',
    'ask.chip2': '何时可以使用？',
    'ask.chip3': '如何联系你们？',
    'ask.chip4': '与 DeepSeek 是什么关系？',
    'ask.chip5': '是否收费？',
    'hero.action.github': '在 GitHub 上关注',
    'hero.action.news': '查看进展',

    'cap.eyebrow': 'Capabilities',
    'cap.title': '能力',
    'cap.note': '以下能力均在开发中，尚未开放使用。',
    'cap.1.t': '深度推理',
    'cap.1.d': '复杂问题上先展开推理再给出结论，推理过程可见。',
    'cap.2.t': '联网搜索',
    'cap.2.d': '需要最新信息时自动检索，并附来源。',
    'cap.3.t': '超长上下文',
    'cap.3.d': '长文档可一次读入，无需分段提交。',
    'cap.4.t': '代码与工具',
    'cap.4.d': '可读取完整代码仓库，并调用函数与外部工具。',
    'cap.5.t': '多模态理解',
    'cap.5.d': '可读取图片、表格与扫描件。',
    'cap.6.t': '可控与安全',
    'cap.6.d': '数据用途与权限边界明确，授权可随时撤回。',

    'news.eyebrow': 'Updates',
    'news.title': '动态',
    'news.1.t': '官网已上线',
    'news.1.d': '首页、能力说明与法务页面已就绪。',
    'news.2.t': '产品开发中',
    'news.2.d': '对话与开放平台尚未开放，后续进展将在此更新。',

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
    'msg.attached': '附件功能仍在开发中，暂不可用。',
    'msg.emailCopied': '邮箱已复制到剪贴板。',
    'msg.theme.light': '已切换为浅色',
    'msg.theme.dark': '已切换为深色',

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

    'nf.title': '页面不存在',
    'nf.sub': '该地址不存在，或内容已被移动。',
    'nf.home': '返回首页',
  },

  en: {
    'meta.title': 'Oing — Closer to intelligence',
    'meta.description': 'Oing is a general-purpose AI assistant that is still in development. This site is its official homepage, covering the planned capabilities and progress.',

    'a11y.skip': 'Skip to main content',

    'nav.capability': 'Capabilities',
    'nav.news': 'Updates',
    'nav.legal': 'Legal',
    'header.cta': 'GitHub',

    'announce.text': 'The product is in development and not yet available.',
    'announce.more': 'View updates',

    'hero.slogan': 'Closer to intelligence',
    'composer.label': 'Enter your question',
    'composer.placeholder': 'Type a question',
    'composer.attach': 'Add attachment',
    'composer.reason': 'Deep reasoning',
    'composer.search': 'Web search',
    'ask.note': 'This box only answers confirmed questions about this site. Answers are hand-written; when there is no answer, it says so.',
    'ask.noteRemote': 'Common questions use hand-written answers. Anything not covered is passed to a language model, which is restricted to the confirmed facts on this site.',
    'ask.thinking': 'Looking this up — may take a few seconds…',
    'ask.remoteSrc': 'Generated by a language model from the confirmed facts on this site.',
    'ask.quotaNote': 'The model service\u2019s free quota for today is used up, so this is the built-in fallback answer.',
    'ask.you': 'Question',
    'ask.foot': 'Hand-written answer. If anything is inaccurate, please email us:',
    'ask.chipsLabel': 'Common questions',
    'ask.chip1': 'What is Oing?',
    'ask.chip2': 'When will it be available?',
    'ask.chip3': 'How can I contact you?',
    'ask.chip4': 'What is your relationship to DeepSeek?',
    'ask.chip5': 'Will it be paid?',
    'hero.action.github': 'Follow on GitHub',
    'hero.action.news': 'View progress',

    'cap.eyebrow': 'Capabilities',
    'cap.title': 'Capabilities',
    'cap.note': 'All of the following are in development and none are available yet.',
    'cap.1.t': 'Deep reasoning',
    'cap.1.d': 'Expands reasoning before giving a conclusion on complex questions; the reasoning is visible.',
    'cap.2.t': 'Web search',
    'cap.2.d': 'Searches automatically when current information is needed, and cites sources.',
    'cap.3.t': 'Long context',
    'cap.3.d': 'Reads long documents in one pass; no need to submit them in parts.',
    'cap.4.t': 'Code & tools',
    'cap.4.d': 'Reads a complete code repository and calls functions and external tools.',
    'cap.5.t': 'Multimodal input',
    'cap.5.d': 'Reads images, tables and scanned documents.',
    'cap.6.t': 'Control & safety',
    'cap.6.d': 'Data use and permission boundaries are explicit; authorisation can be withdrawn at any time.',

    'news.eyebrow': 'Updates',
    'news.title': 'Updates',
    'news.1.t': 'Website is live',
    'news.1.d': 'Homepage, capabilities overview and legal pages are ready.',
    'news.2.t': 'Product in development',
    'news.2.d': 'Chat and the Open Platform are not open yet. Further progress will be posted here.',

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
    'msg.attached': 'File upload is still in development and unavailable.',
    'msg.emailCopied': 'Email copied to clipboard.',
    'msg.theme.light': 'Switched to light',
    'msg.theme.dark': 'Switched to dark',

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

