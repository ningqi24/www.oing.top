/**
 * 站点问答的事实库。
 *
 * ⚠️ 这里每一条都是**手写、可核对**的，不是模型生成的。
 * 助手只会在这些条目里检索，检索不到就明说不知道 —— 结构上不可能编造。
 *
 * keys 是匹配用的关键词/短语：中英混排都可以，运行时会被 normalize 成
 * 「只保留汉字、字母、数字、小写」。尽量把用户可能用的说法都列上。
 *
 * 加新条目时记得同时写 zh 和 en，并跑 npm run check 与 npm run test:qa。
 */
window.OING_QA = [
  {
    id: 'what',
    keys: ['是什么', '做什么的', '干什么的', '什么东西', '这是啥', '介绍一下', '什么产品', '什么东东',
           'what is', 'what does', 'about this', 'introduce'],
    zh: 'Oing 是一个还在开发中的通用智能助手。本站是它的官网，目前只用来介绍规划中的能力 —— 产品本身还不能使用。',
    en: 'Oing is a general-purpose AI assistant that is still in development. This site is its homepage; right now it only describes what is planned — the product itself is not usable yet.',
  },
  {
    id: 'when',
    keys: ['什么时候能用', '什么时候上线', '何时上线', '多久能用', '上线时间', '时间表', '什么时候发布',
           '什么时候可以', 'when can i use', 'when will', 'when is it', 'when do you',
           'when', 'release date', 'roadmap', 'timeline', 'launch'],
    zh: '还没有确定的时间表，也不会在能兑现之前先承诺日期。一旦确定，会发在首页的「动态」那一栏。',
    en: 'There is no schedule yet, and no dates will be promised before they can be kept. Once there is one, it will be posted under Updates on the homepage.',
  },
  {
    id: 'usable',
    keys: ['现在能用吗', '能用吗', '可以试用吗', '怎么试用', '有试用吗', '怎么使用', '怎么用', '入口在哪',
           'try it', 'can i use', 'how to use', 'demo'],
    zh: '不能。目前站上没有任何可以实际使用的功能，这个输入框也只回答关于站点本身的问题。',
    en: 'No. Nothing on this site is usable yet — this input box only answers questions about the site itself.',
  },
  {
    id: 'contact',
    keys: ['怎么联系', '联系方式', '联系你们', '邮箱', '客服', '找你们', '有问题找谁',
           'contact', 'email', 'reach you', 'support'],
    zh: '发邮件到 official@astras.cc。这是目前唯一的联系方式。',
    en: 'Email official@astras.cc — that is the only contact channel right now.',
  },
  {
    id: 'price',
    keys: ['会不会收费', '收费', '多少钱', '价格', '免费吗', '要钱吗', '付费', '定价', '怎么买', '订阅',
           'price', 'pricing', 'cost', 'free', 'paid', 'subscription'],
    zh: '还没有定价。在产品可用之前不会有任何收费，也不接受任何形式的预付费。',
    en: 'Pricing has not been decided. Nothing is charged before there is a product, and no prepayment is accepted in any form.',
  },
  {
    id: 'deepseek',
    // 注意：不要放「什么关系」「copy」这类通用词 —— 会把「你们和 OpenAI 什么关系」
    // 「怎么复制你们的代码」这类本来该兜底的提问误吸过来。必须带上明确的指向对象。
    keys: ['deepseek', '深度求索', '和deepseek', '和深度求索', '是不是抄的', '是不是仿的', '抄袭', '模仿',
           'related to deepseek', 'affiliated with deepseek', 'copy of deepseek', 'deepseek clone'],
    zh: '没有任何关系。Oing 与 DeepSeek 无关联、也未获其授权，本站不含它的任何代码、素材或商标。站内设计参考的是同类产品官网的通用做法，内容是原创的。',
    en: 'None. Oing is not affiliated with, endorsed by or authorised by DeepSeek, and this site contains none of their code, assets or trademarks. The design follows conventions common to product homepages; the content is original.',
  },
  {
    id: 'privacy',
    keys: ['数据安全', '隐私', '收集数据', '会不会收集', '隐私政策', '我的数据', '安全吗',
           'privacy', 'data', 'collect', 'tracking', 'gdpr'],
    zh: '本站不收集任何个人数据：没有账号、没有表单、没有埋点，也不接入第三方统计。只在你的浏览器本地存两项偏好（明暗主题、界面语言）。详见「法务」页的隐私政策。',
    en: 'This site collects no personal data: no accounts, no forms, no tracking, no third-party analytics. It stores two preferences locally in your browser (theme, language). See the Privacy Policy under Legal.',
  },
  {
    id: 'why-no-product',
    keys: ['为什么还没有产品', '为什么没产品', '怎么还没', '是不是空壳', '是不是骗人', '是不是假的',
           'why no product', 'not released', 'vaporware', 'scam'],
    zh: '先把话说清楚比先把东西做出来更重要。所以官网先上线，并且只写真实状态 —— 与其放一堆点不动的按钮和编造的发布公告，不如现在这样。',
    en: 'Being clear about where things stand matters more than shipping early. So the site went up first and only states what is actually true — better than a page full of dead buttons and invented announcements.',
  },
  {
    id: 'github',
    keys: ['github', '开源', '源代码', '源码', '代码在哪', '仓库', 'open source', 'source code', 'repo'],
    zh: '站点源码和几个前端小工具在 github.com/ningqi24。产品本身还没有开源计划。',
    en: 'The site source and a few small front-end utilities are at github.com/ningqi24. There is no open-source plan for the product itself yet.',
  },
  {
    id: 'capability',
    keys: ['会有什么能力', '有什么功能', '支持什么', '能做什么', '功能', '能力', '特性',
           'features', 'capabilities', 'what can it do', 'supported'],
    zh: '规划中的能力写在首页「能力」那一节：深度推理、联网搜索、超长上下文、代码与工具、多模态理解、可控与安全。请注意这些全都还在开发中，现在一个都不能用。',
    en: 'The planned capabilities are listed under Capabilities on the homepage: deep reasoning, web search, long context, code & tools, multimodal understanding, control & safety. All of them are still in development and none of them work yet.',
  },
  {
    id: 'language',
    keys: ['支持中文吗', '中文', '多语言', '语言支持', 'english', 'chinese', 'multilingual'],
    zh: '要等产品出来才知道。这个网站本身是中英双语的。',
    en: 'Too early to say — the site itself is bilingual (Chinese and English).',
  },
  {
    id: 'who-made-it',
    keys: ['谁做的', '团队', '公司', '个人做的', '作者', '开发者是谁', '哪个公司',
           'who made', 'team', 'company', 'who is behind'],
    zh: '还没到可以介绍团队的时候。有进展会发在首页的「动态」那一栏。',
    en: 'It is too early to introduce a team. Updates will be posted under Updates on the homepage.',
  },
  {
    id: 'is-this-ai',
    keys: ['你是ai吗', '你是不是ai', '你是机器人吗', '你是模型吗', '你是人工吗', '你是不是真人',
           'are you an ai', 'are you a bot', 'is this a model', 'chatgpt', 'llm'],
    zh: '不是。这里的回答是事先手写的，按关键词匹配出来的，没有任何模型参与 —— 所以它只会说已经确认过的内容，不会编。',
    en: 'No. These answers are hand-written and matched by keyword. No model is involved, so it can only repeat what has already been confirmed — it cannot make things up.',
  },
  {
    id: 'tech',
    keys: ['官网怎么做的', '用什么做的', '技术栈', '什么框架', '怎么实现',
           'tech stack', 'built with', 'framework', 'how is this site'],
    zh: '纯静态：手写 HTML / CSS / JS，零依赖、无构建步骤，托管在 GitHub Pages，域名解析走 Cloudflare。页头的悬浮玻璃胶囊和首屏流场动画都是自己实现的。',
    en: 'Plain static: hand-written HTML / CSS / JS, zero dependencies, no build step, hosted on GitHub Pages with DNS on Cloudflare. The floating glass pill header and the hero flow-field animation are both custom implementations.',
  },
  {
    id: 'email-domain',
    keys: ['astras', '为什么邮箱不是', '域名不一样', 'astras.cc是什么',
           'why is the email', 'different domain'],
    zh: '官方联系邮箱用的是 official@astras.cc，和本站域名不同，请认准这个地址。除此之外没有别的联系方式。',
    en: 'The official contact address is official@astras.cc, on a different domain from this site — please check that it is exactly this one. There is no other contact channel.',
  },
];

/** 检索不到时的回答。宁可明说不知道，也不猜。 */
window.OING_QA_FALLBACK = {
  zh: '这个问题我还答不上来。这里只回答已经确认过的站点信息，其它的一律不猜。你可以发邮件到 official@astras.cc 直接问。',
  en: 'I cannot answer that one. This assistant only answers confirmed facts about the site and will not guess. Email official@astras.cc and ask directly.',
};
