/* ============================================================
   诡秘剧场 · 原型3 — DOM 工具 / 通知 / 确认 / 幻灯投影 / 纸袋抽屉
   全部内部实现，绝不使用 alert / confirm / prompt
   ============================================================ */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     h(tag, props, ...children) —— 极简元素工厂
     tag 支持 'div.cls#id'；children 递归展平数组，支持字符串/节点/null
     ------------------------------------------------------------ */
  function h(tag, props) {
    var m = /^([a-zA-Z][\w-]*)?((?:[.#][\w-]+)*)$/.exec(tag || 'div');
    var name = (m && m[1]) || 'div';
    var el = document.createElement(name);
    if (m && m[2]) {
      var parts = m[2].match(/[.#][\w-]+/g) || [];
      for (var i = 0; i < parts.length; i++) {
        if (parts[i][0] === '.') el.classList.add(parts[i].slice(1));
        else el.id = parts[i].slice(1);
      }
    }
    if (props) {
      for (var k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
        var v = props[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class' || k === 'className') { el.className = (el.className ? el.className + ' ' : '') + v; }
        else if (k === 'style' && typeof v === 'object') { for (var s in v) el.style.setProperty(s, v[s]); }
        else if (k === 'html') { el.innerHTML = v; }
        else if (k === 'text') { el.textContent = v; }
        else if (k === 'dataset') { for (var d in v) el.dataset[d] = v[d]; }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') { el.addEventListener(k.slice(2).toLowerCase(), v); }
        else if (v === true) { el.setAttribute(k, ''); }
        else { el.setAttribute(k, v); }
      }
    }
    var rest = Array.prototype.slice.call(arguments, 2);
    append(el, rest);
    return el;
  }

  function append(el, kids) {
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (c === null || c === undefined || c === false || c === true) continue;
      if (Array.isArray(c)) { append(el, c); continue; }
      if (typeof c === 'string' || typeof c === 'number') { el.appendChild(document.createTextNode(String(c))); continue; }
      if (c.nodeType) { el.appendChild(c); }
    }
  }

  function ico(name, cls) { return window.ICONS.node(name, cls || 'ico'); }
  function frag() { var f = document.createDocumentFragment(); append(f, Array.prototype.slice.call(arguments)); return f; }
  function clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); return el; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* 题头（中文粗体 + 西文小字） */
  function head(title, latin) {
    return h('div', null, h('div.ttl', { text: title }), latin ? h('span.eyebrow', { text: latin }) : null);
  }

  /* 键值行 */
  function kv(k, v, tone) {
    return h('div.kvrow' + (tone ? '.is-' + tone : ''), null,
      h('span.kv-k', { text: k }),
      h('span.kv-v', { text: String(v) })
    );
  }

  /* ------------------------------------------------------------
     Toast —— 晾片绳小样
     ------------------------------------------------------------ */
  var toastHost = null;
  var TONE_ICO = { info: 'info', good: 'check', warn: 'warning', red: 'safelight' };

  function toast(opt) {
    if (!toastHost) toastHost = document.getElementById('p3-toasts');
    if (!toastHost) return;
    opt = typeof opt === 'string' ? { title: opt } : (opt || {});
    var tone = opt.tone || 'info';
    var life = opt.life || 4200;
    var card = h('article.toast', { dataset: { tone: tone }, role: 'status' },
      ico(opt.icon || TONE_ICO[tone] || 'info', 'ico ico--sm t-ico'),
      h('div', null,
        h('div.t-ttl', { text: opt.title || '提示' }),
        opt.msg ? h('div.t-msg', { text: opt.msg }) : null
      ),
      h('button.t-close', { type: 'button', 'aria-label': '关闭通知' }, ico('close', 'ico ico--sm')),
      h('i.t-bar', { style: { 'animation-duration': life + 'ms' } })
    );
    var timer = null;
    function out() {
      if (card.classList.contains('is-out')) return;
      clearTimeout(timer);
      card.classList.add('is-out');
      setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 380);
    }
    card.querySelector('.t-close').addEventListener('click', out);
    /* 卡片本身 pointer-events:none（不遮挡底层控件），因此不做 hover 暂停 */
    toastHost.appendChild(card);
    while (toastHost.children.length > 4) toastHost.removeChild(toastHost.firstChild);
    timer = setTimeout(out, life);
    return card;
  }

  /* ------------------------------------------------------------
     确认框 —— 显影计时器（转盘倒数）
     ------------------------------------------------------------ */
  var timerBox = null, timerState = null;

  function ensureTimerBox() {
    if (timerBox) return timerBox;
    timerBox = document.getElementById('p3-timerbox');
    return timerBox;
  }

  function confirmBox(opt) {
    var box = ensureTimerBox();
    if (!box) return Promise.resolve(false);
    opt = opt || {};
    return new Promise(function (resolve) {
      var R = 34, C = 2 * Math.PI * R;
      var ring = null, raf = null, t0 = 0;
      var dur = opt.countdown ? opt.countdown * 1000 : 0;

      function done(v) {
        if (raf) cancelAnimationFrame(raf);
        document.removeEventListener('keydown', onKey, true);
        box.classList.remove('is-open');
        timerState = null;
        setTimeout(function () { clear(box); }, 260);
        resolve(v);
      }
      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); }
        else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); done(true); }
      }

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 84 84');
      var bg = document.createElementNS(svgNS, 'circle');
      bg.setAttribute('class', 'ring-bg'); bg.setAttribute('cx', '42'); bg.setAttribute('cy', '42');
      bg.setAttribute('r', String(R)); bg.setAttribute('fill', 'none'); bg.setAttribute('stroke-width', '2');
      ring = document.createElementNS(svgNS, 'circle');
      ring.setAttribute('class', 'ring-fg'); ring.setAttribute('cx', '42'); ring.setAttribute('cy', '42');
      ring.setAttribute('r', String(R)); ring.setAttribute('fill', 'none'); ring.setAttribute('stroke-width', '2.6');
      ring.setAttribute('stroke-dasharray', String(C));
      ring.setAttribute('stroke-dashoffset', dur ? String(C) : '0');
      svg.appendChild(bg); svg.appendChild(ring);

      var card = h('div.timer-card', { role: 'alertdialog', 'aria-modal': 'true', 'aria-label': opt.title || '确认' },
        h('div.timer-dial', null, svg, ico(opt.icon || 'warning', 'ico ico--lg dial-ico')),
        h('div', { style: { padding: '0 24px 6px', 'text-align': 'center' } },
          h('h2', { class: 'u-display', style: { 'font-size': 'var(--fs-lg)', color: 'var(--paper)' }, text: opt.title || '确认此项操作' }),
          h('p', { style: { 'margin-top': '10px', 'font-size': 'var(--fs-sm)', color: 'var(--txt-2)', 'line-height': '1.8' }, text: opt.msg || '' }),
          opt.detail ? h('p', { class: 'u-mono', style: { 'margin-top': '8px', 'font-size': 'var(--fs-2xs)', color: 'var(--txt-3)' }, text: opt.detail }) : null
        ),
        h('div', { class: 'row', style: { gap: '10px', padding: '18px 24px 22px' } },
          h('button.btn.btn--ghost.grow', { type: 'button', id: 'p3-confirm-no', onclick: function () { done(false); } },
            ico('close', 'ico ico--sm'), h('span', { text: opt.cancelText || '倒掉（取消）' })),
          h('button.btn.btn--primary.grow', { type: 'button', id: 'p3-confirm-yes', onclick: function () { done(true); } },
            ico('check', 'ico ico--sm'), h('span', { text: opt.okText || '显影（确认）' }))
        )
      );

      clear(box).appendChild(card);
      box.classList.add('is-open');
      document.addEventListener('keydown', onKey, true);
      timerState = { done: done };
      setTimeout(function () { var y = document.getElementById('p3-confirm-yes'); if (y) y.focus(); }, 120);

      if (dur) {
        t0 = performance.now();
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur);
          ring.setAttribute('stroke-dashoffset', String(C * (1 - p)));
          if (p < 1) raf = requestAnimationFrame(tick);
          else done(false);
        })(t0);
      } else {
        ring.setAttribute('stroke-dashoffset', '0');
      }
    });
  }

  /* ------------------------------------------------------------
     幻灯投影面板宿主
     ------------------------------------------------------------ */
  var projHost = null, projBody = null, projHead = null, lastFocus = null, currentPanel = null;

  function ensureProj() {
    if (projHost) return;
    projHost = document.getElementById('p3-projection');
    projHead = projHost.querySelector('.proj-head');
    projBody = projHost.querySelector('.proj-body');
  }

  function openPanel(cfg) {
    ensureProj();
    if (!projHost) return;
    lastFocus = document.activeElement;
    currentPanel = cfg.id || null;

    clear(projHead);
    append(projHead, [
      ico(cfg.icon || 'file', 'ico ico--lg p-ico'),
      h('div.grow', null,
        h('div.p-ttl', { text: cfg.title || '' }),
        h('div.p-sub', { text: cfg.sub || '' })
      ),
      cfg.actions ? h('div.row', { style: { gap: '6px' } }, cfg.actions) : null,
      h('span.p-serial', { text: cfg.serial || '' }),
      h('button.btn.btn--icon', { type: 'button', id: 'p3-proj-close', 'aria-label': '关闭幻灯', title: '关闭（Esc）', onclick: closePanel }, ico('close'))
    ]);

    clear(projBody);
    if (cfg.body) append(projBody, [cfg.body]);
    projBody.scrollTop = 0;

    projHost.classList.remove('is-closing');
    projHost.classList.add('is-open');
    projHost.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', onProjKey, true);
    if (window.FX) window.FX.beamDust(true);
    setTimeout(function () { var c = document.getElementById('p3-proj-close'); if (c) c.focus(); }, 160);
    document.dispatchEvent(new CustomEvent('p3:panelopen', { detail: { id: currentPanel } }));
  }

  function closePanel() {
    if (!projHost || !projHost.classList.contains('is-open')) return;
    projHost.classList.add('is-closing');
    projHost.classList.remove('is-open');
    projHost.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onProjKey, true);
    if (window.FX) window.FX.beamDust(false);
    var was = currentPanel; currentPanel = null;
    setTimeout(function () {
      if (projHost.classList.contains('is-open')) return;
      projHost.classList.remove('is-closing');
      clear(projBody);
    }, 460);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* noop */ } }
    document.dispatchEvent(new CustomEvent('p3:panelclose', { detail: { id: was } }));
  }

  function onProjKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePanel(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])', projHost)
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function panelOpen() { return !!(projHost && projHost.classList.contains('is-open')); }

  /* ------------------------------------------------------------
     底部纸袋（移动端抽屉）
     ------------------------------------------------------------ */
  var sheet = null, scrim = null;

  function openSheet(cfg) {
    sheet = sheet || document.getElementById('p3-sheet');
    scrim = scrim || document.getElementById('p3-scrim');
    if (!sheet) return;
    clear(sheet);
    append(sheet, [
      h('div', null,
        h('div.sheet-grip', { id: 'p3-sheet-grip' }, h('i.bar')),
        h('div.sheet-head', null,
          ico(cfg.icon || 'file', 'ico'),
          h('div.grow', null, h('div.sh-ttl', { text: cfg.title || '' }),
            cfg.sub ? h('div', { class: 'eyebrow', text: cfg.sub }) : null),
          h('button.btn.btn--icon', { type: 'button', id: 'p3-sheet-close', 'aria-label': '收起', onclick: closeSheet }, ico('chevronD'))
        )
      ),
      h('div.sheet-body', null, cfg.body || null)
    ]);
    sheet.classList.remove('is-closing');
    sheet.classList.add('is-open');
    scrim.classList.add('is-open');
    scrim.onclick = closeSheet;
    bindGrip();
    document.addEventListener('keydown', onSheetKey, true);
  }

  function closeSheet() {
    if (!sheet || !sheet.classList.contains('is-open')) return;
    sheet.classList.add('is-closing');
    scrim.classList.remove('is-open');
    document.removeEventListener('keydown', onSheetKey, true);
    setTimeout(function () { sheet.classList.remove('is-open', 'is-closing'); clear(sheet); }, 320);
  }

  function onSheetKey(e) { if (e.key === 'Escape') { e.preventDefault(); closeSheet(); } }

  function bindGrip() {
    var grip = document.getElementById('p3-sheet-grip');
    if (!grip) return;
    var y0 = 0, dragging = false;
    grip.addEventListener('pointerdown', function (e) {
      dragging = true; y0 = e.clientY; grip.setPointerCapture(e.pointerId);
      sheet.style.transition = 'none';
    });
    grip.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dy = Math.max(0, e.clientY - y0);
      sheet.style.transform = 'translateY(' + dy + 'px)';
    });
    grip.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      var dy = Math.max(0, e.clientY - y0);
      sheet.style.transition = '';
      sheet.style.transform = '';
      if (dy > 90) closeSheet();
    });
  }

  function sheetOpen() { return !!(sheet && sheet.classList.contains('is-open')); }

  /* ------------------------------------------------------------
     标签页组件
     ------------------------------------------------------------ */
  function tabs(items, opt) {
    opt = opt || {};
    var nav = h('div.tabs', { role: 'tablist' });
    var pane = h('div.tabpane' + (opt.paneClass ? '.' + opt.paneClass : ''));
    var idx = opt.start || 0;
    function render(i) {
      idx = i;
      $$('.tab', nav).forEach(function (b, n) { b.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
      clear(pane);
      var out = items[i].body;
      append(pane, [typeof out === 'function' ? out() : out]);
      pane.classList.remove('develop');
      void pane.offsetWidth;
      pane.classList.add('develop');
    }
    items.forEach(function (it, i) {
      nav.appendChild(h('button.tab', {
        type: 'button', role: 'tab', id: opt.idBase ? opt.idBase + '-tab-' + i : null,
        'aria-selected': i === idx ? 'true' : 'false',
        onclick: function () { render(i); }
      }, it.icon ? ico(it.icon, 'ico ico--sm') : null, h('span', { text: it.label }), it.badge ? h('span.chip.chip--red', { text: String(it.badge) }) : null));
    });
    render(idx);
    return h('div', { class: 'tabhost', style: { display: 'grid', 'grid-template-rows': 'auto minmax(0,1fr)', 'min-height': '0', height: '100%' } }, nav, pane);
  }

  /* 分段控件 */
  function seg(items, active, onPick, idBase) {
    var bar = h('div.segbar', { role: 'group' });
    items.forEach(function (it) {
      bar.appendChild(h('button', {
        type: 'button',
        id: idBase ? idBase + '-' + it.key : null,
        'aria-pressed': it.key === active ? 'true' : 'false',
        onclick: function () {
          $$('button', bar).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
          this.setAttribute('aria-pressed', 'true');
          onPick(it.key);
        }
      }, it.icon ? ico(it.icon, 'ico ico--sm') : null, h('span', { text: it.label })));
    });
    return bar;
  }

  /* 折叠面板 */
  function fold(title, latin, body, open, headExtra) {
    var wrap = h('section.plate.fold', { dataset: { open: open === false ? 'false' : 'true' } });
    var hd = h('div.plate-head', {
      role: 'button', tabindex: '0',
      onclick: function () { toggle(); },
      onkeydown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }
    },
      ico('chevronD', 'ico ico--sm caret'),
      h('div.grow', null, h('div.ttl', { text: title }), latin ? h('span.eyebrow', { text: latin }) : null),
      headExtra || null
    );
    function toggle() { wrap.dataset.open = wrap.dataset.open === 'true' ? 'false' : 'true'; }
    wrap.appendChild(hd);
    wrap.appendChild(h('div.plate-body', null, body));
    return wrap;
  }

  /* 空态 */
  function empty(title, msg, icon) {
    return h('div.empty', null, ico(icon || 'fog', 'ico ico--xl'),
      h('div.e-ttl', { text: title }), msg ? h('div.e-msg', { text: msg }) : null);
  }

  /* 数据表 */
  function table(cols, rows, opt) {
    opt = opt || {};
    var t = h('table.dtable' + (opt.dense ? '.is-dense' : ''));
    var thead = h('thead', null, h('tr', null, cols.map(function (c) {
      return h('th', { text: c.label, style: c.width ? { width: c.width } : null, class: c.align === 'r' ? 'text-r' : null });
    })));
    var tbody = h('tbody');
    rows.forEach(function (r) {
      tbody.appendChild(h('tr', null, cols.map(function (c) {
        var v = typeof c.get === 'function' ? c.get(r) : r[c.key];
        return h('td', { class: (c.align === 'r' ? 'text-r ' : '') + (c.mono ? 'u-mono' : '') },
          v && v.nodeType ? v : document.createTextNode(v === undefined || v === null ? '—' : String(v)));
      })));
    });
    t.appendChild(thead); t.appendChild(tbody);
    return t;
  }

  /* 进度条 */
  function bar(pct, tone) {
    return h('div.pbar' + (tone ? '.is-' + tone : ''), null,
      h('i.pbar-f', { style: { width: Math.max(0, Math.min(100, pct)) + '%' } }));
  }

  window.UI = {
    h: h, ico: ico, frag: frag, clear: clear, $: $, $$: $$, head: head, kv: kv,
    toast: toast, confirm: confirmBox,
    openPanel: openPanel, closePanel: closePanel, panelOpen: panelOpen,
    openSheet: openSheet, closeSheet: closeSheet, sheetOpen: sheetOpen,
    tabs: tabs, seg: seg, fold: fold, empty: empty, table: table, bar: bar
  };
})();
