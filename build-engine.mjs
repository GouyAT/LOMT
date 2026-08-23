// 引擎打包脚本：p1-demo/src/engine（TS + zod + fast-json-patch）→ p3-demo/engine/bundle.js（IIFE，window.GUIMI_ENGINE）
// 零构建 UI 底座（双击 index.html 即开）需要一份预构建引擎包；引擎改动后在本目录执行：node build-engine.mjs
// esbuild 复用 p1-demo/node_modules（vite 自带），p3-demo 自身零依赖、无需 npm install
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const p1Root = path.resolve(here, '..', 'p1-demo');
const entry = path.resolve(p1Root, 'src', 'engine', 'index.ts');
const outfile = path.resolve(here, 'engine', 'bundle.js');

const require = createRequire(path.join(p1Root, 'package.json'));
const esbuild = require('esbuild');

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: 'iife',
  globalName: 'GUIMI_ENGINE',          // window.GUIMI_ENGINE（经典 <script> 可直接使用）
  platform: 'browser',
  target: 'es2020',
  outfile,
  logLevel: 'info',
  keepNames: true,
});

console.log('✅ 引擎 bundle →', outfile);
