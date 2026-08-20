/* ============================================================
   stage.js —— 显影台三态 / 相纸正文 / 晒片绳选项 / 读心
                显影槽（左，只读）/ 相片墙（右）/ 工作台（底）
   控件预算：舞台 1（三态循环）+ 晒片绳 4 + 输入区 4 + 左脊 1 + 右脊 1 + 头条 1 + 在场 3
   ============================================================ */
(function (global) {
  'use strict';
  var P5 = global.P5 = global.P5 || {};
  var h = P5.h, D = P5.data;

  var S = {
    mode: 'strip',
    round: D.story.round,
    used: {},
    devHandles: [],
    tokens: 4820,
    found: 1
  };

  var MODE_SEQ = ['strip', 'read', 'explore'];
  var MODE_META = {
    strip: { lb: '窄条', icon: 'list', tip: '窄条叙事（galgame）· 点按或按 1/2/3 循环三态' },
    read: { lb: '阅读', icon: 'book', tip: '全屏阅读：底片下沉虚化，相纸全覆盖' },
    explore: { lb: '探索', icon: 'magnifier', tip: '探索热区：相纸缩成一角，放大镜圈可勘查' }
  };

  /* ============================================================
     分支续写（真实文稿）
     ============================================================ */
  var BRANCH = {
    0: {
      heading: '暗房手记 · 第八回合 · 等字显完',
      blocks: [
        { type: 'p', text: '你没有出声。相纸在药液里轻轻晃，那行字一笔一笔地黑下去，像有人正隔着水在写。' },
        { type: 'p', text: '*不是拉丁字母，也不是鲁恩文。*是你母亲缝戏服时用的那种记号——她给每一件行头编号，编号写在里衬上，只有她自己看得懂。' },
        { type: 'aside', text: '旁听命中：这行字不是给你看的，是给「会认它的人」看的。灵性 −1。' },
        { type: 'p', text: '你把相纸提出来，凑到安全灯下。字是：**第三幕 · 斗篷 · 十九**。' },
        { type: 'p', text: '十九年前，那个用眼睛量尺的裁缝，给这件斗篷编了号。而现在，它在你的相纸上自己写了出来。' }
      ],
      actions: [
        { tx: '把相纸带上楼，去问母亲这个编号', cost: null, next: 2 },
        { tx: '开门叫老图恩，问他记不记得十九年前的事', cost: null, next: 1 },
        { tx: '开启「空座」，再冲一张，看它还会写什么', cost: '灵性 2', next: 3 }
      ]
    },
    1: {
      heading: '暗房手记 · 第八回合 · 开门',
      blocks: [
        { type: 'p', text: '你拉下光闸，把红灯拨到「可开门」，然后拉开了门。' },
        { type: 'p', text: '[老图恩|老图恩] 没有立刻进来。他先往里看了一眼——不是看你，是看你身后那面装药液的墙。' },
        { type: 'dlg', text: '「你这屋里……刚才是不是多了一个人的动静？」' },
        { type: 'p', text: '你把第三块干版递给他。他接过去，举到灯下，看了很久，然后手开始抖，不是害怕的抖，是认出来了的抖。' },
        { type: 'dlg', text: '「这个站你后头的。」他用指甲敲了敲那片过曝的白，「十九年前，我在剧院后台见过她一次。她那时候也是这么站的，站在别人后头。」' },
        { type: 'aside', text: '好感 老图恩 33 → 45。关键线索入档：镜后先行者曾于十九年前现身。' }
      ],
      actions: [
        { tx: '问他那一次之后，那个人去了哪里', cost: null, next: 2 },
        { tx: '让他别说了——先把干版锁进保险柜', cost: null, next: 3 },
        { tx: '把光闸重新拉下，当着他的面再冲一张', cost: '灵性 1', next: 0 }
      ]
    },
    2: {
      heading: '暗房手记 · 第八回合 · 上楼',
      blocks: [
        { type: 'p', text: '排字房的铅尘在灯下浮着，像另一种雾。你母亲 [薇拉·凡恩|薇拉·凡恩] 不在这儿——她在家。但缝工的活计簿在这儿，锁在第三个抽屉里，钥匙她给过你一把。' },
        { type: 'p', text: '你翻到十九年前那一册。**第三幕 · 斗篷 · 十九**——这一行确实存在，字是母亲的。但后面「领用人」那一栏是空的。' },
        { type: 'p', text: '空栏上面有一道极浅的压痕，像有人用铅笔写过又擦掉了。你把纸对着灯斜过来，%压痕的形状是三个字，第一个字有十四画%。' },
        { type: 'aside', text: '理智 −2。伏笔「第三幕斗篷来源」推进至可追查。案卷阶段 3/5 → 4/5。' }
      ],
      actions: [
        { tx: '把这一页拍下来，回暗房显影那道压痕', cost: null, next: 0 },
        { tx: '回去找老图恩核对十九年前的人名', cost: null, next: 1 },
        { tx: '现在就用「空座」去玛戈留在门房的那封信', cost: '灵性 2', next: 3 }
      ]
    },
    3: {
      heading: '暗房手记 · 第八回合 · 空座',
      blocks: [
        { type: 'p', text: '你开启*空座*。这一次的失重感更重——因为暗房里本来就没人看你，能被摘掉的东西，只剩你自己对自己的注意。' },
        { type: 'aside', text: '灵性 −2。空座生效（十分钟内剧烈动作将打断）。' },
        { type: 'p', text: '门房的信在第二格抽屉，没有封蜡，只折了两折。里面是一张相纸——不是信纸。' },
        { type: 'p', text: '相纸上是翡翠剧院的观众席，从舞台往下拍。五百六十个座位，全空。' },
        { type: 'p', text: '只有 F 排十三号坐着一个人。%那个人的脸，是一片过曝的白%——和你第三块干版上的那一片，是同一片。' },
        { type: 'p', text: '相纸背面有一行字，字迹和你的曝光记录簿上那行「二次曝光 · 时长未知」一模一样：' },
        { type: 'dlg', text: '「你已经拍到我了。下一次，换我拍你。」' },
        { type: 'aside', text: '理智 −4。伏笔「镜后先行者」升级为「持机者」。剧场点数 +6（伏笔揭晓结算）。' }
      ],
      actions: [
        { tx: '回暗房，把这张相纸也架进放大机', cost: '灵性 1', next: 0 },
        { tx: '去找老图恩——他见过这个人', cost: null, next: 1 },
        { tx: '上楼查活计簿里那个被擦掉的名字', cost: null, next: 2 }
      ]
    }
  };

  /* ============================================================
     迷你标记：*强调* / **加重** / %神秘% / [显示名|NPC]
     ============================================================ */
  function parseInline(text, box) {
    var re = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(%[^%]+%)|(\[[^\]|]+\|[^\]]+\])/g;
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) box.appendChild(document.createTextNode(text.slice(last, m.index)));
      var t = m[0];
      if (t.slice(0, 2) === '**') box.appendChild(h('strong.em', t.slice(2, -2)));
      else if (t[0] === '*') box.appendChild(h('em.em', t.slice(1, -1)));
      else if (t[0] === '%') box.appendChild(h('span.occult', t.slice(1, -1)));
      else {
        var p = t.slice(1, -1).split('|');
        box.appendChild(mind(p[0], p[1]));
      }
      last = m.index + t.length;
    }
    if (last < text.length) box.appendChild(document.createTextNode(text.slice(last)));
    return box;
  }

  function mind(label, name) {
    var el = h('button.mind', {
      type: 'button',
      dataset: { npc: name, read: 0 },
      title: '旁听「' + name + '」的表层心念（灵性 1）',
      onclick: function () { readMind(el, name); }
    }, label);
    return el;
  }

  function readMind(el, name) {
    if (el.dataset.read === '1') return;
    var npc = D.relations.filter(function (r) { return r.name === name; })[0];
    var sp = D.attrs.filter(function (a) { return a.key === 'spirit'; })[0];
    if (D.reach && D.reach[name] === 'far') {
      P5.notify.warn('旁听不到', '「' + name + '」隔着一层楼。旁听只够三步——这是序列 9 的边界，不是你不够专心。');
      return;
    }
    if (!npc || !npc.whisper) {
      P5.notify.warn('旁听未果', '那里没有可读的东西。不是隐瞒，是空的。');
      return;
    }
    if (sp.cur < 1) { P5.notify.warn('灵性不足', '旁听要一点灵性。你现在连自己的念头都压不住。'); return; }
    sp.cur -= 1;
    el.dataset.read = '1';
    var para = el.closest('p') || el.parentNode;
    var w = h('span.whisper', npc.whisper);
    if (para && para.parentNode) para.parentNode.insertBefore(w, para.nextSibling);
    else el.parentNode.appendChild(w);
    refreshAttrs();
    P5.fx.play('mercury');
    P5.notify.cyan('旁听 · ' + name, '心声已誊到人物关系条目背面。灵性 −1。');
  }

  /* ============================================================
     显影台
     ============================================================ */
  function buildStage() {
    var view = P5.$('#p5-stage-view');
    P5.clear(view);
    view.appendChild(P5.fx.sceneLayer(D.scene.bgIndex, { strength: 10 }));

    view.appendChild(h('div.stage__tools', [
      h('div.scene-tag', [
        P5.icon('pin', 12),
        h('span.zh', D.scene.title),
        h('span.en', D.scene.latin)
      ]),
      h('span.grow'),
      h('button#p5-btn-mode', {
        type: 'button',
        title: MODE_META.strip.tip,
        'aria-label': '切换叙事三态',
        onclick: cycleMode
      }, [P5.icon('list', 13), h('span.lb', '窄条')])
    ]));

    var loupes = h('div#p5-loupes');
    D.hotspots.forEach(function (s, i) {
      loupes.appendChild(h('button.loupe', {
        type: 'button', id: 'p5-loupe-' + i,
        dataset: { found: s.found ? 1 : 0 },
        style: { left: s.x + '%', top: s.y + '%' },
        'aria-label': '勘查：' + s.label,
        onclick: function () { inspect(i, this); }
      }, [P5.icon(s.icon, 14), h('span.loupe__tip', s.label)]));
    });
    view.appendChild(loupes);
    view.appendChild(h('div.explore-hint', [h('div.zh', '现场勘查'), h('div.en', 'five points of interest')]));

    var print = h('article#p5-print.photo-print', { 'aria-label': '相纸：叙事正文' }, [
      h('header.print__head', [
        h('span.en', 'contact print · N° ' + String(S.round).padStart(3, '0')),
        h('span.stamp', D.scene.time)
      ]),
      h('div#p5-print-scroll.print__scroll', [
        h('div#p5-story', { 'aria-live': 'polite' }),
        h('div#p5-pins.line-wrap')
      ]),
      h('footer.print__foot', [
        h('span.t-code', D.pc.title),
        h('span.grow'),
        h('span.t-code', { id: 'p5-progress' }, '显影 62%')
      ])
    ]);
    view.appendChild(print);

    print.addEventListener('click', function (e) {
      if (P5.$('#p5-stage').dataset.mode === 'explore') { setMode('strip'); return; }
      if (e.target.closest('.pin-photo,.mind,button,a')) return;
      skipDev();
    });

    renderStory(D.story, true);
    buildComposer();
    setMode(S.mode);
  }

  function cycleMode() {
    var i = MODE_SEQ.indexOf(S.mode);
    setMode(MODE_SEQ[(i + 1) % MODE_SEQ.length]);
  }

  function setMode(mode) {
    S.mode = mode;
    var st = P5.$('#p5-stage');
    if (st) st.dataset.mode = mode;
    var b = P5.$('#p5-btn-mode');
    if (b) {
      var m = MODE_META[mode];
      P5.mount(b, [P5.icon(m.icon, 13), h('span.lb', m.lb)]);
      b.title = m.tip;
    }
    P5.fx.play('plate');
    if (mode === 'explore') {
      P5.notify.info('现场勘查', '已发现 ' + S.found + ' / ' + D.hotspots.length + ' 处可勘查之物。点击相纸一角回到叙事。');
    }
    P5.emit('stage:mode', mode);
  }

  /* ---------- 正文渲染（银盐显影） ---------- */
  function renderStory(round, animate) {
    var host = P5.$('#p5-story');
    P5.clear(host);
    S.devHandles = [];

    host.appendChild(h('div', {
      style: {
        display: 'flex', alignItems: 'baseline', gap: '12px',
        paddingBottom: '8px', marginBottom: '12px',
        borderBottom: '1px solid color-mix(in srgb, var(--ink-3) 34%, transparent)'
      }
    }, [
      h('span.t-plate', { style: { color: 'var(--ink-3)' } }, 'round ' + String(S.round).padStart(2, '0')),
      h('span', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-xs)', letterSpacing: '.16em', fontWeight: '700', color: 'var(--safelight-3)' } }, round.heading)
    ]));

    var body = h('div.story');
    var delay = 0;
    round.blocks.forEach(function (blk) {
      var el;
      if (blk.type === 'dlg') el = h('span.dlg');
      else if (blk.type === 'aside') { body.appendChild(h('span.aside', '※ ' + blk.text)); return; }
      else el = h('p');
      if (animate && !P5.fx.reducedMotion()) {
        parseInline(blk.text, el);
        devNodes(el, delay);
        delay += Math.min(880, blk.text.length * 7);
      } else parseInline(blk.text, el);
      body.appendChild(el);
    });
    host.appendChild(body);
    renderPins(round.actions);
    var sc = P5.$('#p5-print-scroll');
    if (sc) sc.scrollTop = 0;
    if (animate) P5.fx.play('develop');
  }

  function devNodes(root, base) {
    var step = 7, i = 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(function (tn) {
      var frag = document.createDocumentFragment();
      Array.from(tn.nodeValue).forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'dev-char';
        s.textContent = c;
        s.style.animationDelay = (base + i * step) + 'ms';
        i++;
        frag.appendChild(s);
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    S.devHandles.push(root);
  }

  function skipDev() {
    if (!S.devHandles.length) return;
    S.devHandles.forEach(function (root) {
      P5.$$('.dev-char', root).forEach(function (s) {
        s.style.animation = 'none'; s.style.opacity = '1'; s.style.filter = 'none';
      });
    });
    S.devHandles = [];
  }

  /* ---------- 晒片绳上的行动相片 ---------- */
  function renderPins(actions) {
    var host = P5.$('#p5-pins');
    P5.clear(host);
    if (!actions || !actions.length) {
      host.appendChild(h('div.print', [
        h('h4', '本回合无预置选项'),
        h('p', '此处应由模型给出行动建议。本原型不含后端，你可以直接在下方写下任意行动，或打一个「/」调出指令。')
      ]));
      return;
    }
    var pins = h('div.pins');
    actions.forEach(function (a, i) {
      pins.appendChild(h('button.pin-photo', {
        type: 'button', id: 'p5-pin-' + i,
        onclick: function () { choose(a, i); }
      }, [
        h('span.pin-photo__n', P5.roman(i + 1)),
        (function () { var s = h('span.pin-photo__tx'); parseInline(a.tx, s); return s; })(),
        a.cost ? h('span.pin-photo__cost', a.cost) : null
      ]));
    });
    host.appendChild(pins);
  }

  /* ---------- 回合推进 ---------- */
  function choose(a, idx) {
    if (a.next === 'reset') {
      S.used = {}; S.round = D.story.round; D.scene.round = S.round;
      renderStory(D.story, true); bumpBench();
      P5.notify.info('已回到第七回合', '四条分支重新可选。');
      return;
    }
    var key = (a.next !== undefined && a.next !== null) ? a.next : idx;
    if (S.used[key] || !BRANCH[key]) {
      var free = Object.keys(BRANCH).filter(function (k) { return !S.used[k]; });
      key = free.length ? Number(free[0]) : null;
    }
    if (a.cost) {
      var m = /灵性\s*(\d+)/.exec(a.cost);
      if (m) {
        var sp = D.attrs.filter(function (x) { return x.key === 'spirit'; })[0];
        var need = Number(m[1]);
        if (sp.cur < need) {
          P5.notify.warn('灵性不足', '这一步要 ' + need + ' 点灵性，你只剩 ' + sp.cur + ' 点。先歇一场。');
          return;
        }
        sp.cur -= need; refreshAttrs();
      }
    }
    if (key !== null) {
      S.used[key] = true;
      S.round += 1;
      S.tokens += 380 + Math.round(Math.random() * 160);
      D.scene.round = S.round;
      var hd = P5.$('#p5-print .print__head .en');
      if (hd) hd.textContent = 'contact print · N° ' + String(S.round).padStart(3, '0');
      renderStory(BRANCH[key], true);
      var pr = P5.$('#p5-print');
      if (pr) { pr.classList.remove('round-flash'); void pr.offsetWidth; pr.classList.add('round-flash'); }
      P5.notify.ok('第 ' + S.round + ' 回合已定影', '正文与尾部标签同一次调用返回；变量与总结后台异步。');
      bumpBench();
      return;
    }
    renderStory({
      heading: '暗房手记 · 演示到此',
      blocks: [
        { type: 'p', text: '你想再冲一张，药盘却空了——不是没有药液，是*没有更多的字*。' },
        { type: 'p', text: '这是原型的边界：本页只有前端。四条分支的文稿已写就并演完，再往下需要接上模型，让它继续往这卷胶片上曝光。' },
        { type: 'aside', text: '协议就位：正文 + 尾部标签（content / action / event / recall / state_update）。接入后端即可续写。' }
      ],
      actions: [{ tx: '回到第七回合，重冲一遍', cost: null, next: 'reset' }]
    }, true);
    P5.notify.info('演示分支已走完', '点唯一那张相片可回到第七回合。');
  }

  /* ---------- 热区勘查 ---------- */
  function inspect(i, btn) {
    var s = D.hotspots[i];
    if (!s.found) { s.found = 1; S.found += 1; btn.dataset.found = '1'; }
    var view = P5.$('#p5-stage-view');
    var old = P5.$('#p5-loupe-note');
    if (old) old.parentNode.removeChild(old);
    var note = h('aside#p5-loupe-note.print', {
      style: {
        position: 'absolute', zIndex: '5', width: 'min(320px, 68%)',
        left: P5.clamp(s.x, 6, 60) + '%', top: P5.clamp(s.y + 6, 6, 62) + '%',
        animation: 'block-in 300ms var(--ease-develop)'
      }
    }, [
      h('div.row.row--between', { style: { marginBottom: '6px' } }, [
        h('h4', s.label),
        P5.iconBtn('close', { title: '收起速记', size: 12, onClick: function () { if (note.parentNode) note.parentNode.removeChild(note); } })
      ]),
      h('p.note', s.text),
      h('div.row', { style: { marginTop: '8px' } }, [
        h('span.tag', '现场速记'),
        h('span.tag.tag--cyan', '已发现 ' + S.found + '/' + D.hotspots.length)
      ])
    ]);
    view.appendChild(note);
    P5.fx.play('tap');
  }

  /* ============================================================
     输入区：4 个控件（输入 / 快门 / 回退 / 回合菜单）
     「/」自动完成替代常驻指令 chip 行
     ============================================================ */
  function buildComposer() {
    var box = P5.$('#p5-composer');
    P5.clear(box);
    var ta, slash, menu;

    slash = h('div#p5-slash', { hidden: true, role: 'listbox', 'aria-label': '指令补全' });
    menu = h('div#p5-turnmenu', { hidden: true, role: 'menu', 'aria-label': '回合操作' }, [
      menuItem('refresh', '重新生成本回合', 'R', function () {
        P5.notify.info('重演本回合', '同一上下文重新调用一次；变量快照将被覆盖。');
        renderStory(S.round === D.story.round ? D.story : (BRANCH[Object.keys(S.used).pop()] || D.story), true);
      }),
      menuItem('redo', '重新演算本回合变量', 'V', function () {
        P5.notify.info('变量重算已排入后台', '只重跑 state_update，不重写正文。');
        global.setTimeout(function () { P5.notify.ok('变量已重算', '15 项通过，1 项被拦截（stat_data.运气 类型不符）。'); }, 1100);
      }),
      menuItem('save', '写入档案馆', 'S', function () {
        P5.notify.ok('已存档', '节点 R' + S.round + ' 写入 IndexedDB（原型仅演示界面反馈）。');
      }),
      menuItem('close', '强制中断生成', 'Esc', function () {
        P5.notify.warn('已请求中断', '流式连接关闭，本回合不写入档案。');
      }, true)
    ]);

    box.appendChild(h('div.bench-in', [
      h('div.quill', [
        h('span.quill__nib', P5.icon('feather', 15)),
        (ta = h('textarea#p5-input', {
          rows: 1,
          placeholder: '写下你的行动，或打一个「/」调出指令……（Enter 发送，Shift+Enter 换行）',
          'aria-label': '行动输入',
          oninput: function () {
            this.style.height = 'auto';
            this.style.height = Math.min(132, this.scrollHeight) + 'px';
            updateSlash();
          },
          onkeydown: onKey
        }))
      ]),
      P5.btn('发送', { id: 'p5-btn-send', variant: 'primary', icon: 'send', size: 'lg', onClick: send }),
      P5.iconBtn('undo', {
        id: 'p5-btn-undo', large: true, title: '回退到上一回合',
        onClick: function () {
          P5.notify.confirm({
            title: '回退一回合？', icon: 'undo',
            msg: '当前回合的正文与变量快照将被丢弃，档案馆节点树回到上一节点。此操作可再前进。',
            okText: '回退'
          }).then(function (ok) {
            if (!ok) return;
            S.used = {}; S.round = D.story.round;
            renderStory(D.story, true); bumpBench();
            P5.notify.ok('已回退', '节点树已定位到 R7。');
          });
        }
      }),
      P5.iconBtn('sliders', {
        id: 'p5-btn-turn', large: true, title: '回合操作（重演 / 变量重算 / 存档 / 中断）',
        onClick: function () {
          menu.hidden = !menu.hidden;
          this.setAttribute('aria-pressed', menu.hidden ? 'false' : 'true');
        }
      }),
      slash, menu
    ]));

    document.addEventListener('pointerdown', function (e) {
      if (!menu.hidden && !e.target.closest('#p5-turnmenu,#p5-btn-turn')) {
        menu.hidden = true;
        var b = P5.$('#p5-btn-turn');
        if (b) b.setAttribute('aria-pressed', 'false');
      }
      if (!slash.hidden && !e.target.closest('#p5-slash,#p5-input')) slash.hidden = true;
    }, true);

    var slashCursor = 0;

    function currentQuery() {
      var v = ta.value;
      var m = /(^|\s)\/([^\s]*)$/.exec(v);
      return m ? m[2] : null;
    }
    function updateSlash() {
      var q = currentQuery();
      if (q === null) { slash.hidden = true; return; }
      var list = D.quickCmds.filter(function (c) { return !q || c.cmd.indexOf(q) > 0 || c.ds.indexOf(q) >= 0; });
      if (!list.length) { slash.hidden = true; return; }
      slashCursor = 0;
      P5.clear(slash);
      list.forEach(function (c, i) {
        slash.appendChild(h('button.slash-item' + (i === 0 ? '.is-cursor' : ''), {
          type: 'button', role: 'option', 'aria-selected': i === 0 ? 'true' : 'false',
          onclick: function () { applyCmd(c.cmd); }
        }, [P5.icon('terminal', 13), h('span.cmd', c.cmd), h('span.ds', c.ds)]));
      });
      slash.hidden = false;
    }
    function applyCmd(cmd) {
      ta.value = ta.value.replace(/(^|\s)\/[^\s]*$/, function (all, pre) { return pre + cmd + ' '; });
      slash.hidden = true;
      ta.focus();
      P5.fx.play('tap');
    }
    function onKey(e) {
      if (!slash.hidden) {
        var items = P5.$$('.slash-item', slash);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          slashCursor = (slashCursor + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
          items.forEach(function (n, j) { n.classList.toggle('is-cursor', j === slashCursor); n.setAttribute('aria-selected', j === slashCursor ? 'true' : 'false'); });
          return;
        }
        if (e.key === 'Tab' || (e.key === 'Enter' && items[slashCursor])) {
          e.preventDefault();
          items[slashCursor].click();
          return;
        }
        if (e.key === 'Escape') { e.preventDefault(); slash.hidden = true; return; }
      }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    }
    function send() {
      var v = ta.value.trim();
      if (!v) { P5.notify.warn('还没有写下任何东西', '空白的行动不会被送出——这不是沉默，是留白。'); ta.focus(); return; }
      var free = Object.keys(BRANCH).filter(function (k) { return !S.used[k]; });
      P5.notify.ok('已按下快门', '你的行动进入本回合上下文尾部（recency 区）。');
      ta.value = ''; ta.style.height = 'auto'; slash.hidden = true;
      choose({ tx: v, cost: null, next: free.length ? Number(free[0]) : null }, 0);
    }
  }

  function menuItem(icon, label, key, onClick, danger) {
    return h('button.menu-item' + (danger ? '.menu-item--danger' : ''), {
      type: 'button', role: 'menuitem',
      onclick: function () { P5.$('#p5-turnmenu').hidden = true; onClick(); }
    }, [P5.icon(icon, 13), h('span', label), h('span.k', key)]);
  }

  /* ============================================================
     显影槽（左）—— 只读；唯一控件是脊标
     ============================================================ */
  function buildTrough() {
    var body = P5.$('#p5-trough-body');
    P5.clear(body);
    var pc = D.pc;

    body.appendChild(h('div.ident', [
      h('div.plate-portrait', h('span', pc.sigil)),
      h('div', [
        h('div.ident__name', pc.name),
        h('div.ident__meta', pc.gender + ' · ' + pc.age + ' 岁'),
        h('div.ident__meta', pc.job)
      ])
    ]));

    body.appendChild(h('section.sect', [
      h('div.sect__t', [h('span.zh', '显影量筒'), h('span.en', 'six cylinders')]),
      h('div#p5-cyl-bank.cyl-bank', { role: 'group', 'aria-label': '六维属性显影量筒' })
    ]));

    body.appendChild(h('section.block', [
      h('div.row.row--between', [
        h('span.plate', h('span.tx', '序列 ' + pc.sequence + ' · ' + pc.seqName)),
        P5.arcMeter(pc.digest, 100, 44, 'cyan', pc.digest + '%')
      ]),
      h('div.col', { style: { gap: '4px', marginTop: '8px' } }, [
        h('div.row.row--between', [h('span.t-plate', '途径'), h('span', { style: { fontSize: 'var(--fs-2xs)', color: 'var(--txt)' } }, pc.pathway + ' 途径')]),
        h('div.row.row--between', [h('span.t-plate', '晋升'), h('span', { style: { fontSize: 'var(--fs-2xs)', color: 'var(--txt)' } }, pc.system)]),
        h('div.row.row--between', { style: { marginTop: '4px' } }, [h('span.t-plate', '失控（过曝）'), h('span.t-num.t-red', { style: { fontSize: 'var(--fs-2xs)' } }, pc.corruption + '%')]),
        P5.bar(pc.corruption, 'red')
      ])
    ]));

    /* 只读读出：特质 / 装备 / 任务 / 钱袋（不给每项一个按钮） */
    body.appendChild(h('section.sect', [
      h('div.sect__t', [h('span.zh', '非凡特性'), h('span.en', 'traits')]),
      h('div.readout', D.traits.extraordinary.map(function (t) {
        return h('div.readout__row', [
          h('span.ic', P5.icon('dot', 11)),
          h('span.nm', { title: t.desc }, t.name),
          h('span.vl', t.tier)
        ]);
      }))
    ]));

    body.appendChild(h('section.sect', [
      h('div.sect__t', [h('span.zh', '装备 5+1'), h('span.en', 'kit')]),
      h('div.readout', D.equipment.map(function (e) {
        return h('div.readout__row', [
          h('span.ic', P5.icon(e.icon, 11)),
          h('span.nm', { title: e.desc }, e.filled ? e.name : '（空槽）'),
          h('span.vl', e.kind)
        ]);
      }).concat([
        h('div.readout__row', [
          h('span.ic', P5.icon('mask', 11)),
          h('span.nm', { title: D.roleplaySlot.desc, style: { color: 'var(--cyan-2)' } }, '一名沉默的观众'),
          h('span.vl', D.roleplaySlot.digest + '%')
        ])
      ]))
    ]));

    body.appendChild(h('section.sect', [
      h('div.sect__t', [h('span.zh', '委托与任务'), h('span.en', 'commissions'), h('span.tag.tag--fixer', D.quests.filter(function (q) { return q.state === 'doing'; }).length + '/' + D.quests.length)]),
      h('div.readout', D.quests.map(function (q) {
        return h('div.readout__row', [
          h('span.ic', P5.icon(q.state === 'doing' ? 'target' : 'dot', 11)),
          h('span.nm', { title: q.note + '　期限：' + q.due }, q.name),
          h('span.vl', q.cur + '/' + q.max)
        ]);
      }))
    ]));

    var b = D.ledger.balance;
    body.appendChild(h('section.block', [
      h('div.row.row--between', [
        h('span.t-plate', '钱袋'),
        h('span.t-num', { style: { fontSize: 'var(--fs-2xs)', color: 'var(--fixer-2)' } }, b.pound + ' 镑 ' + b.soli + ' 苏勒 ' + b.penny + ' 便士')
      ]),
      h('div.row.row--wrap', { style: { marginTop: '6px' } }, [
        h('span.tag.tag--fixer', '理智正常'),
        h('span.tag.tag--cyan', '旁听 · 生效中'),
        h('span.tag', '疲劳 · 轻'),
        h('span.tag.tag--warn', '过曝 4%')
      ])
    ]));

    refreshAttrs();
  }

  function refreshAttrs() {
    var bank = P5.$('#p5-cyl-bank');
    if (bank) {
      P5.clear(bank);
      D.attrs.forEach(function (a) {
        var p = P5.pct(a.cur, a.max);
        bank.appendChild(h('div.cyl' + (p < 30 ? '.is-low' : ''), {
          dataset: { attr: a.key },
          role: 'meter',
          'aria-valuenow': String(a.cur), 'aria-valuemin': '0', 'aria-valuemax': String(a.max),
          'aria-label': a.zh + ' ' + a.cur + ' / ' + a.max,
          title: a.zh + ' ' + a.cur + ' / ' + a.max
        }, [
          h('div.cyl__glass', [h('div.cyl__liquid', { style: { height: p + '%' } }), h('div.cyl__scale')]),
          h('span.cyl__val', a.cur),
          h('span.cyl__name', a.zh)
        ]));
      });
    }
    var mini = P5.$('#p5-mini');
    if (mini) {
      P5.clear(mini);
      ['spirit', 'sanity'].forEach(function (k) {
        var a = D.attrs.filter(function (x) { return x.key === k; })[0];
        mini.appendChild(h('div.cyl-row', { dataset: { attr: k } }, [
          h('span.cyl-row__name', a.zh),
          h('div.cyl-row__track', { style: { '--fill': P5.pct(a.cur, a.max) + '%' } }),
          h('span.cyl-row__val', a.cur + '/' + a.max)
        ]));
      });
    }
    P5.emit('attrs:change');
  }

  /* ============================================================
     相片墙（右）—— 控件 4 个：头条 + 在场 ×3
     ============================================================ */
  function buildWall() {
    var body = P5.$('#p5-wall-body');
    P5.clear(body);

    body.appendChild(h('button.wall-card', {
      type: 'button', id: 'p5-headline', 'aria-label': '翻开廷根晚报',
      onclick: function () { P5.sheet.open('news', this); }
    }, [
      h('div.wall-card__mast', [h('span.zh', D.news.masthead), h('span.n', D.news.issue)]),
      h('div.wall-card__hd', D.news.lead.hd),
      h('p.wall-card__lead', D.news.lead.tx.slice(0, 70) + '……'),
      h('div.row', { style: { marginTop: '8px', justifyContent: 'flex-end' } }, [
        h('span', { style: { fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-3xs)', color: 'var(--ink-3)' } }, '翻开全版'),
        P5.icon('chevronRight', 11)
      ])
    ]));

    body.appendChild(h('section.sect', [
      h('div.sect__t', [h('span.zh', '在场与可及'), h('span.en', 'within earshot')]),
      h('div.neg-list', D.present.map(function (nm) {
        var r = D.relations.filter(function (x) { return x.name === nm; })[0];
        var near = !D.reach || D.reach[nm] === 'near';
        return h('button.neg', {
          type: 'button', id: 'p5-neg-' + r.sigil,
          title: near ? '旁听「' + nm + '」（灵性 1）' : '「' + nm + '」不在三步之内，旁听不到',
          onclick: function () {
            if (!near) { P5.notify.warn('旁听不到', '「' + nm + '」隔着一层楼。序列 9 的耳朵只够三步。'); return; }
            var sp = D.attrs.filter(function (x) { return x.key === 'spirit'; })[0];
            if (sp.cur < 1) { P5.notify.warn('灵性不足', '旁听要一点灵性。'); return; }
            sp.cur -= 1; refreshAttrs(); P5.fx.play('mercury');
            P5.notify.cyan('旁听 · ' + nm, r.whisper);
          }
        }, [
          h('span.neg__frame', r.sigil),
          h('div', [h('div.neg__nm', r.name), h('div.neg__rl', r.role)]),
          h('span.tag' + (near ? '.tag--cyan' : ''), near ? '三步内' : '隔层')
        ]);
      }))
    ]));

    body.appendChild(h('section.block', [
      h('div.t-plate', { style: { marginBottom: '6px' } }, 'live reading'),
      h('div#p5-mini.col', { style: { gap: '6px' } })
    ]));

    body.appendChild(h('section.sect', [
      h('div.sect__t', [h('span.zh', '活跃伏笔'), h('span.en', 'loose threads')]),
      h('div', D.threads.filter(function (t) { return t.live; }).slice(0, 4).map(function (t) {
        return h('div.thread', [
          h('span.thread__dot'),
          h('div', [h('div.thread__tx', t.tx), h('div.thread__src', '登记于 ' + t.src)])
        ]);
      }))
    ]));

    body.appendChild(h('section.sect', [
      h('div.sect__t', [h('span.zh', '取样张'), h('span.en', 'contact sheet')]),
      h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.8', color: 'var(--txt-3)' } },
        '二十四个面板都印在同一张样张上。按反引号键、Ctrl+K，或点顶梁的样张钮取来——这里不再重复摆一遍入口。')
    ]));

    refreshAttrs();
  }

  /* ============================================================
     工作台（底）—— 0 常驻控件
     ============================================================ */
  function buildBench() {
    var left = P5.$('#p5-bench-left');
    var right = P5.$('#p5-bench-right');
    P5.clear(left); P5.clear(right);
    left.appendChild(h('span.exposure', [P5.icon('hourglass', 11), ' 曝光计 ', h('b', '4.0s'), ' · f/8']));
    var b = D.ledger.balance;
    right.appendChild(h('span.bench__stat', [P5.icon('coins', 11), ' ', h('b', b.pound + '镑'), ' ' + b.soli + '苏勒']));
    right.appendChild(h('span.bench__stat', [P5.icon('layers', 11), ' 上下文 ', h('b', { id: 'p5-tok' }, P5.num(S.tokens)), ' tok']));
    right.appendChild(h('span.bench__stat', [P5.icon('clock', 11), ' 回合 ', h('b', { id: 'p5-round' }, String(S.round))]));
    P5.sheet.syncDock();
  }

  function bumpBench() {
    var t = P5.$('#p5-tok'), r = P5.$('#p5-round');
    if (t) { t.textContent = P5.num(S.tokens); P5.fx.tick(t); }
    if (r) { r.textContent = String(S.round); P5.fx.tick(r); }
  }

  P5.stage = {
    state: S,
    buildStage: buildStage,
    buildTrough: buildTrough,
    buildWall: buildWall,
    buildBench: buildBench,
    setMode: setMode,
    cycleMode: cycleMode,
    refreshAttrs: refreshAttrs,
    parseInline: parseInline,
    branches: BRANCH
  };
})(window);
