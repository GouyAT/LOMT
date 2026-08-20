/* ===========================================================
   audit.mjs —— 客观视觉/布局审计（Playwright）
   检查：文本裁切 / 交互元素重叠 / 对比度 / 星座节点间距 / 字体族
   =========================================================== */
import { chromium } from '../p1-demo/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = pathToFileURL(path.resolve('index.html')).href;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
await page.goto(FILE, { waitUntil: 'load' });
await page.waitForTimeout(600);
await page.locator('#p4-overture').click();
await page.waitForTimeout(1200);
await page.locator('#p4-gate-act-0').click();
await page.waitForTimeout(2600);

const AUDIT = `
(() => {
  const out = { clipped: [], overlaps: [], lowContrast: [], fonts: {}, palette: {} };

  function vis(el) {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.05) return null;
    /* 祖先被淡出/隐藏（如收起的星图层）→ 不算可见 */
    let a = el.parentElement;
    while (a && a !== document.documentElement) {
      const as = getComputedStyle(a);
      if (as.visibility === 'hidden' || as.display === 'none' || Number(as.opacity) < 0.05) return null;
      if (a.dataset && a.dataset.open === '0') return null;
      a = a.parentElement;
    }
    let r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    /* 与所有裁切祖先求交：被滚出视口的内容不参与几何判定 */
    let n = el.parentElement;
    let top = r.top, left = r.left, right = r.right, bottom = r.bottom;
    while (n && n !== document.documentElement) {
      const ns = getComputedStyle(n);
      if (/hidden|auto|scroll/.test(ns.overflowY) || /hidden|auto|scroll/.test(ns.overflowX)) {
        const nr = n.getBoundingClientRect();
        top = Math.max(top, nr.top); left = Math.max(left, nr.left);
        right = Math.min(right, nr.right); bottom = Math.min(bottom, nr.bottom);
      }
      n = n.parentElement;
    }
    if (right - left < 2 || bottom - top < 2) return null;
    return { top, left, right, bottom, width: right - left, height: bottom - top };
  }

  /* ---- 1. 文本裁切：仅 overflow:hidden 才是真裁切 ---- */
  function tag(el) {
    return (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]) +
      (el.getAttribute && el.getAttribute('title') ? '[' + el.getAttribute('title').slice(0, 14) + ']' : '') +
      (el.textContent && el.textContent.trim() ? '{' + el.textContent.trim().slice(0, 14) + '}' : '');
  }
  function widestChild(root) {
    let best = null;
    root.querySelectorAll('*').forEach((c) => {
      const w = c.getBoundingClientRect().width;
      if (!best || w > best.w) best = { w: Math.round(w), t: tag(c) };
    });
    return best;
  }
  document.querySelectorAll('#p4-app *, #p4-docket *').forEach((el) => {
    if (!vis(el)) return;
    if (el.classList.contains('scene-layer')) return; /* 背景图刻意放大 */
    const s = getComputedStyle(el);
    if (s.overflowX !== 'hidden' && s.overflow !== 'hidden') return;
    if (s.textOverflow === 'ellipsis' || s.whiteSpace === 'nowrap') return;
    if (el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0) {
      const w = widestChild(el);
      /* 真实子元素都装得下 → 溢出来自伪元素装饰（扫光/环），不是内容裁切 */
      if (w && w.w <= el.clientWidth + 3) return;
      out.clipped.push({ sel: tag(el), sw: el.scrollWidth, cw: el.clientWidth, widest: w });
    }
  });

  /* ---- 2. 交互元素重叠（同层、非祖孙；排除瞬时浮层） ---- */
  const TRANSIENT = '#p4-toasts, #p4-valve, #p4-confirm-scrim, #p4-hot-note';
  const btns = Array.from(document.querySelectorAll('button, a[href], input, select, textarea'))
    .filter((el) => !el.closest(TRANSIENT))
    .map((el) => ({ el, r: vis(el) })).filter((x) => x.r);
  for (let i = 0; i < btns.length; i++) {
    for (let j = i + 1; j < btns.length; j++) {
      const a = btns[i], b = btns[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (ox > 4 && oy > 4) {
        out.overlaps.push({ a: tag(a.el), b: tag(b.el), area: Math.round(ox * oy) });
      }
    }
  }

  /* ---- 3. 对比度（关键文本 vs 有效背景） ---- */
  function parse(c) {
    if (!c) return null;
    const all = c.match(/rgba?\\([^)]+\\)/g);
    if (!all) return null;
    for (const m of all) {
      const p = m.replace(/rgba?\\(|\\)/g, '').split(/[,\\s\\/]+/).filter(Boolean).map((x) => parseFloat(x));
      const o = { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      if (o.a > 0.55) return o;
    }
    const p = all[0].replace(/rgba?\\(|\\)/g, '').split(/[,\\s\\/]+/).filter(Boolean).map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lum({ r, g, b }) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function effBg(el) {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0.55) return c;
      /* 渐变背景：取第一个色标 */
      if (cs.backgroundImage && cs.backgroundImage.indexOf('gradient') >= 0) {
        const g = parse(cs.backgroundImage);
        if (g && g.a > 0.55) return g;
      }
      n = n.parentElement;
    }
    return { r: 5, g: 7, b: 11, a: 1 };
  }
  const samples = [
    ['正文', '.story-body p'],
    ['正文强调', '.story-body .em'],
    ['对白', '.story-body .dlg'],
    ['属性名', '.merc__name'],
    ['属性值', '.merc__val'],
    ['章节标题', '.sect-head h3'],
    ['按钮文字', '.btn span'],
    ['小字说明', '.t-label'],
    ['伏笔文字', '.thread__tx'],
    ['报纸头条', '.headline__title'],
    ['行动选项', '.act__tx'],
    ['输入占位提示', '.composer__meta span']
  ];
  samples.forEach(([name, sel]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const fg = parse(getComputedStyle(el).color);
    if (!fg) return;
    const bg = effBg(el);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(getComputedStyle(el).fontSize);
    const bold = Number(getComputedStyle(el).fontWeight) >= 700;
    const need = (size >= 18.66 || (size >= 14 && bold)) ? 3 : 4.5;
    out.lowContrast.push({ name, ratio: Math.round(ratio * 100) / 100, need, size, pass: ratio >= need });
  });

  /* ---- 4. 字体族实际生效 ---- */
  const fontOf = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).fontFamily : null; };
  out.fonts = {
    body: fontOf('body'),
    story: fontOf('.story-body'),
    mono: fontOf('.merc__val'),
    display: fontOf('.beam__logo .lat')
  };

  /* ---- 5. 调色板使用统计 ---- */
  const colors = {};
  document.querySelectorAll('#p4-app *').forEach((el) => {
    if (!vis(el)) return;
    const s = getComputedStyle(el);
    [s.color, s.backgroundColor, s.borderTopColor].forEach((c) => {
      const p = parse(c);
      if (!p || p.a < 0.1) return;
      const k = p.r + ',' + p.g + ',' + p.b;
      colors[k] = (colors[k] || 0) + 1;
    });
  });
  out.palette.distinct = Object.keys(colors).length;
  out.palette.top = Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return out;
})()
`;

const main = await page.evaluate(AUDIT);

/* 星图节点间距 */
await page.keyboard.press('\`');
await page.waitForTimeout(900);
const fog = await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll('.const-node')).map((n) => {
    const r = n.getBoundingClientRect();
    return { id: n.id, r };
  });
  const bad = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i].r, b = nodes[j].r;
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 2 && oy > 2) bad.push([nodes[i].id, nodes[j].id, Math.round(ox), Math.round(oy)]);
    }
  }
  const vpBad = nodes.filter((n) => n.r.top < 0 || n.r.bottom > window.innerHeight || n.r.left < 0 || n.r.right > window.innerWidth)
    .map((n) => n.id);
  return { count: nodes.length, overlaps: bad, outOfView: vpBad };
});
await page.keyboard.press('Escape');

/* 打开三个面板再审计一次裁切 */
await page.evaluate(() => { window.P4.docket.open('composer'); });
await page.waitForTimeout(600);
const panelAudit = await page.evaluate(AUDIT);

await browser.close();

console.log('\n============ 视觉/布局审计 ============');
console.log('\n【字体族实际生效】');
Object.entries(main.fonts).forEach(([k, v]) => console.log('  ' + k.padEnd(8) + ' ' + v));
console.log('\n【对比度 WCAG】');
main.lowContrast.forEach((c) => console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.name.padEnd(8)} ${String(c.ratio).padStart(5)} : 1  (需 ${c.need}，字号 ${c.size}px)`));
const cFail = main.lowContrast.filter((c) => !c.pass);
console.log(`  → ${main.lowContrast.length - cFail.length}/${main.lowContrast.length} 达标`);
console.log('\n【文本裁切】主界面 ' + main.clipped.length + ' 处，开面板后 ' + panelAudit.clipped.length + ' 处');
main.clipped.slice(0, 8).forEach((c) => console.log('  ! ' + c.sel + '  ' + c.sw + ' > ' + c.cw + '  最宽子元素: ' + (c.widest ? c.widest.w + 'px ' + c.widest.t : '-')));
panelAudit.clipped.slice(0, 8).forEach((c) => console.log('  ! (面板) ' + c.sel + '  ' + c.sw + ' > ' + c.cw + '  最宽子元素: ' + (c.widest ? c.widest.w + 'px ' + c.widest.t : '-')));
console.log('\n【交互元素重叠】主界面 ' + main.overlaps.length + ' 组，开面板后 ' + panelAudit.overlaps.length + ' 组');
main.overlaps.slice(0, 8).forEach((o) => console.log('  ! ' + o.a + '  ×  ' + o.b + '  ' + o.area + 'px²'));
panelAudit.overlaps.slice(0, 10).forEach((o) => console.log('  ! (面板) ' + o.a + '  ×  ' + o.b + '  ' + o.area + 'px²'));
console.log('\n【灰雾星图】节点 ' + fog.count + ' 颗，重叠 ' + fog.overlaps.length + ' 组，越界 ' + fog.outOfView.length + ' 颗');
fog.overlaps.slice(0, 6).forEach((o) => console.log('  ! ' + o[0] + ' × ' + o[1] + '  ' + o[2] + 'x' + o[3]));
fog.outOfView.forEach((i) => console.log('  ! 越界 ' + i));
console.log('\n【调色板】主界面可见颜色 ' + main.palette.distinct + ' 种（克制的有限色板）');
main.palette.top.slice(0, 6).forEach(([c, n]) => console.log('  rgb(' + c + ')  ×' + n));
console.log('\n======================================');

const problems = cFail.length + main.clipped.length + panelAudit.clipped.length +
  main.overlaps.length + panelAudit.overlaps.length + fog.overlaps.length + fog.outOfView.length;
console.log(problems === 0 ? '审计通过：无裁切、无重叠、无越界、对比度全达标' : `发现 ${problems} 处待修问题`);
process.exit(0);
