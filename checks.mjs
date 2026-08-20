/* ===========================================================
   checks.mjs —— DOM 级自动化验收（Playwright）
   含「控件预算闸门」：超预算即 FAIL，防止减法之后再长回来
   =========================================================== */
import { chromium } from '../p1-demo/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = pathToFileURL(path.resolve('index.html')).href;
const BUDGET = { pc: 22, mobile: 12, tinyTargets: 0, entryChannels: 1 };
const results = [];
let failed = 0;
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); if (!pass) failed++; };

/* 页面内：统计「实际可见」的控件，并区分 chrome 与内容内交互 */
const COUNT = `
(() => {
  function visible(el) {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.05) return null;
    let a = el.parentElement;
    while (a && a !== document.documentElement) {
      const as = getComputedStyle(a);
      if (as.visibility === 'hidden' || as.display === 'none' || Number(as.opacity) < 0.05 || a.hasAttribute('hidden')) return null;
      a = a.parentElement;
    }
    let r = el.getBoundingClientRect();
    let t = r.top, l = r.left, ri = r.right, b = r.bottom;
    let n = el.parentElement;
    while (n && n !== document.documentElement) {
      const ns = getComputedStyle(n);
      if (/hidden|auto|scroll/.test(ns.overflowY) || /hidden|auto|scroll/.test(ns.overflowX)) {
        const nr = n.getBoundingClientRect();
        t = Math.max(t, nr.top); l = Math.max(l, nr.left);
        ri = Math.min(ri, nr.right); b = Math.min(b, nr.bottom);
      }
      n = n.parentElement;
    }
    if (ri - l < 4 || b - t < 4) return null;
    if (ri < 0 || b < 0 || l > innerWidth || t > innerHeight) return null;
    return { w: ri - l, h: b - t };
  }
  const SEL = 'button, a[href], input, select, textarea, [role="button"], [role="tab"]';
  /* 瞬时浮层（小样/漏光/计时器/速记卡）不计入首屏控件预算 */
  const TRANSIENT = '#p5-toasts, #p5-leak-note, #p5-timer-scrim, #p5-loupe-note, #p5-slash, #p5-turnmenu';
  const all = Array.from(document.querySelectorAll(SEL)).filter((el) => !el.closest(TRANSIENT));
  const chrome = [], content = [];
  all.forEach((el) => {
    const r = visible(el);
    if (!r) return;
    const rec = {
      id: el.id || '',
      cls: String(el.className || '').split(' ')[0],
      txt: (el.textContent || '').replace(/\\s+/g, '').slice(0, 12),
      label: el.getAttribute('aria-label') || el.getAttribute('title') || '',
      w: Math.round(r.w), h: Math.round(r.h)
    };
    if (el.classList.contains('mind')) content.push(rec); else chrome.push(rec);
  });
  return {
    chrome, content,
    tiny: chrome.filter((c) => c.w < 44 || c.h < 44),
    unnamed: chrome.filter((c) => !c.txt && !c.label).length,
    viewport: innerWidth + 'x' + innerHeight
  };
})()
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const consoleErrors = [], pageErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => pageErrors.push(String(e)));

await page.goto(FILE, { waitUntil: 'load' });
await page.waitForTimeout(700);

/* ---------- 1. 开场（显影盘） ---------- */
ok('开场层存在', await page.locator('#p5-open').count() === 1);
ok('显影盘 + 相纸就位', await page.locator('#p5-open .tray .tray__sheet').count() === 1);
ok('快门叶片 5 片', await page.locator('#p5-shutter .blade').count() === 5);
await page.waitForFunction(
  () => Number(getComputedStyle(document.querySelector('#p5-open .open__title span:last-child')).opacity) > 0.98,
  null, { timeout: 6000 }
).catch(() => {});
const openState = await page.evaluate(() => {
  const sp = Array.from(document.querySelectorAll('#p5-open .open__title span'));
  const blade = document.querySelector('#p5-shutter .blade');
  const t = getComputedStyle(blade).transform;
  return {
    chars: sp.length,
    minOp: Math.min.apply(null, sp.map((s) => Number(getComputedStyle(s).opacity))),
    bladeClosed: !(t === 'none' || /matrix\(0, 0, 0, 0/.test(t) || /scale\(0\)/.test(t))
  };
});
ok('标题「诡秘剧场」逐字显影', openState.chars === 4, `${openState.chars} 字`);
ok('开场标题完全可见（快门未遮挡）', openState.minOp > 0.98, `opacity=${openState.minOp.toFixed(2)}`);

await page.locator('#p5-open').click();
await page.waitForTimeout(1400);
ok('开场已让位', await page.getAttribute('#p5-open', 'data-phase') === 'gone');

/* ---------- 2. 登录页 ---------- */
ok('登录页已显示', await page.locator('#p5-gate').isVisible());
ok('登录页入口 ≥5', await page.locator('#p5-gate .gate-act').count() >= 5);
ok('登录页背景层存在', await page.locator('#p5-gate-scene .scene-layer').count() === 1);
const quote = await page.textContent('#p5-gate .gate__quote .zh');
ok('登录页题词换行渲染', quote.includes('\n'), JSON.stringify(quote.slice(0, 12)));

/* ---------- 3. 进入主界面 ---------- */
await page.locator('#p5-gate-act-0').click();
await page.waitForTimeout(2600);
ok('主界面已激活', (await page.getAttribute('#p5-app', 'class') || '').includes('is-live'));
ok('安全灯就位', await page.locator('#p5-beam .safelamp').count() === 1);
ok('管线四灯（只读）', await page.locator('#p5-beam .lamp').count() === 4);
ok('六维显影量筒 = 6', await page.locator('#p5-cyl-bank .cyl').count() === 6);
ok('量筒带 role=meter', await page.locator('#p5-cyl-bank .cyl[role="meter"]').count() === 6);
ok('相纸正文存在', await page.locator('#p5-print.photo-print').count() === 1);
ok('银盐显影字符已生成', await page.locator('#p5-story .dev-char').count() > 200);

/* ---------- 4. 控件预算闸门（PC） ---------- */
await page.locator('#p5-print').click({ position: { x: 12, y: 8 } });
await page.waitForTimeout(300);
const pc = await page.evaluate(COUNT);
ok(`PC 首屏 chrome 控件 ≤ ${BUDGET.pc}`, pc.chrome.length <= BUDGET.pc,
  `实测 ${pc.chrome.length} 个（内容内交互另计 ${pc.content.length}）`);
ok('晒片绳行动相片 = 4', await page.locator('#p5-pins .pin-photo').count() === 4);
ok('图标控件均有可访问名称', pc.unnamed === 0, `${pc.unnamed} 个无名`);

/* 单一入口断言：没有侧栏图标轨道 / 速取矩阵 / 常驻指令行 */
const noRedundant = await page.evaluate(() => ({
  rails: document.querySelectorAll('.rail-btn, .tower__rail, .dossier__rail').length,
  fan: document.querySelectorAll('.card-fan, .fan-card').length,
  chips: document.querySelectorAll('.composer__quick .chip').length,
  dockOpenChips: document.querySelectorAll('[id^="p5-dockopen-"]').length
}));
ok('无侧栏图标轨道', noRedundant.rails === 0, JSON.stringify(noRedundant));
ok('无卷宗速取矩阵', noRedundant.fan === 0);
ok('无常驻指令 chip 行', noRedundant.chips === 0);
ok('工作台不重复列出已开窗口', noRedundant.dockOpenChips === 0);

/* 最坏情形：把相纸滚到底，让 4 张行动相片同时可见后再测一次 */
await page.evaluate(() => { const s = document.getElementById('p5-print-scroll'); s.scrollTop = s.scrollHeight; });
await page.waitForTimeout(400);
const pcWorst = await page.evaluate(COUNT);
ok(`PC 最坏情形（含 4 张行动相片）≤ ${BUDGET.pc}`, pcWorst.chrome.length <= BUDGET.pc,
  `实测 ${pcWorst.chrome.length} 个`);
await page.evaluate(() => { document.getElementById('p5-print-scroll').scrollTop = 0; });
await page.waitForTimeout(300);

/* 面板入口通道数：首屏能打开面板的控件应只有「样张」1 个 */
const entries = await page.evaluate(() => {
  const ids = ['p5-btn-sheet'];
  const extra = Array.from(document.querySelectorAll('#p5-trough [id^="p5-frame-"], #p5-wall [id^="p5-frame-"]')).length;
  return { declared: ids.filter((i) => document.getElementById(i)).length, strayFrames: extra };
});
ok(`通向面板的常驻通道 = ${BUDGET.entryChannels}`, entries.declared === 1 && entries.strayFrames === 0,
  `样张钮 ${entries.declared} · 散落格 ${entries.strayFrames}`);

/* ---------- 5. 无横向溢出 / ID 唯一 ---------- */
const dupIds = await page.evaluate(() => {
  const seen = new Set(), dup = [];
  document.querySelectorAll('[id]').forEach((el) => { if (seen.has(el.id)) dup.push(el.id); else seen.add(el.id); });
  return dup;
});
ok('全站 ID 唯一', dupIds.length === 0, dupIds.join(','));
ok('无横向溢出', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));

/* ---------- 6. 三态循环（一个钮走完三态） ---------- */
const boxes = {};
for (const m of ['read', 'explore', 'strip']) {
  await page.locator('#p5-btn-mode').click();
  await page.waitForTimeout(620);
  const cur = await page.getAttribute('#p5-stage', 'data-mode');
  boxes[cur] = await page.locator('#p5-print').boundingBox();
  ok(`三态循环钮 → ${cur}`, cur === m, `data-mode=${cur}`);
}
ok('阅读态显著大于窄条态', boxes.read.height > boxes.strip.height * 1.4,
  `strip=${Math.round(boxes.strip.height)} read=${Math.round(boxes.read.height)}`);
ok('探索态相纸缩为一角', boxes.explore.height < 60 && boxes.explore.width < 300,
  `${Math.round(boxes.explore.width)}x${Math.round(boxes.explore.height)}`);

/* ---------- 7. 探索热区（放大镜圈） ---------- */
await page.keyboard.press('3');
await page.waitForTimeout(500);
ok('放大镜热区 = 5', await page.locator('#p5-loupes .loupe').count() === 5);
await page.locator('#p5-loupe-0').click();
await page.waitForTimeout(400);
ok('现场速记卡浮出', await page.locator('#p5-loupe-note').count() === 1);
await page.locator('#p5-loupe-note .icon-btn').click();
await page.keyboard.press('1');
await page.waitForTimeout(500);

/* ---------- 8. 接触印相样张（唯一入口） ---------- */
await page.keyboard.press('`');
await page.waitForTimeout(800);
ok('样张已取来', await page.getAttribute('#p5-contact', 'data-open') === '1');
ok('底片 = 24 格', await page.locator('#p5-sheet-paper .sheet-frame').count() === 24);
const segs = await page.evaluate(() => ({
  story: document.querySelectorAll('.sheet-frame[data-seg="story"]').length,
  play: document.querySelectorAll('.sheet-frame[data-seg="play"]').length,
  sys: document.querySelectorAll('.sheet-frame[data-seg="sys"]').length
}));
ok('三段分区 6 / 9 / 9', segs.story === 6 && segs.play === 9 && segs.sys === 9, JSON.stringify(segs));
await page.locator('#p5-frame-divination').hover();
await page.waitForTimeout(250);
ok('悬停格显示说明', (await page.textContent('#p5-sheet-desc')).includes('占卜间'));
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(200);
ok('方向键可在样张上游走', await page.locator('.sheet-frame.is-cursor').count() === 1);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
ok('Esc 收起样张', await page.getAttribute('#p5-contact', 'data-open') === '0');

/* ---------- 9. 24 个面板逐个投影 ---------- */
const keys = await page.evaluate(() => window.P5.sheet.frames.map((f) => f.key));
ok('面板注册表 = 24', keys.length === 24, `${keys.length}`);
for (const k of keys) {
  await page.evaluate((kk) => window.P5.sheet.open(kk), k);
  await page.waitForTimeout(230);
  const has = await page.locator(`#p5-proj-${k}`).count();
  const info = await page.evaluate((kk) => {
    const b = document.getElementById('p5-body-' + kk);
    return b ? { len: b.textContent.trim().length, bad: /投影失败|还没有印出内容/.test(b.textContent) } : { len: -1, bad: true };
  }, k);
  ok(`N° 面板「${k}」投影且有内容`, has === 1 && info.len > 120 && !info.bad, `len=${info.len}`);
  await page.evaluate((kk) => window.P5.sheet.close(kk), k);
  await page.waitForTimeout(240);
}
await page.waitForTimeout(300);
ok('全部投影已关灯', await page.locator('#p5-enlarger .proj').count() === 0);

/* ---------- 10. 多窗口：并排 / 收回 / 钉住 ---------- */
await page.evaluate(() => { window.P5.sheet.open('map'); window.P5.sheet.open('codex'); });
await page.waitForTimeout(450);
ok('可同时投影 2 台', await page.locator('#p5-enlarger .proj').count() === 2);
const b1 = await page.locator('#p5-proj-map').boundingBox();
await page.locator('#p5-proj-half-map').click();
await page.waitForTimeout(500);
const b2 = await page.locator('#p5-proj-map').boundingBox();
ok('并排吸附改变几何', Math.abs(b2.height - b1.height) > 20 || Math.abs(b2.x - b1.x) > 20,
  `${Math.round(b1.width)}x${Math.round(b1.height)} → ${Math.round(b2.width)}x${Math.round(b2.height)}`);
await page.locator('#p5-proj-min-map').click();
await page.waitForTimeout(350);
ok('收回后进工作台底片夹', await page.locator('#p5-dockmin-map').count() === 1);
await page.locator('#p5-dockmin-map').click();
await page.waitForTimeout(350);
ok('从工作台取回', await page.locator('#p5-proj-map').isVisible());
await page.locator('#p5-proj-pin-map').click();
await page.waitForTimeout(200);
ok('钉住状态已记录', await page.getAttribute('#p5-proj-map', 'data-pinned') === '1');
await page.evaluate(() => window.P5.sheet.closeAll());
await page.waitForTimeout(400);

/* ---------- 11. 内部通知：小样 / 计时器 / 漏光 ---------- */
await page.evaluate(() => {
  window.P5.notify.ok('验收 · 定影完成', '这是内部显影小样，不是浏览器弹窗。');
  window.P5.notify.warn('验收 · 警示', '朱砂红仅用于危险。');
  window.P5.notify.cyan('验收 · 旁听', '蓝晒蓝仅用于信息与结构。');
});
await page.waitForTimeout(400);
ok('小样可堆叠 ≥3', await page.locator('#p5-toasts .toast').count() >= 3);
const passThrough = await page.evaluate(() => getComputedStyle(document.querySelector('.toast')).pointerEvents);
ok('小样整体点击穿透（不遮挡底层控件）', passThrough === 'none', passThrough);
await page.evaluate(() => { window.__cr = null; window.P5.notify.confirm({ title: '验收确认框', msg: '这是显影计时器确认框。' }).then((v) => { window.__cr = v; }); });
await page.waitForTimeout(500);
ok('显影计时器已打开', await page.getAttribute('#p5-timer-scrim', 'data-open') === '1');
ok('确认框 role=dialog + aria-modal', await page.locator('#p5-timer-scrim [role="dialog"][aria-modal="true"]').count() === 1);
await page.keyboard.press('Escape');
await page.waitForTimeout(450);
ok('Esc 关闭并返回 false', await page.evaluate(() => window.__cr) === false);
await page.evaluate(() => window.P5.notify.leak('验收 · 漏光警示：安全灯抖动 + 四边漏光，不弹红框。'));
await page.waitForTimeout(400);
ok('漏光警示已触发', await page.getAttribute('#p5-leak', 'data-open') === '1');
await page.evaluate(() => window.P5.notify.hideLeak());

/* ---------- 12. 读心：三步规则 ---------- */
const sp0 = await page.evaluate(() => window.P5.data.attrs.find((a) => a.key === 'spirit').cur);
await page.locator('#p5-story .mind').first().click();
await page.waitForTimeout(500);
const sp1 = await page.evaluate(() => window.P5.data.attrs.find((a) => a.key === 'spirit').cur);
ok('读心消耗 1 点灵性', sp1 === sp0 - 1, `${sp0} → ${sp1}`);
ok('心声批注已浮出（手写体）', await page.locator('#p5-story .whisper').count() >= 1);
await page.evaluate(() => { window.__t = []; const o = window.P5.notify.warn; window.P5.notify.warn = (t, m) => { window.__t.push(t); return o(t, m); }; });
await page.locator('#p5-neg-MH').click();
await page.waitForTimeout(300);
ok('隔层者按规则拒绝旁听（非模型硬演）', (await page.evaluate(() => window.__t)).some((t) => t.indexOf('旁听不到') === 0));

/* ---------- 13. 「/」指令自动完成（替代常驻 chip 行） ---------- */
await page.locator('#p5-input').click();
await page.keyboard.type('/');
await page.waitForTimeout(300);
ok('打「/」浮出指令补全', await page.locator('#p5-slash .slash-item').count() >= 8);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Tab');
await page.waitForTimeout(250);
const iv = await page.inputValue('#p5-input');
ok('Tab 补全写入输入框', /^\/\S+\s$/.test(iv), JSON.stringify(iv));
await page.evaluate(() => { document.getElementById('p5-input').value = ''; });
await page.keyboard.press('Escape');

/* ---------- 14. 回合菜单（收 4 个低频操作） ---------- */
await page.locator('#p5-btn-turn').click();
await page.waitForTimeout(300);
ok('回合菜单展开 4 项', await page.locator('#p5-turnmenu .menu-item').count() === 4);
await page.keyboard.press('Escape');
await page.waitForTimeout(250);
ok('Esc 收起回合菜单', await page.evaluate(() => document.getElementById('p5-turnmenu').hidden));

/* ---------- 15. 回合推进 ---------- */
const r0 = await page.textContent('#p5-round');
await page.locator('#p5-pin-1').click();
await page.waitForTimeout(900);
ok('行动推进回合', Number(await page.textContent('#p5-round')) === Number(r0) + 1, `${r0} → ${await page.textContent('#p5-round')}`);

/* ---------- 16. 侧栏脊标收放 ---------- */
await page.keyboard.press('[');
await page.waitForTimeout(500);
ok('显影槽可收成脊标', await page.getAttribute('#p5-trough', 'data-collapsed') === '1');
await page.keyboard.press(']');
await page.waitForTimeout(500);
ok('相片墙可收成脊标', await page.getAttribute('#p5-wall', 'data-collapsed') === '1');
await page.keyboard.press('[');
await page.keyboard.press(']');
await page.waitForTimeout(500);

/* ---------- 17. 皮肤（承袭 P3 三套） ---------- */
await page.locator('#p5-btn-skin').click();
await page.waitForTimeout(400);
ok('皮肤可切换到蓝晒工房', await page.getAttribute('html', 'data-skin') === 'cyanotype');
const bg1 = await page.$eval('#p5-beam', (e) => getComputedStyle(e).backgroundImage);
await page.locator('#p5-btn-skin').click();
await page.waitForTimeout(400);
ok('皮肤切换实际改色', bg1 !== await page.$eval('#p5-beam', (e) => getComputedStyle(e).backgroundImage));
await page.locator('#p5-btn-skin').click();
await page.waitForTimeout(300);

/* ---------- 18. 控件预算闸门（移动端） ---------- */
await page.setViewportSize({ width: 414, height: 896 });
await page.evaluate(() => window.P5.app.setDevice('mobile', true));
await page.waitForTimeout(700);
const mb = await page.evaluate(COUNT);
ok(`移动端首屏 chrome 控件 ≤ ${BUDGET.mobile}`, mb.chrome.length <= BUDGET.mobile,
  `实测 ${mb.chrome.length} 个 → ${mb.chrome.map((c) => c.id || c.cls).join(',')}`);
ok(`移动端 < 44px 触控目标 = ${BUDGET.tinyTargets}`, mb.tiny.length === BUDGET.tinyTargets,
  mb.tiny.length ? mb.tiny.map((c) => `${c.id || c.cls}(${c.w}x${c.h})`).join(' ') : '全部达标');
ok('移动端底部三标签', await page.locator('#p5-tabbar .tabbar-btn').count() === 3);
ok('移动端隐藏两侧栏', !(await page.locator('#p5-trough').isVisible()) && !(await page.locator('#p5-wall').isVisible()));
ok('移动端无横向溢出', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
const pb = await page.locator('#p5-print').boundingBox();
ok('移动端正文占比 ≥ 48vh', pb.height / 896 >= 0.48, `${Math.round((pb.height / 896) * 100)}vh`);
await page.locator('#p5-tab-trough').click();
await page.waitForTimeout(600);
ok('移动端抽屉可打开', await page.getAttribute('#p5-drawer', 'data-open') === '1');
ok('抽屉内量筒已渲染', await page.locator('#p5-drawer-bank .cyl').count() === 6);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.locator('#p5-tab-sheet').click();
await page.waitForTimeout(700);
ok('移动端样张同为唯一入口', await page.getAttribute('#p5-contact', 'data-open') === '1');
ok('移动端样张 24 格触控达标', (await page.evaluate(() => {
  const f = Array.from(document.querySelectorAll('.sheet-frame'));
  return f.length === 24 && f.every((x) => x.getBoundingClientRect().height >= 44);
})));
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
/* 移动端最坏情形：相纸滚到底，4 张行动相片同时可见 */
await page.evaluate(() => { const s = document.getElementById('p5-print-scroll'); s.scrollTop = s.scrollHeight; });
await page.waitForTimeout(400);
const mbWorst = await page.evaluate(COUNT);
ok(`移动端最坏情形（含 4 张行动相片）≤ ${BUDGET.mobile}`, mbWorst.chrome.length <= BUDGET.mobile,
  `实测 ${mbWorst.chrome.length} 个`);
ok('移动端最坏情形下仍无小触控目标', mbWorst.tiny.length === 0,
  mbWorst.tiny.map((c) => `${c.id || c.cls}(${c.w}x${c.h})`).join(' '));

/* ---------- 19. 无障碍 ---------- */
await page.setViewportSize({ width: 1600, height: 950 });
await page.evaluate(() => window.P5.app.setDevice('pc', true));
await page.waitForTimeout(500);
const a11y = await page.evaluate(() => ({
  semantic: ['header', 'nav', 'main', 'aside', 'footer'].every((t) => document.querySelector(t)),
  live: !!document.querySelector('[aria-live]'),
  emojiFree: !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(document.body.innerText),
  imgAlt: Array.from(document.images).every((i) => i.hasAttribute('alt'))
}));
ok('语义化标签齐全', a11y.semantic);
ok('aria-live 区域存在', a11y.live);
ok('界面零 emoji', a11y.emojiFree);
ok('全部图片有 alt', a11y.imgAlt);
await page.evaluate(() => { document.documentElement.dataset.motion = 'off'; });
await page.waitForTimeout(200);
ok('关闭动效后过渡归零', /0\.001s|1ms|0s/.test(await page.$eval('.btn', (e) => getComputedStyle(e).transitionDuration)));
await page.evaluate(() => { document.documentElement.dataset.motion = ''; });

/* ---------- 20. 图标 / 零错误 ---------- */
const iconInfo = await page.evaluate(() => ({ lib: window.P5.iconNames().length, inst: document.querySelectorAll('svg.icon-line').length }));
ok('SVG 图标库 ≥ 90 枚', iconInfo.lib >= 90, `${iconInfo.lib} 枚`);
ok('页面内图标实例 ≥ 40', iconInfo.inst >= 40, `${iconInfo.inst} 个`);
const ignorable = (t) => /ERR_(NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|CONNECTION|CERT|BLOCKED)|net::|Failed to load resource|postimg|fonts\.g/i.test(t);
const realErr = consoleErrors.filter((t) => !ignorable(t));
ok('零 console 错误（忽略离线资源）', realErr.length === 0, realErr.slice(0, 3).join(' | '));
ok('零未捕获异常', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));

await browser.close();
console.log('\n================  原型5 验收结果  ================');
results.forEach((r, i) => {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${String(i + 1).padStart(2, '0')}. ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
});
console.log('==================================================');
console.log(`合计 ${results.length} 项，通过 ${results.length - failed} 项，失败 ${failed} 项`);
console.log(`控件预算：PC ${pc.chrome.length}（最坏 ${pcWorst.chrome.length}）/${BUDGET.pc} · 移动端 ${mb.chrome.length}（最坏 ${mbWorst.chrome.length}）/${BUDGET.mobile} · 小目标 ${mbWorst.tiny.length}/${BUDGET.tinyTargets}`);
process.exit(failed ? 1 : 0);
