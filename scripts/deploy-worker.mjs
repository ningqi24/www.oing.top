/**
 * 部署 Worker：node scripts/deploy-worker.mjs   （或 npm run deploy:worker）
 *
 * 为什么要包一层：改了 js/qa.js 之后必须重新生成 worker/src/facts.js 并重新部署，
 * 否则线上 Worker 里还是旧事实 —— 表现是「页面文案变了，但模型答的还是旧说法」。
 * 这个坑踩过两次（都是改完 qa.js 只跑了 build:facts 没部署）。
 * 这个脚本把「生成事实库 + 部署」绑在一起做。
 *
 * 部署完请跑 npm run test:live —— 它会比对指纹，确认线上 Worker 真的是最新的。
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKER = path.join(ROOT, 'worker');

console.log('— 1/2 重新生成事实库 —');
const build = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build-facts.mjs')], {
  stdio: 'inherit',
});
if (build.status !== 0) process.exit(build.status || 1);

console.log('\n— 2/2 部署 Worker —');
const deploy = spawnSync('npx --no-install wrangler deploy', {
  cwd: WORKER, stdio: 'inherit', shell: true,
});
if (deploy.status !== 0) process.exit(deploy.status || 1);

console.log('\n完成。接着跑 npm run test:live 确认线上 Worker 已是最新。');
