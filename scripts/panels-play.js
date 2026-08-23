/* ============================================================
   诡秘剧场 · 原型3 — 面板：玩法段
   战术棋盘 / 领地经营 / 侦探本 / 星界之门 / 邮箱 / 交易所 /
   剧场活动 / 序列与能力 / 行囊与装备
   ============================================================ */
(function () {
  'use strict';

  var P = (window.PANELS = window.PANELS || {});
  var UIx = null;

  function act(label, icon, fn, cls) {
    return window.UI.h('button.btn.btn--sm' + (cls || ''), { type: 'button', onclick: fn },
      window.UI.ico(icon, 'ico ico--sm'), window.UI.h('span', { text: label }));
  }
  function tell(t, m, tone, i, life) {
    window.UI.toast({ title: t, msg: m, tone: tone || 'info', icon: i, life: life });
  }

  /* ============================================================
     1. 战术棋盘
     ============================================================ */
  P.board = function (h, ico, UI, D, L) {
    var B = D.BOARD;

    function grid() {
      var g = h('div.bgrid', { style: { '--bn': String(B.size) } });
      var terr = {}, ours = {}, foes = {};
      B.terrain.forEach(function (t) { terr[t.x + ',' + t.y] = t; });
      B.ours.forEach(function (u) { ours[u.x + ',' + u.y] = u; });
      B.foes.forEach(function (u) { foes[u.x + ',' + u.y] = u; });

      for (var y = 0; y < B.size; y++) {
        for (var x = 0; x < B.size; x++) {
          var k = x + ',' + y;
          var t = terr[k], o = ours[k], f = foes[k];
          var u = o || f;
          var cell = h('button.bcell', {
            type: 'button',
            dataset: { terrain: t ? t.k : null },
            title: '(' + x + ',' + y + ')' + (t ? ' · ' + t.k + '：' + t.effect : '') + (u ? ' · ' + u.n + ' ' + u.hp + '/' + u.max : ''),
            onclick: (function (t2, u2, x2, y2) {
              return function () {
                if (u2) { tell(u2.n + ' · ' + u2.seq, '生命 ' + u2.hp + ' / ' + u2.max + '｜坐标 (' + x2 + ',' + y2 + ')', 'info', u2.icon); return; }
                if (t2) { tell(t2.k, t2.effect, 'info', 'layers'); return; }
                tell('空格 (' + x2 + ',' + y2 + ')', '可申报移动至此。系统会按地形与移动力审计你的申报。', 'info', 'target');
              };
            })(t, u, x, y)
          });
          if (t) cell.appendChild(h('span.bt', { text: t.k }));
          if (u) {
            cell.appendChild(h('span.un', { text: u.n.slice(0, 2) }));
            cell.appendChild(h('div', { class: 'unit ' + (o ? 'is-ours' : 'is-foes') }, ico(u.icon, 'ico ico--sm')));
            cell.appendChild(h('div.hp', null, h('i', { style: { width: Math.round(u.hp / u.max * 100) + '%' } })));
          }
          g.appendChild(cell);
        }
      }
      return g;
    }

    function roster(list, side) {
      return h('div.stack-sm', null, list.map(function (u) {
        return h('div.lcard', null,
          ico(u.icon, 'ico lc-ico'),
          h('div', null, h('div.lc-t', { text: u.n + ' · ' + u.seq }),
            h('div.lc-d', { text: '坐标 (' + u.x + ',' + u.y + ')' }),
            h('div', { style: { 'margin-top': '6px' } }, UI.bar(Math.round(u.hp / u.max * 100), side === 'ours' ? 'gold' : 'red'))),
          h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)' }, text: u.hp + '/' + u.max })
        );
      }));
    }

    var deploy = h('div.stack', null,
      h('div.row', { style: { gap: '8px' } },
        h('span.chip.chip--red', { text: '第 ' + B.round + ' 回合' }),
        h('span.chip.chip--cyan', { text: '我方 ' + B.ours.length }),
        h('span.chip', { text: '敌方 ' + B.foes.length }),
        h('div.grow'),
        act('改变地形', 'layers', function () { tell('地形笔刷已就绪', '点击任意格子写入新地形；地形会同时注入战术提示词，模型据此审计移动与射线。', 'info', 'layers'); }),
        act('同步出战名单', 'refresh', function () { tell('已同步出战名单', '3 名我方单位已写入 battle-team-composition', 'good', 'check'); })),
      h('div', { class: 'grid-2', style: { 'align-items': 'start' } },
        grid(),
        h('div.stack', null,
          h('div.sec-title', null, h('span.st-t', { text: '我方' }), h('span.st-l', { text: 'Ours' }), h('i.st-line')),
          roster(B.ours, 'ours'),
          h('div.sec-title', null, h('span.st-t', { text: '敌方' }), h('span.st-l', { text: 'Foes' }), h('i.st-line')),
          roster(B.foes, 'foes')
        )
      ),
      h('div.sec-title', null, h('span.st-t', { text: '判定引擎' }), h('span.st-l', { text: 'ENGINE · 本地规则演算' }), h('i.st-line')),
      (function () {
        if (typeof GUIMI_ENGINE === 'undefined') {
          return h('p', { class: 'field-hint', text: '引擎尚未构建：在 p3-demo 目录执行 npm run build:engine 后刷新页面。' });
        }
        var out = h('div.stack-sm');
        return h('div.stack', null,
          h('button.btn.btn--sm', { type: 'button', id: 'p3-board-engine', onclick: function () {
            var r = GUIMI_ENGINE.runDemoRound();
            UI.clear(out);
            r.cards.forEach(function (c) {
              out.appendChild(h('div.lcard', null,
                ico('sword', 'ico lc-ico'),
                h('div', null,
                  h('div.lc-t', { text: c.actor + ' → ' + c.target + ' · ' + c.outcome }),
                  h('div.lc-d', { text: '比率 ' + c.math.ratio.toFixed(2) + ' · 骰面 [' + c.math.dice.join(',') + '] · ' + (c.damage ? '伤害 ' + c.damage.amount + '（' + c.damage.tier + '）' : '未命中') + ' · ' + (c.defenseChain.join('→') || '硬抗') })
                )
              ));
            });
            r.summary.forEach(function (s) { out.appendChild(h('div.lc-d', { style: { 'margin-top': '2px' }, text: '· ' + s })); });
          } }, ico('sword', 'ico ico--sm'), h('span', { text: '演算一轮（本地引擎规则）' })),
          out
        );
      })(),
      h('div.row', { style: { gap: '8px' } },
        h('button.btn.btn--primary', { type: 'button', id: 'p3-board-start', onclick: function () { tell('进入战术回合', '玩家申报 → 系统审计 → NPC 行动规划 → 生成战报', 'good', 'sword'); } },
          ico('sword', 'ico ico--sm'), h('span', { text: '进入战术回合' })),
        act('跳过战术回合', 'skip', function () { tell('已跳过战术回合', '本轮结果由规则直接结算，不调用模型。', 'info', 'skip'); }),
        act('结束战斗', 'close', function () {
          UI.confirm({ title: '结束这场遭遇', msg: '战报将写入编年史，战斗经验按参战回合结算。未收拢的地形改动会被清除。', icon: 'sword', okText: '结束并生成战报', countdown: 10 })
            .then(function (ok) { if (ok) tell('战报已生成', '写入编年史小总结 · 战斗经验 +260 · 星辉 +90', 'good', 'ledger'); });
        }, '.btn--danger')
      )
    );

    var whitelist = h('div.stack', null,
      h('div.panel-note.panel-note--warn', null, ico('lock', 'ico ico--sm'),
        h('span', { text: '能力白名单是防幻觉的硬约束：凡是这份表里没有写的能力，任何角色都不具备。模型若申报表外能力，系统直接驳回并回喂一条纠错消息。' })),
      UI.table([
        { label: '归属', key: 'who', width: '132px' },
        { label: '能力', key: 'ab' },
        { label: '', width: '92px', get: function (r) { return h('button.btn.btn--xs', { type: 'button', onclick: function () { tell('已封锁：' + r.ab, r.who + ' 本场不可再使用此能力（SkillControlManager）', 'warn', 'lock'); } }, window.UI.ico('lock', 'ico ico--sm'), h('span', { text: '封锁' })); } }
      ], B.whitelist),
      h('div.row', { style: { gap: '8px' } },
        act('从世界书同步能力', 'refresh', function () { tell('已从世界书同步', '主库「序列能力」共 24 条，本场命中 7 条', 'good', 'worldbook'); }),
        act('导出白名单', 'download', function () { tell('已导出', 'battle-whitelist.json', 'good', 'download'); }))
    );

    var report = h('div.stack', null,
      h('div.warlog', null, B.log.map(function (l) {
        return h('div.wl', null, h('span.r', { text: 'R' + l.r }), h('span', { text: l.s }));
      })),
      h('div.row', { style: { gap: '8px' } },
        act('生成战报', 'quill', function () { tell('战报已生成', '3 回合、9 次判定、1 次玩家申报被驳回', 'good', 'quill'); }),
        act('复制战报', 'copy', function () { tell('已复制到剪贴板', '纯文本战报 · 1.2 KB', 'good', 'copy'); }))
    );

    return {
      body: UI.tabs([
        { label: '布阵', icon: 'board', body: function () { return deploy; } },
        { label: '能力白名单', icon: 'lock', body: function () { return whitelist; }, badge: B.whitelist.length },
        { label: '战报', icon: 'ledger', body: function () { return report; } }
      ], { idBase: 'p3-board' })
    };
  };

  /* ============================================================
     2. 领地经营
     ============================================================ */
  P.domain = function (h, ico, UI, D, L) {
    var G = D.DOMAIN;

    var overview = h('div.stack', null,
      h('div.panel-note.panel-note--warn', null, ico('info', 'ico ico--sm'),
        h('span', { text: G.hint })),
      h('div.tilegrid', null, [
        { n: '领地', v: G.name, d: '尚未建立', i: 'domain' },
        { n: '人口', v: '—', d: '建立后按区域核算', i: 'users' },
        { n: '周收支', v: '—', d: '产业产出 − 军团与工事维护', i: 'coin' },
        { n: '污染', v: G.pollution + '%', d: G.backlash, i: 'drop' }
      ].map(function (t) {
        return h('div.tile', null,
          h('div.tl-h', null, ico(t.i, 'ico ico--sm'), h('span.tl-n', { text: t.n })),
          h('div.tl-v', { text: t.v }),
          h('div.tl-d', { text: t.d }));
      })),
      h('div', null, h('div.sec-title', null, h('span.st-t', { text: '污染与反噬' }), h('span.st-l', { text: 'Corruption' }), h('i.st-line')),
        UI.bar(G.pollution, G.pollution > 55 ? 'red' : 'gold'),
        h('p.field-hint', { style: { 'margin-top': '8px' }, text: G.backlash })),
      h('button.btn.btn--primary', { type: 'button', onclick: function () { window.FX.leak(); tell('尚不满足建立条件', '需序列7 且拥有一处不动产。当前序列9。', 'warn', 'lock'); } },
        ico('domain', 'ico ico--sm'), h('span', { text: '建立领地' }))
    );

    var affairs = h('div.stack', null,
      UI.table([
        { label: '事务', key: 'n' },
        { label: '经办', key: 'who', width: '140px' },
        { label: '期限', key: 'due', width: '96px' },
        { label: '状态', width: '96px', get: function (r) { return h('span.chip' + (r.status === '进行中' ? '.chip--cyan' : ''), { text: r.status }); } },
        { label: '', width: '86px', get: function (r) { return h('button.btn.btn--xs', { type: 'button', onclick: function () { tell('已开始评定：' + r.n, '评定结果将在下一次周结算时应用', 'info', 'stamp'); } }, h('span', { text: '评定' })); } }
      ], G.affairs),
      h('div.row', { style: { gap: '8px' } },
        act('任命总管', 'crown', function () { tell('尚无可任命人选', '需一位好感 ≥ 60 且常住领地的 NPC', 'warn', 'crown'); }),
        act('立即结算', 'scale', function () { tell('已结算本周事务', '产出 +40 布匹 · 支出 21 金镑 · 污染 +4', 'good', 'scale'); }))
    );

    var army = h('div.stack', null,
      UI.table([
        { label: '编成', key: 'n' },
        { label: '兵员', key: 'qty', align: 'r', mono: true, width: '78px' },
        { label: '精锐', key: 'elite', align: 'r', mono: true, width: '68px' },
        { label: '维护', key: 'upkeep', width: '110px' },
        { label: '状态', width: '86px', get: function (r) { return h('span.chip' + (r.ready ? '.chip--gold' : ''), { text: r.ready ? '可出战' : '整备中' }); } }
      ], G.armies),
      h('div.row', { style: { gap: '8px' } },
        act('新建军队', 'plus', function () { tell('需先建立领地', '军团编成依附于领地行政区', 'warn', 'shield'); }),
        act('军演', 'sword', function () { tell('军演已排期', '不产生真实伤亡，仅生成战力评估报告', 'info', 'sword'); }))
    );

    var industry = h('div.stack', null,
      UI.table([
        { label: '产业', key: 'n' },
        { label: '周产出', key: 'out', width: '150px' },
        { label: '周成本', key: 'cost', width: '120px' },
        { label: '污染', width: '128px', get: function (r) { return h('div', { class: 'row', style: { gap: '7px' } }, UI.bar(r.pollute, r.pollute > 20 ? 'red' : 'gold'), h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-2xs)' }, text: r.pollute + '%' })); } }
      ], G.industry),
      h('div.panel-note.panel-note--gold', null, ico('coin', 'ico ico--sm'),
        h('span', { text: '产业收益按周结算，结算结果作为既定事实卡注入行动区——模型不得凭空改动账目。' }))
    );

    return {
      body: UI.tabs([
        { label: '总览', icon: 'domain', body: function () { return overview; } },
        { label: '政务', icon: 'stamp', body: function () { return affairs; }, badge: G.affairs.length },
        { label: '军团', icon: 'shield', body: function () { return army; } },
        { label: '产业', icon: 'coin', body: function () { return industry; } }
      ], { idBase: 'p3-dom' })
    };
  };

  /* ============================================================
     3. 侦探本
     ============================================================ */
  P.cases = function (h, ico, UI, D, L) {
    var CS = L.cases;

    function one(c) {
      return h('div.stack', null,
        h('article.dossier', null,
          h('div.ds-h', null,
            h('span.ds-code', { text: c.code }),
            h('span.ds-t', { text: c.title }),
            h('span.ds-st', { text: c.status })
          ),
          h('div', { class: 'row row--wrap', style: { gap: '6px', 'margin-top': '10px' } },
            h('span.chip.chip--paper', { text: '立案 ' + c.opened }),
            h('span.chip.chip--paper', { text: c.location })),
          h('p.ds-b', { text: c.brief }),
          c.status === '已结案' ? h('div', { class: 'row', style: { 'justify-content': 'flex-end', 'margin-top': '12px' } }, h('span.seal', null, h('span', { text: '已结案' }))) : null
        ),
        h('div.sec-title', null, h('span.st-t', { text: '线索' }), h('span.st-l', { text: 'Clues' }), h('i.st-line'),
          h('span.chip.chip--cyan', { text: c.clues.filter(function (x) { return x.found; }).length + ' / ' + c.clues.length })),
        h('div.stack-sm', null, c.clues.map(function (cl) {
          return h('div.clue', { dataset: { found: String(cl.found) } },
            ico(cl.found ? 'check' : 'question', 'ico ico--sm'),
            h('div', null, h('b', { text: cl.name }), h('div', { style: { 'margin-top': '3px' }, text: cl.found ? cl.note : '尚未获得。需通过探案回合、占卜或走访取得。' })));
        })),
        h('div.sec-title', null, h('span.st-t', { text: '嫌疑人' }), h('span.st-l', { text: 'Suspects' }), h('i.st-line')),
        UI.table([
          { label: '姓名', key: 'name', width: '150px' },
          { label: '嫌疑度', width: '140px', get: function (r) { return h('div', { class: 'row', style: { gap: '7px' } }, UI.bar(r.doubt, r.doubt > 55 ? 'red' : 'silver'), h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-2xs)' }, text: r.doubt + '%' })); } },
          { label: '依据', key: 'note' }
        ], c.suspects),
        h('div.panel-note', null, ico('info', 'ico ico--sm'), h('span', { text: '当前判断：' + c.verdict })),
        h('div.row', { style: { gap: '8px' } },
          h('button.btn.btn--primary', { type: 'button', onclick: function () { tell('开始探案回合', '本回合改用探案思维链，正文将围绕搜查与询问展开', 'good', 'loupe'); } },
            ico('loupe', 'ico ico--sm'), h('span', { text: '开始探案' })),
          act('申报结案', 'stamp', function () {
            UI.confirm({ title: '申报结案：' + c.title, msg: '系统会校验你的推断与已获线索是否自洽。若矛盾，结案会被驳回并扣除声望。', icon: 'stamp', okText: '提交结案报告', countdown: 14 })
              .then(function (ok) {
                if (!ok) return;
                if (c.clues.filter(function (x) { return x.found; }).length < c.clues.length) {
                  window.FX.leak();
                  tell('结案被驳回', '仍有线索未取得，推断链存在缺口。这不是模型的判断，而是规则的判断。', 'warn', 'warning', 6500);
                } else {
                  tell('结案报告已受理', '写入编年史 · 声望 +5 · 剧场点数 +80', 'good', 'stamp');
                }
              });
          }))
      );
    }

    var tabs = CS.map(function (c) {
      return { label: c.code, icon: 'casefile', body: function () { return one(c); }, badge: c.status === '侦办中' ? '侦' : null };
    });
    tabs.push({
      label: '配置', icon: 'sliders', body: function () {
        return h('div.setgrid', null,
          h('div.panel-note', null, ico('info', 'ico ico--sm'), h('span', { text: '探案模式会替换本回合的思维链与提示词尾注，让模型专注于线索链自洽，而不是推进剧情。' })),
          setrow(h, ico, UI, '探案思维链', '放在提示词最末尾，留空则不注入', h('textarea.field', { rows: '3', placeholder: '先列出已知线索，再逐条检验矛盾，最后给出最小可信推断……' })),
          setrow(h, ico, UI, '每案最大线索数', '超出后旧线索折叠进历史孔隙', h('input.field', { type: 'number', value: '12' })),
          setrow(h, ico, UI, '允许占卜取证', '占卜结果作为既定事实卡，不可被推翻', switchEl(h, true)),
          setrow(h, ico, UI, '结案自洽校验', '关闭后模型可自由宣布结案', switchEl(h, true))
        );
      }
    });

    return { body: UI.tabs(tabs, { idBase: 'p3-case' }) };
  };

  /* ============================================================
     4. 星界之门
     ============================================================ */
  P.gate = function (h, ico, UI, D, L) {
    var G = D.GATE;

    var summon = h('div.stack', null,
      h('div.panel-note.panel-note--gold', null, ico('gate', 'ico ico--sm'),
        h('span', { text: '星界倒影之门：以星辉换取封印物、魔药配方与仪式材料。所有产出都会写入行囊并登记到图鉴，不经过模型。' })),
      h('div', { class: 'row', style: { gap: '10px' } },
        h('span.chip.chip--gold', { text: '星辉 ' + G.stardust }),
        h('div.grow'),
        h('button.btn.btn--cyan', { type: 'button', onclick: function () { draw(1); } }, ico('dice', 'ico ico--sm'), h('span', { text: '召唤 1 次（' + G.single + ' 星辉）' })),
        h('button.btn.btn--primary', { type: 'button', onclick: function () { draw(10); } }, ico('spark', 'ico ico--sm'), h('span', { text: '召唤 10 次（' + G.ten + ' 星辉）' }))),
      h('div.sec-title', null, h('span.st-t', { text: '当期奖池' }), h('span.st-l', { text: 'Pool' }), h('i.st-line')),
      UI.table([
        { label: '产出', key: 'n' },
        { label: '等阶', width: '78px', get: function (r) { return h('span', { class: 'u-mono rank-' + r.rank, text: r.rank }); } },
        { label: '概率', key: 'rate', align: 'r', mono: true, width: '78px' }
      ], G.pool),
      h('div.sec-title', null, h('span.st-t', { text: '召唤记录' }), h('span.st-l', { text: 'History' }), h('i.st-line')),
      UI.table([
        { label: '时间', key: 'time', mono: true, width: '130px' },
        { label: '产出', key: 'got' },
        { label: '等阶', width: '70px', get: function (r) { return h('span', { class: 'u-mono rank-' + r.rank, text: r.rank }); } }
      ], G.history, { dense: true })
    );

    function draw(n) {
      var cost = n === 1 ? G.single : G.ten;
      if (G.stardust < cost) { window.FX.leak(); tell('星辉不足', '需要 ' + cost + '，当前 ' + G.stardust + '。可在剧场活动或战斗结算中获得。', 'warn', 'lock'); return; }
      G.stardust -= cost;
      window.FX.flash();
      window.FX.play('bell');
      tell('召唤完成 ×' + n, '获得：' + (n === 1 ? '仪式蜡烛 ×5（R）' : '魔药配方 · 小丑（SR）、灵界导引液（SR）、其余为 R/N') + '｜剩余星辉 ' + G.stardust, 'good', 'gate', 6500);
    }

    var exchange = h('div.stack', null,
      h('div.panel-note', null, ico('info', 'ico ico--sm'), h('span', { text: '星辉兑换是确定性获取渠道：不看概率，只看库存。库存每游戏周刷新。' })),
      UI.table([
        { label: '物品', key: 'n' },
        { label: '价格', key: 'cost', align: 'r', mono: true, width: '86px' },
        { label: '库存', key: 'stock', align: 'r', mono: true, width: '68px' },
        { label: '', width: '86px', get: function (r) { return h('button.btn.btn--xs', { type: 'button', onclick: function () { if (G.stardust < r.cost) { window.FX.leak(); tell('星辉不足', '需要 ' + r.cost, 'warn', 'lock'); return; } G.stardust -= r.cost; tell('已兑换：' + r.n, '剩余星辉 ' + G.stardust, 'good', 'check'); } }, h('span', { text: '兑换' })); } }
      ], G.exchange)
    );

    var forge = h('div.stack', null,
      h('div.panel-note', null, ico('flame', 'ico ico--sm'), h('span', { text: '重铸消耗同类装备，把随机词条往目标方向收敛；分解则把装备还原为星辉与材料。两者都不调用模型。' })),
      h('div.grid-2', null,
        h('div.tile', null, h('div.tl-h', null, ico('flame', 'ico ico--sm'), h('span.tl-n', { text: '重铸装备' })),
          h('div.tl-d', { style: { 'margin-top': '10px' }, text: '选择一件主装备与至多三件祭品，按祭品词条加权重掷。' }),
          h('button.btn.btn--sm', { type: 'button', style: { 'margin-top': '12px' }, onclick: function () { tell('重铸台已就绪', '请先在行囊中选择主装备', 'info', 'flame'); } }, h('span', { text: '进入重铸台' }))),
        h('div.tile', null, h('div.tl-h', null, ico('cube', 'ico ico--sm'), h('span.tl-n', { text: '分解' })),
          h('div.tl-d', { style: { 'margin-top': '10px' }, text: '封印物不可分解；普通装备按等阶返还 30%–60% 星辉。' }),
          h('button.btn.btn--sm', { type: 'button', style: { 'margin-top': '12px' }, onclick: function () { tell('分解台已就绪', '请先在行囊中勾选待分解物品', 'info', 'cube'); } }, h('span', { text: '进入分解台' })))
      )
    );

    return {
      body: UI.tabs([
        { label: '召唤', icon: 'gate', body: function () { return summon; } },
        { label: '星辉兑换', icon: 'coin', body: function () { return exchange; }, badge: G.exchange.length },
        { label: '重铸与分解', icon: 'flame', body: function () { return forge; } }
      ], { idBase: 'p3-gate' })
    };
  };

  /* ============================================================
     5. 邮箱
     ============================================================ */
  P.mail = function (h, ico, UI, D, L) {
    var M = D.MAILS;
    var cur = M[0];

    var listCol = h('div.stack-sm', { id: 'p3-mail-list' });
    var readCol = h('div', { id: 'p3-mail-read' });

    function paintList() {
      UI.clear(listCol);
      M.forEach(function (m) {
        listCol.appendChild(h('button.lcard', {
          type: 'button', style: cur.id === m.id ? { 'border-color': 'var(--safelight)' } : null,
          onclick: function () { cur = m; m.unread = false; paintList(); paintRead(); }
        },
          ico(m.unread ? 'mail' : 'file', 'ico lc-ico'),
          h('div', null,
            h('div.lc-t', { text: m.subject }),
            h('div.lc-d', { text: m.from })),
          h('div.lc-r', null,
            h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-3xs)', color: 'var(--txt-3)' }, text: m.time }),
            m.unread ? h('span.chip.chip--red', { text: '未读' }) : null,
            m.attach && m.attach.length ? h('span.chip.chip--gold', { text: '附件 ' + m.attach.length }) : null)
        ));
      });
      var un = M.filter(function (x) { return x.unread; }).length;
      var f = document.querySelector('.frame[data-id="mail"]');
      if (f) { if (un) f.dataset.badge = String(un); else f.removeAttribute('data-badge'); }
    }

    function paintRead() {
      UI.clear(readCol);
      readCol.appendChild(h('div.paper.paper--bordered', { style: { padding: '22px 24px 26px' } },
        h('div', { style: { 'border-bottom': '1px solid var(--paper-3)', 'padding-bottom': '10px' } },
          h('div', { class: 'u-mono', style: { 'font-size': 'var(--fs-2xs)', color: 'var(--ink-3)', 'letter-spacing': '.16em' }, text: cur.time + ' · ' + cur.from }),
          h('div', { style: { 'font-weight': '700', 'font-size': 'var(--fs-lg)', 'margin-top': '6px', color: 'var(--ink)', 'letter-spacing': '.06em' }, text: cur.subject })),
        h('div', { style: { 'margin-top': '14px', 'white-space': 'pre-wrap', 'line-height': '1.95', color: 'var(--ink)', 'font-size': 'var(--fs-sm)' }, text: cur.body }),
        cur.attach && cur.attach.length ? h('div', { style: { 'margin-top': '18px', 'padding-top': '12px', 'border-top': '1px dashed var(--paper-3)' } },
          h('div', { class: 'u-mono', style: { 'font-size': 'var(--fs-2xs)', color: 'var(--ink-3)' }, text: '附件' }),
          h('div', { class: 'row row--wrap', style: { gap: '6px', 'margin-top': '8px' } },
            cur.attach.map(function (a) { return h('span.chip.chip--paper', null, window.UI.ico('bag', 'ico ico--sm'), h('span', { text: a })); })),
          h('button.btn.btn--sm.btn--primary', { type: 'button', style: { 'margin-top': '12px' }, onclick: function () { tell('已领取附件', cur.attach.join('、') + ' 已入行囊', 'good', 'check'); } },
            window.UI.ico('download', 'ico ico--sm'), h('span', { text: '领取附件' }))
        ) : null
      ));
    }

    paintList(); paintRead();

    return {
      actions: [act('全部标记已读', 'check', function () { M.forEach(function (m) { m.unread = false; }); paintList(); tell('已全部标记为已读', '', 'good', 'check'); })],
      body: h('div.proj-pad', null,
        h('div', { class: 'grid-2', style: { 'grid-template-columns': 'minmax(0,300px) minmax(0,1fr)', 'align-items': 'start' } },
          listCol, readCol))
    };
  };

  /* ============================================================
     6. 交易所
     ============================================================ */
  P.trade = function (h, ico, UI, D, L) {
    var T = D.TRADES;
    return {
      actions: [act('发起交易', 'plus', function () { tell('请选择交易对象', '仅可与好感 ≥ 30 且在场或可通信的对象交易', 'info', 'trade'); })],
      body: h('div.proj-pad.stack', null,
        h('div.panel-note', null, ico('info', 'ico ico--sm'),
          h('span', { text: '交易是双向承诺：双方各自锁定物品后由系统执行，模型只负责给出对方的态度与还价理由，不负责改动物品数量。' })),
        h('div.stack-sm', null, T.map(function (t) {
          return h('div.lcard', null,
            ico('trade', 'ico lc-ico'),
            h('div', null,
              h('div.lc-t', { text: t.peer }),
              h('div.lc-d', { text: '你付出：' + t.give + '　→　你获得：' + t.want }),
              h('div', { class: 'row', style: { gap: '7px', 'margin-top': '7px' } },
                h('span', { class: 'u-faint', style: { 'font-size': 'var(--fs-3xs)' }, text: '信任度' }),
                UI.bar(t.trust, t.trust > 55 ? 'gold' : 'silver'),
                h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-2xs)', color: 'var(--txt-2)' }, text: String(t.trust) }))),
            h('div.lc-r', null,
              h('span.chip' + (t.status === '可成交' ? '.chip--gold' : (t.status === '需高级权限' ? '.chip--red' : '.chip--cyan')), { text: t.status }),
              h('button.btn.btn--xs', {
                type: 'button', onclick: function () {
                  if (t.status !== '可成交') { window.FX.leak(); tell('无法成交', t.status + '：' + (t.status === '需高级权限' ? '需序列7 以上或持有对应封印物' : '等待对方回应，可在邮箱查看进展'), 'warn', 'lock'); return; }
                  UI.confirm({ title: '与 ' + t.peer + ' 成交', msg: '付出 ' + t.give + '，获得 ' + t.want + '。成交后不可撤销。', icon: 'trade', okText: '确认交易', countdown: 10 })
                    .then(function (ok) { if (ok) tell('交易已完成', t.want + ' 已入行囊 · 信任度 +6', 'good', 'check'); });
                }
              }, h('span', { text: '成交' })))
          );
        })),
        h('div.sec-title', null, h('span.st-t', { text: '交易须知' }), h('span.st-l', { text: 'Terms' }), h('i.st-line')),
        h('div.stack-sm', null, [
          '一、非凡物品的交易会在灵界留下痕迹，序列越高的物品痕迹越明显。',
          '二、以秘密换秘密的交易不可撤销，且双方都无法确认对方所述为真。',
          '三、典当行的估价永远低于市价三成，这是行规，不是欺诈。',
          '四、与塔罗会成员交易需要挂坠盒或等价的通信手段。'
        ].map(function (t) { return h('div.clue', { dataset: { found: 'true' }, style: { background: 'color-mix(in srgb, var(--void) 34%, transparent)', color: 'var(--txt-2)' } }, ico('scroll', 'ico ico--sm'), h('span', { text: t })); }))
      )
    };
  };

  /* ============================================================
     7. 剧场活动
     ============================================================ */
  P.theatre = function (h, ico, UI, D, L) {
    var T = D.THEATRE;

    var acts = h('div.stack', null,
      h('div.panel-note.panel-note--gold', null, ico('theatre', 'ico ico--sm'),
        h('span', { text: '剧场点数是「元层货币」：花它买的不是剧情内的东西，而是叙事上的特权（多一个选项、看一眼白名单、跳过一次判定）。用得越多，人性掉得越快。' })),
      h('div', { class: 'row', style: { gap: '10px' } },
        h('span.chip.chip--gold', { text: '剧场点数 ' + T.points }),
        h('div.grow'),
        act('点数来源说明', 'question', function () { tell('剧场点数来源', '结案 +80 · 战斗结算 +40 · 首次抵达地标 +20 · 完成伏笔 +60', 'info', 'question'); })),
      h('div.tilegrid', null, T.acts.map(function (a) {
        return h('div.tile', null,
          h('div.tl-h', null, ico(a.i, 'ico ico--sm'), h('span.tl-n', { text: a.n })),
          h('div.tl-v', { text: a.cost + ' 点' }),
          h('div.tl-d', { text: a.d }),
          h('button.btn.btn--sm', {
            type: 'button', style: { 'margin-top': '12px', width: '100%' },
            onclick: function () {
              if (T.points < a.cost) { window.FX.leak(); tell('点数不足', '需要 ' + a.cost + '，当前 ' + T.points, 'warn', 'lock'); return; }
              UI.confirm({ title: a.n, msg: a.d + '｜消耗 ' + a.cost + ' 剧场点数。', detail: a.n === '包厢观剧' ? '注意：此项额外扣除人性 2。' : '', icon: a.i, okText: '花费 ' + a.cost + ' 点', countdown: 12 })
                .then(function (ok) {
                  if (!ok) return;
                  T.points -= a.cost;
                  tell('已使用：' + a.n, '剩余剧场点数 ' + T.points, 'good', a.i);
                  if (a.n === '包厢观剧') window.APP.bumpStat('人性', -2);
                });
            }
          }, h('span', { text: '使用' })));
      }))
    );

    var arena = h('div.stack', null,
      h('div.panel-note', null, ico('sword', 'ico ico--sm'),
        h('span', { text: '角斗场是纯规则副本：不生成正文，只跑战术推演并结算经验与星辉。适合在不想推进主线时练级。' })),
      h('div.stack-sm', null, T.arena.map(function (a) {
        return h('div.lcard', null,
          ico(a.cleared ? 'check' : 'sword', 'ico lc-ico'),
          h('div', null, h('div.lc-t', { text: a.n }), h('div.lc-d', { text: '奖励：' + a.reward })),
          h('div.lc-r', null,
            h('span.chip' + (a.cleared ? '.chip--gold' : '.chip--red'), { text: a.rank }),
            h('button.btn.btn--xs', { type: 'button', onclick: function () { document.dispatchEvent(new CustomEvent('p3:open', { detail: { id: 'board' } })); } },
              h('span', { text: a.cleared ? '重打' : '挑战' })))
        );
      }))
    );

    return {
      body: UI.tabs([
        { label: '幕后与售票', icon: 'theatre', body: function () { return acts; } },
        { label: '角斗场', icon: 'sword', body: function () { return arena; }, badge: T.arena.length }
      ], { idBase: 'p3-thr' })
    };
  };

  /* ============================================================
     8. 序列与能力
     ============================================================ */
  P.sequence = function (h, ico, UI, D, L) {
    var C = D.CHAR;

    var ladder = [
      { s: '序列9', n: '占卜家', got: true, note: '当前 · 消化 ' + C.digest + '%' },
      { s: '序列8', n: '小丑', got: false, note: '需完成占卜家扮演法（消化 100%）' },
      { s: '序列7', n: '魔术师', got: false, note: '需小丑魔药主材料：无面者的鲜血' },
      { s: '序列6', n: '无面者', got: false, note: '资料不足' },
      { s: '序列5', n: '秘偶大师', got: false, note: '资料不足' },
      { s: '序列4', n: '奇迹师', got: false, note: '资料不足' }
    ];

    var seqTab = h('div.stack', null,
      h('div.grid-3', null,
        h('div.tile', null, h('div.tl-h', null, ico('sequence', 'ico ico--sm'), h('span.tl-n', { text: '当前序列' })),
          h('div.tl-v', { text: '9' }), h('div.tl-d', { text: C.pathway + '途径 · ' + C.sequence.split('·')[1] })),
        h('div.tile', null, h('div.tl-h', null, ico('drop', 'ico ico--sm'), h('span.tl-n', { text: '魔药消化' })),
          h('div.tl-v', { text: C.digest + '%' }), h('div.tl-d', { text: '扮演法：持续以占卜家的方式行事' })),
        h('div.tile', null, h('div.tl-h', null, ico('warning', 'ico ico--sm'), h('span.tl-n', { text: '失控' })),
          h('div.tl-v', { text: C.lose + '%' }), h('div.tl-d', { text: '超过 40% 时出现幻听与强迫性占卜' }))),
      h('div.sec-title', null, h('span.st-t', { text: '愚者途径 · 晋升阶梯' }), h('span.st-l', { text: 'Pathway' }), h('i.st-line')),
      h('div.stack-sm', null, ladder.map(function (l) {
        return h('div.lcard', { style: l.got ? { 'border-color': 'color-mix(in srgb, var(--safelight) 50%, transparent)' } : null },
          ico(l.got ? 'check' : 'lock', 'ico lc-ico'),
          h('div', null, h('div.lc-t', { text: l.s + ' · ' + l.n }), h('div.lc-d', { text: l.note })),
          l.got ? h('span.chip.chip--red', { text: '已获得' }) : h('span.chip', { text: '未解锁' }));
      })),
      h('div.row', { style: { gap: '8px' } },
        h('button.btn.btn--primary', {
          type: 'button', onclick: function () {
            if (C.digest < 100) { window.FX.leak(); tell('尚不可晋升', '占卜家魔药消化 ' + C.digest + '%，需达到 100% 才能安全服用下一瓶。强行晋升会立刻失控。', 'warn', 'warning', 6500); return; }
            tell('可以晋升', '', 'good', 'check');
          }
        }, ico('sequence', 'ico ico--sm'), h('span', { text: '申请晋升' })),
        act('应用途径专长', 'star', function () { tell('已应用途径专长', '占卜家：占卜类能力的灵性消耗 −1（最低 1）', 'good', 'star'); }))
    );

    var abTab = h('div.stack', null,
      h('div.panel-note.panel-note--warn', null, ico('lock', 'ico ico--sm'),
        h('span', { text: '能力清单同时是「注入白名单」：只有这里登记的能力才会进入提示词，模型不得使用表外能力。封锁的能力会被显式标注为"本场不可用"。' })),
      h('div.stack-sm', null, C.abilities.map(function (a) {
        return h('div.lcard', { style: a.locked ? { opacity: '.6' } : null },
          ico(a.icon, 'ico lc-ico'),
          h('div', null, h('div.lc-t', { text: a.k }), h('div.lc-d', { text: a.d })),
          h('div.lc-r', null,
            h('span.chip' + (a.locked ? '.chip--red' : '.chip--cyan'), { text: a.locked ? '未解锁' : '可用' }),
            a.locked ? null : h('button.btn.btn--xs', { type: 'button', onclick: function () { tell('已封锁：' + a.k, '本场战斗与本回合内不可使用（SkillControlManager）', 'warn', 'lock'); } }, h('span', { text: '封锁' })))
        );
      })),
      h('div.row', { style: { gap: '8px' } },
        act('刷新序列能力', 'refresh', function () { tell('已从世界书刷新', '主库「序列能力」24 条 → 匹配当前序列 6 条', 'good', 'worldbook'); }),
        act('重抽能力', 'dice', function () { tell('重抽需消耗', '1 份灵界导引液（当前持有 0）', 'warn', 'dice'); }))
    );

    var traitTab = h('div.stack', null,
      h('div.stack-sm', null, C.traits.map(function (t) {
        return h('div.lcard', null,
          ico(t.k === '天赋' ? 'star' : 'eyeMystic', 'ico lc-ico'),
          h('div', null, h('div.lc-t', { text: t.v }), h('div.lc-d', { text: t.note })),
          h('span.chip' + (t.k === '天赋' ? '.chip--gold' : '.chip--cyan'), { text: t.k }));
      }))
    );

    return {
      body: UI.tabs([
        { label: '序列', icon: 'sequence', body: function () { return seqTab; } },
        { label: '能力', icon: 'spark', body: function () { return abTab; }, badge: C.abilities.length },
        { label: '特质与天赋', icon: 'star', body: function () { return traitTab; }, badge: C.traits.length }
      ], { idBase: 'p3-seq' })
    };
  };

  /* ============================================================
     9. 行囊与装备
     ============================================================ */
  P.bag = function (h, ico, UI, D, L) {
    var C = D.CHAR;
    var items = L.codex.items.filter(function (x) { return x.owned; });

    var equip = h('div.stack', null,
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '五个通用槽位不限武器/衣物/饰品——诡秘的非凡者带什么全看情境。第六槽固定为扮演法，用于承载晋升进度。' })),
      h('div', { class: 'slots', style: { 'max-width': '420px', 'grid-template-columns': 'repeat(3, minmax(0,1fr))' } },
        C.slots.map(function (s) {
          return h('button.slot' + (s.filled ? '.is-filled' : '') + (s.special ? '.is-special' : ''), {
            type: 'button', style: { 'aspect-ratio': '1' },
            title: s.k + '：' + (s.item || '空置'),
            onclick: function () { tell(s.k + ' · ' + (s.item || '空置'), s.note, s.filled ? 'info' : 'warn', s.icon); }
          }, ico(s.icon, 'ico ico--lg'), h('span.s-name', { text: s.item ? s.item : s.k }));
        })),
      h('div.sec-title', null, h('span.st-t', { text: '扮演法进度' }), h('span.st-l', { text: 'Acting' }), h('i.st-line')),
      h('div', null, UI.bar(C.digest, 'gold'),
        h('p.field-hint', { style: { 'margin-top': '8px' }, text: '占卜家扮演法 · 消化 ' + C.digest + '%。以占卜家的方式思考与行动会推进进度；使用与途径无关的手段会拖慢它。' }))
    );

    var inv = h('div.stack', null,
      h('div.row', { style: { gap: '8px' } },
        h('span.chip.chip--cyan', { text: items.length + ' 件' }),
        h('div.grow'),
        act('批量分解', 'cube', function () { tell('请先勾选物品', '封印物不可分解', 'info', 'cube'); }),
        act('赠予 NPC', 'heart', function () { tell('请选择赠予对象', '赠礼会按对方偏好转化为好感或战斗经验', 'info', 'heart'); })),
      h('div.codex-grid', null, items.map(function (it) {
        return h('article.ccard', null,
          h('div.cc-strip', null,
            h('div.cc-neg', { style: { background: '#c9913c' } }, ico('bag', 'ico ico--sm')),
            h('div.grow', null, h('div.cc-n', { text: it.name }), h('div.cc-l', { text: it.latin || '' })),
            h('span.chip.chip--paper', { text: it.rank })),
          h('p.cc-s', { text: it.summary }),
          h('div.cc-tags', null, (it.tags || []).slice(0, 3).map(function (t) { return h('span.chip.chip--paper', { text: t }); })),
          h('div.cc-foot', null,
            h('button.btn.btn--xs', { type: 'button', onclick: function () { tell('已装备：' + it.name, '占用一个通用槽位', 'good', 'check'); } }, h('span', { text: '装备' })),
            h('button.btn.btn--xs.btn--ghost', { type: 'button', onclick: function () { tell(it.name, it.detail, 'info', 'bag', 7000); } }, h('span', { text: '细读' }))));
      }))
    );

    var purse = h('div.stack', null,
      h('div.tilegrid', null, C.currency.map(function (c) {
        return h('div.tile', null,
          h('div.tl-h', null, ico('coin', 'ico ico--sm'), h('span.tl-n', { text: c.k })),
          h('div.tl-v', { text: String(c.v) }),
          h('div.tl-d', { text: c.k === '剧场点数' ? '元层货币 · 可买叙事特权' : (c.k === '星辉' ? '星界之门通用货币' : '鲁恩王国流通货币') }));
      })),
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '1 金镑 = 20 苏勒 = 240 便士。所有货币变动都经系统执行并写入 state_update，模型只能申请、不能宣布结果。' }))
    );

    return {
      body: UI.tabs([
        { label: '装备栏', icon: 'shield', body: function () { return equip; }, badge: '5+1' },
        { label: '物品栏', icon: 'bag', body: function () { return inv; }, badge: items.length },
        { label: '钱袋', icon: 'coin', body: function () { return purse; } }
      ], { idBase: 'p3-bag' })
    };
  };

  /* ---------------- 复用小件 ---------------- */
  function setrow(h, ico, UI, n, d, ctrl) {
    return h('div.setrow', null,
      h('div', null, h('div.sr-n', { text: n }), h('div.sr-d', { text: d })),
      h('div.sr-c', null, ctrl));
  }
  function switchEl(h, on, onChange) {
    var input = h('input', { type: 'checkbox', checked: on ? true : null });
    if (onChange) input.addEventListener('change', function () { onChange(input.checked); });
    return h('label.switch', null, input, h('i.track'));
  }
  window.PANELBITS = { setrow: setrow, switchEl: switchEl, act: act, tell: tell };
})();
