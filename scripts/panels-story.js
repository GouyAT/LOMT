/* ============================================================
   诡秘剧场 · 原型3 — 面板：叙事段
   王国舆图（蓝晒）/ 图鉴 / 编年史 / 占卜间 / 廷根晚报 / 人物关系
   每个面板返回 { title?, sub?, icon?, serial?, actions?, body }
   ============================================================ */
(function () {
  'use strict';

  var P = (window.PANELS = window.PANELS || {});

  function act(label, icon, fn, cls) {
    return window.UI.h('button.btn.btn--sm' + (cls || ''), { type: 'button', onclick: fn },
      window.UI.ico(icon, 'ico ico--sm'), window.UI.h('span', { text: label }));
  }

  function tell(t, m, tone, i, life) {
    window.UI.toast({ title: t, msg: m, tone: tone || 'info', icon: i, life: life });
  }

  /* ============================================================
     1. 王国舆图 —— 蓝晒工程图
     ============================================================ */
  P.map = function (h, ico, UI, D, L) {
    var M = L.map;

    function chart() {
      var wrap = h('div.cyanotype', { style: { 'aspect-ratio': '16 / 10', 'min-height': '340px' } });
      wrap.appendChild(h('div.cy-title', { text: 'KINGDOM OF LOEN · SURVEY SHEET N° 7 · SCALE 1:400000' }));

      /* 路线（SVG 层） */
      var NS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none');
      var byId = {};
      M.regions.forEach(function (r) { byId[r.id] = r; });
      M.routes.forEach(function (rt) {
        var a = byId[rt.from], b = byId[rt.to];
        if (!a || !b) return;
        var ln = document.createElementNS(NS, 'line');
        ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y);
        ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y);
        ln.setAttribute('stroke', 'rgba(216,236,245,.34)');
        ln.setAttribute('stroke-width', '.28');
        if (rt.mode !== '步行') ln.setAttribute('stroke-dasharray', '1.4 1');
        svg.appendChild(ln);
      });
      wrap.appendChild(svg);

      M.regions.forEach(function (r) {
        var here = r.id === 'r-moretti' || r.name === '水仙花街';
        wrap.appendChild(h('button.landmark' + (here ? '.is-here' : ''), {
          type: 'button',
          dataset: { name: r.name + ' · ' + r.kind, undiscovered: String(!r.discovered) },
          style: { left: r.x + '%', top: r.y + '%' },
          title: r.name + '（' + r.kind + '）：' + r.note,
          onclick: function () { tell(r.name + ' · ' + r.kind, r.note + (r.discovered ? '' : '（尚未抵达）'), r.discovered ? 'info' : 'warn', 'location'); }
        }, ico(r.kind === '城市' ? 'globe' : (r.kind === '港口' ? 'trade' : (r.kind === '秘所' ? 'eyeMystic' : 'location')), 'ico ico--sm')));
      });
      return wrap;
    }

    function routes() {
      var byId = {};
      L.map.regions.forEach(function (r) { byId[r.id] = r.name; });
      return UI.table([
        { label: '起点', get: function (r) { return byId[r.from] || r.from; } },
        { label: '终点', get: function (r) { return byId[r.to] || r.to; } },
        { label: '方式', key: 'mode' },
        { label: '耗时', align: 'r', mono: true, get: function (r) { return r.hours < 1 ? Math.round(r.hours * 60) + ' 分' : r.hours + ' 小时'; } }
      ], L.map.routes);
    }

    var kingdom = h('div.stack', null,
      chart(),
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '蓝晒图上共 ' + M.regions.length + ' 处地标；虚线为需乘车/乘船的路线。当前所在地以安全灯红脉冲标出。灵摆寻物可对任一地标做粗略指向（消耗灵性 3）。' })),
      h('div.sec-title', null, h('span.st-t', { text: '路程表' }), h('span.st-l', { text: 'Itinerary' }), h('i.st-line')),
      routes()
    );

    var forsaken = h('div.stack', null,
      h('div.panel-note.panel-note--warn', null, ico('warning', 'ico ico--sm'),
        h('span', { text: '神弃之地不在正常舆图上。进入前需确认序列与队伍，污染值将持续累积；风险 4 以上区域建议序列7 以上再考虑。' })),
      h('div.cardlist', null, M.forsaken.map(function (f) {
        return h('button.lcard', { type: 'button', onclick: function () { tell(f.name, f.note, 'warn', 'fog'); } },
          ico('fog', 'ico lc-ico'),
          h('div', null, h('div.lc-t', { text: f.name }), h('div.lc-d', { text: f.note })),
          h('div.lc-r', null,
            h('span.chip.chip--red', { text: '风险 ' + f.risk }),
            UI.bar(f.risk * 20, 'red')
          )
        );
      }))
    );

    return {
      actions: [act('导出观测记录', 'download', function () { tell('已导出舆图观测记录', 'kingdom-survey-7.txt · 含 ' + M.regions.length + ' 地标与 ' + M.routes.length + ' 条路线', 'good', 'download'); })],
      body: UI.tabs([
        { label: '鲁恩王国', icon: 'globe', body: function () { return kingdom; } },
        { label: '廷根市街区', icon: 'location', body: function () { return townDetail(h, ico, UI, L); } },
        { label: '神弃之地', icon: 'fog', body: function () { return forsaken; }, badge: M.forsaken.length }
      ], { idBase: 'p3-map' })
    };
  };

  function townDetail(h, ico, UI, L) {
    var inTown = L.map.regions.filter(function (r) { return r.kind === '街区' || r.kind === '建筑' || r.kind === '秘所'; });
    return h('div.stack', null,
      h('div.panel-note', null, ico('loupe', 'ico ico--sm'),
        h('span', { text: '街区级地标可直接指派为「目标地点」，下回合行动区会注入路线与耗时。' })),
      h('div.codex-grid', null, inTown.map(function (r) {
        return h('article.ccard', null,
          h('div.cc-strip', null,
            h('div.cc-neg', { style: { background: r.discovered ? '#2a6d90' : '#5d666b' } }, ico('location', 'ico ico--sm')),
            h('div', null, h('div.cc-n', { text: r.name }), h('div.cc-l', { text: r.latin || r.kind }))
          ),
          h('p.cc-s', { text: r.note }),
          h('div.cc-tags', null, h('span.chip.chip--paper', { text: r.kind }),
            h('span.chip.chip--paper', { text: r.discovered ? '已抵达' : '未抵达' })),
          h('div.cc-foot', null,
            h('button.btn.btn--xs', { type: 'button', onclick: function () { window.UI.toast({ title: '已设为目标地点', msg: r.name + ' · 将于下回合注入行动区', tone: 'good', icon: 'target' }); } },
              ico('target', 'ico ico--sm'), h('span', { text: '设为目标' })))
        );
      }))
    );
  }

  /* ============================================================
     2. 图鉴 —— 相片档案卡
     ============================================================ */
  P.codex = function (h, ico, UI, D, L) {
    var C = L.codex;

    function grid(list, kind) {
      var host = h('div.stack');
      var search = h('input.field', { type: 'search', placeholder: '搜索名称、标签或摘要……', 'aria-label': '搜索图鉴' });
      var wrap = h('div.codex-grid');
      function paint(q) {
        UI.clear(wrap);
        var arr = list.filter(function (x) {
          if (!q) return true;
          var s = (x.name + ' ' + (x.latin || '') + ' ' + (x.tags || []).join(' ') + ' ' + x.summary).toLowerCase();
          return s.indexOf(q.toLowerCase()) >= 0;
        });
        if (!arr.length) { wrap.appendChild(UI.empty('没有匹配的档案', '换一个关键词，或清空搜索框。', 'search')); return; }
        arr.forEach(function (x) {
          var locked = (x.met === false) || (x.visited === false) || (x.unlocked === false) || (x.owned === false && kind === 'items' && x.rank === '封印物');
          wrap.appendChild(h('article.ccard', { dataset: { locked: String(!!(x.unlocked === false)) } },
            h('div.cc-strip', null,
              h('div.cc-neg', { style: { background: x.portraitTint || tintOf(kind) } },
                h('span', { text: x.name.slice(0, 1) })),
              h('div.grow', null,
                h('div.cc-n', { text: x.name }),
                h('div.cc-l', { text: x.latin || '' })
              ),
              kind === 'people' ? h('span.chip.chip--paper', { text: x.sequence || '' }) : null
            ),
            h('p.cc-s', { text: x.summary }),
            h('div.cc-tags', null, (x.tags || []).slice(0, 4).map(function (t) { return h('span.chip.chip--paper', { text: t }); })),
            h('div.cc-foot', null,
              h('span', { text: metaOf(x, kind) }),
              h('div.grow'),
              h('button.btn.btn--xs', {
                type: 'button', onclick: function () { detail(x, kind); }
              }, ico('loupe', 'ico ico--sm'), h('span', { text: '细读' }))
            )
          ));
        });
      }
      search.addEventListener('input', function () { paint(this.value); });
      paint('');
      host.appendChild(h('div.row', { style: { gap: '8px' } }, search,
        h('span.chip', { text: list.length + ' 条' })));
      host.appendChild(wrap);
      return host;
    }

    function tintOf(k) { return k === 'places' ? '#2a6d90' : (k === 'items' ? '#c9913c' : '#8f989e'); }
    function metaOf(x, k) {
      if (k === 'people') return '好感 ' + (x.affinity === undefined ? '—' : x.affinity) + ' · ' + (x.org || '');
      if (k === 'places') return (x.region || '') + ' · ' + (x.visited ? '已抵达' : '未抵达');
      if (k === 'items') return (x.rank || '') + ' · ' + (x.owned ? '持有' : '未持有');
      return (x.category || '') + ' · ' + (x.unlocked ? '已解锁' : '未解锁');
    }

    function detail(x, kind) {
      var body = h('div.proj-pad', null,
        h('div.cdetail', null,
          h('div.cd-plate', null,
            h('figure.dryplate', { style: { 'aspect-ratio': '4 / 5' } },
              h('div.glyph', { text: x.name.slice(0, 1) }),
              h('figcaption.cap', { text: (x.latin || x.name) + (x.sequence ? ' · ' + x.sequence : '') })
            ),
            h('div', { class: 'stack-sm', style: { 'margin-top': '14px' } },
              x.sequence ? UI.kv('序列', x.sequence) : null,
              x.pathway ? UI.kv('途径', x.pathway) : null,
              x.org ? UI.kv('组织', x.org) : null,
              x.region ? UI.kv('所属', x.region) : null,
              x.rank ? UI.kv('等阶', x.rank) : null,
              x.category ? UI.kv('分类', x.category) : null,
              x.affinity !== undefined ? UI.kv('好感', x.affinity) : null
            )
          ),
          h('div', null,
            h('div.sec-title', null, h('span.st-t', { text: x.name }), h('span.st-l', { text: x.latin || '' }), h('i.st-line')),
            h('p.cd-body', { text: x.detail || x.summary }),
            h('div.cd-hand', null,
              h('div', { style: { 'font-weight': '700', 'margin-bottom': '6px' }, text: '相纸背面 · 手写批注' }),
              h('div', { text: x.summary })
            ),
            h('div', { class: 'row row--wrap', style: { gap: '6px', 'margin-top': '18px' } },
              (x.tags || []).map(function (t) { return h('span.chip.chip--cyan', { text: t }); })),
            h('div', { class: 'row', style: { gap: '8px', 'margin-top': '18px' } },
              act('写入核心记忆', 'save', function () { tell('已写入核心记忆', x.name + ' 将常驻注入参考区，token +' + (40 + x.name.length * 4), 'good', 'save'); }),
              act('加入 recall 点名', 'target', function () { tell('已加入 recall 队列', '下回合模型可点名召回：' + x.name, 'info', 'target'); }),
              act('生成插图', 'camera', function () { document.dispatchEvent(new CustomEvent('p3:open', { detail: { id: 'imagine' } })); })
            )
          )
        )
      );
      UI.openPanel({
        id: 'codex', title: x.name, sub: (x.latin || '') + ' · 图鉴细读', icon: kind === 'people' ? 'user' : (kind === 'places' ? 'location' : (kind === 'items' ? 'bag' : 'scroll')),
        serial: 'SLIDE N° 102-' + (x.id || ''),
        actions: [act('返回图鉴', 'arrowL', function () { document.dispatchEvent(new CustomEvent('p3:open', { detail: { id: 'codex' } })); })],
        body: body
      });
    }

    return {
      sub: 'CODEX · 叙事段 · ' + (C.people.length + C.places.length + C.items.length + C.lore.length) + ' 条档案',
      actions: [act('导出图鉴', 'download', function () { tell('已导出图鉴', 'codex-1349-0628.json', 'good', 'download'); })],
      body: UI.tabs([
        { label: '人物', icon: 'user', body: function () { return grid(C.people, 'people'); }, badge: C.people.length },
        { label: '地点', icon: 'location', body: function () { return grid(C.places, 'places'); }, badge: C.places.length },
        { label: '物品', icon: 'bag', body: function () { return grid(C.items, 'items'); }, badge: C.items.length },
        { label: '神秘学', icon: 'scroll', body: function () { return grid(C.lore, 'lore'); }, badge: C.lore.length }
      ], { idBase: 'p3-codex' })
    };
  };

  /* ============================================================
     3. 编年史 —— 打字机报告
     ============================================================ */
  P.chronicle = function (h, ico, UI, D, L) {
    var C = L.chronicle;

    var grand = h('div.stack', null,
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '大总结常驻注入参考区（中段）。默认每 20 回合压缩一次，压缩后原始小总结移入历史孔隙保留，可随时展开。' })),
      h('div.typed', null, C.grand.map(function (g) {
        return h('article.ty-e', null,
          h('div.ty-h', null,
            h('span.th-n', { text: '§ ' + g.id.toUpperCase() }),
            h('span.th-t', { text: g.title }),
            h('span.th-m', { text: g.era + ' · 起于第 ' + g.turns + ' 回合' })
          ),
          h('p.ty-b', { text: g.body })
        );
      })),
      h('div.row', { style: { gap: '8px' } },
        act('重新压缩大总结', 'distill', function () { tell('已排入记忆精炼器队列', '将用次 API 重压 4 条大总结，预计节省 210 token', 'info', 'distill'); }),
        act('写入世界书', 'worldbook', function () { tell('已写入世界书', '主库「本周目经历」新增 4 条常驻条目', 'good', 'worldbook'); })
      )
    );

    var minor = h('div.stack', null,
      h('div.row', { style: { gap: '8px' } },
        h('span.chip.chip--cyan', { text: '共 ' + C.minor.length + ' 条' }),
        h('span.chip', { text: '注入区间：近 20 条' }),
        h('div.grow'),
        act('全部展开', 'expand', function () { tell('已展开全部小总结', '共 ' + C.minor.length + ' 条，按回合正序排列', 'info', 'list'); })),
      h('div.typed', null, C.minor.map(function (m) {
        return h('article.ty-e', null,
          h('div.ty-h', null,
            h('span.th-n', { text: '# ' + m.turn }),
            h('span.th-t', { text: m.title }),
            h('span.th-m', { text: m.time })
          ),
          h('p.ty-b', { text: m.body })
        );
      }))
    );

    var recall = h('div.stack', null,
      h('div.panel-note.panel-note--gold', null, ico('target', 'ico ico--sm'),
        h('span', { text: '声明式披露：上回合模型在 recall 字段点名了需要的条目，系统本回合执行检索并注入——保留模型自主性，且不额外消耗调用。交火模式再叠一层向量初筛 + rerank 精排。' })),
      h('div.grid-2', null,
        h('div.tile', null, h('div.tl-h', null, ico('scale', 'ico ico--sm'), h('span.tl-n', { text: '相似度阈值' })),
          h('div.tl-v', { text: '0.45' }), h('div.tl-d', { text: '低于此值的纪要直接剔除' })),
        h('div.tile', null, h('div.tl-h', null, ico('filter', 'ico ico--sm'), h('span.tl-n', { text: '最终覆盖 TopK' })),
          h('div.tl-v', { text: '200' }), h('div.tl-d', { text: '送给精排的精选条目数' }))
      ),
      h('div.sec-title', null, h('span.st-t', { text: '本回合召回' }), h('span.st-l', { text: 'Recalled' }), h('i.st-line')),
      h('div.stack-sm', null, C.recall.map(function (r) {
        return h('div.recall-row', null,
          h('div', null, h('div.rr-s', { text: r.score }), h('div.rr-sl', { text: '相似度' })),
          h('div', null, h('div.rr-src', { text: r.source }), h('div.rr-t', { text: r.snippet }))
        );
      }))
    );

    return {
      actions: [act('导出编年史', 'download', function () { tell('已导出编年史', 'chronicle-cycle-1.txt · 大总结 ' + C.grand.length + ' + 小总结 ' + C.minor.length, 'good', 'download'); })],
      body: UI.tabs([
        { label: '大总结', icon: 'chronicle', body: function () { return grand; }, badge: C.grand.length },
        { label: '小总结', icon: 'list', body: function () { return minor; }, badge: C.minor.length },
        { label: '精准召回', icon: 'target', body: function () { return recall; } }
      ], { idBase: 'p3-chron' })
    };
  };

  /* ============================================================
     4. 占卜间 —— 塔罗显影
     ============================================================ */
  P.divination = function (h, ico, UI, D, L) {
    var V = L.divination;
    var spread = V.spreads[1] || V.spreads[0];
    var dealt = [];

    var tray = h('div.spread-tray', null,
      h('div.spread-cards', { id: 'p3-spread-cards' }, UI.empty('显影盘尚未注液', '选择牌阵后按下「摊牌」，牌面会以显影方式浮现在药液表面。', 'tray'))
    );

    function pick(n) {
      var out = [], used = {};
      while (out.length < n) {
        var i = Math.floor(Math.random() * V.deck.length);
        if (used[i]) continue;
        used[i] = 1;
        out.push({ c: V.deck[i], rev: Math.random() < 0.38 });
      }
      return out;
    }

    function deal() {
      dealt = pick(spread.cards);
      var host = document.getElementById('p3-spread-cards');
      UI.clear(host);
      window.FX.play('drip');
      dealt.forEach(function (d, i) {
        var card = h('button.tcard' + (d.rev ? '.is-rev' : ''), {
          type: 'button', id: 'p3-tcard-' + i, 'aria-label': '翻开第 ' + (i + 1) + ' 张牌',
          onclick: function () {
            this.classList.toggle('is-open');
            this.classList.add('dealt');
            window.FX.play('clip');
            if (this.classList.contains('is-open')) {
              tell(d.c.name + (d.rev ? ' · 逆位' : ' · 正位'), d.rev ? d.c.reversed : d.c.upright, 'info', 'tarot', 6000);
            }
          }
        },
          h('div.face.back', null, ico('eyeMystic', 'ico ico--lg')),
          h('div.face.front', null,
            h('div', null, h('div.tf-n', { text: d.c.name }), h('div.tf-l', { text: d.c.latin })),
            h('div.tf-g', null, ico(['star', 'moon', 'sun', 'flame', 'key', 'crown', 'scale', 'hourglass'][d.c.arcana % 8], 'ico ico--xl')),
            h('div.tf-m', { text: (d.rev ? d.c.reversed : d.c.upright).slice(0, 22) })
          )
        );
        host.appendChild(card);
        setTimeout(function () { card.classList.add('is-open', 'dealt'); }, 320 + i * 220);
      });
      window.APP.bumpStat('灵性', -spread.cost);
      tell('已摊开 ' + spread.name, '消耗灵性 ' + spread.cost + ' · 点击任意牌可再次翻面细读', 'good', 'tarot');
    }

    var side = h('div.stack', null,
      h('div.sec-title', null, h('span.st-t', { text: '牌阵' }), h('span.st-l', { text: 'Spreads' }), h('i.st-line')),
      h('div.stack-sm', null, V.spreads.map(function (s) {
        return h('button.lcard', {
          type: 'button', onclick: function () {
            spread = s;
            UI.$$('.lcard', side).forEach(function (b) { b.classList.remove('is-sel'); b.style.borderColor = ''; });
            this.style.borderColor = 'var(--safelight)';
            tell('已选择 ' + s.name, s.desc + ' · 消耗灵性 ' + s.cost, 'info', 'tarot');
          }
        },
          ico('tarot', 'ico lc-ico'),
          h('div', null, h('div.lc-t', { text: s.name }), h('div.lc-d', { text: s.desc })),
          h('div.lc-r', null, h('span.chip.chip--cyan', { text: s.cards + ' 张' }), h('span.chip.chip--red', { text: '灵性 ' + s.cost }))
        );
      })),
      h('div.field-row', null,
        h('label.field-label', { for: 'p3-div-q', text: '占卜内容（问题越具体，涟漪越清晰）' }),
        h('textarea.field', { id: 'p3-div-q', rows: '3', placeholder: '例：今晚前往佐特兰街是否安全？' })),
      h('button.btn.btn--primary.btn--block', { type: 'button', id: 'p3-div-deal', onclick: deal },
        ico('eyeMystic', 'ico ico--sm'), h('span', { text: '摊牌 · 开始显影' })),
      h('div.panel-note.panel-note--warn', null, ico('warning', 'ico ico--sm'),
        h('span', { text: '守则第七条（被涂黑）：不要在午夜之后占卜。当前 07:12，安全。' }))
    );

    var records = h('div.stack', null,
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '占卜记录会写入编年史小总结，并作为既定事实卡注入行动区——模型不能推翻已经占出的结果。' })),
      UI.table([
        { label: '时间', key: 'time', mono: true, width: '140px' },
        { label: '牌阵', key: 'spread', width: '110px' },
        { label: '问题', key: 'question' },
        { label: '结果', key: 'result', width: '120px' },
        { label: '记述', key: 'note' }
      ], V.records)
    );

    var deck = h('div.stack', null,
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '二十二张大阿卡纳，对应二十二条途径的隐喻。正逆位含义均由占卜家自行解读，系统只提供牌面。' })),
      UI.table([
        { label: '№', get: function (c) { return String(c.arcana); }, mono: true, width: '46px' },
        { label: '牌名', key: 'name', width: '92px' },
        { label: 'Latin', key: 'latin', width: '132px' },
        { label: '正位', key: 'upright' },
        { label: '逆位', key: 'reversed' }
      ], V.deck, { dense: true })
    );

    return {
      body: UI.tabs([
        {
          label: '显影盘', icon: 'tray', body: function () {
            return h('div.divine-wrap', null, tray, side);
          }
        },
        { label: '占卜记录', icon: 'ledger', body: function () { return records; }, badge: V.records.length },
        { label: '塔罗全牌', icon: 'tarot', body: function () { return deck; }, badge: 22 }
      ], { idBase: 'p3-div' })
    };
  };

  /* ============================================================
     5. 廷根晚报
     ============================================================ */
  P.newspaper = function (h, ico, UI, D, L) {
    var N = L.newspaper;
    var lead = N.lead;

    var paper = h('div.gazette', null,
      h('header.gz-mast', null,
        h('div.gm-t', { text: N.masthead }),
        h('div.gm-l', { text: N.latin })
      ),
      h('div.gz-meta', null,
        h('span', { text: N.date }),
        h('span', { text: N.issue }),
        h('span', { text: '天气：' + N.weather }),
        h('span', { text: '零售 一便士' })
      ),
      h('article.gz-lead', null,
        h('div.gl-col', { text: lead.column }),
        h('h2.gl-t', { text: lead.title }),
        h('p.gl-d', { text: lead.deck }),
        h('div.gl-b', { text: lead.body }),
        h('div.gz-by', { text: lead.byline })
      ),
      h('div.gz-cols', null, N.columns.map(function (c) {
        return h('article.gz-art', null,
          h('span.ga-col', { text: c.column }),
          h('h3.ga-t', { text: c.title }),
          c.deck ? h('p.ga-d', { text: c.deck }) : null,
          h('p.ga-b', { text: c.body }),
          h('div.ga-by', { text: c.byline || '' })
        );
      })),
      h('section.gz-class', null,
        h('div.gc-h', { text: 'Classified Advertisements · 分类广告' }),
        h('ul', null, N.classifieds.map(function (c) {
          return h('li', null, h('b', { text: c.title }), h('span', { text: c.body }));
        }))
      )
    );

    var archive = h('div.stack', null,
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '报纸是「活世界」的感知通道：你没去过的地方发生的事，会先在这里出现，几回合后才可能与你相遇。' })),
      UI.table([
        { label: '期号', key: 'issue', mono: true, width: '96px' },
        { label: '日期', key: 'date', width: '190px' },
        { label: '头条', key: 'title' },
        { label: '', width: '78px', get: function (r) { return h('button.btn.btn--xs', { type: 'button', onclick: function () { tell('已调阅第 ' + r.issue + ' 期', r.title, 'info', 'newspaper'); } }, h('span', { text: '调阅' })); } }
      ], [
        { issue: '4471', date: '第五纪1349年6月28日 星期四', title: lead.title },
        { issue: '4470', date: '第五纪1349年6月27日 星期三', title: '水车巷第二起失踪案：警方称"暂无外力介入痕迹"' },
        { issue: '4469', date: '第五纪1349年6月26日 星期二', title: '煤价三日内两涨，蒸汽列车班次或将缩减' },
        { issue: '4468', date: '第五纪1349年6月25日 星期一', title: '风暴教会廷根教区举行夏至祈祷，市长出席' },
        { issue: '4467', date: '第五纪1349年6月24日 星期日', title: '因蒂斯商船"白鹭号"延误七日，商会催问' }
      ])
    );

    return {
      actions: [
        act('订阅提醒', 'bell', function () { tell('已订阅《' + N.masthead + '》', '每次游戏内日期推进时，新头条会推送到相片墙', 'good', 'bell'); }),
        act('剪报存档', 'copy', function () { tell('已剪报', '头条已存入图鉴 · 神秘学分类：待验证的世界事件', 'good', 'copy'); })
      ],
      body: UI.tabs([
        { label: '本期', icon: 'newspaper', body: function () { return h('div', { style: { padding: '0' } }, paper); } },
        { label: '往期', icon: 'archive', body: function () { return archive; } }
      ], { idBase: 'p3-news' })
    };
  };

  /* ============================================================
     6. 人物关系 —— 底片格 + 银线
     ============================================================ */
  P.relations = function (h, ico, UI, D, L) {
    var R = L.relations;

    /* 环形布点 */
    var pos = {};
    var self = R[0];
    pos[self.id] = { x: 50, y: 50 };
    var rest = R.slice(1);
    rest.forEach(function (r, i) {
      var a = (Math.PI * 2 * i) / rest.length - Math.PI / 2;
      pos[r.id] = { x: 50 + Math.cos(a) * 34, y: 50 + Math.sin(a) * 33 };
    });

    function graph() {
      var wrap = h('div.tie-wrap');
      var NS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'wires');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('preserveAspectRatio', 'none');
      R.forEach(function (r) {
        (r.edges || []).forEach(function (e) {
          var a = pos[r.id], b = pos[e.to];
          if (!a || !b) return;
          var ln = document.createElementNS(NS, 'line');
          ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y);
          ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y);
          ln.setAttribute('vector-effect', 'non-scaling-stroke');
          ln.setAttribute('class', e.kind === '敌对' ? 'is-foe' : (e.kind === '亲属' ? 'is-kin' : ''));
          svg.appendChild(ln);
        });
      });
      wrap.appendChild(svg);
      R.forEach(function (r) {
        var p = pos[r.id];
        wrap.appendChild(h('button.tienode' + (r.id === self.id ? '.is-self' : ''), {
          type: 'button', style: { left: p.x + '%', top: p.y + '%' },
          title: r.name + ' · ' + r.sequence + ' · ' + r.org + ' · 好感 ' + r.affinity + '（' + r.attitude + '）',
          onclick: function () { tell(r.name + ' · ' + r.attitude, r.note + '｜最近相见：' + r.lastMet, 'info', 'user', 6000); }
        },
          h('div.tn-neg', { style: { background: r.tint } }, h('span', { text: r.name.slice(0, 1) })),
          h('div.tn-aff', null, h('i', { style: { width: r.affinity + '%' } })),
          h('div.tn-n', { text: r.name.split('·')[0] })
        ));
      });
      return wrap;
    }

    function legend() {
      var kinds = {};
      R.forEach(function (r) { (r.edges || []).forEach(function (e) { kinds[e.kind] = (kinds[e.kind] || 0) + 1; }); });
      var warm = R.filter(function (r) { return r.affinity >= 67; }).length;
      var cold = R.filter(function (r) { return r.affinity < 34; }).length;
      return h('div.stack', null,
        h('div.grid-4', null,
          [
            { n: '登记在册', v: R.length, d: '含主角自身', i: 'users' },
            { n: '亲密关系', v: warm, d: '好感 ≥ 67，可请托私事', i: 'heart' },
            { n: '警戒关系', v: cold, d: '好感 < 34，互动会被拒绝', i: 'warning' },
            { n: '关系连线', v: Object.keys(kinds).reduce(function (a, k) { return a + kinds[k]; }, 0), d: Object.keys(kinds).join(' / '), i: 'link' }
          ].map(function (t) {
            return h('div.tile', null,
              h('div.tl-h', null, ico(t.i, 'ico ico--sm'), h('span.tl-n', { text: t.n })),
              h('div.tl-v', { text: String(t.v) }),
              h('div.tl-d', { text: t.d }));
          })),
        h('div', { class: 'row row--wrap', style: { gap: '14px' } },
          [
            { c: 'var(--silver-2)', n: '一般关系（同僚 / 交易 / 师承）' },
            { c: 'var(--fixer)', n: '亲属（金线）' },
            { c: 'var(--safelight)', n: '敌对（红色虚线）' },
            { c: 'var(--cyan-2)', n: '主角（双环标记）' }
          ].map(function (l) {
            return h('span', { class: 'row', style: { gap: '7px', 'font-size': 'var(--fs-2xs)', color: 'var(--txt-3)' } },
              h('i', { style: { width: '16px', height: '2px', background: l.c, 'border-radius': '2px' } }),
              h('span', { text: l.n }));
          })),
        h('div.panel-note', null, ico('info', 'ico ico--sm'),
          h('span', { text: '负像小头像悬停即反转为正像——这是底片的读法。好感条只在前端显示精确值；注入给模型时会降级为「信任 / 欣赏 / 警惕 / 敌意」这类模糊档位，避免模型按数字演戏。' }))
      );
    }

    var graphTab = h('div.stack', null, legend(), graph(),
      h('p.field-hint', { text: '本图为环形布点：主角居中，其余按登记顺序等角分布。连线取自各人物的 edges 字段，实际关系强度以好感条为准。' }));

    var ledger = UI.table([
      { label: '姓名', key: 'name', width: '128px' },
      { label: '序列', key: 'sequence', width: '72px' },
      { label: '组织', key: 'org', width: '150px' },
      { label: '态度', key: 'attitude', width: '68px' },
      {
        label: '好感', width: '128px', get: function (r) {
          return h('div', { class: 'row', style: { gap: '7px' } }, UI.bar(r.affinity, r.affinity > 66 ? 'gold' : (r.affinity < 34 ? 'red' : 'silver')),
            h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-2xs)' }, text: String(r.affinity) }));
        }
      },
      { label: '最近相见', key: 'lastMet', width: '120px' },
      { label: '记述', key: 'note' }
    ], R);

    /* 快速互动 */
    var quick = h('div.stack', null,
      h('div.panel-note', null, ico('heart', 'ico ico--sm'),
        h('span', { text: '快速互动只做一件事：用少量 token 推进一段关系，不写正文、不推进主线时间。好感门槛不足时会被系统拒绝，而不是让模型硬演。' })),
      h('div.tilegrid', null, R.filter(function (r) { return r.id !== self.id; }).slice(0, 6).map(function (r) {
        return h('div.tile', null,
          h('div.tl-h', null, ico('user', 'ico ico--sm'), h('span.tl-n', { text: r.name })),
          h('div', { class: 'row', style: { gap: '8px', 'margin-top': '10px' } },
            UI.bar(r.affinity, r.affinity > 66 ? 'gold' : 'silver'),
            h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)' }, text: String(r.affinity) })),
          h('div.tl-d', { text: r.attitude + ' · ' + r.org }),
          h('div', { class: 'row row--wrap', style: { gap: '5px', 'margin-top': '10px' } },
            ['闲谈', '赠礼', '请求协助', '私下相约'].map(function (k) {
              return h('button.chip', {
                type: 'button', onclick: function () {
                  var gate = k === '私下相约' ? 70 : (k === '请求协助' ? 45 : 0);
                  if (r.affinity < gate) {
                    window.FX.leak();
                    tell('互动被拒绝', r.name + ' 的好感为 ' + r.affinity + '，低于「' + k + '」所需的 ' + gate + '。系统不会让模型硬演一段不该发生的关系。', 'warn', 'lock');
                    return;
                  }
                  tell('已与 ' + r.name + ' ' + k, '好感 +2 · 消耗约 380 token · 未推进主线时间', 'good', 'heart');
                }
              }, h('span', { text: k }));
            }))
        );
      }))
    );

    return {
      body: UI.tabs([
        { label: '关系图', icon: 'relations', body: function () { return graphTab; } },
        { label: '账册', icon: 'ledger', body: function () { return ledger; }, badge: R.length },
        { label: '快速互动', icon: 'heart', body: function () { return quick; } }
      ], { idBase: 'p3-rel' })
    };
  };

})();
