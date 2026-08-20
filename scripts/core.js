/* ===========================================================
   core.js —— h() / 状态仓 / 事件总线 / 持久化 / 工具
   =========================================================== */
(function (global) {
  'use strict';

  var P4 = global.P4 = global.P4 || {};

  /* =======================================================
     h() —— 极简元素工厂
     h('div.cls#id', { attrs }, child | [children])
     ======================================================= */
  var SVG_TAGS = { svg: 1, path: 1, circle: 1, rect: 1, line: 1, g: 1, polyline: 1, polygon: 1, ellipse: 1, text: 1, defs: 1, use: 1 };

  function parseSel(sel) {
    var tag = 'div', id = null, cls = [];
    var m = String(sel).match(/^([a-zA-Z][\w-]*)?((?:[.#][\w-]+)*)$/);
    if (!m) return { tag: sel, id: null, cls: [] };
    if (m[1]) tag = m[1];
    if (m[2]) {
      m[2].split(/(?=[.#])/).forEach(function (tok) {
        if (!tok) return;
        if (tok[0] === '#') id = tok.slice(1);
        else cls.push(tok.slice(1));
      });
    }
    return { tag: tag, id: id, cls: cls };
  }

  function appendChild(el, c) {
    if (c === null || c === undefined || c === false || c === true) return;
    if (Array.isArray(c)) { c.forEach(function (x) { appendChild(el, x); }); return; }
    if (c instanceof Node) { el.appendChild(c); return; }
    el.appendChild(document.createTextNode(String(c)));
  }

  function h(sel, props, children) {
    var p = parseSel(sel);
    var el = SVG_TAGS[p.tag]
      ? document.createElementNS('http://www.w3.org/2000/svg', p.tag)
      : document.createElement(p.tag);
    if (p.id) el.id = p.id;
    if (p.cls.length) {
      if (el instanceof SVGElement) el.setAttribute('class', p.cls.join(' '));
      else el.className = p.cls.join(' ');
    }
    if (props && (props instanceof Node || Array.isArray(props) || typeof props === 'string' || typeof props === 'number')) {
      children = props; props = null;
    }
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class' || k === 'className') {
          var extra = String(v).trim();
          if (!extra) return;
          if (el instanceof SVGElement) el.setAttribute('class', ((el.getAttribute('class') || '') + ' ' + extra).trim());
          else el.className = (el.className ? el.className + ' ' : '') + extra;
        } else if (k === 'style' && typeof v === 'object') {
          Object.keys(v).forEach(function (sk) {
            if (sk.indexOf('--') === 0) el.style.setProperty(sk, String(v[sk]));
            else el.style[sk] = v[sk];
          });
        } else if (k === 'dataset' && typeof v === 'object') {
          Object.keys(v).forEach(function (dk) { if (v[dk] !== null && v[dk] !== undefined) el.dataset[dk] = String(v[dk]); });
        } else if (k === 'html') {
          el.innerHTML = v;
        } else if (k === 'text') {
          el.textContent = String(v);
        } else if (k.indexOf('on') === 0 && typeof v === 'function') {
          var ev = k.slice(2).toLowerCase();
          el.addEventListener(ev, v, ev === 'scroll' || ev === 'wheel' || ev === 'touchmove' ? { passive: true } : false);
        } else if (k === 'ref' && typeof v === 'function') {
          v(el);
        } else if (v === true) {
          el.setAttribute(k, '');
        } else {
          el.setAttribute(k, String(v));
        }
      });
    }
    appendChild(el, children);
    return el;
  }

  /* 常用快捷 */
  function frag(children) { var f = document.createDocumentFragment(); appendChild(f, children); return f; }
  function clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); return el; }
  function mount(el, children) { clear(el); appendChild(el, children); return el; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* =======================================================
     事件总线
     ======================================================= */
  var handlers = {};
  function on(evt, fn) {
    (handlers[evt] = handlers[evt] || []).push(fn);
    return function off() {
      handlers[evt] = (handlers[evt] || []).filter(function (f) { return f !== fn; });
    };
  }
  function emit(evt, payload) {
    (handlers[evt] || []).forEach(function (fn) {
      try { fn(payload); } catch (e) { P4.log('bus:' + evt, e); }
    });
  }

  /* =======================================================
     持久化（localStorage，file:// 下也可用；失败静默降级到内存）
     ======================================================= */
  var NS = 'p4.mercury.';
  var memStore = {};
  function store(key, val) {
    var k = NS + key;
    if (arguments.length === 1) {
      try {
        var raw = global.localStorage ? global.localStorage.getItem(k) : null;
        if (raw === null) return memStore[k] === undefined ? null : memStore[k];
        return JSON.parse(raw);
      } catch (e) { return memStore[k] === undefined ? null : memStore[k]; }
    }
    memStore[k] = val;
    try { if (global.localStorage) global.localStorage.setItem(k, JSON.stringify(val)); } catch (e) { /* 配额/隐私模式：内存兜底 */ }
    return val;
  }

  /* =======================================================
     状态仓（浅层，带订阅）
     ======================================================= */
  var state = {};
  function setState(patch) {
    var changed = [];
    Object.keys(patch).forEach(function (k) {
      if (state[k] !== patch[k]) { state[k] = patch[k]; changed.push(k); }
    });
    if (changed.length) emit('state', { keys: changed, state: state });
    return state;
  }
  function getState(k) { return k === undefined ? state : state[k]; }

  /* =======================================================
     工具
     ======================================================= */
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function pct(cur, max) { return max > 0 ? clamp(Math.round((cur / max) * 1000) / 10, 0, 100) : 0; }
  function uid(prefix) { uid._n = (uid._n || 0) + 1; return (prefix || 'p4') + '-' + uid._n; }
  function roman(n) {
    var map = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return map[n] || String(n);
  }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function rafThrottle(fn) {
    var queued = false, lastArgs = null;
    return function () {
      lastArgs = arguments;
      if (queued) return;
      queued = true;
      global.requestAnimationFrame(function () { queued = false; fn.apply(null, lastArgs); });
    };
  }
  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments;
      global.clearTimeout(t);
      t = global.setTimeout(function () { fn.apply(null, args); }, ms || 160);
    };
  }
  function log() {
    if (!P4.debug) return;
    try { console.log.apply(console, ['[汞镜案台]'].concat(Array.prototype.slice.call(arguments))); } catch (e) { /* noop */ }
  }

  /* 焦点陷阱（用于确认框） */
  function trapFocus(root) {
    var sel = 'button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
    function onKey(e) {
      if (e.key !== 'Tab') return;
      var nodes = $$(sel, root).filter(function (n) { return n.offsetParent !== null; });
      if (!nodes.length) return;
      var first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    root.addEventListener('keydown', onKey);
    return function () { root.removeEventListener('keydown', onKey); };
  }

  /* 汞珠涟漪（挂到所有 .btn / .icon-btn / .act 上，事件委托） */
  function initRipple() {
    document.addEventListener('pointerdown', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('.btn,.icon-btn,.act,.gate-act,.rail-btn,.const-node,.tabbar-btn') : null;
      if (!t) return;
      if (document.documentElement.dataset.motion === 'off') return;
      var r = t.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2.1;
      var span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left) + 'px';
      span.style.top = (e.clientY - r.top) + 'px';
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
      t.appendChild(span);
      global.setTimeout(function () { if (span.parentNode) span.parentNode.removeChild(span); }, 640);
    }, { passive: true });
  }

  /* 标签页组件 */
  function tabs(items, opts) {
    opts = opts || {};
    var idBase = opts.id || uid('p4-tabs');
    var active = opts.active || items[0].key;
    var body = h('div.tabpanel', { role: 'tabpanel', id: idBase + '-panel' });
    var bar = h('div.tabs', { role: 'tablist', 'aria-label': opts.label || '标签页' });

    function render() {
      clear(bar);
      items.forEach(function (it) {
        var sel = it.key === active;
        bar.appendChild(h('button.tab', {
          type: 'button',
          role: 'tab',
          id: idBase + '-tab-' + it.key,
          'aria-selected': sel ? 'true' : 'false',
          'aria-controls': idBase + '-panel',
          tabindex: sel ? '0' : '-1',
          onclick: function () { active = it.key; render(); },
          onkeydown: function (e) {
            var i = items.findIndex(function (x) { return x.key === active; });
            if (e.key === 'ArrowRight') { e.preventDefault(); active = items[(i + 1) % items.length].key; render(); focusTab(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); active = items[(i - 1 + items.length) % items.length].key; render(); focusTab(); }
          }
        }, it.label));
      });
      var cur = items.filter(function (x) { return x.key === active; })[0] || items[0];
      mount(body, cur.render());
      body.scrollTop = 0;
      if (opts.onChange) opts.onChange(active);
    }
    function focusTab() { var t = $('#' + idBase + '-tab-' + active); if (t) t.focus(); }
    render();
    return { bar: bar, body: body, get active() { return active; }, set: function (k) { active = k; render(); } };
  }

  /* 可收放面板 */
  function fold(opts) {
    var open = opts.open !== false;
    var body = h('div.fold__body', opts.render ? opts.render() : opts.children);
    var chev = P4.icon('chevronRight', 13);
    var wrap = h('section.fold', { dataset: { open: open ? 1 : 0 } }, [
      h('button.fold__head', {
        type: 'button',
        'aria-expanded': open ? 'true' : 'false',
        id: opts.id ? opts.id + '-head' : undefined,
        onclick: function () {
          open = !open;
          wrap.dataset.open = open ? 1 : 0;
          this.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
      }, [
        chev,
        h('span.zh', opts.title),
        h('span.lat', opts.latin || ''),
        opts.extra || null
      ]),
      body
    ]);
    if (opts.id) wrap.id = opts.id;
    return wrap;
  }

  /* 章节头 */
  function sectHead(zh, lat, extra) {
    return h('div.sect-head', [h('h3', zh), h('span.lat', lat || ''), extra || null]);
  }

  /* 键值行 */
  function kvList(pairs) {
    return h('dl', pairs.map(function (p) {
      return h('div.kv', [h('dt', p[0]), h('dd', p[1])]);
    }));
  }

  /* 统计块 */
  function statTile(k, v, d, tone) {
    return h('div.stat-tile' + (tone ? '.stat-tile--' + tone : ''), [
      h('span.stat-tile__k', k),
      h('span.stat-tile__v', v),
      d ? h('span.stat-tile__d', d) : null
    ]);
  }

  /* 环形仪表 */
  function arcMeter(value, max, size, tone, label) {
    var s = size || 54, r = (s - 7) / 2, c = 2 * Math.PI * r;
    var off = c * (1 - clamp(value / (max || 1), 0, 1));
    return h('div.arc-meter', { dataset: { tone: tone || 'silver' } }, [
      h('svg', { width: s, height: s, viewBox: '0 0 ' + s + ' ' + s, 'aria-hidden': 'true' }, [
        h('circle.arc-meter__track', { cx: s / 2, cy: s / 2, r: r, fill: 'none', 'stroke-width': 4 }),
        h('circle.arc-meter__fill', {
          cx: s / 2, cy: s / 2, r: r, fill: 'none', 'stroke-width': 4,
          'stroke-dasharray': c, 'stroke-dashoffset': off
        })
      ]),
      h('span.arc-meter__label', label === undefined ? Math.round((value / (max || 1)) * 100) + '%' : label)
    ]);
  }

  /* 线性条 */
  function bar(percent, tone, live) {
    return h('div.bar' + (tone ? '.bar--' + tone : '') + (live ? '.is-live' : ''), {
      role: 'progressbar', 'aria-valuenow': String(Math.round(percent)), 'aria-valuemin': '0', 'aria-valuemax': '100',
      style: { '--pct': clamp(percent, 0, 100) + '%' }
    }, h('i'));
  }

  /* 按钮工厂 */
  function btn(label, opts) {
    opts = opts || {};
    var cls = '.btn';
    if (opts.variant) cls += '.btn--' + opts.variant;
    if (opts.size) cls += '.btn--' + opts.size;
    if (opts.block) cls += '.btn--block';
    return h('button' + cls, {
      type: 'button',
      id: opts.id,
      title: opts.title,
      'aria-label': opts.ariaLabel,
      disabled: opts.disabled ? true : null,
      onclick: opts.onClick
    }, [opts.icon ? P4.icon(opts.icon, opts.iconSize || 14) : null, label ? h('span', label) : null]);
  }

  function iconBtn(name, opts) {
    opts = opts || {};
    return h('button.icon-btn' + (opts.large ? '.icon-btn--lg' : ''), {
      type: 'button',
      id: opts.id,
      title: opts.title,
      'aria-label': opts.ariaLabel || opts.title,
      'aria-pressed': opts.pressed === undefined ? null : (opts.pressed ? 'true' : 'false'),
      onclick: opts.onClick
    }, P4.icon(name, opts.size || 15));
  }

  /* 开关 */
  function toggle(label, checked, onChange, id) {
    var input = h('input', { type: 'checkbox', id: id, checked: checked ? true : null, onchange: function () { if (onChange) onChange(this.checked); } });
    return h('label.toggle', [input, h('span.track'), label ? h('span.tx', label) : null]);
  }

  /* 滑块（自带百分比着色） */
  function range(opts) {
    var el = h('input.range', {
      type: 'range', id: opts.id, min: opts.min, max: opts.max, step: opts.step || 1, value: opts.value,
      'aria-label': opts.ariaLabel || opts.label,
      style: { '--pct': (((opts.value - opts.min) / (opts.max - opts.min)) * 100) + '%' },
      oninput: function () {
        this.style.setProperty('--pct', (((this.value - opts.min) / (opts.max - opts.min)) * 100) + '%');
        if (opts.onInput) opts.onInput(Number(this.value));
      }
    });
    return el;
  }

  /* 空态 */
  function emptyState(iconName, text, action) {
    return h('div.empty-state', [P4.icon(iconName || 'fog', 30), h('p', text), action || null]);
  }

  P4.h = h;
  P4.frag = frag;
  P4.clear = clear;
  P4.mount = mount;
  P4.$ = $;
  P4.$$ = $$;
  P4.on = on;
  P4.emit = emit;
  P4.store = store;
  P4.setState = setState;
  P4.getState = getState;
  P4.clamp = clamp;
  P4.pct = pct;
  P4.uid = uid;
  P4.roman = roman;
  P4.num = num;
  P4.rafThrottle = rafThrottle;
  P4.debounce = debounce;
  P4.log = log;
  P4.trapFocus = trapFocus;
  P4.initRipple = initRipple;
  P4.tabs = tabs;
  P4.fold = fold;
  P4.sectHead = sectHead;
  P4.kvList = kvList;
  P4.statTile = statTile;
  P4.arcMeter = arcMeter;
  P4.bar = bar;
  P4.btn = btn;
  P4.iconBtn = iconBtn;
  P4.toggle = toggle;
  P4.range = range;
  P4.emptyState = emptyState;
  P4.debug = false;
})(window);
