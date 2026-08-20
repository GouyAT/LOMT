/* ===========================================================
   shots.mjs —— 验收截图（Playwright）
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
const page = await browser.newPage({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 1.4 });
page.on('pageerror', (e) => console.log('  ! pageerror', String(e).slice(0, 120)));

async function shot(name, wait = 320) {
  await page.waitForTimeout(wait);
  n++;
  const f = path.join(OUT, `${String(n).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: f });
  console.log('  ->', path.basename(f));
}

await page.goto(FILE, { waitUntil: 'load' });

/* 开场 */
await shot('open-tray-title', 2500);
await page.locator('#p5-open').click();
await shot('open-shutter-closing', 300);
await shot('open-shutter-opening', 460);
await page.waitForTimeout(700);
await shot('gate-login', 900);

/* 主界面三态 */
await page.locator('#p5-gate-act-0').click();
await page.waitForTimeout(2600);
await shot('pc-strip-narrative', 1500);
await page.locator('#p5-btn-mode').click();
await shot('pc-read-fullscreen', 900);
await page.locator('#p5-btn-mode').click();
await shot('pc-explore-loupes', 900);
await page.locator('#p5-loupe-1').click();
await shot('pc-explore-field-note', 600);
await page.locator('#p5-loupe-note .icon-btn').click();
await page.locator('#p5-btn-mode').click();
await page.waitForTimeout(700);

/* 行动相片（滚到底，晒片绳全露） */
await page.evaluate(() => { const s = document.getElementById('p5-print-scroll'); s.scrollTop = s.scrollHeight; });
await shot('pc-drying-line-actions', 700);
await page.evaluate(() => { document.getElementById('p5-print-scroll').scrollTop = 0; });

/* 读心 */
await page.locator('#p5-story .mind').first().click();
await shot('mind-reading-whisper', 900);

/* 「/」指令补全 + 回合菜单 */
await page.locator('#p5-input').click();
await page.keyboard.type('/');
await shot('slash-command-palette', 600);
await page.keyboard.press('Escape');
await page.evaluate(() => { document.getElementById('p5-input').value = ''; });
await page.locator('#p5-btn-turn').click();
await shot('turn-menu', 500);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

/* 接触印相样张（签名装置） */
await page.keyboard.press('`');
await page.waitForTimeout(900);
await page.locator('#p5-frame-composer').hover();
await shot('contact-sheet-launcher', 700);
await page.keyboard.press('Escape');
await page.waitForTimeout(600);

/* 面板逐个 */
const panels = [
  ['map', 'panel-map'], ['codex', 'panel-codex'], ['news', 'panel-newspaper'],
  ['chronicle', 'panel-chronicle'], ['relations', 'panel-relations'], ['archive', 'panel-archive-tree'],
  ['board', 'panel-tactical-board'], ['theatre', 'panel-theatre-points'], ['refiner', 'panel-refinery'],
  ['lorebook', 'panel-lorebook'], ['composer', 'panel-context-composer'], ['pipeline', 'panel-pipeline'],
  ['vars', 'panel-variable-forge'], ['inventory', 'panel-inventory'], ['studio', 'panel-darkroom-press'],
  ['settings', 'panel-settings']
];
for (const [k, nm] of panels) {
  await page.evaluate((kk) => window.P5.sheet.open(kk), k);
  await shot(nm, 520);
  await page.evaluate((kk) => window.P5.sheet.close(kk), k);
  await page.waitForTimeout(230);
}

/* 占卜翻牌 / 证据板 */
await page.evaluate(() => window.P5.sheet.open('divination'));
await page.waitForTimeout(500);
await page.locator('#p5-proj-divination .btn').first().click();
await shot('panel-divination-flipped', 1100);
await page.evaluate(() => window.P5.sheet.close('divination'));
await page.waitForTimeout(240);
await page.evaluate(() => window.P5.sheet.open('case'));
await page.waitForTimeout(450);
await page.locator('#p5-tabs-case-tab-board').click();
await shot('panel-evidence-board', 1100);
await page.evaluate(() => window.P5.sheet.close('case'));
await page.waitForTimeout(240);

/* 多窗口并排 / 收回工作台 */
await page.evaluate(() => { window.P5.sheet.open('map'); window.P5.sheet.open('chronicle'); });
await page.waitForTimeout(500);
await page.locator('#p5-proj-half-map').click();
await page.waitForTimeout(450);
await page.locator('#p5-proj-half-chronicle').click();
await page.locator('#p5-proj-half-chronicle').click();
await shot('enlarger-two-projections', 700);
await page.locator('#p5-proj-min-chronicle').click();
await shot('enlarger-docked-to-bench', 600);
await page.evaluate(() => window.P5.sheet.closeAll());
await page.waitForTimeout(400);

/* 通知三态 */
await page.evaluate(() => {
  window.P5.notify.ok('已定影', '节点 R8 写入档案馆。');
  window.P5.notify.cyan('旁听 · 老图恩', '第三个了。第三个了。上一个也是从镜子那边走的。');
  window.P5.notify.warn('灵性不足', '旁听要一点灵性。你现在连自己的念头都压不住。');
});
await shot('notify-contact-prints', 700);
await page.evaluate(() => window.P5.notify.leak('过曝达 <b>30%</b>，「一名沉默的观众」将替你决定「继续看下去」。'));
await shot('notify-light-leak', 700);
await page.evaluate(() => window.P5.notify.hideLeak());
await page.evaluate(() => {
  window.P5.notify.confirm({
    title: '回退一回合？',
    msg: '当前回合的正文与变量快照将被丢弃，档案馆节点树回到上一节点。此操作可再前进。',
    okText: '回退', icon: 'undo'
  });
});
await shot('notify-develop-timer', 800);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

/* 两侧脊标全收 */
await page.keyboard.press('[');
await page.keyboard.press(']');
await shot('pc-spines-collapsed', 800);
await page.keyboard.press('[');
await page.keyboard.press(']');
await page.waitForTimeout(600);

/* 皮肤 */
await page.locator('#p5-btn-skin').click();
await shot('skin-cyanotype', 800);
await page.locator('#p5-btn-skin').click();
await shot('skin-daguerre', 800);
await page.locator('#p5-btn-skin').click();
await page.waitForTimeout(500);

/* 移动端 */
await page.setViewportSize({ width: 414, height: 896 });
await page.evaluate(() => window.P5.app.setDevice('mobile', true));
await shot('mobile-strip', 1000);
await page.locator('#p5-btn-mode').click();
await shot('mobile-read', 800);
await page.locator('#p5-btn-mode').click();
await page.locator('#p5-btn-mode').click();
await page.waitForTimeout(500);
await page.locator('#p5-tab-trough').click();
await shot('mobile-drawer-dossier', 800);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.locator('#p5-tab-sheet').click();
await shot('mobile-contact-sheet', 900);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
await page.evaluate(() => window.P5.sheet.open('news'));
await shot('mobile-panel-fullscreen', 900);

await browser.close();
console.log(`\n共生成 ${n} 张截图 → ${OUT}`);
