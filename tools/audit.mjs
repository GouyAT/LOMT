/* 诡秘剧场 · 原型3 —— 设计审计：WCAG 对比度 / 遮挡 / 字体落地
   node tools/audit.mjs */
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('I:/AI/agent/DSH/airp-remake/p1-demo/node_modules/playwright');
const HERE = dirname(fileURLToPath(import.meta.url));
const URL = pathToFileURL(join(HERE, '..', 'index.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1680, height: 980 } });
await page.goto(URL);
await page.waitForTimeout(1800);
await page.click('#p3-opening');
await page.waitForTimeout(1500);
await page.click('#p3-login-flame');
await page.waitForTimeout(2400);

/* 把底片条滚到尾部，让最后一格进入视口后再测遮挡 */
await page.evaluate(() => {
  const f = document.getElementById('p3-frames');
  f.style.scrollBehavior = 'auto';
  f.scrollLeft = f.scrollWidth;
  f.dispatchEvent(new Event('scroll'));
});
await page.waitForTimeout(500);

const audit = await page.evaluate(() => {
  /* ---- 颜色工具 ---- */
  const parse = (s) => {
    const m = /rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.%]+))?\)/.exec(s || '');
    if (!m) return null;
    let a = 1;
    if (m[4] !== undefined) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return [+m[1], +m[2], +m[3], a];
  };
  const over = (fg, bg) => {
    const a = fg[3];
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
  };
  /* 从元素向上找到第一个不透明背景（含渐变；Chrome 把 color-mix 计算成 color(srgb ...)） */
  const gradColor = (bgi) => {
    if (!bgi || bgi === 'none') return null;
    const cols = [];
    const reRgb = /rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.%]+))?\)/g;
    const reSrgb = /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\)/g;
    let m;
    while ((m = reRgb.exec(bgi))) {
      let a = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      if (a > 0.5) cols.push([+m[1], +m[2], +m[3]]);
    }
    while ((m = reSrgb.exec(bgi))) {
      let a = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      if (a > 0.5) cols.push([+m[1] * 255, +m[2] * 255, +m[3] * 255]);
    }
    if (!cols.length) return null;
    const avg = cols.reduce((a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]], [0, 0, 0]);
    return [avg[0] / cols.length, avg[1] / cols.length, avg[2] / cols.length, 1];
  };
  const bgOf = (el) => {
    let cur = el, acc = null;
    while (cur && cur !== document.documentElement) {
      const st = getComputedStyle(cur);
      const g = gradColor(st.backgroundImage);
      const c = parse(st.backgroundColor);
      const own = (c && c[3] > 0.02) ? c : null;
      const layer = g && (!own || own[3] < 0.9) ? (own ? over(own, g) : g) : own;
      if (layer && layer[3] > 0.02) {
        acc = acc ? over(acc, layer) : layer;
        if (acc[3] >= 0.9) return acc;
      }
      cur = cur.parentElement;
    }
    return acc && acc[3] >= 0.5 ? over(acc, [16, 12, 13, 1]) : [16, 12, 13, 1];
  };

  const samples = [
    ['正文段落', '#p3-narr-body p'],
    ['正文对白', '#p3-narr-body .say'],
    ['正文强调', '#p3-narr-body .em'],
    ['选项小样文字', '.print .txt'],
    ['选项序号', '.print .idx'],
    ['显影槽姓名', '.identity .id-name'],
    ['显影槽副标', '.identity .id-sub'],
    ['六维名', '.trough .tname'],
    ['六维值', '.trough .tval'],
    ['区块标题', '.plate-head .ttl'],
    ['西文小标', '.plate-head .eyebrow'],
    ['底片格名', '.frame .fname'],
    ['底片格元信息', '.frame .fmeta'],
    ['按钮文字', '.btn span'],
    ['输入占位区文字', '#p3-input'],
    ['曝光计值', '.beam-exposure .ex-v'],
    ['曝光计键', '.beam-exposure .ex-k'],
    ['头条标题', '.headline .hl-ttl'],
    ['头条摘要', '.headline .hl-deck'],
    ['伏笔标题', '.thread .th-t'],
    ['伏笔说明', '.thread .th-d'],
    ['在场姓名', '.pcard .p-n'],
    ['在场副标', '.pcard .p-s'],
    ['快捷指令', '.qcmd span'],
    ['三态按钮', '.segbar button span'],
    ['提示文字', '.field-hint'],
    ['芯片文字', '.chip']
  ];

  const contrast = [];
  samples.forEach(([name, sel]) => {
    const el = document.querySelector(sel);
    if (!el) { contrast.push({ name, sel, missing: true }); return; }
    const st = getComputedStyle(el);
    const fg = parse(st.color);
    const bg = bgOf(el);
    if (!fg) return;
    const eff = fg[3] < 1 ? over(fg, bg) : fg;
    const fs = parseFloat(st.fontSize);
    const bold = parseInt(st.fontWeight, 10) >= 600;
    const large = fs >= 24 || (fs >= 18.66 && bold);
    const need = large ? 3.0 : 4.5;
    const r = ratio(eff, bg);
    contrast.push({
      name, fs: Math.round(fs * 10) / 10, ratio: Math.round(r * 100) / 100,
      need, pass: r >= need, decorative: fs < 11
    });
  });

  /* ---- 遮挡：关键控件的中心点必须命中自身 ---- */
  const controls = ['p3-send', 'p3-input', 'p3-mode-strip', 'p3-mode-read', 'p3-mode-explore', 'p3-mode-letters',
    'p3-skin-btn', 'p3-safelamp', 'p3-trough-collapse', 'p3-wall-collapse', 'p3-strip-l', 'p3-strip-r',
    'p3-fab', 'p3-opt-0', 'p3-opt-3', 'p3-headline'];
  const blocked = [];
  const skipped = [];
  controls.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) { blocked.push(id + '(缺失)'); return; }
    /* 刻意禁用（到头的滚动钮）不算遮挡 */
    if (getComputedStyle(el).pointerEvents === 'none' || el.dataset.end === 'true') { skipped.push(id + '(已到头/禁用)'); return; }
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) { blocked.push(id + '(零尺寸)'); return; }
    const cx = Math.min(window.innerWidth - 2, Math.max(2, r.left + r.width / 2));
    const cy = Math.min(window.innerHeight - 2, Math.max(2, r.top + r.height / 2));
    const hit = document.elementFromPoint(cx, cy);
    if (!hit || (hit !== el && !el.contains(hit) && !hit.contains(el))) {
      blocked.push(id + ' ← ' + (hit ? (hit.id || hit.className || hit.tagName) : 'null'));
    }
  });

  /* ---- 底片条：两个滚动极值下，首/末格都不得被滚动钮压住（几何判定） ---- */
  const stripOverlap = [];
  const box = document.getElementById('p3-frames');
  const navL = document.getElementById('p3-strip-l').getBoundingClientRect();
  const navR = document.getElementById('p3-strip-r').getBoundingClientRect();
  const hits = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  box.style.scrollBehavior = 'auto';
  box.scrollLeft = 0;
  const first = document.getElementById('p3-frame-map').getBoundingClientRect();
  if (hits(first, navL)) stripOverlap.push('滚到最左时首格「王国舆图」被左钮压住');
  box.scrollLeft = box.scrollWidth;
  const last = document.getElementById('p3-frame-settings').getBoundingClientRect();
  if (hits(last, navR)) stripOverlap.push('滚到最右时末格「设置」被右钮压住');
  box.scrollLeft = 0;

  /* ---- 字体落地 ---- */
  const fonts = {
    body: getComputedStyle(document.querySelector('#p3-narr-body p')).fontFamily,
    mono: getComputedStyle(document.querySelector('.beam-exposure .ex-v')).fontFamily,
    latin: getComputedStyle(document.querySelector('.eyebrow')).fontFamily
  };

  /* ---- 触控目标尺寸（移动端标准 44px，桌面放宽到 27px） ---- */
  const small = [];
  document.querySelectorAll('button:not([disabled])').forEach((b) => {
    const r = b.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    if (r.height < 20 || r.width < 20) small.push((b.id || b.className).slice(0, 44) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });

  /* ---- 面板内溢出 ---- */
  return { contrast, blocked, skipped, stripOverlap, fonts, small: small.slice(0, 12) };
});

console.log('\n=== WCAG 对比度 ===');
let cFail = 0;
audit.contrast.forEach((c) => {
  if (c.missing) { console.log('  MISS  ' + c.name + '  (' + c.sel + ')'); return; }
  const tag = c.pass ? 'PASS' : (c.decorative ? 'WARN' : 'FAIL');
  if (!c.pass && !c.decorative) cFail += 1;
  console.log('  ' + tag + '  ' + c.name.padEnd(14, '　') + ' ' + String(c.ratio).padStart(6) + ' : 1   (需 ' + c.need + '，字号 ' + c.fs + 'px)');
});

console.log('\n=== 关键控件遮挡 ===');
console.log(audit.blocked.length ? audit.blocked.map((b) => '  FAIL  ' + b).join('\n') : '  PASS  关键控件中心点均可命中');
if (audit.skipped.length) console.log(audit.skipped.map((s) => '  SKIP  ' + s).join('\n'));

console.log('\n=== 底片条滚动钮与首末格 ===');
console.log(audit.stripOverlap.length ? audit.stripOverlap.map((s) => '  FAIL  ' + s).join('\n') : '  PASS  两个滚动极值下首末格都不被压住');

console.log('\n=== 字体落地 ===');
Object.entries(audit.fonts).forEach(([k, v]) => console.log('  ' + k.padEnd(6) + v));

console.log('\n=== 过小的按钮（< 20px） ===');
console.log(audit.small.length ? audit.small.map((s) => '  WARN  ' + s).join('\n') : '  PASS  无');

console.log('\n对比度未达标（非装饰级）：' + cFail + ' 项；遮挡：' + audit.blocked.length + ' 项；底片条压格：' + audit.stripOverlap.length + ' 项');
await browser.close();
process.exit(cFail + audit.blocked.length + audit.stripOverlap.length ? 1 : 0);
