/* ===========================================================
   panels-b.js —— 面板组 B：记忆族 + 神秘族 + 工坊
   编年史 / 记忆召回 / 伏笔台账 / 档案馆 / 占卜间 / 战术推演 / 侦探案卷 / 领地经营 / 显影室
   =========================================================== */
(function (global) {
  'use strict';
  var P5 = global.P5 = global.P5 || {};
  var h = P5.h, D = P5.data;
  P5.panels = P5.panels || {};

  /* ============ 8. 编年史 ============ */
  P5.panels.chronicle = function () {
    var t = P5.tabs([
      {
        key: 'big', label: '大总结',
        render: function () {
          return [
            h('div.row.row--between', [
              h('span.t-label', '第一周目 · 覆盖第 1—6 回合 · 约 430 tok'),
              h('div.row', [
                P5.btn('重新提炼', { size: 'sm', icon: 'refresh', onClick: function () { P5.notify.info('提炼记忆精华', '将由次 API 后台异步执行，不阻塞剧情。'); } }),
                P5.btn('写入世界书', { size: 'sm', icon: 'books', onClick: function () { P5.notify.ok('已写入', '条目「本周目经历(1)」更新至附书。'); } })
              ])
            ]),
            h('section.card-paper', [
              h('h4', { style: { marginBottom: '8px' } }, '本周目经历（1）'),
              h('p', { style: { fontSize: 'var(--fs-2xs)', lineHeight: '1.95' } }, D.chronicle.big)
            ]),
            h('div.zod-note', [
              P5.icon('info', 14),
              h('span', '别名洗白：「以利亚」「凡恩记者」「那个记者」在写入前会统一为实体「以利亚·凡恩」，避免长周目后 AI 把同一人当成两个人。')
            ])
          ];
        }
      },
      {
        key: 'small', label: '小总结',
        render: function () {
          return [
            h('p.t-label', '每回合一条，滚动窗口 40 回合；超出后并入大总结。'),
            h('div.col', D.chronicle.small.map(function (s) {
              return h('div.lore-row', [
                h('span.lore-lamp', { dataset: { mode: 'green' } }),
                h('span.lore-row__tt', s.tx),
                h('span.lore-row__kw', s.r)
              ]);
            }))
          ];
        }
      },
      {
        key: 'time', label: '时间线',
        render: function () {
          return h('div.timeline', D.chronicle.timeline.map(function (e) {
            return h('div.tl-item', { dataset: { key: e.key ? 1 : 0 } }, [
              h('div.tl-item__t', e.t),
              h('div.tl-item__tt', e.tt),
              h('div.tl-item__tx', e.tx)
            ]);
          }));
        }
      }
    ], { label: '编年史标签页', id: 'p5-tabs-chronicle' });
    return [t.bar, t.body];
  };

  /* ============ 9. 记忆召回 ============ */
  P5.panels.recall = function () {
    var R = D.recall;
    var t = P5.tabs([
      {
        key: 'search', label: '检索',
        render: function () {
          var input;
          return [
            h('div.row', [
              (input = h('input.input', { id: 'p5-recall-q', placeholder: '输入关键词，例如：F-13 / 银粉 / 斗篷', 'aria-label': '召回关键词' })),
              P5.btn('召回', { variant: 'primary', icon: 'magnifier', onClick: function () {
                P5.notify.ok('召回完成', '命中 ' + R.results.length + ' 条，已按相关度排序。' + (input.value ? '查询词：' + input.value : ''));
              } })
            ]),
            h('div.panel-grid.panel-grid--3', [
              h('div.field', [h('label', { for: 'p5-recall-topk' }, '最大召回条目'), P5.range({ id: 'p5-recall-topk', min: 1, max: 12, value: R.topK, label: '最大召回条目' })]),
              h('div.field', [h('label', { for: 'p5-recall-th' }, '相似度阈值 0.62'), P5.range({ id: 'p5-recall-th', min: 30, max: 95, value: 62, label: '相似度阈值' })]),
              h('div.field', [h('label', { for: 'p5-recall-win' }, '检索区间（回合）'), P5.range({ id: 'p5-recall-win', min: 5, max: 200, value: R.window, label: '检索区间' })])
            ]),
            h('section.block', [
              P5.sectHead('召回预览', 'RETRIEVED', h('span.tag.tag--fixer', '将注入中段参考区')),
              h('div.col', R.results.map(function (r) {
                return h('div.row', { style: { alignItems: 'flex-start', gap: '10px', padding: '6px 0', borderBottom: '1px dashed color-mix(in srgb, var(--silver-4) 60%, transparent)' } }, [
                  h('span.mono', { style: { fontSize: 'var(--fs-3xs)', color: r.score > 0.8 ? 'var(--fixer-2)' : 'var(--silver-2)', minWidth: '34px' } }, r.score.toFixed(2)),
                  h('div.grow', [
                    h('div', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', color: 'var(--txt)' } }, r.tx),
                    h('div.mono', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--txt-3)' } }, r.src)
                  ])
                ]);
              }))
            ]),
            h('div.zod-note', { style: { color: 'var(--silver-2)', background: 'color-mix(in srgb, var(--cyan-3) 22%, transparent)', borderLeftColor: 'var(--cyan-2)' } }, [
              P5.icon('info', 14),
              h('span', '声明式披露：模型在上回合输出 recall 字段点名它想看的东西，系统本回合执行召回并注入——保留模型自主性，且不额外增加一次调用。')
            ])
          ];
        }
      },
      {
        key: 'cross', label: '交火模式',
        render: function () {
          return [
            h('div.row.row--between', [
              h('div', [
                h('div.setting-row__k', '启用交火模式（向量混合增强召回）'),
                h('div.setting-row__d', 'Embedding 粗筛 + Rerank 精排。需第三把 API key，对公益站用户是额外负担，默认关闭。')
              ]),
              P5.toggle('', R.crossfire, function (v) {
                P5.notify[v ? 'warn' : 'info'](v ? '交火模式已开启' : '交火模式已关闭',
                  v ? '每回合额外一次向量调用；RPM 紧张时会排队。' : '回落到关键词检索，零额外调用。');
              }, 'p5-recall-crossfire')
            ]),
            h('div.panel-grid.panel-grid--2', [
              h('div.field', [h('label', { for: 'p5-emb-model' }, 'Embedding 模型'), h('input.input', { id: 'p5-emb-model', value: 'Qwen3-Embedding-8B', readonly: true })]),
              h('div.field', [h('label', { for: 'p5-rerank-model' }, 'Rerank 模型'), h('input.input', { id: 'p5-rerank-model', value: 'bge-reranker-v2-m3', readonly: true })]),
              h('div.field', [h('label', { for: 'p5-emb-batch' }, '每批处理行数'), h('input.input.t-num', { id: 'p5-emb-batch', value: '64' })]),
              h('div.field', [h('label', { for: 'p5-emb-topk' }, '最终覆盖 TopK'), h('input.input.t-num', { id: 'p5-emb-topk', value: '5' })])
            ]),
            h('section.block', [
              P5.sectHead('数据管控', 'VECTOR STORE'),
              h('div.row.row--wrap', [
                P5.btn('智能同步', { size: 'sm', icon: 'refresh', onClick: function () { P5.notify.ok('同步完成', '新增 0 条向量（未启用）。'); } }),
                P5.btn('修复索引', { size: 'sm', icon: 'gear', onClick: function () { P5.notify.ok('索引正常', '无需修复。'); } }),
                P5.btn('清除本地向量', { size: 'sm', variant: 'danger', icon: 'trash', onClick: function () {
                  P5.notify.confirm({ title: '清除全部本地向量？', msg: '清除后需重新全量构建，长周目可能耗时数分钟。', danger: true, okText: '清除' })
                    .then(function (ok) { if (ok) P5.notify.ok('已清除', '向量特征库已置空。'); });
                } })
              ])
            ])
          ];
        }
      }
    ], { label: '记忆召回标签页', id: 'p5-tabs-recall' });
    return [t.bar, t.body];
  };

  /* ============ 10. 伏笔台账 ============ */
  P5.panels.threads = function () {
    var live = D.threads.filter(function (x) { return x.live; });
    var done = D.threads.filter(function (x) { return !x.live; });
    var t = P5.tabs([
      {
        key: 'live', label: '活跃',
        render: function () {
          return [
            h('div.row.row--between', [
              h('span.t-label', '注入上限 3—5 条。超出时按登记时间最旧者退出注入面（不删除）。'),
              h('span.tag.tag--cyan', live.length + ' / 5')
            ]),
            h('div.col', live.map(function (x, i) {
              return h('div.block', { style: { borderLeft: '2px solid var(--cyan)' } }, [
                h('div.row.row--between', [
                  h('span', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-xs)', color: 'var(--txt)' } }, x.tx),
                  h('span.tag', x.src)
                ]),
                h('div.row', [
                  h('span.tag' + (i < 3 ? '.tag--fixer' : ''), i < 3 ? '本回合注入' : '排队中'),
                  P5.btn('标记已揭晓', { size: 'sm', icon: 'check', onClick: function () {
                    P5.notify.ok('已归档', '「' + x.tx.slice(0, 12) + '…」移入已揭晓，不再占用注入面。');
                  } })
                ])
              ]);
            }))
          ];
        }
      },
      {
        key: 'done', label: '已揭晓',
        render: function () {
          return done.length ? h('div.col', done.map(function (x) {
            return h('div.lore-row', [
              h('span.lore-lamp', { dataset: { mode: 'off' } }),
              h('span.lore-row__tt', x.tx),
              h('span.lore-row__kw', x.src),
              h('span.tag.tag--fixer', '已揭晓')
            ]);
          })) : P5.emptyState('thread', '还没有揭晓任何伏笔。走下去，它们会自己浮出来。');
        }
      }
    ], { label: '伏笔台账标签页', id: 'p5-tabs-threads' });
    return [t.bar, t.body];
  };

  /* ============ 11. 档案馆 ============ */
  P5.panels.archive = function () {
    var t = P5.tabs([
      {
        key: 'tree', label: '节点树',
        render: function () {
          return [
            h('div.row.row--between', [
              h('span.t-label', '每个节点内联变量快照，可回溯 / 分支 / 重演。'),
              h('div.row', [
                P5.btn('手动存档', { size: 'sm', icon: 'save', onClick: function () { P5.notify.ok('已存档', '节点 R' + D.scene.round + ' 写入。'); } }),
                P5.btn('创建分支', { size: 'sm', icon: 'branch', onClick: function () { P5.notify.info('分支已创建', '从当前节点分出新世界线，原线保留。'); } })
              ])
            ]),
            h('div.tree', D.saves.map(function (n) {
              return h('div', [
                h('button.tree-node' + (n.depth ? '.tree-indent-' + Math.min(3, n.depth) : ''), {
                  type: 'button', id: 'p5-node-' + n.id,
                  dataset: { cur: n.cur ? 1 : 0, branch: n.branch ? 1 : 0 },
                  onclick: function () {
                    if (n.cur) { P5.notify.info('已是当前节点', n.meta); return; }
                    P5.notify.confirm({
                      title: '回溯到此节点？', icon: 'tree',
                      msg: '将回到「' + n.tx + '」（' + n.meta + '）。此后产生的节点保留为分支，不会被删除。',
                      okText: '回溯'
                    }).then(function (ok) { if (ok) P5.notify.ok('已回溯', n.meta + ' · 变量快照已恢复'); });
                  }
                }, [
                  h('span.tree-node__rail', h('span.tree-node__bullet')),
                  h('span.tree-node__tx', n.tx),
                  h('span.tree-node__meta', n.meta)
                ]),
                n.vars ? h('div.vars-snap', [
                  h('span.k', 'patch '),
                  h('span.v', n.vars)
                ]) : null
              ]);
            }))
          ];
        }
      },
      {
        key: 'backup', label: '备份',
        render: function () {
          return [
            h('div.setting-row', [
              h('div', [
                h('div.setting-row__k', '定期自动备份'),
                h('div.setting-row__d', '每 ' + D.settings.autosave + ' 回合一次，独立槽位，不覆盖手动存档。')
              ]),
              P5.toggle('', true, null, 'p5-autobackup')
            ]),
            h('div.col', D.backups.map(function (b) {
              return h('div.lore-row', [
                h('span.lore-lamp', { dataset: { mode: b.t.indexOf('尚未') === 0 ? 'off' : 'blue' } }),
                h('span.lore-row__tt', b.nm),
                h('span.lore-row__kw', b.t),
                P5.btn('加载', { size: 'sm', onClick: function () {
                  P5.notify.confirm({ title: '加载此备份？', msg: '当前未存档进度将丢失。', danger: true, okText: '加载' })
                    .then(function (ok) { if (ok) P5.notify.ok('已加载', b.nm); });
                } })
              ]);
            })),
            h('div.row.row--wrap', [
              P5.btn('导入存档文件', { size: 'sm', icon: 'upload', onClick: function () { P5.notify.info('导入存档', '支持本项目 JSON 与酒馆老卡存档（SefirotSave_*）。'); } }),
              P5.btn('导出全部', { size: 'sm', icon: 'download', onClick: function () { P5.notify.ok('已导出', '8 节点 + 3 备份，单文件 JSON。'); } }),
              P5.btn('清除所有存档', { size: 'sm', variant: 'danger', icon: 'trash', onClick: function () {
                P5.notify.confirm({ title: '清除所有存档？', msg: '包含 8 个节点与 3 份备份，此操作不可撤销。建议先导出。', danger: true, okText: '我已导出，清除' })
                  .then(function (ok) { if (ok) P5.notify.warn('已取消', '原型不执行破坏性操作。'); });
              } })
            ])
          ];
        }
      }
    ], { label: '档案馆标签页', id: 'p5-tabs-archive' });
    return [t.bar, t.body];
  };

  /* ============ 12. 占卜间 ============ */
  P5.panels.divination = function () {
    var V = D.divination;
    var t = P5.tabs([
      {
        key: 'tarot', label: '塔罗',
        render: function () {
          var cards = V.cards.map(function (c, i) {
            var wrap = h('div.tarot', { style: { flex: '1', minWidth: '0' } }, h('div.tarot__inner', [
              h('div.tarot__face.tarot__back', [
                h('div', { style: { display: 'grid', placeItems: 'center', gap: '6px' } }, [
                  P5.icon('astrolabe', 26),
                  h('span.t-eyebrow', c.pos)
                ])
              ]),
              h('div.tarot__face.tarot__front', [
                h('div.t-eyebrow', { style: { color: 'var(--ink-2)' } }, c.latin),
                h('div', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-lg)', fontWeight: '700' } }, c.name),
                h('div', { style: { width: '30px', height: '1px', background: 'currentColor', opacity: '.4', margin: '4px auto' } }),
                h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', lineHeight: '1.7' } }, c.tx)
              ])
            ]));
            wrap.tabIndex = 0;
            wrap.setAttribute('role', 'button');
            wrap.setAttribute('aria-label', '翻开第 ' + (i + 1) + ' 张牌：' + c.pos);
            function flip() {
              wrap.classList.toggle('is-flipped');
              P5.fx.play('plate');
            }
            wrap.addEventListener('click', flip);
            wrap.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
            return wrap;
          });
          return [
            h('section.block', [
              h('div.row.row--between', [
                h('div', [
                  h('div.t-eyebrow', '本次占问'),
                  h('div', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-sm)', color: 'var(--cyan-2)' } }, V.question)
                ]),
                h('span.tag.tag--cyan', '消耗灵性 ' + V.cost)
              ]),
              h('p', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--txt-3)', marginTop: '4px' } }, V.method + ' · 点击牌面翻开')
            ]),
            h('div.row', { style: { gap: '12px', alignItems: 'stretch' } }, cards),
            h('div.row.row--wrap', [
              P5.btn('全部翻开', { size: 'sm', icon: 'expand', onClick: function () {
                P5.$$('.tarot').forEach(function (x) { x.classList.add('is-flipped'); });
                P5.fx.play('chime');
              } }),
              P5.btn('重新起卦', { size: 'sm', variant: 'mystic', icon: 'refresh', onClick: function () {
                var sp = D.attrs.filter(function (x) { return x.key === 'spirit'; })[0];
                if (sp.cur < V.cost) { P5.notify.warn('灵性不足', '起卦需要 ' + V.cost + ' 点灵性。'); return; }
                sp.cur -= V.cost; P5.stage.refreshAttrs();
                P5.$$('.tarot').forEach(function (x) { x.classList.remove('is-flipped'); });
                P5.notify.mystic('已重新起卦', '灵性 −' + V.cost + '。占卜只揭示客观信息，不替你做决定。');
              } }),
              P5.btn('落档到编年史', { size: 'sm', icon: 'scroll', onClick: function () { P5.notify.ok('已落档', '占卜结果写入第 ' + D.scene.round + ' 回合小总结。'); } })
            ])
          ];
        }
      },
      {
        key: 'pend', label: '灵摆',
        render: function () {
          var pend = h('svg', { viewBox: '0 0 120 150', width: '120', height: '150', class: 'pendulum', 'aria-hidden': 'true' }, [
            h('line', { x1: 60, y1: 6, x2: 60, y2: 104, stroke: 'var(--silver-2)', 'stroke-width': 1 }),
            h('circle', { cx: 60, cy: 6, r: 3, fill: 'var(--silver)' }),
            h('path', { d: 'M52,104 L68,104 L60,132 Z', fill: 'none', stroke: 'var(--paper)', 'stroke-width': 1.4 }),
            h('circle', { cx: 60, cy: 112, r: 2, fill: 'var(--cyan-2)' })
          ]);
          return [
            h('div.row', { style: { justifyContent: 'center' } }, pend),
            h('section.block', [
              P5.sectHead('读数', 'READING'),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.9', color: 'var(--txt-2)' } }, V.pendulum),
              h('div.row', { style: { marginTop: '8px' } }, [
                P5.btn('静止读数', { size: 'sm', icon: 'target', onClick: function () {
                  pend.classList.remove('is-settling'); void pend.getBoundingClientRect(); pend.classList.add('is-settling');
                  P5.fx.play('chime');
                  global.setTimeout(function () { P5.notify.mystic('灵摆已静止', '偏向「未定」——这件事还没有被决定。'); }, 1200);
                } }),
                P5.btn('梦境法（需入睡）', { size: 'sm', onClick: function () { P5.notify.info('梦境法', '需在安全地点入睡，本回合不可用。'); } })
              ])
            ])
          ];
        }
      }
    ], { label: '占卜间标签页', id: 'p5-tabs-divination' });
    return [t.bar, t.body];
  };

  /* ============ 13. 战术推演 ============ */
  P5.panels.board = function () {
    var B = D.board;
    var sel = null;
    var board = h('div.board', { role: 'grid', 'aria-label': '六乘六战术棋盘' });
    var info = h('div.block', { style: { minHeight: '86px' } }, [
      h('div.t-eyebrow', '格位详情'),
      h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', color: 'var(--txt-2)', marginTop: '4px' } }, '点击棋盘格查看地形与单位。')
    ]);
    var TERRAIN = { plain: '空地', rubble: '瓦砾（掩护 +1，移动 −1）', water: '积水（移动 −2）', fog: '雾（视线 −2，旁听不受影响）', stage: '舞台（受注视，扮演法消化 +1）' };

    for (var i = 0; i < B.size * B.size; i++) {
      (function (idx) {
        var terr = B.terrain[idx];
        var unit = B.units.filter(function (u) { return u.at === idx; })[0];
        var cell = h('button.cell', {
          type: 'button', role: 'gridcell',
          dataset: { terrain: terr, sel: 0 },
          id: 'p5-cell-' + idx,
          'aria-label': '第 ' + (Math.floor(idx / 6) + 1) + ' 行第 ' + (idx % 6 + 1) + ' 列，' + TERRAIN[terr] + (unit ? '，' + unit.name : ''),
          onclick: function () {
            if (sel) sel.dataset.sel = 0;
            sel = cell; cell.dataset.sel = 1;
            P5.mount(info, [
              h('div.row.row--between', [
                h('span.t-eyebrow', 'R' + (Math.floor(idx / 6) + 1) + ' · C' + (idx % 6 + 1)),
                h('span.tag', TERRAIN[terr].split('（')[0])
              ]),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.8', color: 'var(--txt-2)', marginTop: '4px' } }, TERRAIN[terr]),
              unit ? h('div.row', { style: { marginTop: '6px' } }, [
                h('span.tag' + (unit.side === 'foe' ? '.tag--warn' : unit.side === 'self' ? '.tag--fixer' : '.tag--fixer'), unit.name),
                h('span.mono', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--txt-3)' } }, unit.hp),
                h('span.mono', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--silver-2)' } }, unit.act)
              ]) : null
            ]);
            P5.fx.play('tap');
          }
        }, unit ? h('span.unit', { dataset: { side: unit.side } }, unit.tag) : null);
        board.appendChild(cell);
      })(i);
    }

    var t = P5.tabs([
      {
        key: 'board', label: '棋盘',
        render: function () {
          return [
            h('div.row.row--between', [
              h('span.t-label', '模型担任战术引擎：审计玩家申报 + 指挥 NPC；地形与白名单由前端提供。'),
              h('span.tag.tag--fixer', '回合 2 · 待申报')
            ]),
            h('div.split', [
              h('div.col', [board, h('div.row.row--wrap', [
                P5.btn('开始战斗', { size: 'sm', variant: 'primary', icon: 'sword', onClick: function () { P5.notify.ok('已进入战术回合', '请在下方申报你的行动与所用能力。'); } }),
                P5.btn('结束回合', { size: 'sm', icon: 'check', onClick: function () { P5.notify.info('回合结束', 'NPC 行动规划将由模型给出。'); } }),
                P5.btn('撤离', { size: 'sm', variant: 'danger', icon: 'undo', onClick: function () {
                  P5.notify.confirm({ title: '撤离战场？', msg: '撤离将放弃本场推演，已造成的状态变化保留。', danger: true, okText: '撤离' })
                    .then(function (ok) { if (ok) P5.notify.warn('已撤离', '本场推演结束。'); });
                } })
              ])]),
              h('div.col', [
                info,
                h('div.block', [
                  h('div.t-eyebrow', { style: { marginBottom: '6px' } }, '在场单位'),
                  h('div.col', { style: { gap: '5px' } }, B.units.map(function (u) {
                    return h('div.row.row--between', { style: { fontSize: 'var(--fs-3xs)' } }, [
                      h('span.tag' + (u.side === 'foe' ? '.tag--warn' : u.side === 'self' ? '.tag--fixer' : '.tag--fixer'), u.tag),
                      h('span.grow', { style: { fontFamily: 'var(--f-serif)', color: 'var(--txt-2)' } }, u.name),
                      h('span.mono', { style: { color: 'var(--txt-3)' } }, u.hp)
                    ]);
                  }))
                ])
              ])
            ])
          ];
        }
      },
      {
        key: 'log', label: '战报',
        render: function () {
          return [
            h('div.row.row--between', [
              h('span.t-label', '战报由模型演绎，系统核验；越权申报入审计。'),
              P5.btn('复制战报', { size: 'sm', icon: 'copy', onClick: function () { P5.notify.ok('战报已复制', '6 行，可粘贴到编年史。'); } })
            ]),
            h('div.battle-log', B.log.map(function (l) {
              return h('div', { class: l.k === 'sys' ? 'sys' : l.k === 'hit' ? 'hit' : l.k === 'ok' ? 'ok' : '' }, '· ' + l.tx);
            }))
          ];
        }
      },
      {
        key: 'wl', label: '白名单',
        render: function () {
          return [
            h('p.t-label', '凡是此处没有写的能力，任何角色都不具备。'),
            h('div.whitelist', B.whitelist.map(function (w) { return h('span', w); })),
            h('div.zod-note', { style: { marginTop: '12px' } }, [
              P5.icon('alert', 14),
              h('span', '这是防幻觉的关键一环：没有白名单，模型会在战斗里发明能力。')
            ])
          ];
        }
      }
    ], { label: '战术推演标签页', id: 'p5-tabs-board' });
    return [t.bar, t.body];
  };

  /* ============ 14. 侦探案卷 ============ */
  P5.panels['case'] = function () {
    var C = D.caseFile;
    var boardEl = h('div.evidence-board', { role: 'group', 'aria-label': '证据连线板' });
    var svg = h('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    C.links.forEach(function (pair, i) {
      var a = C.cards[pair[0]], b = C.cards[pair[1]];
      var mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.1;
      var my = (a.y + b.y) / 2 - (b.x - a.x) * 0.1;
      svg.appendChild(h('path.ev-link', {
        d: 'M' + a.x + ',' + a.y + ' Q' + mx + ',' + my + ' ' + b.x + ',' + b.y,
        'vector-effect': 'non-scaling-stroke',
        style: { animationDelay: (i * 90) + 'ms' }
      }));
    });
    boardEl.appendChild(svg);
    C.cards.forEach(function (c, i) {
      boardEl.appendChild(h('button.ev-card', {
        type: 'button', id: 'p5-ev-' + i,
        dataset: { kind: c.kind },
        style: { left: c.x + '%', top: c.y + '%', '--rot': c.rot + 'deg' },
        onclick: function () { P5.notify.info(c.tt, c.tx); }
      }, [
        h('span.ev-card__pin'),
        h('div.ev-card__tt', c.tt),
        h('div.ev-card__tx', c.tx)
      ]));
    });

    var t = P5.tabs([
      {
        key: 'file', label: '卷宗',
        render: function () {
          return [
            h('div.stat-tiles', [
              P5.statTile('案件编号', C.code, C.title),
              P5.statTile('阶段', C.stage, '线索齐五条可结案', 'gas'),
              P5.statTile('核诡', '已抽取', '本案的不可解之处', 'mystic')
            ]),
            h('section.card-paper', [
              h('h4', '核诡'),
              h('p', { style: { fontSize: 'var(--fs-2xs)', lineHeight: '1.9', marginTop: '6px' } }, C.core)
            ]),
            h('section.block', [
              P5.sectHead('案情摘要', 'SYNOPSIS'),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.95', color: 'var(--txt-2)' } },
                '九月十一、十二、十三，翡翠剧院连续三个夜场散场后各有一名观众未曾离场。三人的入场记录都标注同一个座位——F 排十三号，一个自第五纪 1330 年起就没有卖出去过的位置。' +
                '后台地板留有银灰色粉末，自道具间立镜前一路拖到通往舞台的侧门，中途有一段被擦去，擦拭的方向朝着镜子。' +
                '舞台监督玛戈·希尔持有全部钥匙，三夜均由她签值班表，且只用左手扶过某物。')
            ]),
            h('section.block', [
              P5.sectHead('结案条件', 'REQUIREMENTS', h('span.tag.tag--fixer', '3 / 5')),
              h('div.col', { style: { gap: '4px' } }, [
                reqRow('确认三名失踪者共用座位 F-13', true),
                reqRow('取得后台银灰色粉末样本', true),
                reqRow('确认《灰雾之上》第三幕缺页', true),
                reqRow('取得第三幕替补演员名单', false),
                reqRow('确认镜后之声的来源', false)
              ])
            ]),
            h('div.row.row--wrap', [
              P5.btn('开始探案', { size: 'sm', variant: 'primary', icon: 'magnifier', onClick: function () { P5.notify.ok('探案开始', '本阶段将由模型分幕生成审问与勘查。'); } }),
              P5.btn('抽取核诡', { size: 'sm', variant: 'mystic', icon: 'cards', onClick: function () { P5.notify.mystic('核诡已抽取', C.core); } }),
              P5.btn('结案', { size: 'sm', icon: 'stamp', onClick: function () {
                P5.notify.confirm({ title: '现在结案？', msg: '线索仅收集 3/5，提前结案可能得到错误的真相，且不可重开。', danger: true, okText: '仍然结案' })
                  .then(function (ok) { if (ok) P5.notify.warn('结案已中止', '你决定再等一等。'); });
              } })
            ])
          ];
        }
      },
      { key: 'board', label: '线索板', render: function () { return [h('p.t-label', '拖不动的钉子和拉不断的线——点击卡片看详情。'), boardEl]; } },
      {
        key: 'suspect', label: '嫌疑',
        render: function () {
          return h('div.panel-grid.panel-grid--2', C.suspects.map(function (s) {
            return h('div.block', [
              h('div.row.row--between', [
                h('span', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-sm)', fontWeight: '700', color: 'var(--paper)' } }, s.nm),
                h('span.tag' + (s.level === '高' ? '.tag--warn' : s.level === '不可评估' ? '.tag--cyan' : ''), '嫌疑 ' + s.level)
              ]),
              P5.kvList([['动机', s.motive], ['证据', s.evidence]])
            ]);
          }));
        }
      }
    ], { label: '侦探案卷标签页', id: 'p5-tabs-case' });
    return [t.bar, t.body];
  };

  /* ============ 15. 领地经营 ============ */
  function reqRow(tx, done) {
    return h('div.row', { style: { gap: '8px', alignItems: 'flex-start', padding: '3px 0' } }, [
      h('span', { style: { color: done ? 'var(--fixer-2)' : 'var(--txt-3)', marginTop: '2px' } }, P5.icon(done ? 'check' : 'dot', 12)),
      h('span', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', color: done ? 'var(--txt)' : 'var(--txt-3)', textDecoration: done ? 'none' : 'none' } }, tx)
    ]);
  }

  P5.panels.domain = function () {
    var M = D.domain;
    var t = P5.tabs([
      {
        key: 'civil', label: '政务',
        render: function () {
          return [
            h('div.zod-note', { style: { color: 'var(--silver-2)', background: 'color-mix(in srgb, var(--cyan-3) 22%, transparent)', borderLeftColor: 'var(--cyan-2)' } }, [
              P5.icon('info', 14),
              h('span', '领地系统为预览态：解锁条件 = ' + M.unlockAt + '。界面已完整装配，数值待你真正拥有一块地方。')
            ]),
            h('div.stat-tiles', M.civil.map(function (c) { return P5.statTile(c.k, c.v, null); })),
            h('section.block', [
              P5.sectHead('解锁路径', 'UNLOCK PATH', h('span.tag', '1 / 3')),
              h('div.col', { style: { gap: '4px' } }, [
                reqRow('晋升至序列 6「催眠师」——当前序列 9', false),
                reqRow('或取得一处估值 ≥ 40 镑的实体产业——当前余额 3 镑 12 苏勒', false),
                reqRow('至少一位立场 ≥ +40 的相识——薇拉·凡恩 +46', true)
              ])
            ]),
            h('section.block', [
              P5.sectHead('若你拥有一块地方', 'PREVIEW'),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.95', color: 'var(--txt-2)' } },
                '政务页会追踪常住人口、月度税入、治安与民心四项，而这四项都由事件驱动，不由你点按钮加数字。' +
                '一场瘟疫会让治安与民心同时跌，税入要三个月后才反应过来；一次成功的救灾会让民心先涨，人口两季后才涨。' +
                '这是「活世界」在经营层的写法：你看到的是后果，看不到的是它算了多久。'),
              h('div.row.row--wrap', { style: { marginTop: '10px' } }, [
                h('span.tag', '人口 · 季度结算'),
                h('span.tag', '税入 · 月结算'),
                h('span.tag--warn.tag', '治安 · 事件即时'),
                h('span.tag--cyan.tag', '民心 · 事件即时 + 衰减')
              ])
            ]),
            h('div.row.row--wrap', [
              P5.btn('建立领地', { size: 'sm', variant: 'primary', icon: 'crown', onClick: function () { P5.notify.warn('尚不满足条件', M.unlockAt); } }),
              P5.btn('领地改名', { size: 'sm', icon: 'edit', onClick: function () { P5.notify.info('尚无领地可改名'); } })
            ])
          ];
        }
      },
      {
        key: 'army', label: '军团',
        render: function () {
          return [
            h('p.t-label', '编成、招募与出战。军演结果写入战报。'),
            P5.emptyState('shield', '尚无编成。一支军团至少需要一位愿意为你死的人——你现在连一位愿意为你说谎的人都没有。',
              P5.btn('查看招募条件', { size: 'sm', onClick: function () { P5.notify.info('招募条件', '需领地或稳定收入，且至少一位立场 ≥ +40 的相识。'); } }))
          ];
        }
      },
      {
        key: 'industry', label: '产业',
        render: function () {
          return [
            h('div.stat-tiles', [
              P5.statTile('产业总估值', '—', '尚无实体产业'),
              P5.statTile('产业数量', '0', '两项在构想中'),
              P5.statTile('预计月收益', '8—14 苏勒', '若专栏登上头版', 'ok')
            ]),
            h('div.domain-tiles', M.industry.map(function (x) {
              return h('div.domain-tile', [
                h('span.domain-tile__nm', x.nm),
                h('span.domain-tile__lv', x.lv),
                h('p', { style: { fontSize: 'var(--fs-3xs)', lineHeight: '1.6', color: 'var(--txt-3)' } }, x.note)
              ]);
            }))
          ];
        }
      },
      {
        key: 'corrupt', label: '污染',
        render: function () {
          return [
            h('section.block', [
              P5.sectHead('污染反噬', 'BACKLASH', h('span.tag.tag--warn', M.corruption.cur + '%')),
              P5.bar(M.corruption.cur, 'warn', true),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.9', color: 'var(--txt-2)', marginTop: '10px' } }, M.corruption.note)
            ]),
            h('div.row', [
              P5.btn('演算下一阶反噬', { size: 'sm', variant: 'danger', icon: 'skull', onClick: function () {
                P5.notify.valve('若失控达 <b>30%</b>，「一名沉默的观众」将替你决定「继续看下去」——那时你会失去一次行动权。', {
                  action: { label: '记入台账', onClick: function () { P5.notify.ok('已记入', '污染阈值提醒写入伏笔台账。'); } }
                });
              } })
            ])
          ];
        }
      }
    ], { label: '领地经营标签页', id: 'p5-tabs-domain' });
    return [t.bar, t.body];
  };

  /* ============ 16. 显影室 ============ */
  P5.panels.studio = function () {
    var I = D.imageStudio;
    var frame = h('div.develop-frame', [
      P5.icon('camera', 30),
      h('div.t-eyebrow', 'UNEXPOSED PLATE'),
      h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', maxWidth: '28ch', lineHeight: '1.7' } },
        '相纸已就位。原型不含后端，点击「送去显影」可看到完整的显影过程与反馈流程。')
    ]);
    return [
      h('div.row.row--between', [
        h('span.t-label', '一键生图：从最新正文抽提示词，交由绘图后端。'),
        h('span.tag.tag--cyan', '风格 · ' + I.current)
      ]),
      frame,
      h('div.panel-grid.panel-grid--2', [
        h('div.field', [h('label', { for: 'p5-img-style' }, '提示词套装'),
          h('select.select', { id: 'p5-img-style' }, I.presets.map(function (p) { return h('option', { selected: p === I.current ? true : null }, p); }))]),
        h('div.field', [h('label', { for: 'p5-img-size' }, '尺寸'),
          h('select.select', { id: 'p5-img-size' }, ['832 × 1216', '1216 × 832', '1024 × 1024'].map(function (s) { return h('option', { selected: s === I.size ? true : null }, s); }))])
      ]),
      h('div.field', [h('label', { for: 'p5-img-prompt' }, '正向提示词（已由本回合正文生成）'),
        h('textarea.textarea', { id: 'p5-img-prompt', rows: 5 }, I.prompt)]),
      h('div.field', [h('label', { for: 'p5-img-neg' }, '反向提示词'),
        h('textarea.textarea', { id: 'p5-img-neg', rows: 2 }, I.negative)]),
      h('div.row.row--wrap', [
        P5.btn('送去显影', { variant: 'primary', icon: 'camera', onClick: function () {
          P5.mount(frame, [h('span.developing'), h('div.t-eyebrow', { style: { marginTop: '10px' } }, 'DEVELOPING…')]);
          P5.notify.info('已送去显影', '原型无后端，3 秒后回到未曝光状态以演示失败回退。');
          global.setTimeout(function () {
            P5.mount(frame, [
              P5.icon('alert', 26),
              h('div.t-eyebrow', { style: { color: 'var(--safelight-2)' } }, 'NO BACKEND'),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', maxWidth: '30ch', lineHeight: '1.7' } },
                '未配置绘图后端。这是前端原型该有的诚实反馈：不假装成功，也不弹浏览器错误框。')
            ]);
            P5.notify.warn('显影失败', '未配置绘图后端（这是预期行为）。');
          }, 3000);
        } }),
        P5.btn('从最新正文重取提示词', { size: 'sm', icon: 'refresh', onClick: function () { P5.notify.ok('提示词已更新', '取自第 ' + D.scene.round + ' 回合正文。'); } }),
        P5.btn('另存为新套', { size: 'sm', icon: 'save', onClick: function () { P5.notify.ok('已另存', '套装「铜版蚀刻 · 冷银 (2)」已建立。'); } })
      ])
    ];
  };
})(window);
