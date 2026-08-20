/* ===========================================================
   panels-a.js —— 面板组 A：自身族 + 世界族
   角色卷宗 / 行囊与装备 / 能力簿 / 人物关系 / 王国舆图 / 图鉴 / 鲁恩日报
   =========================================================== */
(function (global) {
  'use strict';
  var P5 = global.P5 = global.P5 || {};
  var h = P5.h, D = P5.data;
  P5.panels = P5.panels || {};

  /* ============ 1. 角色卷宗 ============ */
  P5.panels.dossier = function () {
    var pc = D.pc;
    var t = P5.tabs([
      {
        key: 'attr', label: '属性',
        render: function () {
          return [
            h('div.stat-tiles', [
              P5.statTile('序列', String(pc.sequence), pc.pathway + ' 途径 · ' + pc.seqName, 'gas'),
              P5.statTile('消化进度', pc.digest + '%', pc.system, 'mystic'),
              P5.statTile('失控', pc.corruption + '%', '超 30% 将被接管', 'warn'),
              P5.statTile('周目', '第 ' + pc.cycle, '回合 ' + D.scene.round)
            ]),
            h('section.block', [
              P5.sectHead('六维明细', 'VITAL COLUMNS'),
              h('div.col', { style: { gap: '7px' } }, D.attrs.map(function (a) {
                return h('div.merc-row', { dataset: { attr: a.key } }, [
                  h('span.merc-row__name', a.zh),
                  h('div.merc-row__track', { style: { '--fill': P5.pct(a.cur, a.max) + '%' } }),
                  h('span.merc-row__val', a.cur + ' / ' + a.max)
                ]);
              }))
            ]),
            h('section.block', [
              P5.sectHead('晋升进程', 'DIGESTION'),
              h('div.row', { style: { gap: '16px' } }, [
                P5.arcMeter(pc.digest, 100, 76, 'mystic', pc.digest + '%'),
                h('div.grow', [
                  h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.85', color: 'var(--txt-2)' } },
                    '扮演法「一名沉默的观众」：坐在暗处、不出声、只看。每一次你在旁人注视下主动引导话题，消化停滞并累积失控。'),
                  h('div.row', { style: { marginTop: '8px' } }, [
                    h('span.tag.tag--cyan', '消化 ' + pc.digest + '%'),
                    h('span.tag.tag--warn', '失控 ' + pc.corruption + '%')
                  ])
                ])
              ])
            ]),
            h('section.block', [
              P5.sectHead('来历', 'ORIGIN'),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.92', color: 'var(--txt-2)' } }, pc.bio)
            ])
          ];
        }
      },
      {
        key: 'trait', label: '特性',
        render: function () {
          return [
            h('section', [
              P5.sectHead('非凡特性', 'EXTRAORDINARY', h('span.tag.tag--cyan', String(D.traits.extraordinary.length) + ' 项')),
              h('div.panel-grid.panel-grid--2', D.traits.extraordinary.map(function (x) {
                return h('div.abil', [
                  h('div.abil__hd', [h('span.abil__nm', x.name), h('span.tag.tag--cyan', x.tier)]),
                  h('p.abil__ds', x.desc)
                ]);
              }))
            ]),
            h('section', [
              P5.sectHead('天赋', 'TALENTS', h('span.tag', String(D.traits.talents.length) + ' 项')),
              h('div.panel-grid.panel-grid--2', D.traits.talents.map(function (x) {
                return h('div.block', [
                  h('div.row.row--between', [
                    h('span', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-xs)', fontWeight: '700', color: 'var(--paper)' } }, x.name),
                    h('span.tag' + (x.tier === '稀有' ? '.tag--fixer' : ''), x.tier)
                  ]),
                  h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', lineHeight: '1.75', color: 'var(--txt-2)' } }, x.desc)
                ]);
              }))
            ])
          ];
        }
      },
      {
        key: 'state', label: '状态',
        render: function () {
          return [
            h('section.block', [
              P5.sectHead('生效中', 'ACTIVE'),
              h('div.col', { style: { gap: '8px' } }, [
                stateRow('旁听', '被动生效。三步内的表层心念可闻。', 'mystic', '持续'),
                stateRow('疲劳 · 轻', '连续第三个夜班。敏捷检定 −1。', 'warn', '至次日'),
                stateRow('不合时宜的同情', '面对示弱者时说服 −2。', null, '天赋固有')
              ])
            ]),
            h('section.block', [
              P5.sectHead('污染反噬曲线', 'BACKLASH'),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.85', color: 'var(--txt-2)' } },
                '失控每增 10%，「一名沉默的观众」对你的行为选择拥有一次否决权。达 30% 时，它会替你决定「继续看下去」。'),
              h('div.col', { style: { gap: '6px', marginTop: '8px' } }, [
                h('div.row.row--between', [h('span.t-eyebrow', '当前'), h('span.mono.t-warn', pc.corruption + '% / 100%')]),
                P5.bar(pc.corruption, 'warn'),
                h('div.row', [h('span.tag', '10% 否决 ×1'), h('span.tag', '20% 否决 ×2'), h('span.tag--warn.tag', '30% 接管')])
              ])
            ])
          ];
        }
      }
    ], { label: '角色卷宗标签页', id: 'p5-tabs-dossier' });
    return [t.bar, t.body];
  };

  function stateRow(nm, ds, tone, dur) {
    return h('div.row', { style: { alignItems: 'flex-start', gap: '10px' } }, [
      h('span.tag' + (tone ? '.tag--' + tone : ''), nm),
      h('div.grow', [
        h('div', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', lineHeight: '1.7', color: 'var(--txt-2)' } }, ds)
      ]),
      h('span.mono', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--txt-3)' } }, dur)
    ]);
  }

  /* ============ 2. 行囊与装备 ============ */
  P5.panels.inventory = function () {
    var t = P5.tabs([
      {
        key: 'kit', label: '装备',
        render: function () {
          return [
            h('p.t-label', '五个通用槽位不限类别；第六个为扮演法专属槽。'),
            h('div.panel-grid.panel-grid--2', D.equipment.map(function (e, i) {
              return h('div.block', { style: { borderLeft: '2px solid ' + (e.filled ? 'color-mix(in srgb, var(--silver) 52%, transparent)' : 'color-mix(in srgb, var(--silver-4) 90%, transparent)') } }, [
                h('div.row.row--between', [
                  h('div.row', [P5.icon(e.icon, 14), h('span', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-xs)', fontWeight: '700', color: e.filled ? 'var(--paper)' : 'var(--txt-3)' } }, e.filled ? e.name : '空槽位 ' + (i + 1))]),
                  h('span.tag', e.kind)
                ]),
                h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', lineHeight: '1.75', color: 'var(--txt-2)' } }, e.desc),
                e.filled ? h('div.row', [
                  P5.btn('卸下', { size: 'sm', onClick: function () { P5.notify.info('已卸下', e.name + ' 回到行囊。') } }),
                  P5.btn('查看档案', { size: 'sm', onClick: function () { P5.docket.open('codex', this); } })
                ]) : P5.btn('从行囊装配', { size: 'sm', icon: 'plus', onClick: function () { P5.notify.info('选择物品', '从「物品」页签中挑一件放进此槽。') } })
              ]);
            })),
            h('section.block', { style: { borderColor: 'color-mix(in srgb, var(--cyan) 46%, transparent)' } }, [
              P5.sectHead('扮演法槽', 'ROLEPLAY SLOT', h('span.tag.tag--cyan', '专属')),
              h('div.row.row--between', [
                h('div', [
                  h('div', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-sm)', fontWeight: '700', color: 'var(--cyan-2)' } }, D.roleplaySlot.name),
                  h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', lineHeight: '1.75', color: 'var(--txt-2)', marginTop: '4px' } }, D.roleplaySlot.desc)
                ]),
                P5.arcMeter(D.roleplaySlot.digest, 100, 58, 'mystic', D.roleplaySlot.digest + '%')
              ])
            ])
          ];
        }
      },
      {
        key: 'items', label: '物品',
        render: function () {
          var grid = h('div.item-grid', D.inventory.map(function (it, i) {
            return h('button.item-cell', {
              type: 'button', id: 'p5-item-' + i, dataset: { rarity: it.rarity },
              onclick: function () { P5.notify.info(it.name, it.desc); }
            }, [
              h('div.row.row--between', [h('span.item-cell__nm', it.name), h('span.item-cell__qt', '×' + it.qty)]),
              h('span.item-cell__ds', it.desc.length > 34 ? it.desc.slice(0, 34) + '…' : it.desc),
              h('span.tag' + (it.rarity === 'rare' ? '.tag--cyan' : it.rarity === 'sealed' ? '.tag--warn' : ''),
                it.rarity === 'rare' ? '非凡' : it.rarity === 'sealed' ? '封印' : '寻常')
            ]);
          }));
          return [
            h('div.row.row--between', [
              h('span.t-label', '共 ' + D.inventory.length + ' 类物品'),
              h('div.row', [
                P5.btn('批量删除', { size: 'sm', variant: 'danger', icon: 'trash', onClick: function () {
                  P5.notify.confirm({ title: '批量删除物品？', msg: '删除后无法从本回合恢复，需回退到上一节点。', danger: true, okText: '删除选中' })
                    .then(function (ok) { if (ok) P5.notify.ok('已删除 0 件', '未选中任何物品。'); });
                } }),
                P5.btn('导出清单', { size: 'sm', icon: 'download', onClick: function () { P5.notify.ok('清单已生成', '16 类物品，可粘贴至世界书条目。'); } })
              ])
            ]),
            grid
          ];
        }
      },
      {
        key: 'ledger', label: '账本',
        render: function () {
          var b = D.ledger.balance;
          return [
            h('div.stat-tiles', [
              P5.statTile('余额', b.pound + ' 镑 ' + b.soli + ' 苏勒 ' + b.penny + ' 便士', '1 镑 = 20 苏勒 = 240 便士', 'gas'),
              P5.statTile('本周进项', '1 镑 22 苏勒', '稿费 + 夜工', 'ok'),
              P5.statTile('本周支出', '5 镑 13 苏勒', '房租 · 药费 · 押金', 'warn')
            ]),
            h('section.block', [
              P5.sectHead('流水', 'LEDGER', h('span.tag', '模型提案 · 系统记账')),
              h('table.ledger', [
                h('thead', h('tr', [h('th', '日期'), h('th', '事项'), h('th', '金额')])),
                h('tbody', D.ledger.rows.map(function (r) {
                  return h('tr', [
                    h('td', r.t),
                    h('td', r.item),
                    h('td', { class: r.io === 'in' ? 'in' : 'out' }, (r.io === 'in' ? '+ ' : '− ') + r.v)
                  ]);
                }))
              ]),
              h('p', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--txt-3)', lineHeight: '1.7', marginTop: '8px' } },
                '记账权在系统。模型只能提出「花了多少」，由前端核验余额后落账——这样模型无法凭空变出钱。')
            ])
          ];
        }
      }
    ], { label: '行囊标签页', id: 'p5-tabs-inventory' });
    return [t.bar, t.body];
  };

  /* ============ 3. 能力簿 ============ */
  P5.panels.abilities = function () {
    var t = P5.tabs([
      {
        key: 'own', label: '已掌握',
        render: function () {
          return [
            h('p.t-label', '观众途径 · 序列 9。能力上限受序列限制，越权申报将被战术推演驳回。'),
            h('div.panel-grid.panel-grid--2', D.abilities.filter(function (a) { return !a.locked; }).map(function (a) {
              return h('div.abil', [
                h('div.abil__hd', [h('span.abil__nm', a.name), h('span.tag', a.tag)]),
                h('p.abil__ds', a.desc),
                h('div.row.row--between', [
                  h('span.abil__cost', '消耗 ' + a.cost),
                  h('span.mono', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--txt-3)' } }, '冷却 ' + a.cd)
                ]),
                P5.btn('写入行动栏', { size: 'sm', block: true, icon: 'send', onClick: function () {
                  var ta = P5.$('#p5-input');
                  if (ta) { ta.value = '使用能力：' + a.name; ta.focus(); }
                  P5.notify.ok('已写入行动栏', a.name + '（' + a.cost + '）');
                } })
              ]);
            }))
          ];
        }
      },
      {
        key: 'lock', label: '封锁',
        render: function () {
          var locked = D.abilities.filter(function (a) { return a.locked; });
          return [
            h('p.t-label', '封锁来自序列限制或世界书能力白名单未放行。到期自动回收。'),
            locked.length ? h('div.panel-grid.panel-grid--2', locked.map(function (a) {
              return h('div.abil', { dataset: { locked: 1 } }, [
                h('div.abil__hd', [h('span.abil__nm', a.name), h('span.tag.tag--warn', a.tag)]),
                h('p.abil__ds', a.desc),
                h('div.row', [P5.icon('lock', 12), h('span.mono', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--safelight-2)' } }, '需晋升至序列 8')])
              ]);
            })) : P5.emptyState('unlock', '当前没有被封锁的能力。')
          ];
        }
      },
      {
        key: 'white', label: '白名单',
        render: function () {
          return [
            h('section.block', [
              P5.sectHead('战斗能力白名单', 'ABILITY WHITELIST', h('span.tag.tag--fixer', '防幻觉')),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.85', color: 'var(--txt-2)' } },
                '注入战术推演的能力清单。凡是此处没有写的能力，任何角色都不具备——模型若申报越权能力，系统驳回并记入审计。'),
              h('div.whitelist', { style: { marginTop: '10px' } }, D.board.whitelist.map(function (w) { return h('span', w); }))
            ]),
            h('section.block', [
              P5.sectHead('审计记录', 'AUDIT'),
              h('div.battle-log', [
                h('div', [h('span.sys', 'R6 '), '玩家申报「读心者·深潜」→ ', h('span.hit', '驳回'), '（序列 9 不具备）']),
                h('div', [h('span.sys', 'R7 '), '玩家申报「旁听」→ ', h('span.ok', '通过'), '（白名单内，灵性充足）'])
              ])
            ])
          ];
        }
      }
    ], { label: '能力簿标签页', id: 'p5-tabs-abilities' });
    return [t.bar, t.body];
  };

  /* ============ 4. 人物关系 ============ */
  P5.panels.relations = function () {
    var t = P5.tabs([
      {
        key: 'rel', label: '关系',
        render: function () {
          return [
            h('div.row.row--between', [
              h('span.t-label', '好感（纵向亲近）与立场（横向敌友）双轴，互不换算。'),
              P5.btn('快速互动', { size: 'sm', icon: 'heart', variant: 'mystic', onClick: function () {
                P5.notify.mystic('快速互动', '选择一位在场者进行一次不推进主线的短互动。原型中此处仅展示界面反馈。');
              } })
            ]),
            h('div.panel-grid.panel-grid--2', D.relations.map(function (r) {
              return h('div.rel-card', [
                h('span.rel-card__av', r.sigil),
                h('div', [
                  h('div.row.row--between', [
                    h('div', [h('div.rel-card__nm', r.name), h('div.rel-card__rl', r.role)]),
                    h('span.tag' + (r.mood === '隐瞒' ? '.tag--warn' : r.mood === '不可读' ? '.tag--warn' : ''), r.mood)
                  ]),
                  h('div.rel-axes', [
                    axis('好感', r.affinity),
                    axis('立场', r.stance)
                  ]),
                  h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', lineHeight: '1.72', color: 'var(--txt-2)', marginTop: '6px' } }, r.note),
                  r.whisper ? P5.btn('旁听心声（灵性 1）', {
                    size: 'sm', variant: 'mystic', icon: 'eye',
                    onClick: function () {
                      var sp = D.attrs.filter(function (x) { return x.key === 'spirit'; })[0];
                      if (sp.cur < 1) { P5.notify.warn('灵性不足', '旁听需要一点灵性。'); return; }
                      sp.cur -= 1; P5.stage.refreshAttrs(); P5.fx.play('mercury');
                      P5.notify.mystic('心声 · ' + r.name, r.whisper);
                    }
                  }) : h('span.tag.tag--warn', '不可读')
                ])
              ]);
            }))
          ];
        }
      },
      {
        key: 'grudge', label: '恩怨账',
        render: function () {
          return [
            h('section.block', [
              P5.sectHead('未结清', 'OUTSTANDING'),
              h('div.timeline', [
                tl('R5', '费尔南压下第三篇稿件', '你把稿子折了四折。立场 −8。', false),
                tl('R6', '玛戈在门房簿前挡住你', '她说「记者不该进后台」，却没有赶你走。立场 −28，好感 +14。', true),
                tl('R4', '母亲替你缝好了外套内衬', '她多缝了两个口袋，说「万一你要藏东西」。好感 +88。', false)
              ])
            ]),
            h('section.block', [
              P5.sectHead('人情', 'FAVOURS'),
              P5.kvList([
                ['老图恩 · 一瓶麦酒', '未兑现'],
                ['巡警 · 联络卡', '未使用'],
                ['塞西莉亚 · 一场后台旁听', '已兑现（R6）']
              ])
            ])
          ];
        }
      }
    ], { label: '人物关系标签页', id: 'p5-tabs-relations' });
    return [t.bar, t.body];
  };

  function axis(k, v) {
    var neg = v < 0;
    return h('div.rel-axis', [
      h('span.rel-axis__k', k),
      h('div.rel-axis__track', h('i', { dataset: { neg: neg ? 1 : 0 }, style: { '--w': Math.min(50, Math.abs(v) / 2) + '%' } })),
      h('span.rel-axis__v', (v > 0 ? '+' : '') + v)
    ]);
  }

  function tl(t, tt, tx, key) {
    return h('div.tl-item', { dataset: { key: key ? 1 : 0 } }, [
      h('div.tl-item__t', t),
      h('div.tl-item__tt', tt),
      h('div.tl-item__tx', tx)
    ]);
  }

  /* ============ 5. 王国舆图 ============ */
  P5.panels.map = function () {
    var mz = 1, mx = 0, my = 0;
    var pan = h('div.map-pan', { style: { '--mz': 1, '--mx': '0px', '--my': '0px' } });

    /* 蓝晒底图：河流、道路、街区 */
    pan.appendChild(h('svg', { viewBox: '0 0 100 62', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, [
      h('path.map-water', { d: 'M0,46 C14,42 22,50 34,47 C48,43 58,52 72,48 C84,44 92,50 100,47 L100,62 L0,62 Z' }),
      h('path.map-ink', { d: 'M8,10 L36,8 L40,24 L12,27 Z' }),
      h('path.map-ink', { d: 'M44,6 L74,10 L70,26 L42,23 Z' }),
      h('path.map-ink', { d: 'M78,12 L96,16 L94,30 L76,27 Z' }),
      h('path.map-ink', { d: 'M14,30 L44,27 L48,42 L18,44 Z' }),
      h('path.map-ink', { d: 'M52,28 L82,31 L78,44 L50,42 Z' }),
      h('path.map-road', { d: 'M2,26 L98,29' }),
      h('path.map-road', { d: 'M46,2 L50,60' }),
      h('path.map-road', { d: 'M20,4 L26,58' }),
      h('path.map-road', { d: 'M74,4 L78,58' })
    ]));

    D.map.landmarks.forEach(function (lm, i) {
      pan.appendChild(h('button.map-pin', {
        type: 'button', id: 'p5-pin-' + i,
        dataset: { here: lm.here ? 1 : 0, locked: lm.locked ? 1 : 0 },
        style: { left: lm.x + '%', top: lm.y + '%' },
        title: lm.note,
        onclick: function () {
          if (lm.locked) { P5.notify.warn(lm.name, '此处尚未解锁：' + lm.note); return; }
          P5.notify.info(lm.name, lm.note + (lm.here ? '（你就在这里）' : ''));
        }
      }, [h('span.map-pin__dot'), h('span.map-pin__lb', lm.name)]));
    });

    /* 迷雾未探索区 */
    pan.appendChild(h('div.map-fog', { style: { left: '2%', top: '60%', width: '30%', height: '46%' } }));
    pan.appendChild(h('div.map-fog', { style: { left: '72%', top: '62%', width: '32%', height: '44%' } }));

    function apply() { pan.style.setProperty('--mz', mz); pan.style.setProperty('--mx', mx + 'px'); pan.style.setProperty('--my', my + 'px'); }

    var frame = h('div.map-frame', { role: 'application', 'aria-label': '廷根市舆图，可拖拽平移与缩放' }, [
      pan,
      h('div.map-tools', [
        P5.iconBtn('plus', { id: 'p5-map-zoomin', title: '放大', size: 13, onClick: function () { mz = P5.clamp(mz + 0.25, 0.75, 2.5); apply(); } }),
        P5.iconBtn('minus', { id: 'p5-map-zoomout', title: '缩小', size: 13, onClick: function () { mz = P5.clamp(mz - 0.25, 0.75, 2.5); apply(); } }),
        P5.iconBtn('refresh', { id: 'p5-map-reset', title: '重置视图', size: 13, onClick: function () { mz = 1; mx = 0; my = 0; apply(); P5.notify.info('视图已重置'); } })
      ])
    ]);

    var dragging = false, sx = 0, sy = 0, bx = 0, by = 0;
    frame.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.map-pin,.icon-btn')) return;
      dragging = true; sx = e.clientX; sy = e.clientY; bx = mx; by = my;
      frame.setPointerCapture(e.pointerId);
    });
    frame.addEventListener('pointermove', P5.rafThrottle(function (e) {
      if (!dragging) return;
      mx = bx + (e.clientX - sx); my = by + (e.clientY - sy); apply();
    }));
    frame.addEventListener('pointerup', function () { dragging = false; });
    frame.addEventListener('pointercancel', function () { dragging = false; });

    return [
      h('div.row.row--between', [
        h('span.t-label', D.map.region),
        h('div.row', [h('span.tag.tag--fixer', '当前：翡翠剧院'), h('span.tag', '8 地标 · 2 未探索')])
      ]),
      frame,
      h('section.block', [
        P5.sectHead('地标名录', 'GAZETTEER'),
        h('div.panel-grid.panel-grid--2', D.map.landmarks.map(function (lm) {
          return h('button.codex-card', {
            type: 'button', dataset: { locked: lm.locked ? 1 : 0 },
            onclick: function () { P5.notify.info(lm.name, lm.note); }
          }, [
            h('span.codex-card__sig', P5.icon(lm.locked ? 'lock' : lm.here ? 'pin' : 'door', 15)),
            h('div', [h('div.codex-card__tt', lm.name), h('div.codex-card__ds', lm.note)])
          ]);
        }))
      ])
    ];
  };

  /* ============ 6. 图鉴 ============ */
  P5.panels.codex = function () {
    function grid(list) {
      return h('div.panel-grid.panel-grid--2', list.map(function (c) {
        return h('button.codex-card', {
          type: 'button', dataset: { locked: c.locked ? 1 : 0 },
          onclick: function () {
            if (c.locked) { P5.notify.warn('尚未解锁', '「' + c.tt + '」需要更多线索才会显影。'); return; }
            P5.notify.info(c.tt, c.ds);
          }
        }, [
          h('span.codex-card__sig', P5.icon(c.locked ? 'lock' : 'dot', 14)),
          h('div', [h('div.codex-card__tt', c.tt), h('div.codex-card__ds', c.ds)])
        ]);
      }));
    }
    var counts = D.codex.person.length + D.codex.place.length + D.codex.item.length + D.codex.occult.length;
    var t = P5.tabs([
      { key: 'p', label: '人物', render: function () { return grid(D.codex.person); } },
      { key: 'l', label: '地点', render: function () { return grid(D.codex.place); } },
      { key: 'i', label: '物品', render: function () { return grid(D.codex.item); } },
      { key: 'o', label: '神秘学', render: function () { return grid(D.codex.occult); } },
      {
        key: 'w', label: '途径阶梯',
        render: function () {
          return [
            h('p.t-label', '观众途径。序列 2—0 未见于任何可查记载。'),
            h('div.ladder', D.codex.pathway.map(function (s) {
              return h('div.ladder__step', { dataset: { cur: s.cur ? 1 : 0, unknown: s.unknown ? 1 : 0 } }, [
                h('span.ladder__n', String(s.n)),
                h('span.ladder__nm', s.nm),
                s.cur ? h('span.tag.tag--fixer', '当前') : (s.unknown ? h('span.tag.tag--warn', '未记载') : h('span.tag', '待晋升'))
              ]);
            }))
          ];
        }
      }
    ], { label: '图鉴标签页', id: 'p5-tabs-codex' });
    return [
      h('div.row.row--between', [
        h('span.t-label', '已收录 ' + counts + ' 条，其中 5 条待解锁'),
        h('div.row', [P5.btn('检索', { size: 'sm', icon: 'magnifier', onClick: function () { P5.notify.info('检索图鉴', '在输入框写下关键词，或直接从上方页签浏览。'); } })])
      ]),
      t.bar, t.body
    ];
  };

  /* ============ 7. 鲁恩日报 ============ */
  P5.panels.news = function () {
    var t = P5.tabs([
      {
        key: 'today', label: '今日',
        render: function () {
          return h('div.news-sheet', [
            h('div.news-sheet__masthead', [
              h('div.zh', D.news.masthead),
              h('div.en', D.news.latin),
              h('div.news-sheet__meta', [
                h('span', D.news.date),
                h('span', D.news.issue),
                h('span', D.news.price)
              ])
            ]),
            h('div.news-cols', [
              h('article.news-item', [
                h('h4.news-item__hd.news-item__hd--lead', D.news.lead.hd),
                h('div.news-item__by', D.news.lead.by),
                h('p.news-item__tx', D.news.lead.tx)
              ]),
              D.news.briefs.map(function (b) {
                return h('article.news-item.news-item--brief', [
                  h('h4.news-item__hd', b.hd),
                  h('div.news-item__by', b.by),
                  h('p.news-item__tx', b.tx)
                ]);
              })
            ])
          ]);
        }
      },
      {
        key: 'archive', label: '往期',
        render: function () {
          return [
            h('p.t-label', '报纸是「活世界」的感知通道：你不在场的地方也在发生事。'),
            h('div.col', D.news.archive.map(function (a) {
              return h('button.lore-row', {
                type: 'button',
                onclick: function () { P5.notify.info(a.date + ' 头条', a.hd); }
              }, [
                h('span.lore-lamp', { dataset: { mode: 'blue' } }),
                h('span.lore-row__tt', a.hd),
                h('span.lore-row__kw', a.date),
                P5.icon('chevronRight', 12)
              ]);
            }))
          ];
        }
      }
    ], { label: '日报标签页', id: 'p5-tabs-news' });
    return [t.bar, t.body];
  };
})(window);
