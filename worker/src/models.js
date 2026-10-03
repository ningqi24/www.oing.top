/**
 * 免费模型的挑选逻辑 —— 纯函数，可单独测试（见 scripts/test-worker.mjs）。
 *
 * OpenRouter 的 /api/v1/models 是公开接口，不需要 key。注意 pricing 里的值是
 * **字符串**（"0"），所以必须 Number() 之后再比较，直接用 === 0 会全部判错。
 */

/** 是否免费：prompt 与 completion 都是 0 */
export function isFree(model) {
  if (!model || !model.pricing) return false;
  return Number(model.pricing.prompt) === 0 && Number(model.pricing.completion) === 0;
}

/**
 * 是否可能用于对话。
 *
 * 只看价格是不够的 —— 实测发现零定价模型里混着别的东西：
 *   · google/lyria-*（输出 text+audio，是音乐生成模型）
 *   · nvidia/nemotron-3.5-content-safety（内容审核分类器）
 * 判据是 architecture.output_modalities **恰好只有 text**。
 */
export function isTextOutput(model) {
  const out = (model && model.architecture && model.architecture.output_modalities) || [];
  return out.length === 1 && out[0] === 'text';
}

/** 免费 + 输出纯文本，才算候选 */
export function isChatCandidate(model) {
  return isFree(model) && isTextOutput(model);
}

/**
 * 排序免费模型：优先名单在前（按名单顺序），其余按上下文长度从大到小。
 * 为什么不是"全自动挑上下文最大的"：上下文最长 ≠ 中文最好、≠ 最稳。
 * 名单是人工确认过可用的，自动挑选只作为名单耗尽后的兜底。
 */
export function rankFreeModels(models, preferred) {
  const list = Array.isArray(models) ? models : [];
  const rest = new Map();
  for (const m of list) if (isChatCandidate(m) && m.id) rest.set(m.id, m);

  const ordered = [];
  for (const id of preferred || []) {
    if (rest.has(id)) { ordered.push(rest.get(id)); rest.delete(id); }
  }
  const fallback = [...rest.values()].sort((a, b) => (b.context_length || 0) - (a.context_length || 0));
  return ordered.concat(fallback);
}
