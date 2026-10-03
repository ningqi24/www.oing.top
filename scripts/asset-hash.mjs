/**
 * 资源指纹：把 css/ 与 js/ 下所有文件的内容算成一个短哈希。
 *
 * 用途：check.mjs 用它在「资源内容变了、但 ?v= 版本号没跟着改」时直接失败。
 * 为什么需要：静态站的 ?v= 查询参数是唯一的缓存穿透手段。改了 js 却忘了改版本号，
 * 访客（包括自己）看到的还是旧内容，现象是「明明推上去了却没变化」——极难判断。
 * 这个坑本项目已经踩过两次。
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function assetFiles(root) {
  const out = [];
  for (const dir of ['css', 'js']) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs).sort()) {
      if (/\.(css|js)$/.test(f)) out.push(dir + '/' + f);
    }
  }
  return out;
}

export function computeAssetHash(root) {
  const h = crypto.createHash('sha256');
  for (const rel of assetFiles(root)) {
    h.update(rel);
    h.update(fs.readFileSync(path.join(root, rel)));
  }
  return h.digest('hex').slice(0, 12);
}
