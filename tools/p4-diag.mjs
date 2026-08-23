/* P4 诊断：打开首屏，抓 console/pageerror、可见性、遮罩层状态 */
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('I:/AI/agent/DSH/airp-remake/p1-demo/node_modules/playwright');
const HERE = dirname(fileURLToPath(import.meta.url));
const URL = pathToFileURL(join(HERE, '..', 'p4-demo', 'index.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1680, height: 980 } });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
page.on('pageerror', (e) => errs.push('pageerror: ' + String(e).slice(0, 400)));
page.on('requestfailed', (r) => errs.push('reqfail: ' + r.url().slice(0, 120) + ' ' + (r.failure() || {}).errorText));

await page.goto(URL);
await page.waitForTimeout(3000);
await page.screenshot({ path: join(HERE, 'p4-diag-01-initial.png') });

const info = await page.evaluate(() => {
  const scenes = Array.prototype.map.call(document.querySelectorAll('[class*="scene"],[id*="scene"],[id*="stage"],[id*="opening"],[id*="login"],[id*="app"]'), (el) => ({
    id: el.id, cls: (el.className || '').toString().slice(0, 60),
    disp: getComputedStyle(el).display, vis: getComputedStyle(el).visibility,
    op: getComputedStyle(el).opacity, z: getComputedStyle(el).zIndex,
    w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height)
  })).slice(0, 24);

  /* 覆盖全屏且不透明的元素（找出那层灰雾） */
  const covers = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (r.width >= window.innerWidth * 0.92 && r.height >= window.innerHeight * 0.92 &&
      s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05) {
      covers.push({
        id: el.id, cls: (el.className || '').toString().slice(0, 70), tag: el.tagName,
        z: s.zIndex, op: s.opacity, bg: s.backgroundColor,
        bd: (s.backdropFilter || s.webkitBackdropFilter || 'none').slice(0, 40),
        filter: s.filter.slice(0, 40), pe: s.pointerEvents
      });
    }
  });

  /* 中心点命中谁 */
  const hit = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);

  return {
    title: document.title,
    bodyClass: (document.body.className || '').toString(),
    bodyData: JSON.stringify(Object.assign({}, document.body.dataset)),
    htmlData: JSON.stringify(Object.assign({}, document.documentElement.dataset)),
    scenes, covers: covers.slice(0, 14),
    hitCenter: hit ? (hit.id || hit.className || hit.tagName) : 'null',
    ls: (() => { try { return Object.keys(localStorage).filter((k) => /p4|docket|starmap|fog/i.test(k)); } catch (e) { return ['LS-blocked']; } })(),
    globals: ['P4', 'APP', 'UI', 'DATA', 'ICONS', 'FX'].filter((g) => typeof window[g] !== 'undefined'),
    visibleText: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300)
  };
});

console.log('=== 错误 ===');
console.log(errs.length ? errs.slice(0, 10).join('\n') : '（无）');
console.log('\n=== 页面 ===');
console.log('title      ' + info.title);
console.log('body.class ' + info.bodyClass);
console.log('body.data  ' + info.bodyData);
console.log('html.data  ' + info.htmlData);
console.log('globals    ' + info.globals.join(', '));
console.log('中心命中   ' + info.hitCenter);
console.log('相关 LS    ' + info.ls.join(', '));
console.log('\n=== 全屏覆盖层 ===');
info.covers.forEach((c) => console.log('  ' + (c.id || '.' + c.cls) + '  z=' + c.z + ' op=' + c.op + ' bg=' + c.bg + ' backdrop=' + c.bd + ' filter=' + c.filter + ' pe=' + c.pe));
console.log('\n=== 场景类元素 ===');
info.scenes.forEach((s) => console.log('  ' + (s.id || '.' + s.cls) + '  disp=' + s.disp + ' vis=' + s.vis + ' op=' + s.op + ' z=' + s.z + ' ' + s.w + 'x' + s.h));
console.log('\n=== 可见文字（前 300）===');
console.log(info.visibleText || '（空）');

await browser.close();
