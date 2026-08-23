/* ============================================================
   诡秘剧场 · 原型3 — 核心演示数据（游戏状态 / 回合 / 面板注册表）
   世界观长尾内容见 lore.js（window.LORE）
   ============================================================ */
(function () {
  'use strict';

  /* 老卡背景图（远程；失败自动回退程序化场景） */
  var SCENES = [
    'https://i.postimg.cc/wv6qJydc/bei-jing-tu5.png',
    'https://i.postimg.cc/sfHjQgHh/bei-jing-tu4.png',
    'https://i.postimg.cc/xjpfJ1pN/bei-jing-tu3.png',
    'https://i.postimg.cc/y6p1g8pS/bei-jing-tu2.png',
    'https://i.postimg.cc/J7YrDzYy/bei-jing-tu1.png',
    'https://i.postimg.cc/JzbrYVMN/bei-jing-tu10.png',
    'https://i.postimg.cc/43sJrLx1/bei-jing-tu14.png',
    'https://i.postimg.cc/HLdpfZk0/bei-jing-tu13.png',
    'https://i.postimg.cc/3w1K7Xkt/bei-jing-tu15.png',
    'https://i.postimg.cc/9fbWVdD1/bei-jing-tu16.png',
    'https://i.postimg.cc/mrjbRYcx/bei-jing-tu18.png',
    'https://i.postimg.cc/GpKcrFBH/bei-jing-tu20.png',
    'https://i.postimg.cc/GmkLgwdL/bei-jing-tu9.png',
    'https://i.postimg.cc/Vkt3kGnY/121599044-p0.jpg',
    'https://i.postimg.cc/vTDKF3bq/121599044-p2.jpg'
  ];

  /* ---------------- 角色状态 ---------------- */
  var CHAR = {
    name: '克莱恩·莫雷蒂',
    latin: 'KLEIN MORETTI',
    gender: '男',
    age: 22,
    sequence: '序列9 · 占卜家',
    pathway: '愚者',
    org: '值夜者小队 · 廷根',
    title: '黑荆棘安保公司 · 见习顾问',
    promotion: '魔药消化',
    digest: 34,
    lose: 6,
    fog: 12,
    stats: [
      { k: '活力', v: 26, max: 30, latin: 'VIT' },
      { k: '灵性', v: 37, max: 42, latin: 'SPT' },
      { k: '理智', v: 40, max: 45, latin: 'SAN' },
      { k: '人性', v: 81, max: 90, latin: 'HUM' },
      { k: '敏捷', v: 23, max: 30, latin: 'AGI' },
      { k: '运气', v: 33, max: 40, latin: 'LCK' }
    ],
    slots: [
      { k: '通用一', item: '左轮手枪', icon: 'target', filled: true, note: '警厅制式 · 六发' },
      { k: '通用二', item: '黄铜怀表', icon: 'clock', filled: true, note: '祖父遗物 · 走时偏快' },
      { k: '通用三', item: '铜制护符', icon: 'shield', filled: true, note: '刻有太阳纹 · 微弱辟邪' },
      { k: '通用四', item: '', icon: 'plus', filled: false, note: '空置' },
      { k: '通用五', item: '', icon: 'plus', filled: false, note: '空置' },
      { k: '扮演法', item: '占卜家 · 扮演中', icon: 'eyeMystic', filled: true, special: true, note: '消化 34% · 需持续扮演' }
    ],
    traits: [
      { k: '非凡特性', v: '灵性视觉', note: '序列9 占卜家赋予 · 可短暂看见灵体轮廓' },
      { k: '非凡特性', v: '星象占卜', note: '借塔罗与星位读取灵界涟漪' },
      { k: '非凡特性', v: '灵摆定向', note: '对失物与方位的粗略指示' },
      { k: '天赋', v: '过目不忘', note: '稀有 · 阅读过的文本可精确复述' },
      { k: '天赋', v: '穿越者记忆', note: '独有 · 来自另一个世界的常识与直觉' },
      { k: '天赋', v: '守序之心', note: '普通 · 人性下降速度减缓' }
    ],
    abilities: [
      { k: '塔罗占卜', d: '消耗灵性 5 · 冷却 1 回合', icon: 'tarot', locked: false },
      { k: '灵摆寻物', d: '消耗灵性 3 · 需持有关联物', icon: 'compass', locked: false },
      { k: '灵性视觉', d: '消耗灵性 2 · 持续 3 回合', icon: 'eyeMystic', locked: false },
      { k: '占卜梦境', d: '需入睡 · 每日一次', icon: 'moon', locked: false },
      { k: '危险直觉', d: '被动 · 序列8 解锁', icon: 'spark', locked: true },
      { k: '窥秘之眼', d: '被动 · 序列7 解锁', icon: 'eye', locked: true }
    ],
    currency: [
      { k: '金镑', v: 3 },
      { k: '苏勒', v: 11 },
      { k: '便士', v: 7 },
      { k: '剧场点数', v: 260 },
      { k: '星辉', v: 480 }
    ],
    quests: [
      { k: '水仙花街失踪案', from: '邓恩·史密斯', due: '本周内', step: 1, total: 4, note: '上午十点到黑荆棘安保公司接待室报到，带笔记，别带枪。', kind: '主线' },
      { k: '补正户籍职业一栏', from: '廷根市政厅户籍科', due: '七日内', step: 0, total: 1, note: '第 4471 号住户登记补正通知。逾期会引来上门核查。', kind: '杂务' },
      { k: '凑齐梅丽莎的书本费', from: '班森·莫雷蒂（未明说）', due: '月末', step: 2, total: 5, note: '差 2 苏勒。典当行的估价永远低于市价三成。', kind: '家事' },
      { k: '查明第七条守则', from: '你自己', due: '无期限', step: 1, total: 3, note: '「不要在午夜之后占卜」——写这行字的人比你更怕它。', kind: '暗线' }
    ]
  };

  /* ---------------- 回合（叙事） ---------------- */
  var TURNS = [
    {
      n: 1,
      time: '第五纪1349年6月28日 星期四 07:12',
      place: '鲁恩王国 · 廷根市 · 水仙花街 2 号',
      scene: '卧室',
      photo: 0,
      title: '幕后手记',
      thinking: '玩家刚接管这具身体，尚不知自己已死过一次。本回合只给三样确定之物：房间、怀表、笔记；其余全部留白，等他自己去碰。若他直接去看笔记，就把"占卜家"这个词第一次落到纸面上。',
      body: [
        { t: 'label', v: '水仙花街 2 号 · 二层卧室 · 晨' },
        { t: 'p', v: '你在头痛欲裂中醒来。' },
        { t: 'p', v: '雾裹着煤气灯余烬的昏黄，从窗帘的缝隙挤进这间狭窄的卧室，把褪色的墙纸、床头掉了漆的铜柱、以及你自己搭在被面上的手，一并镀上一层陈旧的锡色。空气里有煤灰、廉价蜡烛和某种类似铁锈的甜味。' },
        { t: 'p', v: '书桌上摊着一本硬皮笔记，压着一枚黄铜怀表。表盖是开着的，秒针在走，走得比你心跳快半拍。' },
        { t: 'em', v: '你确定这不是你的房间。你甚至不确定这是不是你的手。' },
        { t: 'p', v: '楼下传来动静——有人在拨弄炉子，铁钩磕在炉门上，一声，两声。' },
        { t: 'say', v: '"克莱恩？醒了就下来，面包要冷了。"一个年轻男人的嗓音，带着刻意压低的疲惫。' }
      ],
      options: [
        { k: '翻开桌上那本硬皮笔记', tag: '调查' },
        { k: '先拿起黄铜怀表，端详表盖内侧', tag: '调查' },
        { k: '走到窗边，看清这条街道', tag: '观察' },
        { k: '不回应楼下，先检查自己的记忆', tag: '内省' }
      ],
      hotspots: [
        { name: '硬皮笔记', x: 34, y: 62, icon: 'codex', seen: false, note: '扉页写着「占卜家的十二条守则」，字迹与你的一模一样。' },
        { name: '黄铜怀表', x: 52, y: 58, icon: 'clock', seen: false, note: '表盖内侧刻着一行小字：赠予班森与克莱恩，父。' },
        { name: '窗与雾', x: 72, y: 34, icon: 'fog', seen: false, note: '雾里有影子在动，走得太整齐，不像人。' },
        { name: '墙上的镜子', x: 20, y: 38, icon: 'plate', seen: false, note: '镜中的脸比你记忆里年轻五岁，眼下有青黑。' },
        { name: '床下的木箱', x: 44, y: 84, icon: 'bag', seen: false, note: '半开着，里面是当票、旧账本，和一枚铜制护符。' }
      ]
    }
  ];

  /* ---------------- 在场人物 / 伏笔 ---------------- */
  var PRESENCE = [
    { n: '班森·莫雷蒂', s: '兄 · 普通人 · 铁路公司文员', aff: 88, tint: '#8f989e', letter: '班' },
    { n: '梅丽莎·莫雷蒂', s: '妹 · 普通人 · 霍伊学院', aff: 84, tint: '#a68f7c', letter: '梅' },
    { n: '雾中的三道影子', s: '未知 · 灵体？ · 在场感知', aff: 12, tint: '#5d666b', letter: '？' }
  ];

  var THREADS = [
    { t: '祖父的怀表走时偏快', d: '每天快约四分钟。班森说买来就这样。伏笔活跃 · 第 1 回合埋下。' },
    { t: '笔记上的十二条守则', d: '第七条被墨水涂掉了，纸背有压痕，写的是「不要在午夜之后占卜」。' },
    { t: '这具身体死过一次', d: '镜中人眼下的青黑不是熬夜。你在灵界留下过痕迹。' },
    { t: '水仙花街的失踪案', d: '《廷根晚报》连续三期提及。与雾中影子的行进方向一致。' }
  ];

  var QUICKCMDS = [
    { c: '/舆图', d: '打开世界地图' },
    { c: '/行囊', d: '打开行囊与装备' },
    { c: '/关系', d: '打开人物关系' },
    { c: '/快存', d: '写入档案馆节点' },
    { c: '/回滚', d: '退回上一回合' }
  ];

  /* ---------------- 底片条：面板注册表（24 格） ---------------- */
  var FRAMES = [
    { id: 'map', name: '世界地图', latin: 'CHART', icon: 'map', meta: '14 地标', seg: '叙事' },
    { id: 'codex', name: '图鉴', latin: 'CODEX', icon: 'codex', meta: '46 档案', seg: '叙事' },
    { id: 'chronicle', name: '编年史', latin: 'CHRONICLE', icon: 'chronicle', meta: '18 条', seg: '叙事' },
    { id: 'divination', name: '占卜间', latin: 'DIVINE', icon: 'tarot', meta: '灵性 5', seg: '叙事' },
    { id: 'newspaper', name: '廷根晚报', latin: 'POST', icon: 'newspaper', meta: '第 4471 期', seg: '叙事' },
    { id: 'relations', name: '人物关系', latin: 'TIES', icon: 'relations', meta: '10 位', seg: '叙事' },

    { id: 'board', name: '战术棋盘', latin: 'TACTICS', icon: 'board', meta: '推演', seg: '玩法' },
    { id: 'domain', name: '领地经营', latin: 'DOMAIN', icon: 'domain', meta: '预览', seg: '玩法' },
    { id: 'cases', name: '侦探本', latin: 'CASEBOOK', icon: 'casefile', meta: '3 卷', seg: '玩法', badge: 1 },
    { id: 'mail', name: '邮箱', latin: 'MAILBOX', icon: 'mail', meta: '2 未读', seg: '玩法', badge: 2 },
    { id: 'trade', name: '交易所', latin: 'EXCHANGE', icon: 'trade', meta: '1 待办', seg: '玩法' },
    { id: 'theatre', name: '剧场活动', latin: 'THEATRE', icon: 'theatre', meta: '260 点', seg: '玩法' },
    { id: 'sequence', name: '序列与能力', latin: 'SEQUENCE', icon: 'sequence', meta: '序列9', seg: '玩法' },
    { id: 'bag', name: '行囊与装备', latin: 'SATCHEL', icon: 'bag', meta: '12 件', seg: '玩法' },

    { id: 'archive', name: '档案馆', latin: 'ARCHIVE', icon: 'archive', meta: '节点树', seg: '系统' },
    { id: 'worldbook', name: '世界书', latin: 'LOREBOOK', icon: 'worldbook', meta: '双库', seg: '系统' },
    { id: 'preset', name: '预设', latin: 'COMPOSER', icon: 'preset', meta: '4.6k tok', seg: '系统' },
    { id: 'api', name: 'API 管线', latin: 'PIPELINE', icon: 'api', meta: '单调用档', seg: '系统' },
    { id: 'vars', name: '变量编辑器', latin: 'VARIABLES', icon: 'variable', meta: 'Zod', seg: '系统' },
    { id: 'memory', name: '记忆精炼器', latin: 'DISTILLER', icon: 'distill', meta: '大总结', seg: '系统' },
    { id: 'imagine', name: '一键生图', latin: 'DEVELOP', icon: 'camera', meta: '点数 1', seg: '系统' },
    { id: 'packs', name: '内容包', latin: 'PACKS', icon: 'dlc', meta: '3 已装', seg: '系统' },
    { id: 'settings', name: '设置', latin: 'SETTINGS', icon: 'settings', meta: '6 组', seg: '系统' }
  ];

  /* ---------------- 预设：三区块清单 ---------------- */
  var BLOCKS = [
    { id: 'b-armor', zone: 'primacy', name: '破甲', latin: 'ARMOR BREAK', kind: '预设槽', tokens: 210, on: true, pos: '开头 · 固定内容之前', note: '原封不动插入固定系统提示之前，用于解锁模型的表达限制。' },
    { id: 'b-style', zone: 'primacy', name: '文风锚定', latin: 'STYLE', kind: '预设槽', tokens: 186, on: true, pos: '开头 · 固定内容之前', note: '维多利亚长句、克制的第三人称、不写出结果只写迹象。' },
    { id: 'b-rules', zone: 'primacy', name: '规则常驻', latin: 'CORE RULES', kind: '系统基线', tokens: 512, on: true, pos: '开头', note: '职责分离：你写文字，代码管数字；你申请变量更新，系统执行并返回结果。' },
    { id: 'b-format', zone: 'primacy', name: '格式规范', latin: 'FORMAT', kind: '系统基线', tokens: 438, on: true, pos: '开头', note: '六标签协议 content / action / event / recall / state_update / thinking。' },
    { id: 'b-contract', zone: 'primacy', name: '完整性契约', latin: 'CONTRACT', kind: '系统基线', tokens: 124, on: true, pos: '开头', note: '每回合必须输出 state_update，即使为空数组；缺失即触发纠错回喂。' },
    { id: 'b-persona', zone: 'primacy', name: '角色设定', latin: 'PERSONA', kind: '系统基线', tokens: 296, on: true, pos: '开头', note: '克莱恩·莫雷蒂，占卜家途径序列9，穿越者，正扮演占卜家消化魔药。' },

    { id: 'b-lore', zone: 'reference', name: '世界书条目', latin: 'LOREBOOK', kind: '参考区', tokens: 1180, on: true, pos: '中段 · 按关键词命中', note: '本回合命中 5 条：愚者途径 / 值夜者 / 廷根市 / 灵界 / 塔罗占卜。' },
    { id: 'b-scene', zone: 'reference', name: '场景静态描述', latin: 'SCENE', kind: '参考区', tokens: 240, on: true, pos: '中段', note: '水仙花街 2 号的固定陈设与常态；动态变化不放这里。' },
    { id: 'b-grand', zone: 'reference', name: '编年史大总结', latin: 'GRAND SUM', kind: '参考区', tokens: 620, on: true, pos: '中段', note: '4 条大总结，覆盖第 1 至第 40 回合。' },
    { id: 'b-recall', zone: 'reference', name: 'recall 查询结果', latin: 'RECALL', kind: '参考区', tokens: 330, on: true, pos: '中段 · 声明式披露', note: '上回合模型点名 recall: ["邓恩·史密斯","拉斐尔墓园"]，本回合注入。' },
    { id: 'b-examples', zone: 'reference', name: '对话示例', latin: 'FEW-SHOT', kind: '预设槽', tokens: 410, on: false, pos: '中段', note: '默认关闭：容易让模型复读示例句式。' },

    { id: 'b-input', zone: 'recency', name: '玩家输入', latin: 'INPUT', kind: '行动区', tokens: 42, on: true, pos: '末尾', note: '玩家本回合的行动或台词，永不裁剪。' },
    { id: 'b-status', zone: 'recency', name: '时间天气状态条', latin: 'STATUS BAR', kind: '行动区', tokens: 156, on: true, pos: '末尾', note: '第五纪1349年6月28日 07:12 · 阴有雾 · 活力26/30 灵性37/42。' },
    { id: 'b-delta', zone: 'recency', name: '场景动态变化', latin: 'SCENE DELTA', kind: '行动区', tokens: 98, on: true, pos: '末尾', note: '窗帘已被拉开一半；怀表被拿起后放在笔记上。' },
    { id: 'b-npc', zone: 'recency', name: '在场 NPC 动态', latin: 'NPC STATE', kind: '行动区', tokens: 214, on: true, pos: '末尾', note: '班森：疲惫、克制、正在准备早餐；对你昨夜的异常有察觉但不问。' },
    { id: 'b-threads', zone: 'recency', name: '活伏笔', latin: 'THREADS', kind: '行动区', tokens: 168, on: true, pos: '末尾 · 上限 5 条', note: '4 条活伏笔；超过 5 条时按最近触发时间淘汰。' },
    { id: 'b-facts', zone: 'recency', name: '既定事实卡', latin: 'FACT CARDS', kind: '行动区', tokens: 132, on: true, pos: '末尾', note: '死者不复活：实体注册表中 alive=false 的角色不得出场。' },
    { id: 'b-events', zone: 'recency', name: '新事件摘要', latin: 'EVENTS', kind: '行动区', tokens: 190, on: true, pos: '末尾 · 近 3-5 回合', note: '按时间倒序，最近 4 条。' },
    { id: 'b-repair', zone: 'recency', name: '格式纠错回喂', latin: 'REPAIR', kind: '行动区', tokens: 0, on: true, pos: '末尾 · 条件触发', note: '仅当上回合解析失败时注入；当前未触发。' }
  ];

  /* ---------------- API 管线 ---------------- */
  var PIPELINE = {
    tier: 'single',
    tiers: [
      { k: 'single', n: '单调用档', d: '1 次阻塞调用完成正文与变量，默认档，最省 RPM', calls: '1', icon: 'drop' },
      { k: 'multi', n: '多 API 档', d: '正文 + 变量 AI 后台异步（可选 RAG 检索），2-3 次调用', calls: '2-3', icon: 'layers' },
      { k: 'agent', n: 'Agent 档', d: 'world-agent 编排，工具调用上限可配 3-7 次', calls: '≤5', icon: 'branch' }
    ],
    lanes: [
      { id: 'main', n: '正文模型', latin: 'NARRATIVE', url: 'https://api.example.com/v1', model: 'deepseek-v4-pro', temp: 0.92, on: true, note: '承担叙事质量，建议用最强模型' },
      { id: 'var', n: '变量模型', latin: 'VARIABLES', url: 'https://api.example.com/v1', model: 'deepseek-v4-flash', temp: 0.2, on: false, note: '仅多 API 档启用；负责 state_update 与小总结' },
      { id: 'rag', n: '检索模型', latin: 'RETRIEVAL', url: 'https://api.siliconflow.cn/v1', model: 'Qwen3-Embedding-8B', temp: 0, on: false, note: '交火模式：embeddings 初筛 + rerank 精排' },
      { id: 'img', n: '显影模型', latin: 'IMAGERY', url: 'https://api.example.com/v1', model: 'sd-xl-victorian', temp: 0.7, on: false, note: '一键生图；提示词由正文自动抽取' }
    ],
    rag: { topK: 200, prefilter: 1000, threshold: 0.45, recent: 50, batch: 36, crossfire: false }
  };

  /* ---------------- 设置 ---------------- */
  var SETTINGS = {
    skin: 'darkroom',
    view: 'auto',
    motion: 'on',
    density: 'normal',
    audio: false,
    stream: true,
    sceneDim: 52,
    sceneBlur: 0,
    fontScale: 100,
    autoBackup: true,
    backupEvery: 20,
    console: false,
    fxLevel: '中',
    collapseTags: 'thinking\nreasoning\n内心独白\nOOC'
  };

  /* ---------------- 存档节点树（含楼层变量快照） ---------------- */
  var NODES = [
    {
      id: 'n-1', turn: 1, time: '06-28 07:12', label: '苏醒', branch: '主线', current: true, depth: 0,
      vars: { 活力: '26/30', 灵性: '37/42', 理智: '40/45', 人性: '81/90', 消化: '34%', 金镑: 3 }
    },
    {
      id: 'n-2', turn: 2, time: '06-28 07:40', label: '翻开笔记', branch: '主线', depth: 1,
      vars: { 活力: '26/30', 灵性: '37/42', 理智: '39/45', 人性: '81/90', 消化: '36%', 金镑: 3 }
    },
    {
      id: 'n-3', turn: 3, time: '06-28 08:15', label: '与班森同桌', branch: '主线', depth: 2,
      vars: { 活力: '28/30', 灵性: '37/42', 理智: '40/45', 人性: '82/90', 消化: '36%', 金镑: 3 }
    },
    {
      id: 'n-3b', turn: 3, time: '06-28 08:15', label: '径直出门', branch: '分支 · 沉默', depth: 2,
      vars: { 活力: '25/30', 灵性: '37/42', 理智: '38/45', 人性: '79/90', 消化: '36%', 金镑: 3 }
    },
    {
      id: 'n-4', turn: 4, time: '06-28 10:02', label: '黑荆棘安保公司', branch: '主线', depth: 3,
      vars: { 活力: '28/30', 灵性: '35/42', 理智: '40/45', 人性: '82/90', 消化: '38%', 金镑: 3 }
    },
    {
      id: 'n-5', turn: 5, time: '06-28 11:20', label: '邓恩的面试', branch: '主线', depth: 4,
      vars: { 活力: '28/30', 灵性: '35/42', 理智: '41/45', 人性: '83/90', 消化: '40%', 金镑: 4 }
    },
    {
      id: 'n-5b', turn: 5, time: '06-28 11:20', label: '隐瞒穿越之事', branch: '分支 · 守口', depth: 4,
      vars: { 活力: '28/30', 灵性: '35/42', 理智: '42/45', 人性: '84/90', 消化: '40%', 金镑: 4 }
    }
  ];

  /* ---------------- 邮箱 ---------------- */
  var MAILS = [
    { id: 'm1', from: '值夜者小队 · 邓恩·史密斯', subject: '关于你入职后的第一份任务', time: '06-28 09:40', unread: true, attach: ['值夜者徽记', '公务马车券 ×2'], body: '克莱恩：\n\n水仙花街的失踪案已经交到我们手上。警厅那边说没有尸体、没有血迹、没有挣扎痕迹——这通常意味着不是人干的。\n\n上午十点，公司接待室。带上你的笔记，别带枪。\n\n邓恩' },
    { id: 'm2', from: '廷根市政厅 · 户籍科', subject: '第 4471 号住户登记补正通知', time: '06-27 16:20', unread: true, attach: [], body: '莫雷蒂先生：\n\n经核，水仙花街 2 号登记在册者为班森·莫雷蒂、克莱恩·莫雷蒂、梅丽莎·莫雷蒂三人。前次申报中克莱恩·莫雷蒂一栏「职业」空缺，请于七日内补正。\n\n此件不必回执。' },
    { id: 'm3', from: '塔罗会 · 挂坠盒', subject: '（无标题）', time: '06-26 23:58', unread: false, attach: ['未署名的邀请'], body: '当你在午夜之后仍然清醒，且愿意用一件秘密交换另一件秘密时，把这张纸烧掉。\n\n——不必回信。我们会知道。' },
    { id: 'm4', from: '霍伊学院 · 梅丽莎', subject: '哥哥，学费的事', time: '06-25 19:10', unread: false, attach: [], body: '这个学期的书本费又涨了两苏勒。我跟班森说了，他说不用担心。\n\n可他这个月的鞋已经补过两次了。' }
  ];

  /* ---------------- 交易 ---------------- */
  var TRADES = [
    { id: 't1', peer: '老尼尔 · 掘墓人', give: '铜制护符 ×1', want: '灵界导引液 ×1', status: '待对方确认', trust: 62 },
    { id: 't2', peer: '典当行 · 韦尔奇', give: '旧账本 ×1', want: '11 苏勒', status: '可成交', trust: 40 },
    { id: 't3', peer: '塔罗会 · 挂坠盒', give: '一件秘密', want: '一件秘密', status: '需高级权限', trust: 12 }
  ];

  /* ---------------- 剧场活动 ---------------- */
  var THEATRE = {
    points: 260,
    acts: [
      { n: '寻找幕后人员', cost: 80, d: '解锁一条本幕的隐藏线索，直接写入侦探本。', icon: 'search' },
      { n: '寻找售票人员', cost: 50, d: '本回合额外获得一个行动选项。', icon: 'ledger' },
      { n: '咨询角斗场工作人员', cost: 30, d: '查看下一场战术推演的敌方能力白名单。', icon: 'sword' },
      { n: '包厢观剧', cost: 120, d: '跳过一次不利判定，但人性 -2。', icon: 'theatre' }
    ],
    arena: [
      { n: '第一场 · 巡夜的守卫', rank: '序列9', reward: '战斗经验 120 · 星辉 40', cleared: true },
      { n: '第二场 · 雾中的三道影子', rank: '序列8', reward: '战斗经验 260 · 星辉 90', cleared: false },
      { n: '第三场 · 无面的收藏家', rank: '序列7', reward: '封印物碎片 ×1', cleared: false }
    ]
  };

  /* ---------------- 星界之门（召唤/兑换） ---------------- */
  var GATE = {
    stardust: 480,
    single: 160,
    ten: 1600,
    pool: [
      { n: '封印物 · 灰雾之扉残页', rank: 'SSR', rate: '0.8%' },
      { n: '魔药配方 · 小丑', rank: 'SR', rate: '4.2%' },
      { n: '灵界导引液', rank: 'SR', rate: '5.0%' },
      { n: '铜制护符（精制）', rank: 'R', rate: '18%' },
      { n: '仪式蜡烛 ×5', rank: 'R', rate: '22%' },
      { n: '星辉碎屑', rank: 'N', rate: '50%' }
    ],
    history: [
      { time: '06-27 21:04', got: '灵界导引液', rank: 'SR' },
      { time: '06-27 21:04', got: '仪式蜡烛 ×5', rank: 'R' },
      { time: '06-26 18:33', got: '星辉碎屑', rank: 'N' },
      { time: '06-25 12:10', got: '魔药配方 · 小丑', rank: 'SR' }
    ],
    exchange: [
      { n: '灵界导引液', cost: 300, stock: 2 },
      { n: '空白塔罗牌 ×22', cost: 220, stock: 1 },
      { n: '铅封信匣', cost: 180, stock: 4 },
      { n: '魔药材料 · 月光石粉', cost: 120, stock: 9 }
    ]
  };

  /* ---------------- 战术棋盘 ---------------- */
  var BOARD = {
    size: 6,
    round: 3,
    terrain: [
      { x: 1, y: 1, k: '碎石堆', effect: '移动 -1 · 掩体 +2' },
      { x: 2, y: 4, k: '浓雾', effect: '命中 -3 · 隐蔽 +3' },
      { x: 4, y: 2, k: '油污', effect: '易燃 · 移动 -1' },
      { x: 5, y: 5, k: '铁栅', effect: '不可穿越' },
      { x: 3, y: 3, k: '灵界薄弱处', effect: '灵性消耗 -1 · 污染 +1' }
    ],
    ours: [
      { n: '克莱恩', x: 0, y: 2, hp: 26, max: 30, seq: '序9', icon: 'user' },
      { n: '邓恩队长', x: 1, y: 3, hp: 58, max: 60, seq: '序7', icon: 'shield' },
      { n: '老尼尔', x: 0, y: 4, hp: 34, max: 40, seq: '序9', icon: 'quill' }
    ],
    foes: [
      { n: '影子甲', x: 5, y: 1, hp: 22, max: 30, seq: '序9', icon: 'fog' },
      { n: '影子乙', x: 4, y: 4, hp: 30, max: 30, seq: '序9', icon: 'fog' },
      { n: '牵线者', x: 5, y: 3, hp: 44, max: 44, seq: '序8', icon: 'eyeMystic' }
    ],
    whitelist: [
      { who: '克莱恩', ab: '塔罗占卜 · 预判一次攻击' },
      { who: '克莱恩', ab: '灵性视觉 · 揭示隐蔽单位' },
      { who: '邓恩队长', ab: '梦魇侵蚀 · 单体致眠' },
      { who: '邓恩队长', ab: '黑夜庇护 · 群体减伤' },
      { who: '老尼尔', ab: '掘墓 · 制造一格壕沟地形' },
      { who: '影子甲/乙', ab: '雾中潜行 · 移动后获得隐蔽' },
      { who: '牵线者', ab: '丝线牵引 · 强制位移一格' }
    ],
    log: [
      { r: 3, s: '牵线者对邓恩队长使用「丝线牵引」，邓恩被拖向 (4,3)。' },
      { r: 3, s: '邓恩队长以「黑夜庇护」抵消位移的一半，停在 (2,3)。' },
      { r: 2, s: '克莱恩申报「灵性视觉」，系统审计通过，影子乙的隐蔽被揭示。' },
      { r: 2, s: '老尼尔在 (0,4) 掘出壕沟，本方获得掩体 +2。' },
      { r: 1, s: '遭遇开始。浓雾覆盖 (2,4)，双方命中判定 -3。' }
    ]
  };

  /* ---------------- 领地经营 ---------------- */
  var DOMAIN = {
    name: '未建立',
    hint: '需序列7 且拥有一处不动产后开启。以下为预览数据。',
    affairs: [
      { n: '春季征税', who: '总管待任命', due: '第 12 周', status: '待处理' },
      { n: '雾季道路维护', who: '工程队', due: '第 9 周', status: '进行中' },
      { n: '民兵操演', who: '军团 · 一队', due: '第 10 周', status: '待处理' }
    ],
    armies: [{ n: '第一步兵团', qty: 120, elite: 8, upkeep: '14 金镑/周', ready: true }],
    industry: [
      { n: '蒸汽织坊', out: '布匹 ×40/周', cost: '9 金镑/周', pollute: 12 },
      { n: '煤气厂', out: '燃气 ×60/周', cost: '12 金镑/周', pollute: 28 }
    ],
    pollution: 40,
    backlash: '污染达 60 时触发反噬：领地内非凡者失控率 +8%。'
  };

  window.DATA = {
    SCENES: SCENES, CHAR: CHAR, TURNS: TURNS, PRESENCE: PRESENCE, THREADS: THREADS,
    QUICKCMDS: QUICKCMDS, FRAMES: FRAMES, BLOCKS: BLOCKS, PIPELINE: PIPELINE,
    SETTINGS: SETTINGS, NODES: NODES, MAILS: MAILS, TRADES: TRADES,
    THEATRE: THEATRE, GATE: GATE, BOARD: BOARD, DOMAIN: DOMAIN
  };
})();
