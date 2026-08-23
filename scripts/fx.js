/* ============================================================
   诡秘剧场 · 原型3 — 效果层
   浮尘 / 显影盘涟漪 / 漏光警示 / 定影闪光 / WebAudio 合成音
   ============================================================ */
(function () {
  'use strict';

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* noop */ }

  /* ------------------------------------------------------------
     通用粒子画布（浮尘）
     ------------------------------------------------------------ */
  function Dust(canvas, opt) {
    opt = opt || {};
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, raf = null, running = false;
    var count = opt.count || 44;
    var color = opt.color || 'rgba(240,232,218,';
    var drift = opt.drift || 0.12;
    var ps = [];

    function size() {
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      ps = [];
      for (var i = 0; i < count; i++) {
        ps.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 0.4 + Math.random() * 1.5,
          a: 0.06 + Math.random() * 0.34,
          vx: (Math.random() - 0.5) * drift * 2,
          vy: -drift * (0.3 + Math.random() * 0.9),
          ph: Math.random() * 6.28
        });
      }
    }

    function tick(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.x += p.vx + Math.sin(t / 2600 + p.ph) * 0.14;
        p.y += p.vy;
        if (p.y < -6) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -6) p.x = W + 4; else if (p.x > W + 6) p.x = -4;
        var tw = 0.7 + 0.3 * Math.sin(t / 900 + p.ph);
        ctx.beginPath();
        ctx.fillStyle = color + (p.a * tw).toFixed(3) + ')';
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    function start() { if (running || reduce) return; running = true; size(); seed(); raf = requestAnimationFrame(tick); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, W, H); }

    var ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { if (running) { size(); seed(); } });
      ro.observe(canvas);
    }
    return { start: start, stop: stop, resize: function () { size(); seed(); } };
  }

  /* ------------------------------------------------------------
     显影盘涟漪（开场）
     ------------------------------------------------------------ */
  function ripples(host, n) {
    if (!host || reduce) return;
    for (var i = 0; i < (n || 3); i++) {
      (function (k) {
        setTimeout(function () {
          var d = document.createElement('i');
          d.style.cssText = 'position:absolute;border-radius:50%;border:1px solid rgba(210,69,46,.45);pointer-events:none;';
          var s = 60 + Math.random() * 120;
          d.style.width = s + 'px'; d.style.height = s + 'px';
          d.style.left = (12 + Math.random() * 76) + '%';
          d.style.top = (18 + Math.random() * 64) + '%';
          d.style.transform = 'translate(-50%,-50%) scale(.3)';
          d.style.animation = 'ripple 2600ms cubic-bezier(.22,1,.36,1) forwards';
          host.appendChild(d);
          setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 2700);
        }, k * 780 + Math.random() * 260);
      })(i);
    }
  }

  /* ------------------------------------------------------------
     漏光警示（环境级反馈）
     ------------------------------------------------------------ */
  function leak() {
    var el = document.getElementById('p3-lightleak');
    if (!el || reduce) return;
    el.classList.remove('is-flash');
    void el.offsetWidth;
    el.classList.add('is-flash');
  }

  /* 定影闪光 */
  function flash() {
    var el = document.getElementById('p3-flash');
    if (!el) return;
    el.classList.remove('is-fire');
    void el.offsetWidth;
    el.classList.add('is-fire');
  }

  /* ------------------------------------------------------------
     光束浮尘（幻灯投影打开时）
     ------------------------------------------------------------ */
  var beam = null;
  function beamDust(on) {
    var cv = document.getElementById('p3-beam-dust');
    if (!cv) return;
    if (!beam) beam = Dust(cv, { count: 34, color: 'rgba(255,226,200,', drift: 0.1 });
    if (on) beam.start(); else beam.stop();
  }

  /* ------------------------------------------------------------
     WebAudio 合成音效（默认关闭）
     暗房音：快门咔哒 / 药液滴落 / 幻灯片推入 / 计时器铃
     ------------------------------------------------------------ */
  var actx = null, enabled = false, master = null;

  function ensureCtx() {
    if (actx) return actx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    actx = new AC();
    master = actx.createGain();
    master.gain.value = 0.16;
    master.connect(actx.destination);
    return actx;
  }

  function noise(dur, filterHz, q) {
    var c = ensureCtx(); if (!c) return null;
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var bp = c.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = filterHz || 1800; bp.Q.value = q || 1.2;
    src.connect(bp);
    return { src: src, out: bp, ctx: c };
  }

  function tone(freq, dur, type, gain) {
    var c = ensureCtx(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(gain === undefined ? 0.3 : gain, c.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(master);
    o.start(); o.stop(c.currentTime + dur + 0.02);
  }

  var SND = {
    shutter: function () {
      var n = noise(0.07, 3200, 2.4); if (!n) return;
      var g = n.ctx.createGain();
      g.gain.setValueAtTime(0.7, n.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, n.ctx.currentTime + 0.08);
      n.out.connect(g); g.connect(master);
      n.src.start();
      tone(180, 0.06, 'square', 0.12);
    },
    drip: function () {
      var c = ensureCtx(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(1180, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(320, c.currentTime + 0.14);
      g.gain.setValueAtTime(0.26, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2);
      o.connect(g); g.connect(master);
      o.start(); o.stop(c.currentTime + 0.22);
    },
    slide: function () {
      var n = noise(0.26, 900, 0.9); if (!n) return;
      var g = n.ctx.createGain();
      g.gain.setValueAtTime(0.0, n.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.4, n.ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, n.ctx.currentTime + 0.28);
      n.out.connect(g); g.connect(master);
      n.src.start();
    },
    bell: function () { tone(1244, 0.5, 'sine', 0.18); setTimeout(function () { tone(1660, 0.42, 'sine', 0.1); }, 70); },
    clip: function () { tone(2400, 0.035, 'square', 0.1); },
    warn: function () { tone(320, 0.16, 'triangle', 0.22); setTimeout(function () { tone(248, 0.24, 'triangle', 0.18); }, 130); }
  };

  function play(name) {
    if (!enabled) return;
    var c = ensureCtx(); if (!c) return;
    if (c.state === 'suspended') c.resume();
    var f = SND[name]; if (f) { try { f(); } catch (e) { /* noop */ } }
  }

  function audio(on) {
    enabled = !!on;
    if (enabled) { var c = ensureCtx(); if (c && c.state === 'suspended') c.resume(); play('clip'); }
    return enabled;
  }

  function audioOn() { return enabled; }

  /* ------------------------------------------------------------
     显影揭示：给容器内的块加错峰 develop
     ------------------------------------------------------------ */
  function develop(root, sel, step) {
    if (!root) return;
    var els = root.querySelectorAll(sel || ':scope > *');
    step = step || 90;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      el.classList.remove('develop');
      el.style.animationDelay = (i * step) + 'ms';
      void el.offsetWidth;
      el.classList.add('develop');
    }
  }

  /* 数值动画 */
  function countTo(el, from, to, dur, fmt) {
    if (!el) return;
    if (reduce) { el.textContent = fmt ? fmt(to) : String(to); return; }
    var t0 = performance.now();
    dur = dur || 700;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      var v = from + (to - from) * e;
      el.textContent = fmt ? fmt(v) : String(Math.round(v));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  window.FX = {
    Dust: Dust, ripples: ripples, leak: leak, flash: flash, beamDust: beamDust,
    play: play, audio: audio, audioOn: audioOn, develop: develop, countTo: countTo,
    reduced: function () { return reduce; }
  };
})();
