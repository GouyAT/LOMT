/* ============================================================
   诡秘剧场 · 原型3 — 面板：系统段
   档案馆 / 世界书双库 / 上下文合成器 / API 管线 / 变量编辑器 /
   记忆精炼器 / 一键生图 / 内容包 / 设置 / AI 上下文悬浮配置
   ============================================================ */
(function () {
  'use strict';

  var P = (window.PANELS = window.PANELS || {});
  var B = window.PANELBITS;
  var act = B.act, tell = B.tell, setrow = B.setrow, switchEl = B.switchEl;

  /* ============================================================
     1. 档案馆 —— 节点树 + 楼层变量回溯
     ============================================================ */
  P.archive = function (h, ico, UI, D, L) {
    var N = D.NODES;

    function tree() {
      var box = h('div.tree');
      N.forEach(function (n) {
        var isBranch = n.branch !== '主线';
        var row = h('button.tnode' + (n.current ? '.is-current' : ''), {
          type: 'button', style: { 'padding-left': (12 + n.depth * 20) + 'px', '--d': String(n.depth) },
          dataset: { branch: isBranch ? '1' : '0' },
          onclick: function () { detail(n); }
        },
          h('i.tn-dot'),
          h('div', null,
            h('div.tn-t', { text: '第 ' + n.turn + ' 回合 · ' + n.label }),
            h('div.tn-m', { text: n.time + ' · ' + n.branch + (n.current ? ' · 当前' : '') })),
          h('div', { class: 'row', style: { gap: '5px' } },
            isBranch ? h('span.chip.chip--cyan', { text: '分支' }) : null,
            n.current ? h('span.chip.chip--red', { text: '现在' }) : null,
            h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-3xs)', color: 'var(--txt-3)' }, text: n.id }))
        );
        box.appendChild(row);
        var snap = h('div.varsnap', { style: { 'margin-left': (12 + n.depth * 20) + 'px' } });
        Object.keys(n.vars).forEach(function (k) {
          snap.appendChild(h('span', null, h('b', { text: k + ' ' }), h('span', { text: String(n.vars[k]) })));
        });
        box.appendChild(snap);
      });
      return box;
    }

    function detail(n) {
      UI.confirm({
        title: '回溯至：第 ' + n.turn + ' 回合 · ' + n.label,
        msg: '前端会用该节点的变量快照重建状态，再把上下文交给模型继续。这就是「楼层 = 消息 = 状态检查点」。',
        detail: n.id + ' · ' + n.branch + ' · ' + n.time,
        icon: 'undo', okText: '回溯到此节点', cancelText: '留在当前', countdown: 15
      }).then(function (ok) {
        if (!ok) return;
        N.forEach(function (x) { x.current = false; });
        n.current = true;
        tell('已回溯', '第 ' + n.turn + ' 回合 · ' + n.label + '｜变量快照已还原：' + Object.keys(n.vars).length + ' 项', 'good', 'undo');
        document.dispatchEvent(new CustomEvent('p3:open', { detail: { id: 'archive' } }));
      });
    }

    var treeTab = h('div.stack', null,
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '每个节点自带完整变量快照（tavernlike 楼层回溯）。跳回历史节点时用该快照重建状态，避免「跳回旧剧情但数值还是新的」的存档错乱。' })),
      h('div.row', { style: { gap: '8px' } },
        act('创建分支存档', 'branch', function () { tell('已创建分支', '从当前节点分出「分支 · ' + (N.length + 1) + '」，两条时间线独立推进', 'good', 'branch'); }),
        act('固化为永久分支', 'save', function () { tell('已固化', '该时间线不再被自动清理', 'good', 'save'); }),
        act('立刻回到现在', 'skip', function () { N.forEach(function (x) { x.current = false; }); N[0].current = true; tell('已回到最新节点', '', 'info', 'skip'); })),
      tree()
    );

    var backup = h('div.setgrid', null,
      setrow(h, ico, UI, '自动备份', '每若干回合把节点树与世界书激活状态打包一次', switchEl(h, D.SETTINGS.autoBackup)),
      setrow(h, ico, UI, '备份间隔（回合）', '默认 20；间隔越短越安全，占用也越大', h('input.field', { type: 'number', value: String(D.SETTINGS.backupEvery) })),
      setrow(h, ico, UI, '云存档', '需账号体系；原型阶段仅展示界面', h('div', { class: 'row', style: { gap: '6px' } },
        act('上传', 'upload', function () { tell('云存档未接入', '原型阶段无后端。界面与交互已就位。', 'warn', 'upload'); }),
        act('下载', 'download', function () { tell('云存档未接入', '原型阶段无后端。', 'warn', 'download'); }))),
      setrow(h, ico, UI, '本地备份列表', '共 3 份，最近一次为 06-28 07:00', h('div', { class: 'row', style: { gap: '6px' } },
        act('加载', 'folder', function () { tell('请选择备份', '本地备份 3 份', 'info', 'folder'); }),
        act('清除全部', 'trash', function () {
          UI.confirm({ title: '清除所有本地备份', msg: '此操作不可撤销。节点树与当前进度不受影响，但历史备份将全部删除。', icon: 'trash', okText: '确认清除', countdown: 20 })
            .then(function (ok) { if (ok) tell('已清除全部备份', '', 'warn', 'trash'); });
        }, '.btn--danger')))
    );

    return {
      body: UI.tabs([
        { label: '节点树', icon: 'branch', body: function () { return treeTab; }, badge: N.length },
        { label: '备份与云端', icon: 'save', body: function () { return backup; } }
      ], { idBase: 'p3-arc' })
    };
  };

  /* ============================================================
     2. 世界书 —— 源堡 ⇄ 历史孔隙 双库
     ============================================================ */
  P.worldbook = function (h, ico, UI, D, L) {
    var W = L.worldbook;
    var sel = W.entries[0];
    var voided = [];

    var srcBody = h('div.vault-body', { id: 'p3-wb-src' });
    var voidBody = h('div.vault-body', { id: 'p3-wb-void' });
    var editor = h('div', { id: 'p3-wb-edit' });

    function row(e, inVoid) {
      return h('button.wbrow' + (sel === e ? '.is-sel' : ''), {
        type: 'button', dataset: { on: String(e.enabled) },
        onclick: function () { sel = e; paint(); }
      },
        ico(e.mode === '常驻' ? 'lock' : (e.mode === '向量' ? 'target' : 'tag'), 'ico ico--sm'),
        h('div', null,
          h('div.wb-n', { text: e.name }),
          h('div.wb-k', { text: 'D' + e.depth + ' · O' + e.order + ' · ' + e.tokens + 'tok · ' + e.keys.slice(0, 3).join('/') })),
        h('span.chip' + (inVoid ? '' : (e.enabled ? '.chip--gold' : '')), { text: inVoid ? '封存' : (e.enabled ? '在用' : '停用') })
      );
    }

    function paint() {
      UI.clear(srcBody); UI.clear(voidBody);
      W.entries.forEach(function (e) {
        if (voided.indexOf(e.id) >= 0) voidBody.appendChild(row(e, true));
        else srcBody.appendChild(row(e, false));
      });
      if (!voidBody.children.length) voidBody.appendChild(UI.empty('历史孔隙为空', '被封存的条目会放在这里：不参与注入，但随时可以取回。', 'fog'));
      paintEditor();
    }

    function paintEditor() {
      UI.clear(editor);
      if (!sel) { editor.appendChild(UI.empty('未选中条目', '在左右任一库中点选一条。', 'worldbook')); return; }
      var book = W.books.filter(function (b) { return b.id === sel.book; })[0] || { name: sel.book, scope: '—' };
      var scale = h('div.depthscale');
      for (var i = 0; i <= 10; i++) scale.appendChild(h('i', { class: i <= sel.depth ? 'on' : '', style: { height: (6 + i * 1.4) + 'px' } }));
      editor.appendChild(h('div.stack', null,
        h('div.sec-title', null, h('span.st-t', { text: sel.name }), h('span.st-l', { text: book.name }), h('i.st-line'),
          h('span.chip.chip--cyan', { text: sel.mode })),
        h('div.field-row', null, h('label.field-label', { text: '条目名称' }), h('input.field', { value: sel.name })),
        h('div.field-row', null, h('label.field-label', { text: '主关键词（逗号分隔；命中即触发）' }), h('input.field', { value: sel.keys.join('，') })),
        h('div.field-row', null, h('label.field-label', { text: '次关键词（选择性逻辑：与主关键词同时命中才生效）' }), h('input.field', { value: (sel.secondaryKeys || []).join('，') })),
        h('div.grid-3', null,
          h('div.field-row', null, h('label.field-label', { text: '深度 depth（0=最末尾 / 10=最开头）' }),
            h('div', { class: 'row', style: { gap: '9px' } }, scale, h('span', { class: 'u-mono', text: 'D' + sel.depth }))),
          h('div.field-row', null, h('label.field-label', { text: '排序 order' }), h('input.field', { type: 'number', value: String(sel.order) })),
          h('div.field-row', null, h('label.field-label', { text: 'token 估算' }), h('input.field', { value: String(sel.tokens), readonly: true }))),
        h('div.grid-2', null,
          h('div.setrow', { style: { 'border-bottom': '0', padding: '0' } },
            h('div', null, h('div.sr-n', { text: '启用' }), h('div.sr-d', { text: '停用后不参与关键词扫描' })),
            h('div.sr-c', null, switchEl(h, sel.enabled, function (v) { sel.enabled = v; paint(); }))),
          h('div.setrow', { style: { 'border-bottom': '0', padding: '0' } },
            h('div', null, h('div.sr-n', { text: '允许递归' }), h('div.sr-d', { text: '本条内容可再触发其它条目' })),
            h('div.sr-c', null, switchEl(h, sel.recursive)))),
        h('div.field-row', null, h('label.field-label', { text: '内容（将原样注入提示词）' }),
          h('textarea.field', { rows: '6', text: sel.content })),
        h('div.panel-note', null, ico('info', 'ico ico--sm'),
          h('span', { text: '深度映射：D8–10 → 系统基线（开头）；D3–7 → 参考区（中段）；D0–2 → 行动区（末尾）。这是酒馆 lorebook 与本作三区结构的对齐规则。' })),
        h('div.row', { style: { gap: '8px' } },
          h('button.btn.btn--primary.btn--sm', { type: 'button', onclick: function () { tell('已保存条目', sel.name, 'good', 'save'); } }, ico('save', 'ico ico--sm'), h('span', { text: '保存' })),
          act('封存到历史孔隙', 'fog', function () {
            if (voided.indexOf(sel.id) < 0) voided.push(sel.id);
            tell('已封存', sel.name + ' 移入历史孔隙，不再参与注入', 'warn', 'fog');
            paint();
          }),
          act('取回源堡', 'undo', function () {
            voided = voided.filter(function (x) { return x !== sel.id; });
            tell('已取回', sel.name + ' 回到源堡并激活', 'good', 'check');
            paint();
          }),
          act('删除', 'trash', function () {
            UI.confirm({ title: '双库永久删除', msg: '将同时从源堡与历史孔隙移除「' + sel.name + '」，不可恢复。', icon: 'trash', okText: '永久删除', countdown: 18 })
              .then(function (ok) { if (ok) tell('已删除', sel.name, 'warn', 'trash'); });
          }, '.btn--danger'))
      ));
    }

    paint();

    var dual = h('div.stack', null,
      h('div.panel-note.panel-note--gold', null, ico('info', 'ico ico--sm'),
        h('span', { text: '双库设计（借鉴社区版「源堡 / 历史孔隙」）：源堡是在用试剂，历史孔隙是封存试剂。删除很危险，封存很便宜——所以默认动作是封存。' })),
      h('div.dual', null,
        h('section.vault', { dataset: { kind: 'source' } },
          h('div.vault-head', null, ico('worldbook', 'ico ico--sm'),
            h('div.grow', null, h('div.ttl', { text: '源堡' }), h('span.eyebrow', { text: 'Sefirah · In Use' })),
            h('span.chip.chip--gold', { id: 'p3-wb-src-n', text: '在用' })),
          srcBody),
        h('div.dual-mid', null,
          h('button.btn.btn--icon', { type: 'button', title: '把选中条目封存到历史孔隙', onclick: function () { if (sel && voided.indexOf(sel.id) < 0) { voided.push(sel.id); paint(); tell('已封存', sel.name, 'warn', 'fog'); } } }, ico('chevronR')),
          h('button.btn.btn--icon', { type: 'button', title: '把选中条目取回源堡', onclick: function () { if (sel) { voided = voided.filter(function (x) { return x !== sel.id; }); paint(); tell('已取回', sel.name, 'good', 'check'); } } }, ico('chevronL')),
          h('button.btn.btn--icon', { type: 'button', title: '刷新双库统计', onclick: function () { paint(); tell('已刷新双库', '源堡 ' + (W.entries.length - voided.length) + ' 条 · 历史孔隙 ' + voided.length + ' 条', 'info', 'refresh'); } }, ico('refresh'))),
        h('section.vault', { dataset: { kind: 'void' } },
          h('div.vault-head', null, ico('fog', 'ico ico--sm'),
            h('div.grow', null, h('div.ttl', { text: '历史孔隙' }), h('span.eyebrow', { text: 'Void · Archived' })),
            h('span.chip', { text: '封存' })),
          voidBody)),
      h('div.sec-title', null, h('span.st-t', { text: '条目编辑' }), h('span.st-l', { text: 'Entry' }), h('i.st-line')),
      editor
    );

    var books = h('div.stack', null,
      UI.table([
        { label: '世界书', key: 'name' },
        { label: '归属', key: 'scope', width: '90px' },
        { label: '条目', key: 'entries', align: 'r', mono: true, width: '68px' },
        {
          label: '激活', width: '80px', get: function (b) {
            return switchEl(h, b.active, function (v) { b.active = v; tell(b.name + (v ? ' 已激活' : ' 已停用'), '多书可同时激活，按 depth/order 合并注入', 'info', 'worldbook'); });
          }
        }
      ], W.books),
      h('div.row', { style: { gap: '8px' } },
        act('导入 lorebook JSON', 'upload', function () { tell('导入器已就绪', '支持 SillyTavern lorebook v2（keys / secondary_keys / depth / order / recursive）', 'info', 'upload'); }),
        act('导出全部', 'download', function () { tell('已导出', 'lorebook-all.json · ' + W.entries.length + ' 条目 / ' + W.books.length + ' 本', 'good', 'download'); }),
        act('新建世界书', 'plus', function () { tell('已新建', '未命名世界书（附属）', 'good', 'plus'); })),
      h('div.sec-title', null, h('span.st-t', { text: '开关方案' }), h('span.st-l', { text: 'Presets of Toggles' }), h('i.st-line')),
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '开关方案 = 一组条目启用状态的快照。切换题材（主线/侦探/战争/日常）时一键换掉整套条目，而不是逐条勾选。' })),
      h('div.stack-sm', null, [
        { n: '主线 · 廷根篇', e: 12, on: true },
        { n: '侦探模式', e: 9, on: false },
        { n: '战术推演', e: 7, on: false },
        { n: '日常与关系', e: 6, on: false }
      ].map(function (s) {
        return h('div.lcard', null,
          ico('layers', 'ico lc-ico'),
          h('div', null, h('div.lc-t', { text: s.n }), h('div.lc-d', { text: s.e + ' 条条目启用' })),
          h('button.btn.btn--xs' + (s.on ? '.btn--primary' : ''), { type: 'button', onclick: function () { tell('已应用方案：' + s.n, s.e + ' 条条目已切换', 'good', 'check'); } },
            h('span', { text: s.on ? '当前' : '应用' })));
      }))
    );

    return {
      actions: [act('一键开关世界书', 'refresh', function () { tell('已切换全部世界书', W.books.length + ' 本已' + (W.books[0].active ? '停用' : '激活'), 'info', 'worldbook'); })],
      body: UI.tabs([
        { label: '双库管控', icon: 'worldbook', body: function () { return dual; }, badge: W.entries.length },
        { label: '书目与方案', icon: 'layers', body: function () { return books; }, badge: W.books.length }
      ], { idBase: 'p3-wb' })
    };
  };

  /* ============================================================
     3. 上下文合成器 —— 本代系统段的展示件
     ============================================================ */
  P.preset = function (h, ico, UI, D, L) {
    var blocks = window.APP.state.blocks;
    var ZONES = [
      { k: 'primacy', n: '系统基线', l: 'PRIMACY · 开头 · 注意力高', d: '规则、格式、契约、角色设定。这里的内容永不裁剪。' },
      { k: 'reference', n: '参考区', l: 'REFERENCE · 中段 · 被动查阅', d: '世界书、场景静态、大总结、recall 结果。预算不足时优先从这里裁。' },
      { k: 'recency', n: '行动区', l: 'RECENCY · 末尾 · 注意力最高', d: '玩家输入、状态条、动态变化、活伏笔、纠错回喂。固定不裁。' }
    ];

    var zoneHost = h('div.zone-stack', { id: 'p3-zones' });
    var budgetHost = h('div', { id: 'p3-budget' });
    var curveHost = h('div.ucurve', { id: 'p3-ucurve' });
    var inspect = h('div', { id: 'p3-blk-inspect' });
    var dragId = null;

    function sum(zone) {
      return blocks.filter(function (b) { return b.zone === zone && b.on; })
        .reduce(function (a, b) { return a + b.tokens; }, 0);
    }
    function total() { return sum('primacy') + sum('reference') + sum('recency'); }

    function paintZones() {
      UI.clear(zoneHost);
      ZONES.forEach(function (z) {
        var body = h('div.zone-body');
        blocks.filter(function (b) { return b.zone === z.k; }).forEach(function (b) {
          var el = h('div.blk', {
            draggable: 'true', dataset: { id: b.id, on: String(b.on) }, tabindex: '0',
            onclick: function () { paintInspect(b); },
            onkeydown: function (e) { if (e.key === 'Enter') paintInspect(b); }
          },
            ico('sort', 'ico ico--sm bk-grip'),
            h('span.chip' + (b.kind === '预设槽' ? '.chip--gold' : (b.kind === '系统基线' ? '.chip--red' : '.chip--cyan')), { class: 'bk-kind', text: b.kind }),
            h('div', null, h('div.bk-n', { text: b.name }), h('div.bk-l', { text: b.latin })),
            h('span.bk-tok', { text: b.tokens + ' tok' }),
            switchEl(h, b.on, function (v) { b.on = v; el.dataset.on = String(v); paintBudget(); paintCurve(); })
          );
          el.addEventListener('dragstart', function () { dragId = b.id; el.classList.add('is-drag'); });
          el.addEventListener('dragend', function () { el.classList.remove('is-drag'); UI.$$('.blk').forEach(function (x) { x.classList.remove('is-over'); }); });
          el.addEventListener('dragover', function (e) { e.preventDefault(); el.classList.add('is-over'); });
          el.addEventListener('dragleave', function () { el.classList.remove('is-over'); });
          el.addEventListener('drop', function (e) {
            e.preventDefault();
            el.classList.remove('is-over');
            if (!dragId || dragId === b.id) return;
            var from = -1, to = -1;
            blocks.forEach(function (x, i) { if (x.id === dragId) from = i; if (x.id === b.id) to = i; });
            if (from < 0 || to < 0) return;
            var moved = blocks.splice(from, 1)[0];
            moved.zone = b.zone;
            blocks.splice(to, 0, moved);
            paintZones(); paintBudget(); paintCurve();
            tell('已移动块：' + moved.name, '现位于「' + (ZONES.filter(function (z2) { return z2.k === moved.zone; })[0] || {}).n + '」第 ' + (to + 1) + ' 位', 'info', 'sort');
          });
          body.appendChild(el);
        });
        zoneHost.appendChild(h('section.zone', { dataset: { zone: z.k } },
          h('div.zone-head', null,
            h('div', null, h('div.zh-n', { text: z.n }), h('div.zh-l', { text: z.l })),
            h('span.zh-t', { text: sum(z.k) + ' tok' })),
          h('p', { class: 'field-hint', style: { padding: '0 13px 4px' }, text: z.d }),
          body));
      });
    }

    function paintBudget() {
      UI.clear(budgetHost);
      var a = sum('primacy'), b2 = sum('reference'), c = sum('recency'), t = a + b2 + c;
      var cap = 5000;
      budgetHost.appendChild(h('div.budget', null,
        h('div.bd-h', null, h('span.bd-n', { text: 'token 预算' }),
          h('span', { class: 'u-faint', style: { 'font-size': 'var(--fs-2xs)' }, text: '上限 ' + cap }),
          h('span.bd-v', { text: t + '' })),
        h('div.seg-bar', null,
          h('i', { style: { width: (a / cap * 100) + '%', background: 'var(--safelight)' } }),
          h('i', { style: { width: (b2 / cap * 100) + '%', background: 'var(--silver-3)' } }),
          h('i', { style: { width: (c / cap * 100) + '%', background: 'var(--cyan)' } })),
        h('div.legend', null,
          h('span', null, h('i', { style: { background: 'var(--safelight)' } }), h('span', { text: '基线 ' + a })),
          h('span', null, h('i', { style: { background: 'var(--silver-3)' } }), h('span', { text: '参考 ' + b2 })),
          h('span', null, h('i', { style: { background: 'var(--cyan)' } }), h('span', { text: '行动 ' + c })),
          h('span', null, h('i', { style: { background: 'var(--room-4)' } }), h('span', { text: '余量 ' + Math.max(0, cap - t) }))),
        t > cap ? h('p', { class: 'field-hint', style: { color: 'var(--safelight-2)' }, text: '已超预算 ' + (t - cap) + ' tok。降级顺序：recall 结果 → 世界书低 order 条目 → 小总结 → 场景静态；行动区与基线永不裁剪。' })
          : h('p', { class: 'field-hint', text: '预算充裕。降级顺序：recall 结果 → 世界书低 order 条目 → 小总结 → 场景静态。' })
      ));
    }

    function paintCurve() {
      UI.clear(curveHost);
      var NS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 300 120');
      svg.setAttribute('preserveAspectRatio', 'none');

      var defs = document.createElementNS(NS, 'defs');
      var g = document.createElementNS(NS, 'linearGradient');
      g.setAttribute('id', 'ugrad'); g.setAttribute('x1', '0'); g.setAttribute('x2', '0'); g.setAttribute('y1', '0'); g.setAttribute('y2', '1');
      [['0%', 'var(--safelight)', '.55'], ['100%', 'var(--safelight)', '0']].forEach(function (s) {
        var st = document.createElementNS(NS, 'stop');
        st.setAttribute('offset', s[0]); st.setAttribute('stop-color', s[1]); st.setAttribute('stop-opacity', s[2]);
        g.appendChild(st);
      });
      defs.appendChild(g); svg.appendChild(defs);

      /* U 型：两端高中间低 */
      var pts = [];
      for (var x = 0; x <= 300; x += 6) {
        var u = x / 300;
        var y = 100 - 84 * (Math.pow(2 * u - 1, 2) * 0.86 + 0.14);
        pts.push([x, y]);
      }
      var dLine = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L');
      var fill = document.createElementNS(NS, 'path');
      fill.setAttribute('class', 'u-fill');
      fill.setAttribute('d', dLine + ' L300,120 L0,120 Z');
      var line = document.createElementNS(NS, 'path');
      line.setAttribute('class', 'u-line');
      line.setAttribute('d', dLine);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(fill); svg.appendChild(line);

      /* 三区分界 */
      var a = sum('primacy'), b2 = sum('reference'), c = sum('recency'), t = Math.max(1, a + b2 + c);
      [a / t, (a + b2) / t].forEach(function (r) {
        var ln = document.createElementNS(NS, 'line');
        ln.setAttribute('class', 'u-axis');
        ln.setAttribute('x1', (r * 300).toFixed(1)); ln.setAttribute('x2', (r * 300).toFixed(1));
        ln.setAttribute('y1', '4'); ln.setAttribute('y2', '116');
        ln.setAttribute('vector-effect', 'non-scaling-stroke');
        svg.appendChild(ln);
      });

      [['基线', 6, 'start'], ['参考区', 150, 'middle'], ['行动区', 294, 'end']].forEach(function (s) {
        var tx = document.createElementNS(NS, 'text');
        tx.setAttribute('class', 'u-lab');
        tx.setAttribute('x', String(s[1])); tx.setAttribute('y', '114');
        tx.setAttribute('text-anchor', s[2]);
        tx.textContent = s[0];
        svg.appendChild(tx);
      });

      curveHost.appendChild(svg);
    }

    function paintInspect(b) {
      UI.clear(inspect);
      inspect.appendChild(h('div.stack-sm', null,
        h('div.sec-title', null, h('span.st-t', { text: b.name }), h('span.st-l', { text: b.latin }), h('i.st-line')),
        UI.kv('归属区', (ZONES.filter(function (z) { return z.k === b.zone; })[0] || {}).n || b.zone),
        UI.kv('类型', b.kind),
        UI.kv('注入位置', b.pos),
        UI.kv('token', b.tokens),
        UI.kv('状态', b.on ? '启用' : '停用'),
        h('p', { class: 'field-hint', style: { 'margin-top': '8px' }, text: b.note }),
        h('div.field-row', null, h('label.field-label', { text: '块内容（原样注入）' }),
          h('textarea.field', { rows: '5', text: b.note }))
      ));
    }

    paintZones(); paintBudget(); paintCurve(); paintInspect(blocks[0]);

    var composerTab = h('div.composer', null,
      zoneHost,
      h('div.stack', null,
        h('div.sec-title', null, h('span.st-t', { text: 'U 型注意力' }), h('span.st-l', { text: 'Attention' }), h('i.st-line')),
        curveHost,
        h('p.field-hint', { text: '基于 transformer 对首尾的高注意力：把强力内容放两端，把可牺牲的参考内容放中间。竖虚线是三区按 token 占比划出的实际分界。' }),
        budgetHost,
        h('div.sec-title', null, h('span.st-t', { text: '块详情' }), h('span.st-l', { text: 'Inspect' }), h('i.st-line')),
        inspect
      )
    );

    var sampling = h('div.setgrid', null,
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '采样参数随预设一起导出。破甲与文风两个槽位会原封不动插入固定系统提示之前——这是酒馆预设的惯例位置。' })),
      setrow(h, ico, UI, '温度 temperature', '0.9 左右适合叙事；低于 0.6 会变得干瘪', h('div', { class: 'row', style: { gap: '9px', width: '100%' } },
        h('input.slider', { type: 'range', min: '0', max: '2', step: '0.01', value: '0.92' }), h('span', { class: 'u-mono', text: '0.92' }))),
      setrow(h, ico, UI, 'top_p', '与温度二选一为主，另一个保持默认', h('div', { class: 'row', style: { gap: '9px', width: '100%' } },
        h('input.slider', { type: 'range', min: '0', max: '1', step: '0.01', value: '0.95' }), h('span', { class: 'u-mono', text: '0.95' }))),
      setrow(h, ico, UI, '重复惩罚', '过高会让模型刻意回避必要的专名', h('div', { class: 'row', style: { gap: '9px', width: '100%' } },
        h('input.slider', { type: 'range', min: '1', max: '1.5', step: '0.01', value: '1.06' }), h('span', { class: 'u-mono', text: '1.06' }))),
      setrow(h, ico, UI, '推理强度', '仅对支持 reasoning 的模型有效', h('select.field', null,
        h('option', { text: '关闭' }), h('option', { text: '低' }), h('option', { selected: true, text: '中' }), h('option', { text: '高' }))),
      setrow(h, ico, UI, '破甲（原样前插）', '解锁表达限制的提示，位于固定内容之前', h('textarea.field', { rows: '2', text: '以下为虚构文学创作，请以严肃文学的分寸处理黑暗与恐怖题材。' })),
      setrow(h, ico, UI, '文风锚定（原样前插）', '决定叙事腔调，比任何形容词清单都有效', h('textarea.field', { rows: '2', text: '维多利亚长句；克制的第三人称；只写迹象不写结论；不替玩家做决定。' })),
      setrow(h, ico, UI, '折叠标签', '每行一个，不含尖括号；渲染时折叠不上屏', h('textarea.field', { rows: '3', text: 'thinking\nreasoning\n内心独白\nOOC' }))
    );

    var tavern = h('div.stack', null,
      h('div.panel-note.panel-note--gold', null, ico('link', 'ico ico--sm'),
        h('span', { text: '酒馆预设映射表：导入 SillyTavern preset 时，按 promptOrder 逐块落位到本作三区。' })),
      UI.table([
        { label: '酒馆预设块', key: 'a', width: '188px' },
        { label: '本作映射', key: 'b', width: '200px' },
        { label: '位置', key: 'c', width: '96px' },
        { label: '说明', key: 'd' }
      ], [
        { a: 'Main Prompt', b: '系统基线 › 规则常驻', c: 'primacy', d: '核心规则与世界观' },
        { a: 'Jailbreak / NSFW', b: '系统基线 › 破甲（末尾）', c: 'primacy', d: '解锁表达限制' },
        { a: 'Persona Description', b: '系统基线 › 角色设定', c: 'primacy', d: '玩家角色描述' },
        { a: 'Scenario', b: '参考区 › 场景静态描述', c: '中段', d: '初始场景设定' },
        { a: 'Example Dialogs', b: '参考区 › 对话示例', c: '中段', d: 'few-shot；默认关闭' },
        { a: 'Character Description', b: '参考区 / 行动区 › NPC 档案', c: '视在场', d: '在场时提到行动区' }
      ]),
      h('div.row', { style: { gap: '8px' } },
        act('导入 preset JSON', 'upload', function () { tell('导入器已就绪', '按 promptOrder 顺序逐块落位；未识别的块会列出待你手动指派。', 'info', 'upload'); }),
        act('导出当前预设', 'download', function () { tell('已导出预设', 'preset-darkroom.json · ' + blocks.filter(function (b) { return b.on; }).length + ' 块 · ' + total() + ' tok', 'good', 'download'); }),
        act('另存为新套', 'save', function () { tell('已另存', '「显影室 · 侦探向」已加入预设列表', 'good', 'save'); }))
    );

    var preview = h('div.stack', null,
      h('div.panel-note', null, ico('eye', 'ico ico--sm'),
        h('span', { text: '这是本回合实际会发出的提示词骨架（内容已折叠为摘要）。顺序即注入顺序。' })),
      h('div.jsonbox', null, h('span', {
        text: blocks.filter(function (b) { return b.on; }).map(function (b, i) {
          return String(i + 1).padStart(2, '0') + '  [' + b.zone.toUpperCase().slice(0, 4) + ']  ' + b.name + '  (' + b.tokens + ' tok)\n    ' + b.note;
        }).join('\n\n')
      }))
    );

    return {
      actions: [act('复原提示词方案', 'undo', function () {
        window.APP.state.blocks = D.BLOCKS.map(function (b) { return Object.assign({}, b); });
        tell('已复原为默认方案', '', 'info', 'undo');
        document.dispatchEvent(new CustomEvent('p3:open', { detail: { id: 'preset' } }));
      })],
      body: UI.tabs([
        { label: '三区装配', icon: 'preset', body: function () { return composerTab; }, badge: blocks.length },
        { label: '采样与槽位', icon: 'sliders', body: function () { return sampling; } },
        { label: '酒馆映射', icon: 'link', body: function () { return tavern; } },
        { label: '注入预览', icon: 'eye', body: function () { return preview; } }
      ], { idBase: 'p3-pre' })
    };
  };

  /* ============================================================
     4. API 管线
     ============================================================ */
  P.api = function (h, ico, UI, D, L) {
    var PL = D.PIPELINE;

    var tiers = h('div.stack', null,
      h('div.panel-note.panel-note--warn', null, ico('warning', 'ico ico--sm'),
        h('span', { text: '三档互斥：变量更新的方式在三档下完全不同，同时启用会互相覆盖。切档时系统会自动关闭另两档的相关管线。' })),
      h('div.tilegrid', null, PL.tiers.map(function (t) {
        return h('button.tile', {
          type: 'button', style: PL.tier === t.k ? { 'border-color': 'var(--safelight)', 'box-shadow': '0 0 0 1px var(--safelight)' } : null,
          onclick: function () {
            PL.tier = t.k;
            tell('已切到' + t.n, t.d, 'good', t.icon);
            document.dispatchEvent(new CustomEvent('p3:open', { detail: { id: 'api' } }));
          }
        },
          h('div.tl-h', null, ico(t.icon, 'ico ico--sm'), h('span.tl-n', { text: t.n }),
            PL.tier === t.k ? h('span.chip.chip--red', { text: '当前' }) : null),
          h('div.tl-v', { text: t.calls + ' 次' }),
          h('div.tl-d', { text: t.d }));
      })),
      h('div.sec-title', null, h('span.st-t', { text: '当前档位的回合时序' }), h('span.st-l', { text: 'Sequence' }), h('i.st-line')),
      h('div.warlog', null, (PL.tier === 'single' ? [
        '① 合成上下文（三区装配 + 预算裁剪）',
        '② 主 API 单次阻塞调用，输出 content / action / event / recall / state_update',
        '③ 容错解析：缺标签则强提 JSON 兜底，绝不拦截回合',
        '④ Zod 校验 + 实体注册表消解 → 执行变量更新',
        '⑤ 渲染显影 + 写入小总结（本地规则生成，不再调用）'
      ] : (PL.tier === 'multi' ? [
        '① 合成上下文（正文用精简版，变量用完整版）',
        '② 主 API 阻塞调用，只出正文与选项',
        '③ 渲染显影（玩家已可阅读）',
        '④ 次 API 后台异步：state_update + 小总结',
        '⑤ 可选：检索 API 交火（embeddings 初筛 + rerank 精排）写入下回合 recall'
      ] : [
        '① world-agent 接单，读取当前状态与工具清单',
        '② 工具调用循环（默认上限 5 次，可配 3–7）',
        '③ 可选领域 agent：soul（NPC 内心）/ rules（判定）按需启用 0–5 个',
        '④ 汇总为一次正文输出 + 一组变量补丁',
        '⑤ 超出调用上限时优雅降级为单调用档，保证回合完成'
      ])).map(function (s, i) {
        return h('div.wl', null, h('span.r', { text: String(i + 1) }), h('span', { text: s.replace(/^[①②③④⑤]\s*/, '') }));
      }))
    );

    var lanes = h('div.stack', null,
      h('div.stack-sm', null, PL.lanes.map(function (ln) {
        return h('section.plate', null,
          h('div.plate-head', null, ico(ln.id === 'main' ? 'quill' : (ln.id === 'var' ? 'variable' : (ln.id === 'rag' ? 'target' : 'camera')), 'ico ico--sm'),
            h('div.grow', null, h('div.ttl', { text: ln.n }), h('span.eyebrow', { text: ln.latin })),
            switchEl(h, ln.on, function (v) { ln.on = v; tell(ln.n + (v ? ' 已启用' : ' 已停用'), ln.note, 'info', 'api'); })),
          h('div.plate-body.stack-sm', null,
            h('div.grid-2', null,
              h('div.field-row', null, h('label.field-label', { text: '反代 URL' }), h('input.field', { value: ln.url })),
              h('div.field-row', null, h('label.field-label', { text: '模型名称' }), h('input.field', { value: ln.model }))),
            h('div.grid-3', null,
              h('div.field-row', null, h('label.field-label', { text: 'API Key' }), h('input.field', { type: 'password', value: '................' })),
              h('div.field-row', null, h('label.field-label', { text: '温度' }), h('input.field', { value: String(ln.temp) })),
              h('div.field-row', null, h('label.field-label', { text: '超时（秒）' }), h('input.field', { value: '120' }))),
            h('p.field-hint', { text: ln.note }),
            h('div.row', { style: { gap: '6px' } },
              act('拉取模型列表', 'download', function () { tell('原型阶段不发起真实请求', '此按钮在正式版会调用 /v1/models', 'warn', 'api'); }),
              act('测试连通', 'target', function () { tell('原型阶段不发起真实请求', '', 'warn', 'api'); }),
              act('保存', 'save', function () { tell('已保存 ' + ln.n + ' 配置', '', 'good', 'save'); })))
        );
      }))
    );

    var rag = h('div.setgrid', null,
      h('div.panel-note', null, ico('target', 'ico ico--sm'),
        h('span', { text: '交火模式：向量初筛（embeddings）保留大量候选，再用 rerank 精排到 TopK。两段模型可以来自不同供应商。' })),
      setrow(h, ico, UI, '启用交火模式', '关闭时只用大总结 + recall 点名', switchEl(h, PL.rag.crossfire, function (v) { PL.rag.crossfire = v; tell('交火模式' + (v ? '已启用' : '已关闭'), v ? '将额外消耗一次 embeddings 与一次 rerank 调用' : '', 'info', 'target'); })),
      setrow(h, ico, UI, '向量初筛上限', '保留的最大候选条目数（建议 1000）', h('input.field', { type: 'number', value: String(PL.rag.prefilter) })),
      setrow(h, ico, UI, '最终覆盖 TopK', '送给精排裁决的精选条目数（建议 200）', h('input.field', { type: 'number', value: String(PL.rag.topK) })),
      setrow(h, ico, UI, '相似度阈值', '低于此值的纪要直接剔除（建议 0.45）', h('input.field', { value: String(PL.rag.threshold) })),
      setrow(h, ico, UI, '防失忆固定注入', '不参与排序、强制注入的最近回合数', h('input.field', { type: 'number', value: String(PL.rag.recent) })),
      setrow(h, ico, UI, '每批处理行数', '重建索引时的批大小（建议 30–50）', h('input.field', { type: 'number', value: String(PL.rag.batch) })),
      h('div.row', { style: { gap: '8px' } },
        act('修复向量索引', 'refresh', function () { tell('已排入修复队列', '将重建 0 条向量（原型阶段无本地索引）', 'info', 'refresh'); }),
        act('清除本地向量', 'trash', function () {
          UI.confirm({ title: '清除本地向量索引', msg: '清除后首次检索会重新建索引，可能较慢。编年史与世界书本身不受影响。', icon: 'trash', okText: '清除', countdown: 12 })
            .then(function (ok) { if (ok) tell('已清除本地向量', '', 'warn', 'trash'); });
        }, '.btn--danger'))
    );

    return {
      sub: 'PIPELINE · 当前：' + window.APP.tierLabel(),
      body: UI.tabs([
        { label: '执行档位', icon: 'layers', body: function () { return tiers; } },
        { label: '管线', icon: 'api', body: function () { return lanes; }, badge: PL.lanes.length },
        { label: 'RAG 交火', icon: 'target', body: function () { return rag; } }
      ], { idBase: 'p3-api' })
    };
  };

  /* ============================================================
     5. 变量编辑器
     ============================================================ */
  P.vars = function (h, ico, UI, D, L) {
    var patch = [
      { op: 'replace', path: '/stat_data/灵性/current', value: 36, ok: true },
      { op: 'replace', path: '/stat_data/理智/current', value: 39, ok: true },
      { op: 'add', path: '/world_data/伏笔/-', value: '被涂黑的第七条守则', ok: true },
      { op: 'replace', path: '/npc_data/班森·莫雷蒂/好感', value: 89, ok: true },
      { op: 'add', path: '/stat_data/金镑', value: '大量', ok: false, err: '类型错误：期望 number，收到 string「大量」' },
      { op: 'replace', path: '/npc_data/塞尔玛·安提戈努斯/alive', value: true, ok: false, err: '实体注册表冲突：该角色当前不在场，且未被 recall 点名' }
    ];

    var json = '{\n  "stat_data": {\n    "灵性": { "current": 36, "max": 42 },\n    "理智": { "current": 39, "max": 45 }\n  },\n  "world_data": {\n    "伏笔": ["祖父的怀表走时偏快", "被涂黑的第七条守则"]\n  },\n  "npc_data": {\n    "班森·莫雷蒂": { "好感": 89, "known_by": ["克莱恩"] }\n  }\n}';

    var patchTab = h('div.stack', null,
      h('div.panel-note.panel-note--warn', null, ico('shield', 'ico ico--sm'),
        h('span', { text: '模型只能申请变量更新，系统执行并返回结果。每条补丁都过 Zod 校验与实体注册表消解；不合法的补丁被丢弃并回喂一条纠错消息，但绝不因此拦截整个回合。' })),
      h('div.stack-sm', null, patch.map(function (p) {
        return h('div.lcard', { style: p.ok ? null : { 'border-color': 'color-mix(in srgb, var(--warn) 60%, transparent)' } },
          ico(p.ok ? 'check' : 'warning', 'ico lc-ico'),
          h('div', null,
            h('div', { class: 'u-mono', style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt)' }, text: p.op + '  ' + p.path + '  =  ' + JSON.stringify(p.value) }),
            h('div.lc-d', { text: p.ok ? '校验通过 · 已执行' : p.err })),
          h('span.chip' + (p.ok ? '.chip--gold' : '.chip--red'), { text: p.ok ? '已执行' : '已驳回' }));
      })),
      h('div.row', { style: { gap: '8px' } },
        act('提取 AI 最新指令', 'download', function () { tell('已提取', '本回合模型输出的 6 条 JSON Patch 已载入编辑器', 'good', 'download'); }),
        act('重新演算变量', 'refresh', function () { tell('已重新演算', '用当前状态与本回合正文重跑一次变量更新', 'info', 'refresh'); }),
        act('一键智能修复', 'spark', function () { tell('已修复 2 处', '「大量」→ 3（按上下文推断）；塞尔玛的 alive 补丁被永久丢弃', 'good', 'spark'); }))
    );

    var jsonTab = h('div.stack', null,
      h('div.field-row', null, h('label.field-label', { text: 'JSON Patch 指令（可直接编辑后执行）' }),
        h('textarea.field', { rows: '14', style: { 'font-size': 'var(--fs-xs)' }, text: json })),
      h('div.row', { style: { gap: '8px' } },
        h('button.btn.btn--primary.btn--sm', { type: 'button', onclick: function () { tell('已执行指令', '4 项变更已写入 · 2 项被 Zod 驳回', 'good', 'check'); } },
          ico('play', 'ico ico--sm'), h('span', { text: '执行指令' })),
        act('复制', 'copy', function () { tell('已复制', '', 'good', 'copy'); }),
        act('清空', 'trash', function () { tell('已清空指令区', '', 'info', 'trash'); }))
    );

    var visTab = h('div.setgrid', null,
      h('div.panel-note', null, ico('eyeOff', 'ico ico--sm'),
        h('span', { text: 'known_by 视角过滤：变量对模型的可见性由「谁知道这件事」决定。玩家不知道的事，模型也拿不到——这是「不全知」的实现方式。' })),
      [
        { n: 'stat_data（自身六维与序列）', d: '玩家自己的数值，始终可见', on: true, lock: true },
        { n: 'world_data.伏笔', d: '仅注入 known_by 含玩家的活伏笔', on: true },
        { n: 'world_data.世界事件', d: '未接触的事件不注入，只经报纸/NPC 提及', on: false },
        { n: 'npc_data.好感', d: '注入模糊档位（信任/警惕）而非精确数值', on: true },
        { n: 'npc_data.隐藏动机', d: '默认不注入；被 recall 点名时才给', on: false },
        { n: 'npc_data.alive', d: '实体注册表：死者不复活的硬约束', on: true, lock: true }
      ].map(function (r) {
        return setrow(h, ico, UI, r.n, r.d, r.lock ? h('span.chip.chip--red', { text: '强制' }) : switchEl(h, r.on, function (v) { tell(r.n + (v ? ' 已对模型可见' : ' 已对模型隐藏'), '', 'info', v ? 'eye' : 'eyeOff'); }));
      })
    );

    return {
      body: UI.tabs([
        { label: '本轮补丁', icon: 'variable', body: function () { return patchTab; }, badge: patch.filter(function (p) { return !p.ok; }).length || null },
        { label: '指令中心', icon: 'hash', body: function () { return jsonTab; } },
        { label: '可见性', icon: 'eyeOff', body: function () { return visTab; } }
      ], { idBase: 'p3-var' })
    };
  };

  /* ============================================================
     6. 记忆精炼器
     ============================================================ */
  P.memory = function (h, ico, UI, D, L) {
    var C = L.chronicle;
    return {
      body: h('div.proj-pad.stack', null,
        h('div.panel-note.panel-note--gold', null, ico('distill', 'ico ico--sm'),
          h('span', { text: '两级精炼：一级把小总结压成大总结（保留因果与专名）；二级对大总结再做一次「提炼精华」（只留会影响未来判断的事实）。两级都可指定独立 API。' })),
        h('div.grid-3', null,
          h('div.tile', null, h('div.tl-h', null, ico('list', 'ico ico--sm'), h('span.tl-n', { text: '小总结' })),
            h('div.tl-v', { text: String(C.minor.length) }), h('div.tl-d', { text: '每回合自动生成，40–80 字' })),
          h('div.tile', null, h('div.tl-h', null, ico('chronicle', 'ico ico--sm'), h('span.tl-n', { text: '大总结' })),
            h('div.tl-v', { text: String(C.grand.length) }), h('div.tl-d', { text: '每 20 回合压缩一次' })),
          h('div.tile', null, h('div.tl-h', null, ico('spark', 'ico ico--sm'), h('span.tl-n', { text: '精华' })),
            h('div.tl-v', { text: '0' }), h('div.tl-d', { text: '二次精炼产物，尚未生成' }))),
        h('div.setgrid', null,
          setrow(h, ico, UI, '大总结截取区间', '从第 N 条小总结开始压缩', h('div', { class: 'row', style: { gap: '6px' } },
            h('input.field', { type: 'number', value: '1', style: { width: '78px' } }),
            h('span', { class: 'u-faint', text: '至' }),
            h('input.field', { type: 'number', value: '20', style: { width: '78px' } }))),
          setrow(h, ico, UI, '近期小总结条数', '注入参考区的最近条数（默认 20）', h('input.field', { type: 'number', value: '20' })),
          setrow(h, ico, UI, '保留大总结共存', '压缩后仍保留原始小总结在历史孔隙', switchEl(h, true)),
          setrow(h, ico, UI, '别名洗白（ALIAS_MAP）', '把「邓恩队长/史密斯队长/队长」统一为「邓恩·史密斯」', switchEl(h, true)),
          setrow(h, ico, UI, '总结用 API', '可与正文模型不同', h('select.field', null,
            h('option', { text: '跟随正文模型' }), h('option', { selected: true, text: '变量模型（便宜快速）' }), h('option', { text: '独立配置' })))),
        h('div.row', { style: { gap: '8px' } },
          h('button.btn.btn--primary', { type: 'button', onclick: function () { tell('开始压缩', '小总结 1–20 → 1 条大总结（预计 168 tok）', 'good', 'distill'); } },
            ico('distill', 'ico ico--sm'), h('span', { text: '开始压缩大总结' })),
          act('开始二次精炼', 'spark', function () { tell('开始提炼记忆精华', '4 条大总结 → 1 条精华（只留影响未来判断的事实）', 'info', 'spark'); }),
          act('写入世界书', 'worldbook', function () { tell('已写入世界书', '主库「本周目经历」新增 1 条常驻条目', 'good', 'worldbook'); }),
          act('快照序号修正', 'sort', function () { tell('序号已修正', '检测到 0 处断号', 'good', 'check'); }))
      )
    };
  };

  /* ============================================================
     7. 一键生图
     ============================================================ */
  P.imagine = function (h, ico, UI, D, L) {
    var presets = [
      { n: '维多利亚湿版', p: 'wet plate collodion, victorian, sepia, shallow depth, gaslight' },
      { n: '蓝晒工程图', p: 'cyanotype blueprint, white line on prussian blue, technical drawing' },
      { n: '银版肖像', p: 'daguerreotype portrait, mirror-like silver, mid-1800s, formal pose' },
      { n: '灵异双重曝光', p: 'spirit photography, double exposure, faint translucent figure, grain' }
    ];
    var preview = h('div.devpreview', null, h('div.dp-hint', { text: '显影盘空置 · 按下「开始显影」后此处出现图像' }));

    return {
      body: h('div.proj-pad', null,
        h('div', { class: 'grid-2', style: { 'grid-template-columns': 'minmax(0,1fr) minmax(0,340px)', 'align-items': 'start' } },
          h('div.stack', null, preview,
            h('div.panel-note', null, ico('info', 'ico ico--sm'),
              h('span', { text: '提示词由本回合正文自动抽取（场景 + 光线 + 在场人物 + 情绪），再叠加你选择的摄影风格预设。原型阶段不发起真实请求。' }))),
          h('div.stack', null,
            h('div.sec-title', null, h('span.st-t', { text: '摄影风格' }), h('span.st-l', { text: 'Process' }), h('i.st-line')),
            h('div.stack-sm', null, presets.map(function (p, i) {
              return h('button.lcard', {
                type: 'button', style: i === 0 ? { 'border-color': 'var(--safelight)' } : null,
                onclick: function () { tell('已选择：' + p.n, p.p, 'info', 'camera'); }
              }, ico('camera', 'ico lc-ico'),
                h('div', null, h('div.lc-t', { text: p.n }), h('div.lc-d', { class: 'u-mono', text: p.p })));
            })),
            h('div.field-row', null, h('label.field-label', { text: '提示词（可编辑）' }),
              h('textarea.field', { rows: '4', text: '狭窄的维多利亚卧室，晨雾从窗帘缝隙渗入，煤气灯余烬，书桌上摊开的硬皮笔记与黄铜怀表，一名苍白的年轻男子背光而坐；wet plate collodion, victorian, sepia, gaslight' })),
            h('div.grid-2', null,
              h('div.field-row', null, h('label.field-label', { text: '宽度' }), h('input.field', { type: 'number', value: '1024' })),
              h('div.field-row', null, h('label.field-label', { text: '高度' }), h('input.field', { type: 'number', value: '768' }))),
            h('button.btn.btn--primary.btn--block', {
              type: 'button', onclick: function () {
                window.FX.flash(); window.FX.play('shutter');
                UI.clear(preview);
                preview.appendChild(h('div', { class: 'col', style: { 'align-items': 'center', gap: '12px' } },
                  h('div.tray-spinner'),
                  h('div.dp-hint', { text: '正在显影…… 原型阶段不发起真实请求' })));
                setTimeout(function () {
                  UI.clear(preview);
                  preview.appendChild(h('div.dp-hint', { text: '原型阶段无生图后端 · 界面与流程已完整' }));
                  tell('显影中断', '未配置生图 API。正式版会在此处呈现图像并可存入图鉴。', 'warn', 'camera');
                }, 2100);
              }
            }, ico('camera', 'ico ico--sm'), h('span', { text: '开始显影' })))))
    };
  };

  /* ============================================================
     8. 内容包
     ============================================================ */
  P.packs = function (h, ico, UI, D, L) {
    var packs = [
      { n: '第五纪 · 廷根篇', v: '1.4.0', on: true, d: '基础时代表、廷根市地图、值夜者小队 NPC、占卜家途径序列 9–7', size: '412 条' },
      { n: '二十二途径全表', v: '1.1.2', on: true, d: '二十二条途径的序列名、魔药主材料与扮演法要点', size: '286 条' },
      { n: '战术推演规则包', v: '0.9.4', on: true, d: '地形表、能力白名单模板、战报格式、战斗经验曲线', size: '154 条' },
      { n: '贝克兰德篇', v: '0.3.0', on: false, d: '首都地图、上流社交、塔罗会集会地点（开发中）', size: '96 条' },
      { n: '海上与殖民地', v: '0.1.0', on: false, d: '航线、风暴教会、白银之城传闻（开发中）', size: '48 条' }
    ];

    var installed = h('div.stack', null,
      h('div.panel-note', null, ico('dlc', 'ico ico--sm'),
        h('span', { text: '内容包只提供数据（时代表 / 地图 / 途径 / 规则表），不含提示词与代码。装载后条目会并入世界书主库，并可按包整体启停。' })),
      h('div.stack-sm', null, packs.map(function (p) {
        return h('div.lcard', null,
          ico('dlc', 'ico lc-ico'),
          h('div', null,
            h('div.lc-t', { text: p.n + '  ' }),
            h('div.lc-d', { text: p.d })),
          h('div.lc-r', null,
            h('span.chip' + (p.on ? '.chip--gold' : ''), { text: 'v' + p.v }),
            h('span', { class: 'u-mono', style: { 'font-size': 'var(--fs-3xs)', color: 'var(--txt-3)' }, text: p.size }),
            switchEl(h, p.on, function (v) { tell(p.n + (v ? ' 已装载' : ' 已卸载'), v ? '条目已并入世界书主库' : '相关条目已移入历史孔隙', 'info', 'dlc'); })));
      }))
    );

    var custom = h('div.stack', null,
      h('div.panel-note.panel-note--gold', null, ico('puzzle', 'ico ico--sm'),
        h('span', { text: '自建内容生成器：你给出名称与描述，系统按当前序列与题材生成符合数值区间的物品/能力/NPC，再交由你审阅入库。生成的是数据，不是正文。' })),
      h('div.grid-2', null,
        h('div.field-row', null, h('label.field-label', { text: '类别' }), h('select.field', null,
          h('option', { text: '物品' }), h('option', { text: '序列能力' }), h('option', { text: 'NPC' }), h('option', { text: '地形' }), h('option', { text: '封印物' }))),
        h('div.field-row', null, h('label.field-label', { text: '名称' }), h('input.field', { placeholder: '例：镀银灵摆' }))),
      h('div.field-row', null, h('label.field-label', { text: '内容描述' }),
        h('textarea.field', { rows: '4', placeholder: '例：一枚镀银的黄铜灵摆，链长七寸。持有者在提问明确时能感到牵引；若问题含糊，摆会自行绕圈，并招来注视。' })),
      h('div.grid-3', null,
        h('div.field-row', null, h('label.field-label', { text: '目标等阶' }), h('select.field', null, h('option', { text: '普通' }), h('option', { selected: true, text: '序列9 器物' }), h('option', { text: '封印物 3 级' }))),
        h('div.field-row', null, h('label.field-label', { text: '权重' }), h('input.field', { type: 'number', value: '10' })),
        h('div.field-row', null, h('label.field-label', { text: '排序' }), h('input.field', { type: 'number', value: '50' }))),
      h('div.row', { style: { gap: '8px' } },
        h('button.btn.btn--primary.btn--sm', { type: 'button', onclick: function () { tell('原型阶段不调用模型', '正式版会用变量模型生成一份符合数值区间的草案供你审阅。', 'warn', 'puzzle'); } },
          ico('spark', 'ico ico--sm'), h('span', { text: '开始生成' })),
        act('导入自定义图片', 'upload', function () { tell('图片入口已就位', '将作为该条目在图鉴中的干版肖像', 'info', 'upload'); }))
    );

    return {
      body: UI.tabs([
        { label: '已装内容包', icon: 'dlc', body: function () { return installed; }, badge: packs.filter(function (p) { return p.on; }).length },
        { label: '自建内容', icon: 'puzzle', body: function () { return custom; } }
      ], { idBase: 'p3-pack' })
    };
  };

  /* ============================================================
     9. 设置
     ============================================================ */
  P.settings = function (h, ico, UI, D, L) {
    var st = window.APP.state.settings;

    function skinCards() {
      var box = h('div.skincards');
      window.APP.skins.forEach(function (s) {
        var card = h('button.skincard' + (window.APP.state.skin === s.k ? '.is-on' : ''), {
          type: 'button', onclick: function () {
            window.APP.applySkin(s.k);
            UI.$$('.skincard', box).forEach(function (x) { x.classList.remove('is-on'); });
            card.classList.add('is-on');
          }
        },
          h('div.sw', null, s.sw.map(function (c) { return h('i', { style: { background: c } }); })),
          h('div.sc-n', { text: s.n }),
          h('div.sc-d', { text: s.d }));
        box.appendChild(card);
      });
      return box;
    }

    var general = h('div.setgrid', null,
      h('div.sec-title', null, h('span.st-t', { text: '主题皮肤' }), h('span.st-l', { text: 'Skins' }), h('i.st-line')),
      skinCards(),
      h('div.sec-title', null, h('span.st-t', { text: '布局' }), h('span.st-l', { text: 'Layout' }), h('i.st-line')),
      setrow(h, ico, UI, '端形态', 'PC 端为四区富布局；移动端为单栏 + 底部标签 + 纸袋抽屉', h('select.field', {
        onchange: function () { st.view = this.value; if (this.value !== 'auto') window.APP.applyView(this.value); else window.APP.applyView(window.innerWidth < 860 ? 'mobile' : 'desktop'); }
      },
        h('option', { value: 'auto', selected: st.view === 'auto' ? true : null, text: '自动（按窗口宽度）' }),
        h('option', { value: 'desktop', selected: st.view === 'desktop' ? true : null, text: '强制 PC 端' }),
        h('option', { value: 'mobile', selected: st.view === 'mobile' ? true : null, text: '强制移动端' }))),
      setrow(h, ico, UI, '信息密度', '紧凑模式压缩行高与间距，适合小屏', h('select.field', {
        onchange: function () { st.density = this.value; window.APP.applySettings(); tell('信息密度已切换', this.value === 'compact' ? '紧凑' : '标准', 'info', 'sliders'); }
      },
        h('option', { value: 'normal', selected: st.density !== 'compact' ? true : null, text: '标准' }),
        h('option', { value: 'compact', selected: st.density === 'compact' ? true : null, text: '紧凑' })))
    );

    var display = h('div.setgrid', null,
      setrow(h, ico, UI, '场景底片压暗', '数值越高，正文越清晰、场景越沉', rangeRow(h, 0, 100, st.sceneDim, function (v) { st.sceneDim = v; window.APP.applySettings(); })),
      setrow(h, ico, UI, '场景底片虚化', '窄条与探索态的基础虚化；阅读态另有叠加', rangeRow(h, 0, 16, st.sceneBlur, function (v) { st.sceneBlur = v; window.APP.applySettings(); }, 'px')),
      setrow(h, ico, UI, '正文字号', '整站等比缩放', rangeRow(h, 85, 125, st.fontScale, function (v) { st.fontScale = v; window.APP.applySettings(); }, '%')),
      setrow(h, ico, UI, '显影动画', '关闭后正文直接呈现，不做浮现过程', switchEl(h, st.motion !== 'off', function (v) { st.motion = v ? 'on' : 'off'; window.APP.applySettings(); tell('显影动画' + (v ? '已开启' : '已关闭'), v ? '' : '已同时关闭全站过渡动画', 'info', 'spark'); })),
      setrow(h, ico, UI, '流式输出', '逐段显影而非一次性呈现', switchEl(h, st.stream, function (v) { st.stream = v; })),
      setrow(h, ico, UI, '背景自动轮换', '每若干回合更换场景底片', switchEl(h, false)),
      setrow(h, ico, UI, '特效级别', '低端设备建议「低」，将关闭浮尘与光锥', h('select.field', null,
        h('option', { text: '低' }), h('option', { selected: true, text: '中' }), h('option', { text: '高' })))
    );

    var audio = h('div.setgrid', null,
      h('div.panel-note', null, ico('volume', 'ico ico--sm'),
        h('span', { text: '全部音效由 WebAudio 实时合成，不加载任何音频文件：快门咔哒、药液滴落、幻灯片推入、计时器铃。' })),
      setrow(h, ico, UI, '暗房音效', '默认关闭；开启后需一次用户交互解锁音频上下文', switchEl(h, window.FX.audioOn(), function (v) {
        window.FX.audio(v);
        var lamp = document.getElementById('p3-lamp-audio');
        if (lamp) lamp.classList.toggle('is-on', v);
        tell('暗房音效' + (v ? '已开启' : '已关闭'), '', 'info', v ? 'volume' : 'volumeOff');
      })),
      setrow(h, ico, UI, '音量', '', rangeRow(h, 0, 100, 16, function () { })),
      setrow(h, ico, UI, '试听', '', h('div', { class: 'row', style: { gap: '6px' } },
        ['shutter', 'drip', 'slide', 'bell'].map(function (k) {
          return h('button.btn.btn--xs', { type: 'button', onclick: function () { window.FX.play(k); } },
            h('span', { text: { shutter: '快门', drip: '滴落', slide: '幻灯', bell: '铃' }[k] }));
        })))
    );

    var perf = h('div.setgrid', null,
      setrow(h, ico, UI, '自动备份', '每 20 回合打包节点树与世界书状态', switchEl(h, st.autoBackup, function (v) { st.autoBackup = v; })),
      setrow(h, ico, UI, '控制台输出', '关闭后不向浏览器控制台打印调试信息', switchEl(h, st.console, function (v) { st.console = v; })),
      setrow(h, ico, UI, '浏览器全屏', '进入全屏以获得最大显影面积', h('button.btn.btn--sm', {
        type: 'button', onclick: function () {
          try {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
          } catch (e) { tell('全屏被浏览器拒绝', '可能因为当前处于 file:// 或权限限制', 'warn', 'expand'); }
        }
      }, ico('expand', 'ico ico--sm'), h('span', { text: '切换全屏' }))),
      setrow(h, ico, UI, '重置本地数据', '清除皮肤、布局、设置与本地备份', h('button.btn.btn--sm.btn--danger', {
        type: 'button', onclick: function () {
          UI.confirm({ title: '重置全部本地数据', msg: '皮肤、布局、设置、轨道收放状态与本地备份都会被清除，页面随后刷新。', icon: 'trash', okText: '确认重置', countdown: 20 })
            .then(function (ok) {
              if (!ok) return;
              try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('p3.darkroom.') === 0) localStorage.removeItem(k); }); } catch (e) { /* noop */ }
              tell('已重置', '刷新页面后生效', 'warn', 'trash');
            });
        }
      }, ico('trash', 'ico ico--sm'), h('span', { text: '重置' })))
    );

    var proto = h('div.setgrid', null,
      h('div.panel-note', null, ico('info', 'ico ico--sm'),
        h('span', { text: '协议层设置决定模型输出如何被解析。默认全部开启容错——宁可丢一条补丁，也不能让回合中断。' })),
      setrow(h, ico, UI, '标签自动修复', '未闭合标签自动补齐', switchEl(h, true)),
      setrow(h, ico, UI, 'JSON 兜底提取', '标签缺失时强提最外层 JSON 区块', switchEl(h, true)),
      setrow(h, ico, UI, '格式纠错回喂', '解析失败时把错误摘要注入下回合行动区末尾', switchEl(h, true)),
      setrow(h, ico, UI, '完整性契约', '要求每回合必须输出 state_update（可为空数组）', switchEl(h, true)),
      setrow(h, ico, UI, '解析失败时拦截回合', '默认关闭：容错绝不拦截', switchEl(h, false)),
      setrow(h, ico, UI, '折叠标签', '每行一个，不含尖括号', h('textarea.field', { rows: '4', text: st.collapseTags }))
    );

    var about = h('div.stack', null,
      h('div.paper.paper--bordered', { style: { padding: '26px 28px 30px' } },
        h('div', { style: { 'text-align': 'center' } },
          h('div', { style: { 'font-weight': '900', 'font-size': 'var(--fs-2xl)', 'letter-spacing': '.3em', color: 'var(--ink)', 'margin-left': '.3em' }, text: '诡秘剧场' }),
          h('div', { class: 'u-latin', style: { 'font-size': 'var(--fs-2xs)', color: 'var(--ink-2)', 'margin-top': '8px' }, text: 'Lord of Mysteries · Theatre' }),
          h('div', { class: 'u-mono', style: { 'font-size': 'var(--fs-2xs)', color: 'var(--ink-3)', 'margin-top': '10px' }, text: '前端原型 3 · 灵异显影室 · PROTOTYPE III' })),
        h('hr', { class: 'hairline', style: { margin: '18px 0' } }),
        h('div', { style: { color: 'var(--ink-2)', 'font-size': 'var(--fs-sm)', 'line-height': '1.95' } },
          h('p', { text: '本原型把界面做成一间暗房：正文以显影方式浮现，面板以幻灯机投影，导航是一条底片。它不是换色皮肤，而是换一套隐喻与结构——与原型 1（剧院黑金）、原型 2（差分机黄铜）刻意区分。' }),
          h('p', { style: { 'margin-top': '10px' }, text: '纯前端、零后端、零构建、零依赖。所有数值与文本均为演示内容，不发起任何网络请求（除字体与老卡背景图）。' })),
        h('hr', { class: 'hairline', style: { margin: '18px 0' } }),
        h('div', { class: 'stack-sm' },
          UI.kv('技术形态', 'HTML + 拆分 CSS + 经典 script（双击即开）'),
          UI.kv('图标', '内联 SVG sprite · ' + window.ICONS.names.length + ' 枚 · 零 emoji'),
          UI.kv('字体', 'Noto Serif SC / Bodoni Moda / Courier Prime'),
          UI.kv('面板数', D.FRAMES.length + ' 格底片'),
          UI.kv('无障碍', 'WCAG 焦点环 · aria 标注 · reduced-motion 全量降级'),
          UI.kv('版权', '素材与设定版权归原作者；本原型仅供内部评审'))),
      h('div.row', { style: { gap: '8px' } },
        act('素材授权与致谢', 'scroll', function () { tell('素材来源', '背景图取自旧版酒馆卡素材（i.postimg.cc）；字体来自 Google Fonts；图标为本项目手绘。', 'info', 'scroll', 7000); }),
        act('键盘快捷键', 'question', function () { tell('快捷键', '1/2/3/4 切三态与信札 · M 舆图 · C 图鉴 · P 合成器 · W 世界书 · S 设置 · Esc 关闭幻灯', 'info', 'question', 8000); }))
    );

    return {
      body: UI.tabs([
        { label: '常规', icon: 'settings', body: function () { return general; } },
        { label: '显示', icon: 'eye', body: function () { return display; } },
        { label: '音频', icon: 'volume', body: function () { return audio; } },
        { label: '性能与数据', icon: 'chart', body: function () { return perf; } },
        { label: '协议', icon: 'hash', body: function () { return proto; } },
        { label: '关于', icon: 'info', body: function () { return about; } }
      ], { idBase: 'p3-set' })
    };
  };

  function rangeRow(h, min, max, val, onIn, unit) {
    var out = h('span', { class: 'u-mono', style: { 'min-width': '46px', 'text-align': 'right' }, text: val + (unit || '') });
    var inp = h('input.slider', { type: 'range', min: String(min), max: String(max), value: String(val) });
    inp.addEventListener('input', function () { out.textContent = inp.value + (unit || ''); onIn(Number(inp.value)); });
    return h('div', { class: 'row', style: { gap: '9px', width: '100%' } }, inp, out);
  }

  /* ============================================================
     10. AI 上下文悬浮配置（FAB）
     ============================================================ */
  P.aictx = function (h, ico, UI, D, L) {
    var blocks = window.APP.state.blocks;
    return {
      title: 'AI 上下文速配', sub: 'QUICK CONTEXT · 悬浮配置', icon: 'context', serial: 'SLIDE N° 000',
      actions: [act('打开完整合成器', 'preset', function () { document.dispatchEvent(new CustomEvent('p3:open', { detail: { id: 'preset' } })); })],
      body: h('div.proj-pad.stack', null,
        h('div.panel-note', null, ico('info', 'ico ico--sm'),
          h('span', { text: '这里只做一件事：在不离开剧情的情况下，快速掐掉几个占 token 的块。完整装配请打开上下文合成器。' })),
        h('div.stack-sm', null, blocks.filter(function (b) { return b.zone !== 'recency'; }).map(function (b) {
          return h('div.setrow', null,
            h('div', null, h('div.sr-n', { text: b.name }), h('div.sr-d', { text: b.note })),
            h('div.sr-c', null,
              h('span.bk-tok', { class: 'u-mono', style: { color: 'var(--cyan-2)', 'font-size': 'var(--fs-2xs)' }, text: b.tokens + ' tok' }),
              switchEl(h, b.on, function (v) { b.on = v; tell(b.name + (v ? ' 已启用' : ' 已停用'), v ? '' : '本回合起不再注入，节省 ' + b.tokens + ' tok', 'info', 'context'); })));
        })),
        h('div.row', { style: { gap: '8px' } },
          act('只留基线与行动区', 'filter', function () {
            blocks.forEach(function (b) { b.on = b.zone !== 'reference'; });
            tell('已切到极简上下文', '参考区已全部关闭，预计节省 2380 tok', 'good', 'filter');
            document.dispatchEvent(new CustomEvent('p3:open', { detail: { id: 'aictx' } }));
          }),
          act('全部启用', 'check', function () {
            blocks.forEach(function (b) { b.on = true; });
            tell('已启用全部块', '', 'good', 'check');
            document.dispatchEvent(new CustomEvent('p3:open', { detail: { id: 'aictx' } }));
          }))
      )
    };
  };
})();
