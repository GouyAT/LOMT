/* ============================================================
   app.js —— 开场（显影盘）/ 快门过场 / 登录页 / 装配 / 端切换 / 键盘
   ============================================================ */
(function (global) {
  'use strict';
  var P5 = global.P5 = global.P5 || {};
  var h = P5.h, D = P5.data;

  var booted = false;
  var deviceLocked = false;

  /* ============================================================
     开场：空白相纸在显影盘里浮出标题
     ============================================================ */
  function buildOpen() {
    var ov = P5.$('#p5-open');
    var title = h('h1.open__title', { 'aria-label': D.meta.title });
    Array.from(D.meta.title).forEach(function (c, i) {
      title.appendChild(h('span', { style: { animationDelay: (240 + i * 190) + 'ms' } }, c));
    });

    P5.mount(ov, h('div.tray', h('div.tray__sheet', [
      title,
      h('div.open__en', D.meta.latin),
      h('div.open__sub', D.meta.tagline),
      h('div.open__cta', h('span.pulse', [P5.icon('camera', 13), '按下快门以入场']))
    ])));

    var done = false;
    function enter() {
      if (done) return;
      done = true;
      var sh = P5.$('#p5-shutter');
      P5.fx.play('fog');
      if (P5.fx.reducedMotion()) { ov.dataset.phase = 'gone'; showGate(); return; }
      if (sh) sh.dataset.phase = 'fire';
      /* 快门闭合的静止窗口内换台 */
      global.setTimeout(showGate, 450);
      global.setTimeout(function () {
        ov.dataset.phase = 'gone';
        if (sh) sh.dataset.phase = 'idle';
      }, 1040);
    }
    ov.addEventListener('click', enter);
    ov.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); } });
    ov.tabIndex = 0;
    ov.setAttribute('role', 'button');
    ov.setAttribute('aria-label', '进入诡秘剧场');
    global.setTimeout(function () { ov.focus(); }, 200);
  }

  /* ============================================================
     登录页
     ============================================================ */
  var gi = 0;
  function gateAct(icon, zh, sub, key, primary, onClick) {
    return h('button.gate-act' + (primary ? '.gate-act--primary' : ''), {
      type: 'button', id: 'p5-gate-act-' + (gi++), onclick: onClick
    }, [
      h('span.gate-act__ic', P5.icon(icon, 19)),
      h('div', [h('div.gate-act__zh', zh), h('div.gate-act__sub', sub)]),
      h('span.gate-act__k', key || '')
    ]);
  }

  function showGate() {
    var gate = P5.$('#p5-gate');
    gate.hidden = false;
    var scene = P5.$('#p5-gate-scene');
    P5.clear(scene);
    var layer = P5.fx.sceneLayer(13, { strength: 14 });
    layer.style.setProperty('--scene-blur', '3px');
    layer.style.setProperty('--scene-dim', '.24');
    scene.appendChild(layer);
    scene.appendChild(h('div.gate__quote', [
      h('div.en', 'let the image come up slowly'),
      h('div.zh', '相机能拍到肉眼看不见的东西。\n所以他们不敢在暗房里开灯。'),
      h('div.src', '—— 观众途径 · 序列九 · 显影手记')
    ]));

    var panel = P5.$('#p5-gate-panel');
    P5.clear(panel);
    panel.appendChild(h('div.gate__brand', [
      h('div.zh', D.meta.title),
      h('div.en', D.meta.latin),
      h('div.gate__ver', D.meta.build)
    ]));
    panel.appendChild(h('div.gate__acts', [
      gateAct('door', '开始新的旅程', '以利亚·凡恩 · 观众途径 序列 9 · 第一周目', 'Enter', true, function () { enterGame(); }),
      gateAct('tree', '继续上次存档', '第 7 回合 · 晚报社地下暗房 · 9/15 01:12', null, false, function () { enterGame('archive'); }),
      gateAct('books', '世界书', '2 本启用 · 30 条条目 · 可导入酒馆 lorebook', null, false, function () { enterGame('lorebook'); }),
      gateAct('layers', '上下文合成器', '14 个装配块 · 预算 5,000 tok · 三区可拖拽', null, false, function () { enterGame('composer'); }),
      gateAct('plug', 'API 管线', '单调用档 · 主 API + 次 API · RPM 可视化', null, false, function () { enterGame('pipeline'); })
    ]));
    panel.appendChild(h('div.gate__minor', [
      P5.btn('设置', { size: 'sm', icon: 'gear', onClick: function () { enterGame('settings'); } }),
      P5.btn('档案馆', { size: 'sm', icon: 'archive', onClick: function () { enterGame('archive'); } }),
      P5.btn('切换到移动端', { size: 'sm', icon: 'phone', onClick: function () { setDevice('mobile', true); P5.notify.info('已切换到移动端排版', '顶栏可随时切回桌面端。'); } })
    ]));
    panel.appendChild(h('div.gate__foot', [
      h('div.row.row--wrap', [
        h('span.tag.tag--fixer', '零构建 · 零依赖'),
        h('span.tag', '前端原型 · 无后端'),
        h('span.tag.tag--cyan', '24 格面板 · 一条入口')
      ]),
      h('p.gate__note',
        '这是《诡秘之主》AIRP 重制版的第五份前端原型，由 P3 的暗房视觉 + P4 的信息架构 + P1 的控件克制度合成。' +
        '设计约束写进了验收：PC 首屏常驻控件 ≤22、移动端 ≤12、移动端触控目标全部 ≥44px、通向 24 个面板的通道只有一条（样张）。')
    ]));

    global.setTimeout(function () { var f = P5.$('#p5-gate-act-0'); if (f) f.focus(); }, 120);
    document.addEventListener('keydown', function (e) {
      if (gate.hidden) return;
      if (e.key === 'Enter' && (!document.activeElement || document.activeElement === document.body)) { e.preventDefault(); enterGame(); }
    });
  }

  /* ============================================================
     进入主界面
     ============================================================ */
  function enterGame(openPanel) {
    var gate = P5.$('#p5-gate');
    gate.dataset.phase = 'gone';
    global.setTimeout(function () { gate.hidden = true; }, 700);

    if (!booted) {
      booted = true;
      buildBeam();
      buildTabbar();
      P5.stage.buildTrough();
      P5.stage.buildWall();
      P5.stage.buildStage();
      P5.stage.buildBench();
    }
    var app = P5.$('#p5-app');
    app.classList.add('is-live');
    app.removeAttribute('aria-hidden');
    P5.fx.play('chime');

    global.setTimeout(function () {
      P5.notify.cyan('第七回合 · 显影的耳朵', '按反引号键或 Ctrl+K 取来接触印相样张——二十四格面板都在那一张纸上。');
      if (openPanel) global.setTimeout(function () { P5.sheet.open(openPanel); }, 500);
    }, 900);
  }

  /* ============================================================
     暗房横梁：控件 4 个（样张 / 端切换 ×2 / 皮肤）
     ============================================================ */
  function buildBeam() {
    var beam = P5.$('#p5-beam');
    P5.clear(beam);

    beam.appendChild(h('div.beam__brand', [
      h('span.safelamp', { 'aria-hidden': 'true' }),
      h('div.beam__logo', [h('span.zh', D.meta.title), h('span.en', D.meta.latin)]),
      h('span.beam__sep.m-hide'),
      h('span.plate.m-hide', h('span.tx', { id: 'p5-skin-name' }, '灵异显影室'))
    ]));

    beam.appendChild(h('div.beam__mid', [
      h('div.beam__clock', [
        h('span.d', D.scene.time),
        h('span.p.m-hide', D.scene.place)
      ]),
      h('div.lamps.m-hide', { role: 'group', 'aria-label': '管线状态灯（只读）' }, [
        lamp('p5-lamp-main', '正', '1', '正文管线就绪'),
        lamp('p5-lamp-var', '变', '1', '变量管线就绪'),
        lamp('p5-lamp-stream', '流', 'busy', '流式输出进行中'),
        lamp('p5-lamp-audio', '声', '0', '界面音效（默认关，可在设置开启）')
      ])
    ]));

    beam.appendChild(h('div.beam__right', [
      P5.btn('样张', {
        id: 'p5-btn-sheet', variant: 'cyan', icon: 'grid',
        title: '接触印相样张：24 格面板唯一入口（反引号 / Ctrl+K）',
        onClick: function () { P5.sheet.toggleSheet(); }
      }),
      h('span.beam__sep'),
      h('div.seg', { role: 'group', 'aria-label': '端形态切换' }, [
        h('button', { type: 'button', id: 'p5-dev-pc', 'aria-pressed': 'true', title: '桌面端排版', onclick: function () { setDevice('pc', true); } }, P5.icon('monitor', 12)),
        h('button', { type: 'button', id: 'p5-dev-mobile', 'aria-pressed': 'false', title: '移动端排版', onclick: function () { setDevice('mobile', true); } }, P5.icon('phone', 12))
      ]),
      P5.iconBtn('palette', { id: 'p5-btn-skin', title: '切换主题皮肤', onClick: cycleSkin })
    ]));
  }

  function lamp(id, tx, on, title) {
    return h('span.lamp', { id: id, dataset: { on: on }, title: title, 'aria-label': title }, tx);
  }

  function cycleSkin() {
    var keys = D.settings.skins.map(function (s) { return s.key; });
    var i = (keys.indexOf(D.settings.skin) + 1) % keys.length;
    var sk = D.settings.skins[i];
    D.settings.skin = sk.key;
    document.documentElement.dataset.skin = sk.key === 'darkroom' ? '' : sk.key;
    P5.store('skin', sk.key);
    var lb = P5.$('#p5-skin-name');
    if (lb) lb.textContent = sk.nm;
    P5.fx.play('plate');
    P5.notify.ok('皮肤已切换', sk.nm);
  }

  /* ============================================================
     移动端底部三标签：剧场 / 卷宗 / 样张（面板入口只此一格）
     ============================================================ */
  function buildTabbar() {
    var bar = P5.$('#p5-tabbar');
    P5.clear(bar);
    [
      { key: 'stage', icon: 'theatre', lb: '剧场' },
      { key: 'trough', icon: 'fingerprint', lb: '卷宗' },
      { key: 'sheet', icon: 'grid', lb: '样张' }
    ].forEach(function (it) {
      bar.appendChild(h('button.tabbar-btn', {
        type: 'button', id: 'p5-tab-' + it.key,
        'aria-pressed': it.key === 'stage' ? 'true' : 'false',
        onclick: function () {
          P5.$$('.tabbar-btn').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
          this.setAttribute('aria-pressed', 'true');
          onTab(it.key);
        }
      }, [P5.icon(it.icon, 19), h('span', it.lb)]));
    });
  }

  function onTab(key) {
    if (key === 'stage') { closeDrawer(); P5.sheet.closeAll(); return; }
    if (key === 'sheet') { closeDrawer(); P5.sheet.openSheet(); return; }
    if (key === 'trough') {
      openDrawer('卷宗速览', function () {
        var wrap = h('div.col');
        var bank = h('div.cyl-bank', { id: 'p5-drawer-bank' });
        wrap.appendChild(h('div.ident', [
          h('div.plate-portrait', h('span', D.pc.sigil)),
          h('div', [
            h('div.ident__name', D.pc.name),
            h('div.ident__meta', '序列 ' + D.pc.sequence + ' · ' + D.pc.seqName + ' · 消化 ' + D.pc.digest + '%'),
            h('div.ident__meta', D.pc.job)
          ])
        ]));
        wrap.appendChild(bank);
        wrap.appendChild(h('div.readout', D.quests.map(function (q) {
          return h('div.readout__row', [
            h('span.ic', P5.icon(q.state === 'doing' ? 'target' : 'dot', 11)),
            h('span.nm', q.name),
            h('span.vl', q.cur + '/' + q.max)
          ]);
        })));
        wrap.appendChild(h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.8', color: 'var(--txt-3)' } },
          '完整的角色卷宗、行囊、能力簿、人物关系都在样张上（N°06—09）。这里只放一眼能看完的读数。'));
        global.setTimeout(function () {
          D.attrs.forEach(function (a) {
            var p = P5.pct(a.cur, a.max);
            bank.appendChild(h('div.cyl', { dataset: { attr: a.key } }, [
              h('div.cyl__glass', [h('div.cyl__liquid', { style: { height: p + '%' } }), h('div.cyl__scale')]),
              h('span.cyl__val', a.cur),
              h('span.cyl__name', a.zh)
            ]));
          });
        }, 0);
        return wrap;
      });
    }
  }

  function openDrawer(title, renderFn) {
    var d = P5.$('#p5-drawer'), s = P5.$('#p5-drawer-scrim');
    P5.mount(P5.$('#p5-drawer-title'), title);
    P5.mount(P5.$('#p5-drawer-body'), renderFn());
    d.dataset.open = '1'; s.dataset.open = '1';
    P5.fx.play('open');
  }
  function closeDrawer() {
    var d = P5.$('#p5-drawer'), s = P5.$('#p5-drawer-scrim');
    if (d) d.dataset.open = '0';
    if (s) s.dataset.open = '0';
  }

  /* ============================================================
     端切换
     ============================================================ */
  function setDevice(dev, manual) {
    if (manual) deviceLocked = true;
    document.body.dataset.device = dev;
    var pc = P5.$('#p5-dev-pc'), mb = P5.$('#p5-dev-mobile');
    if (pc) pc.setAttribute('aria-pressed', dev === 'pc' ? 'true' : 'false');
    if (mb) mb.setAttribute('aria-pressed', dev === 'mobile' ? 'true' : 'false');
    if (dev === 'mobile') closeDrawer();
    P5.sheet.syncDock();
    P5.emit('device', dev);
  }
  function autoDevice() { if (!deviceLocked) setDevice(global.innerWidth <= 820 ? 'mobile' : 'pc'); }

  function toggleSide(which) {
    var el = P5.$('#p5-' + which);
    if (!el) return;
    el.dataset.collapsed = el.dataset.collapsed === '1' ? '0' : '1';
    P5.fx.play('plate');
  }

  /* ============================================================
     全局键盘
     ============================================================ */
  function inField() {
    var a = document.activeElement;
    if (!a) return false;
    var t = a.tagName;
    return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || a.isContentEditable;
  }

  document.addEventListener('keydown', function (e) {
    if ((e.key === '`' || e.code === 'Backquote') && !inField() && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); P5.sheet.toggleSheet(); return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault(); P5.sheet.toggleSheet(); return;
    }
    if (e.key === 'Escape') {
      var menu = P5.$('#p5-turnmenu');
      if (menu && !menu.hidden) { menu.hidden = true; return; }
      if (P5.sheet.isSheetOpen()) { P5.sheet.closeSheet(); return; }
      var d = P5.$('#p5-drawer');
      if (d && d.dataset.open === '1') { closeDrawer(); return; }
      if (P5.sheet.closeTop()) return;
      return;
    }
    if (inField()) return;
    if (e.key === '1') { e.preventDefault(); P5.stage.setMode('strip'); }
    else if (e.key === '2') { e.preventDefault(); P5.stage.setMode('read'); }
    else if (e.key === '3') { e.preventDefault(); P5.stage.setMode('explore'); }
    else if (e.key === '[') { e.preventDefault(); toggleSide('trough'); }
    else if (e.key === ']') { e.preventDefault(); toggleSide('wall'); }
  });

  /* ============================================================
     启动
     ============================================================ */
  function boot() {
    var skin = P5.store('skin');
    if (skin) { D.settings.skin = skin; document.documentElement.dataset.skin = skin === 'darkroom' ? '' : skin; }
    var motion = P5.store('motion');
    if (motion) { D.settings.motion = motion; document.documentElement.dataset.motion = motion === 'full' ? '' : motion; }
    var fx = P5.store('fx');
    if (fx) { D.settings.fx = fx; document.documentElement.dataset.fx = fx; }
    var audio = P5.store('audio');
    if (audio !== null) D.settings.audio = !!audio;

    document.documentElement.style.setProperty('--story-size', D.settings.storySize + 'px');
    document.documentElement.style.setProperty('--story-leading', String(D.settings.storyLeading));

    setDevice(global.innerWidth <= 820 ? 'mobile' : 'pc');
    global.addEventListener('resize', P5.debounce(autoDevice, 240));

    P5.initRipple();
    var canvas = P5.$('#p5-dust');
    if (canvas) P5.fx.motes(canvas);

    var scrim = P5.$('#p5-drawer-scrim');
    if (scrim) scrim.addEventListener('click', closeDrawer);
    var grip = P5.$('#p5-drawer-grip');
    if (grip) grip.addEventListener('click', closeDrawer);

    /* 左右脊标（各 1 个控件） */
    var ts = P5.$('#p5-trough-spine');
    if (ts) ts.addEventListener('click', function () { toggleSide('trough'); });
    var ws = P5.$('#p5-wall-spine');
    if (ws) ws.addEventListener('click', function () { toggleSide('wall'); });

    buildOpen();

    /* 浏览器能力自检：不达标时用内部通知说清原因，不让玩家对着一片灰发愣 */
    global.setTimeout(function () {
      var lacks = [];
      try {
        if (!(global.CSS && CSS.supports && CSS.supports('color', 'color-mix(in srgb, red, blue)'))) lacks.push('color-mix()');
        
        if (!(global.CSS && CSS.supports && CSS.supports('mix-blend-mode', 'overlay'))) lacks.push('mix-blend-mode');
      } catch (e) { lacks.push('CSS.supports'); }
      if (lacks.length) {
        P5.notify.leak('你的浏览器不支持 <b>' + lacks.join(' / ') + '</b>，界面已自动降级为实色方案，观感会比设计稿平一些。' +
          '建议用 Chrome 111+ / Edge 111+ / Firefox 113+ / Safari 16.4+ 打开。', { sticky: true });
      }
    }, 2400);

    global.addEventListener('error', function (ev) {
      P5.notify.leak('前端捕获到一处异常：<b>' + String(ev.message).slice(0, 90) + '</b>。界面已继续运行。', { life: 6000 });
    });
    global.addEventListener('unhandledrejection', function () {
      P5.notify.warn('一个异步任务失败了', '界面已继续运行，未中断当前回合。');
    });
  }

  P5.app = { setDevice: setDevice, openDrawer: openDrawer, closeDrawer: closeDrawer, enterGame: enterGame, toggleSide: toggleSide };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
