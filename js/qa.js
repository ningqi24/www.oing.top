/**
 * 站点问答的事实库。
 *
 * ⚠️ 这里每一条都是**手写、可核对**的，不是模型生成的。
 * 助手只会在这些条目里检索，检索不到就明说不知道 —— 结构上不可能编造。
 *
 * keys 是匹配用的关键词/短语：中英混排都可以，运行时会被 normalize 成
 * 「只保留汉字、字母、数字、小写」。尽量把用户可能用的说法都列上。
 *
 * 文案风格：与 js/i18n.js 一致，技术文档腔（具体、不拟人、去口语）。
 *
 * 加新条目时记得同时写 zh 和 en，并跑 npm run check / test:qa / build:facts。
 */
window.OING_QA = [
  {
    id: 'what',
    keys: ['是什么', '做什么的', '干什么的', '什么东西', '这是啥', '介绍一下', '什么产品', '什么东东',
           'what is', 'what does', 'about this', 'introduce'],
    zh: 'Oing 是一个仍在开发中的通用工具。本站为其官方页面，目前仅用于说明开发进展；产品本身尚不可用。',
    en: 'Oing is a general-purpose tool that is still in development. This site is its official homepage and currently only describes progress; the product itself is not yet usable.',
  },
  {
    id: 'when',
    keys: ['什么时候能用', '什么时候上线', '何时上线', '何时可以', '何时可使用', '多久能用', '上线时间',
           '时间表', '什么时候发布', '什么时候可以',
           'when can i use', 'when will', 'when is it', 'when do you',
           'when', 'release date', 'roadmap', 'timeline', 'launch'],
    zh: '目前没有确定的时间表，也不会在能够兑现之前给出日期。一旦确定，将发布在首页「动态」栏。',
    en: 'There is no confirmed schedule yet, and no dates will be given before they can be met. Once there is one, it will be posted under Updates on the homepage.',
  },
  {
    id: 'usable',
    keys: ['现在能用吗', '能用吗', '可以试用吗', '怎么试用', '有试用吗', '怎么使用', '怎么用', '入口在哪',
           'try it', 'can i use', 'how to use', 'demo'],
    zh: '不能。目前站内没有任何可实际使用的功能；该输入框仅回答关于本站的问题。',
    en: 'No. Nothing on this site is usable yet; this input box only answers questions about the site itself.',
  },
  {
    id: 'contact',
    keys: ['怎么联系', '如何联系', '联系方式', '联系你们', '邮箱', '客服', '找你们', '有问题找谁',
           'contact', 'email', 'reach you', 'support'],
    zh: '请发送邮件至 official@astras.cc，这是目前唯一的联系方式。',
    en: 'Email official@astras.cc — this is currently the only contact channel.',
  },
  {
    id: 'price',
    keys: ['会不会收费', '收费', '多少钱', '价格', '免费吗', '要钱吗', '付费', '定价', '怎么买', '订阅',
           'price', 'pricing', 'cost', 'free', 'paid', 'subscription'],
    zh: '尚未定价。产品可用之前不会产生任何费用，也不接受任何形式的预付费。',
    en: 'Pricing has not been set. Nothing will be charged before the product is available, and no prepayment is accepted in any form.',
  },
  {
    id: 'deepseek',
    // 注意：不要放「什么关系」「copy」这类通用词 —— 会把「你们和 OpenAI 什么关系」
    // 「怎么复制你们的代码」这类本来该兜底的提问误吸过来。必须带上明确的指向对象。
    keys: ['deepseek', '深度求索', '和deepseek', '和深度求索', '是不是抄的', '是不是仿的', '抄袭', '模仿',
           'related to deepseek', 'affiliated with deepseek', 'copy of deepseek', 'deepseek clone'],
    zh: '没有任何关系。Oing 与 DeepSeek 无关联，也未获其授权；本站不含其任何代码、素材或商标。站内内容为原创，设计仅参考同类产品官网的通用做法。',
    en: 'None. Oing is not affiliated with, endorsed by or authorised by DeepSeek, and this site contains none of their code, assets or trademarks. All content here is original; the design only follows conventions common to product homepages.',
  },
  {
    id: 'privacy',
    keys: ['数据安全', '隐私', '收集数据', '会不会收集', '隐私政策', '我的数据', '安全吗',
           'privacy', 'data', 'collect', 'tracking', 'gdpr'],
    zh: '本站不收集个人数据：无账号、无表单、无埋点，也不接入第三方统计。仅在浏览器本地存储两项偏好（明暗主题、界面语言）。详见「法务」页的隐私政策。',
    en: 'This site collects no personal data: no accounts, no forms, no tracking, no third-party analytics. It stores two preferences locally in your browser (theme and interface language). See the Privacy Policy under Legal.',
  },
  {
    id: 'why-no-product',
    keys: ['为什么还没有产品', '为什么没产品', '怎么还没', '是不是空壳', '是不是骗人', '是不是假的',
           'why no product', 'not released', 'vaporware', 'scam'],
    zh: '本站只陈述真实状态。与其展示无法点击的入口和虚构的发布计划，不如明确说明当前进展。',
    en: 'This site states only what is actually true. Rather than showing non-functional entry points and an invented release plan, it describes the current state plainly.',
  },
  {
    id: 'github',
    keys: ['github', '开源', '源代码', '源码', '代码在哪', '仓库', 'open source', 'source code', 'repo'],
    zh: '站点源码与若干前端工具位于 github.com/ningqi24。产品本身暂无开源计划。',
    en: 'The site source and several front-end tools are at github.com/ningqi24. There is no open-source plan for the product itself.',
  },
  {
    id: 'capability',
    keys: ['会有什么能力', '有什么功能', '支持什么', '能做什么', '功能', '能力', '特性',
           'features', 'capabilities', 'what can it do', 'supported'],
    zh: '产品仍在开发中，功能范围尚未确定，因此本站不列出能力清单。有确定内容后会发布在首页「动态」栏。',
    en: 'The product is still in development and its feature set is not fixed, so no capability list is published here. Confirmed details will be posted under Updates on the homepage.',
  },
  {
    id: 'language',
    keys: ['支持中文吗', '中文', '多语言', '语言支持', 'english', 'chinese', 'multilingual'],
    zh: '需待产品发布后才能确定。本站本身为中文与英文双语。',
    en: 'That cannot be determined until the product is released. This site itself is bilingual (Chinese and English).',
  },
  {
    id: 'who-made-it',
    keys: ['谁做的', '团队', '公司', '个人做的', '作者', '开发者是谁', '哪个公司',
           'who made', 'team', 'company', 'who is behind'],
    zh: '目前暂不介绍团队信息。相关进展将发布在首页「动态」栏。',
    en: 'No team information is available at this stage. Updates will be posted under Updates on the homepage.',
  },
  {
    id: 'is-this-ai',
    keys: ['你是ai吗', '你是不是ai', '你是机器人吗', '你是模型吗', '你是人工吗', '你是不是真人',
           'are you an ai', 'are you a bot', 'is this a model', 'chatgpt', 'llm'],
    // 这条必须分两版：有没有接远端模型，事实是不一样的。
    // ask.js 按 config.askEndpoint 决定用哪版；worker 用 remote 那版
    // （worker 只在接了远端时才存在）。改这里记得跑 npm run build:facts。
    zh: '不是。此处回答由人工预先撰写并按关键词匹配，没有模型参与，因此只会重复已确认的内容。',
    en: 'No. These answers are written in advance and matched by keyword; no model is involved, so they can only repeat what has been confirmed.',
    remoteZh: '常见问题由人工撰写的答案按关键词匹配回答；未覆盖的问题会交由语言模型处理。问及本站时，它被限制为只能依据站内已确认的事实作答，不允许推测。',
    remoteEn: 'Common questions are answered by hand-written replies matched by keyword. Anything not covered is passed to a language model; on questions about this site it is restricted to the confirmed facts here and is not allowed to speculate.',
  },
  {
    id: 'tech',
    keys: ['官网怎么做的', '用什么做的', '技术栈', '什么框架', '怎么实现',
           'tech stack', 'built with', 'framework', 'how is this site'],
    zh: '前端为纯静态：手写 HTML / CSS / JS，无依赖、无构建步骤，托管于 GitHub Pages，域名解析使用 Cloudflare。问答接口由 Cloudflare Worker 提供，仅在本地答案无法覆盖时调用。页头悬浮导航与首屏流场动画均为自行实现。',
    en: 'The front end is purely static: hand-written HTML / CSS / JS, no dependencies, no build step, hosted on GitHub Pages with DNS on Cloudflare. The question-answering endpoint runs on a Cloudflare Worker and is only called when the local answers do not cover a question. The floating header and the hero flow-field animation are both custom implementations.',
  },
  {
    // 顺序说明：这条必须排在 project-astras 之前。
    // "minichat.astras.cc 是什么" 会同时命中 'minichat' 与 'astrascc' 且分数相同，
    // match() 打平时保留先遍历到的，所以顺序就是判据。test-qa 里有用例锁住。
    id: 'project-minichat',
    // 'minichatastras' 是为了压过 project-astras：问「minichat.astras.cc 是什么」时，
    // 两边都会命中，靠更长的 key 拿分（计分是 0.6 + 0.4 × key长/问题长）。
    keys: ['minichatastras', 'minichat是什么', 'minichat', '实时聊天', '那个聊天', 'the chat project'],
    zh: 'MiniChat（minichat.astras.cc）是同一维护者做的轻量实时聊天。基于原生 HTML 与 Supabase，无框架依赖；支持实时消息、文件分享与图片压缩，可安装为 PWA 离线使用，开源（MIT）。',
    en: 'MiniChat (minichat.astras.cc) is a lightweight real-time chat by the same maintainer, built on plain HTML and Supabase with no framework. Real-time messages, file sharing and image compression; installable as an offline-capable PWA; open source under MIT.',
  },
  {
    id: 'project-astras',
    // 不放裸的 'astrascc' —— 它会把「你们的邮箱为什么是 astras.cc 的」吸过来。
    // 只保留明确指向"这个站点是什么/那个导航站"的说法。
    keys: ['astrascc是什么', 'astrascc是', 'astras是什么', '工具导航', '导航站', 'the directory'],
    zh: 'Astras.CC（www.astras.cc）是同一维护者做的精选工具导航站。每条工具都人工实测、附点评与实测时间，不做机器采集，每季度复核一次。',
    en: 'Astras.CC (www.astras.cc) is a curated tool directory by the same maintainer. Every entry is tested by hand and carries a short review and a test date; nothing is scraped, and the list is rechecked quarterly.',
  },
  {
    id: 'email-domain',
    // 不要放裸的 'astras' —— 会把「Astras.CC 是什么」吸过来。必须带邮箱语境。
    keys: ['为什么邮箱不是', '邮箱域名', '域名不一样', '邮箱为什么是', 'astras是什么邮箱',
           'why is the email', 'different domain'],
    zh: '官方联系邮箱为 official@astras.cc，与本站域名不同，请认准该地址。除此之外没有其它联系方式。',
    en: 'The official contact address is official@astras.cc, on a different domain from this site — please check that it is exactly this one. There is no other contact channel.',
  },
];

/** 检索不到时的回答。宁可明说不知道，也不猜。 */
window.OING_QA_FALLBACK = {
  zh: '无法回答该问题。此处只回答已确认的站点信息，其余不作推测。可发送邮件至 official@astras.cc 询问。',
  en: 'This question cannot be answered here. Only confirmed information about the site is provided, and nothing else is inferred. Please email official@astras.cc.',
};
