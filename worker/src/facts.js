/* 由 scripts/build-facts.mjs 从 js/qa.js 生成，请勿手改。 */
/* eslint-disable */

export const FACTS = [
  { id: "what", zh: "Oing 是一个仍在开发中的通用智能助手。本站为其官方页面，目前仅用于说明规划中的能力；产品本身尚不可用。", en: "Oing is a general-purpose AI assistant that is still in development. This site is its official homepage and currently only describes the planned capabilities; the product itself is not yet usable." },
  { id: "when", zh: "目前没有确定的时间表，也不会在能够兑现之前给出日期。一旦确定，将发布在首页「动态」栏。", en: "There is no confirmed schedule yet, and no dates will be given before they can be met. Once there is one, it will be posted under Updates on the homepage." },
  { id: "usable", zh: "不能。目前站内没有任何可实际使用的功能；该输入框仅回答关于本站的问题。", en: "No. Nothing on this site is usable yet; this input box only answers questions about the site itself." },
  { id: "contact", zh: "请发送邮件至 official@astras.cc，这是目前唯一的联系方式。", en: "Email official@astras.cc — this is currently the only contact channel." },
  { id: "price", zh: "尚未定价。产品可用之前不会产生任何费用，也不接受任何形式的预付费。", en: "Pricing has not been set. Nothing will be charged before the product is available, and no prepayment is accepted in any form." },
  { id: "deepseek", zh: "没有任何关系。Oing 与 DeepSeek 无关联，也未获其授权；本站不含其任何代码、素材或商标。站内内容为原创，设计仅参考同类产品官网的通用做法。", en: "None. Oing is not affiliated with, endorsed by or authorised by DeepSeek, and this site contains none of their code, assets or trademarks. All content here is original; the design only follows conventions common to product homepages." },
  { id: "privacy", zh: "本站不收集个人数据：无账号、无表单、无埋点，也不接入第三方统计。仅在浏览器本地存储两项偏好（明暗主题、界面语言）。详见「法务」页的隐私政策。", en: "This site collects no personal data: no accounts, no forms, no tracking, no third-party analytics. It stores two preferences locally in your browser (theme and interface language). See the Privacy Policy under Legal." },
  { id: "why-no-product", zh: "本站只陈述真实状态。与其展示无法点击的入口和虚构的发布计划，不如明确说明当前进展。", en: "This site states only what is actually true. Rather than showing non-functional entry points and an invented release plan, it describes the current state plainly." },
  { id: "github", zh: "站点源码与若干前端工具位于 github.com/ningqi24。产品本身暂无开源计划。", en: "The site source and several front-end tools are at github.com/ningqi24. There is no open-source plan for the product itself." },
  { id: "capability", zh: "产品仍在开发中，功能范围尚未确定，因此本站不列出能力清单。有确定内容后会发布在首页「动态」栏。", en: "The product is still in development and its feature set is not fixed, so no capability list is published here. Confirmed details will be posted under Updates on the homepage." },
  { id: "language", zh: "需待产品发布后才能确定。本站本身为中文与英文双语。", en: "That cannot be determined until the product is released. This site itself is bilingual (Chinese and English)." },
  { id: "who-made-it", zh: "目前暂不介绍团队信息。相关进展将发布在首页「动态」栏。", en: "No team information is available at this stage. Updates will be posted under Updates on the homepage." },
  { id: "is-this-ai", zh: "常见问题由人工撰写的答案按关键词匹配回答；未覆盖的问题会交由语言模型处理，该模型被限制为只能依据站内已确认的事实作答，不允许推测。", en: "Common questions are answered by hand-written replies matched by keyword. Anything not covered is passed to a language model, which is restricted to the confirmed facts on this site and is not allowed to speculate." },
  { id: "tech", zh: "前端为纯静态：手写 HTML / CSS / JS，无依赖、无构建步骤，托管于 GitHub Pages，域名解析使用 Cloudflare。问答接口由 Cloudflare Worker 提供，仅在本地答案无法覆盖时调用。页头悬浮导航与首屏流场动画均为自行实现。", en: "The front end is purely static: hand-written HTML / CSS / JS, no dependencies, no build step, hosted on GitHub Pages with DNS on Cloudflare. The question-answering endpoint runs on a Cloudflare Worker and is only called when the local answers do not cover a question. The floating header and the hero flow-field animation are both custom implementations." },
  { id: "email-domain", zh: "官方联系邮箱为 official@astras.cc，与本站域名不同，请认准该地址。除此之外没有其它联系方式。", en: "The official contact address is official@astras.cc, on a different domain from this site — please check that it is exactly this one. There is no other contact channel." },
];

export const FALLBACK = {
  zh: "无法回答该问题。此处只回答已确认的站点信息，其余不作推测。可发送邮件至 official@astras.cc 询问。",
  en: "This question cannot be answered here. Only confirmed information about the site is provided, and nothing else is inferred. Please email official@astras.cc.",
};

/** 事实库指纹 —— worker 在 /api/health 里报出来，供线上验收比对 */
export const FACTS_HASH = "02255f9e";
