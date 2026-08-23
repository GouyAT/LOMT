/* 移动端布局尺寸探针 */
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('I:/AI/agent/DSH/airp-remake/p1-demo/node_modules/playwright');
const HERE = dirname(fileURLToPath(import.meta.url));
const URL = pathToFileURL(join(HERE, '..', 'index.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 880 } });
await page.goto(URL);
await page.waitForTimeout(1800);
await page.click('#p3-opening');
await page.waitForTimeout(1400);
await page.click('#p3-login-flame');
await page.waitForTimeout(1600);

const m = await page.evaluate(() => {
  const g = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: Math.round(r.height), top: Math.round(r.top) };
  };
  const q = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: Math.round(r.height) };
  };
  return {
    win: window.innerHeight,
    beam: g('p3-beam'),
    tools: q('.stage-tools'),
    view: g('p3-stage-view'),
    narrative: g('p3-narrative'),
    narrHead: q('.narr-head'),
    narrFoot: q('.narr-foot'),
    compose: g('p3-compose'),
    quick: q('.quickcmds'),
    logbook: q('.logbook'),
    tabbar: g('p3-tabbar'),
    ratio: (document.getElementById('p3-narrative').getBoundingClientRect().height / window.innerHeight * 100).toFixed(1)
  };
});
console.log(JSON.stringify(m, null, 1));
await browser.close();
