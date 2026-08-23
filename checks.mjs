/* 诡秘剧场 · 原型3「灵异显影室」—— DOM 级自动化验收
   零构建静态页，file:// 直开。  node checks.mjs  */
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('I:/AI/agent/DSH/airp-remake/p1-demo/node_modules/playwright');

const HERE = dirname(fileURLToPath(import.meta.url));
const URL = pathToFileURL(join(HERE, 'index.html')).href;

let pass = 0, fail = 0;
const failures = [];
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; failures.push(name + (extra ? ' → ' + extra : '')); console.log('  FAIL  ' + name + (extra ? '  → ' + extra : '')); }
};
const sec = (t) => console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 56 - t.length)));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1680, height: 980 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 200)));

await page.goto(URL);
await page.waitForTimeout(2200);

/* ============================================================ */
sec('1. 加载与开场');
ok('零 console / page 错误', errors.length === 0, errors.join(' | '));
ok('开场显影盘可见', await page.evaluate(() => document.getElementById('p3-opening').classList.contains('is-active')));
ok('标题已显影出文字', await page.evaluate(() => (document.getElementById('p3-open-title').textContent || '').trim() === '诡秘剧场'));
ok('SVG 图标精灵已挂载', await page.evaluate(() => !!document.getElementById('p3-sprite') && document.querySelectorAll('#p3-sprite symbol').length > 60));
ok('图标数 ≥ 80 枚', await page.evaluate(() => window.ICONS.names.length >= 80), await page.evaluate(() => String(window.ICONS.names.length)));

sec('2. 定影 → 登录页');
await page.click('#p3-opening');
await page.waitForSelector('#p3-login.is-active', { timeout: 8000 });
await page.waitForTimeout(1200);
ok('登录页出现', await page.evaluate(() => document.getElementById('p3-login').classList.contains('is-active')));
ok('登录主菜单 6 项', await page.evaluate(() => document.querySelectorAll('#p3-login-actions .bottle').length === 6));
ok('登录页公告 4 条', await page.evaluate(() => document.querySelectorAll('#p3-login-notice-list li').length === 4));
ok('背景层带 Ken Burns 动画', await page.evaluate(() => {
  const s = getComputedStyle(document.getElementById('p3-login-bg'));
  return /ken-burns/.test(s.animationName) && /focus-breathe/.test(s.animationName);
}));
ok('浮尘 canvas 已启动', await page.evaluate(() => {
  const c = document.getElementById('p3-login-dust');
  return c.width > 0 && c.height > 0;
}));

sec('3. 进入主界面');
await page.click('#p3-login-flame');
await page.waitForSelector('#p3-app.is-active', { timeout: 8000 });
await page.waitForTimeout(1600);
ok('主界面出现', await page.evaluate(() => document.getElementById('p3-app').classList.contains('is-active')));
ok('四区俱在（横梁/显影槽/显影台/相片墙）', await page.evaluate(() =>
  ['p3-beam', 'p3-trough', 'p3-stage', 'p3-wall', 'p3-strip'].every((id) => {
    const el = document.getElementById(id);
    return el && el.getBoundingClientRect().width > 0;
  })));
ok('底片条 24 格', await page.evaluate(() => document.querySelectorAll('#p3-frames .frame').length === 24));
ok('底片条含三段分隔', await page.evaluate(() => document.querySelectorAll('#p3-frames .frame-sep').length === 2));
ok('六维量筒 6 支且液面已注', await page.evaluate(() => {
  const t = document.querySelectorAll('#p3-troughs .trough');
  if (t.length !== 6) return false;
  return Array.prototype.every.call(t, (x) => parseFloat(x.querySelector('.fluid').style.width) > 0);
}));
ok('叙事正文已渲染段落', await page.evaluate(() => document.querySelectorAll('#p3-narr-body p').length >= 5));
ok('正文使用显影动画类', await page.evaluate(() => document.querySelectorAll('#p3-narr-body .develop').length >= 5));
ok('晾片绳选项 4 张', await page.evaluate(() => document.querySelectorAll('#p3-dryline .print').length === 4));
ok('场景热区 5 个', await page.evaluate(() => document.querySelectorAll('#p3-loupes .loupe').length === 5));
ok('思维链默认折叠', await page.evaluate(() => {
  const d = document.querySelector('#p3-narr-body details.thinking');
  return d && !d.open;
}));
ok('快捷指令 8 枚', await page.evaluate(() => document.querySelectorAll('#p3-quickcmds .qcmd').length === 8));
ok('相片墙含头条与伏笔', await page.evaluate(() => !!document.getElementById('p3-headline') && document.querySelectorAll('#p3-wall-body .thread').length === 4));
ok('显影槽含委托与任务 4 项', await page.evaluate(() => document.querySelectorAll('#p3-quests .lcard').length === 4));

/* 可读性：窄条态必须露出足够正文（曾只露一段） */
const readable = await page.evaluate(() => {
  const b = document.getElementById('p3-narr-body');
  const lh = parseFloat(getComputedStyle(b).lineHeight);
  return { lines: Math.floor(b.clientHeight / lh), h: Math.round(b.clientHeight), lh: Math.round(lh) };
});
ok('窄条态正文可读行数 ≥ 7 行（实测 ' + readable.lines + ' 行 / ' + readable.h + 'px）', readable.lines >= 7);
ok('窄条态小样并成两列（宽屏）', await page.evaluate(() => {
  const cols = getComputedStyle(document.getElementById('p3-dryline')).gridTemplateColumns.split(' ').length;
  return cols === 2;
}));
ok('正文可滚动时有下缘渐隐提示', await page.evaluate(() => {
  const b = document.getElementById('p3-narr-body');
  if (b.scrollHeight - b.clientHeight <= 6) return true;
  return b.dataset.scrollable === 'true' && /linear-gradient/.test(getComputedStyle(b).maskImage || getComputedStyle(b).webkitMaskImage || '');
}));

sec('4. 全站 ID 唯一 / 无横向溢出');
const dupIds = await page.evaluate(() => {
  const seen = new Set(), dup = [];
  document.querySelectorAll('[id]').forEach((el) => { if (seen.has(el.id)) dup.push(el.id); seen.add(el.id); });
  return dup;
});
ok('无重复 ID', dupIds.length === 0, dupIds.join(','));
ok('无横向溢出', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  await page.evaluate(() => document.documentElement.scrollWidth + ' vs ' + window.innerWidth));
ok('交互元素均可聚焦（tabindex 未被禁用）', await page.evaluate(() => {
  const b = document.querySelectorAll('button:not([disabled])');
  return b.length > 40 && !Array.prototype.some.call(b, (x) => x.getAttribute('tabindex') === '-1');
}));

sec('5. 三态切换 + 信札');
for (const [k, name] of [['read', '全屏阅读'], ['explore', '探索热区'], ['letters', '信札'], ['strip', '窄条叙事']]) {
  await page.click('#p3-mode-' + k);
  await page.waitForTimeout(420);
  ok('三态 → ' + name, await page.evaluate((kk) => document.getElementById('p3-stage').dataset.mode === kk, k));
}
await page.click('#p3-mode-explore');
await page.waitForTimeout(400);
ok('探索态热区可见', await page.evaluate(() => {
  const l = document.querySelector('#p3-loupes .loupe');
  return l && l.getBoundingClientRect().width > 10;
}));
await page.click('#p3-loupe-0');
await page.waitForTimeout(300);
ok('点击热区弹出内部 Toast', await page.evaluate(() => document.querySelectorAll('#p3-toasts .toast').length > 0));
ok('热区已标记为已看', await page.evaluate(() => document.getElementById('p3-loupe-0').dataset.seen === 'true'));
await page.click('#p3-mode-strip');
await page.waitForTimeout(400);

sec('6. 24 个面板全开全关');
const frameIds = await page.evaluate(() => Array.prototype.map.call(document.querySelectorAll('#p3-frames .frame'), (f) => f.dataset.id));
for (const id of frameIds) {
  await page.evaluate((i) => document.querySelector('.frame[data-id="' + i + '"]').click(), id);
  await page.waitForSelector('#p3-projection.is-open', { timeout: 5000 });
  await page.waitForTimeout(190);
  const info = await page.evaluate(() => {
    const p = document.getElementById('p3-projection');
    const body = p.querySelector('.proj-body');
    return {
      open: p.classList.contains('is-open'),
      title: (p.querySelector('.p-ttl') || {}).textContent || '',
      len: body.textContent.trim().length,
      overflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
      missing: /幻灯片缺片/.test(body.textContent)
    };
  });
  ok('面板 ' + id + ' 打开（' + info.title + '，内容 ' + info.len + ' 字）',
    info.open && info.len > 120 && !info.missing && info.overflow,
    info.missing ? '缺片' : (info.len <= 120 ? '内容过少' : (!info.overflow ? '横向溢出' : '')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok('面板 ' + id + ' Esc 关闭', await page.evaluate(() => !document.getElementById('p3-projection').classList.contains('is-open')));
}

sec('7. 面板内部交互抽查');
await page.evaluate(() => document.querySelector('.frame[data-id="preset"]').click());
await page.waitForTimeout(500);
ok('合成器三区俱在', await page.evaluate(() => document.querySelectorAll('#p3-zones .zone').length === 3));
ok('合成器块 ≥ 18', await page.evaluate(() => document.querySelectorAll('#p3-zones .blk').length >= 18));
ok('U 型注意力曲线已绘制', await page.evaluate(() => {
  const c = document.getElementById('p3-ucurve');
  return c && c.querySelector('svg path.u-line');
}));
ok('token 预算条已计算', await page.evaluate(() => {
  const v = document.querySelector('#p3-budget .bd-v');
  return v && Number(v.textContent) > 1000;
}));
ok('合成器 4 个标签页', await page.evaluate(() => document.querySelectorAll('#p3-projection .tabs .tab').length === 4));
await page.evaluate(() => document.querySelectorAll('#p3-projection .tabs .tab')[3].click());
await page.waitForTimeout(320);
ok('注入预览可切换并有内容', await page.evaluate(() => {
  const j = document.querySelector('#p3-projection .jsonbox');
  return j && j.textContent.length > 400;
}));
await page.keyboard.press('Escape');
await page.waitForTimeout(260);

await page.evaluate(() => document.querySelector('.frame[data-id="worldbook"]').click());
await page.waitForTimeout(460);
ok('世界书双库结构', await page.evaluate(() =>
  !!document.querySelector('.vault[data-kind="source"]') && !!document.querySelector('.vault[data-kind="void"]')));
const srcN = await page.evaluate(() => document.querySelectorAll('#p3-wb-src .wbrow').length);
ok('源堡条目 ' + srcN + ' 条', srcN >= 16);
await page.evaluate(() => document.querySelectorAll('#p3-wb-src .wbrow')[2].click());
await page.waitForTimeout(260);
ok('点选条目后编辑器有内容', await page.evaluate(() => document.querySelectorAll('#p3-wb-edit textarea, #p3-wb-edit input').length >= 5));
await page.evaluate(() => document.querySelectorAll('.dual-mid button')[0].click());
await page.waitForTimeout(300);
ok('条目可封存进历史孔隙', await page.evaluate(() => document.querySelectorAll('#p3-wb-void .wbrow').length === 1));
await page.keyboard.press('Escape');
await page.waitForTimeout(260);

await page.evaluate(() => document.querySelector('.frame[data-id="divination"]').click());
await page.waitForTimeout(420);
await page.click('#p3-div-deal');
await page.waitForTimeout(1400);
ok('塔罗摊牌并翻面', await page.evaluate(() => {
  const c = document.querySelectorAll('#p3-spread-cards .tcard');
  return c.length >= 1 && Array.prototype.some.call(c, (x) => x.classList.contains('is-open'));
}));
await page.keyboard.press('Escape');
await page.waitForTimeout(260);

await page.evaluate(() => document.querySelector('.frame[data-id="map"]').click());
await page.waitForTimeout(420);
ok('蓝晒舆图地标 14 个', await page.evaluate(() => document.querySelectorAll('.cyanotype .landmark').length === 14));
ok('当前所在地有脉冲标记', await page.evaluate(() => !!document.querySelector('.cyanotype .landmark.is-here')));
await page.keyboard.press('Escape');
await page.waitForTimeout(260);

await page.evaluate(() => document.querySelector('.frame[data-id="archive"]').click());
await page.waitForTimeout(420);
ok('节点树 7 节点', await page.evaluate(() => document.querySelectorAll('.tree .tnode').length === 7));
ok('每节点带变量快照', await page.evaluate(() => document.querySelectorAll('.tree .varsnap').length === 7));
await page.keyboard.press('Escape');
await page.waitForTimeout(260);

sec('8. 内部通知与确认框（无浏览器原生弹窗）');
let nativeDialog = false;
page.on('dialog', async (d) => { nativeDialog = true; await d.dismiss(); });
await page.click('#p3-tool-hourglass');
await page.waitForSelector('#p3-timerbox.is-open', { timeout: 4000 });
ok('确认框以显影计时器形态打开', await page.evaluate(() => document.getElementById('p3-timerbox').classList.contains('is-open')));
ok('确认框有倒数转盘', await page.evaluate(() => !!document.querySelector('#p3-timerbox .ring-fg')));
await page.keyboard.press('Escape');
await page.waitForTimeout(320);
ok('Esc 可取消确认框', await page.evaluate(() => !document.getElementById('p3-timerbox').classList.contains('is-open')));

await page.click('#p3-tool-hourglass');
await page.waitForSelector('#p3-confirm-yes', { timeout: 4000 });
await page.click('#p3-confirm-yes');
await page.waitForTimeout(420);
ok('确认后弹出成功 Toast', await page.evaluate(() => {
  const t = document.querySelectorAll('#p3-toasts .toast');
  return t.length > 0 && /11:40/.test(document.getElementById('p3-ex-time').textContent);
}));
ok('未使用任何浏览器原生弹窗', !nativeDialog);
ok('安全灯漏光警示可触发', await page.evaluate(() => {
  document.getElementById('p3-safelamp').click();
  return document.getElementById('p3-lightleak').classList.contains('is-flash');
}));

sec('9. 回合推进（显影流程）');
/* 先验「终止生成」：流式期间必须出现终止钮且可中断 */
await page.fill('#p3-input', '试探性地把手伸向那本笔记');
await page.click('#p3-send');
await page.waitForTimeout(320);
ok('流式期间出现「终止」并隐藏「发送」', await page.evaluate(() =>
  !document.getElementById('p3-abort').hidden && document.getElementById('p3-send').hidden));
ok('正文管线灯进入忙碌态', await page.evaluate(() => document.getElementById('p3-lamp-main').classList.contains('is-busy')));
await page.click('#p3-abort');
await page.waitForTimeout(420);
ok('终止后恢复发送钮', await page.evaluate(() =>
  document.getElementById('p3-abort').hidden && !document.getElementById('p3-send').hidden));
ok('终止后未推进回合（仍在第 1 回合）', await page.evaluate(() => /Round 1/.test(document.querySelector('#p3-narr-head .nh-meta').textContent)));
ok('终止后玩家输入被退回记录簿', await page.evaluate(() => document.getElementById('p3-input').value.length > 0));
await page.fill('#p3-input', '');

await page.click('#p3-opt-0');
await page.waitForTimeout(2400);
ok('回合已推进到第 2 回合', await page.evaluate(() => /Round 2/.test(document.querySelector('#p3-narr-head .nh-meta').textContent)));
ok('新回合正文已渲染', await page.evaluate(() => document.querySelectorAll('#p3-narr-body p').length >= 5));
ok('新回合选项 4 张', await page.evaluate(() => document.querySelectorAll('#p3-dryline .print').length === 4));
ok('六维数值已变化（灵性下降）', await page.evaluate(() => {
  const t = document.querySelectorAll('#p3-troughs .trough')[1];
  return /3[0-9] \/ 42/.test(t.querySelector('.tval').textContent);
}));

await page.click('#p3-mode-letters');
await page.waitForTimeout(420);
ok('信札模式含玩家与 GM 楼层', await page.evaluate(() =>
  document.querySelectorAll('#p3-letters .letter-row[data-who="me"]').length >= 1 &&
  document.querySelectorAll('#p3-letters .letter-row[data-who="gm"]').length >= 1));
ok('GM 楼层带变量快照与回溯按钮', await page.evaluate(() => {
  const v = document.querySelector('#p3-letters .letter-vars');
  return v && v.querySelector('button');
}));
await page.click('#p3-mode-strip');
await page.waitForTimeout(300);

sec('10. 轨道收放 / 主题皮肤 / 键盘');
await page.click('#p3-trough-collapse');
await page.waitForTimeout(600);
ok('显影槽收进灯箱轨道', await page.evaluate(() => {
  const g = document.getElementById('p3-grid');
  return g.dataset.trough === 'rail' && document.querySelectorAll('#p3-trough-rail .rail-btn').length === 5;
}));
ok('轨道态无横向溢出', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
await page.evaluate(() => document.querySelectorAll('#p3-trough-rail .rail-btn')[0].click());
await page.waitForTimeout(600);
ok('轨道可再展开', await page.evaluate(() => document.getElementById('p3-grid').dataset.trough === 'full'));

await page.click('#p3-wall-collapse');
await page.waitForTimeout(600);
ok('相片墙收进灯箱轨道', await page.evaluate(() => document.getElementById('p3-grid').dataset.wall === 'rail'));
await page.evaluate(() => document.querySelectorAll('#p3-wall-rail .rail-btn')[0].click());
await page.waitForTimeout(500);

const skin0 = await page.evaluate(() => document.documentElement.dataset.skin);
await page.click('#p3-skin-btn');
await page.waitForTimeout(420);
const skin1 = await page.evaluate(() => document.documentElement.dataset.skin);
ok('皮肤切换生效（' + skin0 + ' → ' + skin1 + '）', skin0 !== skin1);
ok('皮肤铭牌同步', await page.evaluate(() => document.getElementById('p3-skin-name').textContent.length > 0));
await page.click('#p3-skin-btn');
await page.waitForTimeout(320);
await page.click('#p3-skin-btn');
await page.waitForTimeout(320);
ok('皮肤可循环回默认', await page.evaluate(() => document.documentElement.dataset.skin === 'darkroom'));

await page.evaluate(() => document.getElementById('p3-input').blur());
await page.keyboard.press('m');
await page.waitForTimeout(500);
ok('键盘 M 打开舆图', await page.evaluate(() => document.getElementById('p3-projection').classList.contains('is-open')));
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.keyboard.press('2');
await page.waitForTimeout(360);
ok('键盘 2 切到全屏阅读', await page.evaluate(() => document.getElementById('p3-stage').dataset.mode === 'read'));
await page.keyboard.press('1');
await page.waitForTimeout(300);

sec('11. 管线灯与档位');
await page.click('#p3-lamp-vars');
await page.waitForTimeout(360);
ok('切到多 API 档', await page.evaluate(() => document.querySelector('.frame[data-id="api"] .fmeta').textContent === '多 API 档'));
await page.click('#p3-lamp-vars');
await page.waitForTimeout(320);
ok('切回单调用档', await page.evaluate(() => document.querySelector('.frame[data-id="api"] .fmeta').textContent === '单调用档'));

sec('12. 移动端布局');
await page.click('#p3-view-btn');
await page.waitForTimeout(700);
await page.setViewportSize({ width: 420, height: 880 });
await page.waitForTimeout(700);
ok('移动端标签栏显示', await page.evaluate(() => {
  const t = document.getElementById('p3-tabbar');
  return getComputedStyle(t).display === 'grid' && t.querySelectorAll('.tabbtn').length === 5;
}));
ok('移动端隐藏侧栏与底片条', await page.evaluate(() =>
  ['p3-trough', 'p3-wall', 'p3-strip'].every((id) => getComputedStyle(document.getElementById(id)).display === 'none')));
ok('移动端正文占比高（≥ 55vh）', await page.evaluate(() => {
  const n = document.getElementById('p3-narrative').getBoundingClientRect();
  return n.height >= window.innerHeight * 0.55;
}), await page.evaluate(() => Math.round(document.getElementById('p3-narrative').getBoundingClientRect().height) + ' / ' + window.innerHeight));
ok('移动端无横向溢出', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  await page.evaluate(() => document.documentElement.scrollWidth + ' vs ' + window.innerWidth));
/* 回归：移动端 Toast 曾横跨顶部并拦截三态切换的点击 */
await page.evaluate(() => window.UI.toast({ title: '遮挡回归测试', msg: '这条通知不得压住三态切换控件。', life: 20000 }));
await page.waitForTimeout(500);
ok('移动端 Toast 不遮挡三态切换控件', await page.evaluate(() => {
  const b = document.getElementById('p3-mode-explore').getBoundingClientRect();
  const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
  return !!hit && (hit.id === 'p3-mode-explore' || hit.closest('#p3-mode-explore'));
}), await page.evaluate(() => {
  const b = document.getElementById('p3-mode-explore').getBoundingClientRect();
  const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
  return hit ? (hit.id || hit.className || hit.tagName) : 'null';
}));
await page.click('#p3-mode-explore');
await page.waitForTimeout(420);
ok('移动端三态可正常切换', await page.evaluate(() => document.getElementById('p3-stage').dataset.mode === 'explore'));
await page.click('#p3-mode-strip');
await page.waitForTimeout(320);
await page.evaluate(() => { const t = document.getElementById('p3-toasts'); while (t.firstChild) t.removeChild(t.firstChild); });

await page.click('#p3-tab-pouch');
await page.waitForSelector('#p3-sheet.is-open', { timeout: 4000 });
await page.waitForTimeout(500);
ok('底部纸袋抽屉打开', await page.evaluate(() => document.getElementById('p3-sheet').classList.contains('is-open')));
ok('纸袋含 24 宫格', await page.evaluate(() => document.querySelectorAll('#p3-sheet .pouch-cell').length === 24));
ok('纸袋贴底且不溢出视口', await page.evaluate(() => {
  const r = document.getElementById('p3-sheet').getBoundingClientRect();
  return Math.abs(r.bottom - window.innerHeight) < 2 && r.top >= -1;
}));
await page.evaluate(() => document.querySelectorAll('#p3-sheet .pouch-cell')[1].click());
await page.waitForSelector('#p3-projection.is-open', { timeout: 5000 });
await page.waitForTimeout(500);
ok('移动端面板全屏接管', await page.evaluate(() => {
  const s = document.querySelector('.proj-screen').getBoundingClientRect();
  return s.width >= window.innerWidth - 2 && s.height >= window.innerHeight - 2;
}));
ok('移动端面板无横向溢出', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
await page.keyboard.press('Escape');
await page.waitForTimeout(320);
await page.click('#p3-tab-status');
await page.waitForTimeout(500);
ok('移动端状态抽屉可打开', await page.evaluate(() => document.getElementById('p3-sheet').classList.contains('is-open')));
await page.click('#p3-sheet-close');
await page.waitForTimeout(420);
ok('抽屉可关闭', await page.evaluate(() => !document.getElementById('p3-sheet').classList.contains('is-open')));

sec('13. 中屏自适应回流');
await page.setViewportSize({ width: 1180, height: 900 });
await page.evaluate(() => { window.APP.state.settings.view = 'auto'; window.APP.applyView('desktop', true); });
await page.waitForTimeout(700);
ok('1180px 下相片墙自动收轨', await page.evaluate(() => getComputedStyle(document.querySelector('#p3-wall .wall-full')).display === 'none'));
ok('1180px 无横向溢出', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
await page.setViewportSize({ width: 1000, height: 900 });
await page.waitForTimeout(600);
ok('1000px 下显影槽自动收轨', await page.evaluate(() => getComputedStyle(document.querySelector('#p3-trough .trough-full')).display === 'none'));
ok('1000px 无横向溢出', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

sec('14. 语义化与无障碍');
await page.setViewportSize({ width: 1680, height: 980 });
await page.waitForTimeout(500);
ok('语义标签齐备', await page.evaluate(() =>
  ['header.app-beam', 'main.app-stage', 'aside.app-trough', 'aside.app-wall', 'nav.app-strip', 'article.narrative', 'form#p3-compose']
    .every((s) => !!document.querySelector(s))));
ok('无 emoji（按码点扫描）', await page.evaluate(() => {
  const re = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F000}-\u{1F0FF}]/u;
  return !re.test(document.body.innerText);
}));
ok('图标均为内联 SVG use', await page.evaluate(() => document.querySelectorAll('svg.ico use').length > 60));
ok('所有 aside/nav 带 aria-label', await page.evaluate(() =>
  Array.prototype.every.call(document.querySelectorAll('aside,nav'), (el) => el.hasAttribute('aria-label') || el.id === 'p3-scrim')));
ok('幻灯投影具备 dialog 语义', await page.evaluate(() => {
  const p = document.getElementById('p3-projection');
  return p.getAttribute('role') === 'dialog' && p.getAttribute('aria-modal') === 'true';
}));
/* file:// 下 cssRules 常因同源策略不可读，故改为行为验证：
   模拟 prefers-reduced-motion: reduce，确认过渡时长确实被压平。 */
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.waitForTimeout(260);
ok('尊重 prefers-reduced-motion（过渡被压平）', await page.evaluate(() => {
  const d = getComputedStyle(document.querySelector('.btn')).transitionDuration;
  return parseFloat(d) < 0.02;
}), await page.evaluate(() => getComputedStyle(document.querySelector('.btn')).transitionDuration));
await page.emulateMedia({ reducedMotion: 'no-preference' });
await page.waitForTimeout(200);
ok('设置里可手动关闭动画（data-motion=off）', await page.evaluate(() => {
  document.documentElement.setAttribute('data-motion', 'off');
  const d = getComputedStyle(document.querySelector('.btn')).transitionDuration;
  document.documentElement.setAttribute('data-motion', 'on');
  return parseFloat(d) < 0.02;
}));
ok('非默认字体（未落回浏览器默认）', await page.evaluate(() => {
  const f = getComputedStyle(document.body).fontFamily;
  return /Noto Serif SC|Source Han|Songti|serif/.test(f) && !/^(Times|serif)$/.test(f.trim());
}));

sec('15. 最终错误汇总');
ok('全程零 console / page 错误', errors.length === 0, errors.slice(0, 4).join(' | '));

console.log('\n' + '='.repeat(64));
console.log('  验收结果：' + pass + ' PASS / ' + fail + ' FAIL   （共 ' + (pass + fail) + ' 项）');
if (fail) { console.log('\n  失败项：'); failures.forEach((f) => console.log('   · ' + f)); }
console.log('='.repeat(64));

await browser.close();
process.exit(fail ? 1 : 0);
