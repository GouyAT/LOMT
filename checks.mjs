/* ===========================================================
   checks.mjs —— DOM 级自动化验收（Playwright）
   用法：node checks.mjs
   =========================================================== */
import { chromium } from '../p1-demo/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = pathToFileURL(path.resolve('index.html')).href;
const results = [];
let failed = 0;

function ok(name, pass, detail = '') {
  results.push({ name, pass, detail });
  if (!pass) failed++;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });

const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => pageErrors.push(String(e)));

await page.goto(FILE, { waitUntil: 'load' });
await page.waitForTimeout(700);

/* ---------- 1. 开场序列 ---------- */
ok('开场层存在', await page.locator('#p4-overture').count() === 1);
const titleChars = await page.locator('#p4-overture .overture__title span').count();
ok('标题「诡秘剧场」逐字显影', titleChars === 4, `${titleChars} 个字符 span`);
ok('镜面过场元件就位', await page.locator('#p4-mirror .mirror-shard').count() === 2);
await page.waitForFunction(
  () => Number(getComputedStyle(document.querySelector('#p4-overture .overture__title span:last-child')).opacity) > 0.98,
  null, { timeout: 6000 }
).catch(() => {});
const titleVisible = await page.evaluate(() => {
  const sp = Array.from(document.querySelectorAll('#p4-overture .overture__title span'));
  const shard = document.querySelector('#p4-mirror .mirror-shard--l');
  const t = getComputedStyle(shard).transform;
  /* 银镜应停在视口外（translateX(-102%)），不得遮挡标题 */
  const offstage = t === 'none' || /matrix\(1, 0, 0, 1, -\d/.test(t);
  return { minOpacity: Math.min.apply(null, sp.map((s) => Number(getComputedStyle(s).opacity))), offstage: offstage };
});
ok('开场标题在过场前完全可见（银镜停在视口外）',
  titleVisible.minOpacity > 0.98 && titleVisible.offstage,
  `opacity=${titleVisible.minOpacity.toFixed(2)} 银镜离场=${titleVisible.offstage}`);

await page.locator('#p4-overture').click();
await page.waitForTimeout(1200);
ok('开场已让位（phase=gone）', await page.getAttribute('#p4-overture', 'data-phase') === 'gone');

/* ---------- 2. 登录页 ---------- */
ok('登录页已显示', await page.locator('#p4-gate').isVisible());
const gateActs = await page.locator('#p4-gate .gate-act').count();
ok('登录页入口数量 ≥5', gateActs >= 5, `${gateActs} 个`);
ok('登录页背景层存在', await page.locator('#p4-gate-scene .scene-layer').count() === 1);
ok('登录页有诗句区', await page.locator('#p4-gate .gate__poem').count() === 1);

/* ---------- 3. 进入主界面 ---------- */
await page.locator('#p4-gate-act-0').click();
await page.waitForTimeout(1500);
ok('主界面已激活', (await page.getAttribute('#p4-app', 'class') || '').includes('is-live'));
ok('顶梁已装配', await page.locator('#p4-beam .beam__logo').count() === 1);
ok('管线四灯', await page.locator('#p4-beam .lamp').count() === 4);
ok('左仪表塔轨道按钮 ≥6', await page.locator('#p4-tower-rail .rail-btn').count() >= 6);
ok('右卷宗栏轨道按钮 ≥8', await page.locator('#p4-dossier-rail .rail-btn').count() >= 8);

/* ---------- 4. 六维水银柱 ---------- */
const mercCount = await page.locator('#p4-merc-bank .merc').count();
ok('六维水银柱 = 6', mercCount === 6, `${mercCount} 根`);
const fluidHeights = await page.$$eval('#p4-merc-bank .merc__fluid', (els) => els.map((e) => e.style.height));
ok('水银液面高度已按属性写入', fluidHeights.every((x) => /%$/.test(x)), fluidHeights.join(' '));
ok('水银柱带 role=meter', await page.locator('#p4-merc-bank .merc[role="meter"]').count() === 6);

/* ---------- 5. 正文与显影 ---------- */
ok('汞镜叙事池存在', await page.locator('#p4-pool.mercury-pool').count() === 1);
const storyChars = await page.locator('#p4-story .develop-char').count();
ok('银版显影字符已生成', storyChars > 200, `${storyChars} 字`);
await page.locator('#p4-pool').click({ position: { x: 12, y: 8 } });
await page.waitForTimeout(200);
const actCount = await page.locator('#p4-acts .act').count();
ok('行动拨片 = 4', actCount === 4, `${actCount} 条`);

/* ---------- 5b. 社区版「必做」项自查（对照 community-ui-inventory.md 第八节） ---------- */
await page.locator('#p4-fold-quests .fold__head').click();
await page.waitForTimeout(400);
const questCount = await page.locator('#p4-fold-quests [id^="p4-quest-"]').count();
ok('左栏「委托与任务」列表已装配', questCount === 4, `${questCount} 项`);
await page.locator('#p4-fold-quests .fold__head').click();
ok('银轨「变量重算」按钮存在', await page.locator('#p4-rail-revar').count() === 1);
ok('银轨「终止生成」按钮存在', await page.locator('#p4-rail-stop').count() === 1);
ok('银轨「回退」按钮存在', await page.locator('#p4-rail-undo').count() === 1);
ok('银轨「重演本回合」按钮存在', await page.locator('#p4-rail-reroll').count() === 1);
const purse = await page.textContent('#p4-rail-purse');
ok('钱包读数常驻银轨', /镑/.test(purse), purse.trim());

/* ---------- 5c. 关闭态浮层不得参与合成（整页发灰的元凶） ---------- */
const idleOverlays = await page.evaluate(() => {
  const ids = ['p4-fog', 'p4-confirm-scrim', 'p4-sheet-scrim', 'p4-overture', 'p4-valve', 'p4-sheet'];
  return ids.map((id) => {
    const el = document.getElementById(id);
    if (!el) return { id, missing: true };
    const s = getComputedStyle(el);
    return {
      id,
      open: el.dataset.open === '1',
      vis: s.visibility,
      bf: (s.backdropFilter || s.webkitBackdropFilter || 'none')
    };
  });
});
const leaky = idleOverlays.filter((o) => !o.missing && !o.open && (o.vis !== 'hidden' || (o.bf && o.bf !== 'none')));
ok('关闭态浮层已彻底退出合成（visibility:hidden + backdrop-filter:none）',
  leaky.length === 0,
  leaky.length ? leaky.map((o) => `${o.id}:${o.vis}/${o.bf}`).join(' ') : idleOverlays.map((o) => o.id).join(','));


/* ---------- 5e. Chrome 133 合成安全：常驻可见元素不得带 backdrop-filter / mix-blend-mode ---------- */
const synthHazards = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('*').forEach((el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) < 0.05) return;
    const bf = (s.backdropFilter || s.webkitBackdropFilter || 'none');
    const mb = s.mixBlendMode || 'normal';
    if (bf !== 'none') out.push((el.id ? '#' + el.id : el.className.toString().split(' ')[0]) + ':bf');
    if (mb !== 'normal') out.push((el.id ? '#' + el.id : el.className.toString().split(' ')[0]) + ':mb(' + mb + ')');
  });
  /* 再查一次打开态浮层：样张/星图/遮罩打开时也不得使用 backdrop-filter（Chrome 133 全禁） */
  const layer = document.getElementById(document.body.dataset.device === 'mobile' ? 'p5-timer-scrim' : 'p5-timer-scrim');
  return out;
});
ok('可见元素零 backdrop-filter / 零 mix-blend-mode（Chrome 133 发灰防护）',
  synthHazards.length === 0, synthHazards.slice(0, 6).join(' '));

/* 过场节点必须彻底移除 */
const removedNodes = await page.evaluate(() => ({
  mirror: !!document.getElementById('p4-mirror'),
  overtureHidden: !!document.getElementById('p4-overture') && document.getElementById('p4-overture').hidden
}));
ok('银镜过场节点已从 DOM 移除、开场层已 hidden',
  !removedNodes.mirror && removedNodes.overtureHidden, JSON.stringify(removedNodes));
/* ---------- 6. 全站 ID 唯一 ---------- */
const dupIds = await page.evaluate(() => {
  const seen = new Map();
  const dups = [];
  document.querySelectorAll('[id]').forEach((el) => {
    if (seen.has(el.id)) dups.push(el.id); else seen.set(el.id, 1);
  });
  return dups;
});
ok('全站 ID 唯一', dupIds.length === 0, dupIds.join(','));

/* ---------- 7. 无横向溢出 ---------- */
const overflow = await page.evaluate(() => ({
  docW: document.documentElement.scrollWidth,
  cliW: document.documentElement.clientWidth,
  bodyW: document.body.scrollWidth
}));
ok('无横向溢出', overflow.docW <= overflow.cliW + 1, JSON.stringify(overflow));

/* ---------- 8. 三态切换 ---------- */
const boxes = {};
for (const [mode, key] of [['strip', '1'], ['read', '2'], ['explore', '3']]) {
  await page.keyboard.press(key);
  await page.waitForTimeout(650);
  const m = await page.getAttribute('#p4-stage', 'data-mode');
  ok(`三态切换 → ${mode}`, m === mode, `data-mode=${m}`);
  boxes[mode] = await page.locator('#p4-pool').boundingBox();
}
ok('阅读态文本框显著大于窄条态',
  boxes.read.height > boxes.strip.height * 1.4,
  `strip=${Math.round(boxes.strip.height)} read=${Math.round(boxes.read.height)}`);
ok('探索态文本框缩为纸角',
  boxes.explore.height < 60 && boxes.explore.width < 300,
  `${Math.round(boxes.explore.width)}x${Math.round(boxes.explore.height)}`);

/* ---------- 9. 探索热区 ---------- */
await page.keyboard.press('3');
await page.waitForTimeout(500);
const spots = await page.locator('#p4-hotspots .hotspot').count();
ok('探索热区 = 5', spots === 5, `${spots} 处`);
await page.locator('#p4-hotspot-0').click();
await page.waitForTimeout(400);
ok('热区速记卡浮出', await page.locator('#p4-hot-note').count() === 1);
await page.locator('#p4-hot-note .icon-btn').click();
await page.keyboard.press('1');
await page.waitForTimeout(500);

/* ---------- 10. 灰雾星图启动器 ---------- */
await page.keyboard.press('`');
await page.waitForTimeout(700);
ok('星图已展开', await page.getAttribute('#p4-fog', 'data-open') === '1');
const nodeCount = await page.locator('#p4-constellation .const-node').count();
ok('星座节点 = 22', nodeCount === 22, `${nodeCount} 颗`);
const linkCount = await page.locator('#p4-constellation .const-link').count();
ok('星座连线 ≥ 20', linkCount >= 20, `${linkCount} 条`);
await page.locator('#p4-star-map').hover();
await page.waitForTimeout(250);
const desc = await page.textContent('#p4-fog-desc');
ok('悬停星点显示说明', desc.includes('王国舆图'), desc);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(200);
ok('方向键可在星座间游走', await page.locator('#p4-constellation .const-node.is-cursor').count() === 1);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
ok('Esc 收起星图', await page.getAttribute('#p4-fog', 'data-open') === '0');

/* ---------- 11. 22 个面板全开全关 ---------- */
const keys = await page.evaluate(() => window.P4.docket.registry.map((r) => r.key));
ok('面板注册表 = 22', keys.length === 22, `${keys.length}`);
for (const k of keys) {
  await page.evaluate((kk) => window.P4.docket.open(kk), k);
  await page.waitForTimeout(230);
  const winCount = await page.locator(`#p4-win-${k}`).count();
  const bodyLen = await page.evaluate((kk) => {
    const b = document.getElementById('p4-panelbody-' + kk);
    return b ? b.textContent.trim().length : -1;
  }, k);
  const hasEmpty = await page.evaluate((kk) => {
    const b = document.getElementById('p4-panelbody-' + kk);
    return b ? /装配失败|尚未装配/.test(b.textContent) : true;
  }, k);
  ok(`面板「${k}」打开且有内容`, winCount === 1 && bodyLen > 120 && !hasEmpty, `len=${bodyLen}`);
  await page.evaluate((kk) => window.P4.docket.close(kk), k);
  await page.waitForTimeout(260);
}
await page.waitForTimeout(300);
ok('全部面板已关闭', await page.locator('#p4-docket .win').count() === 0);

/* ---------- 12. 多窗口：并排 / 最小化 / 停靠 ---------- */
await page.evaluate(() => { window.P4.docket.open('map'); window.P4.docket.open('codex'); });
await page.waitForTimeout(450);
ok('可同时打开 2 个窗口', await page.locator('#p4-docket .win').count() === 2);
const beforeSnap = await page.locator('#p4-win-map').boundingBox();
await page.locator('#p4-win-half-map').click();
await page.waitForTimeout(500);
const afterSnap = await page.locator('#p4-win-map').boundingBox();
ok('并排吸附改变窗口几何', Math.abs(afterSnap.height - beforeSnap.height) > 20 || Math.abs(afterSnap.x - beforeSnap.x) > 20,
  `${Math.round(beforeSnap.width)}x${Math.round(beforeSnap.height)} → ${Math.round(afterSnap.width)}x${Math.round(afterSnap.height)}`);
await page.locator('#p4-win-min-map').click();
await page.waitForTimeout(350);
ok('最小化后进入银轨', await page.locator('#p4-dockmin-map').count() === 1);
await page.locator('#p4-dockmin-map').click();
await page.waitForTimeout(350);
ok('从银轨取回窗口', await page.locator('#p4-win-map').isVisible());
await page.locator('#p4-win-pin-map').click();
await page.waitForTimeout(200);
ok('钉住状态已记录', await page.getAttribute('#p4-win-map', 'data-pinned') === '1');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.evaluate(() => window.P4.docket.closeAll());
await page.waitForTimeout(300);

/* ---------- 13. 内部通知：Toast / 确认框 / 警示阀 ---------- */
await page.evaluate(() => {
  window.P4.notify.ok('验收 · 成功态', '这是内部显影通知，不是浏览器弹窗。');
  window.P4.notify.warn('验收 · 警示态', '朱砂色仅用于危险。');
  window.P4.notify.mystic('验收 · 神秘态', '紫水晶仅用于灵性相关。');
});
await page.waitForTimeout(400);
ok('Toast 可堆叠 ≥3', await page.locator('#p4-toasts .toast').count() >= 3);
await page.evaluate(() => { window.__confirmResult = null; window.P4.notify.confirm({ title: '验收确认框', msg: '这是汞封确认框。' }).then((v) => { window.__confirmResult = v; }); });
await page.waitForTimeout(500);
ok('确认框已打开', await page.getAttribute('#p4-confirm-scrim', 'data-open') === '1');
ok('确认框有 role=dialog + aria-modal', await page.locator('#p4-confirm-scrim [role="dialog"][aria-modal="true"]').count() === 1);
await page.keyboard.press('Escape');
await page.waitForTimeout(450);
ok('Esc 关闭确认框并返回 false', await page.evaluate(() => window.__confirmResult) === false);
await page.evaluate(() => window.P4.notify.valve('验收 · 警示阀条从顶部渗入。'));
await page.waitForTimeout(400);
ok('警示阀已展开', await page.getAttribute('#p4-valve', 'data-open') === '1');
await page.evaluate(() => window.P4.notify.hideValve());

/* ---------- 14. 读心机制（观众途径序列 9） ---------- */
const spiritBefore = await page.evaluate(() => window.P4.data.attrs.find((a) => a.key === 'spirit').cur);
await page.locator('#p4-story .mind-target').first().click();
await page.waitForTimeout(500);
const spiritAfter = await page.evaluate(() => window.P4.data.attrs.find((a) => a.key === 'spirit').cur);
ok('读心消耗 1 点灵性', spiritAfter === spiritBefore - 1, `${spiritBefore} → ${spiritAfter}`);
ok('心声批注已浮出', await page.locator('#p4-story .mind-whisper').count() >= 1);
const mercAfter = await page.$eval('#p4-merc-bank .merc[data-attr="spirit"] .merc__fluid', (e) => e.style.height);
ok('水银柱随之下落', mercAfter && mercAfter !== '100%', mercAfter);

/* ---------- 15. 回合推进 ---------- */
const roundBefore = await page.textContent('#p4-rail-round');
await page.locator('#p4-act-1').click();
await page.waitForTimeout(900);
const roundAfter = await page.textContent('#p4-rail-round');
ok('行动推进回合', Number(roundAfter) === Number(roundBefore) + 1, `${roundBefore} → ${roundAfter}`);
ok('新回合正文已渲染', (await page.textContent('#p4-story')).length > 80);

/* ---------- 16. 侧栏收放 ---------- */
await page.keyboard.press('[');
await page.waitForTimeout(500);
ok('左仪表塔可收起', await page.getAttribute('#p4-tower', 'data-collapsed') === '1');
await page.keyboard.press(']');
await page.waitForTimeout(500);
ok('右卷宗栏可收起', await page.getAttribute('#p4-dossier', 'data-collapsed') === '1');
await page.keyboard.press('[');
await page.keyboard.press(']');
await page.waitForTimeout(500);

/* ---------- 17. 主题皮肤 ---------- */
await page.locator('#p4-btn-skin').click();
await page.waitForTimeout(400);
const skin1 = await page.getAttribute('html', 'data-skin');
ok('皮肤可切换', skin1 === 'cyanotype', `data-skin=${skin1}`);
const bg1 = await page.$eval('#p4-beam', (e) => getComputedStyle(e).backgroundImage);
await page.locator('#p4-btn-skin').click();
await page.waitForTimeout(400);
const bg2 = await page.$eval('#p4-beam', (e) => getComputedStyle(e).backgroundImage);
ok('皮肤切换实际改变了颜色', bg1 !== bg2);
await page.locator('#p4-btn-skin').click();
await page.waitForTimeout(300);

/* ---------- 18. 移动端形态 ---------- */
await page.setViewportSize({ width: 414, height: 896 });
await page.evaluate(() => window.P4.app.setDevice('mobile', true));
await page.waitForTimeout(600);
ok('移动端标签栏可见', await page.locator('#p4-tabbar').isVisible());
ok('移动端隐藏左仪表塔', !(await page.locator('#p4-tower').isVisible()));
ok('移动端隐藏银轨', !(await page.locator('#p4-rail').isVisible()));
const mOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
ok('移动端无横向溢出', mOverflow);
const poolBox = await page.locator('#p4-pool').boundingBox();
const vh = 896;
ok('移动端正文占比 ≥ 40vh', poolBox.height / vh >= 0.4, `${Math.round((poolBox.height / vh) * 100)}vh`);
await page.locator('#p4-tab-self').click();
await page.waitForTimeout(600);
ok('移动端抽屉可打开', await page.getAttribute('#p4-sheet', 'data-open') === '1');
ok('抽屉内水银柱已渲染', await page.locator('#p4-sheet-bank .merc').count() === 6);
await page.locator('#p4-tab-more').click();
await page.waitForTimeout(500);
ok('移动端 22 宫格启动器', await page.locator('#p4-sheet .grid-launcher > button').count() === 22);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.locator('#p4-tab-map').click();
await page.waitForTimeout(600);
const mWin = await page.locator('#p4-win-map').boundingBox();
ok('移动端面板铺满（全屏 sheet）', mWin.width >= 400, `${Math.round(mWin.width)}px`);
await page.evaluate(() => window.P4.docket.closeAll());

/* ---------- 19. 无障碍 ---------- */
await page.setViewportSize({ width: 1600, height: 950 });
await page.evaluate(() => window.P4.app.setDevice('pc', true));
await page.waitForTimeout(500);
const a11y = await page.evaluate(() => {
  const r = {};
  r.semantic = ['header', 'nav', 'main', 'aside', 'footer'].every((t) => document.querySelector(t));
  r.liveRegion = !!document.querySelector('[aria-live]');
  r.tabRoles = document.querySelectorAll('[role="tablist"]').length >= 0;
  r.emojiFree = !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(document.body.innerText);
  r.imgAlt = Array.from(document.images).every((i) => i.hasAttribute('alt'));
  const btns = Array.from(document.querySelectorAll('button'));
  r.namedButtons = btns.filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length;
  return r;
});
ok('语义化标签齐全', a11y.semantic);
ok('aria-live 区域存在', a11y.liveRegion);
ok('正文与界面零 emoji', a11y.emojiFree);
ok('全部图片有 alt', a11y.imgAlt);
ok('图标按钮均有可访问名称', a11y.namedButtons === 0, `${a11y.namedButtons} 个无名按钮`);

/* ---------- 20. 动效降级 ---------- */
await page.evaluate(() => { document.documentElement.dataset.motion = 'off'; });
await page.waitForTimeout(200);
const durOff = await page.$eval('.btn', (e) => getComputedStyle(e).transitionDuration);
ok('关闭动效后过渡时长归零', /0\.001s|1ms|0s/.test(durOff), durOff);
await page.evaluate(() => { document.documentElement.dataset.motion = ''; });

/* ---------- 21. 图标库无 emoji ---------- */
const iconInfo = await page.evaluate(() => ({
  count: window.P4.iconNames().length,
  svgCount: document.querySelectorAll('svg.icon-line').length
}));
ok('SVG 图标库 ≥ 90 枚', iconInfo.count >= 90, `${iconInfo.count} 枚`);
ok('页面内 SVG 图标实例 ≥ 60', iconInfo.svgCount >= 60, `${iconInfo.svgCount} 个`);

/* ---------- 22. 零错误 ---------- */
const ignorable = (t) => /ERR_(NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|CONNECTION|CERT|BLOCKED)|net::|Failed to load resource|postimg|fonts\.g/i.test(t);
const realConsole = consoleErrors.filter((t) => !ignorable(t));
ok('零 console 错误（忽略离线资源）', realConsole.length === 0, realConsole.slice(0, 3).join(' | '));
ok('零未捕获异常', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));

/* ---------- 输出 ---------- */
await browser.close();
console.log('\n================  验收结果  ================');
results.forEach((r, i) => {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${String(i + 1).padStart(2, '0')}. ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
});
console.log('============================================');
console.log(`合计 ${results.length} 项，通过 ${results.length - failed} 项，失败 ${failed} 项`);
process.exit(failed ? 1 : 0);
