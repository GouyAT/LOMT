/* ============================================================
   panels-d.js —— P5 新增两格：剧场活动（N°14）/ 记忆精炼器（N°21）
   ============================================================ */
(function (global) {
  'use strict';
  var P5 = global.P5 = global.P5 || {};
  var h = P5.h, D = P5.data;
  P5.panels = P5.panels || {};

  /* ============ N°14 剧场活动（元层货币） ============ */
  P5.panels.theatre = function () {
    var T = D.theatre;
    var t = P5.tabs([
      {
        key: 'pt', label: '剧场点数',
        render: function () {
          return [
            h('div.stat-tiles', [
              P5.statTile('剧场点数', String(T.points), '元层货币', 'ok'),
              P5.statTile('已动用', '0 次', '超过 8 次触发反噬'),
              P5.statTile('人性', '82 / 90', '每次动用扣 1—3', 'warn')
            ]),
            h('section.print', [
              h('h4', '这是什么'),
              h('p', { style: { marginTop: '6px' } },
                '剧场点数不是游戏内货币，它买的是**叙事特权**——直接改写已经发生的一句话、指定谁出现、把一次死亡延后。' +
                '它由「不崩」赚来：协议零违例的回合 +2，伏笔揭晓 +6。'),
              h('p.note', { style: { marginTop: '8px' } },
                '代价写在人性上。用得多了，你会从「看戏的人」变成「被看的人」——那时剧场会开始向你收门票。')
            ]),
            h('section.block', [
              P5.sectHead('来源与代价', 'LEDGER'),
              P5.kvList([['本周目累计获得', T.earned], ['动用代价', T.cost]])
            ])
          ];
        }
      },
      {
        key: 'priv', label: '叙事特权',
        render: function () {
          return [
            h('p.t-plate', '点数不足或人性过低时，由规则拒绝，而不是让模型硬演。'),
            h('div.panel-grid.panel-grid--2', T.privileges.map(function (p) {
              var afford = T.points >= p.p;
              return h('div.block', { style: { borderLeft: '2px solid ' + (afford ? 'var(--fixer)' : 'var(--line)') } }, [
                h('div.row.row--between', [
                  h('span', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-xs)', fontWeight: '700', color: afford ? 'var(--fixer-2)' : 'var(--txt-3)' } }, p.nm),
                  h('span.tag' + (afford ? '.tag--fixer' : ''), p.p + ' 点')
                ]),
                h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', lineHeight: '1.75', color: 'var(--txt-2)' } }, p.ds),
                h('div.row.row--between', [
                  h('span.tag.tag--warn', '人性 −' + p.hp),
                  P5.btn(afford ? '动用' : '点数不足', {
                    size: 'sm', disabled: !afford,
                    onClick: function () {
                      P5.notify.confirm({
                        title: '动用「' + p.nm + '」？', icon: 'theatre', danger: p.hp >= 3,
                        msg: '将扣除 ' + p.p + ' 点剧场点数与 ' + p.hp + ' 点人性。此次动用会被记入编年史，且不可撤销。',
                        okText: '动用', note: '规则先行：点数与人性不足时会在此处被拒绝，模型不会替你圆场。'
                      }).then(function (ok) {
                        if (!ok) return;
                        T.points -= p.p;
                        var hp = D.attrs.filter(function (a) { return a.key === 'humanity'; })[0];
                        hp.cur = Math.max(0, hp.cur - p.hp);
                        P5.stage.refreshAttrs();
                        P5.notify.ok('已动用「' + p.nm + '」', '剩余 ' + T.points + ' 点 · 人性 −' + p.hp);
                      });
                    }
                  })
                ])
              ]);
            }))
          ];
        }
      },
      {
        key: 'arena', label: '角斗场',
        render: function () {
          return [
            h('p.t-plate', '角斗场用战斗换点数。序列不足时由规则拒绝入场。'),
            h('div.col', T.arena.map(function (a) {
              var ok = a.state === '可参加';
              return h('div.lore-row', [
                h('span.lore-lamp', { dataset: { mode: ok ? 'green' : 'off' } }),
                h('div', { style: { minWidth: 0 } }, [
                  h('div.lore-row__tt', a.nm),
                  h('div.lore-row__kw', a.lv + ' · 奖励 ' + a.reward)
                ]),
                h('span.tag' + (ok ? '.tag--fixer' : '.tag--warn'), a.state),
                ok ? P5.btn('入场', { size: 'sm', onClick: function () { P5.notify.info('入场需要战斗', '将转入战术棋盘（N°11）进行推演。'); } }) : h('span')
              ]);
            }))
          ];
        }
      }
    ], { label: '剧场活动标签页', id: 'p5-tabs-theatre' });
    return [t.bar, t.body];
  };

  /* ============ N°21 记忆精炼器（三级 + 别名洗白） ============ */
  P5.panels.refiner = function () {
    var R = D.refiner;
    var t = P5.tabs([
      {
        key: 'lv', label: '三级精炼',
        render: function () {
          var total = R.levels.reduce(function (s, l) { return s + (l.on ? l.tok * (l.nm === '小总结' ? l.n : 1) : 0); }, 0);
          return [
            h('div.row.row--between', [
              h('span.t-plate', '小总结 → 大总结 → 二次精炼；均由次 API 后台异步，不阻塞剧情'),
              h('span.tag.tag--cyan', '当前注入 ' + P5.num(total) + ' tok')
            ]),
            h('div.col', R.levels.map(function (l, i) {
              return h('div.block', { style: { borderLeft: '2px solid ' + (l.on ? 'var(--cyan)' : 'var(--line)') } }, [
                h('div.row.row--between', [
                  h('div.row', [
                    h('span.t-num', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--txt-3)' } }, '第 ' + (i + 1) + ' 级'),
                    h('span', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-sm)', fontWeight: '700', color: l.on ? 'var(--cyan-2)' : 'var(--txt-3)' } }, l.nm)
                  ]),
                  P5.toggle('', l.on, function (v) {
                    l.on = v;
                    P5.notify.info(v ? '已启用 ' + l.nm : '已停用 ' + l.nm, v ? null : '停用后这一层不再进入注入面。');
                  }, 'p5-refiner-' + i)
                ]),
                h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', lineHeight: '1.78', color: 'var(--txt-2)' } }, l.ds),
                h('div.row.row--between', [
                  h('span.t-code', '条目 ' + l.n + ' · 单条约 ' + l.tok + ' tok'),
                  P5.btn('立即精炼', {
                    size: 'sm', icon: 'beaker', disabled: !l.on,
                    onClick: function () { P5.notify.info('已排入后台', l.nm + '：由次 API 异步执行，完成后写回档案与世界书。'); }
                  })
                ])
              ]);
            })),
            h('div.zod-note', [
              P5.icon('info', 14),
              h('span', '精炼是有损的。每一级都在丢细节换 token——所以「二次精炼」默认关闭，只在跨周目时才值得开。')
            ])
          ];
        }
      },
      {
        key: 'alias', label: '别名洗白',
        render: function () {
          return [
            h('section.print', [
              h('h4', '为什么需要这一步'),
              h('p', { style: { marginTop: '6px' } },
                '长周目最常见的崩坏不是忘事，是**把同一个人当成两个人**。' +
                '「以利亚」「凡恩记者」「那个记者」在总结里出现三次，模型就可能当作三个人建三份关系。'),
              h('p.note', { style: { marginTop: '8px' } }, '洗白在写入前执行，落档只留规范名；原文里的说法不改，读起来仍然自然。')
            ]),
            h('div.col', R.alias.map(function (a) {
              return h('div.block', [
                h('div.row.row--wrap', [
                  h('span.t-code', '归一为'),
                  h('span.tag.tag--cyan', a.to)
                ]),
                h('div.row.row--wrap', { style: { marginTop: '4px' } }, a.from.map(function (f) { return h('span.tag', f); }))
              ]);
            })),
            h('div.row.row--wrap', [
              P5.btn('新增映射', { size: 'sm', icon: 'plus', onClick: function () { P5.notify.info('新增别名映射', '填写「多个说法 → 一个规范名」，保存后对后续写入生效。'); } }),
              P5.btn('全库重洗', { size: 'sm', variant: 'danger', icon: 'refresh', onClick: function () {
                P5.notify.confirm({
                  title: '对全部历史条目重跑洗白？', danger: true, okText: '重洗',
                  msg: '将重写编年史与世界书中已落档的名称。建议先在档案馆导出一份备份。',
                  note: '重洗只改名称，不改内容；但若映射写错，错误会被写进全部历史。'
                }).then(function (ok) { if (ok) P5.notify.warn('已取消', '原型不执行破坏性操作。'); });
              } })
            ])
          ];
        }
      },
      {
        key: 'api', label: '独立 API',
        render: function () {
          return [
            h('p.t-plate', '精炼可以走独立 key，避免占用正文配额。'),
            h('div.panel-grid.panel-grid--2', [
              h('div.field', [h('label', { for: 'p5-ref-url' }, '反代 URL'), h('input.input', { id: 'p5-ref-url', value: '（沿用次 API）' })]),
              h('div.field', [h('label', { for: 'p5-ref-key' }, 'API Key'), h('input.input', { id: 'p5-ref-key', type: 'password', placeholder: '玩家自持，仅存本地' })]),
              h('div.field', [h('label', { for: 'p5-ref-model' }, '模型'), h('input.input', { id: 'p5-ref-model', value: 'gemini-3.6-flash' })]),
              h('div.field', [h('label', { for: 'p5-ref-temp' }, '温度 0.2'), P5.range({ id: 'p5-ref-temp', min: 0, max: 100, value: 20, label: '温度' })])
            ]),
            h('div.setting-row', [
              h('div', [h('div.setting-row__k', '失败自动重试一次'), h('div.setting-row__d', '仅对后台精炼生效；主线失败交由玩家决定。')]),
              P5.toggle('', true, null, 'p5-ref-retry')
            ]),
            P5.btn('保存配置', { variant: 'primary', icon: 'save', onClick: function () { P5.notify.ok('配置已保存', '记忆精炼器 → gemini-3.6-flash'); } })
          ];
        }
      }
    ], { label: '记忆精炼器标签页', id: 'p5-tabs-refiner' });
    return [t.bar, t.body];
  };
})(window);
