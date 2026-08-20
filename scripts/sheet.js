/* ============================================================
   sheet.js —— 接触印相样张（唯一面板入口）+ 放大机投影窗口
   设计约束：通向 24 个面板的通道只有一条。
   侧栏没有图标轨道、右墙没有速取矩阵、底部没有常驻底片条。
   ============================================================ */
(function (global) {
  'use strict';
  var P5 = global.P5 = global.P5 || {};
  var h = P5.h;

  /* ============================================================
     24 格底片（面板注册表）—— 三段：叙事 6 / 玩法 9 / 系统 9
     ============================================================ */
  var FRAMES = [
    { no: 1, key: 'map', zh: '王国舆图', en: 'CARTOGRAPHY', icon: 'map', seg: 'story', w: 660, hgt: 560, ds: '蓝晒工程图：廷根市八处地标，可平移缩放，未探索区留白' },
    { no: 2, key: 'codex', zh: '图鉴', en: 'COMPENDIUM', icon: 'book', seg: 'story', w: 620, hgt: 560, ds: '相片档案卡：人物、地点、物品、神秘学与途径阶梯' },
    { no: 3, key: 'chronicle', zh: '编年史', en: 'CHRONICLE', icon: 'scroll', seg: 'story', w: 620, hgt: 560, ds: '打字机报告：大总结、小总结与时间线三视图' },
    { no: 4, key: 'divination', zh: '占卜间', en: 'DIVINATION', icon: 'tarot', seg: 'story', w: 620, hgt: 560, ds: '显影盘塔罗三张牌阵与灵摆，消耗灵性五点' },
    { no: 5, key: 'news', zh: '廷根晚报', en: 'EVENING POST', icon: 'newspaper', seg: 'story', w: 700, hgt: 580, ds: '完整报纸版式——活世界的感知通道' },
    { no: 6, key: 'relations', zh: '人物关系', en: 'LEDGER OF SOULS', icon: 'users', seg: 'story', w: 620, hgt: 560, ds: '底片格关系图：好感与立场双轴，可旁听心声' },

    { no: 7, key: 'dossier', zh: '角色卷宗', en: 'PERSONAL DOSSIER', icon: 'fingerprint', seg: 'play', w: 540, hgt: 540, ds: '六维量筒明细、序列与晋升、非凡特性与状态' },
    { no: 8, key: 'abilities', zh: '序列与能力', en: 'FACULTIES', icon: 'wave', seg: 'play', w: 540, hgt: 520, ds: '观众途径能力、封锁状态与战斗白名单' },
    { no: 9, key: 'inventory', zh: '行囊与装备', en: 'PACK & KIT', icon: 'bag', seg: 'play', w: 600, hgt: 560, ds: '五通用槽加一扮演法槽、物品栏与三级钱袋' },
    { no: 10, key: 'threads', zh: '伏笔台账', en: 'LOOSE THREADS', icon: 'thread', seg: 'play', w: 520, hgt: 460, ds: '活跃伏笔注入上限与已揭晓归档' },
    { no: 11, key: 'board', zh: '战术棋盘', en: 'TACTICAL BOARD', icon: 'board', seg: 'play', w: 680, hgt: 600, ds: '六乘六地形棋盘、战报演绎与能力白名单' },
    { no: 12, key: 'case', zh: '侦探本', en: 'CASE FILE', icon: 'magnifier', seg: 'play', w: 700, hgt: 580, ds: '证据连线板、嫌疑评估与核诡抽取' },
    { no: 13, key: 'domain', zh: '领地经营', en: 'DOMAIN', icon: 'domain', seg: 'play', w: 620, hgt: 540, ds: '政务、军团、产业与污染反噬四页' },
    { no: 14, key: 'theatre', zh: '剧场活动', en: 'THEATRE', icon: 'theatre', seg: 'play', w: 620, hgt: 540, ds: '剧场点数：用元层货币买叙事特权，代价是人性' },
    { no: 15, key: 'studio', zh: '一键生图', en: 'DARKROOM PRESS', icon: 'camera', seg: 'play', w: 600, hgt: 560, ds: '四种摄影工艺预设与显影盘预览' },

    { no: 16, key: 'archive', zh: '档案馆', en: 'ARCHIVE', icon: 'tree', seg: 'sys', w: 620, hgt: 560, ds: '节点树、分支回溯与每节点内联变量快照' },
    { no: 17, key: 'lorebook', zh: '世界书', en: 'LOREBOOK', icon: 'books', seg: 'sys', w: 700, hgt: 580, ds: '多书激活、蓝绿灯、关键词与注入深度尺' },
    { no: 18, key: 'composer', zh: '上下文合成器', en: 'CONTEXT COMPOSER', icon: 'layers', seg: 'sys', w: 680, hgt: 600, ds: '三区装配、块序拖拽、Token 预算与降级顺序' },
    { no: 19, key: 'pipeline', zh: 'API 管线', en: 'MODEL PIPELINE', icon: 'plug', seg: 'sys', w: 640, hgt: 580, ds: '三档执行、双 API、RPM 限速与交火模式' },
    { no: 20, key: 'vars', zh: '变量编辑器', en: 'VARIABLE FORGE', icon: 'terminal', seg: 'sys', w: 600, hgt: 540, ds: 'Zod 校验、路径编辑与非法值拦截' },
    { no: 21, key: 'refiner', zh: '记忆精炼器', en: 'REFINERY', icon: 'beaker', seg: 'sys', w: 600, hgt: 540, ds: '小总结→大总结→二次精炼三级 + 别名洗白' },
    { no: 22, key: 'recall', zh: '记忆召回', en: 'RECOLLECTION', icon: 'database', seg: 'sys', w: 580, hgt: 520, ds: '关键词与向量双档检索，交火模式可选' },
    { no: 23, key: 'letters', zh: '信札', en: 'CORRESPONDENCE', icon: 'quill', seg: 'sys', w: 560, hgt: 560, ds: '聊天列表模式与楼层变量回溯' },
    { no: 24, key: 'settings', zh: '设置', en: 'CONFIGURATION', icon: 'gear', seg: 'sys', w: 640, hgt: 580, ds: '外观、动效、音频、性能、协议与无障碍' }
  ];

  var SEG_NAME = { story: '叙事段', play: '玩法段', sys: '系统段' };

  function spec(key) {
    for (var i = 0; i < FRAMES.length; i++) if (FRAMES[i].key === key) return FRAMES[i];
    return null;
  }

  /* ============================================================
     放大机投影窗口管理
     ============================================================ */
  var wins = {};
  var zTop = 100;
  var cascade = 0;
  var host = null, dock = null, guide = null;

  function ensure() {
    host = host || P5.$('#p5-enlarger');
    dock = dock || P5.$('#p5-dock');
    if (!guide && host) { guide = h('div#p5-snap-guide', { dataset: { on: 0 } }); host.appendChild(guide); }
  }
  function isMobile() { return document.body.dataset.device === 'mobile'; }
  function openCount() { return Object.keys(wins).filter(function (k) { return !wins[k].min; }).length; }

  function open(key, originEl) {
    ensure();
    var sp = spec(key);
    if (!sp || !host) return null;
    if (wins[key]) { if (wins[key].min) restore(key); focus(key); return wins[key].el; }

    if (!isMobile() && openCount() >= 3) {
      var oldest = Object.keys(wins).filter(function (k) { return !wins[k].min && !wins[k].pinned; })[0];
      if (oldest) {
        minimize(oldest);
        P5.notify.info('放大机只有三台', '「' + spec(oldest).zh + '」已收回工作台，点击底片夹可取回。');
      }
    }

    var body = h('div.proj__body', { id: 'p5-body-' + key });
    var titleId = 'p5-projtitle-' + key;
    var el = h('section.proj', {
      id: 'p5-proj-' + key,
      role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': titleId,
      dataset: { key: key, pinned: 0 }
    }, [
      h('header.proj__bar', [
        h('div.proj__title', { id: titleId }, [
          h('span.ic', P5.icon(sp.icon, 15)),
          h('span.zh', sp.zh),
          h('span.en', sp.en),
          h('span.proj__no', 'N°' + String(sp.no).padStart(2, '0'))
        ]),
        h('span'),
        h('div.proj__ctrl', [
          P5.iconBtn('pinned', { id: 'p5-proj-pin-' + key, title: '钉住（游戏时保持可见）', size: 13, onClick: function () { togglePin(key, this); } }),
          P5.iconBtn('collapse', { id: 'p5-proj-half-' + key, title: '并排吸附（左半 / 右半 / 还原）', size: 13, onClick: function () { cycleSnap(key); } }),
          P5.iconBtn('minus', { id: 'p5-proj-min-' + key, title: '收回工作台', size: 13, onClick: function () { minimize(key); } }),
          P5.iconBtn('close', { id: 'p5-proj-close-' + key, title: '关灯（Esc）', size: 13, onClick: function () { close(key); } })
        ])
      ]),
      body
    ]);

    var r = host.getBoundingClientRect();
    if (!isMobile()) {
      var w = Math.min(sp.w, Math.max(320, r.width - 48));
      var hh = Math.min(sp.hgt, Math.max(220, r.height - 32));
      el.style.width = w + 'px';
      el.style.height = hh + 'px';
      el.style.left = Math.max(16, Math.round((r.width - w) / 2) + (cascade % 4) * 26 - 39) + 'px';
      el.style.top = Math.max(12, Math.round((r.height - hh) / 2) + (cascade % 4) * 20 - 30) + 'px';
      cascade++;
    }
    el.style.zIndex = String(++zTop);
    host.appendChild(el);
    wins[key] = { el: el, spec: sp, min: false, pinned: false, snap: 'none' };

    try {
      var render = P5.panels && P5.panels[key];
      P5.mount(body, render ? render() : P5.emptyState('fog', '这一格还没有印出内容。'));
    } catch (err) {
      P5.mount(body, P5.emptyState('alert', '投影失败：' + (err && err.message ? err.message : '未知错误')));
    }
    for (var ci = 0; ci < body.children.length; ci++) {
      if (body.children[ci].classList.contains('tabpanel')) { body.classList.add('proj__body--tabbed'); break; }
    }

    if (originEl) flyFrom(el, originEl);
    bindDrag(key);
    el.addEventListener('pointerdown', function () { focus(key); }, true);
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(key); } });
    focus(key);
    P5.fx.play('open');
    syncDock();
    P5.emit('panel:open', key);
    return el;
  }

  function flyFrom(el, originEl) {
    if (P5.fx.reducedMotion()) return;
    var a = originEl.getBoundingClientRect(), b = el.getBoundingClientRect();
    if (!a.width || !b.width) return;
    var dx = (a.left + a.width / 2) - (b.left + b.width / 2);
    var dy = (a.top + a.height / 2) - (b.top + b.height / 2);
    var sx = Math.max(0.1, a.width / b.width), sy = Math.max(0.1, a.height / b.height);
    el.style.animation = 'none';
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
    el.style.opacity = '0';
    void el.offsetWidth;
    el.style.transition = 'transform 440ms var(--ease-develop), opacity 260ms linear, filter 440ms linear';
    el.style.filter = 'brightness(2)';
    el.style.transform = 'none';
    el.style.opacity = '1';
    global.setTimeout(function () { el.style.filter = ''; }, 200);
    global.setTimeout(function () { el.style.transition = ''; }, 480);
  }

  function focus(key) {
    if (!wins[key]) return;
    Object.keys(wins).forEach(function (k) { wins[k].el.classList.toggle('is-focused', k === key); });
    wins[key].el.style.zIndex = String(++zTop);
  }

  function close(key) {
    var w = wins[key];
    if (!w) return;
    w.el.classList.add('is-closing');
    global.setTimeout(function () { if (w.el.parentNode) w.el.parentNode.removeChild(w.el); }, 210);
    delete wins[key];
    P5.fx.play('close');
    syncDock();
    markFrames();
    P5.emit('panel:close', key);
  }

  function closeTop() {
    var keys = Object.keys(wins).filter(function (k) { return !wins[k].min; });
    if (!keys.length) return false;
    keys.sort(function (a, b) { return Number(wins[b].el.style.zIndex) - Number(wins[a].el.style.zIndex); });
    close(keys[0]);
    return true;
  }
  function closeAll() { Object.keys(wins).forEach(function (k) { close(k); }); }

  function minimize(key) {
    var w = wins[key];
    if (!w) return;
    w.min = true; w.el.hidden = true;
    syncDock(); P5.fx.play('close');
  }
  function restore(key) {
    var w = wins[key];
    if (!w) return;
    w.min = false; w.el.hidden = false;
    focus(key); syncDock(); P5.fx.play('open');
  }
  function togglePin(key, btn) {
    var w = wins[key];
    if (!w) return;
    w.pinned = !w.pinned;
    w.el.dataset.pinned = w.pinned ? 1 : 0;
    if (btn) btn.setAttribute('aria-pressed', w.pinned ? 'true' : 'false');
    P5.notify.info(w.pinned ? '已钉住「' + w.spec.zh + '」' : '已取消钉住',
      w.pinned ? '放大机满员时不会被自动收起。' : null);
  }
  function cycleSnap(key) {
    var w = wins[key];
    if (!w || isMobile()) return;
    var r = host.getBoundingClientRect();
    var order = { none: 'left', left: 'right', right: 'none' };
    w.snap = order[w.snap] || 'left';
    if (w.snap === 'none') {
      w.el.style.width = Math.min(w.spec.w, r.width - 48) + 'px';
      w.el.style.height = Math.min(w.spec.hgt, r.height - 32) + 'px';
      w.el.style.left = Math.round((r.width - parseFloat(w.el.style.width)) / 2) + 'px';
      w.el.style.top = Math.round((r.height - parseFloat(w.el.style.height)) / 2) + 'px';
    } else {
      w.el.style.width = Math.floor(r.width / 2 - 12) + 'px';
      w.el.style.height = (r.height - 16) + 'px';
      w.el.style.top = '8px';
      w.el.style.left = (w.snap === 'left' ? 8 : Math.ceil(r.width / 2 + 4)) + 'px';
    }
    P5.fx.play('plate');
  }

  function bindDrag(key) {
    var w = wins[key];
    var bar = w.el.querySelector('.proj__bar');
    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, snapTo = null;
    bar.addEventListener('pointerdown', function (e) {
      if (isMobile() || e.target.closest('.icon-btn')) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      ox = parseFloat(w.el.style.left) || 0; oy = parseFloat(w.el.style.top) || 0;
      bar.setPointerCapture(e.pointerId);
      w.el.style.willChange = 'left, top';
    });
    bar.addEventListener('pointermove', P5.rafThrottle(function (e) {
      if (!dragging) return;
      var r = host.getBoundingClientRect();
      var nw = w.el.offsetWidth;
      w.el.style.left = P5.clamp(ox + (e.clientX - sx), -nw + 90, r.width - 90) + 'px';
      w.el.style.top = P5.clamp(oy + (e.clientY - sy), 0, r.height - 38) + 'px';
      var edge = 40; snapTo = null;
      if (e.clientX - r.left < edge) snapTo = 'left';
      else if (r.right - e.clientX < edge) snapTo = 'right';
      if (snapTo) {
        guide.style.top = '8px';
        guide.style.height = (r.height - 16) + 'px';
        guide.style.width = Math.floor(r.width / 2 - 12) + 'px';
        guide.style.left = (snapTo === 'left' ? 8 : Math.ceil(r.width / 2 + 4)) + 'px';
        guide.dataset.on = '1';
      } else guide.dataset.on = '0';
    }));
    function end() {
      if (!dragging) return;
      dragging = false;
      w.el.style.willChange = '';
      guide.dataset.on = '0';
      if (snapTo) { w.snap = snapTo === 'left' ? 'right' : 'left'; cycleSnap(key); snapTo = null; }
    }
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
    bar.addEventListener('dblclick', function (e) { if (!e.target.closest('.icon-btn')) cycleSnap(key); });
  }

  /* 工作台只放「已收回的底片夹」；打开中的窗口不在此重复出现（避免入口冗余） */
  function syncDock() {
    ensure();
    if (!dock) return;
    P5.clear(dock);
    var mins = Object.keys(wins).filter(function (k) { return wins[k].min; });
    if (!mins.length) {
      dock.appendChild(h('span.dock-empty', '工作台空置 · 按反引号键取样张'));
      markFrames();
      return;
    }
    mins.forEach(function (k) {
      var sp = spec(k);
      dock.appendChild(h('button.dock-chip', {
        type: 'button', id: 'p5-dockmin-' + k, title: '取回「' + sp.zh + '」',
        onClick: function () { restore(k); }
      }, [P5.icon(sp.icon, 13), h('span', sp.zh), P5.icon('expand', 11)]));
    });
    markFrames();
  }

  /* ============================================================
     接触印相样张（唯一入口）
     ============================================================ */
  var sheetEl = null, frameEls = [], descEl = null, cursor = 0;

  function buildSheet() {
    sheetEl = P5.$('#p5-contact');
    if (!sheetEl) return;
    var paper = P5.$('#p5-sheet-paper');
    descEl = P5.$('#p5-sheet-desc');
    P5.clear(paper);
    var grid = h('div.sheet-grid', { role: 'group', 'aria-label': '二十四格底片：面板索引' });
    frameEls = FRAMES.map(function (f, i) {
      var el = h('button.sheet-frame', {
        type: 'button',
        id: 'p5-frame-' + f.key,
        dataset: { seg: f.seg, key: f.key, open: 0 },
        'aria-label': 'N°' + f.no + ' ' + f.zh + '：' + f.ds,
        onmouseenter: function () { setCursor(i); },
        onfocus: function () { setCursor(i); },
        onclick: function () { pick(i); }
      }, [
        h('span.sheet-frame__no', String(f.no).padStart(2, '0')),
        h('span.sheet-frame__ic', P5.icon(f.icon, 17)),
        h('span.sheet-frame__lb', f.zh)
      ]);
      grid.appendChild(el);
      return el;
    });
    paper.appendChild(grid);
    sheetEl.addEventListener('pointerdown', function (e) {
      if (e.target === sheetEl || e.target.id === 'p5-sheet-paper') closeSheet();
    });
  }

  function setCursor(i) {
    cursor = i;
    frameEls.forEach(function (n, j) { n.classList.toggle('is-cursor', j === i); });
    if (descEl) {
      var f = FRAMES[i];
      descEl.textContent = 'N°' + String(f.no).padStart(2, '0') + '　【' + SEG_NAME[f.seg] + '】' + f.zh + ' —— ' + f.ds;
    }
  }
  function pick(i) {
    var f = FRAMES[i], origin = frameEls[i];
    closeSheet();
    global.setTimeout(function () { open(f.key, origin); }, 140);
  }
  function markFrames() {
    frameEls.forEach(function (n) { n.dataset.open = wins[n.dataset.key] ? 1 : 0; });
  }
  function openSheet() {
    if (!sheetEl) buildSheet();
    if (!sheetEl) return;
    markFrames();
    frameEls.forEach(function (n) { n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; });
    sheetEl.dataset.open = '1';
    document.body.classList.add('contact-open');
    P5.fx.play('fog');
    setCursor(cursor);
    global.setTimeout(function () { if (frameEls[cursor]) frameEls[cursor].focus(); }, 80);
  }
  function closeSheet() {
    if (!sheetEl) return;
    sheetEl.dataset.open = '0';
    document.body.classList.remove('contact-open');
  }
  function isSheetOpen() { return sheetEl && sheetEl.dataset.open === '1'; }
  function toggleSheet() { if (isSheetOpen()) closeSheet(); else openSheet(); }

  /* 样张内方向键：6 列网格 */
  function moveCursor(dx, dy) {
    var COLS = isMobile() ? 3 : 6;
    var col = cursor % COLS, row = Math.floor(cursor / COLS);
    var rows = Math.ceil(FRAMES.length / COLS);
    col = (col + dx + COLS) % COLS;
    row = (row + dy + rows) % rows;
    var idx = row * COLS + col;
    if (idx >= FRAMES.length) idx = FRAMES.length - 1;
    setCursor(idx);
    frameEls[idx].focus();
  }

  document.addEventListener('keydown', function (e) {
    if (!isSheetOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); moveCursor(1, 0); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveCursor(-1, 0); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveCursor(0, 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveCursor(0, -1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(cursor); }
  });

  global.addEventListener('resize', P5.debounce(function () {
    if (isMobile()) return;
    ensure();
    if (!host) return;
    var r = host.getBoundingClientRect();
    Object.keys(wins).forEach(function (k) {
      var el = wins[k].el;
      el.style.left = Math.min(parseFloat(el.style.left) || 8, Math.max(8, r.width - el.offsetWidth - 8)) + 'px';
      el.style.top = Math.min(parseFloat(el.style.top) || 8, Math.max(8, r.height - 40)) + 'px';
      if (el.offsetWidth > r.width - 24) el.style.width = (r.width - 24) + 'px';
      if (el.offsetHeight > r.height - 20) el.style.height = (r.height - 20) + 'px';
    });
  }, 200));

  P5.sheet = {
    frames: FRAMES,
    segName: SEG_NAME,
    spec: spec,
    open: open,
    close: close,
    closeTop: closeTop,
    closeAll: closeAll,
    minimize: minimize,
    restore: restore,
    syncDock: syncDock,
    openSheet: openSheet,
    closeSheet: closeSheet,
    toggleSheet: toggleSheet,
    isSheetOpen: isSheetOpen,
    isOpen: function (k) { return !!wins[k]; }
  };
  /* 兼容自 P4 移植的面板里的 docket 调用 */
  P5.docket = P5.sheet;
  P5.docket.registry = FRAMES;
})(window);
