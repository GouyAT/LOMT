/* 系统面板 · 引擎驱动版（覆盖 panels-system.js / panels-story.js 里的演示定义）
   —— 世界书 / 预设 / 世界地图：数据全部来自 GUIMI_ENGINE；未导入 = 空态，零内置题材内容
   —— 布局对齐酒馆(SillyTavern)世界书/预设管理：
       世界书 = 顶部全局激活设置(可展开) + 左侧书列表(搜索/创建/导入) + 右侧条目表格
        (列头排序 · 分页 · 行内字段即改即存 · 点击行在行下展开全字段编辑器 · 复制/删除)
       预设 = 左侧预设列表(搜索/激活) + 右侧采样参数(全键中文·即改即存) + 提示块列表(拖动排序·行内展开)
   覆盖顺序：本文件在 panels-system.js 之后、app.js 之前加载；P.* 后写覆盖先写 */
(function () {
  'use strict';

  var P = (window.PANELS = window.PANELS || {});
  var B = window.PANELBITS || {};
  var act = B.act || function (label, icon, fn) {
    return window.UI.h('button.btn.btn--sm', { type: 'button', onclick: fn },
      window.UI.ico(icon || 'tag', 'ico ico--sm'), window.UI.h('span', { text: label }));
  };
  var tell = B.tell || function (t, m, tone, i) {
    window.UI.toast({ title: t, msg: m, tone: tone || 'info', icon: i, life: 1600 });
  };
  var switchEl = B.switchEl || function (h, on, onChange) {
    return h('button.btn.btn--xs', { type: 'button', onclick: function () { onChange(!on); } },
      window.UI.h('span', { text: on ? '已激活' : '激活' }));
  };

  function downloadText(name, text) {
    var blob = new Blob([text], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* token 估算（酒馆量级：文本字符数 → ≈tok） */
  function estTok(text) {
    var s = String(text || '');
    return Math.max(0, Math.round(s.replace(/\s+/g, '').length));
  }

  /* 酒馆插入位置归一（数字枚举 ST world_info_position + 字符串别名）→ UI select value */
  function posClassOf(v) {
    var s = String(v == null ? '' : v);
    if (s === '0') return 'char_before';
    if (s === '1') return 'char_after';
    if (s === '2') return 'before';
    if (s === '3') return 'after';
    if (s === '4' || s === '5' || s === '6' || s === '7') return '';
    if (s === 'system') return 'system';
    if (s === 'char_before' || s === 'before_char' || s === 'CharBefore' || s === '角色定义前') return 'char_before';
    if (s === 'char_after' || s === 'after_char' || s === 'CharAfter' || s === '角色定义后') return 'char_after';
    if (s === 'before') return 'before';
    if (s === 'after') return 'after';
    return '';
  }

  function engine() {
    var E = window.GUIMI_ENGINE;
    if (!E || typeof E.buildInjectBlocks !== 'function' || typeof E.importLorebookFile !== 'function') return null;
    return E;
  }

  var readFile = function (inputEl, done) {
    inputEl.addEventListener('change', function () {
      var f = inputEl.files && inputEl.files[0];
      if (!f) return;
      f.text().then(function (text) { done(text, f.name || ''); });
      inputEl.value = '';
    });
  };

  /* ---- 通用表单物料（小部件） ---- */
  function icon(name, cls) { return window.ICONS.node(name, cls || 'ico'); }
  function numIn(h, value, min, max, step, placeholder) {
    return h('input.field', {
      type: 'number', min: min === undefined ? null : min, max: max === undefined ? null : max,
      step: step === undefined ? 'any' : step,
      value: value === undefined || value === null || value === '' ? '' : String(value),
      placeholder: placeholder || ''
    });
  }
  function selIn(h, options, value) {
    return h('select.field', null, options.map(function (o) {
      return h('option', { value: o.value, selected: o.value === value ? true : null, text: o.label });
    }));
  }
  function chkIn(h, label, checked) {
    return h('label', { style: { display: 'inline-flex', 'align-items': 'center', gap: '6px', cursor: 'pointer', 'font-size': 'var(--fs-sm)' } },
      h('input', { type: 'checkbox', checked: checked ? true : null }), h('span', { text: label }));
  }
  /* 大点击区勾选框（一行表格用）：26px 可见框 + 原生 checkbox 透明叠加 */
  function chkBox(h, checked, onChange, label) {
    var c = h('input', { type: 'checkbox', checked: checked ? true : null, style: { width: '16px', height: '16px', cursor: 'pointer' } });
    if (onChange) c.addEventListener('change', function () { onChange(c.checked); });
    var box = h('label', { style: { display: 'inline-flex', 'align-items': 'center', 'justify-content': 'center', width: '26px', height: '26px', cursor: 'pointer', background: 'var(--bg-2)', 'border-radius': '5px', border: '1px solid var(--line-2)' } }, c);
    return label ? h('span', { style: { display: 'inline-flex', 'align-items': 'center', gap: '6px', cursor: 'pointer' } }, box, h('span', { style: { 'font-size': 'var(--fs-sm)' }, text: label })) : box;
  }
  /* 行选择守卫：点击行内控件不触发行点击（防止整表重绘吞掉 change） */
  function rowGuard(ev) {
    var t = ev && ev.target;
    return !!(t && t.closest && t.closest('button,input,label,select,textarea,a'));
  }
  function fldRow(h, label, hint, control) {
    return h('div', { style: { margin: '6px 0' } },
      h('div', { style: { display: 'flex', gap: '8px', 'align-items': 'baseline' } },
        h('label.field-label', { style: { 'flex': '0 0 110px' }, text: label }),
        h('div', { style: { 'flex': '1' } }, control)),
      hint ? h('p.field-hint', { style: { 'margin-left': '118px' }, text: hint }) : null);
  }
  function grid2(h, children) {
    return h('div', { style: { display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '2px 18px' } }, children);
  }
  function miniBtn(h, iconName, fn, danger, title) {
    return h('button.btn.btn--xs' + (danger ? '.btn--danger' : ''), { type: 'button', title: title || '', onclick: fn },
      icon(iconName || 'tag', 'ico ico--sm'));
  }
  /* 表格列模板（与酒馆条目表格一致：启用|标题|策略|位置|深度|顺序|概率|操作；首列 44px 大点击区） */
  var COLS = '44px 1fr 118px 118px 52px 56px 76px 66px';
  function thRow(h, cols, defs) {
    return h('div', { style: { display: 'grid', 'grid-template-columns': cols, gap: '6px', padding: '4px 8px', 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)', 'border-bottom': '1px solid var(--line-1)' } },
      defs.map(function (d) {
        return h('button', { type: 'button', title: d.title || d.label, onclick: d.onSort, style: { display: 'flex', gap: '3px', 'align-items': 'center', cursor: d.onSort ? 'pointer' : 'default', background: 'none', border: 'none', color: 'inherit', 'font-size': 'inherit', padding: '0', 'font-family': 'inherit' } },
          h('span', { text: d.label }),
          d.onSort ? h('span', { style: { opacity: '.75', 'font-size': '10px' }, text: d.arrow || '' }) : null);
      }));
  }

  /* ================= 世界书（酒馆式：书列表 + 条目表格 + 行内即改即存 + 分页排序） ================= */
  P.worldbook = function (h, ico, UI, D, L) {
    var E = engine();
    var copyIdx = null; // 粘贴缓冲：复制条目
    var ST = {
      listHost: h('div', { id: 'p3-wb-list' }),
      tableHost: h('div', { id: 'p3-wb-table' }),
      globalHost: h('div', { id: 'p3-wb-global' }),
      selBook: null, selEntry: null,
      page: 0, pageSize: 50, query: '', globalOpen: false,
      sort: { key: 'order', asc: true },
      savedTick: 0,
    };

    function books() { return E.loadWorldBooks(); }
    function curBook() {
      var b = null;
      books().forEach(function (x) { if (x.id === ST.selBook) b = x; });
      return b;
    }
    function sorted(entries) {
      var k = ST.sort.key, asc = ST.sort.asc;
      var out = entries.slice();
      var cmp = function (a, b2) {
        var va, vb;
        if (k === 'comment') { va = String(a.comment || ''); vb = String(b2.comment || ''); return va.localeCompare(vb, 'zh'); }
        if (k === 'probability') { va = (a.useProbability ? Number(a.probability || 0) : 1); vb = (b2.useProbability ? Number(b2.probability || 0) : 1); }
        else { va = Number(a[k] ?? 0); vb = Number(b2[k] ?? 0); }
        return va - vb;
      };
      out.sort(cmp);
      if (!asc) out.reverse();
      return out;
    }
    function pageOf(entries) {
      var n = entries.length, size = ST.pageSize, pages = Math.max(1, Math.ceil(n / size));
      if (ST.page >= pages) ST.page = pages - 1;
      if (ST.page < 0) ST.page = 0;
      return { list: entries.slice(ST.page * size, ST.page * size + size), pages: pages, total: n };
    }
    function saveTick() {
      ST.savedTick = Date.now();
      var el = document.getElementById('p3-wb-saved');
      if (el) { el.textContent = '✓ 已自动保存'; setTimeout(function () { if (el) el.textContent = ''; }, 1200); }
    }

    /* ---- 行内展开的全字段编辑器（点击行标题 → 该行下方展开；全部即改即存） ---- */
    function paintEntryEditor(b, idx) {
      var e = b.entries[idx];
      var matchDefs = [
        ['matchCharacterDescription', '匹配角色描述'], ['matchPersonaDescription', '匹配人设描述'],
        ['matchCharacterPersonality', '匹配角色性格'], ['matchCharacterDepthPrompt', '匹配角色深度提示'],
        ['matchScenario', '匹配情景'], ['matchCreatorNotes', '匹配创作者笔记'],
      ];
      var fContent = h('textarea.field', { rows: '9', text: e.content || '' });
      fContent.addEventListener('change', function () {
        E.updateWorldBookEntry(b.id, idx, { content: fContent.value }); saveTick();
      });
      var fKey2 = h('input.field', { type: 'text', value: e.keysecondary || '' });
      fKey2.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { keysecondary: fKey2.value }); saveTick(); });
      var fCase = chkIn(h, '区分大小写', !!e.caseSensitive);
      fCase.querySelector('input').addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { caseSensitive: fCase.querySelector('input').checked }); saveTick(); });
      var fWhole = chkIn(h, '完全匹配（整词）', !!e.matchWholeWords);
      fWhole.querySelector('input').addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { matchWholeWords: fWhole.querySelector('input').checked }); saveTick(); });
      /* —— 蓝绿灯（酒馆灯色语义）：🔵=constant 常驻恒注入 / 🟢=关键词触发 —— */
      function lampBtn(isBlue) {
        var on = isBlue ? !!e.constant : !e.constant;
        return h('button', {
          type: 'button',
          onclick: function () { E.updateWorldBookEntry(b.id, idx, { constant: isBlue }); paint(); },
          style: {
            display: 'inline-flex', 'align-items': 'center', gap: '6px', cursor: 'pointer', padding: '5px 12px',
            'border-radius': '8px', 'font-size': 'var(--fs-sm)', 'font-family': 'inherit',
            background: on ? (isBlue ? 'rgba(63,169,245,.16)' : 'rgba(88,196,112,.14)') : 'transparent',
            border: '1px solid ' + (on ? (isBlue ? '#2f7fb8' : '#3d9457') : 'var(--line-1)'),
            color: on ? (isBlue ? '#3fa9f5' : '#58c470') : 'var(--txt-3)',
          }
        },
          h('i', { style: { width: '9px', height: '9px', 'border-radius': '50%', background: isBlue ? '#3fa9f5' : '#58c470', opacity: on ? '1' : '0.35', display: 'inline-block' } }),
          h('span', { text: isBlue ? '蓝灯 · 常驻' : '绿灯 · 关键词' }));
      }
      var fStop = chkIn(h, '停用', !!e.disable);
      fStop.querySelector('input').addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { disable: fStop.querySelector('input').checked }); saveTick(); });
      var fProbOn = chkIn(h, '启用触发概率', !!e.useProbability);
      fProbOn.querySelector('input').addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { useProbability: fProbOn.querySelector('input').checked }); saveTick(); });
      var fProb = numIn(h, e.probability === undefined ? '' : (Number(e.probability) * 100), 0, 100, 1);
      fProb.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { useProbability: true, probability: (Number(fProb.value) || 0) / 100 }); saveTick(); });
      var fSticky = numIn(h, typeof e.sticky === 'number' && e.sticky > 0 ? e.sticky : '', 0, 100000, 1, '关闭');
      fSticky.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { sticky: fSticky.value === '' ? undefined : Number(fSticky.value) }); saveTick(); });
      var fCool = numIn(h, e.cooldown && e.cooldown > 0 ? e.cooldown : '', 0, 100000, 1, '关闭');
      fCool.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { cooldown: fCool.value === '' ? undefined : Number(fCool.value) }); saveTick(); });
      var fDelay = numIn(h, e.delay && e.delay > 0 ? e.delay : '', 0, 100000, 1, '关闭');
      fDelay.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { delay: fDelay.value === '' ? undefined : Number(fDelay.value) }); saveTick(); });
      var durOn = !!e.delayUntilRecursion;
      var fDurOn = chkIn(h, '延后到递归', durOn);
      fDurOn.querySelector('input').addEventListener('change', function () {
        var v = fDurOn.querySelector('input').checked ? (fDur.value === '' ? true : Number(fDur.value)) : undefined;
        E.updateWorldBookEntry(b.id, idx, { delayUntilRecursion: v }); saveTick();
      });
      var fDur = numIn(h, typeof e.delayUntilRecursion === 'number' ? e.delayUntilRecursion : '', 0, 10000, 1, '递归首层');
      fDur.addEventListener('change', function () {
        E.updateWorldBookEntry(b.id, idx, { delayUntilRecursion: fDurOn.querySelector('input').checked ? (fDur.value === '' ? true : Number(fDur.value)) : undefined }); saveTick();
      });
      var fExcl = chkIn(h, '排除递归', !!e.excludeRecursion);
      fExcl.querySelector('input').addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { excludeRecursion: fExcl.querySelector('input').checked }); saveTick(); });
      var fPrevent = chkIn(h, '阻止递归', !!e.preventRecursion);
      fPrevent.querySelector('input').addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { preventRecursion: fPrevent.querySelector('input').checked }); saveTick(); });
      var fGroup = h('input.field', { type: 'text', value: e.group || '', placeholder: '（无）' });
      fGroup.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { group: fGroup.value || undefined }); saveTick(); });
      var fGroupW = numIn(h, e.groupWeight === undefined ? 100 : e.groupWeight, 0, 1000000, 1);
      fGroupW.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { groupWeight: Number(fGroupW.value) || 0 }); saveTick(); });
      var fGroupOv = chkIn(h, '覆盖组评分（无组也放行）', !!e.groupOverride);
      fGroupOv.querySelector('input').addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { groupOverride: fGroupOv.querySelector('input').checked }); saveTick(); });
      var fGroupSc = chkIn(h, '使用组评分', !!e.useGroupScoring);
      fGroupSc.querySelector('input').addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { useGroupScoring: fGroupSc.querySelector('input').checked }); saveTick(); });
      var fChar = h('textarea.field', { rows: '2', text: e.characterFilter && typeof e.characterFilter === 'object' ? JSON.stringify(e.characterFilter) : '', placeholder: '{"names":["角色名"],"tags":["标签"],"isExclude":false}' });
      fChar.addEventListener('change', function () {
        try { E.updateWorldBookEntry(b.id, idx, { characterFilter: fChar.value.trim() ? JSON.parse(fChar.value) : undefined }); saveTick(); }
        catch (err) { tell('绑定角色 JSON 无效', '格式：{"names":[...],"isExclude":false}', 'warn', 'warning'); }
      });
      var fTrig = h('textarea.field', { rows: '2', text: Array.isArray(e.triggers) ? e.triggers.join('\n') : '', placeholder: '筛选生成触发器（每行一个）' });
      fTrig.addEventListener('change', function () {
        var arr = fTrig.value.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
        E.updateWorldBookEntry(b.id, idx, { triggers: arr.length ? arr : undefined }); saveTick();
      });
      var fAuto = h('input.field', { type: 'text', value: e.automationId || '', placeholder: '（无）' });
      fAuto.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { automationId: fAuto.value || undefined }); saveTick(); });
      var fMemo = h('input.field', { type: 'text', value: e.addMemo || '' });
      fMemo.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { addMemo: fMemo.value || undefined }); saveTick(); });
      // 主关键词
      var fKey = h('input.field', { type: 'text', value: (e.key || (e.keys ? e.keys.join(', ') : '')) || '', placeholder: '（无）' });
      fKey.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { key: fKey.value }); saveTick(); });

      var matchBoxes = matchDefs.map(function (md) {
        var c = chkIn(h, md[1], !!e[md[0]]);
        c.querySelector('input').addEventListener('change', function () {
          var patch = {}; patch[md[0]] = c.querySelector('input').checked;
          E.updateWorldBookEntry(b.id, idx, patch); saveTick();
        });
        return c;
      });
      var fLogic = selIn(h, [{ value: 'AND', label: '与 任意' }, { value: 'OR', label: '或 任意' }], e.selectiveLogic || 'OR');
      fLogic.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { selectiveLogic: fLogic.value }); saveTick(); });

      return h('div', { style: { padding: '10px 12px', background: 'var(--bg-1)', border: '1px solid var(--line-2)', 'border-radius': '8px', 'margin-bottom': '10px', width: '100%', 'box-sizing': 'border-box' } },
        h('div', { style: { 'font-weight': '600', 'margin-bottom': '6px', color: 'var(--txt)' }, text: '编辑条目 · ' + e.comment + '（' + b.name + '）' }),
        /* 蓝绿灯：蓝=constant 恒注入（无视关键词）；绿=按主要关键字命中 */
        h('div', { style: { display: 'flex', gap: '8px', 'align-items': 'center', 'margin-bottom': '8px' } },
          lampBtn(true), lampBtn(false),
          h('span', { style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt-3)' }, text: e.constant ? '蓝灯：无视关键词，恒注入上下文' : '绿灯：扫描命中「主要关键字」才注入' })),
        h('div', { style: { display: 'flex', gap: '8px', 'align-items': 'center', 'margin-bottom': '6px', opacity: e.constant ? '0.55' : '1' } },
          h('span', { style: { 'font-size': 'var(--fs-sm)', color: 'var(--txt-2)' }, text: '主要关键字' }),
          h('div', { style: { 'flex': '1' } }, fKey),
          h('span', { style: { 'font-size': 'var(--fs-sm)', color: 'var(--txt-2)' }, text: '逻辑：' }),
          miniBtn(h, 'check', function () { E.updateWorldBookEntry(b.id, idx, { selectiveLogic: (e.selectiveLogic === 'AND' ? 'OR' : 'AND') }); paint(); }, false, '切换 AND/OR'),
          h('span', { style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)' }, text: '当前：' + (e.selectiveLogic || 'OR') })),
        h('div', { style: { display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '4px 18px', 'margin': '6px 0' } },
          matchBoxes.map(function (c, i) { return h('div', null, c); })),
        fldRow(h, '内容', null, fContent),
        grid2(h, [
          fldRow(h, '次关键词', null, fKey2),
          fldRow(h, '触发器策略', null, fLogic),
        ]),
        grid2(h, [
          fldRow(h, '匹配', null, h('div', null, fCase, fWhole, fStop)),
          fldRow(h, '触发概率', null, h('div', { style: { display: 'flex', gap: '8px', 'align-items': 'center' } }, fProbOn, fProb, h('span', { style: { 'font-size': 'var(--fs-xs)' }, text: '%' }))),
          fldRow(h, '粘性（消息数）', null, fSticky),
          fldRow(h, '冷却（消息数）', null, fCool),
          fldRow(h, '延迟（消息数）', null, fDelay),
          fldRow(h, '延后到递归', null, h('div', null, fDurOn, fDur)),
          fldRow(h, '递归设置', null, h('div', null, fExcl, fPrevent)),
          fldRow(h, '包含组', null, h('div', null, fGroup, fGroupW)),
          fldRow(h, '组开关', null, h('div', null, fGroupOv, fGroupSc)),
          fldRow(h, '绑定角色（JSON）', null, fChar),
          fldRow(h, '生成触发器', null, fTrig),
          fldRow(h, '自动化 ID / 备注', null, h('div', null, fAuto, fMemo)),
        ]));
    }

    /* ---- 条目表格 ---- */
    function paintTable(b) {
      UI.clear(ST.bodyHost);
      if (!b) return;
      var entries = sorted(b.entries);
      if (ST.query) entries = entries.filter(function (e2) { return String(e2.comment || '').indexOf(ST.query) >= 0; });
      var page = pageOf(entries);
      var arrow = function (k) { return ST.sort.key === k ? (ST.sort.asc ? '▲' : '▼') : ''; };
      var onSort = function (k) {
        if (ST.sort.key === k) ST.sort.asc = !ST.sort.asc;
        else ST.sort = { key: k, asc: true };
        ST.selEntry = null; paintTable(b);
      };
      var head = thRow(h, COLS, [
        { label: '', title: '' },
        { label: '标题（备注）', onSort: function () { onSort('comment'); }, arrow: arrow('comment') },
        { label: '触发器策略', title: '与/或' },
        { label: '插入位置', onSort: function () { onSort('position'); }, arrow: arrow('position') },
        { label: '深度', onSort: function () { onSort('depth'); }, arrow: arrow('depth') },
        { label: '顺序', onSort: function () { onSort('order'); }, arrow: arrow('order') },
        { label: '触发概率%', onSort: function () { onSort('probability'); }, arrow: arrow('probability') },
        { label: '', title: '操作' },
      ]);

      var table = h('div', { style: { border: '1px solid var(--line-1)', 'border-radius': '8px', overflow: 'hidden' } }, head);
      page.list.forEach(function (e2, i) {
        /* 关键：必须是原数组索引（entries 是排序副本，其 indexOf ≠ b.entries 索引——错位总根！） */
        var idx = b.entries.indexOf(e2);
        var caseNo = (ST.page * ST.pageSize) + i + 1;
        var posSel = selIn(h, [
          { value: '', label: '深度 @D' }, { value: 'system', label: '系统（System）' },
          { value: 'char_before', label: '角色定义前（↑Char）' }, { value: 'char_after', label: '角色定义后（↓Char）' },
          { value: 'before', label: '消息前' }, { value: 'after', label: '消息后' },
        ], posClassOf(e2.position));
        posSel.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { position: posSel.value }); saveTick(); });
        var depthIn = numIn(h, e2.depth === undefined ? 0 : e2.depth, 0, 100, 1);
        depthIn.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { depth: Number(depthIn.value) || 0 }); saveTick(); });
        var orderIn = numIn(h, e2.order === undefined ? 0 : e2.order, -100000, 100000, 1);
        orderIn.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { order: Number(orderIn.value) || 0 }); saveTick(); });
        var probIn = numIn(h, e2.useProbability ? Math.round(Number(e2.probability || 0) * 100) : '', 0, 100, 1);
        probIn.addEventListener('change', function () {
          E.updateWorldBookEntry(b.id, idx, { useProbability: true, probability: (Number(probIn.value) || 0) / 100 }); saveTick();
        });
        var strSel = selIn(h, [{ value: 'AND', label: '与 任意' }, { value: 'OR', label: '或 任意' }], e2.selectiveLogic || 'OR');
        strSel.addEventListener('change', function () { E.updateWorldBookEntry(b.id, idx, { selectiveLogic: strSel.value }); saveTick(); });
        var onCtl = h('button', { type: 'button', title: '点击切换 启用/停用', style: { display: 'inline-flex', 'align-items': 'center', 'justify-content': 'center', width: '30px', height: '30px', cursor: 'pointer', background: e2.disable ? 'rgba(224,106,80,.16)' : 'rgba(63,169,245,.14)', 'border-radius': '6px', border: '1px solid ' + (e2.disable ? '#a04030' : '#2f7fb8'), color: e2.disable ? '#e06a50' : '#3fa9f5' },
          onclick: function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            var cur = E.loadWorldBooks().filter(function (x) { return x.id === b.id; })[0];
            if (!cur || !cur.entries[idx]) return;
            var next = !cur.entries[idx].disable;
            E.updateWorldBookEntry(b.id, idx, { disable: next });
            /* 写后读回：验证数据是否真的落库 */
            var after = E.loadWorldBooks().filter(function (x) { return x.id === b.id; })[0];
            window.__wbLog = window.__wbLog || [];
            window.__wbLog.push({ t: new Date().toISOString(), book: b.id, idx: idx, wasDisable: cur.entries[idx].disable, next: next, afterDisable: after ? (after.entries[idx] && after.entries[idx].disable) : 'NO_BOOK', hasUpdateApi: typeof E.updateWorldBookEntry });
            /* 就地更新按钮外观（硬编码蓝/红，任何皮肤下两色分明） */
            onCtl.style.background = next ? 'rgba(224,106,80,.16)' : 'rgba(63,169,245,.14)';
            onCtl.style.borderColor = next ? '#a04030' : '#2f7fb8';
            onCtl.style.color = next ? '#e06a50' : '#3fa9f5';
            onCtl.title = next ? '当前：停用' : '当前：启用';
            while (onCtl.firstChild) onCtl.removeChild(onCtl.firstChild);
            onCtl.appendChild(icon(next ? 'close' : 'check', 'ico ico--sm'));
            onCtl.setAttribute('data-state', next ? 'off' : 'on');
            /* 必然可见的反馈：全局 toast */
            tell(next ? '条目已停用' : '条目已启用', (cur.entries[idx] && cur.entries[idx].comment) || '', next ? 'warn' : 'good', next ? 'close' : 'check');
          } },
          icon(e2.disable ? 'close' : 'check', 'ico ico--sm'));
        onCtl.setAttribute('data-role', 'row-enable');
        /* 整列点击区：行首 44px 列任意点击 = 切换（不再依赖 30px 小按钮命中） */
        var onCol = h('div', { style: { display: 'flex', 'align-items': 'center', cursor: 'pointer', height: '100%', 'min-height': '30px' }, onclick: function (ev) { ev.stopPropagation(); if (!ev.target.closest('button')) onCtl.click(); } }, onCtl);
        /* 蓝绿灯行内切换：蓝=constant 常驻恒注入 / 绿=关键词触发（点击即切，酒馆灯色语义） */
        var lamp = h('button', {
          type: 'button', title: e2.constant ? '蓝灯 · 常驻恒注入（点击切为绿灯·关键词）' : '绿灯 · 关键词触发（点击切为蓝灯·常驻）',
          onclick: function (ev) {
            ev.stopPropagation();
            E.updateWorldBookEntry(b.id, idx, { constant: !e2.constant }); saveTick(); paint(b);
          },
          style: { display: 'inline-flex', 'align-items': 'center', 'justify-content': 'center', width: '26px', height: '26px', cursor: 'pointer', background: 'none', border: 'none', padding: '0' }
        },
          h('i', { style: { width: '10px', height: '10px', 'border-radius': '50%', display: 'inline-block', background: e2.constant ? '#3fa9f5' : '#58c470', 'box-shadow': '0 0 6px ' + (e2.constant ? 'rgba(63,169,245,.7)' : 'rgba(88,196,112,.6)') } }));
        var row = h('div', { style: { display: 'grid', 'grid-template-columns': COLS, gap: '6px', padding: '5px 8px', 'align-items': 'center', 'border-top': '1px solid var(--line-1)', background: ST.selEntry === idx ? 'var(--bg-2)' : 'none' } },
          onCol,
          h('div', { style: { display: 'flex', gap: '6px', 'align-items': 'center', 'min-width': '0' } },
            lamp,
            h('button', { type: 'button', style: { cursor: 'pointer', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', 'font-size': 'inherit', padding: '0', 'font-family': 'inherit', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap', flex: '1', 'min-width': '0' }, title: '点击展开编辑',
              onclick: function () { ST.selEntry = ST.selEntry === idx ? null : idx; paint(b); } },
              h('span', { text: String(e2.comment || '') })),
            h('span.u-mono', { style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt-3)', 'flex': 'none' }, title: '内容估算 token 数', text: String(estTok(e2.content)) })),
          h('div', { style: { display: 'flex', 'align-items': 'center' } }, strSel),
          posSel,
          depthIn, orderIn, probIn,
          h('div', { style: { display: 'flex', gap: '3px', 'justify-content': 'flex-end' } },
            miniBtn(h, 'copy', function () {
              var sz = JSON.parse(JSON.stringify(e2));
              sz.comment = (e2.comment || '条目') + ' 副本';
              sz.order = (e2.order || 0) + 1;
              E.addWorldBookEntry(b.id, sz); paint(b);
            }, false, '复制条目'),
            miniBtn(h, 'trash', function () {
              UI.confirm({ title: '删除条目', msg: '删除「' + e2.comment + '」？', icon: 'trash', okText: '删除' })
                .then(function (ok) { if (ok) { E.removeWorldBookEntry(b.id, idx); if (ST.selEntry === idx) ST.selEntry = null; paint(b); } });
            }, true, '删除条目')));
        table.appendChild(row);
        if (ST.selEntry === idx) table.appendChild(paintEntryEditor(b, idx));
      });
      if (!page.list.length && entries.length) {
        table.appendChild(h('p.field-hint', { style: { padding: '8px' }, text: '无匹配条目（搜索词：' + ST.query + '）' }));
      }
      ST.bodyHost.appendChild(table);
      if (entries.length) {
        var sizeSel = selIn(h, [{ value: '25', label: '25' }, { value: '50', label: '50' }, { value: '100', label: '100' }], String(ST.pageSize));
        sizeSel.addEventListener('change', function () { ST.pageSize = Number(sizeSel.value); ST.page = 0; ST.selEntry = null; paint(b); });
        ST.bodyHost.appendChild(h('div', { style: { display: 'flex', gap: '8px', 'align-items': 'center', 'justify-content': 'flex-end', 'margin-top': '8px', 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)' } },
          miniBtn(h, 'chevronL', function () { if (ST.page > 0) { ST.page--; ST.selEntry = null; paint(b); } }, false, '上一页'),
          h('span', { text: (ST.page * ST.pageSize + 1) + '–' + Math.min((ST.page + 1) * ST.pageSize, page.total) + ' / ' + page.total }),
          miniBtn(h, 'chevronR', function () { if (ST.page < page.pages - 1) { ST.page++; ST.selEntry = null; paint(b); } }, false, '下一页'),
          h('span', { text: '每页' }), sizeSel));
      }
    }

    /* ---- 左侧书列表 ---- */
    function paintList() {
      UI.clear(ST.pickRowsHost);
      var bs = books();
      var query = ST.queryBook || '';
      var filtered = bs.filter(function (b2) { return !query || b2.name.indexOf(query) >= 0; });
      filtered.forEach(function (b2) {
        ST.pickRowsHost.appendChild(h('div', { style: { display: 'flex', gap: '6px', 'align-items': 'center', padding: '5px 6px', 'border-radius': '6px', cursor: 'pointer', background: ST.selBook === b2.id ? 'var(--bg-2)' : 'none', border: '1px solid ' + (ST.selBook === b2.id ? 'var(--line-2)' : 'transparent') }, onclick: function (ev) { if (rowGuard(ev)) return; ST.selBook = b2.id; ST.page = 0; ST.selEntry = null; paint(); } },
          icon(b2.active ? 'check' : 'worldbook', 'ico ico--sm'),
          h('span', { style: { 'flex': '1', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }, text: b2.name }),
          h('span', { onclick: function (ev) { ev.stopPropagation(); } }, switchEl(h, b2.active, function (v) { E.toggleWorldBookActive(b2.id); paint(); })),
          miniBtn(h, 'chevronR', function (ev) { ev.stopPropagation(); ST.selBook = b2.id; ST.page = 0; ST.selEntry = null; paint(); }, false, '打开')));
      });
      ST.listHost.appendChild(ST.pickRowsHost);
    }

    /* ---- 全局激活设置（单击展开） ---- */
    function paintGlobal() {
      UI.clear(ST.globalHost);
      var bs = books();
      if (!ST.globalOpen) {
        ST.globalHost.appendChild(h('div', { style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', padding: '8px 10px', background: 'var(--bg-1)', 'border': '1px solid var(--line-1)', 'border-radius': '8px', cursor: 'pointer' }, onclick: function () { ST.globalOpen = true; paintGlobal(); } },
          h('span', { text: '已启用的世界书（全局有效）' }),
          h('span', { style: { color: 'var(--txt-2)', 'font-size': 'var(--fs-sm)' }, text: '全局世界书激活设置　单击展开 ▾' })));
        return;
      }
      ST.globalHost.appendChild(h('div', { style: { padding: '10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', 'border-radius': '8px', 'margin-bottom': '10px' } },
        h('div', { style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px' } },
          h('span', { text: '全局世界书激活设置' }),
          miniBtn(h, 'chevronU', function () { ST.globalOpen = false; paintGlobal(); }, false, '收起')),
        h('span', { style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)' }, text: '勾选启用哪个世界书 —— 全局设置对全部书生效（扫描深度 / Token 预算 / 递归扫描）。' }),
        bs.map(function (b2) {
          var scan = numIn(h, b2.scanDepth === undefined ? '' : b2.scanDepth, 0, 1000000, 1, '默认');
          var budget = numIn(h, b2.token_budget === undefined ? '' : b2.token_budget, 0, 1000000, 1, '默认');
          var rec = chkIn(h, '递归', !!b2.recursive);
          scan.addEventListener('change', function () { E.updateWorldBook(b2.id, { scanDepth: scan.value === '' ? undefined : Number(scan.value) }); saveTick(); });
          budget.addEventListener('change', function () { E.updateWorldBook(b2.id, { token_budget: budget.value === '' ? undefined : Number(budget.value) }); saveTick(); });
          rec.querySelector('input').addEventListener('change', function () { E.updateWorldBook(b2.id, { recursive: rec.querySelector('input').checked }); saveTick(); });
          return h('div', { style: { display: 'grid', 'grid-template-columns': '1fr 90px 90px 70px', gap: '6px', 'align-items': 'center', padding: '4px 0' } },
            h('span', { text: b2.name }), scan, budget, rec);
        })));
    }

    function paint() {
      UI.clear(ST.listHost); UI.clear(ST.tableHost);
      if (!E) {
        ST.listHost.appendChild(UI.empty('引擎不可用', '在 p3-demo 目录执行 node build-engine.mjs 构建引擎后刷新。', 'worldbook'));
        return;
      }
      // 右栏结构：顶栏（书名+搜索，独立于表格重绘）+ 表格体（每次全量重绘）
      if (!ST.topHost) ST.topHost = h('div', { id: 'p3-wb-top' });
      if (!ST.nameHost) ST.nameHost = h('div', { id: 'p3-wb-name' });
      ST.topHost.appendChild(ST.nameHost);
      ST.tableHost.appendChild(ST.topHost);
      if (!ST.bodyHost) ST.bodyHost = h('div', { id: 'p3-wb-body' });
      ST.tableHost.appendChild(ST.bodyHost);
      paintGlobal();
      var b = curBook();
      // 左列表工具栏 + 搜索（只创建一次，保持焦点）
      if (!ST.pickRowsHost) ST.pickRowsHost = h('div', { id: 'p3-wb-rows' });
      if (!ST.toolbarMade) {
        ST.toolbarMade = true;
        ST.listHost.appendChild(h('div', { style: { display: 'flex', gap: '6px', 'margin-bottom': '6px' } },
          miniBtn(h, 'plus', function () {
            var nb = { id: 'wb_' + Date.now(), name: '新世界书', createdAt: new Date().toISOString(), entries: [], active: true };
            E.addWorldBook(nb);
            ST.selBook = nb.id;
            tell('已创建', '「新世界书」—— 点名称可重命名', 'good', 'plus');
            paint();
          }, false, '创建世界书'),
          h('button.btn.btn--xs', { type: 'button', onclick: function () { file.click(); } }, icon('upload', 'ico ico--sm'), h('span', { text: '导入' })),
          ST.bookSearch = h('input.field', { type: 'text', placeholder: '搜索书…', value: ST.queryBook || '', style: { 'flex': '1' } })));
        ST.bookSearch.addEventListener('input', function () { ST.queryBook = ST.bookSearch.value; paintList(); });
      }
      paintList();
      if (!bs0()) {
        ST.bodyHost.appendChild(UI.empty('尚无世界书', '点上方「导入」选择酒馆导出的 lorebook JSON（按文件名命名）；或「+」创建空书。', 'worldbook'));
        return;
      }
      // 右表：书标题（可重命名，仅重绘自己）+ 搜索 + 表格
      if (b) {
        UI.clear(ST.nameHost);
        var nameIn = h('input.field', { type: 'text', value: b.name, style: { 'max-width': '260px', 'font-weight': '600' } });
        nameIn.addEventListener('change', function () { E.updateWorldBook(b.id, { name: nameIn.value || b.name }); paint(); });
        ST.nameHost.appendChild(h('div', { style: { display: 'flex', gap: '8px', 'align-items': 'center', 'margin': '6px 0' } },
          h('span', { style: { 'font-size': 'var(--fs-sm)', color: 'var(--txt-2)' }, text: '书：' }),
          nameIn,
          h('span', { id: 'p3-wb-saved', style: { 'font-size': 'var(--fs-xs)', color: 'var(--accent)' } }),
          h('span', { style: { 'flex': '1' } }),
          h('button.btn.btn--xs', { type: 'button', onclick: function () { downloadText(b.name + '.json', E.exportWorldBook(b)); tell('已导出', b.name + '.json（酒馆可再导入）', 'good', 'download'); } }, icon('download', 'ico ico--sm'), h('span', { text: '导出' })),
          miniBtn(h, 'trash', function () {
            UI.confirm({ title: '移除世界书', msg: '将删除「' + b.name + '」的 ' + b.entries.length + ' 条，不可恢复。', icon: 'trash', okText: '移除', countdown: 15 })
              .then(function (ok) { if (ok) { E.removeWorldBook(b.id); ST.selBook = null; paint(); } });
          }, true, '移除世界书')));
        // 搜索框（独立于表格重绘，保持输入焦点；只绑定一次）
        if (!ST.searchHost) {
          ST.searchHost = h('input.field', { type: 'text', placeholder: '搜索条目…（按标题过滤）', value: ST.query || '', style: { margin: '4px 0 8px', width: '190px' } });
          ST.searchHost.addEventListener('input', function () { ST.query = ST.searchHost.value; ST.page = 0; ST.selEntry = null; paintTable(b); });
        }
        ST.topHost.appendChild(ST.searchHost);
        paintTable(b);
        if (!b.entries.length) ST.bodyHost.appendChild(UI.empty('空书', '点「新增条目」或「导入」；在列表上部（全局激活设置展开区）可配置书级深度/预算/递归。', 'worldbook'));
      } else if (books().length) {
        ST.bodyHost.appendChild(UI.empty('选择一本书', '左侧列表点击世界书；条目表格支持排序/分页/行内即改即存。', 'worldbook'));
      }
    }
    function bs0() { return books().length > 0; }

    var file = h('input', { type: 'file', accept: '.json,.txt', style: 'display:none', id: 'p3-wb-file' });
    readFile(file, function (text, fname) {
      var r = E.importLorebookFile(text, fname.replace(/\.json$/i, '').replace(/\.txt$/i, ''));
      if (!r.ok) { tell('导入失败', r.error, 'warn', 'warning'); return; }
      // 同名防重：已存在同名书 → 自动追加 -2/-3…
      var nm = r.book.name, n = 2;
      var exists = function (b2) { return b2.name === nm; };
      while (E.loadWorldBooks().some(exists)) { nm = r.book.name + '-' + (n++); }
      r.book.name = nm;
      E.addWorldBook(r.book);
      ST.selBook = r.book.id; ST.page = 0; ST.selEntry = null;
      tell('世界书已导入', r.book.name + ' · ' + r.entryCount + ' 条（未激活，需开启开关）', 'good', 'upload');
      paint();
    });

    paint();

    return {
      actions: [
        act('导入酒馆世界书', 'upload', function () { file.click(); }),
        act('清空全部', 'trash', function () {
          UI.confirm({ title: '清空所有世界书', msg: '将删除全部已导入世界书。', icon: 'trash', okText: '清空', countdown: 20 })
            .then(function (ok) { if (ok) { E.clearWorldBooks(); ST.selBook = null; ST.selEntry = null; paint(); } });
        }, '.btn--danger')
      ],
      body: h('div.stack', null,
        ST.globalHost,
        (function () {
          var wide = window.innerWidth >= 860;
          return h('div', { style: { display: 'flex', gap: '12px', 'align-items': 'stretch', flexDirection: wide ? 'row' : 'column', height: wide ? 'min(60vh, calc(100vh - 320px))' : '60vh', 'min-height': '300px' } },
            h('div', { class: 'p3-scroll', style: { 'flex': 'none', width: wide ? '235px' : '100%', height: wide ? '100%' : '30%' } }, ST.listHost),
            h('div', { class: 'p3-scroll', style: { 'flex': '1 1 auto', 'min-width': '0', width: wide ? '0' : '100%', height: wide ? '100%' : '70%' } }, ST.tableHost));
        })(),
        file)
    };
  };

  /* ================= 预设（酒馆式双栏 v3：左=提示块卡片(固定300px·整行可拖·金色高亮)，右=编辑器(顶部·内容全宽)+采样(折叠)） ================= */
  P.preset = function (h, ico, UI, D, L) {
    var E = engine();
    var S = {
      prListHost: h('div', { id: 'p3-pr-pick' }),
      blkHost: h('div', { id: 'p3-pr-blocks' }),
      detHost: h('div', { id: 'p3-pr-detail' }),
      sel: null, selBlock: null, query: '',
      dragIdx: -1, dragOverIdx: -1,
    };

    function presets() { return E.loadPresets(); }
    function cur() { var p = null; presets().forEach(function (x) { if (x.id === S.sel) p = x; }); return p; }
    function saveTick() {
      var el = document.getElementById('p3-pr-saved');
      if (el) { el.textContent = '✓ 已自动保存'; setTimeout(function () { if (el) el.textContent = ''; }, 1200); }
    }
    function saveSampling(p, key, value) {
      var next = JSON.parse(JSON.stringify(p.sampling || {}));
      next[key] = value;
      E.updatePreset(p.id, { sampling: next });
      saveTick();
    }

    /* 采样键全中文表（酒馆 preset JSON 全字段；未知键回退原样） */
    var SAMPLING_LABELS = {
      temperature: '温度', temperature_last: '温度（旧版）', top_p: 'Top P', top_k: 'Top K', top_a: 'Top A',
      top_g: 'Top G', typical_p: '典型 P', tfs: 'TFS', min_p: 'Min P',
      rep_pen: '重复惩罚', rep_pen_range: '重复惩罚范围', rep_pen_slope: '重复惩罚斜率',
      repetition_penalty: '重复惩罚', frequency_penalty: '频率惩罚', presence_penalty: '存在惩罚',
      dynatemp: '动态温度', dynatemp_range: '动态温度范围', dynatemp_exponent: '动态温度指数',
      smoothing_factor: '平滑因子', openai_max_context: '上下文长度', openai_max_tokens: '最大回复长度',
      openai_max_tokens_budget: '回复长度预算', seed: '种子', stream: '流式输出', stream_openai: 'OpenAI 流式',
      max_tokens_second: '每秒 Token 上限', names_behavior: '角色名称行为', wrap_in_quotes: '引号包裹',
      end_if_empty: '空则结束', new_chat_prompt: '新聊天提示词', new_example_chat_prompt: '新示例聊天提示词',
      new_group_chat_prompt: '新群聊提示词', continue_nudge_prompt: '继续提示词（推进剧情）',
      alias_preset_selected: '别名预设', w_i_format: '世界书格式', personality_format: '人设格式',
      assistant_prefill: '助手预填充', assistant_impersonation: '助手模仿人设', claude_use_sysprompt: 'Claude 使用系统提示',
      squash_system_messages: '压缩系统消息', image_inlining: '内联图片', video_inlining: '内联视频',
      max_context_unlocked: '解锁上下文上限', scenario_format: '情景格式', group_nudge_prompt: '群聊提醒提示词',
      prompt_order: '提示顺序', use_makersuite_sysprompt: 'MakerSuite 系统提示',
      bypass_status_check: '跳过状态检查', oai_system_prompt: '系统提示覆盖', len: '长度',
      enable_function_calling: '启用函数调用', interleaved_thinking: '交错思维', send_embedded_models: '发送内嵌模型',
      include_images: '图片类素', logit_bias: 'Logit 设置', reasoning_strength: '推理强度', request_reasoning_thinking: '请求思维链',
      continue_prefill: '续写预填充', echo: '回声', n: '备选回复数', best_of: '候选数', stop: '停止符',
      user_name: '用户角色名', context: '上下文模板',
    };

    /* ---- 采样参数（右栏 · 折叠区 · 即改即存） ---- */
    function paintSampling(p) {
      var host = h('div.stack-sm', null);
      var sampling = p.sampling || {};
      var keys = Object.keys(sampling).sort(function (a, b2) {
        var order = ['temperature', 'top_p', 'top_k', 'min_p', 'rep_pen', 'repetition_penalty', 'frequency_penalty', 'presence_penalty', 'openai_max_context', 'openai_max_tokens', 'seed', 'stream'];
        var ia = order.indexOf(a), ib = order.indexOf(b2);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b2);
      });
      keys.forEach(function (k) {
        var v = sampling[k];
        var label = SAMPLING_LABELS[k] || k;
        var ctl;
        if (typeof v === 'boolean') {
          var c = chkIn(h, v ? '开启' : '关闭', v);
          c.querySelector('input').addEventListener('change', function () { saveSampling(p, k, c.querySelector('input').checked); });
          ctl = c;
        } else if (typeof v === 'number') {
          var in1 = numIn(h, v, -100000000, 1000000000);
          in1.addEventListener('change', function () { saveSampling(p, k, Number(in1.value) || 0); });
          ctl = in1;
        } else if (typeof v === 'string') {
          var in2 = h('input.field', { type: 'text', value: v });
          in2.addEventListener('change', function () { saveSampling(p, k, in2.value); });
          ctl = in2;
        } else {
          var in3 = h('input.field', { type: 'text', value: v === null ? '' : JSON.stringify(v) });
          in3.addEventListener('change', function () {
            try { saveSampling(p, k, JSON.parse(in3.value)); } catch (err) { tell('JSON 无效', '保持原值', 'warn', 'warning'); }
          });
          ctl = in3;
        }
        host.appendChild(fldRow(h, label, null, ctl));
      });
      if (!keys.length) host.appendChild(h('p.field-hint', { text: '该预设无采样参数字段' }));
      return host;
    }

    /* ---- 该位置的世界书注入（酒馆 worldInfoBefore/After 语义） ---- */
    function wbBit(blk) {
      var blkId = String(blk.identifier || '');
      if (blkId !== 'worldInfoBefore' && blkId !== 'worldInfoAfter') return null;
      var cls = blkId === 'worldInfoBefore' ? 'charBefore' : 'charAfter';
      var label = blkId === 'worldInfoBefore' ? '角色定义前（↑Char）' : '角色定义后（↓Char）';
      var host = h('div.stack-sm', { style: { margin: '8px 0 0', padding: '8px 10px', border: '1px dashed var(--line-2)', 'border-radius': '8px' } },
        h('div.lc-t', { text: '该位置的世界书注入（' + label + '）' }));
      var sceneText = (D.TURNS && D.TURNS[D.turn] && D.TURNS[D.turn].text) || '';
      var blocks = E.buildInjectBlocks({ text: sceneText });
      var here = blocks.filter(function (x) { return x.positionClass === cls; });
      if (!here.length) {
        host.appendChild(h('p.field-hint', { text: '当前剧情文本下无命中该位置的条目（可在世界书导入后 / 关键词命中后查看）' }));
        return host;
      }
      here.forEach(function (wb) {
        host.appendChild(h('details', { style: { 'margin-top': '4px' } },
          h('summary', { style: { cursor: 'pointer', 'font-size': 'var(--fs-xs)', color: 'var(--acc)' }, text: '【' + wb.book + ' · ' + wb.comment + '】' }),
          h('div', { style: { 'font-size': 'var(--fs-xs)', 'white-space': 'pre-wrap', lineHeight: '1.7', margin: '4px 8px', color: 'var(--txt-2)' }, text: String(wb.content) })));
      });
      return host;
    }

    /* ---- 提示块编辑器（右栏顶部 · 旁边打开 · 内容全宽 · 全部即改即存） ---- */
    function paintBlockEditor(p, idx) {
      var blk = p.prompts[idx];
      if (!blk) return null;
      var fName = h('input.field', { type: 'text', value: blk.name || '' });
      fName.addEventListener('change', function () { E.updatePresetBlock(p.id, idx, { name: fName.value }); saveTick(); });
      var fRole = selIn(h, [{ value: 'system', label: 'system' }, { value: 'user', label: 'user' }, { value: 'assistant', label: 'assistant' }], blk.role || 'system');
      fRole.addEventListener('change', function () { E.updatePresetBlock(p.id, idx, { role: fRole.value }); saveTick(); });
      var fTrig = h('input.field', { type: 'text', value: Array.isArray(blk.injection_trigger) ? blk.injection_trigger.join(', ') : (blk.injection_trigger || ''), placeholder: '逗号分隔的触发器' });
      fTrig.addEventListener('change', function () {
        var arr = fTrig.value.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
        E.updatePresetBlock(p.id, idx, { injection_trigger: arr }); saveTick();
      });
      var fPos = numIn(h, blk.injection_position === undefined ? 0 : blk.injection_position, -100000, 100000, 1);
      fPos.addEventListener('change', function () { E.updatePresetBlock(p.id, idx, { injection_position: Number(fPos.value) || 0 }); saveTick(); });
      var fDepth = numIn(h, blk.injection_depth === undefined ? 0 : blk.injection_depth, -100000, 100000, 1);
      fDepth.addEventListener('change', function () { E.updatePresetBlock(p.id, idx, { injection_depth: Number(fDepth.value) || 0 }); saveTick(); });
      var fId = h('input.field', { type: 'text', value: blk.identifier || '', placeholder: '（无）' });
      fId.addEventListener('change', function () { E.updatePresetBlock(p.id, idx, { identifier: fId.value || undefined }); saveTick(); });
      var fSp = chkIn(h, '系统提示块', !!blk.system_prompt);
      fSp.querySelector('input').addEventListener('change', function () { E.updatePresetBlock(p.id, idx, { system_prompt: fSp.querySelector('input').checked }); saveTick(); });
      var fMarker = chkIn(h, '标记（示例块）', !!blk.marker);
      fMarker.querySelector('input').addEventListener('change', function () { E.updatePresetBlock(p.id, idx, { marker: fMarker.querySelector('input').checked }); saveTick(); });
      var fForbid = chkIn(h, '禁止覆盖', !!blk.forbid_overrides);
      fForbid.querySelector('input').addEventListener('change', function () { E.updatePresetBlock(p.id, idx, { forbid_overrides: fForbid.querySelector('input').checked }); saveTick(); });
      var fContent = h('textarea.field', { rows: '14', style: { width: '100%', 'min-height': '240px' }, text: blk.content || '' });
      fContent.addEventListener('change', function () { E.updatePresetBlock(p.id, idx, { content: fContent.value }); saveTick(); });

      return h('div', { style: { border: '1px solid var(--accent)', padding: '12px 14px', margin: '0 0 10px', 'border-radius': '8px', width: '100%', 'box-sizing': 'border-box', background: 'var(--bg-1)' } },
        h('div', { style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px', width: '100%' } },
          h('div.lc-t', { text: '编辑提示块 · ' + (blk.name || '(未命名)') }),
          h('span', { style: { display: 'flex', gap: '6px' } },
            miniBtn(h, 'copy', function () { E.addPresetBlock(p.id, JSON.parse(JSON.stringify(blk))); paint(); }, false, '复制提示块'),
            miniBtn(h, 'trash', function () {
              UI.confirm({ title: '删除提示块', msg: '删除「' + (blk.name || '(未命名)') + '」？', icon: 'trash', okText: '删除' })
                .then(function (ok) { if (ok) { E.removePresetBlock(p.id, idx); S.selBlock = null; paint(); } });
            }, true, '删除提示块'))),
        grid2(h, [
          fldRow(h, '姓名', null, fName),
          fldRow(h, '身份（role）', null, fRole),
          fldRow(h, '触发器', null, fTrig),
          fldRow(h, '位置（position）', null, fPos),
          fldRow(h, '相对（深度）', '注入深度，大者优先', fDepth),
          fldRow(h, '标识（identifier）', null, fId),
        ]),
        fldRow(h, '开关', null, h('div', { style: { display: 'flex', gap: '12px' } }, fSp, fMarker, fForbid)),
        fldRow(h, '内容', null, fContent)
        /* 酒馆：点击角色定义前/后 → 看到该位置的世界书注入（点击展开全文） */
        , wbBit(blk));
    }

    /* ---- 自定义拖拽排序（主序列内整行可拖；松开写回 prompt_order —— v4 装配序=prompt_order） ---- */
    /* ---- 拖拽诊断（冒烟/排障用）：window.__p3dbg 环形记录最近 40 条链路事件 ---- */
    function dbg(msg) {
      try {
        window.__p3dbg = window.__p3dbg || [];
        window.__p3dbg.push(new Date().toISOString().slice(11, 23) + ' ' + msg);
        if (window.__p3dbg.length > 40) window.__p3dbg.shift();
      } catch (e2) { /* noop */ }
    }
    function onDragMove(ev) {
      /* 命中检测：遍历行矩形（比 elementFromPoint 更可靠，滚动/边缘场景不失效） */
      var rows = S.blkHost.querySelectorAll('[data-pos]');
      var to = -1;
      for (var i = 0; i < rows.length; i++) {
        var rc = rows[i].getBoundingClientRect();
        if (ev.clientX >= rc.left && ev.clientX <= rc.right && ev.clientY >= rc.top && ev.clientY <= rc.bottom) { to = Number(rows[i].getAttribute('data-pos')); break; }
      }
      S.dragOverIdx = to;
      dbg('move → over=' + to);
      for (var j = 0; j < rows.length; j++) {
        var on = Number(rows[j].getAttribute('data-pos')) === to;
        rows[j].style.borderColor = on ? 'var(--accent)' : 'var(--line-1)';
        rows[j].style.background = on ? 'rgba(255,196,0,.10)' : '';
      }
    }
    function onDragEnd() {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      var p = cur();
      var from = S.dragIdx, to = S.dragOverIdx;
      S.dragIdx = -1; S.dragOverIdx = -1;
      /* 未拖动（点击）→ 不重绘，让 click 事件正常落到块行上（否则 click 会因重绘丢失） */
      if (!p || from < 0 || to < 0 || from === to) { dbg('end skip: p=' + (p ? p.id : 'null') + ' from=' + from + ' to=' + to); return; }
      /* 老块自愈：无 identifier 的先补一个（prompt_order 靠 identifier 寻址） */
      healBlockIds(p);
      /* 主序列（含停用行）真实重排 → 写回 prompt_order（酒馆语义：顺序与开关都在 prompt_order 上） */
      var items = E.promptOrderItems ? E.promptOrderItems(cur() || p) : [];
      var seqIds = [];
      items.forEach(function (it) { if (it.state === 'inserted' && it.identifier) seqIds.push(it.identifier); });
      dbg('end: from=' + from + ' to=' + to + ' seqLen=' + seqIds.length + ' preset=' + p.id);
      if (from >= seqIds.length || to >= seqIds.length) { paint(); return; }
      var movedId = seqIds.splice(from, 1)[0];
      seqIds.splice(to, 0, movedId);
      try {
        E.setPromptBlockSequence(p.id, seqIds);
        dbg('written order=' + JSON.stringify(seqIds));
      } catch (err) { dbg('write ERROR ' + String(err && err.message || err)); }
      saveTick(); paint();
    }
    /** 给缺 identifier 的块补生成标识（本地老数据兼容；导入预设自带标识不受影响） */
    function healBlockIds(p) {
      if (!E.promptOrderItems || !E.updatePresetBlock) { dbg('heal skip: api missing'); return; }
      var n = 0;
      E.promptOrderItems(p).forEach(function (it) {
        if (it.state !== 'inserted' && it.state !== 'unlisted') return;
        if (it.block && !it.identifier && it.index >= 0) {
          E.updatePresetBlock(p.id, it.index, { identifier: 'blk_' + Date.now() + '_' + Math.floor(Math.random() * 1e5) + '_' + it.index });
          n += 1;
        }
      });
      dbg('heal: +' + n);
    }
    function startDrag(ev, pos) {
      /* 拖拽守卫：只排除表单控件（名称按钮允许拖——点击仍是编辑） */
      var t = ev && ev.target;
      if (t && t.closest && t.closest('input,select,textarea')) return;
      ev.preventDefault();
      S.dragIdx = pos;
      dbg('start pos=' + pos);
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    }
    /* 冒烟/排障钩子：绕过鼠标事件链直接驱动同一套逻辑 */
    window.__p3presetTest = { cur: cur, heal: function () { healBlockIds(cur()); } };

    /* ---- 提示块卡片列表（左栏：主序列[✓/✕ 开关 · 拖拽] + 库中未插入分组）----
       酒馆语义：顺序与开关都在 prompt_order 上；未插入的库块永不装配，单独分组展示 */
    function paintBlocks(p) {
      UI.clear(S.blkHost);
      var items = (E.promptOrderItems && p.prompts.length) ? E.promptOrderItems(p) : [];
      var insCnt = items.filter(function (it) { return it.state === 'inserted'; }).length;
      var unlistedCnt = items.length - insCnt;
      S.blkHost.appendChild(h('div', { style: { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'margin': '4px 0 8px' } },
        h('div.sec-title', { style: { margin: '0' } }, h('span.st-t', { text: '提示块（拖动排序 · ✓开 ✕关）' }), h('span.st-l', { text: 'Prompts' }), h('i.st-line')),
        h('button.btn.btn--xs', { type: 'button', title: '新增块并追加到主序列末尾', onclick: function () {
          E.addPresetBlock(p.id, { name: '新提示块', role: 'system', content: '', injection_position: 0, injection_depth: 0, injection_order: p.prompts.length + 1, system_prompt: true });
          S.selBlock = p.prompts.length - 1; paint();
        } }, icon('plus', 'ico ico--sm'), h('span', { text: '新增' }))));
      /* 世界书注入（当前剧情文本）按位置类取一次，供"角色定义前/后"块的 token 合并显示（酒馆同款） */
      var sceneTxt = (D.TURNS && D.TURNS[D.turn] && D.TURNS[D.turn].text) || '';
      var wbAll = E.buildInjectBlocks({ text: sceneTxt });
      var wbOf = function (cls) {
        return wbAll.filter(function (x) { return x.positionClass === cls; }).map(function (x) { return x.content; }).join('\n');
      };
      var unlistedHeaderDone = false;
      items.forEach(function (it) {
        if (it.state === 'unlisted' && !unlistedHeaderDone) {
          unlistedHeaderDone = true;
          S.blkHost.appendChild(h('div', { style: { display: 'flex', 'align-items': 'center', gap: '6px', margin: '12px 0 6px' } },
            h('span', { style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt-3)' }, text: '未插入 · 仅在库中（不参与装配）· ' + unlistedCnt + ' 块' }),
            h('i', { style: { flex: '1', height: '1px', background: 'var(--line-1)', display: 'inline-block' } })));
        }
        var blk = it.block;
        var idx = it.index;
        var pos = it.seq;
        if (!blk) {
          /* order 引用了不存在的块（预设脏数据）：显示占位行，不可开关/编辑；仍计入主序列位置 */
          S.blkHost.appendChild(h('div', { 'data-pos': String(pos - 1), style: { display: 'flex', gap: '7px', 'align-items': 'center', padding: '7px 8px', border: '1px dashed var(--line-1)', 'border-radius': '8px', margin: '0 0 6px', opacity: '0.6' } },
            h('span', { style: { 'flex': '0 0 20px', 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)', 'text-align': 'center' }, text: String(pos) }),
            h('span', { style: { flex: '1', 'font-size': 'var(--fs-xs)', color: 'var(--txt-3)' }, text: '（缺失块 · ' + (it.identifier || '?') + '）' })));
          return;
        }
        var enabled = !!it.enabled;
        var blkId = String(it.identifier || (blk && blk.identifier) || '');
        var isWib = blkId === 'worldInfoBefore', isWia = blkId === 'worldInfoAfter';
        var mergedTok = estTok(blk.content);
        if (isWib) mergedTok += estTok(wbOf('charBefore'));
        if (isWia) mergedTok += estTok(wbOf('charAfter'));
        var tokLabel = String(mergedTok) + ((isWib || isWia) ? '＋WB' : '');
        var rowStyle = { display: 'flex', gap: '7px', 'align-items': 'center', padding: '7px 8px', border: '1px solid var(--line-1)', 'border-radius': '8px', margin: '0 0 6px', background: S.selBlock === idx ? 'rgba(255,196,0,.07)' : 'var(--bg-1)' };
        var nameColor = enabled ? 'inherit' : 'var(--txt-3)';
        var row;
        if (it.state === 'inserted') {
          row = h('div', { 'data-pos': String(pos - 1), style: Object.assign({ cursor: 'grab' }, rowStyle), onmousedown: function (ev) { startDrag(ev, pos - 1); } },
            h('span', { style: { display: 'inline-flex', color: 'var(--txt-2)', padding: '2px' } }, icon('list', 'ico ico--sm')),
            h('span', { style: { 'flex': '0 0 20px', 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)' }, text: String(pos) }));
        } else {
          row = h('div', { style: Object.assign({ cursor: 'default', opacity: '0.85' }, rowStyle) },
            h('span', { style: { display: 'inline-flex', color: 'var(--txt-3)', padding: '2px', 'flex': '0 0 20px', 'justify-content': 'center' } }, icon('cube', 'ico ico--sm')),
            h('span', { style: { 'flex': '0 0 20px', 'font-size': 'var(--fs-xs)', color: 'var(--txt-3)', 'text-align': 'center' }, text: '库' }));
        }
        /* 启用/停用开关（硬编码蓝✓红✕；酒馆：开关状态在 prompt_order 条目上） */
        if (idx >= 0) {
          row.appendChild(h('button', { type: 'button', title: enabled ? '已启用（点击停用）' : '已停用（点击启用）', onclick: function (ev) {
            ev.stopPropagation();
            E.togglePresetBlockEnabled(p.id, idx, !enabled);
            tell(enabled ? '已停用' : '已启用', (blk.name || '(未命名)'), enabled ? 'warn' : 'good', enabled ? 'close' : 'check');
            saveTick(); paint();
          }, style: { flex: '0 0 22px', cursor: 'pointer', background: 'none', border: 'none', padding: '0 2px', 'font-size': '13px', 'font-weight': '700', color: enabled ? '#3fa9f5' : '#e06a50', 'font-family': 'inherit' }, text: enabled ? '✓' : '✕' }));
        }
        row.appendChild(h('button', { type: 'button', style: { flex: '1', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', color: nameColor, 'font-size': 'inherit', padding: '0', 'font-family': 'inherit', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap', opacity: enabled ? '1' : '0.72' }, title: '点击编辑（在右侧打开）', onclick: function () { if (idx < 0) return; S.selBlock = S.selBlock === idx ? null : idx; paint(); } },
          h('span', { text: ((blk.name || '(未命名)') + ' · ' + (blk.role || 'system')) + (blk.marker ? ' · 标记' : '') + (enabled ? '' : ' · 停用') })));
        if (blk.marker) row.appendChild(h('span', { style: { 'font-size': '10px', color: 'var(--txt-3)', border: '1px solid var(--line-1)', borderRadius: '4px', padding: '0 4px' }, text: '标记' }));
        row.appendChild(h('span.u-mono', { style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)' }, text: 'P' + (blk.injection_position ?? 0) + ' D' + (blk.injection_depth ?? 0) }));
        row.appendChild(h('span.u-mono', { style: { 'font-size': 'var(--fs-xs)', color: 'var(--txt-3)', 'min-width': '64px', 'text-align': 'right', display: 'inline-block' }, title: '内容估算 token 数（含世界书注入）', text: tokLabel }));
        if (it.state === 'unlisted') {
          row.appendChild(miniBtn(h, 'plus', function (ev) {
            ev.stopPropagation();
            healBlockIds(p);
            var ids = [];
            (E.promptOrderItems(cur() || p)).forEach(function (x) { if (x.state === 'inserted' && x.identifier) ids.push(x.identifier); });
            var pid2 = String(blkId || '');
            if (pid2) ids.push(pid2);
            E.setPromptBlockSequence(p.id, ids);
            tell('已加入主序列末尾', blk.name || pid2, 'good', 'check');
            saveTick(); paint();
          }, false, '插入到主序列末尾（开始参与装配）'));
        }
        row.appendChild(miniBtn(h, 'copy', function (ev) { ev.stopPropagation(); E.addPresetBlock(p.id, JSON.parse(JSON.stringify(blk))); paint(); }, false, '复制提示块'));
        row.appendChild(miniBtn(h, 'trash', function (ev) {
          ev.stopPropagation();
          UI.confirm({ title: '删除提示块', msg: '删除「' + (blk.name || '(未命名)') + '」？', icon: 'trash', okText: '删除' })
            .then(function (ok) { if (ok) { E.removePresetBlock(p.id, idx); S.selBlock = null; paint(); } });
        }, true, '删除提示块'));
        S.blkHost.appendChild(row);
      });
      if (!items.length) S.blkHost.appendChild(h('p.field-hint', { text: '该预设暂无提示块（导入酒馆预设或点「新增」）' }));
    }

    /* ---- 预设选择（顶部小列表） ---- */
    function paintPicker() {
      UI.clear(S.pickRowsHost);
      var q = S.query || '';
      presets().forEach(function (p) {
        if (q && p.name.indexOf(q) < 0) return;
        S.pickRowsHost.appendChild(h('div', { style: { display: 'flex', gap: '6px', 'align-items': 'center', padding: '4px 6px', 'border-radius': '6px', cursor: 'pointer', background: S.sel === p.id ? 'var(--bg-2)' : 'none', border: '1px solid ' + (S.sel === p.id ? 'var(--line-2)' : 'transparent') }, onclick: function (ev) { if (rowGuard(ev)) return; S.sel = p.id; S.selBlock = null; paint(); } },
          h('input', { type: 'radio', name: 'pr-pick', checked: (E.getActivePresetId() === p.id) ? true : null, onclick: function (ev) { ev.stopPropagation(); E.setActivePresetId(p.id); tell('预设已启用', p.name, 'good', 'preset'); paint(); } }),
          h('span', { style: { 'flex': '1', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }, text: p.name + (E.getActivePresetId() === p.id ? ' ✓' : '') }),
          miniBtn(h, 'edit', function (ev) { ev.stopPropagation(); S.sel = p.id; S.selBlock = null; paint(); }, false, '编辑')));
      });
      S.prListHost.appendChild(S.pickRowsHost);
    }

    /* ---- 右栏：预设名 + 操作 + 块编辑器（顶部 · 旁边）+ 采样（折叠） ---- */
    function paintDetail(p) {
      UI.clear(S.detHost);
      if (!p) return;
      S.detHost.appendChild(h('div', { style: { display: 'flex', gap: '8px', 'align-items': 'center', 'margin': '4px 0 10px' } },
        h('input.field', { type: 'text', value: p.name, style: { 'max-width': '240px', 'font-weight': '600' }, onchange: function (ev) { E.updatePreset(p.id, { name: ev.target.value || p.name }); paint(); } }),
        h('span', { id: 'p3-pr-saved', style: { 'font-size': 'var(--fs-xs)', color: 'var(--accent)' } }),
        h('span', { style: { 'flex': '1' } }),
        miniBtn(h, 'copy', function () { E.duplicatePreset(p.id, p.name + ' 副本'); tell('已复制', p.name + ' 副本', 'good', 'copy'); paint(); }, false, '复制预设'),
        h('button.btn.btn--xs', { type: 'button', onclick: function () { downloadText(p.name + '.json', E.exportSillyTavernPreset(p)); tell('已导出', p.name + '.json（酒馆可再导入）', 'good', 'download'); } }, icon('download', 'ico ico--sm'), h('span', { text: '导出' })),
        miniBtn(h, 'trash', function () {
          UI.confirm({ title: '移除预设', msg: '将删除「' + p.name + '」。', icon: 'trash', okText: '移除', countdown: 15 })
            .then(function (ok) { if (ok) { E.removePreset(p.id); S.sel = null; paint(); } });
        }, true, '移除预设')));
      if (S.selBlock !== null && p.prompts[S.selBlock]) {
        S.detHost.appendChild(paintBlockEditor(p, S.selBlock));
      } else {
        S.detHost.appendChild(h('p.field-hint', { text: '在左侧提示块列表点击任意块 → 编辑器在右侧（此处）打开' }));
      }
      var sampling = paintSampling(p);
      S.detHost.appendChild(h('details', { style: { border: '1px solid var(--line-1)', 'border-radius': '8px', padding: '8px 10px', 'margin-top': '10px' } },
        h('summary', { style: { cursor: 'pointer', 'font-size': 'var(--fs-sm)', color: 'var(--txt-2)' }, text: '采样参数（点击展开/收起）' }),
        sampling));
      /* 回合装配预览：预设 + 世界书注入面 + 地图上下文 + 玩家输入（酒馆包裹语义可见可验） */
      var prevHost = h('div.stack-sm', { class: 'p3-scroll', style: { 'max-height': '300px', overflowY: 'auto', 'padding-right': '2px' } });
      var prevBtn = h('button.btn.btn--sm', { type: 'button', onclick: function () {
        var p2 = cur();
        if (!p2) { tell('无预设', '请先选择预设', 'warn', 'warning'); return; }
        var sceneText = (D.TURNS && D.TURNS[D.turn] && D.TURNS[D.turn].text) || '';
        var sceneName = (D.SCENES && D.SCENES[D.sceneIdx || 0] && D.SCENES[D.sceneIdx || 0].name) || '';
        var mapCtx = '';
        var cfg = E.getCfg ? E.getCfg() : null;
        if (cfg && cfg.MAP_DATA && cfg.MAP_DATA.landmarks) mapCtx = '（地图总览与当前空间情景）';
        var blocks = E.buildInjectBlocks({ text: sceneText + ' ' + sceneName });
        var msgs = E.buildMessages(p2, '【玩家输入示例】', mapCtx, blocks);
        var zoneCnt = { charBefore: 0, charAfter: 0, inline: 0 };
        blocks.forEach(function (b2) {
          if (b2.positionClass === 'charBefore' || b2.positionClass === 'charAfter') zoneCnt[b2.positionClass] += 1;
          else if (b2.positionClass !== 'system') zoneCnt.inline += 1;
          else zoneCnt.charBefore += 1;
        });
        UI.clear(prevHost);
        msgs.forEach(function (m) {
          prevHost.appendChild(h('div.lcard', null,
            icon(m.role === 'system' ? 'context' : (m.role === 'assistant' ? 'spark' : 'user'), 'ico lc-ico'),
            h('div', null,
              h('div.lc-t', { text: (m.role === 'system' ? '系统段' : m.role === 'assistant' ? '助手段（前缀）' : '用户段') + ' · ' + estTok(m.content) + ' tok' }),
              h('div.lc-d', { style: { 'white-space': 'pre-wrap', 'line-height': '1.7' }, text: String(m.content || '') })
            )
          ));
        });
        tell('装配预览已刷新', '世界书命中 ' + blocks.length + ' 条：↑Char ' + zoneCnt.charBefore + ' / ↓Char ' + zoneCnt.charAfter + ' / @深度 ' + zoneCnt.inline + '（注入文本只含条目内容）', 'good', 'context');
        /* 世界书注入明细：点击条目名展开完整内容 */
        if (blocks.length) {
          var wbDetail = h('details', { style: { border: '1px solid var(--line-1)', 'border-radius': '8px', padding: '6px 10px', 'margin-top': '8px' } },
            h('summary', { style: { cursor: 'pointer', 'font-size': 'var(--fs-xs)', color: 'var(--txt-2)' }, text: '世界书注入明细（' + blocks.length + ' 条 · 点击查看）' }));
          blocks.forEach(function (wb) {
            var posLabel = wb.positionClass === 'charBefore' ? '（角色定义前 ↑Char）' : wb.positionClass === 'charAfter' ? '（角色定义后 ↓Char）' : '（@深度 D' + (wb.depth ?? 4) + (wb.role && wb.role !== 'system' ? ' · ' + wb.role : '') + '）';
            wbDetail.appendChild(h('details', { style: { 'margin-top': '4px' } },
              h('summary', { style: { cursor: 'pointer', 'font-size': 'var(--fs-xs)', color: 'var(--acc)', 'margin-left': '6px' }, text: '【' + wb.book + ' · ' + wb.comment + '】' + posLabel }),
              h('div', { style: { 'font-size': 'var(--fs-xs)', 'white-space': 'pre-wrap', 'line-height': '1.7', 'margin': '4px 10px', color: 'var(--txt-2)' }, text: String(wb.content) })));
          });
          prevHost.appendChild(wbDetail);
        }
      } }, icon('context', 'ico ico--sm'), h('span', { text: '刷新装配预览' }));
      S.detHost.appendChild(h('details', { style: { border: '1px solid var(--line-1)', 'border-radius': '8px', padding: '8px 10px', 'margin-top': '10px' } },
        h('summary', { style: { cursor: 'pointer', 'font-size': 'var(--fs-sm)', color: 'var(--txt-2)' }, text: '回合装配预览（预设 + 世界书注入 + 地图 + 玩家输入）' }),
        prevBtn, prevHost));
    }
    function paint() {
      UI.clear(S.prListHost); UI.clear(S.blkHost); UI.clear(S.detHost);
      if (!E) {
        S.prListHost.appendChild(UI.empty('引擎不可用', '在 p3-demo 目录执行 node build-engine.mjs 构建引擎后刷新。', 'preset'));
        return;
      }
      if (!S.pickRowsHost) S.pickRowsHost = h('div', { id: 'p3-pr-rows' });
      if (!S.toolbarMade) {
        S.toolbarMade = true;
        S.prListHost.appendChild(h('div', { style: { display: 'flex', gap: '6px', 'margin-bottom': '6px' } },
          h('button.btn.btn--xs', { type: 'button', onclick: function () {
            var np = { id: 'preset_' + Date.now(), name: '新预设', createdAt: new Date().toISOString(), prompts: [], sampling: { temperature: 1.0, top_p: 0.95 } };
            E.addPreset(np); S.sel = np.id;
            tell('已创建', '「新预设」—— 点名称可重命名', 'good', 'plus');
            paint();
          } }, icon('plus', 'ico ico--sm'), h('span', { text: '新建' })),
          h('button.btn.btn--xs', { type: 'button', onclick: function () { file.click(); } }, icon('upload', 'ico ico--sm'), h('span', { text: '导入' })),
          S.searchHost = h('input.field', { type: 'text', placeholder: '搜索…', value: S.query })));
        S.searchHost.addEventListener('input', function () { S.query = S.searchHost.value; paintPicker(); });
      }
      paintPicker();
      var p = cur();
      if (p) {
        paintBlocks(p);
        paintDetail(p);
      } else {
        if (presets().length) S.blkHost.appendChild(UI.empty('选择一个预设', '左侧点击预设；提示块在左列表，点击在右侧编辑。', 'preset'));
        else S.blkHost.appendChild(UI.empty('尚无预设', '点上方「导入」选择酒馆导出的 preset JSON（按文件名命名）；未导入时不注入任何题材内容。', 'preset'));
      }
    }

    var file = h('input', { type: 'file', accept: '.json', style: 'display:none', id: 'p3-pr-file' });
    readFile(file, function (text, fname) {
      var r = E.importSillyTavernPreset(text);
      if (!r.ok) { tell('导入失败', r.error, 'warn', 'warning'); return; }
      if (fname) r.preset.name = fname.replace(/\.json$/i, '');
      // 同名防重：已存在同名预设 → 自动追加 -2/-3…
      var nm = r.preset.name, n = 2;
      while (E.loadPresets().some(function (p2) { return p2.name === nm; })) { nm = r.preset.name + '-' + (n++); }
      r.preset.name = nm;
      E.addPreset(r.preset);
      S.sel = r.preset.id; S.selBlock = null;
      tell('预设已导入', r.preset.name + ' · ' + r.preset.prompts.length + ' 个提示块', 'good', 'upload');
      paint();
    });

    paint();

    return {
      actions: [
        act('导入酒馆预设', 'upload', function () { file.click(); }),
        act('清空全部', 'trash', function () {
          UI.confirm({ title: '清空所有预设', msg: '将删除全部预设。', icon: 'trash', okText: '清空', countdown: 20 })
            .then(function (ok) { if (ok) { E.clearPresets(); S.sel = null; S.selBlock = null; paint(); } });
        }, '.btn--danger')
      ],
      body: h('div.stack', null,
        (function () {
          var wide = window.innerWidth >= 860;
          return h('div', { style: { display: 'flex', gap: '14px', 'align-items': 'stretch', flexDirection: wide ? 'row' : 'column', height: wide ? 'min(60vh, calc(100vh - 320px))' : '60vh', 'min-height': '300px' } },
            h('div', { class: 'p3-scroll', style: { 'flex': 'none', width: wide ? '430px' : '100%', height: wide ? '100%' : '30%', 'padding-right': '2px' } },
              S.prListHost,
              S.blkHost),
            h('div', { id: 'p3-pr-scroll', class: 'p3-scroll', style: { 'flex': '1 1 auto', 'min-width': '0', width: wide ? '0' : '100%', height: wide ? '100%' : '70%' } },
              S.detHost));
        })(),
        file)
    };
  };

  /* ================= API 模型（酒馆连接器式：26 连接器·默认端点·自定义头·三路由） ================= */
  P.api = function (h, ico, UI, D, L) {
    var E = engine();
    var host = h('div.stack', { id: 'p3-api-host' });
    function paint() {
      UI.clear(host);
      if (!E || !E.loadApiConfig || !E.saveApiConfig || !E.CONNECTORS) {
        host.appendChild(UI.empty('引擎不可用', '在 p3-demo 目录执行 node build-engine.mjs 构建引擎后刷新。', 'api'));
        return;
      }
      var cfg = E.loadApiConfig();
      var POSTMODES = [
        ['strict', '严格（强制对话角色交替、用户最先）'], ['semi', '半严格（强制对话角色交替）'], ['merge', '合并相同角色连续发言'], ['single_user', '单一用户消息'], ['none', '不处理'],
      ];
      [['main', '主 API（正文 · 判定申报 · 回合）'], ['varAi', '次 API（变量 · 总结，可选增强）'], ['rag', '记忆检索（P3 预留）']].forEach(function (r) {
        var rc = cfg[r[0]] || { baseUrl: '', apiKey: '', model: '', connector: '', headers: '' };
        var connSel = selIn(h, E.CONNECTORS.map(function (c) { return { value: c.id, label: c.label }; }), rc.connector || 'custom');
        connSel.addEventListener('change', function () {
          var hit = E.CONNECTORS.filter(function (c) { return c.id === connSel.value; })[0];
          if (hit) bUrl.value = hit.endpoint;
        });
        var bUrl = h('input.field', { type: 'text', value: rc.baseUrl || '', placeholder: '接口地址（自动随连接器填入；不行？在末尾加 /v1 试试）' });
        var aKey = h('input.field', { type: 'password', value: rc.apiKey || '', placeholder: 'API 密钥（仅存本机）' });
        var mdl = h('input.field', { type: 'text', value: rc.model || '', placeholder: '模型名（可点下方「读取可用模型」选择）' });
        var hdrs = h('textarea.field', { rows: '2', placeholder: '自定义请求头 JSON（可选，如 {"HTTP-Referer":"...","X-Title":"..."}）', text: rc.headers || '' });
        var card = h('div.lcard', null,
          ico('api', 'ico lc-ico'),
          h('div', { style: { 'flex': '1', minWidth: '0' } },
            h('div.lc-t', { text: r[1] }),
            h('div', { style: { display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '4px 12px', marginTop: '8px' } },
              fldRow(h, '连接器', null, connSel),
              fldRow(h, '接口地址', null, bUrl),
              fldRow(h, 'API 密钥', null, aKey),
              fldRow(h, '模型', null, mdl),
              fldRow(h, '自定义请求头', null, hdrs)),
            h('p.field-hint', { text: '选连接器自动填默认端点；「自定义」填任意 OpenAI 兼容地址（本地/LLaMA.cpp/KoboldCPP 等）。' })),
          h('span.lc-r', {},
            h('button.btn.btn--xs', { type: 'button', onclick: function () {
              var next = JSON.parse(JSON.stringify(E.loadApiConfig()));
              next[r[0]] = { baseUrl: bUrl.value, apiKey: aKey.value, model: mdl.value, connector: connSel.value, headers: hdrs.value };
              E.saveApiConfig(next);
              tell('已保存', r[1] + '（密钥已保存 ' + new Date().toTimeString().slice(0, 5) + '）', 'good', 'save');
              paint();
            } }, h('span', { text: '保存' })),
            h('button.btn.btn--xs', { type: 'button', onclick: function () {
              var next = JSON.parse(JSON.stringify(E.loadApiConfig()));
              next[r[0]] = { baseUrl: '', apiKey: '', model: '', connector: '', headers: '' };
              E.saveApiConfig(next);
              paint();
            } }, h('span', { text: '清除' }))));
        if (r[0] === 'main') {
          /* 可用模型读取（GET /models，酒馆同款） + 连接性测试 */
          var modelSelRow = h('div', { style: { display: 'flex', gap: '8px', 'align-items': 'center', marginTop: '4px' } }, null);
          var modelSel = selIn(h, [{ value: '', label: '（点击「读取可用模型」）' }], '');
          var readBtn = h('button.btn.btn--xs', { type: 'button', onclick: function () {
            readBtn.disabled = true;
            E.listModels({ baseUrl: bUrl.value, apiKey: aKey.value, headers: hdrs.value })
              .then(function (ids) {
                UI.clear(modelSel);
                modelSel.appendChild(h('option', { value: '', text: '可用模型（' + ids.length + '）' }));
                ids.forEach(function (id) { modelSel.appendChild(h('option', { value: id, text: id })); });
                tell('模型列表已读取', ids.length + ' 个可用', 'good', 'check');
                readBtn.disabled = false;
              })
              .catch(function (err) {
                tell('无法读取模型', String(err && err.message || err), 'warn', 'warning');
                readBtn.disabled = false;
              });
          } }, icon('refresh', 'ico ico--sm'), h('span', { text: '读取可用模型' }));
          modelSel.addEventListener('change', function () { if (modelSel.value) mdl.value = modelSel.value; });
          modelSelRow.appendChild(readBtn);
          modelSelRow.appendChild(modelSel);
          var testBtn = h('button.btn.btn--sm', { type: 'button', onclick: function () {
            testBtn.disabled = true;
            E.testConnection({ baseUrl: bUrl.value, apiKey: aKey.value, model: mdl.value, headers: hdrs.value })
              .then(function (r) {
                tell(r.ok ? '连接成功' : '连接失败', r.message, r.ok ? 'good' : 'warn', r.ok ? 'check' : 'warning');
                testBtn.disabled = false;
              });
          } }, icon('link', 'ico ico--sm'), h('span', { text: '测试连接' }));
          card.appendChild(h('div', { style: { display: 'flex', gap: '10px', 'align-items': 'center', margin: '6px 0 0' } }, testBtn, modelSelRow));
        }
        host.appendChild(card);
      });
      /* 提示词后处理（酒馆消息规整 7 档：合并/严格/用户最先…） */
      var ppSel = selIn(h, POSTMODES.map(function (p) { return { value: p[0], label: p[1] }; }), cfg.postprocess || 'strict');
      ppSel.addEventListener('change', function () {
        var next = JSON.parse(JSON.stringify(E.loadApiConfig()));
        next.postprocess = ppSel.value;
        E.saveApiConfig(next);
        tell('后处理已保存', ppSel.value, 'good', 'save');
      });
      host.appendChild(h('div.lcard', null,
        ico('sliders', 'ico lc-ico'),
        h('div', null,
          h('div.lc-t', { text: '提示词后处理（消息规整）' }),
          h('div.lc-d', { text: '合并相同角色连续发言 / 强制对话角色交替 / 用户最先——与酒馆 No Tools 组一致（With Tools 组语义等价）。' })),
        h('span.lc-r', {}, ppSel)));
      var ok = E.isMainConfigured ? E.isMainConfigured() : false;
      host.appendChild(h('div.panel-note', null, ico(ok ? 'check' : 'info', 'ico ico--sm'),
        h('span', { text: ok ? '主 API 已配置——战术棋盘「流式回合」将使用真实模型（未配置时回退 Mock 演示）。' : '主 API 未配置——未填写接口/密钥/模型；战术棋盘「流式回合」将回退 Mock 演示。' })));
      host.appendChild(h('p.field-hint', { text: '密钥仅存本机（localStorage），不入云端；填写后点「保存」即可。' }));
    }
    paint();
    return {
      actions: [act('刷新', 'refresh', function () { paint(); })],
      body: host,
    };
  };

  /* ================= 世界地图（社区版：百分制坐标 · 地标定位 · 玩家位置） ================= */
  P.map = function (h, ico, UI, D, L) {
    var E = engine();
    var mapHost = h('div', { id: 'p3-map-canvas' });
    var infoHost = h('div.stack', { id: 'p3-map-info' });
    var scale = 1, tx = 0, ty = 0;

    function currentLoc() {
      var t = D.TURNS && D.TURNS[D.turn];
      var place = (t && t.place) || '廷根市';
      return { 区域: '鲁恩王国', 地标: place, 坐标: { x: 39.5, y: 51.2 } };
    }

    function paint() {
      UI.clear(mapHost); UI.clear(infoHost);
      if (!E || !E.getCfg) {
        mapHost.appendChild(UI.empty('引擎不可用', '先执行 node build-engine.mjs 构建引擎。', 'map'));
        return;
      }
      var data = E.getCfg().MAP_DATA;
      if (!data || !data.landmarks || !data.landmarks.length) {
        mapHost.appendChild(UI.empty('未导入地图数据', '导入包含「【配置】地图数据」的世界书（如 2历史孔隙.json）后，地标与坐标系统生效。', 'map'));
        return;
      }
      var loc = currentLoc();
      var img = h('img', { src: 'https://files.catbox.moe/wpsj51.png', alt: '世界地图', style: 'position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover' });
      img.addEventListener('error', function () { img.style.display = 'none'; });
      var layer = h('div', { style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')', 'transform-origin': 'center', transition: 'transform .18s' } }, img);
      data.landmarks.forEach(function (lm) {
        var here = lm.name === loc.地标;
        layer.appendChild(h('button.landmark' + (here ? '.is-here' : ''), {
          type: 'button',
          style: { left: lm.marker.left + '%', top: (parseFloat(lm.marker.top)) + '%' },
          title: lm.name,
          onclick: function () { tell(lm.name, lm.note || ('位于 ' + lm.mainRegionName), here ? 'good' : 'info', 'location'); }
        }, ico(here ? 'target' : 'location', 'ico ico--sm')));
      });
      var wrap = h('div.cyanotype', { style: { 'aspect-ratio': '16 / 10', 'min-height': '340px', position: 'relative', overflow: 'hidden' } }, layer);
      mapHost.appendChild(wrap);
      var ctx = E.assembleMapContext(loc, data);
      infoHost.appendChild(h('div.lcard', null,
        ico('location', 'ico lc-ico'),
        h('div', null,
          h('div.lc-t', { text: loc.区域 + ' · ' + loc.地标 }),
          h('div.lc-d', { text: '坐标 (' + loc.坐标.x + ', ' + loc.坐标.y + ') · 百分制坐标系，(0,0) 在左上角' }))));
      data.mainRegions.forEach(function (r) {
        infoHost.appendChild(h('div.lc-d', { text: '· ' + r.name + '（' + data.landmarks.filter(function (l) { return l.mainRegionName === r.name; }).length + ' 地标）' }));
      });
    }

    paint();

    return {
      actions: [
        act('放大', 'plus', function () { scale = Math.min(3, scale * 1.25); paint(); }),
        act('缩小', 'minus', function () { scale = Math.max(0.6, scale / 1.25); paint(); }),
        act('复位', 'refresh', function () { scale = 1; tx = 0; ty = 0; paint(); }),
      ],
      body: h('div.stack', null,
        h('div.panel-note', null, ico('info', 'ico ico--sm'),
          h('span', { text: '社区版世界观：地图数据来自世界书「【配置】地图数据」，坐标百分制；地标悬停可看说明；移动需符合地理逻辑，时间照常流逝。' })),
        mapHost, infoHost)
    };
  };
})();
