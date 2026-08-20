/* ===========================================================
   notify.js —— 内部通知系统（不使用任何浏览器原生弹窗）
   显影 Toast / 汞封确认框 / 顶部警示阀
   =========================================================== */
(function (global) {
  'use strict';
  var P4 = global.P4 = global.P4 || {};
  var h = P4.h;

  var MAX_TOAST = 4;
  var toastHost = null;
  var confirmScrim = null;
  var valveEl = null;
  var valveTimer = null;
  var releaseTrap = null;
  var lastFocus = null;

  function ensureHosts() {
    if (!toastHost) toastHost = P4.$('#p4-toasts');
    if (!confirmScrim) confirmScrim = P4.$('#p4-confirm-scrim');
    if (!valveEl) valveEl = P4.$('#p4-valve');
  }

  /* =======================================================
     显影 Toast
     ======================================================= */
  var KIND_ICON = { info: 'info', ok: 'check', warn: 'alert', mystic: 'star' };

  function toast(opts) {
    ensureHosts();
    if (!toastHost) return;
    if (typeof opts === 'string') opts = { title: opts };
    var kind = opts.kind || 'info';
    var life = opts.life || 3600;

    while (toastHost.children.length >= MAX_TOAST) toastHost.removeChild(toastHost.firstChild);

    var el = h('div.toast', {
      dataset: { kind: kind },
      role: kind === 'warn' ? 'alert' : 'status',
      'aria-live': kind === 'warn' ? 'assertive' : 'polite'
    }, [
      h('span.toast__ic', P4.icon(opts.icon || KIND_ICON[kind] || 'info', 16)),
      h('div', [
        h('div.toast__tt', opts.title || '记录'),
        opts.msg ? h('div.toast__ms', opts.msg) : null
      ]),
      P4.iconBtn('close', { title: '关闭此提示', size: 13, onClick: function () { dismiss(el); } }),
      h('i.toast__bar', { style: { animationDuration: life + 'ms' } })
    ]);
    toastHost.appendChild(el);
    P4.fx.play(kind === 'warn' ? 'warn' : 'develop');

    var timer = global.setTimeout(function () { dismiss(el); }, life);
    el.addEventListener('pointerenter', function () { global.clearTimeout(timer); }, { passive: true });
    el.addEventListener('pointerleave', function () { timer = global.setTimeout(function () { dismiss(el); }, 1400); }, { passive: true });
    return el;
  }

  function dismiss(el) {
    if (!el || el.dataset.out) return;
    el.dataset.out = '1';
    el.classList.add('is-out');
    global.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
  }

  /* =======================================================
     汞封确认框（Promise 化）
     ======================================================= */
  function confirmSeal(opts) {
    ensureHosts();
    return new Promise(function (resolve) {
      if (!confirmScrim) { resolve(false); return; }
      lastFocus = document.activeElement;
      var okBtn;
      var box = h('div.seal-box', {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'p4-confirm-title',
        'aria-describedby': 'p4-confirm-msg'
      }, [
        h('span.seal-box__seal', P4.icon(opts.icon || 'stamp', 20)),
        h('h2#p4-confirm-title.seal-box__title', opts.title || '需要你的确认'),
        h('p#p4-confirm-msg.seal-box__msg', opts.msg || ''),
        h('div.seal-box__acts', [
          P4.btn(opts.cancelText || '取消', {
            id: 'p4-confirm-cancel', size: 'lg',
            onClick: function () { finish(false); }
          }),
          (okBtn = P4.btn(opts.okText || '确认', {
            id: 'p4-confirm-ok', size: 'lg',
            variant: opts.danger ? 'danger' : 'primary',
            icon: opts.danger ? 'alert' : 'check',
            onClick: function () { finish(true); }
          }))
        ]),
        opts.note ? h('p.gate__note', { style: { marginTop: '16px', textAlign: 'left' } }, opts.note) : null
      ]);

      P4.mount(confirmScrim, box);
      confirmScrim.dataset.open = '1';
      P4.fx.play('seal');
      releaseTrap = P4.trapFocus(confirmScrim);
      global.setTimeout(function () { if (okBtn) okBtn.focus(); }, 60);

      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); finish(false); }
        else if (e.key === 'Enter' && document.activeElement === document.body) { e.preventDefault(); finish(true); }
      }
      function onScrim(e) { if (e.target === confirmScrim) finish(false); }
      document.addEventListener('keydown', onKey, true);
      confirmScrim.addEventListener('pointerdown', onScrim);

      function finish(v) {
        document.removeEventListener('keydown', onKey, true);
        confirmScrim.removeEventListener('pointerdown', onScrim);
        if (releaseTrap) { releaseTrap(); releaseTrap = null; }
        confirmScrim.dataset.open = '0';
        global.setTimeout(function () { P4.clear(confirmScrim); }, 260);
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* noop */ } }
        resolve(v);
      }
    });
  }

  /* =======================================================
     顶部警示阀（严重级内部警告）
     ======================================================= */
  function valve(msg, opts) {
    ensureHosts();
    if (!valveEl) return;
    opts = opts || {};
    P4.mount(valveEl, [
      h('span.ic', P4.icon('valve', 17)),
      h('span.tx', { html: msg }),
      opts.action ? P4.btn(opts.action.label, { size: 'sm', onClick: function () { opts.action.onClick(); hideValve(); } }) : null,
      P4.iconBtn('close', { title: '关闭警示', size: 13, onClick: hideValve })
    ]);
    valveEl.dataset.open = '1';
    valveEl.setAttribute('role', 'alert');
    P4.fx.play('warn');
    global.clearTimeout(valveTimer);
    if (opts.sticky !== true) valveTimer = global.setTimeout(hideValve, opts.life || 7000);
  }
  function hideValve() {
    global.clearTimeout(valveTimer);
    if (valveEl) valveEl.dataset.open = '0';
  }

  P4.notify = {
    toast: toast,
    dismiss: dismiss,
    confirm: confirmSeal,
    valve: valve,
    hideValve: hideValve,
    ok: function (t, m) { return toast({ kind: 'ok', title: t, msg: m }); },
    info: function (t, m) { return toast({ kind: 'info', title: t, msg: m }); },
    warn: function (t, m) { return toast({ kind: 'warn', title: t, msg: m }); },
    mystic: function (t, m) { return toast({ kind: 'mystic', title: t, msg: m, icon: 'star' }); }
  };
})(window);
