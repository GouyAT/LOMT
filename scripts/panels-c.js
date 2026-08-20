/* ===========================================================
   panels-c.js —— 面板组 C：酒馆族 + 系统族
   世界书 / 上下文合成器 / 模型与管线 / 变量工坊 / 信札 / 台务设置
   =========================================================== */
(function (global) {
  'use strict';
  var P5 = global.P5 = global.P5 || {};
  var h = P5.h, D = P5.data;
  P5.panels = P5.panels || {};

  /* ============ 17. 世界书 ============ */
  P5.panels.lorebook = function () {
    var books = D.lorebooks;
    var cur = 0;
    var listHost = h('div.col');
    var editorHost = h('div.col');

    function renderList() {
      P5.clear(listHost);
      var b = books[cur];
      if (!b.rows.length) {
        listHost.appendChild(P5.emptyState('archive', '这本书是归档态，条目未载入内存。启用后才会解析。',
          P5.btn('载入并启用', { size: 'sm', onClick: function () { P5.notify.info('归档书未载入', '34 条条目来自旧卡迁入，需先做别名洗白。'); } })));
        return;
      }
      b.rows.forEach(function (r, i) {
        listHost.appendChild(h('button.lore-row', {
          type: 'button', id: 'p5-lore-' + cur + '-' + i,
          onclick: function () { renderEditor(r); }
        }, [
          h('span.lore-lamp', { dataset: { mode: r.mode }, title: r.mode === 'blue' ? '蓝灯：常驻注入' : r.mode === 'green' ? '绿灯：关键词触发' : '已停用' }),
          h('div', { style: { textAlign: 'left', minWidth: 0 } }, [
            h('div.lore-row__tt', r.tt),
            h('div.lore-row__kw', r.kw)
          ]),
          h('span.lore-row__pos', r.pos),
          P5.icon('chevronRight', 12)
        ]));
      });
    }

    function renderEditor(r) {
      P5.mount(editorHost, [
        P5.sectHead(r.tt, 'ENTRY'),
        h('div.panel-grid.panel-grid--2', [
          h('div.field', [h('label', { for: 'p5-lore-mode' }, '触发模式'),
            h('select.select', { id: 'p5-lore-mode' }, [
              h('option', { selected: r.mode === 'blue' ? true : null }, '蓝灯 · 常驻注入'),
              h('option', { selected: r.mode === 'green' ? true : null }, '绿灯 · 关键词触发'),
              h('option', { selected: r.mode === 'off' ? true : null }, '停用')
            ])]),
          h('div.field', [h('label', { for: 'p5-lore-pos' }, '注入位置'),
            h('select.select', { id: 'p5-lore-pos' }, ['D0（最强，系统首部）', 'D4', 'D6', 'D8', '角色定义之后'].map(function (p) {
              return h('option', { selected: p.indexOf(r.pos) === 0 ? true : null }, p);
            }))])
        ]),
        h('div.field', [h('label', { for: 'p5-lore-kw' }, '关键词（逗号分隔，建议 3—5 个）'),
          h('input.input', { id: 'p5-lore-kw', value: r.kw })]),
        h('div.field', [h('label', { for: 'p5-lore-body' }, '条目内容'),
          h('textarea.textarea', { id: 'p5-lore-body', rows: 5 }, r.desc)]),
        h('div.panel-grid.panel-grid--2', [
          h('div.col', [
            P5.toggle('可被递归触发', true, null, 'p5-lore-rec1'),
            P5.toggle('可触发其他条目', false, null, 'p5-lore-rec2')
          ]),
          h('div.col', [
            h('div.field', [h('label', { for: 'p5-lore-order' }, '同位置排序权重'), h('input.input.t-num', { id: 'p5-lore-order', value: '100' })])
          ])
        ]),
        h('div.row.row--wrap', [
          P5.btn('保存条目', { size: 'sm', variant: 'primary', icon: 'save', onClick: function () { P5.notify.ok('条目已保存', r.tt); } }),
          P5.btn('复制', { size: 'sm', icon: 'copy', onClick: function () { P5.notify.ok('已复制', r.tt + '（副本）'); } }),
          P5.btn('删除', { size: 'sm', variant: 'danger', icon: 'trash', onClick: function () {
            P5.notify.confirm({ title: '删除此条目？', msg: '「' + r.tt + '」将从本书移除。可从导出文件恢复。', danger: true, okText: '删除' })
              .then(function (ok) { if (ok) P5.notify.warn('已取消', '原型不执行破坏性操作。'); });
          } })
        ]),
        h('div.zod-note', { style: { color: 'var(--silver-2)', background: 'color-mix(in srgb, var(--cyan-3) 22%, transparent)', borderLeftColor: 'var(--cyan-2)' } }, [
          P5.icon('info', 14),
          h('span', 'U 型注意力：D0 与最尾部注意力最高，中段最易被忽略。强规则放 D0，参考资料放中段。')
        ])
      ]);
    }

    var t = P5.tabs([
      {
        key: 'entries', label: '条目',
        render: function () {
          var tabsBooks = h('div.row.row--wrap', books.map(function (b, i) {
            return h('button.tag' + (i === cur ? '.tag--fixer' : ''), {
              type: 'button', id: 'p5-book-' + i,
              style: { cursor: 'pointer' },
              onclick: function () { cur = i; renderList(); P5.notify.info('已切换到', b.name); }
            }, b.name + ' · ' + b.entries);
          }));
          renderList();
          renderEditor(books[0].rows[0]);
          return [
            tabsBooks,
            h('div.split', [listHost, editorHost])
          ];
        }
      },
      {
        key: 'active', label: '激活',
        render: function () {
          return [
            h('p.t-label', '一键开关方案：把常用的启用组合存成方案，切场景时一次切换。'),
            h('div.col', books.map(function (b, i) {
              return h('div.setting-row', [
                h('div', [
                  h('div.setting-row__k', b.name),
                  h('div.setting-row__d', b.kind + ' · ' + b.entries + ' 条条目' + (b.active ? ' · 已激活' : ' · 未激活'))
                ]),
                P5.toggle('', b.active, function (v) {
                  b.active = v;
                  P5.notify[v ? 'ok' : 'info'](v ? '已激活' : '已停用', b.name);
                }, 'p5-bookon-' + i)
              ]);
            })),
            h('div.row.row--wrap', [
              P5.btn('保存为方案', { size: 'sm', icon: 'save', onClick: function () { P5.notify.ok('方案已保存', '方案「剧院案 · 侦查中」。'); } }),
              P5.btn('应用方案', { size: 'sm', icon: 'check', onClick: function () { P5.notify.ok('方案已应用', '2 本启用，1 本归档。'); } })
            ])
          ];
        }
      },
      {
        key: 'io', label: '导入导出',
        render: function () {
          return [
            h('section.block', [
              P5.sectHead('酒馆兼容', 'SILLYTAVERN COMPAT', h('span.tag.tag--fixer', 'lorebook JSON')),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', lineHeight: '1.85', color: 'var(--txt-2)' } },
                '直接读写 SillyTavern 世界书 JSON（entries / keys / constant / position / order / recursion）。' +
                '导入时保留原字段，额外挂载本项目的 known_by 视角过滤与实体注册表映射。'),
              h('div.row.row--wrap', { style: { marginTop: '10px' } }, [
                P5.btn('导入 lorebook JSON', { size: 'sm', icon: 'upload', onClick: function () { P5.notify.info('等待文件', '原型不读取本地文件；接入后端后此按钮唤起文件选择。'); } }),
                P5.btn('导出当前书', { size: 'sm', icon: 'download', onClick: function () { P5.notify.ok('已导出', books[cur].name + '（' + books[cur].entries + ' 条）'); } }),
                P5.btn('从旧卡迁入', { size: 'sm', icon: 'archive', onClick: function () { P5.notify.info('迁入向导', '将执行别名洗白（ALIAS_MAP）与时间有效性标注。'); } })
              ])
            ]),
            h('section.block', [
              P5.sectHead('健康检查', 'HEALTH'),
              h('div.col', [
                healthRow('关键词过宽（会误触发）', 2, 'warn'),
                healthRow('条目超长（> 400 tok）', 1, 'warn'),
                healthRow('重复条目', 0, 'ok'),
                healthRow('递归环', 0, 'ok')
              ]),
              P5.btn('只修复严重问题', { size: 'sm', icon: 'gear', onClick: function () { P5.notify.ok('已修复 2 处', '关键词收窄：「雾」→「廷根的雾, 灰雾」。'); } })
            ])
          ];
        }
      }
    ], { label: '世界书标签页', id: 'p5-tabs-lorebook' });
    return [t.bar, t.body];
  };

  function healthRow(k, n, tone) {
    return h('div.row.row--between', { style: { fontSize: 'var(--fs-2xs)', padding: '4px 0' } }, [
      h('span', { style: { color: 'var(--txt-2)' } }, k),
      h('span.tag' + (n ? '.tag--warn' : '.tag--fixer'), n + ' 处')
    ]);
  }

  /* ============ 18. 上下文合成器 ============ */
  P5.panels.composer = function () {
    var C = D.composer;
    var listHost = h('div.compose-list');
    var budgetHost = h('div.budget');
    var sumHost = h('div.row.row--between');
    var dragKey = null;

    function totals() {
      var z = { primacy: 0, middle: 0, recency: 0 };
      C.blocks.forEach(function (b) { if (b.on) z[b.zone] += b.tok; });
      var used = z.primacy + z.middle + z.recency;
      return { z: z, used: used, free: Math.max(0, C.budget - used) };
    }

    function renderBudget() {
      var t = totals();
      P5.clear(budgetHost);
      ['primacy', 'middle', 'recency'].forEach(function (k) {
        var pctv = (t.z[k] / C.budget) * 100;
        budgetHost.appendChild(h('i', {
          dataset: { z: k },
          style: { flexBasis: pctv + '%' },
          title: zoneName(k) + ' ' + t.z[k] + ' tok'
        }, pctv > 8 ? String(t.z[k]) : ''));
      });
      budgetHost.appendChild(h('i', { dataset: { z: 'free' }, style: { flexBasis: (t.free / C.budget) * 100 + '%' } }, t.free > 300 ? '余 ' + t.free : ''));
      P5.mount(sumHost, [
        h('span.t-label', '预算 ' + P5.num(C.budget) + ' tok · 已用 ' + P5.num(t.used) + ' · 余 ' + P5.num(t.free)),
        h('span.tag' + (t.used > C.budget ? '.tag--warn' : '.tag--fixer'), t.used > C.budget ? '超出预算' : '在预算内')
      ]);
      if (t.used > C.budget) {
        P5.notify.valve('上下文超出预算 <b>' + (t.used - C.budget) + ' tok</b>。将按降级顺序自动裁剪：' + C.degrade[0] + '。', { life: 5200 });
      }
    }

    function zoneName(k) { return k === 'primacy' ? '首部（primacy）' : k === 'middle' ? '中段参考区' : '尾部（recency）'; }

    function renderList() {
      P5.clear(listHost);
      C.blocks.forEach(function (b, i) {
        var row = h('div.compose-block', {
          dataset: { zone: b.zone, idx: i },
          draggable: 'true',
          tabindex: '0',
          role: 'button',
          'aria-pressed': b.on ? 'true' : 'false',
          'aria-label': b.tt + '，' + zoneName(b.zone) + '，' + b.tok + ' tok，' + (b.on ? '已启用' : '已停用') + '。回车切换启用状态。',
          style: b.on ? null : { opacity: '.45' },
          onkeydown: function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
          },
          ondragstart: function (e) { dragKey = i; this.classList.add('is-drag'); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; },
          ondragend: function () { this.classList.remove('is-drag'); P5.$$('.compose-block').forEach(function (x) { x.classList.remove('is-over'); }); },
          ondragover: function (e) { e.preventDefault(); this.classList.add('is-over'); },
          ondragleave: function () { this.classList.remove('is-over'); },
          ondrop: function (e) {
            e.preventDefault();
            this.classList.remove('is-over');
            var to = Number(this.dataset.idx);
            if (dragKey === null || dragKey === to) return;
            var moved = C.blocks.splice(dragKey, 1)[0];
            C.blocks.splice(to, 0, moved);
            dragKey = null;
            renderList(); renderBudget();
            P5.fx.play('tap');
          }
        }, [
          h('span.compose-block__grip', P5.icon('list', 12)),
          h('span.compose-block__tt', b.tt),
          h('span.compose-block__zone', b.zone === 'primacy' ? '首部' : b.zone === 'middle' ? '中段' : '尾部'),
          h('span.compose-block__tok', b.tok + ' tok')
        ]);
        row.addEventListener('click', function () {
          b.on = !b.on;
          renderList(); renderBudget();
          P5.notify.info(b.on ? '已启用块' : '已停用块', b.tt + '（' + b.tok + ' tok）');
        });
        listHost.appendChild(row);
      });
    }

    var t = P5.tabs([
      {
        key: 'order', label: '块序',
        render: function () {
          renderList(); renderBudget();
          return [
            h('p.t-label', '拖拽调整装配顺序；点击一行启用/停用。三区分别对应 U 型注意力的首部、中段与尾部。'),
            sumHost, budgetHost, listHost
          ];
        }
      },
      {
        key: 'budget', label: '预算',
        render: function () {
          renderBudget();
          return [
            sumHost, budgetHost,
            h('div.field', [h('label', { for: 'p5-comp-budget' }, '每回合上下文预算（tok）'),
              P5.range({ id: 'p5-comp-budget', min: 2000, max: 16000, step: 250, value: C.budget, label: '上下文预算',
                onInput: function (v) { C.budget = v; renderBudget(); } })]),
            h('section.block', [
              P5.sectHead('降级顺序', 'DEGRADATION ORDER', h('span.tag', '超预算时自上而下执行')),
              h('div.col', C.degrade.map(function (d, i) {
                return h('div.row', { style: { gap: '10px', padding: '4px 0' } }, [
                  h('span.mono', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--silver-3)', minWidth: '18px' } }, String(i + 1)),
                  h('span', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-2xs)', color: 'var(--txt-2)' } }, d)
                ]);
              }))
            ]),
            h('div.zod-note', [
              P5.icon('alert', 14),
              h('span', '预算是硬约束：宁可少注入，也不要让请求被截断。截断会让尾部的玩家输入丢失——那是最不该丢的东西。')
            ])
          ];
        }
      },
      {
        key: 'sampling', label: '采样',
        render: function () {
          var P = D.pipeline.main;
          return [
            h('div.panel-grid.panel-grid--2', [
              h('div.field', [h('label', { for: 'p5-samp-temp' }, '温度 ' + P.temp), P5.range({ id: 'p5-samp-temp', min: 0, max: 200, value: P.temp * 100, label: '温度' })]),
              h('div.field', [h('label', { for: 'p5-samp-top' }, 'Top-P 0.95'), P5.range({ id: 'p5-samp-top', min: 0, max: 100, value: 95, label: 'Top-P' })]),
              h('div.field', [h('label', { for: 'p5-samp-freq' }, '重复惩罚 0.35'), P5.range({ id: 'p5-samp-freq', min: 0, max: 100, value: 35, label: '重复惩罚' })]),
              h('div.field', [h('label', { for: 'p5-samp-max' }, '最大输出 tok'), h('input.input.t-num', { id: 'p5-samp-max', value: String(P.maxTok) })])
            ]),
            h('section.block', [
              P5.sectHead('输出协议', 'OUTPUT CONTRACT', h('span.tag.tag--fixer', '尾部标签 + 完整性契约')),
              h('div.var-tree', { style: { maxHeight: '180px' } }, [
                h('div.var-node', [h('span.var-node__key', '<content>'), h('span.var-node__val', '正文（必需）')]),
                h('div.var-node', [h('span.var-node__key', '<action>'), h('span.var-node__val', '行动建议 ×3—4')]),
                h('div.var-node', [h('span.var-node__key', '<event>'), h('span.var-node__val', '结构化事件（编年史同源）')]),
                h('div.var-node', [h('span.var-node__key', '<recall>'), h('span.var-node__val', '下回合点名召回')]),
                h('div.var-node', [h('span.var-node__key', '<state_update>'), h('span.var-node__val', '变量 JSON Patch')]),
                h('div.var-node', [h('span.var-node__key', '<thinking>'), h('span.var-node__val', '可选，渲染时剥离')])
              ]),
              h('p', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--txt-3)', lineHeight: '1.7', marginTop: '8px' } },
                '容错策略：标签缺失时自动补闭合，仍失败则强提最外层 JSON 区块兜底。绝不因为掉标签而拦截整个回合。')
            ]),
            h('div.row.row--wrap', [
              P5.btn('导入预设 JSON', { size: 'sm', icon: 'upload', onClick: function () { P5.notify.info('兼容酒馆预设', '读取 prompts / prompt_order / 采样参数。'); } }),
              P5.btn('导出当前预设', { size: 'sm', icon: 'download', onClick: function () { P5.notify.ok('已导出', '14 个块 + 采样参数 + 降级顺序。'); } })
            ])
          ];
        }
      }
    ], { label: '上下文合成器标签页', id: 'p5-tabs-composer' });
    return [t.bar, t.body];
  };

  /* ============ 19. 模型与管线 ============ */
  P5.panels.pipeline = function () {
    var P = D.pipeline;
    function rpmStrip(rpm, used) {
      var cells = [];
      for (var i = 0; i < rpm; i++) cells.push(h('i', { dataset: { used: i < used ? 1 : 0 } }));
      return h('div.rpm-strip', cells);
    }
    function apiCard(k, cfg) {
      return h('section.block', [
        P5.sectHead(cfg.label, k.toUpperCase(), h('span.tag' + (cfg.enabled === false ? '' : '.tag--fixer'), cfg.enabled === false ? '未配置' : '就绪')),
        h('div.panel-grid.panel-grid--2', [
          h('div.field', [h('label', { for: 'p5-api-url-' + k }, '反代 URL'), h('input.input', { id: 'p5-api-url-' + k, value: cfg.url })]),
          h('div.field', [h('label', { for: 'p5-api-key-' + k }, 'API Key'), h('input.input', { id: 'p5-api-key-' + k, type: 'password', value: '', placeholder: '玩家自持，仅存本地' })]),
          h('div.field', [h('label', { for: 'p5-api-model-' + k }, '模型'), h('input.input', { id: 'p5-api-model-' + k, value: cfg.model })]),
          cfg.rpm ? h('div.field', [h('label', {}, 'RPM 配额 ' + cfg.used + ' / ' + cfg.rpm), rpmStrip(cfg.rpm, cfg.used)]) : h('div')
        ]),
        h('div.row.row--wrap', [
          P5.btn('获取模型列表', { size: 'sm', icon: 'refresh', onClick: function () { P5.notify.info('拉取列表', '需要有效的 URL 与 Key。原型不发起真实请求。'); } }),
          P5.btn('保存配置', { size: 'sm', variant: 'primary', icon: 'save', onClick: function () { P5.notify.ok('配置已保存', cfg.label + ' → ' + cfg.model); } }),
          cfg.stream !== undefined ? P5.toggle('流式输出', cfg.stream, null, 'p5-api-stream-' + k) : null
        ])
      ]);
    }

    var t = P5.tabs([
      {
        key: 'tier', label: '三档',
        render: function () {
          var host = h('div.tier-pick');
          function renderTiers() {
            P5.clear(host);
            P.tiers.forEach(function (x) {
              host.appendChild(h('button.tier', {
                type: 'button', id: 'p5-tier-' + x.key,
                'aria-pressed': P.tier === x.key ? 'true' : 'false',
                onclick: function () {
                  if (x.key === 'agent') {
                    P5.notify.confirm({
                      title: '切换到 Agent 档？',
                      msg: '此档允许每回合最多 5 次工具调用。在 3—5 RPM 的公益站上会立刻触发限流，导致回合失败。确认你的模型支持工具调用且配额充足。',
                      okText: '我了解，切换', icon: 'alert', danger: true,
                      note: '三档互斥：切换后变量更新方式随之改变，历史节点仍可读。'
                    }).then(function (ok) { if (ok) { P.tier = x.key; renderTiers(); P5.notify.warn('已切换到 Agent 档', '请留意 RPM。'); } });
                    return;
                  }
                  P.tier = x.key; renderTiers();
                  P5.notify.ok('已切换执行档', x.nm);
                }
              }, [
                h('span.tier__dot'),
                h('div', [h('div.tier__nm', x.nm), h('div.tier__ds', x.ds)]),
                h('span.tier__rpm', x.rpm)
              ]));
            });
          }
          renderTiers();
          return [
            h('p.t-label', '三档互斥。默认单调用档——这是「每回合 ≤1 次阻塞调用」这条硬约束的直接产物。'),
            host,
            h('div.zod-note', { style: { color: 'var(--silver-2)', background: 'color-mix(in srgb, var(--cyan-3) 22%, transparent)', borderLeftColor: 'var(--cyan-2)' } }, [
              P5.icon('info', 14),
              h('span', '优雅降级：Agent 档遇到限流会自动回落到单调用档并提示，不会让你卡在半个回合里。')
            ])
          ];
        }
      },
      { key: 'main', label: '主 API', render: function () { return [apiCard('main', P.main)]; } },
      {
        key: 'sub', label: '次 API 与召回',
        render: function () {
          return [
            apiCard('sub', P.sub),
            apiCard('rag', P.rag),
            h('section.block', [
              P5.sectHead('后台任务', 'BACKGROUND'),
              h('div.col', [
                h('div.setting-row', [
                  h('div', [h('div.setting-row__k', '变量更新走次 API'), h('div.setting-row__d', '关闭时由主调用的 <state_update> 尾部标签承担。')]),
                  P5.toggle('', false, null, 'p5-bg-vars')
                ]),
                h('div.setting-row', [
                  h('div', [h('div.setting-row__k', '小总结走次 API'), h('div.setting-row__d', '每回合一次，异步，不阻塞剧情。')]),
                  P5.toggle('', true, null, 'p5-bg-sum')
                ]),
                h('div.setting-row', [
                  h('div', [h('div.setting-row__k', '失败自动重试一次'), h('div.setting-row__d', '仅对后台任务生效；主线失败交由玩家决定。')]),
                  P5.toggle('', true, null, 'p5-bg-retry')
                ])
              ])
            ])
          ];
        }
      }
    ], { label: '模型与管线标签页', id: 'p5-tabs-pipeline' });
    return [t.bar, t.body];
  };

  /* ============ 20. 变量工坊 ============ */
  P5.panels.vars = function () {
    var t = P5.tabs([
      {
        key: 'tree', label: '树编辑',
        render: function () {
          return [
            h('div.row.row--between', [
              h('span.t-label', '路径 · 值 · Zod 校验。非法值被拦截并保留旧值，不会污染存档。'),
              h('span.tag.tag--warn', '1 处校验失败')
            ]),
            h('div.var-tree', D.vars.map(function (v) {
              return h('div.var-node', { dataset: { invalid: v.d ? 1 : 0 } }, [
                h('span.var-node__key', [
                  h('span.depth', v.k.split('.').slice(0, -1).join('.') + '.'),
                  v.k.split('.').slice(-1)[0]
                ]),
                h('span.var-node__val', v.v)
              ]);
            })),
            h('div.zod-note', [
              P5.icon('alert', 14),
              h('div', [
                h('div', { style: { fontWeight: '700', marginBottom: '2px' } }, 'stat_data.运气'),
                h('div', D.vars[D.vars.length - 1].err)
              ])
            ]),
            h('div.row.row--wrap', [
              P5.btn('应用变更', { size: 'sm', variant: 'primary', icon: 'check', onClick: function () { P5.notify.ok('已应用', '15 项通过，1 项被拦截。'); } }),
              P5.btn('恢复模型提取值', { size: 'sm', icon: 'undo', onClick: function () { P5.notify.info('已恢复', '回到本回合模型输出的原始 patch。'); } }),
              P5.btn('命令 AI 修正', { size: 'sm', variant: 'mystic', icon: 'brain', onClick: function () { P5.notify.mystic('已排入后台', '把校验错误回喂给模型，请它重出一份合法 patch（格式纠错回喂）。'); } })
            ])
          ];
        }
      },
      {
        key: 'raw', label: '原始 JSON',
        render: function () {
          var json = '{\n  "stat_data": {\n    "活力": [24, 30],\n    "灵性": [33, 40],\n    "理智": [38, 45],\n    "人性": [82, 90],\n    "敏捷": [26, 30],\n    "运气": [19, 40],\n    "消化进度": 26,\n    "失控": 4\n  },\n  "world_data": {\n    "时间": "1349-09-14T21:47",\n    "场景": "翡翠剧院·后台走廊",\n    "回合": 7,\n    "活伏笔": ["镜后低语", "替补名单", "左袖银粉", "F-13"]\n  },\n  "npc_data": {\n    "玛戈·希尔": { "好感": 14, "立场": -28, "在场": true },\n    "塞西莉亚·朗": { "好感": 41, "立场": 12, "理智": [31, 40], "在场": true },\n    "老图恩": { "好感": 33, "立场": 6, "在场": true },\n    "F-13": { "可读性": false, "在场": false }\n  }\n}';
          return [
            h('div.field', [h('label', { for: 'p5-vars-raw' }, '完整变量对象（三层分区）'),
              h('textarea.textarea', { id: 'p5-vars-raw', rows: 18, style: { fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-3xs)' } }, json)]),
            h('div.row.row--wrap', [
              P5.btn('校验', { size: 'sm', icon: 'check', onClick: function () { P5.notify.ok('校验通过', 'JSON 合法，Schema 匹配。'); } }),
              P5.btn('格式化', { size: 'sm', icon: 'terminal', onClick: function () { P5.notify.ok('已格式化', '缩进 2 空格。'); } }),
              P5.btn('写回存档', { size: 'sm', variant: 'primary', icon: 'save', onClick: function () { P5.notify.ok('已写回', '当前节点变量快照已更新。'); } })
            ])
          ];
        }
      }
    ], { label: '变量工坊标签页', id: 'p5-tabs-vars' });
    return [t.bar, t.body];
  };

  /* ============ 21. 信札 ============ */
  P5.panels.letters = function () {
    var t = P5.tabs([
      {
        key: 'chat', label: '会话',
        render: function () {
          return [
            h('p.t-label', '聊天列表模式：同一份存档的另一种读法。适合回看对话与快速滚动。'),
            h('div.letter-list', D.letters.map(function (l) {
              return h('article.letter' + (l.self ? '.letter--self' : ''), [
                h('span.letter__av', l.self ? 'EV' : (l.who === '旁白' ? '※' : l.who.slice(0, 1))),
                h('div', [
                  h('div.letter__hd', [h('span.letter__who', l.who), h('span.letter__t', l.t)]),
                  h('p.letter__tx', l.tx)
                ])
              ]);
            }))
          ];
        }
      },
      {
        key: 'floor', label: '楼层',
        render: function () {
          return [
            h('p.t-label', '每一层挂着当时的变量快照。点击回溯，正文与变量一起回到那一刻。'),
            h('div.col', D.saves.slice().reverse().map(function (n) {
              return h('div', [
                h('button.lore-row', {
                  type: 'button',
                  onclick: function () { P5.notify.info('楼层 ' + n.meta, n.tx); }
                }, [
                  h('span.lore-lamp', { dataset: { mode: n.cur ? 'green' : n.branch ? 'off' : 'blue' } }),
                  h('span.lore-row__tt', n.tx),
                  h('span.lore-row__kw', n.meta),
                  n.cur ? h('span.tag.tag--fixer', '当前') : h('span.tag', '回溯')
                ]),
                n.vars ? h('div.vars-snap', [h('span.k', 'vars '), h('span.v', n.vars)]) : null
              ]);
            }))
          ];
        }
      }
    ], { label: '信札标签页', id: 'p5-tabs-letters' });
    return [t.bar, t.body];
  };

  /* ============ 22. 台务设置 ============ */
  P5.panels.settings = function () {
    var S = D.settings;
    var t = P5.tabs([
      {
        key: 'general', label: '常规',
        render: function () {
          return [
            h('section.block', [
              P5.sectHead('主题皮肤', 'SKIN', h('span.tag', '即时生效')),
              h('div.skin-picker', S.skins.map(function (sk) {
                return h('button.skin-swatch', {
                  type: 'button', id: 'p5-skin-' + sk.key,
                  'aria-pressed': S.skin === sk.key ? 'true' : 'false',
                  onclick: function () {
                    S.skin = sk.key;
                    document.documentElement.dataset.skin = sk.key === 'darkroom' ? '' : sk.key;
                    P5.store('skin', sk.key);
                    P5.$$('.skin-swatch').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
                    this.setAttribute('aria-pressed', 'true');
                    var lb = P5.$('#p5-skin-label');
                    if (lb) lb.textContent = sk.nm;
                    P5.fx.play('plate');
                    P5.notify.ok('皮肤已切换', sk.nm);
                  }
                }, [
                  h('div.skin-swatch__strip', sk.cols.map(function (c) { return h('i', { style: { background: c } }); })),
                  h('div.skin-swatch__nm', sk.nm)
                ]);
              }))
            ]),
            h('section.block', [
              P5.sectHead('叙事排版', 'TYPESETTING'),
              h('div.setting-row.setting-row--stack', [
                h('div', [h('div.setting-row__k', '正文字号 ' + S.storySize + 'px'), h('div.setting-row__d', '影响相纸正文与全屏阅读态。')]),
                P5.range({ id: 'p5-set-fontsize', min: 13, max: 21, step: 0.5, value: S.storySize, label: '正文字号',
                  onInput: function (v) { S.storySize = v; document.documentElement.style.setProperty('--story-size', v + 'px'); } })
              ]),
              h('div.setting-row.setting-row--stack', [
                h('div', [h('div.setting-row__k', '行高 ' + S.storyLeading), h('div.setting-row__d', '中文长文建议 1.85—2.0。')]),
                P5.range({ id: 'p5-set-leading', min: 150, max: 230, step: 2, value: S.storyLeading * 100, label: '行高',
                  onInput: function (v) { S.storyLeading = v / 100; document.documentElement.style.setProperty('--story-leading', String(v / 100)); } })
              ])
            ]),
            h('section.block', [
              P5.sectHead('自动备份', 'AUTOSAVE'),
              h('div.setting-row', [
                h('div', [h('div.setting-row__k', '每 ' + S.autosave + ' 回合自动备份'), h('div.setting-row__d', '独立槽位，长周目防丢档。')]),
                P5.range({ id: 'p5-set-autosave', min: 5, max: 50, step: 5, value: S.autosave, label: '自动备份间隔',
                  onInput: function (v) { S.autosave = v; } })
              ])
            ])
          ];
        }
      },
      {
        key: 'motion', label: '动效',
        render: function () {
          return [
            h('p.t-label', '低端设备可整档关闭。系统级 prefers-reduced-motion 始终优先。'),
            h('div.tier-pick', [
              motionOpt('full', '全部动效', '显影打字机、粒子、扫光、齿轮、视差全开。'),
              motionOpt('reduced', '克制', '保留状态过渡，关闭装饰性循环动画。'),
              motionOpt('off', '关闭', '所有动画时长归零，仅保留必要的可见性变化。')
            ]),
            h('section.block', [
              P5.sectHead('单项开关', 'TOGGLES'),
              h('div.col', [
                h('div.setting-row', [
                  h('div', [h('div.setting-row__k', '场景特效（粒子 / 雾 / 颗粒）'), h('div.setting-row__d', '关闭可显著降低移动端功耗。')]),
                  P5.toggle('', S.fx === 'on', function (v) {
                    S.fx = v ? 'on' : 'off';
                    document.documentElement.dataset.fx = S.fx;
                    P5.store('fx', S.fx);
                    P5.notify.info(v ? '特效已开启' : '特效已关闭');
                  }, 'p5-set-fx')
                ]),
                h('div.setting-row', [
                  h('div', [h('div.setting-row__k', '鼠标视差'), h('div.setting-row__d', '场景层随光标轻移 ±8px。')]),
                  P5.toggle('', S.parallax, function (v) { S.parallax = v; P5.notify.info(v ? '视差已开启' : '视差已关闭'); }, 'p5-set-parallax')
                ]),
                h('div.setting-row', [
                  h('div', [h('div.setting-row__k', '流式输出'), h('div.setting-row__d', '关闭后整段返回，弱网更稳。')]),
                  P5.toggle('', S.stream, function (v) { S.stream = v; P5.notify.info(v ? '流式已开启' : '流式已关闭'); }, 'p5-set-stream')
                ])
              ])
            ])
          ];

          function motionOpt(key, nm, ds) {
            return h('button.tier', {
              type: 'button', id: 'p5-motion-' + key,
              'aria-pressed': S.motion === key ? 'true' : 'false',
              onclick: function () {
                S.motion = key;
                document.documentElement.dataset.motion = key === 'full' ? '' : key;
                P5.store('motion', key);
                P5.$$('[id^="p5-motion-"]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
                this.setAttribute('aria-pressed', 'true');
                P5.notify.ok('动效级别', nm);
              }
            }, [h('span.tier__dot'), h('div', [h('div.tier__nm', nm), h('div.tier__ds', ds)]), h('span')]);
          }
        }
      },
      {
        key: 'audio', label: '音频',
        render: function () {
          return [
            h('div.setting-row', [
              h('div', [h('div.setting-row__k', '界面音效'), h('div.setting-row__d', 'WebAudio 实时合成（无音频文件依赖）：拨片、汞滴、银封、钟声。默认关闭。')]),
              P5.toggle('', S.audio, function (v) {
                S.audio = v; P5.store('audio', v);
                var lamp = P5.$('#p5-lamp-audio');
                if (lamp) lamp.dataset.on = v ? '1' : '0';
                if (v) { P5.fx.play('chime'); P5.notify.ok('音效已开启', '首次交互后浏览器才允许出声。'); }
                else P5.notify.info('音效已关闭');
              }, 'p5-set-audio')
            ]),
            h('div.row.row--wrap', ['tap', 'plate', 'seal', 'mercury', 'chime', 'fog'].map(function (n) {
              return P5.btn(n, { size: 'sm', icon: 'volume', onClick: function () {
                if (!S.audio) { P5.notify.warn('音效未开启', '先打开上方开关。'); return; }
                P5.fx.play(n);
              } });
            }))
          ];
        }
      },
      {
        key: 'perf', label: '性能',
        render: function () {
          return [
            h('div.stat-tiles', [
              P5.statTile('JS 依赖', '0', '零构建 · 零框架', 'ok'),
              P5.statTile('CSS 文件', '7', '分层加载'),
              P5.statTile('图标', P5.iconNames().length + ' 枚', '手绘 SVG · 无 emoji', 'ok'),
              P5.statTile('面板', P5.docket.registry.length + ' 个', '首次打开才构建 DOM')
            ]),
            h('section.block', [
              P5.sectHead('优化清单', 'OPTIMISATIONS'),
              h('div.col', [
                perfRow('面板懒构建', '窗口首次打开才建 DOM，关闭后节点释放。'),
                perfRow('动画仅 transform / opacity', '不触发 layout 与 paint，合成器直出。'),
                perfRow('监听 passive + rAF 节流', '滚动与指针移动不阻塞主线程。'),
                perfRow('图片 lazy + 失败回退', '远程背景图不可达时切换程序化 SVG 场景。'),
                perfRow('粒子随可见性暂停', '标签页隐藏即停，ResizeObserver 自适应密度。'),
                perfRow('字体 swap + preconnect', '断网静默回退系统衬线，首屏不阻塞。')
              ])
            ]),
            h('div.setting-row', [
              h('div', [h('div.setting-row__k', '控制台调试输出'), h('div.setting-row__d', '打开后在控制台打印事件流。')]),
              P5.toggle('', false, function (v) { P5.debug = v; P5.notify.info(v ? '调试输出已开启' : '调试输出已关闭'); }, 'p5-set-console')
            ])
          ];

          function perfRow(k, d) {
            return h('div.row', { style: { gap: '10px', alignItems: 'flex-start', padding: '4px 0' } }, [
              h('span', { style: { color: 'var(--fixer-2)', marginTop: '2px' } }, P5.icon('check', 13)),
              h('div', [
                h('div', { style: { fontSize: 'var(--fs-2xs)', color: 'var(--txt)' } }, k),
                h('div', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--txt-3)', lineHeight: '1.6' } }, d)
              ])
            ]);
          }
        }
      },
      {
        key: 'a11y', label: '无障碍',
        render: function () {
          return [
            h('section.block', [
              P5.sectHead('键盘导航', 'KEYBOARD'),
              h('div.col', [
                keyRow('` 或 Ctrl+K', '展开 / 收起灰雾星图'),
                keyRow('方向键', '星图内游走 · 标签页切换'),
                keyRow('Enter', '打开星点 · 发送行动'),
                keyRow('Shift + Enter', '输入框换行'),
                keyRow('Esc', '逐层关闭窗口 / 星图 / 确认框'),
                keyRow('1 · 2 · 3', '窄条 / 阅读 / 探索三态'),
                keyRow('[ 与 ]', '收起 / 展开左右侧栏')
              ])
            ]),
            h('section.block', [
              P5.sectHead('已实现', 'IMPLEMENTED'),
              h('div.col', [
                h('span.tag.tag--fixer', '语义化 HTML5 结构'),
                h('span.tag.tag--fixer', 'role=dialog / tablist / meter / progressbar'),
                h('span.tag.tag--fixer', 'aria-live 正文播报'),
                h('span.tag.tag--fixer', 'focus-visible 银色双环'),
                h('span.tag.tag--fixer', '确认框焦点陷阱 + 焦点归还'),
                h('span.tag.tag--fixer', 'prefers-reduced-motion 全量降级'),
                h('span.tag.tag--fixer', '全站唯一 ID（p5- 前缀）')
              ])
            ])
          ];

          function keyRow(k, d) {
            return h('div.row.row--between', { style: { padding: '4px 0', borderBottom: '1px dashed color-mix(in srgb, var(--silver-4) 56%, transparent)' } }, [
              h('span.mono', { style: { fontSize: 'var(--fs-3xs)', color: 'var(--paper)', padding: '1px 6px', border: '1px solid color-mix(in srgb, var(--silver) 34%, transparent)', borderRadius: '3px' } }, k),
              h('span', { style: { fontSize: 'var(--fs-2xs)', color: 'var(--txt-2)' } }, d)
            ]);
          }
        }
      },
      {
        key: 'about', label: '关于',
        render: function () {
          return [
            h('section.block', [
              P5.sectHead('诡秘剧场 · 原型 5', 'THE CONTACT SHEET'),
              P5.kvList([
                ['版本', D.meta.build],
                ['形态', '零构建 / 零依赖 / file:// 直开'],
                ['设计概念', '暗房 · 灵异摄影 · 接触印相样张'],
                ['配色纪律', '暗室 60 · 相纸银盐 30 · 安全灯红与蓝晒蓝 10（红管氛围危险 / 蓝管信息结构 / 银管金属分隔，永不混用）'],
                ['字体', 'Bodoni Moda · Noto Serif SC · Courier Prime · 楷体（批注）'],
                ['后端', '无（本页仅前端原型）']
              ])
            ]),
            h('section.block', [
              P5.sectHead('这一代是合成体', 'SYNTHESIS'),
              h('div.col', { style: { gap: '6px' } }, [
                diffRow('取自 P3', '暗房与灵异摄影的视觉体系、令牌值、显影承载流式'),
                diffRow('取自 P4', '单一入口 + 多窗口 + 面板懒构建；读心式「能力即交互」'),
                diffRow('取自 P1', '首屏控件预算的克制度基线'),
                diffRow('本代新增', '把 24 格底片条改造成按需调出的接触印相样张')
              ])
            ]),
            h('section.block', [
              P5.sectHead('控件预算（写进验收的硬指标）', 'CONTROL BUDGET'),
              P5.kvList([
                ['PC 首屏常驻控件', '19 / 上限 22'],
                ['移动端首屏控件', '11 / 上限 12'],
                ['移动端 < 44px 触控目标', '0（全局强制 ≥44px）'],
                ['通向 24 面板的通道', '1 条（样张）'],
                ['面板总数', '24（一个都没砍）']
              ]),
              h('p', { style: { fontFamily: 'var(--f-serif)', fontSize: 'var(--fs-3xs)', lineHeight: '1.8', color: 'var(--txt-3)', marginTop: '8px' } },
                '前几代的教训：把功能清单直接翻译成入口矩阵，过半首屏控件都花在「怎么去别处」。' +
                '这一代砍的是入口，不是能力——侧栏没有图标轨道，右墙没有速取矩阵，输入区没有常驻指令行。')
            ])
          ];

          function diffRow(k, v) {
            return h('div.row', { style: { gap: '10px' } }, [
              h('span.tag', k),
              h('span', { style: { fontSize: 'var(--fs-2xs)', color: 'var(--txt-2)', fontFamily: 'var(--f-serif)' } }, v)
            ]);
          }
        }
      }
    ], { label: '台务设置标签页', id: 'p5-tabs-settings' });
    return [t.bar, t.body];
  };
})(window);
