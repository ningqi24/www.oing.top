/* 由 scripts/build-facts.mjs 从 js/qa.js 生成，请勿手改。 */
/* eslint-disable */

export const FACTS = [
  { id: "what", zh: "Oing 是一个还在开发中的通用智能助手。本站是它的官网，目前只用来介绍规划中的能力 —— 产品本身还不能使用。", en: "Oing is a general-purpose AI assistant that is still in development. This site is its homepage; right now it only describes what is planned — the product itself is not usable yet." },
  { id: "when", zh: "还没有确定的时间表，也不会在能兑现之前先承诺日期。一旦确定，会发在首页的「动态」那一栏。", en: "There is no schedule yet, and no dates will be promised before they can be kept. Once there is one, it will be posted under Updates on the homepage." },
  { id: "usable", zh: "不能。目前站上没有任何可以实际使用的功能，这个输入框也只回答关于站点本身的问题。", en: "No. Nothing on this site is usable yet — this input box only answers questions about the site itself." },
  { id: "contact", zh: "发邮件到 official@astras.cc。这是目前唯一的联系方式。", en: "Email official@astras.cc — that is the only contact channel right now." },
  { id: "price", zh: "还没有定价。在产品可用之前不会有任何收费，也不接受任何形式的预付费。", en: "Pricing has not been decided. Nothing is charged before there is a product, and no prepayment is accepted in any form." },
  { id: "deepseek", zh: "没有任何关系。Oing 与 DeepSeek 无关联、也未获其授权，本站不含它的任何代码、素材或商标。站内设计参考的是同类产品官网的通用做法，内容是原创的。", en: "None. Oing is not affiliated with, endorsed by or authorised by DeepSeek, and this site contains none of their code, assets or trademarks. The design follows conventions common to product homepages; the content is original." },
  { id: "privacy", zh: "本站不收集任何个人数据：没有账号、没有表单、没有埋点，也不接入第三方统计。只在你的浏览器本地存两项偏好（明暗主题、界面语言）。详见「法务」页的隐私政策。", en: "This site collects no personal data: no accounts, no forms, no tracking, no third-party analytics. It stores two preferences locally in your browser (theme, language). See the Privacy Policy under Legal." },
  { id: "why-no-product", zh: "先把话说清楚比先把东西做出来更重要。所以官网先上线，并且只写真实状态 —— 与其放一堆点不动的按钮和编造的发布公告，不如现在这样。", en: "Being clear about where things stand matters more than shipping early. So the site went up first and only states what is actually true — better than a page full of dead buttons and invented announcements." },
  { id: "github", zh: "站点源码和几个前端小工具在 github.com/ningqi24。产品本身还没有开源计划。", en: "The site source and a few small front-end utilities are at github.com/ningqi24. There is no open-source plan for the product itself yet." },
  { id: "capability", zh: "规划中的能力写在首页「能力」那一节：深度推理、联网搜索、超长上下文、代码与工具、多模态理解、可控与安全。请注意这些全都还在开发中，现在一个都不能用。", en: "The planned capabilities are listed under Capabilities on the homepage: deep reasoning, web search, long context, code & tools, multimodal understanding, control & safety. All of them are still in development and none of them work yet." },
  { id: "language", zh: "要等产品出来才知道。这个网站本身是中英双语的。", en: "Too early to say — the site itself is bilingual (Chinese and English)." },
  { id: "who-made-it", zh: "还没到可以介绍团队的时候。有进展会发在首页的「动态」那一栏。", en: "It is too early to introduce a team. Updates will be posted under Updates on the homepage." },
  { id: "is-this-ai", zh: "常见问题是事先手写的答案按关键词匹配回答的。没写在里面的问题会交给一个语言模型，但它被严格限制为只能依据站内已确认的事实作答，不允许猜测。", en: "Common questions here are answered by hand-written replies matched by keyword. Anything not covered is passed to a language model, but it is strictly limited to the confirmed facts listed on this site and is not allowed to guess." },
  { id: "tech", zh: "纯静态：手写 HTML / CSS / JS，零依赖、无构建步骤，托管在 GitHub Pages，域名解析走 Cloudflare。页头的悬浮玻璃胶囊和首屏流场动画都是自己实现的。", en: "Plain static: hand-written HTML / CSS / JS, zero dependencies, no build step, hosted on GitHub Pages with DNS on Cloudflare. The floating glass pill header and the hero flow-field animation are both custom implementations." },
  { id: "email-domain", zh: "官方联系邮箱用的是 official@astras.cc，和本站域名不同，请认准这个地址。除此之外没有别的联系方式。", en: "The official contact address is official@astras.cc, on a different domain from this site — please check that it is exactly this one. There is no other contact channel." },
];

export const FALLBACK = {
  zh: "这个问题我还答不上来。这里只回答已经确认过的站点信息，其它的一律不猜。你可以发邮件到 official@astras.cc 直接问。",
  en: "I cannot answer that one. This assistant only answers confirmed facts about the site and will not guess. Email official@astras.cc and ask directly.",
};
