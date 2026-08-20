/* ===========================================================
   shots.mjs —— 验收截图（Playwright）
   用法：node shots.mjs   → screenshots/*.png
   =========================================================== */
import { chromium } from '../p1-demo/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const FILE = pathToFileURL(path.resolve('index.html')).href;
const OUT = path.resolve('screenshots');
mkdirSync(OUT, { recursive: true });

let n = 0;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 1.5 });
page.on('pageerror', (e) => console.log('  ! pageerror', String(e).slice(0, 120)));

async function shot(name, wait = 320) {
  await page.waitForTimeout(wait);
  n++;
  const file = path.join(OUT, `${String(n).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: file });
  console.log('  ->', path.basename(file));
}

await page.goto(FILE, { waitUntil: 'load' });

/* 开场 */
await shot('overture-title', 2500);
await page.locator('#p4-overture').click();
await shot('overture-mirror-closing', 300);
await shot('overture-mirror-opening', 480);
await page.waitForTimeout(700);

/* 登录页 */
await shot('gate-login', 900);

/* 主界面三态 */
await page.locator('#p4-gate-act-0').click();
await page.waitForTimeout(2600);
await shot('pc-strip-narrative', 1400);

await page.keyboard.press('2');
await shot('pc-read-fullscreen', 900);
await page.keyboard.press('3');
await shot('pc-explore-hotspots', 900);
await page.locator('#p4-hotspot-0').click();
await shot('pc-explore-field-note', 600);
await page.locator('#p4-hot-note .icon-btn').click();
await page.keyboard.press('1');
await page.waitForTimeout(700);

/* 左塔展开：特性 / 装备 / 能力 */
await page.locator('#p4-fold-traits .fold__head').click();
await page.locator('#p4-fold-kit .fold__head').click();
await shot('pc-tower-expanded', 800);
await page.locator('#p4-fold-traits .fold__head').click();
await page.locator('#p4-fold-kit .fold__head').click();

/* 读心批注 */
await page.locator('#p4-story .mind-target').first().click();
await shot('mind-reading-whisper', 900);

/* 灰雾星图 */
await page.keyboard.press('`');
await page.waitForTimeout(900);
await page.locator('#p4-star-divination').hover();
await shot('fog-constellation-launcher', 700);
await page.keyboard.press('Escape');
await page.waitForTimeout(600);

/* 面板逐个 */
const panels = [
  ['map', 'panel-map', 500],
  ['codex', 'panel-codex', 500],
  ['news', 'panel-newspaper', 600],
  ['chronicle', 'panel-chronicle', 500],
  ['archive', 'panel-archive-tree', 500],
  ['board', 'panel-tactical-board', 600],
  ['lorebook', 'panel-lorebook', 600],
  ['composer', 'panel-context-composer', 600],
  ['pipeline', 'panel-model-pipeline', 500],
  ['vars', 'panel-variable-forge', 500],
  ['relations', 'panel-relations', 500],
  ['inventory', 'panel-inventory', 500],
  ['studio', 'panel-darkroom', 500],
  ['settings', 'panel-settings', 500]
];
for (const [key, name, w] of panels) {
  await page.evaluate((k) => window.P4.docket.open(k), key);
  await shot(name, w);
  await page.evaluate((k) => window.P4.docket.close(k), key);
  await page.waitForTimeout(220);
}

/* 占卜（翻牌后） */
await page.evaluate(() => window.P4.docket.open('divination'));
await page.waitForTimeout(500);
await page.locator('#p4-win-divination .btn').first().click();
await shot('panel-divination-flipped', 1100);
await page.evaluate(() => window.P4.docket.close('divination'));

/* 侦探证据板 */
await page.evaluate(() => window.P4.docket.open('case'));
await page.waitForTimeout(450);
await page.locator('#p4-tabs-case-tab-board').click();
await shot('panel-evidence-board', 1100);
await page.evaluate(() => window.P4.docket.close('case'));
await page.waitForTimeout(250);

/* 多窗口并排 */
await page.evaluate(() => {
  window.P4.docket.open('map');
  window.P4.docket.open('chronicle');
});
await page.waitForTimeout(500);
await page.locator('#p4-win-half-map').click();
await page.waitForTimeout(500);
await page.locator('#p4-win-half-chronicle').click();
await page.locator('#p4-win-half-chronicle').click();
await shot('docket-two-windows-snapped', 700);
await page.locator('#p4-win-min-chronicle').click();
await shot('docket-minimised-to-rail', 600);
await page.evaluate(() => window.P4.docket.closeAll());
await page.waitForTimeout(400);

/* 通知系统 */
await page.evaluate(() => {
  window.P4.notify.ok('已快速存档', '节点 R8 写入 IndexedDB。');
  window.P4.notify.mystic('旁听 · 玛戈·希尔', '别问第三幕。别问第三幕。别问第三幕。');
  window.P4.notify.warn('灵性不足', '旁听需要一点灵性。你现在连自己的念头都压不住。');
});
await shot('notify-develop-toasts', 700);
await page.evaluate(() => window.P4.notify.valve('若失控达 <b>30%</b>，「一名沉默的观众」将替你决定「继续看下去」。'));
await shot('notify-warning-valve', 700);
await page.evaluate(() => window.P4.notify.hideValve());
await page.evaluate(() => {
  window.P4.notify.confirm({
    title: '回退一回合？',
    msg: '当前回合的正文与变量快照将被丢弃，档案馆节点树回到上一节点。此操作可再前进。',
    okText: '回退', icon: 'undo'
  });
});
await shot('notify-mercury-seal-confirm', 800);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

/* 侧栏全收 */
await page.keyboard.press('[');
await page.keyboard.press(']');
await shot('pc-rails-collapsed', 800);
await page.keyboard.press('[');
await page.keyboard.press(']');
await page.waitForTimeout(600);

/* 主题皮肤 */
await page.locator('#p4-btn-skin').click();
await shot('skin-cyanotype', 800);
await page.locator('#p4-btn-skin').click();
await shot('skin-daguerreotype', 800);
await page.locator('#p4-btn-skin').click();
await page.waitForTimeout(500);

/* 移动端 */
await page.setViewportSize({ width: 414, height: 896 });
await page.evaluate(() => window.P4.app.setDevice('mobile', true));
await shot('mobile-strip', 1000);
await page.keyboard.press('2');
await shot('mobile-read', 800);
await page.keyboard.press('1');
await page.waitForTimeout(400);
await page.locator('#p4-tab-self').click();
await shot('mobile-sheet-self', 800);
await page.locator('#p4-tab-more').click();
await shot('mobile-grid-launcher', 800);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.locator('#p4-tab-map').click();
await shot('mobile-panel-fullscreen', 900);

await browser.close();
console.log(`\n共生成 ${n} 张截图 → ${OUT}`);
