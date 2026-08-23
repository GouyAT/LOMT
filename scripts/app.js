/* ============================================================
   诡秘剧场 · 原型3 — 主壳
   开场显影 → 定影 → 登录 → 主界面 / 三态 / 移动端 / 回合推进
   ============================================================ */
(function () {
  'use strict';

  var UI = window.UI, h = UI.h, ico = UI.ico, D = window.DATA, L = window.LORE, FX = window.FX;
  var LS = 'p3.darkroom.';

  var S = {
    skin: 'darkroom',
    view: 'desktop',
    mode: 'strip',
    turn: 0,
    sceneIdx: 0,
    audio: false,
    lamps: { main: true, vars: false, stream: true, audio: false },
    settings: JSON.parse(JSON.stringify(D.SETTINGS)),
    blocks: D.BLOCKS.map(function (b) { return Object.assign({}, b); }),
    letters: [],
    seenHotspots: {}
  };

  var SKINS = [
    { k: 'darkroom', n: '显影室', d: '暖黑暗室 · 相纸 · 银盐 · 安全灯红', sw: ['#100c0d', '#d2452e', '#f1eade', '#2a6d90'] },
    { k: 'cyanotype', n: '蓝晒工房', d: '冷白日光 · 铁蓝 · 白线晒图', sw: ['#0a1219', '#4f93bd', '#e8eef1', '#1c5f85'] },
    { k: 'daguerre', n: '银版镜庭', d: '高冷银灰 · 玻璃干版 · 定影琥珀', sw: ['#101112', '#9aa7ae', '#eceef0', '#b9924e'] }
  ];

  /* ------------------------------------------------------------
     持久化
     ------------------------------------------------------------ */
  function save(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { /* noop */ } }
  function load(k, dv) {
    try { var v = localStorage.getItem(LS + k); return v === null ? dv : JSON.parse(v); } catch (e) { return dv; }
  }

  /* ------------------------------------------------------------
     皮肤
     ------------------------------------------------------------ */
  function applySkin(k, quiet) {
    var s = SKINS.filter(function (x) { return x.k === k; })[0] || SKINS[0];
    S.skin = s.k;
    S.settings.skin = s.k;
    document.documentElement.setAttribute('data-skin', s.k);
    var el = document.getElementById('p3-skin-name');
    if (el) el.textContent = s.n;
    save('skin', s.k);
    if (!quiet) {
      UI.toast({ title: '皮肤已切换：' + s.n, msg: s.d, tone: 'info', icon: 'skin' });
      FX.play('slide');
    }
  }

  function cycleSkin() {
    var i = 0;
    for (var n = 0; n < SKINS.length; n++) if (SKINS[n].k === S.skin) i = n;
    applySkin(SKINS[(i + 1) % SKINS.length].k);
  }

  /* ------------------------------------------------------------
     视图（PC / 移动）
     ------------------------------------------------------------ */
  function applyView(v, quiet) {
    S.view = v;
    document.body.setAttribute('data-view', v);
    save('view', v);
    var b = document.getElementById('p3-view-btn');
    if (b) {
      UI.clear(b);
      b.appendChild(ico(v === 'mobile' ? 'device' : 'desktop', 'ico ico--sm'));
      b.appendChild(h('span', { text: v === 'mobile' ? '移动端' : 'PC 端' }));
      b.title = '切换为' + (v === 'mobile' ? 'PC 端' : '移动端') + '布局';
    }
    if (!quiet) UI.toast({ title: '已切换到' + (v === 'mobile' ? '移动端' : 'PC 端') + '布局', msg: v === 'mobile' ? '单栏叙事 + 底部标签 + 纸袋抽屉' : '暗房横梁 + 显影槽 + 相片墙 + 底片条', tone: 'info', icon: v === 'mobile' ? 'device' : 'desktop' });
  }

  function autoView() {
    if (S.settings.view !== 'auto') return;
    applyView(window.innerWidth < 860 ? 'mobile' : 'desktop', true);
  }

  /* ------------------------------------------------------------
     场景图
     ------------------------------------------------------------ */
  function setScene(i) {
    S.sceneIdx = ((i % D.SCENES.length) + D.SCENES.length) % D.SCENES.length;
    var url = D.SCENES[S.sceneIdx];
    var el = document.getElementById('p3-scene-photo');
    if (!el) return;
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () { el.style.backgroundImage = 'url("' + url + '")'; };
    img.onerror = function () { el.style.backgroundImage = 'none'; };
    img.src = url;
  }

  function setLoginBg(i) {
    var el = document.getElementById('p3-login-bg');
    if (!el) return;
    var url = D.SCENES[i % D.SCENES.length];
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () { el.style.backgroundImage = 'url("' + url + '")'; };
    img.onerror = function () {
      el.style.background = 'radial-gradient(120% 100% at 40% 20%, #2a1f21, #0d0a0b 74%)';
    };
    img.src = url;
  }

  /* ------------------------------------------------------------
     幕一 · 开场
     ------------------------------------------------------------ */
  function bootOpening() {
    var op = document.getElementById('p3-opening');
    var ripple = document.getElementById('p3-tray-ripple');
    FX.ripples(ripple, 4);
    var iv = setInterval(function () { if (op.classList.contains('is-active')) FX.ripples(ripple, 1); else clearInterval(iv); }, 3400);

    var fired = false;
    function fix() {
      if (fired) return;
      fired = true;
      FX.play('shutter');
      FX.flash();
      var sheet = document.getElementById('p3-tray-sheet');
      sheet.classList.add('is-lift');
      setTimeout(function () { showScene('p3-login'); startLogin(); }, 780);
    }
    op.addEventListener('click', fix);
    op.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fix(); } });
  }

  function showScene(id) {
    ['p3-opening', 'p3-login', 'p3-app'].forEach(function (x) {
      var el = document.getElementById(x);
      if (el) el.classList.toggle('is-active', x === id);
    });
  }

  /* ------------------------------------------------------------
     幕二 · 登录
     ------------------------------------------------------------ */
  var loginDust = null;

  function startLogin() {
    setLoginBg(4);
    var cv = document.getElementById('p3-login-dust');
    if (cv && !loginDust) loginDust = FX.Dust(cv, { count: 52, color: 'rgba(241,234,222,', drift: 0.14 });
    if (loginDust) loginDust.start();
  }

  function buildLogin() {
    var acts = document.getElementById('p3-login-actions');
    var items = [
      { n: '开始新的旅程', d: '第五纪1349年 · 廷根市 · 占卜家开局', i: 'flame', primary: true, go: enterGame },
      { n: '继续上次的显影', d: '克莱恩·莫雷蒂 · 第 1 回合 · 06-28 07:12', i: 'play', go: enterGame },
      { n: '档案馆', d: '节点树 · 分支 · 楼层变量回溯 · 云存档', i: 'archive', go: function () { enterGame(function () { openPanel('archive'); }); } },
      { n: '世界书', d: '源堡 ⇄ 历史孔隙双库 · lorebook JSON', i: 'worldbook', go: function () { enterGame(function () { openPanel('worldbook'); }); } },
      { n: '预设', d: '预设三区装配 · U 型注意力 · token 预算', i: 'preset', go: function () { enterGame(function () { openPanel('preset'); }); } },
      { n: '设置', d: '皮肤 · 显示 · 音频 · 性能 · 协议', i: 'settings', go: function () { enterGame(function () { openPanel('settings'); }); } }
    ];
    items.forEach(function (it) {
      acts.appendChild(h('button.bottle' + (it.primary ? '.bottle--primary' : ''), {
        type: 'button', id: 'p3-login-' + it.i, onclick: function () { FX.play('drip'); it.go(); }
      },
        ico(it.i, 'ico ico--lg b-ico'),
        h('div', null, h('div.b-name', { text: it.n }), h('div.b-desc', { text: it.d })),
        ico('arrowR', 'ico ico--sm b-go')
      ));
    });

    var utils = document.getElementById('p3-login-utils');
    [
      { n: '导入酒馆预设', i: 'upload' },
      { n: '导入世界书 JSON', i: 'download' },
      { n: '素材授权与致谢', i: 'scroll' },
      { n: '兑换码', i: 'key' }
    ].forEach(function (u) {
      utils.appendChild(h('button.chip', {
        type: 'button', onclick: function () {
          UI.toast({ title: u.n, msg: '原型阶段：此入口的界面与交互已就位，尚未接入后端。', tone: 'info', icon: u.i });
        }
      }, ico(u.i, 'ico ico--sm'), h('span', { text: u.n })));
    });

    var nl = document.getElementById('p3-login-notice-list');
    [
      '原型三采用「灵异摄影暗房」隐喻：正文以显影方式浮现，面板以幻灯机投影呈现。',
      '底片条替代侧边档案列表：底部 24 格胶片，悬停即从背面点亮。',
      '完整覆盖酒馆化能力：世界书双库、预设、双 API 管线、楼层变量回溯。',
      '纯前端零后端，一切数值与文本均为演示内容。'
    ].forEach(function (t) {
      nl.appendChild(h('li', null, h('span.dot', { text: '·' }), h('span', { text: t })));
    });
  }

  /* ------------------------------------------------------------
     幕三 · 进入主界面
     ------------------------------------------------------------ */
  var built = false;

  function enterGame(after) {
    if (loginDust) loginDust.stop();
    showScene('p3-app');
    if (!built) { buildApp(); built = true; }
    var grid = document.getElementById('p3-grid');
    grid.classList.remove('is-entering');
    void grid.offsetWidth;
    grid.classList.add('is-entering');
    setTimeout(function () { grid.classList.remove('is-entering'); }, 1400);
    FX.play('slide');
    setTimeout(function () {
      UI.toast({ title: '新的旅程已建档', msg: '克莱恩·莫雷蒂 · 第一周目 · 单 API 档', tone: 'good', icon: 'check' });
    }, 700);
    if (after) setTimeout(after, 900);
  }

  /* ------------------------------------------------------------
     主界面装配
     ------------------------------------------------------------ */
  function buildApp() {
    buildBeam();
    buildTrough();
    buildStageTools();
    buildWall();
    buildStrip();
    buildTabbar();
    buildQuickCmds();
    setScene(0);
    renderTurn(0);
    bindCompose();
    bindRails();
    bindFab();
    applySettingsToDom();
  }

  /* ---- 横梁 ---- */
  function buildBeam() {
    var lamps = document.getElementById('p3-lamps');
    UI.clear(lamps);
    [
      { k: 'main', n: '正文', tip: '主 API：承担叙事' },
      { k: 'vars', n: '变量', tip: '次 API：state_update 与小总结（多 API 档启用）' },
      { k: 'stream', n: '流式', tip: '流式输出：逐段显影' },
      { k: 'audio', n: '声', tip: '暗房音效：快门 / 滴落 / 幻灯 / 铃' }
    ].forEach(function (p) {
      var b = h('button.pipelamp', {
        type: 'button', id: 'p3-lamp-' + p.k, title: p.tip,
        class: S.lamps[p.k] ? 'is-on' : '',
        onclick: function () { toggleLamp(p.k, this); }
      }, h('i.bulb'), h('span', { text: p.n }));
      lamps.appendChild(b);
    });

    var ex = document.getElementById('p3-exposure');
    UI.clear(ex);
    var t = D.TURNS[0];
    ex.appendChild(h('div.ex-item', null, h('div.ex-k', { text: 'Exposure' }), h('div.ex-v', { id: 'p3-ex-time', text: t.time.replace('第五纪', '') })));
    ex.appendChild(h('i.ex-sep'));
    ex.appendChild(h('div.ex-item', null, h('div.ex-k', { text: 'Plate' }), h('div.ex-v', { id: 'p3-ex-place', text: '廷根市 · 水仙花街 2 号' })));

    var tools = document.getElementById('p3-beam-tools');
    UI.clear(tools);
    tools.appendChild(h('button.btn.btn--sm', { type: 'button', id: 'p3-view-btn', onclick: function () { S.settings.view = 'manual'; applyView(S.view === 'mobile' ? 'desktop' : 'mobile'); } }));
    [
      { i: 'preset', t: '预设', go: function () { openPanel('preset'); } },
      { i: 'worldbook', t: '世界书', go: function () { openPanel('worldbook'); } },
      { i: 'api', t: 'API 模型', go: function () { openPanel('api'); } },
      { i: 'archive', t: '档案馆', go: function () { openPanel('archive'); } },
      { i: 'settings', t: '设置', go: function () { openPanel('settings'); } }
    ].forEach(function (x) {
      tools.appendChild(h('button.btn.btn--icon', { type: 'button', title: x.t, 'aria-label': x.t, id: 'p3-beam-' + x.i, onclick: x.go }, ico(x.i)));
    });

    document.getElementById('p3-skin-btn').addEventListener('click', cycleSkin);
    document.getElementById('p3-safelamp').addEventListener('click', function () {
      FX.leak(); FX.play('warn');
      UI.toast({ title: '安全灯抖动', msg: '这是本作的环境级警示通道：危险时整间暗房的光会漏，而不是弹一个红框。', tone: 'warn', icon: 'safelight' });
    });
    applyView(S.view, true);
  }

  function toggleLamp(k, btn) {
    S.lamps[k] = !S.lamps[k];
    btn.classList.toggle('is-on', S.lamps[k]);
    if (k === 'audio') {
      S.audio = FX.audio(S.lamps[k]);
      S.settings.audio = S.audio;
      UI.toast({ title: S.audio ? '暗房音效已开启' : '暗房音效已关闭', msg: S.audio ? 'WebAudio 合成：快门 / 药液滴落 / 幻灯推入 / 计时器铃' : '', tone: 'info', icon: S.audio ? 'volume' : 'volumeOff' });
      return;
    }
    if (k === 'vars') {
      D.PIPELINE.tier = S.lamps.vars ? 'multi' : 'single';
      UI.toast({ title: S.lamps.vars ? '已切到多 API 档' : '已回到单调用档', msg: S.lamps.vars ? '变量与小总结交由次 API 后台异步执行' : '一次阻塞调用完成正文与变量，最省 RPM', tone: 'info', icon: 'api' });
      var f = document.querySelector('.frame[data-id="api"] .fmeta');
      if (f) f.textContent = S.lamps.vars ? '多 API 档' : '单调用档';
      return;
    }
    UI.toast({ title: (k === 'main' ? '正文管线' : '流式输出') + (S.lamps[k] ? ' 已开启' : ' 已关闭'), tone: 'info', icon: 'api' });
  }

  /* ---- 显影槽 ---- */
  function buildTrough() {
    var box = document.getElementById('p3-trough-body');
    UI.clear(box);
    var C = D.CHAR;

    /* 身份 */
    box.appendChild(h('section.plate', null,
      h('div.plate-body', null,
        h('div.identity', null,
          h('figure.dryplate', null,
            h('div.glyph', { text: '克' }),
            h('figcaption.cap', { text: C.latin })
          ),
          h('div', null,
            h('div.id-name', { text: C.name }),
            h('div.id-sub', { text: C.sequence }),
            h('div.id-sub', { text: '途径：' + C.pathway + ' · ' + C.org }),
            h('div.id-tags', null,
              h('span.chip.chip--red', { text: C.promotion }),
              h('span.chip.chip--cyan', { text: C.title })
            )
          )
        ),
        h('div.microbar', { style: { 'margin-top': '12px' } },
          microRow('消化', C.digest, 'linear-gradient(90deg,var(--fixer),var(--fixer-2))'),
          microRow('失控', C.lose, 'linear-gradient(90deg,var(--safelight-3),var(--safelight-2))')
        )
      )
    ));

    /* 六维显影量筒 */
    var troughs = h('div.troughs', { id: 'p3-troughs' });
    C.stats.forEach(function (s) {
      var pct = Math.round((s.v / s.max) * 100);
      var tone = pct < 55 ? 'warn' : (s.v > s.max ? 'over' : 'ok');
      troughs.appendChild(h('div.trough', { dataset: { tone: tone }, title: s.k + ' ' + s.v + ' / ' + s.max },
        h('span.tname', { text: s.k }),
        h('div.tube', null, h('i.fluid', { style: { width: Math.min(100, pct) + '%' } })),
        h('span.tval', { text: s.v + ' / ' + s.max })
      ));
    });
    box.appendChild(h('section.plate', null,
      h('div.plate-head', null,
        ico('flask', 'ico ico--sm'),
        h('div.grow', null, h('div.ttl', { text: '六维观测' }), h('span.eyebrow', { text: 'Vital Readings' })),
        h('button.btn.btn--xs.btn--ghost', { type: 'button', id: 'p3-stat-detail', onclick: function () { openPanel('sequence'); } }, h('span', { text: '详情' }))
      ),
      h('div.plate-body', null, troughs)
    ));

    /* 特质（默认收起） */
    var tw = h('div.stack-sm');
    C.traits.forEach(function (t) {
      tw.appendChild(h('div.lcard', null,
        ico(t.k === '天赋' ? 'star' : 'eyeMystic', 'ico ico--sm lc-ico'),
        h('div', null, h('div.lc-t', { text: t.v }), h('div.lc-d', { text: t.note })),
        h('span.chip' + (t.k === '天赋' ? '.chip--gold' : '.chip--cyan'), { text: t.k })
      ));
    });
    box.appendChild(UI.fold('特质', 'Traits & Beyond', tw, false));

    /* 装备栏（默认收起） */
    var sl = h('div.slots');
    C.slots.forEach(function (s) {
      sl.appendChild(h('button.slot' + (s.filled ? '.is-filled' : '') + (s.special ? '.is-special' : ''), {
        type: 'button', title: s.k + '：' + (s.item || '空置') + (s.note ? ' · ' + s.note : ''),
        onclick: function () { openPanel('bag'); }
      }, ico(s.icon, 'ico ico--sm'), h('span.s-name', { text: s.item ? s.item.slice(0, 5) : s.k })));
    });
    box.appendChild(UI.fold('装备栏', 'Equipment · 5 + 1', h('div', null,
      sl,
      h('p.field-hint', { style: { 'margin-top': '8px' }, text: '五个通用槽位不限武器/衣物/饰品；第六槽为扮演法专用（占卜家 · 消化 34%）。' })
    ), false));

    /* 技能簿 */
    var ab = h('div.stack-sm');
    C.abilities.forEach(function (a) {
      ab.appendChild(h('button.ability', {
        type: 'button', dataset: { locked: String(a.locked) },
        onclick: function () {
          if (a.locked) { FX.leak(); UI.toast({ title: a.k + ' 尚未解锁', msg: a.d, tone: 'warn', icon: 'lock' }); return; }
          useAbility(a);
        }
      }, ico(a.icon, 'ico ico--sm ab-ico'),
        h('div', null, h('div.ab-n', { text: a.k }), h('div.ab-d', { text: a.d })),
        a.locked ? ico('lock', 'ico ico--sm') : ico('arrowR', 'ico ico--sm')));
    });
    box.appendChild(UI.fold('技能簿', 'Abilities · 占卜家途径', ab, true,
      h('span.chip', { text: '4 / 6' })));

    /* 委托与任务 */
    var qs = h('div.stack-sm', { id: 'p3-quests' });
    C.quests.forEach(function (q) {
      qs.appendChild(h('button.lcard', {
        type: 'button', title: q.k + ' · 委托人：' + q.from,
        onclick: function () {
          UI.toast({ title: q.k, msg: '委托人：' + q.from + '｜期限：' + q.due + '｜进度 ' + q.step + ' / ' + q.total + '。' + q.note, tone: q.kind === '主线' ? 'good' : 'info', icon: 'bookmark', life: 7000 });
        }
      },
        ico(q.kind === '主线' ? 'target' : (q.kind === '暗线' ? 'eyeMystic' : (q.kind === '家事' ? 'heart' : 'stamp')), 'ico ico--sm lc-ico'),
        h('div', null,
          h('div.lc-t', { text: q.k }),
          h('div.lc-d', { text: q.from + ' · 期限 ' + q.due }),
          h('div', { style: { 'margin-top': '6px' } }, UI.bar(Math.round(q.step / q.total * 100), q.kind === '主线' ? 'red' : 'silver'))),
        h('div.lc-r', null,
          h('span.chip' + (q.kind === '主线' ? '.chip--red' : (q.kind === '暗线' ? '.chip--gold' : '')), { text: q.kind }),
          h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-3xs)', color: 'var(--txt-3)' }, text: q.step + '/' + q.total }))
      ));
    });
    box.appendChild(UI.fold('委托与任务', 'Commissions', qs, true,
      h('span.chip.chip--cyan', { text: C.quests.length + ' 项' })));

    /* 钱袋 */
    var cur = h('div.stack-sm');
    D.CHAR.currency.forEach(function (c) { cur.appendChild(UI.kv(c.k, c.v)); });
    box.appendChild(UI.fold('钱袋与点数', 'Purse', cur, false));

    /* 轨道 */
    var rail = document.getElementById('p3-trough-rail');
    UI.clear(rail);
    rail.appendChild(railBtn('chevronR', '展开显影槽', function () { setRail('trough', 'full'); }));
    [
      { i: 'flask', t: '六维观测', go: function () { setRail('trough', 'full'); } },
      { i: 'eyeMystic', t: '特质', go: function () { setRail('trough', 'full'); } },
      { i: 'bag', t: '装备栏', go: function () { openPanel('bag'); } },
      { i: 'sequence', t: '技能簿', go: function () { openPanel('sequence'); } }
    ].forEach(function (x) { rail.appendChild(railBtn(x.i, x.t, x.go)); });
    rail.appendChild(h('div.rail-label', { text: '显影槽' }));
  }

  function microRow(k, v, grad) {
    return h('div.mb-row', null,
      h('span.mb-k', { text: k }),
      h('div.mb-t', null, h('i.mb-f', { style: { width: v + '%', background: grad } })),
      h('span.mb-v', { text: v + '%' })
    );
  }

  function railBtn(i, tip, go) {
    return h('button.rail-btn', { type: 'button', dataset: { tip: tip }, 'aria-label': tip, onclick: go }, ico(i, 'ico ico--sm'));
  }

  function setRail(which, state) {
    var g = document.getElementById('p3-grid');
    g.setAttribute('data-' + which, state);
    save('rail.' + which, state);
  }

  function bindRails() {
    document.getElementById('p3-trough-collapse').addEventListener('click', function () { setRail('trough', 'rail'); FX.play('clip'); });
    document.getElementById('p3-wall-collapse').addEventListener('click', function () { setRail('wall', 'rail'); FX.play('clip'); });
  }

  /* ---- 相片墙 ---- */
  function buildWall() {
    var box = document.getElementById('p3-wall-body');
    UI.clear(box);

    /* 在场人物 */
    var pres = h('div.presence');
    D.PRESENCE.forEach(function (p) {
      pres.appendChild(h('button.pcard', {
        type: 'button', title: p.n + ' · ' + p.s,
        onclick: function () { openPanel('relations'); }
      },
        h('div.neg', { style: { background: p.tint } }, h('span', { text: p.letter })),
        h('div', null, h('div.p-n', { text: p.n }), h('div.p-s', { text: p.s })),
        h('div.p-aff', null,
          h('div.aff-t', null, h('i.aff-f', { style: { width: p.aff + '%' } })),
          h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-3xs)', color: 'var(--txt-3)' }, text: p.aff })
        )
      ));
    });
    box.appendChild(h('section.plate', null,
      h('div.plate-head', null, ico('users', 'ico ico--sm'),
        h('div.grow', null, h('div.ttl', { text: '在场' }), h('span.eyebrow', { text: 'Present' }))),
      h('div.plate-body', null, pres)
    ));

    /* 今日头条 */
    var lead = L.newspaper.lead;
    box.appendChild(h('button.headline', { type: 'button', id: 'p3-headline', onclick: function () { openPanel('newspaper'); } },
      h('div.hl-mast', { text: L.newspaper.latin + ' · ' + L.newspaper.issue }),
      h('div.hl-ttl', { text: lead.title }),
      h('div.hl-deck', { text: lead.deck }),
      h('div.hl-more', null, h('span', { text: '翻开《' + L.newspaper.masthead + '》' }), ico('arrowR', 'ico ico--sm'))
    ));

    /* 活伏笔 */
    var th = h('div.stack-sm');
    D.THREADS.forEach(function (t) {
      th.appendChild(h('button.thread', { type: 'button', onclick: function () { openPanel('chronicle'); } },
        ico('hourglass', 'ico ico--sm'),
        h('div', null, h('div.th-t', { text: t.t }), h('div.th-d', { text: t.d }))
      ));
    });
    box.appendChild(h('section.plate', null,
      h('div.plate-head', null, ico('hourglass', 'ico ico--sm'),
        h('div.grow', null, h('div.ttl', { text: '活伏笔' }), h('span.eyebrow', { text: 'Live Threads' })),
        h('span.chip.chip--gold', { text: D.THREADS.length + ' / 5' })),
      h('div.plate-body', null, th)
    ));

    /* 快捷 */
    var qk = h('div', { class: 'grid-2', style: { gap: '6px' } });
    [
      { i: 'tarot', n: '占卜', go: function () { openPanel('divination'); } },
      { i: 'map', n: '世界地图', go: function () { openPanel('map'); } },
      { i: 'casefile', n: '侦探本', go: function () { openPanel('cases'); } },
      { i: 'mail', n: '邮箱', go: function () { openPanel('mail'); } }
    ].forEach(function (x) {
      qk.appendChild(h('button.btn.btn--sm', { type: 'button', onclick: x.go }, ico(x.i, 'ico ico--sm'), h('span', { text: x.n })));
    });
    box.appendChild(h('section.plate', null,
      h('div.plate-head', null, ico('grid', 'ico ico--sm'),
        h('div.grow', null, h('div.ttl', { text: '速取' }), h('span.eyebrow', { text: 'Quick Draw' }))),
      h('div.plate-body', null, qk)
    ));

    var rail = document.getElementById('p3-wall-rail');
    UI.clear(rail);
    rail.appendChild(railBtn('chevronL', '展开相片墙', function () { setRail('wall', 'full'); }));
    [
      { i: 'users', t: '在场人物', go: function () { openPanel('relations'); } },
      { i: 'newspaper', t: '廷根晚报', go: function () { openPanel('newspaper'); } },
      { i: 'hourglass', t: '活伏笔', go: function () { openPanel('chronicle'); } },
      { i: 'tarot', t: '占卜间', go: function () { openPanel('divination'); } }
    ].forEach(function (x) { rail.appendChild(railBtn(x.i, x.t, x.go)); });
    rail.appendChild(h('div.rail-label', { text: '相片墙' }));
  }

  /* ---- 舞台工具条 ---- */
  function buildStageTools() {
    var bar = document.getElementById('p3-stage-tools');
    UI.clear(bar);
    bar.appendChild(UI.seg([
      { key: 'strip', label: '窄条', icon: 'filmstrip' },
      { key: 'read', label: '阅读', icon: 'codex' },
      { key: 'explore', label: '探索', icon: 'loupe' },
      { key: 'letters', label: '信札', icon: 'mail' }
    ], S.mode, setMode, 'p3-mode'));

    bar.appendChild(h('div.st-loc', null, ico('location', 'ico ico--sm'), h('span', { id: 'p3-stage-loc', text: D.TURNS[0].place + ' · ' + D.TURNS[0].scene })));
    bar.appendChild(h('div.grow'));

    [
      { i: 'undo', t: '回溯至上一回合', go: function () { rollback(); } },
      { i: 'refresh', t: '重新生成本回合（重 Roll）', go: function () { reroll(); } },
      { i: 'variable', t: '重新演算本回合变量', go: function () { openPanel('vars'); } },
      { i: 'save', t: '快速存档', go: function () { quickSave(); } },
      { i: 'camera', t: '本回合一键生图', go: function () { openPanel('imagine'); } },
      { i: 'expand', t: '切换场景照片', go: function () { setScene(S.sceneIdx + 1); UI.toast({ title: '已更换场景底片', msg: '第 ' + (S.sceneIdx + 1) + ' / ' + D.SCENES.length + ' 张', tone: 'info', icon: 'filmstrip' }); } }
    ].forEach(function (x) {
      bar.appendChild(h('button.btn.btn--icon.btn--sm', { type: 'button', title: x.t, 'aria-label': x.t, id: 'p3-tool-' + x.i, onclick: x.go }, ico(x.i, 'ico ico--sm')));
    });
  }

  function setMode(m) {
    S.mode = m;
    document.getElementById('p3-stage').setAttribute('data-mode', m);
    setTimeout(function () { markScrollable(document.getElementById('p3-narr-body')); }, 660);
    FX.play('clip');
    var names = { strip: '窄条叙事', read: '全屏阅读', explore: '探索热区', letters: '信札列表' };
    var msgs = {
      strip: '场景底片铺满显影台，相纸条压在下缘——galgame 式窄条。',
      read: '场景底片下沉并虚化，相纸放大到全覆盖，像把放大机推近。',
      explore: '正文缩为角落接触印相，热区以放大镜圈呈现，零调用探索。',
      letters: 'tavernlike 聊天列表模式：每条回复自带变量快照，可跳楼回溯。'
    };
    UI.toast({ title: '已切换：' + names[m], msg: msgs[m], tone: 'info', icon: m === 'explore' ? 'loupe' : (m === 'letters' ? 'mail' : 'filmstrip') });
    if (m === 'letters') renderLetters();
  }

  /* ---- 底片条 ---- */
  function buildStrip() {
    var box = document.getElementById('p3-frames');
    UI.clear(box);
    var lastSeg = null;
    D.FRAMES.forEach(function (f) {
      if (lastSeg && f.seg !== lastSeg) box.appendChild(h('i.frame-sep', { 'aria-hidden': 'true' }));
      lastSeg = f.seg;
      box.appendChild(h('button.frame', {
        type: 'button', id: 'p3-frame-' + f.id, dataset: { id: f.id, badge: f.badge ? String(f.badge) : null },
        title: f.name + ' · ' + f.latin + '（' + f.seg + '段）',
        onclick: function () { openPanel(f.id); }
      },
        ico(f.icon, 'ico fico'),
        h('span.fname', { text: f.name }),
        h('span.fmeta', { text: f.meta })
      ));
    });

    var nl = document.getElementById('p3-strip-l');
    var nr = document.getElementById('p3-strip-r');
    nl.addEventListener('click', function () { box.scrollBy({ left: -420, behavior: 'smooth' }); });
    nr.addEventListener('click', function () { box.scrollBy({ left: 420, behavior: 'smooth' }); });

    /* 到头即淡出禁用，避免按钮压在最后一格上还能点 */
    function syncEnds() {
      var max = box.scrollWidth - box.clientWidth;
      nl.dataset.end = box.scrollLeft <= 2 ? 'true' : 'false';
      nr.dataset.end = box.scrollLeft >= max - 2 ? 'true' : 'false';
    }
    box.addEventListener('scroll', syncEnds, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(syncEnds).observe(box);
    syncEnds();
    setTimeout(syncEnds, 400);

    /* 拖拽滚动 */
    var down = false, x0 = 0, sl = 0;
    box.addEventListener('pointerdown', function (e) { down = true; x0 = e.clientX; sl = box.scrollLeft; });
    box.addEventListener('pointermove', function (e) { if (down) box.scrollLeft = sl - (e.clientX - x0); });
    box.addEventListener('pointerup', function () { down = false; });
    box.addEventListener('pointerleave', function () { down = false; });
  }

  /* ---- 移动端标签栏 ---- */
  function buildTabbar() {
    var bar = document.getElementById('p3-tabbar');
    UI.clear(bar);
    var tabs = [
      { k: 'stage', n: '剧场', i: 'theatre' },
      { k: 'status', n: '状态', i: 'flask' },
      { k: 'map', n: '舆图', i: 'map' },
      { k: 'pouch', n: '底片', i: 'filmstrip' },
      { k: 'more', n: '更多', i: 'more' }
    ];
    tabs.forEach(function (t) {
      bar.appendChild(h('button.tabbtn', {
        type: 'button', id: 'p3-tab-' + t.k, 'aria-pressed': t.k === 'stage' ? 'true' : 'false',
        onclick: function () {
          UI.$$('.tabbtn', bar).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
          this.setAttribute('aria-pressed', 'true');
          onMobileTab(t.k);
        }
      }, ico(t.i, 'ico'), h('span.tb-n', { text: t.n })));
    });
  }

  function onMobileTab(k) {
    if (k === 'stage') { UI.closeSheet(); return; }
    if (k === 'map') { openPanel('map'); return; }
    if (k === 'status') {
      var body = h('div.stack');
      var box = document.getElementById('p3-trough-body');
      body.appendChild(h('div', { html: box.innerHTML }));
      UI.openSheet({ title: '显影槽 · 角色状态', sub: 'Developing Bench', icon: 'tray', body: body });
      return;
    }
    if (k === 'pouch') {
      var grid = h('div.pouch-grid');
      D.FRAMES.forEach(function (f) {
        grid.appendChild(h('button.pouch-cell', { type: 'button', onclick: function () { UI.closeSheet(); setTimeout(function () { openPanel(f.id); }, 260); } },
          ico(f.icon, 'ico ico--lg'), h('span.pc-n', { text: f.name })));
      });
      UI.openSheet({ title: '底片袋 · 全部面板', sub: '24 Frames', icon: 'filmstrip', body: grid });
      return;
    }
    if (k === 'more') {
      var b2 = h('div.stack');
      b2.appendChild(h('div.sec-title', null, h('span.st-t', { text: '相片墙' }), h('i.st-line')));
      b2.appendChild(h('div', { html: document.getElementById('p3-wall-body').innerHTML }));
      b2.appendChild(h('div.sec-title', null, h('span.st-t', { text: '偏好' }), h('i.st-line')));
      var row = h('div', { class: 'row row--wrap', style: { gap: '6px' } });
      row.appendChild(h('button.btn.btn--sm', { type: 'button', onclick: cycleSkin }, ico('skin', 'ico ico--sm'), h('span', { text: '切换皮肤' })));
      row.appendChild(h('button.btn.btn--sm', { type: 'button', onclick: function () { S.settings.view = 'manual'; applyView('desktop'); UI.closeSheet(); } }, ico('desktop', 'ico ico--sm'), h('span', { text: '切回 PC 端' })));
      row.appendChild(h('button.btn.btn--sm', { type: 'button', onclick: function () { UI.closeSheet(); setTimeout(function () { openPanel('settings'); }, 260); } }, ico('settings', 'ico ico--sm'), h('span', { text: '设置' })));
      b2.appendChild(row);
      UI.openSheet({ title: '更多', sub: 'More', icon: 'more', body: b2 });
    }
  }

  /* ------------------------------------------------------------
     回合渲染
     ------------------------------------------------------------ */
  function renderTurn(i) {
    var t = D.TURNS[i] || D.TURNS[0];
    S.turn = i;

    var hd = document.getElementById('p3-narr-head');
    UI.clear(hd);
    hd.appendChild(ico('quill', 'ico ico--sm'));
    hd.appendChild(h('span.nh-ttl', { text: t.title }));
    hd.appendChild(h('span.nh-meta', { text: t.time.replace('第五纪', '') + ' · Round ' + t.n }));

    var body = document.getElementById('p3-narr-body');
    UI.clear(body);
    t.body.forEach(function (b) {
      if (b.t === 'label') { body.appendChild(h('div', null, h('span.scene-label', null, ico('location', 'ico ico--sm'), h('span', { text: b.v })))); return; }
      if (b.t === 'say') { body.appendChild(h('p', { class: 'say', text: b.v })); return; }
      if (b.t === 'em') { body.appendChild(h('p', { class: 'em', text: b.v })); return; }
      if (b.t === 'aside') { body.appendChild(h('p', { class: 'aside', text: b.v })); return; }
      body.appendChild(h('p', { text: b.v }));
    });

    if (t.thinking) {
      body.appendChild(h('details.thinking', null,
        h('summary', null, ico('chevronR', 'ico ico--sm'), h('span', { text: '幕后手记 · 思维链（点击展开）' })),
        h('div.th-body', { text: t.thinking })
      ));
    }

    FX.develop(body, ':scope > *', 88);
    markScrollable(body);

    /* 晾片绳选项 */
    var foot = document.getElementById('p3-narr-foot');
    UI.clear(foot);
    var line = h('div.dryline', { id: 'p3-dryline' });
    var R = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    t.options.forEach(function (o, n) {
      line.appendChild(h('button.print', {
        type: 'button', id: 'p3-opt-' + n,
        onclick: function () { pickOption(this, o); }
      },
        h('span.idx', { text: R[n] || String(n + 1) }),
        h('span.txt', { text: o.k }),
        h('span.go', null, ico('arrowR', 'ico ico--sm'))
      ));
    });
    foot.appendChild(line);

    /* 热区 */
    var lo = document.getElementById('p3-loupes');
    UI.clear(lo);
    t.hotspots.forEach(function (s, n) {
      var seen = !!S.seenHotspots[t.n + ':' + s.name];
      lo.appendChild(h('button.loupe', {
        type: 'button', id: 'p3-loupe-' + n, dataset: { name: s.name, seen: String(seen) },
        style: { left: s.x + '%', top: s.y + '%' },
        'aria-label': '观察' + s.name,
        onclick: function () { inspect(this, t, s); }
      }, ico(s.icon, 'ico lp-ico'), h('i.lp-halo')));
    });

    var loc = document.getElementById('p3-stage-loc');
    if (loc) loc.textContent = t.place + ' · ' + t.scene;
    var hint = document.getElementById('p3-compose-hint');
    if (hint) hint.textContent = tierLabel() + ' · 主线阻塞调用 · 变量后台异步 · Enter 发送，Shift+Enter 换行';

    setScene(t.photo || 0);
  }

  function markScrollable(el) {
    if (!el) return;
    var f = function () {
      var more = el.scrollHeight - el.clientHeight > 6 && (el.scrollHeight - el.scrollTop - el.clientHeight) > 6;
      el.dataset.scrollable = more ? 'true' : 'false';
    };
    f();
    requestAnimationFrame(f);
    setTimeout(f, 320);
    if (!el.dataset.scrollBound) {
      el.dataset.scrollBound = '1';
      el.addEventListener('scroll', f, { passive: true });
      if (window.ResizeObserver) new ResizeObserver(f).observe(el);
    }
  }

  function tierLabel() {
    var t = D.PIPELINE.tiers.filter(function (x) { return x.k === D.PIPELINE.tier; })[0];
    return t ? t.n : '单调用档';
  }

  function pickOption(btn, o) {
    FX.play('clip');
    btn.classList.add('is-drop');
    var el = document.getElementById('p3-input');
    el.value = o.k;
    el.dispatchEvent(new Event('input'));
    setTimeout(function () { btn.classList.remove('is-drop'); }, 560);
    setTimeout(advance, 340);
  }

  function inspect(btn, t, s) {
    S.seenHotspots[t.n + ':' + s.name] = true;
    btn.dataset.seen = 'true';
    FX.play('drip');
    UI.toast({ title: s.name, msg: s.note, tone: 'info', icon: 'loupe', life: 6200 });
  }

  function useAbility(a) {
    FX.play('drip');
    if (a.k === '塔罗占卜') { openPanel('divination'); return; }
    if (a.k === '灵摆寻物') { openPanel('map'); return; }
    UI.toast({ title: '已施展：' + a.k, msg: a.d + '。灵性 -2，本回合结算时写入 state_update。', tone: 'good', icon: a.icon });
    bumpStat('灵性', -2);
  }

  function bumpStat(name, delta) {
    var st = null;
    D.CHAR.stats.forEach(function (s) { if (s.k === name) st = s; });
    if (!st) return;
    st.v = Math.max(0, Math.min(st.max + 4, st.v + delta));
    var rows = UI.$$('#p3-troughs .trough');
    D.CHAR.stats.forEach(function (s, i) {
      if (!rows[i]) return;
      var pct = Math.round((s.v / s.max) * 100);
      rows[i].querySelector('.fluid').style.width = Math.min(100, pct) + '%';
      var v = rows[i].querySelector('.tval');
      v.textContent = s.v + ' / ' + s.max;
      v.classList.remove('is-bump', 'is-drop-val');
      void v.offsetWidth;
      if (s.k === name) v.classList.add(delta > 0 ? 'is-bump' : 'is-drop-val');
      rows[i].dataset.tone = pct < 55 ? 'warn' : (s.v > s.max ? 'over' : 'ok');
    });
  }

  /* ------------------------------------------------------------
     回合推进（演示：无后端，模拟流式显影）
     ------------------------------------------------------------ */
  var busy = false;
  var pending = null;

  function setBusy(on) {
    busy = on;
    var send = document.getElementById('p3-send');
    var abort = document.getElementById('p3-abort');
    var lamp = document.getElementById('p3-lamp-main');
    if (send) send.hidden = on;
    if (abort) abort.hidden = !on;
    if (lamp) { lamp.classList.toggle('is-busy', on); lamp.classList.toggle('is-on', !on && S.lamps.main); }
  }

  function abort() {
    if (!busy) return;
    if (pending) { clearTimeout(pending.timer); if (pending.node && pending.node.parentNode) pending.node.parentNode.removeChild(pending.node); }
    pending = null;
    setBusy(false);
    FX.leak(); FX.play('warn');
    UI.toast({ title: '已终止本回合的生成', msg: '相纸从显影盘里被提前捞出：正文未定影，变量未写入，玩家输入已退回记录簿。', tone: 'warn', icon: 'close', life: 6000 });
    var el = document.getElementById('p3-input');
    if (pendingText) { el.value = pendingText; el.dispatchEvent(new Event('input')); }
  }

  var pendingText = '';

  function advance() {
    if (busy) return;
    var el = document.getElementById('p3-input');
    var text = (el.value || '').trim();
    if (!text) {
      FX.leak(); FX.play('warn');
      UI.toast({ title: '曝光记录簿是空的', msg: '先写下你的行动，或点击晾片绳上的一张小样。', tone: 'warn', icon: 'quill' });
      el.focus();
      return;
    }
    pendingText = text;
    setBusy(true);
    FX.play('shutter');

    S.letters.push({ who: 'me', text: text, time: '07:12' });

    var body = document.getElementById('p3-narr-body');
    var E = window.GUIMI_ENGINE;
    var prov = (E && E.getMainProvider) ? E.getMainProvider() : null;
    if (prov) {
      /* —— 真实 API：模型流式输出到正文区（战术棋盘只是战斗工具） —— */
      var stream = h('div', { style: { 'margin-top': '14px' } },
        h('div.streaming-bar'),
        h('p', { class: 'u-mono', style: { 'font-size': 'var(--fs-2xs)', color: 'var(--ink-3)', 'margin-top': '8px' }, text: '正在显影…… 主 API 流式（真实模型）· 消息装配：预设 + 世界书注入 + 地图' })
      );
      body.appendChild(stream);
      body.scrollTop = body.scrollHeight;
      var txtNode = h('p', { style: { 'font-size': 'var(--fs-md)', 'line-height': '1.9', 'white-space': 'pre-wrap', 'margin-top': '8px' } });
      stream.appendChild(txtNode);
      el.value = '';
      el.dispatchEvent(new Event('input'));
      var t = D.TURNS[D.turn] || D.TURNS[0];
      var mapCtx = '';
      var cfg = E.getCfg && E.getCfg();
      if (cfg && cfg.MAP_DATA && cfg.MAP_DATA.landmarks) mapCtx = '（地图总览与当前空间情景）';
      var sceneName = (D.SCENES && D.SCENES[D.sceneIdx || 0] && D.SCENES[D.sceneIdx || 0].name) || '';
      var wbBlocks = E.buildInjectBlocks ? E.buildInjectBlocks({ text: ((t && t.text) || '') + ' ' + sceneName }) : [];
      var pre = (E.getActivePreset && E.getActivePreset()) || null;
      var msgs = E.buildMessages ? E.buildMessages(pre, text, mapCtx, wbBlocks) : [{ role: 'user', content: text }];
      if (E.postprocessMessages && E.loadApiConfig) msgs = E.postprocessMessages(msgs, (E.loadApiConfig().postprocess) || 'strict');
      var full = '';
      prov.streamChat(msgs, {
        onChunk: function (c) { full += c; txtNode.textContent = full; body.scrollTop = body.scrollHeight; },
        onDone: function () {
          if (stream.parentNode) stream.parentNode.removeChild(stream);
          renderLiveTurn(text, full);
          setBusy(false);
        },
        onError: function (err) {
          UI.toast({ title: '模型调用失败', msg: String((err && err.message) || err), tone: 'warn', icon: 'warning' });
          if (stream.parentNode) stream.parentNode.removeChild(stream);
          renderNextTurn(text);
          setBusy(false);
        }
      });
      return;
    }

    /* —— 演示路径（无真实 API 配置） —— */
    var stream = h('div', { style: { 'margin-top': '14px' } },
      h('div.streaming-bar'),
      h('p', { class: 'u-mono', style: { 'font-size': 'var(--fs-2xs)', color: 'var(--ink-3)', 'margin-top': '8px' }, text: '正在显影…… ' + tierLabel() + ' · 未配置主 API，使用内置演示（右上角「API 模型」可接入）' })
    );
    body.appendChild(stream);
    body.scrollTop = body.scrollHeight;

    el.value = '';
    el.dispatchEvent(new Event('input'));

    var timer = setTimeout(function () {
      if (stream.parentNode) stream.parentNode.removeChild(stream);
      pending = null;
      pendingText = '';
      renderNextTurn(text);
      setBusy(false);
    }, 1500);
    pending = { timer: timer, node: stream };
  }

  /** 真实模型回合入库 + 渲染（与演示回合同构；无选项、无伏笔热区） */
  function renderLiveTurn(playerText, aiText) {
    var t0 = D.TURNS[D.TURNS.length - 1];
    var body = aiText.split(/\n+/).map(function (l) { return { t: 'p', v: l }; });
    var t = {
      n: t0.n + 1,
      time: '第五纪1349年6月28日 星期四 07:' + String(12 + (t0.n + 1) * 8).slice(-2),
      place: t0.place, scene: t0.scene, photo: (t0.photo + 1) % D.SCENES.length,
      title: '幕后手记', thinking: '', body: body, options: [], hotspots: []
    };
    D.TURNS.push(t);
    S.letters.push({ who: 'gm', text: aiText, time: t.time.slice(-5) });
    renderTurn(D.TURNS.length - 1);
    bumpStat('理智', -1);
    bumpStat('灵性', -1);
    var ex = document.getElementById('p3-ex-time');
    if (ex) ex.textContent = t.time.replace('第五纪', '');
    UI.toast({ title: '第 ' + t.n + ' 回合已定影', msg: '真实模型流式输出 · 本轮正文已上屏', tone: 'good', icon: 'check' });
    if (S.mode === 'letters') renderLetters();
  }

  var NEXT = [
    {
      title: '幕后手记',
      thinking: '玩家碰了这具身体最私密的东西。给他一条确凿的线索（笔记上的守则），同时把「他不是第一个克莱恩」这层雾往前推一寸——但不点破。',
      body: [
        { t: 'label', v: '水仙花街 2 号 · 二层卧室 · 晨' },
        { t: 'p', v: '硬皮笔记的封面已经被摸得发亮。你翻开它，纸页发出一种干燥的、像旧钞票一样的声音。' },
        { t: 'p', v: '扉页上是一行标题：《占卜家的十二条守则》。字迹方正、克制、每一笔的收尾都往回压半分——那是你自己的字。你确信自己从没写过这几个字。' },
        { t: 'em', v: '第七条被墨水彻底涂黑了。你把纸页举向窗口，逆着雾里透进来的灰光，看见压痕：「不要在午夜之后占卜。」' },
        { t: 'p', v: '楼下的铁钩又磕了一下炉门。你听见班森把一只碟子放到桌上，很轻，像是怕吵醒谁。' },
        { t: 'say', v: '"克莱恩，"他在楼梯口停住，声音隔着一层楼板，"你昨晚……又在念那些奇怪的话了。"' }
      ],
      options: [
        { k: '问班森，我昨晚具体说了什么', tag: '追问' },
        { k: '合上笔记，装作什么都没发生', tag: '掩饰' },
        { k: '按第一条守则试着做一次最简单的占卜', tag: '冒险' },
        { k: '把第七条的压痕抄到自己手心上', tag: '记录' }
      ],
      hotspots: [
        { name: '被涂黑的第七条', x: 40, y: 56, icon: 'quill', note: '墨水层下的压痕：不要在午夜之后占卜。写这行字的人比你更怕它。' },
        { name: '扉页的字迹', x: 26, y: 44, icon: 'codex', note: '与你的笔迹完全一致，连收笔往回压半分的习惯都一样。' },
        { name: '楼梯口的班森', x: 66, y: 70, icon: 'user', note: '他不敢直接问。这说明昨晚的事，他见过不止一次。' },
        { name: '窗外的雾', x: 78, y: 30, icon: 'fog', note: '三道影子已经不在了。地上留着三行并列的湿印，一直走到街口。' }
      ]
    }
  ];

  function renderNextTurn(playerText) {
    var t0 = D.TURNS[D.TURNS.length - 1];
    var src = NEXT[0];
    var t = {
      n: t0.n + 1,
      time: '第五纪1349年6月28日 星期四 07:' + String(12 + (t0.n + 1) * 8).slice(-2),
      place: t0.place, scene: t0.scene, photo: (t0.photo + 1) % D.SCENES.length,
      title: src.title, thinking: src.thinking, body: src.body, options: src.options, hotspots: src.hotspots
    };
    D.TURNS.push(t);
    S.letters.push({ who: 'gm', text: src.body.filter(function (x) { return x.t !== 'label'; }).map(function (x) { return x.v; }).join('\n\n'), time: t.time.slice(-5), vars: { 活力: '26/30', 灵性: '36/42', 理智: '39/45', 人性: '81/90', 消化: '36%' } });

    renderTurn(D.TURNS.length - 1);
    bumpStat('理智', -1);
    bumpStat('灵性', -1);

    var ex = document.getElementById('p3-ex-time');
    if (ex) ex.textContent = t.time.replace('第五纪', '');

    UI.toast({ title: '第 ' + t.n + ' 回合已定影', msg: '变量更新 3 项 · 新增伏笔 1 条 · 已写入编年史小总结', tone: 'good', icon: 'check' });
    var f = document.querySelector('.frame[data-id="chronicle"] .fmeta');
    if (f) f.textContent = (18 + t.n - 1) + ' 条';
    if (S.mode === 'letters') renderLetters();
  }

  function renderLetters() {
    var box = document.getElementById('p3-letters');
    UI.clear(box);
    if (!S.letters.length) {
      box.appendChild(UI.empty('信札尚未开始', '这是 tavernlike 的聊天列表模式：每条回复自带一份变量快照，点击任意楼层即可回溯到当时的状态继续游玩。', 'mail'));
      return;
    }
    S.letters.forEach(function (m, i) {
      var row = h('div.letter-row', { dataset: { who: m.who } },
        h('div.letter-meta', null,
          ico(m.who === 'me' ? 'user' : 'quill', 'ico ico--sm'),
          h('span', { text: m.who === 'me' ? '克莱恩 · 楼层 ' + (i + 1) : '幕后手记 · 楼层 ' + (i + 1) }),
          h('span', { text: m.time })
        ),
        h('div.letter-bubble', { text: m.text })
      );
      if (m.vars) {
        var vs = h('div.letter-vars');
        Object.keys(m.vars).forEach(function (k) { vs.appendChild(h('span', { text: k + ' ' + m.vars[k] })); });
        vs.appendChild(h('button.chip.chip--cyan', { type: 'button', onclick: function () { openPanel('archive'); } }, h('span', { text: '回溯此楼层' })));
        row.appendChild(vs);
      }
      box.appendChild(row);
    });
    box.scrollTop = box.scrollHeight;
    FX.develop(box, ':scope > *', 60);
  }

  /* ------------------------------------------------------------
     工具动作
     ------------------------------------------------------------ */
  function rollback() {
    if (D.TURNS.length <= 1) {
      FX.leak();
      UI.toast({ title: '已在最早的回合', msg: '第 1 回合是本周目的起点，无法继续回溯。', tone: 'warn', icon: 'undo' });
      return;
    }
    UI.confirm({
      title: '回溯至上一回合',
      msg: '当前回合的正文、变量与新增伏笔都会被丢弃，回到上一节点的状态快照。',
      detail: '档案馆节点树中仍保留该分支，可随时切回。',
      icon: 'undo', okText: '回溯', cancelText: '留在此处', countdown: 12
    }).then(function (ok) {
      if (!ok) return;
      D.TURNS.pop();
      S.letters = S.letters.slice(0, Math.max(0, S.letters.length - 2));
      renderTurn(D.TURNS.length - 1);
      bumpStat('理智', 1);
      FX.play('slide');
      UI.toast({ title: '已回溯到第 ' + D.TURNS[D.TURNS.length - 1].n + ' 回合', msg: '变量快照已还原', tone: 'info', icon: 'undo' });
    });
  }

  function reroll() {
    FX.play('shutter');
    UI.toast({ title: '正在重新显影本回合', msg: '同一输入、同一上下文，重掷一次。原稿保留在档案馆分支中。', tone: 'info', icon: 'refresh' });
    var body = document.getElementById('p3-narr-body');
    FX.develop(body, ':scope > *', 70);
  }

  function quickSave() {
    FX.play('bell');
    UI.toast({ title: '已写入档案馆', msg: '节点 n-' + (D.NODES.length + 1) + ' · 含完整变量快照与世界书激活状态', tone: 'good', icon: 'save' });
  }

  /* ------------------------------------------------------------
     快捷指令 / 输入
     ------------------------------------------------------------ */
  function buildQuickCmds() {
    var box = document.getElementById('p3-quickcmds');
    UI.clear(box);
    D.QUICKCMDS.forEach(function (q) {
      box.appendChild(h('button.qcmd', {
        type: 'button', title: q.d,
        onclick: function () { runCmd(q.c); }
      }, ico('hash', 'ico ico--sm'), h('span', { text: q.c.slice(1) })));
    });
    box.appendChild(h('button.qcmd', { type: 'button', title: '回合提示词装配预览（预设 + 世界书注入 + 地图 + 玩家输入）', onclick: toggleAssemblePreview },
      ico('context', 'ico ico--sm'), h('span', { text: '装配预览' })));
  }

  function toggleAssemblePreview() {
    var host = document.getElementById('p3-assemble-prev');
    if (!host) return;
    if (host.style.display !== 'none') {
      host.style.display = 'none';
      return;
    }
    host.style.display = 'block';
    renderAssemblePreview(host);
  }

  function renderAssemblePreview(host) {
    var E = window.GUIMI_ENGINE;
    UI.clear(host);
    try {
    if (!E || !E.buildMessages) {
      host.appendChild(h('p.field-hint', { text: '引擎未就绪（p3-demo 目录执行 node build-engine.mjs 后刷新）' }));
      return;
    }
    var pre = (E.getActivePreset && E.getActivePreset()) || null;
    if (!pre) {
      var ps = E.loadPresets ? E.loadPresets() : [];
      pre = ps[0] || null;
      if (!pre) {
        host.appendChild(h('p.field-hint', { text: '尚未导入任何预设——顶栏「预设」导入酒馆 preset 后即可预览完整提示词。' }));
        return;
      }
      host.appendChild(h('p.field-hint', { text: '（未激活预设——暂用第一个预设「' + pre.name + '」；顶栏「预设」点选即启用）' }));
    }
    var t = D.TURNS && D.TURNS[D.turn];
    var sceneText = (t && t.text) || '';
    var sceneName = (D.SCENES && D.SCENES[D.sceneIdx || 0] && D.SCENES[D.sceneIdx || 0].name) || '';
    var mapCtx = '';
    var cfg = E.getCfg && E.getCfg();
    if (cfg && cfg.MAP_DATA && cfg.MAP_DATA.landmarks) mapCtx = '（地图总览与当前空间情景）';
    var wbBlocks = E.buildInjectBlocks({ text: sceneText + ' ' + sceneName });
    var msgs = E.buildMessages(pre, '【你的行动】', mapCtx, wbBlocks);
    if (E.postprocessMessages && E.loadApiConfig) msgs = E.postprocessMessages(msgs, (E.loadApiConfig().postprocess) || 'strict');
    /* 提示词本身：完整纯文本（可选中复制），限高滚动 */
    var total = 0;
    var text = msgs.map(function (m) {
      total += Math.round(String(m.content || '').length);
      return '<' + m.role + '>\n' + String(m.content || '') + '\n</' + m.role + '>';
    }).join('\n\n');
    var head = h('div', { style: { display: 'flex', gap: '8px', 'align-items': 'center', 'margin': '0 0 6px' } },
      h('span', { style: { 'font-size': 'var(--fs-sm)', color: 'var(--txt-2)', flex: '1' }, text: '发给 AI 的提示词 · ' + msgs.length + ' 段 · ~' + total + ' tok · 世界书命中 ' + wbBlocks.length + ' 条' }),
      h('button.btn.btn--xs', { type: 'button', onclick: function () { toggleAssemblePreview(); } }, ico('close', 'ico ico--sm'), h('span', { text: '收起' })));
    var body = h('div', { class: 'p3-scroll', style: { 'max-height': '42vh', overflowY: 'auto', 'white-space': 'pre-wrap', 'word-break': 'break-word', border: '1px solid var(--line-1)', 'border-radius': '8px', padding: '10px 12px', background: 'var(--bg-1)', 'font-size': 'var(--fs-xs)', 'line-height': '1.7', color: 'var(--txt-2)' } },
      h('p', { style: { margin: '0' }, text: text }));
    /* 文本展开中的消息段锚点（视觉分隔用纯文本已含 <role> 标签） */
    host.appendChild(head);
    host.appendChild(body);
    host.appendChild(h('p.field-hint', { text: '以上即真实回合将发送给模型的完整消息（顺序 = prompt_order；选中内容可复制）。' }));
    } catch (err) {
      host.appendChild(h('p.field-hint', { style: { color: 'var(--danger, #e06a50)' }, text: '装配预览出错：' + String(err && err.message || err) }));
    }
  }

  function runCmd(c) {
    FX.play('clip');
    var map = { '/舆图': 'map', '/行囊': 'bag', '/关系': 'relations' };
    if (map[c]) { openPanel(map[c]); return; }
    if (c === '/快存') { quickSave(); return; }
    if (c === '/回滚') { rollback(); return; }
    var el = document.getElementById('p3-input');
    el.value = c + ' ';
    el.focus();
  }

  function bindCompose() {
    var form = document.getElementById('p3-compose');
    var el = document.getElementById('p3-input');
    var cnt = document.getElementById('p3-input-count');
    /* 装配预览容器：插在输入框上方 */
    var prevHost = document.createElement('div');
    prevHost.id = 'p3-assemble-prev';
    prevHost.style.cssText = 'display:none;margin:0 0 10px;padding:0 8px;';
    if (form && form.parentNode) form.parentNode.insertBefore(prevHost, form);
    form.addEventListener('submit', function (e) { e.preventDefault(); advance(); });
    el.addEventListener('input', function () {
      cnt.textContent = String(el.value.length);
      el.style.height = 'auto';
      el.style.height = Math.min(140, Math.max(52, el.scrollHeight)) + 'px';
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); advance(); }
      if (e.key === 'Escape' && busy) { e.preventDefault(); abort(); }
    });
    var ab = document.getElementById('p3-abort');
    if (ab) ab.addEventListener('click', abort);
  }

  function bindFab() {
    document.getElementById('p3-fab').addEventListener('click', function () { openPanel('aictx'); });
  }

  /* ------------------------------------------------------------
     面板分发
     ------------------------------------------------------------ */
  function openPanel(id) {
    var reg = window.PANELS || {};
    var f = reg[id];
    FX.play('slide');
    if (!f) {
      UI.openPanel({
        id: id, title: '幻灯片缺片', sub: 'SLIDE NOT FOUND', icon: 'warning', serial: 'N° ??',
        body: h('div.proj-pad', null, UI.empty('这张幻灯片还没装进匣子', '面板 ID：' + id, 'warning'))
      });
      return;
    }
    UI.$$('.frame').forEach(function (b) { b.classList.toggle('is-active', b.dataset.id === id); });
    var meta = D.FRAMES.filter(function (x) { return x.id === id; })[0];
    var idx = D.FRAMES.indexOf(meta) + 1;
    var cfg = f(h, ico, UI, D, L);
    cfg.id = id;
    cfg.icon = cfg.icon || (meta && meta.icon) || 'file';
    cfg.title = cfg.title || (meta && meta.name) || id;
    cfg.sub = cfg.sub || (meta ? meta.latin + ' · ' + meta.seg + '段' : '');
    cfg.serial = cfg.serial || (meta ? 'SLIDE N° ' + String(100 + idx) : '');
    UI.openPanel(cfg);
  }

  document.addEventListener('p3:panelclose', function () {
    UI.$$('.frame').forEach(function (b) { b.classList.remove('is-active'); });
  });

  /* 面板内部请求打开另一个面板 */
  document.addEventListener('p3:open', function (e) {
    if (e.detail && e.detail.id) { UI.closePanel(); setTimeout(function () { openPanel(e.detail.id); }, 260); }
  });

  /* ------------------------------------------------------------
     设置落地
     ------------------------------------------------------------ */
  function applySettingsToDom() {
    var st = S.settings;
    document.documentElement.style.setProperty('--scene-dim', (st.sceneDim / 100).toFixed(2));
    document.documentElement.style.setProperty('--scene-blur', st.sceneBlur + 'px');
    document.documentElement.setAttribute('data-motion', st.motion === 'off' ? 'off' : 'on');
    document.documentElement.setAttribute('data-density', st.density === 'compact' ? 'compact' : 'normal');
    document.body.style.fontSize = (14 * st.fontScale / 100).toFixed(1) + 'px';
    save('settings', st);
  }

  window.APP = {
    state: S, skins: SKINS, applySkin: applySkin, applyView: applyView,
    openPanel: openPanel, setMode: setMode, bumpStat: bumpStat,
    applySettings: applySettingsToDom, tierLabel: tierLabel,
    quickSave: quickSave, rollback: rollback, save: save, load: load
  };

  /* ------------------------------------------------------------
     启动
     ------------------------------------------------------------ */
  function boot() {
    window.ICONS.mount();
    S.skin = load('skin', 'darkroom');
    S.settings = Object.assign({}, D.SETTINGS, load('settings', {}) || {});
    applySkin(S.skin, true);
    S.view = window.innerWidth < 860 ? 'mobile' : 'desktop';
    document.body.setAttribute('data-view', S.view);
    buildLogin();
    bootOpening();

    window.addEventListener('resize', function () { autoView(); });

    /* 全局键位 */
    document.addEventListener('keydown', function (e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (UI.panelOpen() || UI.sheetOpen()) return;
      var app = document.getElementById('p3-app');
      if (!app.classList.contains('is-active')) return;
      var k = e.key.toLowerCase();
      if (k === '1') { setMode('strip'); syncSeg('strip'); }
      else if (k === '2') { setMode('read'); syncSeg('read'); }
      else if (k === '3') { setMode('explore'); syncSeg('explore'); }
      else if (k === '4') { setMode('letters'); syncSeg('letters'); }
      else if (k === 'm') { openPanel('map'); }
      else if (k === 'c') { openPanel('codex'); }
      else if (k === 'p') { openPanel('preset'); }
      else if (k === 'w') { openPanel('worldbook'); }
      else if (k === 's' && !e.ctrlKey && !e.metaKey) { openPanel('settings'); }
    });
  }

  function syncSeg(m) {
    UI.$$('#p3-stage-tools .segbar button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    var el = document.getElementById('p3-mode-' + m);
    if (el) el.setAttribute('aria-pressed', 'true');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
