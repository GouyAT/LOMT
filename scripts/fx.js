/* ===========================================================
   fx.js —— 微尘粒子 / 银版显影打字机 / 视差 / 合成音效
             远程图失败时的程序化场景回退
   =========================================================== */
(function (global) {
  'use strict';
  var P4 = global.P4 = global.P4 || {};
  var h = P4.h;

  /* =======================================================
     微尘粒子（canvas，标签页隐藏时暂停，ResizeObserver 自适应）
     ======================================================= */
  function motes(canvas) {
    var ctx = canvas.getContext('2d', { alpha: true });
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var w = 0, h2 = 0, parts = [], raf = null, running = false;

    function resize() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h2 = Math.max(1, Math.floor(r.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h2 * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.round(P4.clamp((w * h2) / 34000, 18, 64));
      parts = [];
      for (var i = 0; i < target; i++) parts.push(spawn());
    }
    function spawn() {
      return {
        x: Math.random() * w,
        y: Math.random() * h2,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -(Math.random() * 0.16 + 0.03),
        a: Math.random() * 0.4 + 0.08,
        ph: Math.random() * Math.PI * 2
      };
    }
    function frame(t) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h2);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx + Math.sin(t / 2600 + p.ph) * 0.08;
        p.y += p.vy;
        if (p.y < -6) { parts[i] = spawn(); parts[i].y = h2 + 4; continue; }
        if (p.x < -6) p.x = w + 4; else if (p.x > w + 6) p.x = -4;
        var flick = 0.7 + Math.sin(t / 900 + p.ph) * 0.3;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(226,238,246,' + (p.a * flick).toFixed(3) + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = global.requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; raf = global.requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) global.cancelAnimationFrame(raf); ctx.clearRect(0, 0, w, h2); }

    resize();
    if (global.ResizeObserver) {
      var ro = new global.ResizeObserver(P4.debounce(resize, 180));
      ro.observe(canvas);
    } else {
      global.addEventListener('resize', P4.debounce(resize, 180));
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (!reducedMotion()) start();
    });
    if (!reducedMotion()) start();
    return { start: start, stop: stop, resize: resize };
  }

  function reducedMotion() {
    if (document.documentElement.dataset.motion === 'off') return true;
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* =======================================================
     银版显影打字机
     把纯文本切成字符 span，逐字 blur→clear
     ======================================================= */
  function develop(target, text, opts) {
    opts = opts || {};
    var step = opts.step || 16;
    P4.clear(target);
    if (reducedMotion() || opts.instant) { target.textContent = text; return { done: Promise.resolve(), skip: function () {} }; }
    var chars = Array.from(text);
    var frag = document.createDocumentFragment();
    chars.forEach(function (c, i) {
      if (c === '\n') { frag.appendChild(document.createElement('br')); return; }
      var s = document.createElement('span');
      s.className = 'develop-char';
      s.textContent = c;
      s.style.animationDelay = (i * step) + 'ms';
      frag.appendChild(s);
    });
    target.appendChild(frag);
    var total = chars.length * step + 480;
    var skipped = false;
    function skip() {
      if (skipped) return;
      skipped = true;
      P4.$$('.develop-char', target).forEach(function (s) {
        s.style.animationDelay = '0ms';
        s.style.opacity = '1';
        s.style.filter = 'none';
      });
    }
    return {
      done: new Promise(function (res) { global.setTimeout(res, total); }),
      skip: skip
    };
  }

  /* =======================================================
     鼠标视差（passive + rAF 节流）
     ======================================================= */
  function parallax(scope, strength) {
    var s = strength || 8;
    var handler = P4.rafThrottle(function (e) {
      if (reducedMotion() || P4.data.settings.parallax === false) return;
      var r = scope.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
      var ny = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
      scope.style.setProperty('--px', (-nx * s).toFixed(2) + 'px');
      scope.style.setProperty('--py', (-ny * s * 0.6).toFixed(2) + 'px');
    });
    scope.addEventListener('pointermove', handler, { passive: true });
    scope.addEventListener('pointerleave', function () {
      scope.style.setProperty('--px', '0px');
      scope.style.setProperty('--py', '0px');
    }, { passive: true });
  }

  /* =======================================================
     场景层：远程图 + 程序化回退
     ======================================================= */
  function proceduralScene(seed) {
    /* 冷银/普鲁士蓝的雾街剪影，纯 SVG，无外部依赖 */
    var s = seed || 0;
    var hills = [
      'M0,300 L0,214 L74,196 L120,222 L188,186 L262,214 L330,180 L400,206 L400,300 Z',
      'M0,300 L0,232 L60,220 L132,240 L200,208 L286,236 L352,206 L400,224 L400,300 Z'
    ];
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">' +
      '<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#16283c"/><stop offset=".55" stop-color="#0d1725"/><stop offset="1" stop-color="#070b12"/>' +
      '</linearGradient>' +
      '<radialGradient id="lamp" cx=".5" cy=".5" r=".5">' +
      '<stop offset="0" stop-color="#e0a45c" stop-opacity=".55"/><stop offset="1" stop-color="#e0a45c" stop-opacity="0"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<rect width="400" height="300" fill="url(#sky)"/>' +
      '<circle cx="' + (300 + s * 7) + '" cy="52" r="17" fill="#cdd9e2" opacity=".22"/>' +
      '<path d="' + hills[s % 2] + '" fill="#0b1420" opacity=".9"/>' +
      /* 建筑剪影 */
      '<g fill="#080e17">' +
      '<rect x="14" y="150" width="52" height="150"/><rect x="70" y="176" width="34" height="124"/>' +
      '<rect x="110" y="140" width="64" height="160"/><rect x="182" y="168" width="40" height="132"/>' +
      '<rect x="228" y="132" width="70" height="168"/><rect x="304" y="164" width="46" height="136"/>' +
      '<rect x="356" y="148" width="44" height="152"/>' +
      '<path d="M110,140 L142,116 L174,140 Z"/><path d="M228,132 L263,104 L298,132 Z"/>' +
      '</g>' +
      /* 窗光 */
      '<g fill="#e0a45c" opacity=".5">' +
      '<rect x="26" y="166" width="7" height="10"/><rect x="42" y="188" width="7" height="10"/>' +
      '<rect x="124" y="158" width="8" height="11"/><rect x="150" y="182" width="8" height="11"/>' +
      '<rect x="244" y="150" width="8" height="11"/><rect x="272" y="176" width="8" height="11"/>' +
      '<rect x="318" y="184" width="7" height="10"/><rect x="368" y="170" width="7" height="10"/>' +
      '</g>' +
      /* 煤气灯 */
      '<g stroke="#8a99a7" stroke-width="1.4" fill="none">' +
      '<path d="M92,300 L92,236"/><path d="M86,236 h12"/>' +
      '<path d="M286,300 L286,244"/><path d="M280,244 h12"/>' +
      '</g>' +
      '<circle cx="92" cy="230" r="26" fill="url(#lamp)"/>' +
      '<circle cx="286" cy="238" r="22" fill="url(#lamp)"/>' +
      '<circle cx="92" cy="230" r="3" fill="#f6d09a"/><circle cx="286" cy="238" r="2.6" fill="#f6d09a"/>' +
      /* 雾带 */
      '<g fill="#b6c2cd" opacity=".1">' +
      '<ellipse cx="140" cy="272" rx="180" ry="26"/><ellipse cx="300" cy="286" rx="150" ry="20"/>' +
      '</g>' +
      /* 石板路 */
      '<g stroke="#1b2836" stroke-width="1" opacity=".7">' +
      '<path d="M0,286 H400"/><path d="M0,294 H400"/>' +
      '</g>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function sceneLayer(bgIndex, opts) {
    opts = opts || {};
    var img = h('img.scene-layer__img', {
      alt: '',
      loading: 'lazy',
      decoding: 'async',
      'aria-hidden': 'true',
      src: P4.data.bg[bgIndex % P4.data.bg.length]
    });
    img.addEventListener('error', function () {
      img.src = proceduralScene(bgIndex);
      img.dataset.fallback = '1';
    });
    var layer = h('div.scene-layer', [
      img,
      h('div.scene-layer__fog'),
      opts.lamp === false ? null : h('div.scene-layer__lamp'),
      h('div.scene-layer__veil')
    ]);
    if (opts.parallax !== false) parallax(layer, opts.strength || 9);
    return layer;
  }

  /* =======================================================
     WebAudio 合成音效（默认关；无采样文件依赖）
     ======================================================= */
  var actx = null;
  function ac() {
    if (!actx) {
      var C = global.AudioContext || global.webkitAudioContext;
      if (!C) return null;
      try { actx = new C(); } catch (e) { return null; }
    }
    if (actx.state === 'suspended') { try { actx.resume(); } catch (e) { /* noop */ } }
    return actx;
  }

  function tone(freq, dur, type, gain, when) {
    var a = ac();
    if (!a) return;
    var t0 = a.currentTime + (when || 0);
    var osc = a.createOscillator();
    var g = a.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.045, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(a.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  function noise(dur, gain, filterHz) {
    var a = ac();
    if (!a) return;
    var len = Math.floor(a.sampleRate * dur);
    var buf = a.createBuffer(1, len, a.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = a.createBufferSource(); src.buffer = buf;
    var bq = a.createBiquadFilter(); bq.type = 'bandpass'; bq.frequency.value = filterHz || 2400;
    var g = a.createGain(); g.gain.value = gain || 0.03;
    src.connect(bq); bq.connect(g); g.connect(a.destination);
    src.start();
  }

  var SFX = {
    tap: function () { tone(1180, 0.05, 'triangle', 0.03); },
    plate: function () { tone(520, 0.1, 'sine', 0.035); tone(780, 0.08, 'sine', 0.02, 0.02); },
    open: function () { tone(320, 0.16, 'sine', 0.04); tone(480, 0.22, 'sine', 0.028, 0.05); },
    close: function () { tone(300, 0.12, 'sine', 0.032); },
    seal: function () { noise(0.14, 0.04, 900); tone(190, 0.22, 'sine', 0.05); },
    develop: function () { noise(0.4, 0.016, 5200); },
    fog: function () { tone(140, 0.7, 'sine', 0.035); tone(211, 0.66, 'sine', 0.022, 0.04); },
    chime: function () { tone(880, 0.5, 'sine', 0.035); tone(1320, 0.42, 'sine', 0.018, 0.03); tone(1760, 0.36, 'sine', 0.01, 0.06); },
    warn: function () { tone(220, 0.18, 'square', 0.028); tone(180, 0.22, 'square', 0.024, 0.14); },
    mercury: function () { tone(1560, 0.07, 'sine', 0.022); tone(2100, 0.05, 'sine', 0.014, 0.04); }
  };

  function play(name) {
    if (!P4.data.settings.audio) return;
    var f = SFX[name];
    if (f) { try { f(); } catch (e) { /* noop */ } }
  }

  /* =======================================================
     数值跳动
     ======================================================= */
  function tick(el) {
    if (!el) return;
    el.classList.remove('is-tick');
    void el.offsetWidth;
    el.classList.add('is-tick');
  }

  P4.fx = {
    motes: motes,
    develop: develop,
    parallax: parallax,
    sceneLayer: sceneLayer,
    proceduralScene: proceduralScene,
    play: play,
    tick: tick,
    reducedMotion: reducedMotion
  };
})(window);
