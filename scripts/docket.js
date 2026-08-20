/* ===========================================================
   docket.js —— 多窗口案台 + 灰雾星图启动器
   窗口：拖拽 / 边缘吸附并排 / 最小化到银轨 / 钉住 / 层级
   星图：22 面板化为星座节点，连线绘制，键盘可达
   =========================================================== */
(function (global) {
  'use strict';
  var P4 = global.P4 = global.P4 || {};
  var h = P4.h;

  /* =======================================================
     面板注册表（星座坐标为设计值，非随机）
     ======================================================= */
  var REGISTRY = [
    { key: 'dossier', zh: '角色卷宗', lat: 'PERSONAL DOSSIER', icon: 'fingerprint', clan: 'self', x: 10, y: 30, w: 520, hgt: 520, desc: '六维、序列、非凡特性与状态异常的全貌' },
    { key: 'inventory', zh: '行囊与装备', lat: 'PACK & KIT', icon: 'bag', clan: 'self', x: 6, y: 52, w: 600, hgt: 540, desc: '五通用槽加一扮演法槽、十六件物品与三级账本' },
    { key: 'abilities', zh: '能力簿', lat: 'FACULTIES', icon: 'wave', clan: 'self', x: 16, y: 72, w: 520, hgt: 500, desc: '观众途径已掌握能力、封锁状态与战斗白名单' },

    { key: 'relations', zh: '人物关系', lat: 'LEDGER OF SOULS', icon: 'users', clan: 'world', x: 28, y: 14, w: 600, hgt: 540, desc: '七位相识的好感与立场双轴，快速互动' },
    { key: 'map', zh: '王国舆图', lat: 'CARTOGRAPHY', icon: 'map', clan: 'world', x: 32, y: 36, w: 660, hgt: 560, desc: '廷根市八处地标，可平移缩放，迷雾未探索区' },
    { key: 'codex', zh: '图鉴', lat: 'COMPENDIUM', icon: 'book', clan: 'world', x: 24, y: 58, w: 620, hgt: 560, desc: '人物、地点、物品、神秘学与途径阶梯' },
    { key: 'news', zh: '鲁恩日报', lat: 'EVENING POST', icon: 'newspaper', clan: 'world', x: 34, y: 78, w: 700, hgt: 580, desc: '世界正在发生的事——活世界的感知通道' },

    { key: 'chronicle', zh: '编年史', lat: 'CHRONICLE', icon: 'scroll', clan: 'memory', x: 48, y: 22, w: 620, hgt: 560, desc: '大总结、小总结与时间线三视图' },
    { key: 'recall', zh: '记忆召回', lat: 'RECOLLECTION', icon: 'database', clan: 'memory', x: 44, y: 44, w: 580, hgt: 520, desc: '关键词与向量双档检索，交火模式可选' },
    { key: 'threads', zh: '伏笔台账', lat: 'LOOSE THREADS', icon: 'thread', clan: 'memory', x: 52, y: 64, w: 520, hgt: 460, desc: '活跃伏笔上限注入，已揭晓归档' },
    { key: 'archive', zh: '档案馆', lat: 'ARCHIVE', icon: 'tree', clan: 'memory', x: 42, y: 84, w: 620, hgt: 560, desc: '存档节点树、分支回溯与变量快照' },

    { key: 'divination', zh: '占卜间', lat: 'DIVINATION', icon: 'tarot', clan: 'occult', x: 64, y: 12, w: 620, hgt: 560, desc: '塔罗三张牌阵与灵摆，消耗灵性五点' },
    { key: 'board', zh: '战术推演', lat: 'TACTICAL BOARD', icon: 'board', clan: 'occult', x: 68, y: 34, w: 680, hgt: 600, desc: '六乘六地形棋盘、战报演绎与能力白名单' },
    { key: 'case', zh: '侦探案卷', lat: 'CASE FILE', icon: 'magnifier', clan: 'occult', x: 62, y: 54, w: 700, hgt: 580, desc: '证据连线板、嫌疑评估与核诡抽取' },
    { key: 'domain', zh: '领地经营', lat: 'DOMAIN', icon: 'domain', clan: 'occult', x: 70, y: 74, w: 620, hgt: 540, desc: '政务、军团、产业与污染反噬四页' },

    { key: 'studio', zh: '显影室', lat: 'DARKROOM', icon: 'camera', clan: 'forge', x: 78, y: 52, w: 600, hgt: 560, desc: '一键生图：提示词套装、尺寸与风格' },

    { key: 'lorebook', zh: '世界书', lat: 'LOREBOOK', icon: 'books', clan: 'tavern', x: 86, y: 16, w: 700, hgt: 580, desc: '多书激活、蓝绿灯、关键词与注入位置' },
    { key: 'composer', zh: '上下文合成器', lat: 'CONTEXT COMPOSER', icon: 'layers', clan: 'tavern', x: 92, y: 36, w: 680, hgt: 600, desc: '三区装配、块序拖拽与 Token 预算' },
    { key: 'pipeline', zh: '模型与管线', lat: 'MODEL PIPELINE', icon: 'plug', clan: 'tavern', x: 86, y: 56, w: 640, hgt: 580, desc: '三档执行、双 API 与 RPM 限速' },
    { key: 'vars', zh: '变量工坊', lat: 'VARIABLE FORGE', icon: 'terminal', clan: 'tavern', x: 92, y: 76, w: 600, hgt: 540, desc: 'Zod 校验、路径编辑与非法值拦截' },
    { key: 'letters', zh: '信札', lat: 'CORRESPONDENCE', icon: 'quill', clan: 'tavern', x: 78, y: 90, w: 560, hgt: 560, desc: '聊天列表模式与楼层变量回溯' },

    { key: 'settings', zh: '台务设置', lat: 'CONFIGURATION', icon: 'gear', clan: 'system', x: 56, y: 90, w: 640, hgt: 580, desc: '外观、动效、音频、性能与无障碍' }
  ];

  var CLAN_NAME = {
    self: '自身', world: '世界', memory: '记忆', occult: '神秘', forge: '工坊', tavern: '酒馆', system: '系统'
  };

  var LINKS = [
    [0, 1], [1, 2],
    [3, 4], [4, 5], [5, 6],
    [7, 8], [8, 9], [9, 10],
    [11, 12], [12, 13], [13, 14],
    [16, 17], [17, 18], [18, 19], [19, 20],
    [1, 4], [8, 12], [15, 18], [10, 21], [6, 7], [14, 15]
  ];

  function spec(key) {
    for (var i = 0; i < REGISTRY.length; i++) if (REGISTRY[i].key === key) return REGISTRY[i];
    return null;
  }

  /* =======================================================
     窗口管理
     ======================================================= */
  var wins = {};        /* key -> {el, spec, minimized, pinned} */
  var zTop = 100;
  var cascade = 0;
  var host = null, dockStrip = null, guide = null;

  function ensure() {
    host = host || P4.$('#p4-docket');
    dockStrip = dockStrip || P4.$('#p4-dock-strip');
    if (!guide) {
      guide = h('div#p4-snap-guide', { dataset: { on: 0 } });
      if (host) host.appendChild(guide);
    }
  }

  function isMobile() { return document.body.dataset.device === 'mobile'; }

  function openCount() {
    return Object.keys(wins).filter(function (k) { return !wins[k].minimized; }).length;
  }

  function open(key, originEl) {
    ensure();
    var sp = spec(key);
    if (!sp || !host) return null;

    if (wins[key]) {
      if (wins[key].minimized) restore(key);
      focusWin(key);
      return wins[key].el;
    }

    /* 同屏窗口上限：自动最小化最旧的一个 */
    if (!isMobile() && openCount() >= 3) {
      var oldest = Object.keys(wins).filter(function (k) { return !wins[k].minimized && !wins[k].pinned; })[0];
      if (oldest) {
        minimize(oldest);
        P4.notify.info('案台已满', '「' + spec(oldest).zh + '」已收进银轨，点击轨上胶片格可取回。');
      }
    }

    var body = h('div.win__body', { id: 'p4-panelbody-' + key });
    var titleId = 'p4-wintitle-' + key;
    var el = h('section.win', {
      id: 'p4-win-' + key,
      role: 'dialog',
      'aria-modal': 'false',
      'aria-labelledby': titleId,
      dataset: { key: key, pinned: 0 }
    }, [
      h('header.win__bar', [
        h('div.win__title', { id: titleId }, [
          h('span.ic', P4.icon(sp.icon, 15)),
          h('span.zh', sp.zh),
          h('span.lat', sp.lat)
        ]),
        h('span'),
        h('div.win__ctrl', [
          P4.iconBtn('pinned', {
            id: 'p4-win-pin-' + key, title: '钉住此窗（游戏时保持可见）', size: 13,
            onClick: function () { togglePin(key, this); }
          }),
          P4.iconBtn('collapse', {
            id: 'p4-win-half-' + key, title: '并排吸附（左半 / 右半 / 还原）', size: 13,
            onClick: function () { cycleSnap(key); }
          }),
          P4.iconBtn('minus', {
            id: 'p4-win-min-' + key, title: '最小化到银轨', size: 13,
            onClick: function () { minimize(key); }
          }),
          P4.iconBtn('close', {
            id: 'p4-win-close-' + key, title: '关闭（Esc）', size: 13,
            onClick: function () { close(key); }
          })
        ])
      ]),
      body
    ]);

    /* 尺寸与位置 */
    var hostRect = host.getBoundingClientRect();
    if (!isMobile()) {
      var w = Math.min(sp.w, Math.max(320, hostRect.width - 48));
      var hh = Math.min(sp.hgt, Math.max(220, hostRect.height - 32));
      var left = Math.max(16, Math.round((hostRect.width - w) / 2) + (cascade % 4) * 26 - 39);
      var top = Math.max(12, Math.round((hostRect.height - hh) / 2) + (cascade % 4) * 20 - 30);
      cascade++;
      el.style.width = w + 'px';
      el.style.height = hh + 'px';
      el.style.left = left + 'px';
      el.style.top = top + 'px';
    }
    el.style.zIndex = String(++zTop);

    host.appendChild(el);
    wins[key] = { el: el, spec: sp, minimized: false, pinned: false, snap: 'none' };

    /* 内容：首次打开才构建 */
    try {
      var render = P4.panels && P4.panels[key];
      P4.mount(body, render ? render() : P4.emptyState('fog', '此面板尚未装配。'));
    } catch (err) {
      P4.mount(body, P4.emptyState('alert', '面板装配失败：' + (err && err.message ? err.message : '未知错误')));
    }
    /* 若面板使用标签页：页签固定，仅内容区滚动 */
    for (var ci = 0; ci < body.children.length; ci++) {
      if (body.children[ci].classList.contains('tabpanel')) {
        body.classList.add('win__body--tabbed');
        break;
      }
    }

    if (originEl) flyFrom(el, originEl);
    bindDrag(key);
    el.addEventListener('pointerdown', function () { focusWin(key); }, true);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(key); }
    });
    focusWin(key);
    P4.fx.play('open');
    syncDock();
    P4.emit('panel:open', key);
    return el;
  }

  function flyFrom(el, originEl) {
    if (P4.fx.reducedMotion()) return;
    var a = originEl.getBoundingClientRect();
    var b = el.getBoundingClientRect();
    if (!a.width || !b.width) return;
    var dx = (a.left + a.width / 2) - (b.left + b.width / 2);
    var dy = (a.top + a.height / 2) - (b.top + b.height / 2);
    var sx = Math.max(0.12, a.width / b.width);
    var sy = Math.max(0.12, a.height / b.height);
    el.style.animation = 'none';
    el.style.transformOrigin = 'center';
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
    el.style.opacity = '0';
    void el.offsetWidth;
    el.style.transition = 'transform 420ms var(--ease-instrument), opacity 260ms linear';
    el.style.transform = 'none';
    el.style.opacity = '1';
    global.setTimeout(function () { el.style.transition = ''; }, 460);
  }

  function focusWin(key) {
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
    P4.fx.play('close');
    syncDock();
    P4.emit('panel:close', key);
  }

  function closeTop() {
    var keys = Object.keys(wins).filter(function (k) { return !wins[k].minimized; });
    if (!keys.length) return false;
    keys.sort(function (a, b) { return Number(wins[b].el.style.zIndex) - Number(wins[a].el.style.zIndex); });
    close(keys[0]);
    return true;
  }

  function minimize(key) {
    var w = wins[key];
    if (!w) return;
    w.minimized = true;
    w.el.hidden = true;
    syncDock();
    P4.fx.play('close');
  }

  function restore(key) {
    var w = wins[key];
    if (!w) return;
    w.minimized = false;
    w.el.hidden = false;
    focusWin(key);
    syncDock();
    P4.fx.play('open');
  }

  function togglePin(key, btn) {
    var w = wins[key];
    if (!w) return;
    w.pinned = !w.pinned;
    w.el.dataset.pinned = w.pinned ? 1 : 0;
    if (btn) btn.setAttribute('aria-pressed', w.pinned ? 'true' : 'false');
    P4.notify.info(w.pinned ? '已钉住「' + w.spec.zh + '」' : '已取消钉住', w.pinned ? '案台满员时不会被自动收起。' : null);
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
    P4.fx.play('plate');
  }

  function bindDrag(key) {
    var w = wins[key];
    var bar = w.el.querySelector('.win__bar');
    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, snapTo = null;

    bar.addEventListener('pointerdown', function (e) {
      if (isMobile()) return;
      if (e.target.closest('.icon-btn')) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(w.el.style.left) || 0;
      oy = parseFloat(w.el.style.top) || 0;
      bar.setPointerCapture(e.pointerId);
      w.el.style.willChange = 'left, top';
    });
    bar.addEventListener('pointermove', P4.rafThrottle(function (e) {
      if (!dragging) return;
      var r = host.getBoundingClientRect();
      var nw = w.el.offsetWidth, nh = w.el.offsetHeight;
      var nx = P4.clamp(ox + (e.clientX - sx), -nw + 90, r.width - 90);
      var ny = P4.clamp(oy + (e.clientY - sy), 0, r.height - 36);
      w.el.style.left = nx + 'px';
      w.el.style.top = ny + 'px';
      /* 边缘吸附提示 */
      var edge = 40;
      snapTo = null;
      if (e.clientX - r.left < edge) snapTo = 'left';
      else if (r.right - e.clientX < edge) snapTo = 'right';
      if (snapTo) {
        guide.style.top = '8px';
        guide.style.height = (r.height - 16) + 'px';
        guide.style.width = Math.floor(r.width / 2 - 12) + 'px';
        guide.style.left = (snapTo === 'left' ? 8 : Math.ceil(r.width / 2 + 4)) + 'px';
        guide.dataset.on = '1';
      } else {
        guide.dataset.on = '0';
      }
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
    bar.addEventListener('dblclick', function (e) {
      if (e.target.closest('.icon-btn')) return;
      cycleSnap(key);
    });
  }

  function syncDock() {
    ensure();
    if (!dockStrip) return;
    P4.clear(dockStrip);
    var mins = Object.keys(wins).filter(function (k) { return wins[k].minimized; });
    var opens = Object.keys(wins).filter(function (k) { return !wins[k].minimized; });
    if (!mins.length && !opens.length) {
      dockStrip.appendChild(h('span.dock-empty', '银轨空置 · 按反引号键展开灰雾星图'));
      return;
    }
    opens.forEach(function (k) {
      var sp = spec(k);
      dockStrip.appendChild(h('button.dock-chip', {
        type: 'button', id: 'p4-dockopen-' + k, title: '聚焦「' + sp.zh + '」',
        style: { borderColor: 'color-mix(in srgb, var(--silver) 62%, transparent)' },
        onClick: function () { focusWin(k); }
      }, [P4.icon(sp.icon, 13), h('span', sp.zh)]));
    });
    mins.forEach(function (k) {
      var sp = spec(k);
      dockStrip.appendChild(h('button.dock-chip', {
        type: 'button', id: 'p4-dockmin-' + k, title: '取回「' + sp.zh + '」',
        onClick: function () { restore(k); }
      }, [P4.icon(sp.icon, 13), h('span', sp.zh), P4.icon('expand', 11)]));
    });
  }

  function closeAll() {
    Object.keys(wins).forEach(function (k) { close(k); });
  }

  /* =======================================================
     灰雾星图启动器
     ======================================================= */
  var fogEl = null, cursor = 0, descEl = null, nodesEls = [], linkEls = [];

  function buildFog() {
    fogEl = P4.$('#p4-fog');
    if (!fogEl) return;
    var area = P4.$('#p4-constellation');
    descEl = P4.$('#p4-fog-desc');
    P4.clear(area);

    /* 连线（quadratic 曲线，逐段绘制） */
    var svg = h('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    linkEls = LINKS.map(function (pair) {
      var a = REGISTRY[pair[0]], b = REGISTRY[pair[1]];
      var mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.07;
      var my = (a.y + b.y) / 2 - (b.x - a.x) * 0.07;
      var p = h('path.const-link', {
        d: 'M' + a.x + ',' + a.y + ' Q' + mx + ',' + my + ' ' + b.x + ',' + b.y,
        'vector-effect': 'non-scaling-stroke',
        style: { animationDelay: (Math.random() * 220).toFixed(0) + 'ms' }
      });
      p.__pair = pair;
      return p;
    });
    linkEls.forEach(function (p) { svg.appendChild(p); });
    area.appendChild(svg);

    nodesEls = REGISTRY.map(function (sp, i) {
      var node = h('button.const-node', {
        type: 'button',
        id: 'p4-star-' + sp.key,
        dataset: { clan: sp.clan, key: sp.key, open: 0 },
        style: { left: sp.x + '%', top: sp.y + '%' },
        'aria-label': sp.zh + '：' + sp.desc,
        onmouseenter: function () { setCursor(i); },
        onfocus: function () { setCursor(i); },
        onclick: function () { pick(i); }
      }, [
        h('span.const-node__star', P4.icon(sp.icon, 16)),
        h('span.const-node__lb', sp.zh)
      ]);
      area.appendChild(node);
      return node;
    });

    fogEl.addEventListener('pointerdown', function (e) {
      if (e.target === fogEl || e.target.id === 'p4-constellation') closeFog();
    });
  }

  function setCursor(i) {
    cursor = i;
    nodesEls.forEach(function (n, j) { n.classList.toggle('is-cursor', j === i); });
    linkEls.forEach(function (p) {
      p.classList.toggle('is-hot', p.__pair[0] === i || p.__pair[1] === i);
    });
    if (descEl) {
      var sp = REGISTRY[i];
      descEl.textContent = '【' + CLAN_NAME[sp.clan] + '】' + sp.zh + ' —— ' + sp.desc;
    }
  }

  function pick(i) {
    var sp = REGISTRY[i];
    var origin = nodesEls[i];
    closeFog();
    global.setTimeout(function () { open(sp.key, origin); }, 140);
  }

  function openFog() {
    if (!fogEl) buildFog();
    if (!fogEl) return;
    /* 重置连线动画 */
    linkEls.forEach(function (p) { p.style.animation = 'none'; void p.getBoundingClientRect(); p.style.animation = ''; });
    nodesEls.forEach(function (n) { n.dataset.open = wins[n.dataset.key] ? 1 : 0; });
    fogEl.dataset.open = '1';
    document.body.classList.add('fog-open');
    P4.fx.play('fog');
    setCursor(cursor);
    global.setTimeout(function () { if (nodesEls[cursor]) nodesEls[cursor].focus(); }, 80);
  }

  function closeFog() {
    if (!fogEl) return;
    fogEl.dataset.open = '0';
    document.body.classList.remove('fog-open');
  }

  function isFogOpen() { return fogEl && fogEl.dataset.open === '1'; }

  function toggleFog() { if (isFogOpen()) closeFog(); else openFog(); }

  /* 星座内方向键导航：找该方向上角度最接近、距离最近的节点 */
  function moveCursor(dx, dy) {
    var cur = REGISTRY[cursor];
    var best = -1, bestScore = Infinity;
    REGISTRY.forEach(function (sp, i) {
      if (i === cursor) return;
      var vx = sp.x - cur.x, vy = sp.y - cur.y;
      var dot = vx * dx + vy * dy;
      if (dot <= 0) return;
      var dist = Math.sqrt(vx * vx + vy * vy);
      var align = dot / (dist || 1);
      if (align < 0.35) return;
      var score = dist / (align * align);
      if (score < bestScore) { bestScore = score; best = i; }
    });
    if (best >= 0) { setCursor(best); nodesEls[best].focus(); }
  }

  /* 键盘 */
  document.addEventListener('keydown', function (e) {
    if (isFogOpen()) {
      if (e.key === 'Escape') { e.preventDefault(); closeFog(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); moveCursor(1, 0); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); moveCursor(-1, 0); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); moveCursor(0, 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveCursor(0, -1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(cursor); }
    }
  });

  global.addEventListener('resize', P4.debounce(function () {
    if (isMobile()) return;
    ensure();
    if (!host) return;
    var r = host.getBoundingClientRect();
    Object.keys(wins).forEach(function (k) {
      var w = wins[k];
      var el = w.el;
      var maxL = Math.max(8, r.width - el.offsetWidth - 8);
      var maxT = Math.max(8, r.height - 40);
      el.style.left = Math.min(parseFloat(el.style.left) || 8, maxL) + 'px';
      el.style.top = Math.min(parseFloat(el.style.top) || 8, maxT) + 'px';
      if (el.offsetWidth > r.width - 24) el.style.width = (r.width - 24) + 'px';
      if (el.offsetHeight > r.height - 20) el.style.height = (r.height - 20) + 'px';
    });
  }, 200));

  P4.docket = {
    registry: REGISTRY,
    clanName: CLAN_NAME,
    spec: spec,
    open: open,
    close: close,
    closeTop: closeTop,
    closeAll: closeAll,
    minimize: minimize,
    restore: restore,
    syncDock: syncDock,
    openFog: openFog,
    closeFog: closeFog,
    toggleFog: toggleFog,
    isFogOpen: isFogOpen,
    isOpen: function (k) { return !!wins[k]; }
  };
})(window);
