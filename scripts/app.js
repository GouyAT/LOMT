/* ===========================================================
   app.js —— 开场序列 / 登录页 / 主界面装配 / 端切换 / 键盘
   =========================================================== */
(function (global) {
  'use strict';
  var P4 = global.P4 = global.P4 || {};
  var h = P4.h, D = P4.data;

  var booted = false;
  var deviceLocked = false;

  /* =======================================================
     开场序列：铭牌显影 → 汞珠环收拢 → 镜裂 → 登录页
     ======================================================= */
  function buildOverture() {
    var ov = P4.$('#p4-overture');
    var title = h('h1.overture__title', { 'aria-label': D.meta.title });
    Array.from(D.meta.title).forEach(function (c, i) {
      title.appendChild(h('span', { style: { animationDelay: (240 + i * 190) + 'ms' } }, c));
    });

    P4.mount(ov, [
      h('div.overture__inner', [
        h('div.overture__ring'),
        h('div.overture__ring'),
        h('div.overture__ring'),
        title,
        h('div.overture__lat', D.meta.latin),
        h('div.overture__sub', D.meta.tagline),
        h('div.overture__cta', h('span.pulse', [P4.icon('mirror', 13), '触碰镜面以入场']))
      ])
    ]);

    var done = false;
    function enter() {
      if (done) return;
      done = true;
      var mirror = P4.$('#p4-mirror');
      P4.fx.play('fog');
      if (P4.fx.reducedMotion()) {
        ov.dataset.phase = 'gone';
        showGate();
        return;
      }
      ov.dataset.phase = 'crack';
      if (mirror) mirror.dataset.phase = 'sweep';
      /* 镜面合拢的静止窗口内换台：此刻登录页已就位，但仍被银镜遮住 */
      global.setTimeout(function () { showGate(); }, 470);
      global.setTimeout(function () {
        ov.dataset.phase = 'gone';
        if (mirror) mirror.dataset.phase = 'idle';
      }, 1080);
    }
    ov.addEventListener('click', enter);
    ov.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); } });
    ov.tabIndex = 0;
    ov.setAttribute('role', 'button');
    ov.setAttribute('aria-label', '进入诡秘剧场');
    global.setTimeout(function () { ov.focus(); }, 200);
  }

  /* =======================================================
     登录页
     ======================================================= */
  function showGate() {
    var gate = P4.$('#p4-gate');
    gate.hidden = false;
    var scene = P4.$('#p4-gate-scene');
    P4.clear(scene);
    var layer = P4.fx.sceneLayer(13, { strength: 14 });
    layer.style.setProperty('--scene-blur', '3px');
    layer.style.setProperty('--scene-dim', '.22');
    scene.appendChild(layer);
    scene.appendChild(h('div.gate__poem', [
      h('div.lat', 'ABOVE THE GREY FOG'),
      h('div.zh', '灰雾之上，有一张摊开的案台；\n案台之上，每一件仪器都在等你俯身。'),
      h('div.src', '—— 观众途径 · 序列九 · 旁听手记')
    ]));

    var panel = P4.$('#p4-gate-panel');
    P4.clear(panel);
    panel.appendChild(h('div.gate__brand', [
      h('div.zh', D.meta.title),
      h('div.lat', D.meta.latin),
      h('div.gate__ver', D.meta.build)
    ]));

    panel.appendChild(h('div.gate__acts', [
      gateAct('door', '开始新的旅程', '以利亚·凡恩 · 观众途径 序列 9 · 第一周目', 'Enter', true, function () { enterGame(); }),
      gateAct('tree', '继续上次存档', '第 7 回合 · 翡翠剧院后台走廊 · 9/14 21:47', null, false, function () { enterGame('archive'); }),
      gateAct('books', '世界书', '2 本启用 · 30 条条目 · 可导入酒馆 lorebook', null, false, function () { enterGame('lorebook'); }),
      gateAct('layers', '上下文合成器', '14 个装配块 · 预算 5,000 tok · 三区可拖拽', null, false, function () { enterGame('composer'); }),
      gateAct('plug', '模型与管线', '单调用档 · 主 API + 次 API · RPM 可视化', null, false, function () { enterGame('pipeline'); })
    ]));

    panel.appendChild(h('div.gate__minor', [
      P4.btn('台务设置', { size: 'sm', icon: 'gear', onClick: function () { enterGame('settings'); } }),
      P4.btn('档案馆', { size: 'sm', icon: 'archive', onClick: function () { enterGame('archive'); } }),
      P4.btn('切换到移动端', { size: 'sm', icon: 'phone', onClick: function () { setDevice('mobile'); P4.notify.info('已切换到移动端排版', '顶栏可随时切回桌面端。'); } })
    ]));

    panel.appendChild(h('div.gate__foot', [
      h('div.row.row--wrap', [
        h('span.badge.badge--ok', '零构建 · 零依赖'),
        h('span.badge', '前端原型 · 无后端'),
        h('span.badge.badge--mystic', '22 面板已装配')
      ]),
      h('p.gate__note',
        '这是《诡秘之主》AIRP 重制版的第四份前端原型。所有面板均已完整装配并填入真实剧本内容；' +
        '涉及模型调用、生图与云端的按钮会给出诚实的界面反馈，不会假装成功。' +
        '背景图取自旧卡素材，网络不可达时自动回退为程序化雾街场景。')
    ]));

    global.setTimeout(function () {
      var first = P4.$('#p4-gate-act-0');
      if (first) first.focus();
    }, 120);

    function onKey(e) {
      if (gate.hidden) return;
      if (e.key === 'Enter' && (!document.activeElement || document.activeElement === document.body)) {
        e.preventDefault(); enterGame();
      }
    }
    document.addEventListener('keydown', onKey);
  }

  var gateActIdx = 0;
  function gateAct(icon, zh, sub, key, primary, onClick) {
    var id = 'p4-gate-act-' + (gateActIdx++);
    return h('button.gate-act' + (primary ? '.gate-act--primary' : ''), {
      type: 'button', id: id, onclick: onClick
    }, [
      h('span.gate-act__ic', P4.icon(icon, 19)),
      h('div', [h('div.gate-act__zh', zh), h('div.gate-act__sub', sub)]),
      h('span.gate-act__k', key || '')
    ]);
  }

  /* =======================================================
     进入主界面
     ======================================================= */
  function enterGame(openPanel) {
    var gate = P4.$('#p4-gate');
    gate.dataset.phase = 'gone';
    global.setTimeout(function () { gate.hidden = true; }, 700);

    if (!booted) {
      booted = true;
      buildBeam();
      buildRails();
      buildTabbar();
      P4.stage.buildTower();
      P4.stage.buildDossier();
      P4.stage.buildStage();
      P4.stage.buildRail();
    }
    var app = P4.$('#p4-app');
    app.classList.add('is-live');
    app.removeAttribute('aria-hidden');
    P4.fx.play('chime');

    global.setTimeout(function () {
      P4.notify.mystic('第七回合 · 幕后的耳朵', '按 ` 或点击顶梁的命运之环，展开灰雾星图选择面板。');
      if (openPanel) global.setTimeout(function () { P4.docket.open(openPanel); }, 500);
    }, 900);
  }

  /* =======================================================
     顶梁
     ======================================================= */
  function buildBeam() {
    var beam = P4.$('#p4-beam');
    P4.clear(beam);

    beam.appendChild(h('div.beam__brand', [
      h('div.beam__logo', [h('span.zh', D.meta.title), h('span.lat', D.meta.latin)]),
      h('span.beam__sep'),
      h('span.nameplate', h('span.tx', { id: 'p4-skin-label' }, '汞镜案台'))
    ]));

    beam.appendChild(h('div.beam__center', [
      h('div.beam__clock', [
        h('span.date', { id: 'p4-clock-date' }, D.scene.time),
        h('span.place.m-hide', D.scene.place)
      ]),
      h('div.pipe-lamps.m-hide', { role: 'group', 'aria-label': '管线状态灯' }, [
        lamp('p4-lamp-main', '主', '1', '主 API · 剧情通道就绪'),
        lamp('p4-lamp-sub', '次', '1', '次 API · 变量与总结通道就绪'),
        lamp('p4-lamp-stream', '流', 'busy', '流式输出进行中'),
        lamp('p4-lamp-audio', '声', '0', '界面音效（默认关，可在设置开启）')
      ])
    ]));

    beam.appendChild(h('div.beam__right', [
      h('button.fate-wheel', {
        type: 'button', id: 'p4-fate-wheel',
        'aria-expanded': 'false',
        'aria-label': '命运之环：展开灰雾星图（快捷键 反引号 或 Ctrl+K）',
        title: '灰雾星图 · 22 面板导航（` / Ctrl+K）',
        onclick: function () {
          P4.docket.toggleFog();
          this.setAttribute('aria-expanded', P4.docket.isFogOpen() ? 'true' : 'false');
        }
      }, P4.icon('astrolabe', 18)),
      h('span.beam__sep'),
      P4.iconBtn('collapse', {
        id: 'p4-toggle-tower', title: '收起 / 展开左仪表塔（[）',
        onClick: function () { toggleSide('tower'); }
      }),
      P4.iconBtn('expand', {
        id: 'p4-toggle-dossier', title: '收起 / 展开右卷宗栏（]）',
        onClick: function () { toggleSide('dossier'); }
      }),
      h('span.beam__sep'),
      h('div.seg', { role: 'group', 'aria-label': '端形态切换' }, [
        h('button', {
          type: 'button', id: 'p4-dev-pc', 'aria-pressed': 'true', title: '桌面端排版',
          onclick: function () { setDevice('pc', true); }
        }, [P4.icon('monitor', 12)]),
        h('button', {
          type: 'button', id: 'p4-dev-mobile', 'aria-pressed': 'false', title: '移动端排版',
          onclick: function () { setDevice('mobile', true); }
        }, [P4.icon('phone', 12)])
      ]),
      P4.iconBtn('palette', {
        id: 'p4-btn-skin', title: '切换主题皮肤',
        onClick: function () { cycleSkin(); }
      })
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
    document.documentElement.dataset.skin = sk.key === 'mercury' ? '' : sk.key;
    P4.store('skin', sk.key);
    var lb = P4.$('#p4-skin-label');
    if (lb) lb.textContent = sk.nm;
    P4.fx.play('plate');
    P4.notify.ok('皮肤已切换', sk.nm);
  }

  /* =======================================================
     侧栏图标轨道
     ======================================================= */
  function buildRails() {
    var tRail = P4.$('#p4-tower-rail');
    var dRail = P4.$('#p4-dossier-rail');
    P4.clear(tRail); P4.clear(dRail);

    tRail.appendChild(railBtn('collapse', '收起 / 展开仪表塔', function () { toggleSide('tower'); }));
    tRail.appendChild(h('span.beam__sep', { style: { width: '22px', height: '1px', margin: '4px 0' } }));
    [['fingerprint', 'dossier', '角色卷宗'], ['bag', 'inventory', '行囊与装备'], ['wave', 'abilities', '能力簿'], ['users', 'relations', '人物关系']]
      .forEach(function (x) {
        tRail.appendChild(railBtn(x[0], x[2], function () { P4.docket.open(x[1], this); }));
      });
    tRail.appendChild(h('span.rail-spacer'));
    tRail.appendChild(railBtn('constellation', '灰雾星图（`）', function () { P4.docket.toggleFog(); }));

    dRail.appendChild(railBtn('expand', '收起 / 展开卷宗栏', function () { toggleSide('dossier'); }, true));
    dRail.appendChild(h('span.beam__sep', { style: { width: '22px', height: '1px', margin: '4px 0' } }));
    [['map', 'map', '王国舆图'], ['book', 'codex', '图鉴'], ['scroll', 'chronicle', '编年史'], ['tarot', 'divination', '占卜间'],
     ['board', 'board', '战术推演'], ['magnifier', 'case', '侦探案卷'], ['tree', 'archive', '档案馆']]
      .forEach(function (x) {
        dRail.appendChild(railBtn(x[0], x[2], function () { P4.docket.open(x[1], this); }, true));
      });
    dRail.appendChild(h('span.rail-spacer'));
    dRail.appendChild(railBtn('gear', '台务设置', function () { P4.docket.open('settings', this); }, true));
  }

  function railBtn(icon, tip, onClick) {
    return h('button.rail-btn', {
      type: 'button', title: tip, 'aria-label': tip, onclick: onClick
    }, [P4.icon(icon, 16), h('span.rail-btn__tip', tip)]);
  }

  function toggleSide(which) {
    var el = P4.$('#p4-' + which);
    if (!el) return;
    var next = el.dataset.collapsed === '1' ? '0' : '1';
    el.dataset.collapsed = next;
    P4.fx.play('plate');
    var btn = P4.$('#p4-toggle-' + which);
    if (btn) btn.setAttribute('aria-pressed', next === '1' ? 'true' : 'false');
  }

  /* =======================================================
     移动端底部标签栏 + 抽屉
     ======================================================= */
  function buildTabbar() {
    var bar = P4.$('#p4-tabbar');
    P4.clear(bar);
    var items = [
      { key: 'stage', icon: 'theatre', lb: '剧场' },
      { key: 'self', icon: 'fingerprint', lb: '卷宗' },
      { key: 'map', icon: 'map', lb: '舆图' },
      { key: 'memory', icon: 'scroll', lb: '记忆' },
      { key: 'more', icon: 'grid', lb: '更多' }
    ];
    items.forEach(function (it) {
      bar.appendChild(h('button.tabbar-btn', {
        type: 'button', id: 'p4-tab-' + it.key,
        'aria-pressed': it.key === 'stage' ? 'true' : 'false',
        onclick: function () {
          P4.$$('.tabbar-btn').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
          this.setAttribute('aria-pressed', 'true');
          onTab(it.key);
        }
      }, [P4.icon(it.icon, 18), h('span', it.lb)]));
    });
  }

  function onTab(key) {
    if (key === 'stage') { closeSheet(); P4.docket.closeAll(); return; }
    if (key === 'map') { closeSheet(); P4.docket.open('map'); return; }
    if (key === 'memory') { closeSheet(); P4.docket.open('chronicle'); return; }
    if (key === 'self') {
      openSheet('角色卷宗速览', function () {
        var wrap = h('div.col');
        var bank = h('div.merc-bank', { id: 'p4-sheet-bank' });
        wrap.appendChild(h('div.ident', [
          h('div.ident__sigil', h('span', { style: { fontFamily: 'var(--font-display)' } }, D.pc.sigil)),
          h('div', [h('div.ident__name', D.pc.name), h('div.ident__meta', '序列 ' + D.pc.sequence + ' · ' + D.pc.seqName + ' · 消化 ' + D.pc.digest + '%')])
        ]));
        wrap.appendChild(bank);
        wrap.appendChild(h('div.row.row--wrap', [
          P4.btn('完整卷宗', { size: 'sm', icon: 'fingerprint', onClick: function () { closeSheet(); P4.docket.open('dossier'); } }),
          P4.btn('行囊', { size: 'sm', icon: 'bag', onClick: function () { closeSheet(); P4.docket.open('inventory'); } }),
          P4.btn('能力簿', { size: 'sm', icon: 'wave', onClick: function () { closeSheet(); P4.docket.open('abilities'); } }),
          P4.btn('人物关系', { size: 'sm', icon: 'users', onClick: function () { closeSheet(); P4.docket.open('relations'); } })
        ]));
        global.setTimeout(function () {
          D.attrs.forEach(function (a) {
            var p = P4.pct(a.cur, a.max);
            bank.appendChild(h('div.merc', { dataset: { attr: a.key } }, [
              h('div.merc__tube', [h('div.merc__fluid', { style: { height: p + '%' } }), h('div.merc__scale')]),
              h('span.merc__val', a.cur),
              h('span.merc__name', a.zh)
            ]));
          });
        }, 0);
        return wrap;
      });
      return;
    }
    if (key === 'more') {
      openSheet('全部面板', function () {
        return h('div.grid-launcher', P4.docket.registry.map(function (sp) {
          return h('button', {
            type: 'button', id: 'p4-glaunch-' + sp.key,
            onclick: function () { closeSheet(); P4.docket.open(sp.key); }
          }, [P4.icon(sp.icon, 20), h('span.lb', sp.zh)]);
        }));
      });
    }
  }

  function openSheet(title, renderFn) {
    var sheet = P4.$('#p4-sheet');
    var scrim = P4.$('#p4-sheet-scrim');
    P4.mount(P4.$('#p4-sheet-title'), title);
    P4.mount(P4.$('#p4-sheet-body'), renderFn());
    sheet.dataset.open = '1';
    scrim.dataset.open = '1';
    P4.fx.play('open');
  }
  function closeSheet() {
    var sheet = P4.$('#p4-sheet');
    var scrim = P4.$('#p4-sheet-scrim');
    if (sheet) sheet.dataset.open = '0';
    if (scrim) scrim.dataset.open = '0';
  }

  /* =======================================================
     端切换
     ======================================================= */
  function setDevice(dev, manual) {
    if (manual) deviceLocked = true;
    document.body.dataset.device = dev;
    var pc = P4.$('#p4-dev-pc'), mb = P4.$('#p4-dev-mobile');
    if (pc) pc.setAttribute('aria-pressed', dev === 'pc' ? 'true' : 'false');
    if (mb) mb.setAttribute('aria-pressed', dev === 'mobile' ? 'true' : 'false');
    if (dev === 'mobile') closeSheet();
    P4.docket.syncDock();
    P4.emit('device', dev);
  }

  function autoDevice() {
    if (deviceLocked) return;
    setDevice(global.innerWidth <= 820 ? 'mobile' : 'pc');
  }

  /* =======================================================
     全局键盘
     ======================================================= */
  function inField() {
    var a = document.activeElement;
    if (!a) return false;
    var t = a.tagName;
    return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || a.isContentEditable;
  }

  document.addEventListener('keydown', function (e) {
    /* 星图：反引号 或 Ctrl/Cmd + K */
    if ((e.key === '`' || e.code === 'Backquote') && !inField() && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); P4.docket.toggleFog(); return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault(); P4.docket.toggleFog(); return;
    }
    if (e.key === 'Escape') {
      if (P4.docket.isFogOpen()) { P4.docket.closeFog(); return; }
      var sheet = P4.$('#p4-sheet');
      if (sheet && sheet.dataset.open === '1') { closeSheet(); return; }
      if (P4.docket.closeTop()) return;
      return;
    }
    if (inField()) return;
    if (e.key === '1') { e.preventDefault(); P4.stage.setMode('strip'); }
    else if (e.key === '2') { e.preventDefault(); P4.stage.setMode('read'); }
    else if (e.key === '3') { e.preventDefault(); P4.stage.setMode('explore'); }
    else if (e.key === '[') { e.preventDefault(); toggleSide('tower'); }
    else if (e.key === ']') { e.preventDefault(); toggleSide('dossier'); }
  });

  /* =======================================================
     启动
     ======================================================= */
  function boot() {
    /* 恢复偏好 */
    var skin = P4.store('skin');
    if (skin) {
      D.settings.skin = skin;
      document.documentElement.dataset.skin = skin === 'mercury' ? '' : skin;
    }
    var motion = P4.store('motion');
    if (motion) { D.settings.motion = motion; document.documentElement.dataset.motion = motion === 'full' ? '' : motion; }
    var fx = P4.store('fx');
    if (fx) { D.settings.fx = fx; document.documentElement.dataset.fx = fx; }
    var audio = P4.store('audio');
    if (audio !== null) D.settings.audio = !!audio;

    document.documentElement.style.setProperty('--story-size', D.settings.storySize + 'px');
    document.documentElement.style.setProperty('--story-leading', String(D.settings.storyLeading));

    setDevice(global.innerWidth <= 820 ? 'mobile' : 'pc');
    global.addEventListener('resize', P4.debounce(autoDevice, 240));

    P4.initRipple();
    var canvas = P4.$('#p4-motes');
    if (canvas) P4.fx.motes(canvas);

    /* 抽屉遮罩 */
    var scrim = P4.$('#p4-sheet-scrim');
    if (scrim) scrim.addEventListener('click', closeSheet);
    var grip = P4.$('#p4-sheet-grip');
    if (grip) grip.addEventListener('click', closeSheet);

    buildOverture();

    /* 全局错误也走内部通知，绝不弹浏览器框 */
    global.addEventListener('error', function (ev) {
      P4.notify.valve('前端捕获到一处异常：<b>' + String(ev.message).slice(0, 90) + '</b>。界面已继续运行。', { life: 6000 });
    });
    global.addEventListener('unhandledrejection', function () {
      P4.notify.warn('一个异步任务失败了', '界面已继续运行，未中断当前回合。');
    });
  }

  P4.app = { setDevice: setDevice, openSheet: openSheet, closeSheet: closeSheet, enterGame: enterGame, toggleSide: toggleSide };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
