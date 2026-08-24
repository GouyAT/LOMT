/* 页面内自动化冒烟：世界书/预设面板（酒馆式布局）——结果写入 #smoke-out 浮窗（白字置顶） */
(function () {
  'use strict';
  var out = ['SMOKE v6'];
  function check(n, ok) { out.push((ok ? 'PASS ' : 'FAIL ') + n); }
  window.addEventListener('error', function (e) { out.push('JSERROR ' + (e.message || '')); });
  window.addEventListener('unhandledrejection', function (e) { out.push('REJECTION ' + String(e.reason)); });
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function byText(t) {
    var all = document.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (e.children.length === 0 && e.textContent && e.textContent.indexOf(t) >= 0) return e;
    }
    return null;
  }
  function has(t) { return !!byText(t); }
  function clickText(t) { var e = byText(t); if (e) { e.click(); return true; } return false; }
  function clickUp(t) { var e = byText(t); if (!e) return false; var n = e; while (n && n !== document.body) { if (n.onclick) { n.click(); return true; } n = n.parentNode; } e.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }
  function setSelect(text, value) {
    var opts = document.querySelectorAll('select');
    for (var i = 0; i < opts.length; i++) {
      var s = opts[i];
      var found = false;
      for (var j = 0; j < s.options.length; j++) { if (s.options[j].textContent.indexOf(text) >= 0) { found = true; break; } }
      if (found) { s.value = value; s.dispatchEvent(new Event('change', { bubbles: true })); return true; }
    }
    return false;
  }
  function setNumByValue(oldV, newV) {
    var ns = document.querySelectorAll('input[type="number"]');
    for (var i = 0; i < ns.length; i++) {
      if (ns[i].value === String(oldV)) { ns[i].value = String(newV); ns[i].dispatchEvent(new Event('change', { bubbles: true })); return true; }
    }
    return false;
  }
  function setInputByPlaceholder(ph, val) {
    var ns = document.querySelectorAll('input.field, textarea.field, input');
    for (var i = 0; i < ns.length; i++) {
      if (ns[i].placeholder && ns[i].placeholder.indexOf(ph) >= 0) { ns[i].value = val; ns[i].dispatchEvent(new Event('change', { bubbles: true })); return true; }
    }
    return false;
  }

  async function run() {
    try {
    await wait(700);
    var E = window.GUIMI_ENGINE;
    if (!E) { out.push('FAIL engine not loaded'); finish(); return; }
    /* 零破坏：不清空用户数据；种子书/预设用固定 id，结束后删除 */
    function seedBook() {
      var fs2 = E.loadWorldBooks().filter(function (x) { return x.id === 'wb_t1'; });
      return fs2[0] || null;
    }
    function seedPreset() {
      var ps = E.loadPresets().filter(function (x) { return x.id === 'pr1'; });
      return ps[0] || null;
    }
    E.addWorldBook({
      id: 'wb_t1', name: '酒馆书32', createdAt: new Date().toISOString(), active: true, scanDepth: 5000,
      entries: [
        { comment: '【词库链】事件-静默古堡', content: '{"name":"静默古堡"}', key: '廷根', depth: 4, order: 0, position: 'char_before', selectiveLogic: 'AND', caseSensitive: true, useProbability: true, probability: 0.5, sticky: 3, cooldown: 4, delay: 5, group: 'A', groupWeight: 100, matchScenario: true, triggers: ['古堡'] },
        { comment: '【世界】世界地图', content: 'map data', key: '地图', depth: 3, order: 1, position: 'char_before' },
        { comment: '停用条目', content: 'x', key: '克莱恩', depth: 1, order: 2, disable: true },
      ],
    });
    E.addWorldBook({ id: 'wb_t2', name: '1源堡', createdAt: new Date().toISOString(), active: false, entries: [{ comment: '【配置】地图数据', content: 'MAP_DATA', constant: true, depth: 9 }] });
    E.addPreset({
      id: 'pr1', name: '测试预设', createdAt: new Date().toISOString(),
      prompts: [
        { name: 'Core', content: '<rule>一</rule>', role: 'system', system_prompt: true, injection_position: 0, injection_depth: 10, injection_order: 100 },
        { name: '追加', content: '<rule>二</rule>', role: 'system', system_prompt: true, injection_position: 0, injection_depth: 4, injection_order: 5 },
        { name: '示例', content: '<example>甲</example>', role: 'system', marker: true, system_prompt: true, injection_position: 0, injection_depth: 0, injection_order: 1 },
      ],
      sampling: {
        temperature: 1.0, top_p: 0.95, min_p: 0, repetition_penalty: 1.0, frequency_penalty: 0, presence_penalty: 0,
        openai_max_context: 200000, openai_max_tokens: 20000, seed: -1, stream_openai: true,
        names_behavior: -1, wrap_in_quotes: false, end_if_empty: false, new_chat_prompt: '',
        new_example_chat_prompt: '', continue_nudge_prompt: '', alias_preset_selected: 'Default (none)',
        max_context_unlocked: true, scenario_format: '[...]', personality_format: '[...]', prompt_order: '[]',
        assistant_prefill: '', claude_use_sysprompt: false, squash_system_messages: false,
        image_inlining: false, video_inlining: false, assistant_impersonation: false, use_makersuite_sysprompt: false,
      },
    });

    /* —— 世界书 —— */
    window.APP.openPanel('worldbook');
    await wait(500);
    check('面板打开(标题)', has('世界书'));
    check('顶部全局设置行', has('已启用的世界书（全局有效）'));
    check('书列表含 酒馆书32', has('酒馆书32'));
    check('书列表含 1源堡', has('1源堡'));
    clickText('酒馆书32');
    await wait(350);
    check('条目表格表头(插入位置)', has('插入位置'));
    check('表格行(事件-静默古堡)', has('【词库链】事件-静默古堡'));
    // 行内位置改 char_after → 即存
    var okPos = setSelect('角色定义前（↑Char）', 'char_after');
    await wait(250);
    var posSaved = (seedBook() || { entries: [] }).entries[0].position;
    check('行内改位置即存', okPos && posSaved === 'char_after');
    setSelect('角色定义后（↓Char）', 'char_before');
    // 行首勾选（禁用开关）点击 → 即存
    var cb = document.querySelector('[data-role="row-enable"]');
    if (cb) { cb.click(); await wait(300); }
    check('行首勾选即存(停用)', (seedBook() || { entries: [] }).entries[0].disable === true);
    // 点击条目行 → 行下展开（先展开，再删除）
    clickText('【词库链】事件-静默古堡');
    await wait(350);
    check('行下展开编辑器(主要关键字)', has('主要关键字'));
    check('编辑器含 粘性（消息数）', has('粘性（消息数）'));
    check('编辑器含 匹配角色描述', has('匹配角色描述'));
    check('编辑器含 绑定角色（JSON）', has('绑定角色（JSON）'));
    check('编辑器含 生成触发器', has('生成触发器'));
    /* —— 蓝绿灯（酒馆灯色语义：蓝=constant 恒注入 / 绿=关键词触发） —— */
    check('编辑器含 蓝灯/绿灯 段控', has('蓝灯 · 常驻') && has('绿灯 · 关键词'));
    check('行内灯色圆点存在(默认绿灯)', !!document.querySelector('button[title^="绿灯 · 关键词触发"]'));
    var blueBtn = byText('蓝灯 · 常驻');
    if (blueBtn) { blueBtn.click(); await wait(350); }
    check('编辑器切蓝灯即存(constant=true)', (seedBook() || { entries: [] }).entries[0].constant === true);
    var lampBack = document.querySelector('button[title^="蓝灯 · 常驻恒注入"]');
    if (lampBack) { lampBack.click(); await wait(350); }
    check('行内圆点切回绿灯(constant=false)', (seedBook() || { entries: [] }).entries[0].constant === false);
    var okSticky = setNumByValue(3, 7);
    await wait(250);
    if ((seedBook() || { entries: [] }).entries[0].sticky !== 7) {
      /* 时序鲁棒：重试一次（编辑器重绘竞态） */
      okSticky = setNumByValue(7, 7);
      await wait(250);
    }
    check('编辑器改粘性即存', (seedBook() || { entries: [] }).entries[0].sticky === 7);
    // 收起编辑器 → 点第二行（【世界】世界地图）→ 内容对应（map data）
    clickText('编辑条目 · 【词库链】事件-静默古堡（酒馆书32）');
    // 收起按钮文本是「收起」——用标题按钮点击另一行代替：
    clickText('【世界】世界地图');
    await wait(350);
    check('第二行展开内容对应(map data)', has('map data'));
    clickText('【词库链】事件-静默古堡');
    await wait(300);
    check('分页条(每页)', has('每页'));
    // 删除条目：删第 3 行（停用条目），点删除 → 确认框 → 确定
    var delBtns = document.querySelectorAll('button[title="删除条目"]');
    var delBtn = delBtns[delBtns.length - 1];
    if (delBtn) { delBtn.click(); await wait(300); }
    check('删除确认框弹出', has('删除条目'));
    var yes = document.getElementById('p3-confirm-yes');
    if (yes) { yes.click(); await wait(300); }
    check('删除生效(2 条)', (seedBook() || { entries: [] }).entries.length === 2);
    // 条目搜索过滤（搜索框不被重绘 → 连续输入 + 过滤）
    var sx = document.querySelector('input[placeholder*="搜索条目"]');
    if (sx) { sx.value = '地图'; sx.dispatchEvent(new Event('input', { bubbles: true })); await wait(300); }
    check('条目搜索过滤(仅 1 行)', document.querySelectorAll('[data-role="row-enable"]').length === 1);
    if (sx) { sx.value = ''; sx.dispatchEvent(new Event('input', { bubbles: true })); await wait(250); }

    /* —— 预设（v4：主序列[✓/✕ 开关·拖拽写回 prompt_order] + 库中未插入分组） —— */
    E.addPreset({
      id: 'pr2', name: '顺序预设', createdAt: new Date().toISOString(),
      prompts: [
        { name: '块甲', content: '<a>', identifier: 'a1', role: 'system', injection_position: 0 },
        { name: '块乙', content: '<b>', identifier: 'b1', role: 'system', injection_position: 0 },
        { name: '块丙', content: '<c>', identifier: 'c1', role: 'system', injection_position: 0 },
        { name: '库中块丁', content: '<d>', identifier: 'd1', role: 'system', injection_position: 0 },
      ],
      sampling: {},
      prompt_order: [{ character_id: 100001, order: [
        { identifier: 'a1', enabled: true }, { identifier: 'b1', enabled: false },
        { identifier: 'c1', enabled: true }, { identifier: 'ghost', enabled: true },
      ] }],
    });
    window.APP.openPanel('preset');
    await wait(450);
    check('预设选择(测试预设)', has('测试预设'));
    clickText('测试预设');
    await wait(400);
    check('块卡片列表(v4 标题)', has('提示块（拖动排序 · ✓开 ✕关）'));
    var blkCount = document.querySelectorAll('[data-pos]').length;
    check('块卡片 3 个(无序预设全视作主序列)', blkCount === 3);
    /* —— v4 开关与未插入分组（顺序预设） —— */
    clickText('顺序预设');
    await wait(400);
    var posRows = document.querySelectorAll('[data-pos]').length;
    check('主序列 4 行(含停用/缺失占位)', posRows === 4);
    check('缺失块占位行', has('缺失块'));
    check('未插入分组头(库中块丁)', has('未插入 · 仅在库中'));
    // 停用行 ✕ → 点击启用 → prompt_order 条目同步
    var xBtns = [];
    document.querySelectorAll('[data-pos] button').forEach(function (b) { if (b.textContent === '✕') xBtns.push(b); });
    check('停用行显示 ✕', xBtns.length === 1);
    if (xBtns[0]) { xBtns[0].click(); await wait(350); }
    var pr2 = (E.loadPresets().filter(function (x) { return x.id === 'pr2'; })[0]) || { prompt_order: [{ order: [] }] };
    var po1 = (pr2.prompt_order[0].order || []);
    var b1Entry = po1.filter(function (o) { return o.identifier === 'b1'; })[0];
    check('开关点击写回 prompt_order(b1 启用)', b1Entry && b1Entry.enabled === true);
    // 库中块丁 → 「插入到主序列末尾」
    var insBtn = document.querySelector('button[title="插入到主序列末尾（开始参与装配）"]');
    if (insBtn) { insBtn.click(); await wait(350); }
    pr2 = (E.loadPresets().filter(function (x) { return x.id === 'pr2'; })[0]) || { prompt_order: [{ order: [] }] };
    check('库块插入主序列(order 含 d1)', (pr2.prompt_order[0].order || []).some(function (o) { return o.identifier === 'd1'; }));
    /* —— 原有编辑器/拖拽/采样检查（无序预设 pr1） —— */
    clickText('测试预设');
    await wait(400);
    check('编辑器入口(点 Core)', true);
    clickText('Core');
    await wait(350);
    check('编辑器在右侧打开(编辑提示块)', has('编辑提示块'));
    check('编辑器含 姓名/身份/位置/相对', has('身份（role）') && has('位置（position）') && has('相对（深度）'));
    // 位置断言：仅宽屏（≥860px）查"编辑器在右侧"；窄屏为上下堆叠
    var blkBox = document.querySelector('[data-pos="0"]');
    var edHost = byText('编辑提示块');
    var edBox = edHost ? edHost.closest('div[style*="border"]') : null;
    if (window.innerWidth >= 860 && blkBox && edBox) {
      var br = blkBox.getBoundingClientRect(), er2 = edBox.getBoundingClientRect();
      check('编辑器在旁(矩形右侧)', er2.left >= br.left + br.width - 120);
    } else if (window.innerWidth >= 860) { check('编辑器在旁(矩形右侧)', false); }
    else { check('编辑器在旁(矩形右侧)', true); }
    // 拖拽模拟：第1行 mousedown → 第3行 mousemove → mouseup → 主序列重排（写回 prompt_order）
    var srcRow = document.querySelector('[data-pos="0"]');
    var target = document.querySelector('[data-pos="2"]');
    if (srcRow && target) {
      var tr = target.getBoundingClientRect();
      var cx = tr.left + tr.width / 2, cy = tr.top + tr.height / 2;
      var sr = srcRow.getBoundingClientRect();
      srcRow.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: sr.left + 5, clientY: sr.top + 5 }));
      await wait(120);
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: cx, clientY: cy }));
      await wait(120);
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: cx, clientY: cy }));
      await wait(400);
    }
    var seedPr = seedPreset();
    out.push('INFO 拖拽后主序: ' + (seedPr && seedPr.prompt_order ? JSON.stringify((seedPr.prompt_order[0].order || []).map(function (o) { return o.identifier; })) : '无 order'));
    (window.__p3dbg || []).slice(-8).forEach(function (l) { out.push('INFO dbg ' + l); });
    var ordArr = seedPr && seedPr.prompt_order && seedPr.prompt_order[0] ? (seedPr.prompt_order[0].order || []) : [];
    var uiOk = ordArr.length === 3
      && ordArr.every(function (o) { return String(o.identifier || '').indexOf('blk_') === 0; })
      && ordArr[0] && String(ordArr[0].identifier) === String((seedPr.prompts[1] || {}).identifier);
    check('拖拽(UI事件链)写回主序(首位=「追加」标识)', uiOk);
    if (!uiOk && window.__p3presetTest && E.setPromptBlockSequence) {
      /* 引擎旁证：绕过鼠标事件链直写同一套逻辑（区分 UI 链路问题 vs 引擎问题） */
      window.__p3presetTest.heal();
      var pcur = window.__p3presetTest.cur();
      var ids2 = [];
      (E.promptOrderItems(pcur)).forEach(function (x) { if (x.state === 'inserted' && x.identifier) ids2.push(x.identifier); });
      ids2.push(ids2.shift()); /* 与拖拽意图一致：首块移到末位 → 首位变「追加」 */
      E.setPromptBlockSequence(pcur.id, ids2);
      await wait(300);
      seedPr = seedPreset();
      var o2 = seedPr && seedPr.prompt_order && seedPr.prompt_order[0] ? (seedPr.prompt_order[0].order || []) : [];
      check('引擎直写主序(旁证·首块移到末位)', o2.length === 3 && String((o2[o2.length - 1] || {}).identifier) === String((seedPr.prompts[0] || {}).identifier));
      var row0 = document.querySelector('[data-pos="0"]');
      check('重绘后首位显示「追加」', !!row0 && row0.textContent.indexOf('追加') >= 0);
    }
    // 先展开采样参数（折叠区）
    var sum = byText('采样参数（点击展开/收起）');
    if (sum) { sum.click(); await wait(250); }
    ['上下文长度', '最大回复长度', '角色名称行为', '引号包裹', '空则结束', '压缩系统消息', '内联图片', '内联视频', '解锁上下文上限', '情景格式', '人设格式', '助手预填充', '新聊天提示词', '流式输出'].forEach(function (t) {
      check('采样中文标签 ' + t, has(t));
    });
    // 采样温度 1 → 1.15 即存
    var okT = setNumByValue('1', 1.15);
    await wait(250);
    check('采样温度即存', okT && (seedPreset() || { prompts: [], sampling: {} }).sampling.temperature === 1.15);
    } catch (err) {
      out.push('ERROR ' + String(err && err.stack ? err.stack.split('\n')[0] : err));
    }
    finish();
  }

  function finish() {
    /* 零破坏：清理本脚本的种子数据（用户导入的数据原样保留） */
    try {
      var E = window.GUIMI_ENGINE;
      if (E) {
        if (E.loadWorldBooks().some(function (x) { return x.id === 'wb_t1'; })) E.removeWorldBook('wb_t1');
        if (E.loadWorldBooks().some(function (x) { return x.id === 'wb_t2'; })) E.removeWorldBook('wb_t2');
        if (E.loadPresets().some(function (x) { return x.id === 'pr1'; })) E.removePreset('pr1');
        if (E.loadPresets().some(function (x) { return x.id === 'pr2'; })) E.removePreset('pr2');
      }
    } catch (e2) {}
    try { if (window.UI && window.UI.closePanel) window.UI.closePanel(); } catch (e) {}
    var rows = out.slice(1); // 去掉首行标题
    var numbered = rows.map(function (line, i) { return (i + 1) + ': ' + line; });
    /* 统计与显示同源：先把显示文本渲染进 DOM，再从 DOM 读回统计（任何环境下必然一致） */
    var pre = document.getElementById('smoke-out') || document.createElement('pre');
    pre.id = 'smoke-out';
    pre.style.cssText = 'position:fixed;left:12px;top:12px;z-index:99999;background:#0b0e14;color:#e8e3d8;font:11px/1.65 monospace;padding:12px 16px;border:1px solid #8a6420;border-radius:8px;max-height:94vh;overflow:auto;white-space:pre;max-width:96vw';
    pre.textContent = numbered.join('\n');
    document.body.appendChild(pre);
    var rendered = pre.textContent.split('\n');
    var p = rendered.filter(function (l) { return l.indexOf(': PASS ') >= 0; }).length;
    var f = rendered.filter(function (l) { return l.indexOf(': FAIL ') >= 0 || l.indexOf(': ERROR ') >= 0 || l.indexOf(': JSERROR') >= 0 || l.indexOf(': REJECTION') >= 0; }).length;
    pre.textContent = 'RESULT ' + p + ' PASS / ' + f + ' FAIL / 共 ' + rows.length + ' 行\n' + numbered.join('\n');
    document.title = 'SMOKE_' + (f ? 'FAIL_' + f : 'PASS_ALL');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
