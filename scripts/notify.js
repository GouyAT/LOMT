/* ============================================================
   notify.js —— 内部通知（零浏览器原生弹窗）
   显影小样 Toast（点击穿透）/ 显影计时器确认框 / 漏光警示
   ============================================================ */
(function (global) {
  'use strict';
  var P5 = global.P5 = global.P5 || {};
  var h = P5.h;

  var MAX = 4;
  var host = null, scrim = null, leak = null, leakNote = null;
  var leakTimer = null, releaseTrap = null, lastFocus = null;

  function ensure() {
    host = host || P5.$('#p5-toasts');
    scrim = scrim || P5.$('#p5-timer-scrim');
    leak = leak || P5.$('#p5-leak');
    leakNote = leakNote || P5.$('#p5-leak-note');
  }

  var KIND_ICON = { info: 'info', ok: 'check', warn: 'alert', cyan: 'eye' };

  function toast(opts) {
    ensure();
    if (!host) return;
    if (typeof opts === 'string') opts = { title: opts };
    var kind = opts.kind || 'info';
    var life = opts.life || 3600;
    while (host.children.length >= MAX) host.removeChild(host.firstChild);

    var el = h('div.toast', {
      dataset: { kind: kind },
      role: kind === 'warn' ? 'alert' : 'status',
      'aria-live': kind === 'warn' ? 'assertive' : 'polite'
    }, [
      h('span.toast__ic', P5.icon(opts.icon || KIND_ICON[kind] || 'info', 16)),
      h('div', [
        h('div.toast__tt', opts.title || '记录'),
        opts.msg ? h('div.toast__ms', opts.msg) : null
      ]),
      P5.iconBtn('close', { title: '收起此小样', size: 13, onClick: function () { dismiss(el); } }),
      h('i.toast__bar', { style: { animationDuration: life + 'ms' } })
    ]);
    host.appendChild(el);
    P5.fx.play(kind === 'warn' ? 'warn' : 'develop');

    var timer = global.setTimeout(function () { dismiss(el); }, life);
    /* 小样整体点击穿透，故不做 hover 暂停（避免遮挡底层控件的手感） */
    el.addEventListener('pointerenter', function () { global.clearTimeout(timer); timer = global.setTimeout(function () { dismiss(el); }, life); }, { passive: true });
    return el;
  }

  function dismiss(el) {
    if (!el || el.dataset.out) return;
    el.dataset.out = '1';
    el.classList.add('is-out');
    global.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 240);
  }

  /* ============================================================
     显影计时器确认框（倒数转盘 + 焦点陷阱）
     ============================================================ */
  function confirmTimer(opts) {
    ensure();
    return new Promise(function (resolve) {
      if (!scrim) { resolve(false); return; }
      lastFocus = document.activeElement;
      var okBtn;
      var R = 23, C = 2 * Math.PI * R;

      var box = h('div.timer-box', {
        role: 'dialog', 'aria-modal': 'true',
        'aria-labelledby': 'p5-timer-title', 'aria-describedby': 'p5-timer-msg'
      }, [
        h('span.timer-box__dial', [
          h('svg', { width: 52, height: 52, viewBox: '0 0 52 52', 'aria-hidden': 'true' },
            h('circle.ring', { cx: 26, cy: 26, r: R, 'stroke-dasharray': C, 'stroke-dashoffset': C * 0.24 })),
          P5.icon(opts.icon || 'hourglass', 20)
        ]),
        h('h2#p5-timer-title.timer-box__title', opts.title || '需要你的确认'),
        h('p#p5-timer-msg.timer-box__msg', opts.msg || ''),
        h('div.timer-box__acts', [
          P5.btn(opts.cancelText || '取消', { id: 'p5-timer-cancel', size: 'lg', onClick: function () { finish(false); } }),
          (okBtn = P5.btn(opts.okText || '确认', {
            id: 'p5-timer-ok', size: 'lg',
            variant: opts.danger ? 'danger' : 'primary',
            icon: opts.danger ? 'alert' : 'check',
            onClick: function () { finish(true); }
          }))
        ]),
        opts.note ? h('p.timer-box__note', opts.note) : null
      ]);

      P5.mount(scrim, box);
      scrim.dataset.open = '1';
      P5.fx.play('seal');
      releaseTrap = P5.trapFocus(scrim);
      global.setTimeout(function () { if (okBtn) okBtn.focus(); }, 60);

      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); finish(false); }
        else if (e.key === 'Enter' && (!document.activeElement || document.activeElement === document.body)) { e.preventDefault(); finish(true); }
      }
      function onScrim(e) { if (e.target === scrim) finish(false); }
      document.addEventListener('keydown', onKey, true);
      scrim.addEventListener('pointerdown', onScrim);

      function finish(v) {
        document.removeEventListener('keydown', onKey, true);
        scrim.removeEventListener('pointerdown', onScrim);
        if (releaseTrap) { releaseTrap(); releaseTrap = null; }
        scrim.dataset.open = '0';
        global.setTimeout(function () { P5.clear(scrim); }, 260);
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* noop */ } }
        resolve(v);
      }
    });
  }

  /* ============================================================
     漏光警示：环境级反馈（安全灯抖 + 四边漏光），不弹红框
     ============================================================ */
  function leakWarn(msg, opts) {
    ensure();
    if (!leak || !leakNote) return;
    opts = opts || {};
    P5.mount(leakNote, [
      h('span.ic', P5.icon('alert', 17)),
      h('span.tx', { html: msg }),
      opts.action ? P5.btn(opts.action.label, { size: 'sm', onClick: function () { opts.action.onClick(); hideLeak(); } }) : null,
      P5.iconBtn('close', { title: '关灯', size: 13, onClick: hideLeak })
    ]);
    leak.dataset.open = '1';
    leakNote.dataset.open = '1';
    leakNote.setAttribute('role', 'alert');
    document.body.classList.add('leaking');
    P5.fx.play('warn');
    global.clearTimeout(leakTimer);
    if (opts.sticky !== true) leakTimer = global.setTimeout(hideLeak, opts.life || 7000);
  }
  function hideLeak() {
    global.clearTimeout(leakTimer);
    if (leak) leak.dataset.open = '0';
    if (leakNote) leakNote.dataset.open = '0';
    document.body.classList.remove('leaking');
  }

  P5.notify = {
    toast: toast,
    dismiss: dismiss,
    confirm: confirmTimer,
    leak: leakWarn,
    hideLeak: hideLeak,
    ok: function (t, m) { return toast({ kind: 'ok', title: t, msg: m }); },
    info: function (t, m) { return toast({ kind: 'info', title: t, msg: m }); },
    warn: function (t, m) { return toast({ kind: 'warn', title: t, msg: m }); },
    cyan: function (t, m) { return toast({ kind: 'cyan', title: t, msg: m, icon: 'eye' }); }
  };
  /* 兼容自 P4 移植的面板里的调用名 */
  P5.notify.mystic = P5.notify.cyan;
  P5.notify.valve = leakWarn;
})(window);
