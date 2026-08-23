/* 诡秘剧场 · 原型3 —— 验收截图  node shots.mjs */
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('I:/AI/agent/DSH/airp-remake/p1-demo/node_modules/playwright');
const HERE = dirname(fileURLToPath(import.meta.url));
const URL = pathToFileURL(join(HERE, 'index.html')).href;
const OUT = join(HERE, 'screenshots');
mkdirSync(OUT, { recursive: true });

let n = 0;
const shot = async (page, name) => {
  n += 1;
  const file = join(OUT, String(n).padStart(2, '0') + '-' + name + '.png');
  await page.screenshot({ path: file });
  console.log('  shot ' + String(n).padStart(2, '0') + '  ' + name);
};

/* 截图前后清掉自动 Toast，避免遮挡与干扰后续点击 */
const clearToasts = (page) => page.evaluate(() => {
  const t = document.getElementById('p3-toasts');
  while (t && t.firstChild) t.removeChild(t.firstChild);
});

const browser = await chromium.launch();

/* ---------- PC ---------- */
const page = await browser.newPage({ viewport: { width: 1680, height: 980 }, deviceScaleFactor: 1.5 });
await page.goto(URL);
await page.waitForTimeout(1400);
await shot(page, 'opening-developing');
await page.waitForTimeout(1400);
await shot(page, 'opening-fixed');

await page.click('#p3-opening');
await page.waitForTimeout(1800);
await shot(page, 'login');

await page.click('#p3-login-flame');
await page.waitForTimeout(2600);
await shot(page, 'stage-strip');

await page.click('#p3-mode-read');
await page.waitForTimeout(900);
await shot(page, 'stage-read');

await page.click('#p3-mode-explore');
await page.waitForTimeout(900);
await page.hover('#p3-loupe-1');
await page.waitForTimeout(600);
await shot(page, 'stage-explore-loupe');

await page.click('#p3-mode-letters');
await page.waitForTimeout(700);
await shot(page, 'stage-letters');
await page.click('#p3-mode-strip');
await page.waitForTimeout(600);

/* 面板 */
const panels = [
  ['map', 'panel-map-cyanotype'],
  ['codex', 'panel-codex'],
  ['chronicle', 'panel-chronicle'],
  ['divination', 'panel-divination'],
  ['newspaper', 'panel-newspaper'],
  ['relations', 'panel-relations'],
  ['board', 'panel-board'],
  ['cases', 'panel-casebook'],
  ['gate', 'panel-gateway'],
  ['worldbook', 'panel-worldbook-dual'],
  ['preset', 'panel-composer'],
  ['api', 'panel-pipeline'],
  ['vars', 'panel-variables'],
  ['archive', 'panel-archive'],
  ['imagine', 'panel-develop-image'],
  ['settings', 'panel-settings']
];
for (const [id, name] of panels) {
  await page.evaluate((i) => document.querySelector('.frame[data-id="' + i + '"]').click(), id);
  await page.waitForSelector('#p3-projection.is-open', { timeout: 5000 });
  await page.waitForTimeout(760);
  if (id === 'divination') { await page.click('#p3-div-deal'); await page.waitForTimeout(1600); }
  await shot(page, name);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(340);
}

/* Toast 堆叠 + 确认框 */
await page.evaluate(() => {
  window.UI.toast({ title: '第 2 回合已定影', msg: '变量更新 3 项 · 新增伏笔 1 条', tone: 'good', icon: 'check', life: 30000 });
  window.UI.toast({ title: '灵性下降至 36 / 42', msg: '连续占卜会让灰雾累积得更快。', tone: 'warn', icon: 'drop', life: 30000 });
  window.UI.toast({ title: '《廷根晚报》有新头条', msg: '老城区再添失踪者：本月第三起。', tone: 'info', icon: 'newspaper', life: 30000 });
});
await page.waitForTimeout(900);
await shot(page, 'toasts-clipline');

await page.click('#p3-tool-undo');
await page.waitForTimeout(900);
await shot(page, 'confirm-timer');
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

/* 轨道收起 */
await page.click('#p3-trough-collapse');
await page.click('#p3-wall-collapse');
await page.waitForTimeout(900);
await shot(page, 'rails-collapsed');
await page.evaluate(() => { document.querySelectorAll('#p3-trough-rail .rail-btn')[0].click(); document.querySelectorAll('#p3-wall-rail .rail-btn')[0].click(); });
await page.waitForTimeout(800);

/* 主题皮肤 */
await page.evaluate(() => window.APP.applySkin('cyanotype', true));
await page.waitForTimeout(700);
await shot(page, 'skin-cyanotype');
await page.evaluate(() => window.APP.applySkin('daguerre', true));
await page.waitForTimeout(700);
await shot(page, 'skin-daguerre');
await page.evaluate(() => window.APP.applySkin('darkroom', true));
await page.waitForTimeout(600);

await page.close();

/* ---------- 移动端 ---------- */
const m = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 });
await m.goto(URL);
await m.waitForTimeout(1600);
await m.click('#p3-opening');
await m.waitForTimeout(1500);
await shot(m, 'mobile-login');
await m.click('#p3-login-flame');
await m.waitForTimeout(2400);
await shot(m, 'mobile-stage');

await m.click('#p3-mode-read');
await m.waitForTimeout(800);
await shot(m, 'mobile-read');
await clearToasts(m);
await m.click('#p3-mode-explore');
await m.waitForTimeout(800);
await shot(m, 'mobile-explore');
await clearToasts(m);
await m.click('#p3-mode-strip');
await m.waitForTimeout(600);
await clearToasts(m);

await m.click('#p3-tab-pouch');
await m.waitForTimeout(900);
await shot(m, 'mobile-pouch');
await m.click('#p3-sheet-close');
await m.waitForTimeout(600);
await clearToasts(m);
await m.click('#p3-tab-status');
await m.waitForTimeout(900);
await shot(m, 'mobile-sheet-status');
await m.click('#p3-sheet-close');
await m.waitForTimeout(600);
await clearToasts(m);

await m.evaluate(() => window.APP.openPanel('preset'));
await m.waitForTimeout(1100);
await shot(m, 'mobile-panel-composer');
await m.keyboard.press('Escape');
await m.waitForTimeout(500);
await clearToasts(m);
await m.evaluate(() => window.APP.openPanel('newspaper'));
await m.waitForTimeout(1000);
await shot(m, 'mobile-panel-newspaper');

await browser.close();
console.log('\n  共 ' + n + ' 张截图 → screenshots/');
