/* ===========================================================
   stage.js —— 舞台三态 / 叙事渲染 / 读心 / 行动 / 输入
                左仪表塔 / 右卷宗栏 / 银轨
   =========================================================== */
(function (global) {
  'use strict';
  var P4 = global.P4 = global.P4 || {};
  var h = P4.h, D = P4.data;

  var S = {
    mode: 'strip',
    round: D.story.round,
    spirit: null,
    usedBranches: {},
    developHandles: [],
    tokens: 4820,
    hotFound: 1
  };

  /* =======================================================
     分支续写（真实文稿，非占位）
     ======================================================= */
  var BRANCH = {
    0: {
      heading: '幕后手记 · 第八回合 · 旁听',
      blocks: [
        { type: 'p', text: '你没有动。呼吸压到最浅，让自己的念头一个个坐下去，像戏散后空掉的座位。' },
        { type: 'p', text: '[玛戈·希尔|玛戈·希尔] 的心念抵达时带着她自己的语气——比她说话时更快，更抖。' },
        { type: 'aside', text: '旁听命中：心声已记入人物关系「玛戈·希尔」条目。灵性 −1。' },
        { type: 'p', text: '她锁完门，把钥匙串按在胸口，指腹反复摩过其中一枚——那枚比别的短，齿口是新磨的。*那不是道具间的钥匙*。' },
        { type: 'p', text: '「十九年了。」她极轻地说，不是对你，也不是对任何在场的人，「这次能不能换个人。」' }
      ],
      actions: [
        { tx: '追问那枚新磨的钥匙开的是哪扇门', cost: null, next: 2 },
        { tx: '假装什么都没听见，退到走廊阴影里等她离开', cost: '灵性 2', next: 3 },
        { tx: '把「十九年」写进记事簿，转向塞西莉亚', cost: null, next: 1 }
      ]
    },
    1: {
      heading: '幕后手记 · 第八回合 · 台词',
      blocks: [
        { type: 'p', text: '你走到化妆镜前三步远的地方停住，用第三幕的语速念了一句：' },
        { type: 'dlg', text: '「——雾散的时候，谁站在你旁边？」' },
        { type: 'p', text: '[塞西莉亚·朗|塞西莉亚·朗] 的手停在锁骨上。她没有转身，镜子里的她先看了你一眼。' },
        { type: 'dlg', text: '「你怎么会有这一页。」她的声音很稳，稳得像背台词，「这一页昨天就没有了。」' },
        { type: 'p', text: '她终于回头，眼白里布满细红丝。%她开口时，你听见两个声音同时说出同一句话，其中一个晚了半拍。%' },
        { type: 'aside', text: '好感 塞西莉亚·朗 41 → 47。伏笔「第三幕替补名单」推进。' }
      ],
      actions: [
        { tx: '直接问她：第三幕替她念完台词的是谁', cost: null, next: 2 },
        { tx: '请她照第三幕的走位再走一遍，你在旁边旁听', cost: '灵性 1', next: 0 },
        { tx: '先带她离开后台，别在这里说', cost: null, next: 3 }
      ]
    },
    2: {
      heading: '幕后手记 · 第八回合 · 扫帚',
      blocks: [
        { type: 'p', text: '你握住 [老图恩|老图恩] 横在身前的扫帚柄。木头是温的——他握了很久。' },
        { type: 'dlg', text: '「上一个从镜子那边走的人，是谁？」' },
        { type: 'p', text: '老图恩看了你很久，酒气里忽然有了清醒的东西。他抬起扫帚，用柄尖在地板的银粉上划了三道。' },
        { type: 'dlg', text: '「一、二、三。」他说，「都是女的。都穿第三幕的斗篷。斗篷不是她们的——是那个座位的。」' },
        { type: 'p', text: '他的心念这时才追上来，慢，重，像拖着湿麻袋：*我第四次扫这道粉了。第一次是十九年前，那年我还年轻。*' },
        { type: 'aside', text: '关键线索入档：斗篷属于座位，而非演员。案卷「翡翠剧院连环失踪案」阶段 3/5 → 4/5。' }
      ],
      actions: [
        { tx: '问他十九年前那次，失踪的是谁', cost: null, next: 3 },
        { tx: '回头旁听玛戈——她刚才说了「这次能不能换个人」', cost: '灵性 1', next: 0 },
        { tx: '去看那件斗篷现在挂在谁身上', cost: null, next: 1 }
      ]
    },
    3: {
      heading: '幕后手记 · 第八回合 · 空座',
      blocks: [
        { type: 'p', text: '你开启*空座*。注意力从你身上滑走的那一瞬有轻微的失重感，像被人从合影里裁掉。' },
        { type: 'aside', text: '灵性 −2。空座生效（10 分钟内剧烈动作将打断）。' },
        { type: 'p', text: '玛戈的目光扫过你站的位置，没有停。老图恩把扫帚放下了。你贴着墙，走进那段两步宽的黑，推开道具间的门——门轴上了新油，一声不响。' },
        { type: 'p', text: '立镜就在北墙。它比整个房间都干净。镜框下沿那线银灰色粉末在灯下细细地亮，%像有人把一整条银河碾碎了，抹在人能扶到的高度%。' },
        { type: 'p', text: '你在镜子里看见自己。然后你看见镜子里的自己——*比你早半个呼吸*——抬起手，指向你身后的方向。' },
        { type: 'p', text: '你身后没有人。座位表上，那个位置写着 F-13。' },
        { type: 'aside', text: '理智 −3。伏笔「镜后低语」升级为「镜中先行者」。占卜可用性 +1。' }
      ],
      actions: [
        { tx: '不回头，先旁听镜子里的那个自己', cost: '灵性 1', next: 0 },
        { tx: '回头', cost: null, next: 2 },
        { tx: '退出道具间，去找塞西莉亚核对第三幕走位', cost: null, next: 1 }
      ]
    }
  };

  /* =======================================================
     迷你标记解析
     *强调* / %神秘% / [显示名|NPC名]
     ======================================================= */
  function parseInline(text, container) {
    var re = /(\*[^*]+\*)|(%[^%]+%)|(\[[^\]|]+\|[^\]]+\])/g;
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) container.appendChild(document.createTextNode(text.slice(last, m.index)));
      var tok = m[0];
      if (tok[0] === '*') {
        container.appendChild(h('em.em', tok.slice(1, -1)));
      } else if (tok[0] === '%') {
        container.appendChild(h('span.occult', tok.slice(1, -1)));
      } else {
        var inner = tok.slice(1, -1).split('|');
        container.appendChild(mindTarget(inner[0], inner[1]));
      }
      last = m.index + tok.length;
    }
    if (last < text.length) container.appendChild(document.createTextNode(text.slice(last)));
    return container;
  }

  function mindTarget(label, npcName) {
    var el = h('button.mind-target', {
      type: 'button',
      dataset: { npc: npcName, read: 0 },
      title: '旁听「' + npcName + '」的表层心念（灵性 1）',
      onclick: function () { readMind(el, npcName); }
    }, label);
    return el;
  }

  function readMind(el, npcName) {
    if (el.dataset.read === '1') return;
    var npc = D.relations.filter(function (r) { return r.name === npcName; })[0];
    var sp = D.attrs.filter(function (a) { return a.key === 'spirit'; })[0];
    if (!npc || !npc.whisper) {
      P4.notify.warn('旁听未果', '「' + npcName + '」的表层心念此刻不可读——不是隐瞒，是那里没有可读的东西。');
      return;
    }
    if (sp.cur < 1) {
      P4.notify.warn('灵性不足', '旁听需要一点灵性。你现在连自己的念头都压不住。');
      return;
    }
    sp.cur -= 1;
    el.dataset.read = '1';
    var para = el.closest('p') || el.parentNode;
    var whisper = h('span.mind-whisper', npc.whisper);
    if (para && para.parentNode) para.parentNode.insertBefore(whisper, para.nextSibling);
    else el.parentNode.appendChild(whisper);
    refreshAttrs();
    P4.fx.play('mercury');
    P4.notify.mystic('旁听 · ' + npcName, '心声已记入人物关系条目。灵性 −1。');
  }

  /* =======================================================
     舞台构建
     ======================================================= */
  function buildStage() {
    var view = P4.$('#p4-stage-view');
    P4.clear(view);

    view.appendChild(P4.fx.sceneLayer(D.scene.bgIndex, { strength: 10 }));

    /* 工具条 */
    view.appendChild(h('div.stage__toolbar', [
      h('div.scene-tag', [
        P4.icon('pin', 12),
        h('span.zh', D.scene.title),
        h('span.n', D.scene.latin)
      ]),
      h('span.grow'),
      h('div.tri-switch', { role: 'group', 'aria-label': '叙事三态切换' }, [
        triBtn('strip', '窄条', 'list', '窄条叙事（数字 1）'),
        triBtn('read', '阅读', 'book', '全屏阅读（数字 2）'),
        triBtn('explore', '探索', 'magnifier', '场景探索热区（数字 3）')
      ]),
      P4.iconBtn('cards', {
        id: 'p4-btn-letters', title: '信札 · 聊天列表模式',
        onClick: function () { P4.docket.open('letters', this); }
      })
    ]));

    /* 探索热区 */
    var hs = h('div#p4-hotspots');
    D.hotspots.forEach(function (spot, i) {
      hs.appendChild(h('button.hotspot', {
        type: 'button',
        id: 'p4-hotspot-' + i,
        dataset: { found: spot.found ? 1 : 0 },
        style: { left: spot.x + '%', top: spot.y + '%' },
        'aria-label': '查看：' + spot.label,
        onclick: function () { inspectHotspot(i, this); }
      }, [P4.icon(spot.icon, 13), h('span.hotspot__tip', spot.label)]));
    });
    view.appendChild(hs);

    view.appendChild(h('div.explore-hint', [
      h('div.zh', '现场勘查'),
      h('div.lat', 'FIVE POINTS OF INTEREST')
    ]));

    /* 汞镜池 */
    var pool = h('article#p4-pool.mercury-pool', { 'aria-label': '叙事正文' }, [
      h('header.pool__head', [
        h('span.lat', 'MERCURY POOL · N° ' + String(S.round).padStart(3, '0')),
        h('span.stamp', D.scene.time)
      ]),
      h('div#p4-pool-scroll.pool__scroll', [
        h('div#p4-story', { 'aria-live': 'polite' }),
        h('div#p4-acts.acts')
      ]),
      h('footer.pool__foot', [
        h('span.t-eyebrow', '进度'),
        P4.bar(62, null, false),
        h('span.mono', { style: { fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' } }, '第一幕 · 幕后的耳朵')
      ])
    ]);
    view.appendChild(pool);

    pool.addEventListener('click', function (e) {
      if (P4.$('#p4-stage').dataset.mode === 'explore') { setMode('strip'); return; }
      if (e.target.closest('.act,.mind-target,button,a')) return;
      skipDevelop();
    });

    renderStory(D.story, true);
    buildComposer();
    setMode(S.mode);
  }

  function triBtn(mode, label, icon, title) {
    return h('button', {
      type: 'button',
      id: 'p4-tri-' + mode,
      title: title,
      'aria-pressed': S.mode === mode ? 'true' : 'false',
      onclick: function () { setMode(mode); }
    }, [P4.icon(icon, 12), h('span', label)]);
  }

  function setMode(mode) {
    S.mode = mode;
    var stage = P4.$('#p4-stage');
    if (stage) stage.dataset.mode = mode;
    ['strip', 'read', 'explore'].forEach(function (m) {
      var b = P4.$('#p4-tri-' + m);
      if (b) b.setAttribute('aria-pressed', m === mode ? 'true' : 'false');
    });
    P4.fx.play('plate');
    if (mode === 'explore') {
      P4.notify.info('场景探索', '已发现 ' + S.hotFound + ' / ' + D.hotspots.length + ' 处可勘查之物。点击银点查看，点击缩略纸角回到叙事。');
    }
    P4.emit('stage:mode', mode);
  }

  /* =======================================================
     正文渲染（银版显影）
     ======================================================= */
  function renderStory(round, animate) {
    var host = P4.$('#p4-story');
    P4.clear(host);
    S.developHandles = [];

    host.appendChild(h('div.round-head', {
      style: {
        display: 'flex', alignItems: 'baseline', gap: '12px',
        paddingBottom: '8px', marginBottom: '12px',
        borderBottom: '1px solid color-mix(in srgb, var(--silver) 18%, transparent)'
      }
    }, [
      h('span.t-eyebrow', 'ROUND ' + String(S.round).padStart(2, '0')),
      h('span', {
        style: { fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-xs)', letterSpacing: '.16em', color: 'var(--gaslight-hi)' }
      }, round.heading)
    ]));

    var body = h('div.story-body');
    var delay = 0;
    round.blocks.forEach(function (blk) {
      var el;
      if (blk.type === 'dlg') el = h('span.dlg');
      else if (blk.type === 'aside') {
        el = h('p', {
          style: {
            textIndent: '0', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-micro)',
            letterSpacing: '.08em', color: 'var(--silver-lo)', borderTop: '1px dashed color-mix(in srgb, var(--hairline) 70%, transparent)',
            paddingTop: '6px', marginTop: '4px'
          }
        }, '※ ' + blk.text);
        body.appendChild(el);
        return;
      } else el = h('p');

      if (animate && !P4.fx.reducedMotion()) {
        /* 逐字显影：先解析出结构，再对纯文本节点做字符切分 */
        parseInline(blk.text, el);
        developNodes(el, delay);
        delay += Math.min(900, blk.text.length * 7);
      } else {
        parseInline(blk.text, el);
      }
      body.appendChild(el);
    });
    host.appendChild(body);
    renderActions(round.actions);
    host.parentNode.scrollTop = 0;
    if (animate) P4.fx.play('develop');
  }

  function developNodes(root, baseDelay) {
    var step = 7;
    var i = 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(function (tn) {
      var chars = Array.from(tn.nodeValue);
      var frag = document.createDocumentFragment();
      chars.forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'develop-char';
        s.textContent = c;
        s.style.animationDelay = (baseDelay + i * step) + 'ms';
        i++;
        frag.appendChild(s);
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    S.developHandles.push(root);
  }

  function skipDevelop() {
    if (!S.developHandles.length) return;
    S.developHandles.forEach(function (root) {
      P4.$$('.develop-char', root).forEach(function (s) {
        s.style.animationDelay = '0ms';
        s.style.animation = 'none';
        s.style.opacity = '1';
        s.style.filter = 'none';
      });
    });
    S.developHandles = [];
  }

  function renderActions(actions) {
    var host = P4.$('#p4-acts');
    P4.clear(host);
    if (!actions || !actions.length) {
      host.appendChild(h('div.panel-block', [
        h('div.row', [P4.icon('info', 15), h('span.t-label', '本回合无预置选项')]),
        h('p', { style: { fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-tiny)', lineHeight: '1.8', color: 'var(--text-dim)' } },
          '此处应由模型给出行动建议。本原型不含后端，你可以直接在下方羽笔栏写下任意行动。')
      ]));
      return;
    }
    actions.forEach(function (a, i) {
      host.appendChild(h('button.act', {
        type: 'button',
        id: 'p4-act-' + i,
        onclick: function () { chooseAction(a, i); }
      }, [
        h('span.act__num', P4.roman(i + 1)),
        (function () { var s = h('span.act__tx'); parseInline(a.tx, s); return s; })(),
        a.cost ? h('span.act__cost', a.cost) : null
      ]));
    });
  }

  /* =======================================================
     行动推进
     ======================================================= */
  function chooseAction(a, idx) {
    /* 重走演示 */
    if (a.next === 'reset') {
      S.usedBranches = {};
      S.round = D.story.round;
      D.scene.round = S.round;
      renderStory(D.story, true);
      bumpRail();
      P4.notify.info('已回到第七回合', '四条分支重新可选。');
      return;
    }

    /* 选出一条尚未走过的分支 */
    var branchKey = (a.next !== undefined && a.next !== null) ? a.next : idx;
    if (S.usedBranches[branchKey] || !BRANCH[branchKey]) {
      var free = Object.keys(BRANCH).filter(function (k) { return !S.usedBranches[k]; });
      branchKey = free.length ? Number(free[0]) : null;
    }

    /* 灵性/理智消耗核验 */
    if (a.cost) {
      var m = /灵性\s*(\d+)/.exec(a.cost);
      if (m) {
        var sp = D.attrs.filter(function (x) { return x.key === 'spirit'; })[0];
        var need = Number(m[1]);
        if (sp.cur < need) {
          P4.notify.warn('灵性不足', '这一步需要 ' + need + ' 点灵性，你只剩 ' + sp.cur + ' 点。先歇一场戏。');
          return;
        }
        sp.cur -= need;
        refreshAttrs();
      }
    }

    if (branchKey !== null) {
      S.usedBranches[branchKey] = true;
      S.round += 1;
      S.tokens += 380 + Math.round(Math.random() * 160);
      D.scene.round = S.round;
      var head = P4.$('#p4-pool .pool__head .lat');
      if (head) head.textContent = 'MERCURY POOL · N° ' + String(S.round).padStart(3, '0');
      renderStory(BRANCH[branchKey], true);
      var pool = P4.$('#p4-pool');
      if (pool) { pool.classList.remove('round-flash'); void pool.offsetWidth; pool.classList.add('round-flash'); }
      P4.notify.ok('第 ' + S.round + ' 回合已成文', '正文与尾部标签同一次调用返回；变量与总结后台异步。');
      bumpRail();
      return;
    }

    /* 四条分支均已走过 → 诚实的 diegetic 收束，而非占位符 */
    renderStory({
      heading: '幕后手记 · 演示到此',
      blocks: [
        { type: 'p', text: '你想再往下走一步，走廊却在这里断了——不是黑，是*没有更多的字*。' },
        { type: 'p', text: '这是原型的边界：本页只有前端。四条分支的文稿已写就并演完，再往下需要接上模型，让它替这条走廊继续铺砖。' },
        { type: 'aside', text: '协议就位：正文 + 尾部标签（content / action / event / recall / state_update）。接入后端即可续写。' }
      ],
      actions: [
        { tx: '回到第七回合，重走一遍', cost: null, next: 'reset' }
      ]
    }, true);
    P4.notify.info('演示分支已走完', '点击唯一的选项可回到第七回合重走。');
  }

  /* =======================================================
     热区勘查
     ======================================================= */
  function inspectHotspot(i, btn) {
    var spot = D.hotspots[i];
    if (!spot.found) { spot.found = 1; S.hotFound += 1; btn.dataset.found = '1'; }
    var view = P4.$('#p4-stage-view');
    var old = P4.$('#p4-hot-note');
    if (old) old.parentNode.removeChild(old);
    var note = h('aside#p4-hot-note.card-paper', {
      style: {
        position: 'absolute', zIndex: '5', width: 'min(320px, 68%)',
        left: P4.clamp(spot.x, 6, 62) + '%', top: P4.clamp(spot.y + 5, 6, 64) + '%',
        animation: 'block-in 300ms var(--ease-instrument)'
      }
    }, [
      h('div.row.row--between', { style: { marginBottom: '6px' } }, [
        h('h4', spot.label),
        P4.iconBtn('close', {
          title: '收起速记', size: 12,
          onClick: function () { if (note.parentNode) note.parentNode.removeChild(note); }
        })
      ]),
      h('p', spot.text),
      h('div.row', { style: { marginTop: '8px' } }, [
        h('span.badge', '现场速记'),
        h('span.badge--mystic.badge', '已发现 ' + S.hotFound + '/' + D.hotspots.length)
      ])
    ]);
    view.appendChild(note);
    P4.fx.play('tap');
  }

  /* =======================================================
     羽笔输入
     ======================================================= */
  function buildComposer() {
    var box = P4.$('#p4-composer');
    P4.clear(box);
    var ta;
    box.appendChild(h('div.composer__quick', D.quickCmds.map(function (c) {
      return h('button.chip', {
        type: 'button', title: '插入指令 ' + c,
        onclick: function () {
          ta.value = (ta.value ? ta.value.replace(/\s+$/, '') + ' ' : '') + c + ' ';
          ta.focus();
          P4.fx.play('tap');
        }
      }, c);
    })));
    box.appendChild(h('div.composer__row', [
      h('div.quill', [
        h('span.quill__nib', P4.icon('feather', 15)),
        (ta = h('textarea#p4-input', {
          rows: 1,
          placeholder: '写下你的行动，或点击上方指令……（Enter 发送，Shift+Enter 换行）',
          'aria-label': '行动输入',
          oninput: function () {
            this.style.height = 'auto';
            this.style.height = Math.min(132, this.scrollHeight) + 'px';
          },
          onkeydown: function (e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
          }
        }))
      ]),
      P4.btn('发送', { id: 'p4-btn-send', variant: 'primary', icon: 'send', size: 'lg', onClick: send })
    ]));
    box.appendChild(h('div.composer__meta', [
      h('span', [P4.icon('plug', 11), ' 单调用档 · 主线 1 次阻塞调用']),
      h('span.m-hide2', [P4.icon('layers', 11), ' 上下文 ', h('b', { style: { color: 'var(--silver)' } }, '4,820'), ' / 5,000 tok']),
      h('span.m-hide2', [P4.icon('signal', 11), ' 主 API 2/5 RPM'])
    ]));

    function send() {
      var v = ta.value.trim();
      if (!v) {
        P4.notify.warn('还没有写下任何东西', '空白的行动不会被送出——这不是沉默，是留白。');
        ta.focus();
        return;
      }
      var keys = Object.keys(BRANCH).filter(function (k) { return !S.usedBranches[k]; });
      var pick = keys.length ? Number(keys[0]) : null;
      P4.notify.ok('已发报', '你的行动进入本回合上下文尾部（recency 区）。');
      ta.value = '';
      ta.style.height = 'auto';
      chooseAction({ tx: v, cost: null, next: pick }, 0);
    }
  }

  /* =======================================================
     左仪表塔
     ======================================================= */
  function buildTower() {
    var body = P4.$('#p4-tower-body');
    P4.clear(body);
    var pc = D.pc;

    body.appendChild(h('div.ident', [
      h('div.ident__sigil', h('span', { style: { fontFamily: 'var(--font-display)', fontSize: '15px' } }, pc.sigil)),
      h('div', [
        h('div.ident__name', pc.name),
        h('div.ident__meta', pc.gender + ' · ' + pc.age + ' 岁 · ' + pc.job)
      ])
    ]));

    /* 六维水银柱 */
    var bank = h('div#p4-merc-bank.merc-bank', { role: 'group', 'aria-label': '六维属性水银柱' });
    body.appendChild(h('section', [
      P4.sectHead('六维观测', 'VITAL COLUMNS', h('span.badge', '水银')),
      bank
    ]));

    /* 序列铭牌 */
    body.appendChild(h('section.panel-block', [
      h('div.row.row--between', [
        h('span.nameplate', h('span.tx', '序列 ' + pc.sequence + ' · ' + pc.seqName)),
        P4.arcMeter(pc.digest, 100, 44, 'mystic', pc.digest + '%')
      ]),
      h('div.col', { style: { gap: '4px', marginTop: '8px' } }, [
        h('div.row.row--between', [h('span.t-eyebrow', '途径'), h('span', { style: { fontSize: 'var(--fs-tiny)', color: 'var(--text)' } }, pc.pathway + ' 途径')]),
        h('div.row.row--between', [h('span.t-eyebrow', '晋升'), h('span', { style: { fontSize: 'var(--fs-tiny)', color: 'var(--text)' } }, pc.system)]),
        h('div.row.row--between', { style: { marginTop: '4px' } }, [h('span.t-eyebrow', '失控'), h('span.mono', { style: { fontSize: 'var(--fs-tiny)', color: 'var(--cinnabar-hi)' } }, pc.corruption + '%')]),
        P4.bar(pc.corruption, 'warn', false)
      ])
    ]));

    /* 非凡特性 */
    body.appendChild(P4.fold({
      id: 'p4-fold-traits', title: '非凡特性', latin: 'TRAITS & TALENTS', open: false,
      render: function () {
        return [
          h('div.t-eyebrow', '非凡特性'),
          D.traits.extraordinary.map(function (t) {
            return h('div.panel-block', { style: { padding: '8px' } }, [
              h('div.row.row--between', [
                h('span', { style: { fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-tiny)', color: 'var(--amethyst-hi)', fontWeight: '700' } }, t.name),
                h('span.badge.badge--mystic', t.tier)
              ]),
              h('p', { style: { fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-micro)', lineHeight: '1.7', color: 'var(--text-dim)' } }, t.desc)
            ]);
          }),
          h('div.t-eyebrow', { style: { marginTop: '8px' } }, '天赋'),
          D.traits.talents.map(function (t) {
            return h('div.panel-block', { style: { padding: '8px' } }, [
              h('div.row.row--between', [
                h('span', { style: { fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-tiny)', color: 'var(--silver-hi)', fontWeight: '700' } }, t.name),
                h('span.badge' + (t.tier === '稀有' ? '.badge--gas' : ''), t.tier)
              ]),
              h('p', { style: { fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-micro)', lineHeight: '1.7', color: 'var(--text-dim)' } }, t.desc)
            ]);
          })
        ];
      }
    }));

    /* 装备栏 */
    body.appendChild(P4.fold({
      id: 'p4-fold-kit', title: '装备栏', latin: 'FIVE SLOTS & ONE ROLE', open: false,
      render: function () {
        var slots = h('div.slots', D.equipment.map(function (e, i) {
          return h('button.slot', {
            type: 'button', id: 'p4-slot-' + i, dataset: { filled: e.filled ? 1 : 0 },
            title: e.name + '｜' + e.desc,
            onclick: function () {
              P4.notify.info(e.filled ? e.name : '空槽位', e.filled ? e.desc : '尚未佩戴。通用槽不限武器/衣物/饰品类别。');
            }
          }, [P4.icon(e.icon, 15), h('span.slot__name', e.filled ? e.name.slice(0, 6) : '空槽')]);
        }));
        var rp = D.roleplaySlot;
        return [
          slots,
          h('div.slots', { style: { marginTop: '8px' } }, h('button.slot.slot--roleplay', {
            type: 'button', id: 'p4-slot-roleplay', title: rp.desc,
            onclick: function () { P4.notify.mystic(rp.name, rp.desc); }
          }, [
            P4.icon('mask', 16),
            h('div', [
              h('div', { style: { fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-tiny)', color: 'var(--amethyst-hi)' } }, '扮演法 · 一名沉默的观众'),
              h('div', { style: { fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' } }, '消化 ' + rp.digest + '% · 失控 ' + rp.corrupt + '%')
            ]),
            P4.icon('chevronRight', 12)
          ]))
        ];
      }
    }));

    /* 能力簿摘要 */
    body.appendChild(P4.fold({
      id: 'p4-fold-abil', title: '能力簿', latin: 'FACULTIES', open: false,
      render: function () {
        return [
          D.abilities.slice(0, 4).map(function (a) {
            return h('div.row.row--between', {
              style: { padding: '5px 0', borderBottom: '1px dashed color-mix(in srgb, var(--hairline) 60%, transparent)' }
            }, [
              h('span', { style: { fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-tiny)', color: a.locked ? 'var(--text-faint)' : 'var(--amethyst-hi)' } }, a.name),
              h('span.mono', { style: { fontSize: 'var(--fs-micro)', color: 'var(--silver-lo)' } }, a.cost)
            ]);
          }),
          P4.btn('展开能力簿', { size: 'sm', block: true, icon: 'wave', onClick: function () { P4.docket.open('abilities', this); } })
        ];
      }
    }));

    /* 委托与任务 */
    var doing = D.quests.filter(function (q) { return q.state === 'doing'; }).length;
    body.appendChild(P4.fold({
      id: 'p4-fold-quests', title: '委托与任务', latin: 'COMMISSIONS', open: false,
      extra: h('span.badge' + (doing ? '.badge--gas' : ''), doing + ' / ' + D.quests.length),
      render: function () {
        return D.quests.map(function (q, i) {
          var tone = q.state === 'doing' ? 'gas' : q.state === 'todo' ? 'mystic' : null;
          return h('button.panel-block', {
            type: 'button', id: 'p4-quest-' + i,
            style: { padding: '8px', textAlign: 'left', width: '100%', cursor: 'pointer' },
            onclick: function () { P4.notify.info(q.name + '（' + q.from + '）', q.note + '　期限：' + q.due); }
          }, [
            h('div.row.row--between', [
              h('span', { style: { fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-tiny)', fontWeight: '700', color: q.state === 'idle' ? 'var(--text-faint)' : 'var(--silver-hi)' } }, q.name),
              h('span.badge' + (tone ? '.badge--' + tone : ''), q.state === 'doing' ? '进行中' : q.state === 'todo' ? '待办' : '未激活')
            ]),
            h('div.row.row--between', { style: { marginTop: '4px' } }, [
              h('span', { style: { fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' } }, '委托 · ' + q.from),
              h('span.mono', { style: { fontSize: 'var(--fs-micro)', color: 'var(--text-dim)' } }, q.cur + ' / ' + q.max)
            ]),
            P4.bar(q.max ? (q.cur / q.max) * 100 : 0, tone === 'gas' ? 'gas' : tone === 'mystic' ? 'mystic' : null)
          ]);
        });
      }
    }));

    /* 状态 */
    body.appendChild(h('section.panel-block', [
      h('div.row.row--between', [h('span.t-eyebrow', '当前状态'), h('span.badge.badge--ok', '理智正常')]),
      h('div.row.row--wrap', { style: { marginTop: '6px' } }, [
        h('span.badge.badge--mystic', '旁听 · 生效中'),
        h('span.badge', '疲劳 · 轻'),
        h('span.badge--warn.badge', '失控 4%')
      ])
    ]));

    refreshAttrs();
  }

  function refreshAttrs() {
    var bank = P4.$('#p4-merc-bank');
    if (bank) {
      P4.clear(bank);
      D.attrs.forEach(function (a) {
        var p = P4.pct(a.cur, a.max);
        var val = h('span.merc__val', a.cur);
        bank.appendChild(h('div.merc' + (p < 30 ? '.is-low' : ''), {
          dataset: { attr: a.key },
          role: 'meter',
          'aria-valuenow': String(a.cur), 'aria-valuemin': '0', 'aria-valuemax': String(a.max),
          'aria-label': a.zh + ' ' + a.cur + ' / ' + a.max,
          title: a.zh + ' ' + a.cur + ' / ' + a.max
        }, [
          h('div.merc__tube', { style: { '--fill': p + '%' } }, [
            h('div.merc__fluid', { style: { height: p + '%' } }),
            h('div.merc__scale')
          ]),
          val,
          h('span.merc__name', a.zh)
        ]));
      });
    }
    /* 卷宗栏微仪表同步 */
    var mini = P4.$('#p4-mini-meters');
    if (mini) {
      P4.clear(mini);
      ['spirit', 'sanity'].forEach(function (k) {
        var a = D.attrs.filter(function (x) { return x.key === k; })[0];
        mini.appendChild(h('div.merc-row', { dataset: { attr: k }, style: { '--fill': P4.pct(a.cur, a.max) + '%' } }, [
          h('span.merc-row__name', a.zh),
          h('div.merc-row__track', { style: { '--fill': P4.pct(a.cur, a.max) + '%' } }),
          h('span.merc-row__val', a.cur + '/' + a.max)
        ]));
      });
    }
    P4.emit('attrs:change');
  }

  /* =======================================================
     右卷宗栏
     ======================================================= */
  function buildDossier() {
    var body = P4.$('#p4-dossier-body');
    P4.clear(body);

    /* 头条 */
    body.appendChild(h('button.headline', {
      type: 'button', id: 'p4-headline',
      'aria-label': '翻开鲁恩日报',
      onclick: function () { P4.docket.open('news', this); }
    }, [
      h('div.headline__masthead', [h('span.zh', D.news.masthead), h('span.n', D.news.issue)]),
      h('div.headline__title', D.news.lead.hd),
      h('p.headline__lead', D.news.lead.tx.slice(0, 72) + '……'),
      h('div.row', { style: { marginTop: '8px', justifyContent: 'flex-end' } }, [
        h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-micro)', color: 'var(--paper-ink-dim)' } }, '翻开全版'),
        P4.icon('chevronRight', 11)
      ])
    ]));

    /* 在场人物 */
    body.appendChild(h('section', [
      P4.sectHead('在场', 'PRESENT', h('span.badge', String(D.present.length) + ' 位')),
      h('div.present-list', D.present.map(function (nm) {
        var r = D.relations.filter(function (x) { return x.name === nm; })[0];
        return h('button.present', {
          type: 'button', id: 'p4-present-' + r.sigil,
          title: '旁听「' + nm + '」（灵性 1）',
          onclick: function () {
            if (!r.whisper) { P4.notify.warn('不可读', '这里没有可读的东西。'); return; }
            var sp = D.attrs.filter(function (x) { return x.key === 'spirit'; })[0];
            if (sp.cur < 1) { P4.notify.warn('灵性不足', '旁听需要一点灵性。'); return; }
            sp.cur -= 1; refreshAttrs(); P4.fx.play('mercury');
            P4.notify.mystic('旁听 · ' + nm, r.whisper);
          }
        }, [
          h('span.present__av', r.sigil),
          h('div', [h('div.present__name', r.name), h('div.present__mood', r.role)]),
          h('span.badge' + (r.mood === '隐瞒' ? '.badge--warn' : r.mood === '恐惧' ? '.badge--mystic' : ''), r.mood)
        ]);
      }))
    ]));

    /* 微仪表 */
    body.appendChild(h('section.panel-block', [
      h('div.t-eyebrow', { style: { marginBottom: '6px' } }, '即时读数'),
      h('div#p4-mini-meters.col', { style: { gap: '6px' } })
    ]));

    /* 活跃伏笔 */
    body.appendChild(h('section', [
      P4.sectHead('活跃伏笔', 'LOOSE THREADS', P4.iconBtn('expand', {
        title: '打开伏笔台账', size: 12,
        onClick: function () { P4.docket.open('threads', this); }
      })),
      h('div', D.threads.filter(function (t) { return t.live; }).slice(0, 4).map(function (t) {
        return h('div.thread', [
          h('span.thread__dot'),
          h('div', [h('div.thread__tx', t.tx), h('div.thread__src', '登记于 ' + t.src)])
        ]);
      }))
    ]));

    /* 快捷卷宗 */
    var quick = [
      { key: 'map', zh: '王国舆图', n: '8 地标', icon: 'map' },
      { key: 'codex', zh: '图鉴', n: '32 档案', icon: 'book' },
      { key: 'chronicle', zh: '编年史', n: '6 条', icon: 'scroll' },
      { key: 'divination', zh: '占卜间', n: '灵性 5', icon: 'tarot' },
      { key: 'case', zh: '侦探案卷', n: '3/5', icon: 'magnifier' },
      { key: 'board', zh: '战术推演', n: '待申报', icon: 'board' },
      { key: 'archive', zh: '档案馆', n: '8 节点', icon: 'tree' },
      { key: 'studio', zh: '显影室', n: '4 套', icon: 'camera' }
    ];
    body.appendChild(h('section', [
      P4.sectHead('卷宗速取', 'QUICK DOCKETS'),
      h('div.card-fan', quick.map(function (q) {
        return h('button.fan-card', {
          type: 'button', id: 'p4-fan-' + q.key,
          onclick: function () { P4.docket.open(q.key, this); }
        }, [
          h('span.ic', P4.icon(q.icon, 14)),
          h('span.fan-card__tx', q.zh),
          h('span.fan-card__n', q.n)
        ]);
      }))
    ]));

    refreshAttrs();
  }

  /* =======================================================
     银轨
     ======================================================= */
  function buildRail() {
    var left = P4.$('#p4-rail-left');
    var right = P4.$('#p4-rail-right');
    P4.clear(left); P4.clear(right);

    left.appendChild(P4.iconBtn('constellation', {
      id: 'p4-rail-fog', title: '灰雾星图（反引号 或 Ctrl+K）',
      onClick: function () { P4.docket.toggleFog(); }
    }));
    left.appendChild(h('span.beam__sep'));
    left.appendChild(P4.iconBtn('undo', {
      id: 'p4-rail-undo', title: '回退到上一回合',
      onClick: function () {
        P4.notify.confirm({
          title: '回退一回合？',
          msg: '当前回合的正文与变量快照将被丢弃，档案馆节点树回到上一节点。此操作可再前进。',
          okText: '回退', icon: 'undo'
        }).then(function (ok) {
          if (!ok) return;
          S.usedBranches = {}; S.round = D.story.round;
          renderStory(D.story, true);
          P4.notify.ok('已回退', '节点树已定位到 R7。');
          bumpRail();
        });
      }
    }));
    left.appendChild(P4.iconBtn('refresh', {
      id: 'p4-rail-reroll', title: '重新生成当前回合',
      onClick: function () {
        P4.notify.info('重演本回合', '同一上下文重新调用一次；变量快照将被覆盖。');
        renderStory(S.round === D.story.round ? D.story : BRANCH[Object.keys(S.usedBranches).pop()] || D.story, true);
      }
    }));
    left.appendChild(P4.iconBtn('redo', {
      id: 'p4-rail-revar', title: '重新演算本回合变量',
      onClick: function () {
        P4.notify.info('变量重算已排入后台', '仅重跑 state_update，不重写正文；Zod 校验后落账，非法值保留旧值。');
        global.setTimeout(function () {
          P4.notify.ok('变量已重算', '15 项通过，1 项被拦截（stat_data.运气 类型不符）。');
        }, 1200);
      }
    }));
    left.appendChild(P4.iconBtn('close', {
      id: 'p4-rail-stop', title: '强制中断生成',
      onClick: function () { P4.notify.warn('已请求中断', '流式连接关闭，本回合不写入档案。'); }
    }));
    left.appendChild(P4.iconBtn('save', {
      id: 'p4-rail-save', title: '快速存档',
      onClick: function () { P4.notify.ok('已快速存档', '节点 R' + S.round + ' 写入 IndexedDB（原型仅演示界面反馈）。'); }
    }));

    var bal = D.ledger.balance;
    right.appendChild(h('span.rail__stat', {
      id: 'p4-rail-purse', title: '钱包：点击查看账本流水',
      style: { cursor: 'pointer' },
      onclick: function () { P4.docket.open('inventory', this); }
    }, [P4.icon('coins', 11), ' ', h('b', bal.pound + '镑'), ' ' + bal.soli + '苏勒 ' + bal.penny + '便士']));
    right.appendChild(h('span.rail__stat', [P4.icon('layers', 11), ' 上下文 ', h('b', { id: 'p4-rail-tok' }, P4.num(S.tokens)), ' tok']));
    right.appendChild(h('span.rail__stat', [P4.icon('clock', 11), ' 回合 ', h('b', { id: 'p4-rail-round' }, String(S.round))]));
    right.appendChild(h('span.beam__sep'));
    right.appendChild(P4.iconBtn('gear', {
      id: 'p4-rail-settings', title: '台务设置',
      onClick: function () { P4.docket.open('settings', this); }
    }));
    P4.docket.syncDock();
  }

  function bumpRail() {
    var t = P4.$('#p4-rail-tok'), r = P4.$('#p4-rail-round');
    if (t) { t.textContent = P4.num(S.tokens); P4.fx.tick(t); }
    if (r) { r.textContent = String(S.round); P4.fx.tick(r); }
  }

  P4.stage = {
    state: S,
    buildStage: buildStage,
    buildTower: buildTower,
    buildDossier: buildDossier,
    buildRail: buildRail,
    setMode: setMode,
    refreshAttrs: refreshAttrs,
    parseInline: parseInline,
    branches: BRANCH
  };
})(window);
