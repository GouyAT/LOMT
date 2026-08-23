/* 诡秘剧场 · 原型3 — 演示内容库（世界观长尾内容） */
window.LORE = {
  codex: {
    people: [
      {
        id: 'p-klein',
        name: '克莱恩·莫雷蒂',
        latin: 'Klein Moretti',
        sequence: '序列9',
        pathway: '愚者途径',
        org: '值夜者小队（黑荆棘安保公司）',
        portraitTint: '#8f989e',
        tags: ['主角', '穿越者', '占卜家', '值夜者', '愚者'],
        summary: '从异世穿越而来的霍伊大学历史系毕业生，占卜家途径序列9，刚加入廷根值夜者小队。',
        detail: '原名周明瑞，在一次占卜仪式中穿越到第五纪鲁恩王国廷根市，成为刚死于魔药失控的克莱恩·莫雷蒂。他继承了这具身体的家人、债务与尚未暴露的非凡者身份，凭谨慎与演技在值夜者中谋得安身之处，暗中追逐回家的线索。',
        met: true,
        affinity: 100
      },
      {
        id: 'p-dunn',
        name: '邓恩·史密斯',
        latin: 'Dunn Smith',
        sequence: '序列7',
        pathway: '黑夜途径',
        org: '值夜者小队',
        portraitTint: '#5d666b',
        tags: ['值夜者', '队长', '梦魇', '黑夜女神教会'],
        summary: '廷根值夜者小队队长，黑夜途径序列7「梦魇」，沉默而可靠，把下属安危看得比任务更重。',
        detail: '他能潜入他人梦境、在睡梦中逼问或安抚，因此总是一副睡眠不足的疲惫神情。他为克莱恩的入职背书，也始终警惕这个新人对非凡世界的无知会招来灾祸。',
        met: true,
        affinity: 62
      },
      {
        id: 'p-leonard',
        name: '伦纳德·米切尔',
        latin: 'Leonard Mitchell',
        sequence: '序列8',
        pathway: '黑夜途径',
        org: '值夜者小队',
        portraitTint: '#2a6d90',
        tags: ['值夜者', '午夜诗人', '黑夜途径', '帕列斯'],
        summary: '值夜者里的年轻午夜诗人，诗人般的散漫外表下，体内寄宿着一位古老的存在。',
        detail: '序列8「午夜诗人」让他能以诗篇施展神秘，而他时常自言自语，实则与体内的老帕列斯·索罗亚斯德对话。他把克莱恩视作同辈，偶尔拿占卜家开玩笑。',
        met: true,
        affinity: 55
      },
      {
        id: 'p-neil',
        name: '老尼尔',
        latin: 'Old Neil',
        sequence: '序列9',
        pathway: '死神途径',
        org: '值夜者小队',
        portraitTint: '#7d7466',
        tags: ['值夜者', '掘墓人', '死神途径', '档案员'],
        summary: '值夜者的档案管理员兼机械维护，死神途径序列9「掘墓人」，一位和蔼又絮叨的老人。',
        detail: '他能感知尸体与墓地的异常，负责保管小队封存的资料与黄铜机械。他对克莱恩格外照顾，总用一壶浓茶和讲不完的旧闻接待新人。',
        met: true,
        affinity: 58
      },
      {
        id: 'p-frye',
        name: '弗雷·舒尔茨',
        latin: 'Frye Schultz',
        sequence: '序列9',
        pathway: '黑夜途径',
        org: '值夜者小队',
        portraitTint: '#514a41',
        tags: ['值夜者', '不眠者', '黑夜途径'],
        summary: '值夜者队员，黑夜途径序列9「不眠者」，几乎不需要睡眠，值夜班的中坚。',
        detail: '不眠者天生对抗睡眠，因而弗雷常年负责最难熬的下半夜巡逻。他话不多，但对规则近乎刻板，是把任务执行得一板一眼的老手。',
        met: true,
        affinity: 45
      },
      {
        id: 'p-leslie',
        name: '雷斯莉·戴丽',
        latin: 'Leslie Daly',
        sequence: '序列9',
        pathway: '黑夜途径',
        org: '值夜者小队',
        portraitTint: '#8f989e',
        tags: ['值夜者', '不眠者', '黑夜途径', '女性'],
        summary: '值夜者中的女性不眠者，心思缜密，负责小队的通讯与善后。',
        detail: '她能用黑夜的力量安抚惊慌的目击者、抹去不该留下的痕迹。作为新人的克莱恩最初几次外出任务，多由她在一旁照应。',
        met: true,
        affinity: 48
      },
      {
        id: 'p-isabella',
        name: '伊莎贝拉',
        latin: 'Isabella',
        sequence: '序列9',
        pathway: '知识与智慧之神途径',
        org: '值夜者小队',
        portraitTint: '#c9bda8',
        tags: ['值夜者', '通识者', '医护', '文员'],
        summary: '值夜者的文员兼医护，知识与智慧之神途径序列9「通识者」，小队里最像普通人的一位。',
        detail: '通识者让她拥有超常的记忆与学识，能快速检索卷宗、辨认毒物与调配药剂。她不直接参与战斗，却包办了伤情处置与文书归档。',
        met: true,
        affinity: 50
      },
      {
        id: 'p-naia',
        name: '娜亚·杭特',
        latin: 'Naia Hunter',
        sequence: '序列9',
        pathway: '猎人途径',
        org: '廷根市警察厅',
        portraitTint: '#c9913c',
        tags: ['猎人途径', '猎人', '警察', '赏金'],
        summary: '廷根市警察厅的女警探，猎人途径序列9「猎人」，嗅觉与追踪本能惊人。',
        detail: '猎人让她能像野兽一样嗅出线索、追踪脚印，因此常被派去调查那些找不到尸体的失踪案。她与值夜者打交道的次数比同僚多，对神秘事件半信半疑。',
        met: true,
        affinity: 40
      },
      {
        id: 'p-selma',
        name: '塞尔玛·安提戈努斯',
        latin: 'Selma Antigonus',
        sequence: '序列8',
        pathway: '愚者途径',
        org: '安提戈努斯家族',
        portraitTint: '#7d2318',
        tags: ['贵族后裔', '收藏家', '小丑', '愚者途径'],
        summary: '没落的安提戈努斯家族后裔，愚者途径序列8「小丑」，以古董商身份活动于廷根。',
        detail: '安提戈努斯家族世代守护与愚者有关的秘密，塞尔玛守着祖传的旧宅与满屋古董，明面上经营古玩行，暗地里搜罗与愚者途径相关的遗物。她对克莱恩这类占卜家格外在意。',
        met: false,
        affinity: 0
      },
      {
        id: 'p-benson',
        name: '班森·莫雷蒂',
        latin: 'Benson Moretti',
        sequence: '无（凡人）',
        pathway: '无',
        org: '铁路公司',
        portraitTint: '#23201c',
        tags: ['亲属', '哥哥', '凡人', '文员'],
        summary: '克莱恩的哥哥，廷根某商行的低级文员，靠微薄薪水支撑全家。',
        detail: '班森勤恳本分，寡言而顾家，一心想着升职加薪让弟妹过得好些。他对弟弟最近的反常隐隐不安，却只当是入职值夜者后太累。',
        met: true,
        affinity: 88
      },
      {
        id: 'p-melissa',
        name: '梅丽莎·莫雷蒂',
        latin: 'Melissa Moretti',
        sequence: '无（凡人）',
        pathway: '无',
        org: '廷根市',
        portraitTint: '#e0d6c4',
        tags: ['亲属', '妹妹', '凡人', '学徒'],
        summary: '克莱恩的妹妹，十五六岁的少女，在商行当学徒，勤俭持家。',
        detail: '梅丽莎聪明而坚强，白天做工，回家还要洗衣做饭、精打细算每一枚便士。她最爱缠着二哥克莱恩听那些从报上读来的奇闻。',
        met: true,
        affinity: 92
      },
      {
        id: 'p-azik',
        name: '阿兹克·艾格斯',
        latin: 'Azik Eggers',
        sequence: '高阶（隐藏）',
        pathway: '死神途径',
        org: '霍伊大学',
        portraitTint: '#16394d',
        tags: ['教授', '死神途径', '失忆', '神秘'],
        summary: '霍伊大学历史系教授，克莱恩的恩师，一位时常失忆的温和学者。',
        detail: '阿兹克总在深夜从噩梦中醒来，记不起自己是谁、活了多少年。他本能地亲近与死神、命运相关的事物，是克莱恩在神秘世界最早的引路者之一。',
        met: true,
        affinity: 70
      }
    ],
    places: [
      {
        id: 'pl-tingen',
        name: '廷根市',
        latin: 'Tingen',
        region: '鲁恩王国',
        tags: ['城市', '第五纪', '工业', '雾'],
        summary: '鲁恩王国的工业城市，克莱恩穿越后生活与工作的地方，一座被煤烟与雾气笼罩的灰城。',
        detail: '廷根遍布工厂、商行与蒸汽列车站，夜晚的煤气灯把街道映得昏黄。近来老城区接连有人失踪，雾气似乎比往年更浓、更不愿散去。',
        visited: true
      },
      {
        id: 'pl-blackthorn',
        name: '黑荆棘安保公司',
        latin: 'Blackthorn Security Company',
        region: '廷根市佐特兰街',
        tags: ['建筑', '值夜者', '据点', '秘所'],
        summary: '值夜者小队在廷根市的对公掩护，一栋不起眼的灰楼，挂着安保公司的铜牌。',
        detail: '对外它承接私人安保与调查业务，对内则是黑夜女神教会处理非凡事件的据点。地下室里封存着封印物，二楼的会议室墙上钉满了案件照片。',
        visited: true
      },
      {
        id: 'pl-zouteland',
        name: '佐特兰街',
        latin: 'Zouteland Street',
        region: '廷根市老城区',
        tags: ['街区', '老城', '商铺'],
        summary: '廷根老城区的一条老街，黑荆棘安保公司与多家旧货铺、古玩行坐落于此。',
        detail: '街道两旁是维多利亚式的砖楼，煤气灯与马车辙印交错。雾夜里的佐特兰街人影寥寥，只有巡警的提灯偶尔晃过。',
        visited: true
      },
      {
        id: 'pl-moretti',
        name: '莫雷蒂家宅',
        latin: 'Moretti Residence',
        region: '廷根市住宅区',
        tags: ['建筑', '住宅', '亲属'],
        summary: '莫雷蒂三兄妹的家，一栋狭小而整洁的联排住宅。',
        detail: '班森、克莱恩与梅丽莎挤住在这里，靠班森的薪水和梅丽莎的精打细算度日。壁炉里的煤总舍不得多烧，晚饭后兄妹三人常围在灯下读报。',
        visited: true
      },
      {
        id: 'pl-police',
        name: '廷根市警察厅',
        latin: 'Tingen Police Station',
        region: '廷根市',
        tags: ['建筑', '警察厅', '案件'],
        summary: '廷根市维持治安的官方机构，与值夜者保持微妙合作，负责处理明面上的失踪案。',
        detail: '警察厅对老城区接连的失踪案束手无策，只能把卷宗越堆越高。个别警探隐约察觉案件背后有常人无法解释的东西，便私下向值夜者求助。',
        visited: true
      },
      {
        id: 'pl-selena',
        name: '圣赛琳娜教堂',
        latin: 'St. Selena Church',
        region: '廷根市',
        tags: ['建筑', '教堂', '黑夜女神'],
        summary: '廷根的黑夜女神教堂，值夜者名义上的上级所在，钟声每夜在雾中回荡。',
        detail: '教堂的地下是值夜者处理污染、超度亡魂的地方。克莱恩入职时在此宣誓守秘，也在这里第一次领受女神教会的庇护。',
        visited: true
      },
      {
        id: 'pl-hoy',
        name: '霍伊大学',
        latin: 'Hoy University',
        region: '廷根市',
        tags: ['建筑', '大学', '历史'],
        summary: '克莱恩的母校，历史系里藏着阿兹克·艾格斯这样来历不明的教授。',
        detail: '霍伊大学的历史系藏书丰厚，克莱恩正是在这里养成读史与考据的习惯。毕业后他本可留校，却为了生计回到廷根做了一名小文员。',
        visited: true
      },
      {
        id: 'pl-library',
        name: '廷根市立图书馆',
        latin: 'Tingen Public Library',
        region: '廷根市',
        tags: ['建筑', '图书馆', '资料'],
        summary: '廷根的公共图书馆，克莱恩查阅旧报纸与地方志的地方。',
        detail: '馆藏的旧报纸与教区登记是克莱恩追查失踪案的重要线索来源。顶层的阅览室窗户正对着雾气弥漫的广场。',
        visited: true
      },
      {
        id: 'pl-station',
        name: '廷根蒸汽车站',
        latin: 'Tingen Station',
        region: '廷根市',
        tags: ['建筑', '车站', '蒸汽列车'],
        summary: '廷根的蒸汽列车站，煤烟与汽笛声昼夜不息，连接着鲁恩王国各地。',
        detail: '开往贝克兰德的列车从这里发车，蒸汽机头的轰鸣能传出半条街。罢工传闻让站台上的时刻表最近变得很不可靠。',
        visited: false
      },
      {
        id: 'pl-backlund',
        name: '贝克兰德',
        latin: 'Backlund',
        region: '鲁恩王国',
        tags: ['城市', '首都', '都会'],
        summary: '鲁恩王国的首都，一座被雾与霓虹、蒸汽与阴谋共同统治的巨型都会。',
        detail: '贝克兰德汇聚了七大教会的总堂、贵族议院与蒸汽机械的轰鸣。它是无数人向往又恐惧的地方，也是克莱恩终将踏入的漩涡中心。',
        visited: false
      }
    ],
    items: [
      {
        id: 'i-seer-potion',
        name: '占卜家魔药',
        latin: 'Seer Potion',
        rank: '序列9 魔药',
        tags: ['魔药', '占卜家', '序列9'],
        summary: '占卜家途径序列9的晋升魔药，克莱恩穿越前这具身体正因它而失控身亡。',
        detail: '魔药由多种非凡材料调配而成，服用者若无法承受特性会当场失控。克莱恩醒来时魔药已在体内生效，让他天生就能窥见命运的涟漪。',
        owned: true
      },
      {
        id: 'i-formula',
        name: '占卜家魔药配方',
        latin: 'Seer Potion Formula',
        rank: '普通',
        tags: ['配方', '魔药', '占卜家'],
        summary: '一份用密文写就的魔药配方，记录着占卜家途径序列9所需材料与仪式。',
        detail: '配方由值夜者内部保管，克莱恩只在受控情况下翻阅过一次。它提醒他：每一次晋升都是一场与失控的赌博。',
        owned: false
      },
      {
        id: 'i-pendulum',
        name: '水晶灵摆',
        latin: 'Crystal Pendulum',
        rank: '普通',
        tags: ['占卜工具', '灵摆', '占卜家'],
        summary: '克莱恩最常用的占卜工具，一枚系着银链的水晶坠。',
        detail: '把问题投进灵界、让灵摆悬停其上，摆动的方向就是灵界涟漪给出的答案。克莱恩随身携带，用来判断方向、真假与吉凶。',
        owned: true
      },
      {
        id: 'i-tarot',
        name: '塔罗牌',
        latin: 'Tarot Deck',
        rank: '普通',
        tags: ['占卜工具', '塔罗', '大阿卡纳'],
        summary: '一副二十二张大阿卡纳塔罗牌，占卜家窥探命运的标准工具。',
        detail: '每张牌都对应着灵界中的某种意象与涟漪。克莱恩常用它做更复杂的牌阵占卜，也用它来试探那些说不出口的问题。',
        owned: true
      },
      {
        id: 'i-revolver',
        name: '黄铜左轮手枪',
        latin: 'Brass Revolver',
        rank: '普通',
        tags: ['武器', '火器', '自保'],
        summary: '一支保养得当的左轮手枪，值夜者发给新人的制式自保武器。',
        detail: '面对失控者与怪物时，子弹往往比占卜更可靠。克莱恩在靶场练过几次，弹仓里永远压满六发。',
        owned: true
      },
      {
        id: 'i-badge',
        name: '值夜者徽章',
        latin: 'Nighthawk Badge',
        rank: '普通',
        tags: ['徽章', '值夜者', '身份'],
        summary: '一枚刻着黑夜徽记的铜徽章，证明佩戴者受黑夜女神教会庇护。',
        detail: '它能在盘查时让警察厅放行，也能在危急时刻证明身份。克莱恩把它贴身收着，从不轻易示人。',
        owned: true
      },
      {
        id: 'i-watch',
        name: '银质怀表',
        latin: 'Silver Pocket Watch',
        rank: '普通',
        tags: ['怀表', '计时', '占卜辅助'],
        summary: '一只走时精准的银怀表，是占卜与守时的双重工具。',
        detail: '梦境占卜讲究时辰，克莱恩总先对表再入梦。表盖内侧刻着莫雷蒂家的姓氏缩写。',
        owned: true
      },
      {
        id: 'i-lamp',
        name: '铜制煤油灯',
        latin: 'Kerosene Lamp',
        rank: '普通',
        tags: ['照明', '煤油灯', '雾夜'],
        summary: '一盏擦得锃亮的铜煤油灯，雾夜里唯一的可靠光源。',
        detail: '廷根的雾浓得能吞掉煤气灯，克莱恩夜归时总提着它。灯罩上扣着一圈防风的铜丝网。',
        owned: true
      },
      {
        id: 'i-roselle',
        name: '罗赛尔·古斯塔夫日记残页',
        latin: 'Roselle Gustav Diary Pages',
        rank: '普通',
        tags: ['日记', '穿越者', '中文', '谜'],
        summary: '前代穿越者罗赛尔·古斯塔夫用中文写下的日记残页，只有克莱恩读得懂。',
        detail: '这些泛黄的纸页记录着一位同样来自地球的先辈在第五纪的见闻与困惑。它们是克莱恩确认自己并不孤独、也确认这个世界深不见底的证明。',
        owned: true
      },
      {
        id: 'i-antigonus',
        name: '安提戈努斯家族笔记',
        latin: 'Antigonus Family Notebook',
        rank: '普通',
        tags: ['笔记', '安提戈努斯', '愚者', '命运'],
        summary: '一本记载愚者途径秘辛的旧笔记，与安提戈努斯家族世代守护的秘密相关。',
        detail: '笔记里断续记着愚者途径的进阶与禁忌，字里行间透着一股疯癫。它是克莱恩在神秘世界里摸到的一根危险线索。',
        owned: false
      },
      {
        id: 'i-sealed-mirror',
        name: '封印物「怨念铜镜」',
        latin: 'Sealed Artifact: Vengeful Brass Mirror',
        rank: '封印物 2 级',
        tags: ['封印物', '危险', '值夜者封存'],
        summary: '一面能照见死者的铜镜，被封存在黑荆棘安保公司地下室的封印库里。',
        detail: '据说镜中寄宿着不肯离去的怨念，直视镜面会看见自己死时的模样。值夜者以黑布蒙住它，严禁夜间开启。',
        owned: false
      },
      {
        id: 'i-holy-water',
        name: '圣水',
        latin: 'Holy Water',
        rank: '普通',
        tags: ['圣水', '驱邪', '黑夜女神'],
        summary: '黑夜女神教会祝圣过的水，能驱散低阶的灵体与污染。',
        detail: '值夜者外出任务时每人领一小瓶。克莱恩不确定它对占卜家是否有用，但总揣在兜里图个安心。',
        owned: true
      }
    ],
    lore: [
      {
        id: 'l-divination',
        name: '占卜的原理',
        latin: 'The Principle of Divination',
        category: '神秘学',
        tags: ['占卜', '灵界', '涟漪', '占卜家'],
        summary: '占卜是把问题投向灵界并读取其涟漪，因此问题越具体、涟漪越清晰，而模糊的问题会引来非人的注意。',
        detail: '万物在灵界都留有投影，过去与未来的影子会在那里荡开涟漪。占卜家不是预测未来，而是借这些涟漪拼出一个可能的答案。问题越清晰、与自身牵连越深，涟漪就越分明；若问题空泛或妄图窥探远超自身位格的存在，荡回来的就不是涟漪，而是某些东西的注视。',
        unlocked: true
      },
      {
        id: 'l-spirit-vision',
        name: '灵视',
        latin: 'Spirit Vision',
        category: '神秘学',
        tags: ['灵视', '气场', '情绪', '占卜家'],
        summary: '灵视是看见万物气场的能力，因为情绪与非凡特性都会在以太层留下可读的颜色。',
        detail: '活物有气场、死物有残影、非凡者周身缠绕着特性颜色。占卜家睁开灵视，等于把常人看不见的情绪与危险读成一张彩色图谱；但看得太多，也会把自己暴露给那些同样在灵界中凝视的视线。',
        unlocked: true
      },
      {
        id: 'l-mediumship',
        name: '通灵术',
        latin: 'Mediumship',
        category: '神秘学',
        tags: ['通灵', '死者', '灵体', '占卜家'],
        summary: '通灵是把亡者的残念唤回对话，因为死亡并非立刻消散，而会在灵界留下回声。',
        detail: '刚死之人尚未彻底沉入灵界，占卜家可以借仪式与其残念对话，问出死前所见。可回声会随着时间失真，越久远的死者越可能把执念与谎言混进答案；而通灵本身，也会让某些更古老的东西听见你的声音。',
        unlocked: true
      },
      {
        id: 'l-potion',
        name: '魔药与失控',
        latin: 'Potions and Losing Control',
        category: '神秘学',
        tags: ['魔药', '失控', '非凡特性', '晋升'],
        summary: '魔药是把非凡特性灌进血肉的捷径，因此每一次晋升都是一场与失控的赌博。',
        detail: '非凡特性自带意志与本能，喝下魔药等于把不属于自己的力量强塞进身体。意志压不住特性，人就会被特性反噬成怪物；压得太久却不晋升，特性也会在体内躁动。这就是非凡者为何总在变强与发疯之间走钢丝。',
        unlocked: true
      },
      {
        id: 'l-conservation',
        name: '非凡特性守恒',
        latin: 'Conservation of Beyonder Characteristics',
        category: '神秘学',
        tags: ['特性守恒', '非凡', '晋升', '序列'],
        summary: '非凡特性不会凭空产生也不会凭空消失，只会从一具躯体转移到另一具躯体。',
        detail: '杀死一名非凡者、取其特性，就能炼出对应序列的魔药；这也是绝大多数魔药材料的来源。正因特性守恒，序列越高越稀少，每向上一步都要踩着别人的尸骨。',
        unlocked: true
      },
      {
        id: 'l-acting',
        name: '扮演法',
        latin: 'The Acting Method',
        category: '神秘学',
        tags: ['扮演法', '消化魔药', '晋升'],
        summary: '扮演法是消化魔药的关键：去活成序列之名所代表的样子，特性才会真正臣服于你。',
        detail: '占卜家越像一个真正的占卜家、越频繁地占卜与窥视，体内的特性就越与你契合，直至被彻底消化。只喝魔药而不扮演，特性会一直躁动；扮演过了头、忘了自己是谁，又会滑向失控。分寸，是扮演法最深的学问。',
        unlocked: true
      },
      {
        id: 'l-spirit-world',
        name: '灵界',
        latin: 'The Spirit World',
        category: '神秘学',
        tags: ['灵界', '危险', '投影', '非凡'],
        summary: '灵界是一切真实世界的投影之海，占卜家在此读取答案，也在此被别的存在注视。',
        detail: '灵界没有稳定的时空，凡人的理性在那里像烛火一样微弱。占卜、通灵、灵视都要隔着灵界进行，所以每一次窥探都是一次把门打开一条缝的冒险。门外的东西，未必只是想看看。',
        unlocked: true
      },
      {
        id: 'l-sealed',
        name: '封印物',
        latin: 'Sealed Artifacts',
        category: '神秘学',
        tags: ['封印物', '危险', '特性', '收容'],
        summary: '封印物是特性没有死去的证明，它们会呼吸、会饥饿、会反过来使用靠近它们的人。',
        detail: '非凡者死后特性不散，依附在器物上便成了封印物。它们大多带着生前主人的执念与负面效应，越是强大越难收容。值夜者的封印库不是仓库，而是一座关着怪物的地牢。',
        unlocked: true
      },
      {
        id: 'l-nighthawks',
        name: '值夜者的职责',
        latin: 'The Duty of the Nighthawks',
        category: '组织',
        tags: ['值夜者', '黑夜女神教会', '收容', '守秘'],
        summary: '值夜者存在的意义是让凡人永远不知道夜里有怪物出没。',
        detail: '黑夜女神教会的值夜者负责处理失控者、封印污染、抹去目击者的记忆。他们不是猎魔的英雄，而是给正常世界盖上一层黑布的守夜人——因为真相一旦被大众知晓，恐惧本身就会成为新的污染源。',
        unlocked: true
      },
      {
        id: 'l-pathways',
        name: '序列与途径',
        latin: 'Sequences and Pathways',
        category: '神秘学',
        tags: ['序列', '途径', '二十二条', '非凡'],
        summary: '世间非凡之力分属二十二条途径，每条途径从序列9到序列0，越往上越接近神，也越接近疯狂。',
        detail: '每一条途径都是一条通往神座的阶梯，占卜家、小丑、魔术师……一路向上直到愚者。可阶梯越爬越窄，每条途径的顶端都只能容得下一个位置；落后者，不是死，就是疯。',
        unlocked: true
      },
      {
        id: 'l-goddess',
        name: '黑夜女神',
        latin: 'The Evernight Goddess',
        category: '神祇',
        tags: ['黑夜女神', '七大教会', '庇护', '守秘'],
        summary: '黑夜女神是七大正统神祇之一，值夜者的主人，也是所有秘辛与恐惧的守门人。',
        detail: '她庇佑黑夜与安眠，也掌管神秘与守秘。凡在她教会名下行动的非凡者，等于把名字写进了黑夜的账本；她既护着你，也看着你。克莱恩至今说不清，这份庇护的代价究竟是什么。',
        unlocked: true
      },
      {
        id: 'l-secrecy',
        name: '守秘的律令',
        latin: 'The Law of Secrecy',
        category: '神秘学',
        tags: ['守秘', '规则', '污染', '神秘世界'],
        summary: '神秘必须保持神秘，因为知晓本身就会招来知晓之后的东西。',
        detail: '非凡世界的铁律是：知道得越少，活得越久。一个名字被反复念诵，一个仪式被反复传抄，都会在灵界里留下越来越响的回声。值夜者守护的秘密不是权贵的隐私，而是人类的黎明之前。',
        unlocked: true
      }
    ]
  },

  newspaper: {
    masthead: '廷根晚报',
    latin: 'TINGEN EVENING POST',
    date: '第五纪1349年6月28日 星期四',
    issue: '第 4471 期',
    weather: '阴，午后有雾，东南风',
    lead: {
      title: '老城区再添失踪者：本月第三起，警方呼吁市民勿深夜独行',
      deck: '雾中失踪案接连不断，皆无尸首可寻；当局与教会联合搜寻仍无所获',
      body: '本报记者昨日自廷根市警察厅获悉，老城区水车巷一带又有一名青年男子于夜雾中失踪，至此本月同类案件已增至三起，且至今无一人寻回，亦无尸首可寻。据邻里描述，失踪者皆于深夜独自出门后便再未归家，随身财物分毫未动，门锁亦完好无损。有住户称，当夜曾听见雾中传来低语，似有若无，令人脊背发凉。警察厅已增派巡夜警力，并通告市民入夜后勿要独行，尤须远离水车巷、佐特兰街等雾气最重之地。市政厅同时宣布，将自下周起在主要街区加装煤气路灯，以驱散夜雾、安定民心。然本报多方走访，未见任何一桩失踪案有下落，坊间传闻四起，人心惶惶。值此之际，本报郑重提醒诸位读者：雾夜少行，门窗闭紧，若遇形迹可疑之人，请立即报告就近警亭。',
      byline: '本报记者 埃德加·布莱克',
      column: '要闻'
    },
    columns: [
      {
        title: '蒸汽机工人再议罢工，市政厅许诺彻查工价',
        deck: '劳资双方约定三日后谈判，煤价上涨或成导火索',
        body: '连日来，廷根多家纺织与机械工厂的蒸汽机工人聚众陈情，指工价未随煤价上涨而提高，生活日益艰难。市政厅已出面调停，并承诺彻查厂方账目。若谈判破裂，恐波及全城蒸汽供应与列车班次。',
        byline: '市政通讯员',
        column: '市政'
      },
      {
        title: '殖民当局来电：南大陆垦殖获丰收，运输船队已启程',
        deck: '鲁恩在南大陆的甘蔗与棉花产区报喜，返程货轮正穿越风暴海',
        body: '自殖民地发回的电讯称，本季甘蔗与棉花大获丰收，首批货物已装船起运，预计三周后抵港。商界普遍看好此举，认为将有力平抑国内原材料价格，亦有议员呼吁加强对殖民地的治安投入，以防土人滋事。',
        byline: '本报驻外记者 温斯顿·柯尔',
        column: '海外'
      },
      {
        title: '股市小幅回暖，纺织股领涨，航运板块承压',
        deck: '棉花丰收利好下游，煤价与罢工阴影令蒸汽动力股走低',
        body: '廷根证券交易所昨日收市，纺织股因南大陆丰收而普遍上扬，涨幅居前；蒸汽动力与铁路股则受罢工传闻拖累小幅走低。分析人士提醒，若雾季持续、运输受阻，后市仍存变数。',
        byline: '商情部 整理',
        column: '商情'
      },
      {
        title: '浓雾致多起呼吸道疾患，诊所劝告老幼少出门',
        deck: '医者称今夏雾气异常，久驻户外者易患咳喘',
        body: '入夏以来，廷根的雾却迟迟不退，且较往年更浓更浊。市内多家诊所连日接诊咳嗽、胸闷者激增，多为老弱妇孺。有医师私下表示，如此浓雾持续至盛夏实属罕见，市民应减少夜间外出。',
        byline: '社会版记者 薇拉·格雷',
        column: '社会'
      },
      {
        title: '讣告',
        deck: '沉痛哀悼逝者',
        body: '廷根市民约瑟夫·海沃德先生，因病医治无效，于本月二十五日辞世，享年五十七岁。海沃德先生生前为霍伊大学历史系讲师，治学严谨，桃李满园。谨定于本周六上午在圣赛琳娜教堂举行追思仪式，望生前亲友届时莅临。',
        byline: '死者家属 泣告',
        column: '讣告'
      },
      {
        title: '神奇药水，驱除雾邪，强身健体，立竿见影',
        deck: '老字号药房新到货，专治雾季咳喘、心神不宁',
        body: '本药房新到一批祖传秘制「净气回春露」，以稀有草药配以蒸汽蒸馏法精制而成，专治雾季引起的咳嗽、胸闷、夜不能寐。每日三匙，温水送服，三日见效，无效退款。数量有限，欲购从速，敬请莅临老城区红桥药房。',
        byline: '广告部',
        column: '广告'
      },
      {
        title: '《雾中的人》第十一回：楼梯上的脚步',
        deck: '长篇连载小说，每日更新，敬请期待',
        body: '上回说到，侦探埃德蒙在废弃宅邸的阁楼里寻得那本无字之书。今夜，他独宿于此，忽闻木楼梯上传来一阵极轻的脚步声，一步、一步，由远及近，却在房门前戛然而止。埃德蒙屏住呼吸，伸手按住了腰间的左轮……',
        byline: '专栏作家 佚名',
        column: '连载'
      }
    ],
    classifieds: [
      {
        title: '诚聘夜班更夫一名',
        body: '老城区佐特兰街附近，需守夜看更，胆大心细者优先。薪优，包住。有意者请至黑荆棘安保公司面洽。'
      },
      {
        title: '旧货让售：古镜一面',
        body: '家传黄铜古镜一面，照人形貌格外清晰。因家中有故，急于出让，价格从优。有意者请寄信至邮局留存，暗号：红月亮。'
      },
      {
        title: '占卜问事，灵验非常',
        body: '通晓灵摆、塔罗与梦境之术，能断吉凶、寻失物、问前程。逢单日午后备询，仅接待有缘人。地址：白鸦巷十二号，敲门三下，自报来意。'
      },
      {
        title: '寻人启事：目击夜雾者',
        body: '凡于六月二十日前后深夜，在佐特兰街一带见过一名穿灰呢大衣男子的，请速与本人联系。提供线索者，重酬谢。请勿声张。'
      },
      {
        title: '收旧书旧报',
        body: '高价收购一切旧报纸、旧日记、家族笔记，无论残缺与否。尤其求购近日散落民间的旧书页。上门收取，银货两讫。'
      }
    ]
  },

  chronicle: {
    grand: [
      {
        id: 'g-1',
        era: '第五纪 1349年6月',
        title: '穿越与新生',
        body: '周明瑞在一场诡异的占卜仪式中坠入黑暗，再睁眼时已成为鲁恩王国廷根市的克莱恩·莫雷蒂——一个刚死于魔药失控的小文员。他继承了这个名字，也继承了这具身体留下的家人、债务，以及一桩尚未被发现的非凡者身份。从此，回家成了他活下去的唯一执念。',
        turns: 1
      },
      {
        id: 'g-2',
        era: '第五纪 1349年6月',
        title: '踏入非凡世界',
        body: '为弄清这具身体为何而死，克莱恩循着占卜家魔药的线索，接触到了隐藏在黑荆棘安保公司皮囊之下的值夜者小队。他第一次知道，这个世界有二十二条途径、有失控与封印物，而自己体内的特性，正是通往这些危险的入场券。',
        turns: 12
      },
      {
        id: 'g-3',
        era: '第五纪 1349年6月末',
        title: '加入值夜者',
        body: '在队长邓恩·史密斯的担保下，克莱恩宣誓守秘，正式成为廷根值夜者小队的一员。白天他是安保公司的普通职员，夜里他跟随老队员巡逻、超度、收容封印物。谨慎与演技，成了他在这条钢丝上唯一的护身符。',
        turns: 24
      },
      {
        id: 'g-4',
        era: '第五纪 1349年6月末',
        title: '雾中失踪案',
        body: '老城区接连有人于夜雾中失踪，尸首无踪。克莱恩奉命协助调查，发现这些案件背后缠绕着非同寻常的灵界痕迹。占卜给出的答案越来越危险，而那本安提戈努斯家族的旧笔记，似乎正把一切指向一个更深的秘密。',
        turns: 41
      }
    ],
    minor: [
      { id: 'm-1', turn: 1, time: '1349-06-28 夜', title: '苏醒', body: '克莱恩从魔药失控的余悸中醒来，对镜看见了这具身体的陌生面孔，以及桌上写给家人的遗书。' },
      { id: 'm-2', turn: 2, time: '1349-06-28 夜', title: '对镜', body: '他整理记忆碎片，确认自己穿越成了鲁恩王国廷根市的文员克莱恩·莫雷蒂。' },
      { id: 'm-3', turn: 4, time: '1349-06-29 晨', title: '家人', body: '他见到班森与梅丽莎，强作镇定地扮演起这具身体原本的哥哥与二哥。' },
      { id: 'm-4', turn: 7, time: '1349-06-29 午', title: '灵摆', body: '他用一枚水晶灵摆做了第一次占卜，摆动的方向竟真的回应了他的问题。' },
      { id: 'm-5', turn: 10, time: '1349-06-30 夜', title: '黑荆棘', body: '克莱恩第一次走进黑荆棘安保公司，见到了队长邓恩·史密斯与年轻诗人伦纳德。' },
      { id: 'm-6', turn: 14, time: '1349-07-01 晨', title: '宣誓', body: '在圣赛琳娜教堂地下，克莱恩宣誓守秘，正式成为值夜者，领到徽章与左轮。' },
      { id: 'm-7', turn: 18, time: '1349-07-02 夜', title: '第一次出勤', body: '他跟随老尼尔与雷斯莉夜间巡逻，第一次见到真正的灵体，强忍着没有当场失态。' },
      { id: 'm-8', turn: 23, time: '1349-07-03 夜', title: '通灵', body: '克莱恩在停尸房对一具无名尸做了通灵，死者的残念断断续续地念出一个地名。' },
      { id: 'm-9', turn: 27, time: '1349-07-05 午', title: '旧笔记', body: '一页写满中文的日记残页辗转落到他手里，那是罗赛尔·古斯塔夫的笔迹。' },
      { id: 'm-10', turn: 32, time: '1349-07-06 夜', title: '灵视', body: '克莱恩首次睁开灵视，看见每个人周身不同的气场颜色，也看见雾里一闪而过的黑影。' },
      { id: 'm-11', turn: 37, time: '1349-07-08 夜', title: '失踪案', body: '警察厅的娜亚·杭特找上门，请值夜者协助调查老城区第三起失踪案。' },
      { id: 'm-12', turn: 42, time: '1349-07-09 夜', title: '镜中', body: '占卜指向一面古镜，克莱恩在梦境里看见镜中倒影对他露出不属于自己的微笑。' },
      { id: 'm-13', turn: 47, time: '1349-07-10 晨', title: '扮演', body: '他按老尼尔提点的扮演法，试着更像个真正的占卜家，体内的躁动竟平息了一丝。' },
      { id: 'm-14', turn: 52, time: '1349-07-11 夜', title: '注视', body: '一次越界的占卜引来了不该来的注视，克莱恩当夜无眠，彻夜警醒。' }
    ],
    recall: [
      { id: 'r-1', score: '0.92', source: '编年史 · 大总结 g-4', snippet: '老城区接连有人于夜雾中失踪，尸首无踪……那本安提戈努斯家族的旧笔记，似乎正把一切指向一个更深的秘密。' },
      { id: 'r-2', score: '0.87', source: '图鉴 · 人物 p-dunn', snippet: '邓恩·史密斯，黑夜途径序列7「梦魇」，能潜入他人梦境、在睡梦中逼问或安抚。' },
      { id: 'r-3', score: '0.83', source: '世界书 · wb-mystic · 占卜的原理', snippet: '占卜是把问题投向灵界并读取其涟漪，因此问题越具体、涟漪越清晰，而模糊的问题会引来非人的注意。' },
      { id: 'r-4', score: '0.79', source: '图鉴 · 物品 i-antigonus', snippet: '一本记载愚者途径秘辛的旧笔记，与安提戈努斯家族世代守护的秘密相关。' },
      { id: 'r-5', score: '0.74', source: '图鉴 · 知识 l-acting', snippet: '扮演法是消化魔药的关键：去活成序列之名所代表的样子，特性才会真正臣服于你。' },
      { id: 'r-6', score: '0.71', source: '编年史 · 小总结 m-8', snippet: '克莱恩在停尸房对一具无名尸做了通灵，死者的残念断断续续地念出一个地名。' },
      { id: 'r-7', score: '0.66', source: '图鉴 · 人物 p-roselle', snippet: '罗赛尔·古斯塔夫用中文写下的日记残页，只有克莱恩读得懂。' },
      { id: 'r-8', score: '0.60', source: '世界书 · wb-core · 神秘世界守秘', snippet: '知道得越少，活得越久。一个名字被反复念诵，都会在灵界里留下越来越响的回声。' }
    ]
  },

  worldbook: {
    books: [
      { id: 'wb-core', name: '诡秘之主核心设定', entries: 5, active: true, scope: '主库' },
      { id: 'wb-mystic', name: '神秘学图鉴', entries: 3, active: true, scope: '主库' },
      { id: 'wb-geo', name: '廷根市地理', entries: 3, active: true, scope: '附属' },
      { id: 'wb-klein', name: '克莱恩·莫雷蒂', entries: 4, active: true, scope: '角色' },
      { id: 'wb-style', name: '蒸汽维多利亚题材', entries: 3, active: true, scope: '题材' }
    ],
    entries: [
      {
        id: 'e-core-1', book: 'wb-core', name: '世界底色',
        keys: ['世界', '第五纪', '鲁恩', '背景'],
        secondaryKeys: ['设定', '时代'],
        mode: '常驻', depth: 0, order: 0, tokens: 320, recursive: true, enabled: true,
        content: '故事发生在第五纪1349年的鲁恩王国，一个蒸汽与煤气、马车与电报并存的工业时代。表面平静的都市之下，非凡者行走于暗处，二十二条途径通向神座，神秘与疯狂只隔着一层薄薄的雾。'
      },
      {
        id: 'e-core-2', book: 'wb-core', name: '神秘世界守秘律令',
        keys: ['守秘', '神秘', '知道', '秘密'],
        secondaryKeys: ['污染', '注视'],
        mode: '关键词', depth: 1, order: 10, tokens: 280, recursive: false, enabled: true,
        content: '非凡世界的铁律是：知道得越少，活得越久。名字被反复念诵、仪式被反复传抄，都会在灵界留下越来越响的回声。任何角色提及秘辛时，都应保持讳莫如深、欲言又止的语气。'
      },
      {
        id: 'e-core-3', book: 'wb-core', name: '失控与污染',
        keys: ['失控', '污染', '发疯', '怪物'],
        secondaryKeys: ['魔药', '特性'],
        mode: '关键词', depth: 2, order: 20, tokens: 300, recursive: true, enabled: true,
        content: '非凡者时刻行走在失控边缘：特性反噬会让人变成怪物，灵性污染会侵蚀心智。表现失控时，角色会出现幻听、呓语、身体异变，周围环境随之扭曲。这是所有非凡者共同的恐惧，也是魔药与封印物危险的根本原因。'
      },
      {
        id: 'e-core-4', book: 'wb-core', name: '灵界',
        keys: ['灵界', '灵性', '投影', '通灵'],
        secondaryKeys: ['占卜', '灵视'],
        mode: '关键词', depth: 2, order: 30, tokens: 260, recursive: true, enabled: true,
        content: '灵界是一切真实世界的投影之海，没有稳定的时空，凡人理性在其中如烛火般微弱。占卜、通灵、灵视都要隔着灵界进行，每一次窥探都等于把门打开一条缝，门外的存在未必只是想看看。'
      },
      {
        id: 'e-core-5', book: 'wb-core', name: '扮演法',
        keys: ['扮演', '消化', '晋升', '序列'],
        secondaryKeys: ['魔药'],
        mode: '关键词', depth: 1, order: 40, tokens: 240, recursive: false, enabled: true,
        content: '扮演法是消化魔药的关键：去活成序列之名所代表的样子，特性才会臣服。占卜家越像真正的占卜家，特性越契合。但扮演过了头、忘了自己是谁，又会滑向失控。分寸是扮演法最深的学问。'
      },
      {
        id: 'e-mystic-1', book: 'wb-mystic', name: '占卜的原理',
        keys: ['占卜', '灵摆', '塔罗', '占卜家'],
        secondaryKeys: ['涟漪', '灵界'],
        mode: '关键词', depth: 2, order: 0, tokens: 260, recursive: true, enabled: true,
        content: '占卜是把问题投向灵界并读取其涟漪。问题越具体、与自身牵连越深，涟漪越清晰；问题空泛或妄图窥探远超自身位格的存在，荡回来的就不是答案，而是某些东西的注视。'
      },
      {
        id: 'e-mystic-2', book: 'wb-mystic', name: '灵视',
        keys: ['灵视', '气场', '颜色'],
        secondaryKeys: ['情绪', '非凡'],
        mode: '关键词', depth: 2, order: 10, tokens: 220, recursive: false, enabled: true,
        content: '灵视是看见万物气场的能力：活物有气场、死物有残影、非凡者周身缠绕特性颜色。占卜家睁开灵视，等于把常人看不见的情绪与危险读成彩色图谱，但看得太多也会暴露自己。'
      },
      {
        id: 'e-mystic-3', book: 'wb-mystic', name: '通灵术',
        keys: ['通灵', '死者', '残念', '尸首'],
        secondaryKeys: ['灵界', '回声'],
        mode: '关键词', depth: 2, order: 20, tokens: 230, recursive: true, enabled: true,
        content: '通灵是把亡者的残念唤回对话。刚死之人尚未沉入灵界，可借仪式问出死前所见；但回声随时间失真，越久远的死者越可能把执念与谎言混进答案，通灵本身也会引来更古老的存在。'
      },
      {
        id: 'e-geo-1', book: 'wb-geo', name: '廷根市',
        keys: ['廷根', '城市', '老城区', '雾'],
        secondaryKeys: ['佐特兰街', '水车巷'],
        mode: '常驻', depth: 0, order: 0, tokens: 240, recursive: false, enabled: true,
        content: '廷根是鲁恩王国的工业城市，遍布工厂、商行与蒸汽列车站，夜里煤气灯昏黄。近来老城区接连有人失踪，雾气比往年更浓、更不愿散去。描写城市氛围时，突出煤烟、湿冷与挥之不去的雾。'
      },
      {
        id: 'e-geo-2', book: 'wb-geo', name: '黑荆棘安保公司',
        keys: ['黑荆棘', '安保公司', '值夜者', '据点'],
        secondaryKeys: ['佐特兰街', '地下室'],
        mode: '关键词', depth: 1, order: 10, tokens: 230, recursive: false, enabled: true,
        content: '黑荆棘安保公司是值夜者小队在廷根的对公掩护，一栋不起眼的灰楼。对外承接安保与调查，对内是黑夜女神教会处理非凡事件的据点，地下室封存着危险的封印物。'
      },
      {
        id: 'e-geo-3', book: 'wb-geo', name: '佐特兰街',
        keys: ['佐特兰街', '老街', '古玩'],
        secondaryKeys: ['雾', '商铺'],
        mode: '关键词', depth: 1, order: 20, tokens: 200, recursive: false, enabled: true,
        content: '佐特兰街是廷根老城区的一条老街，黑荆棘安保公司与多家旧货铺、古玩行坐落于此。雾夜里人影寥寥，只有巡警的提灯偶尔晃过，是许多神秘交易的暗地。'
      },
      {
        id: 'e-klein-1', book: 'wb-klein', name: '克莱恩人设',
        keys: ['克莱恩', '主角', '穿越者', '周明瑞'],
        secondaryKeys: ['莫雷蒂', '占卜家'],
        mode: '常驻', depth: 0, order: 0, tokens: 320, recursive: true, enabled: true,
        content: '克莱恩·莫雷蒂，原名周明瑞，从地球穿越到第五纪鲁恩王国廷根市，成为占卜家途径序列9的占卜家。他谨慎、克制、心思缜密，把回家当作唯一执念，用演技与小心在非凡世界求生。'
      },
      {
        id: 'e-klein-2', book: 'wb-klein', name: '家人牵绊',
        keys: ['班森', '梅丽莎', '家人', '妹妹'],
        secondaryKeys: ['哥哥', '莫雷蒂'],
        mode: '关键词', depth: 1, order: 10, tokens: 220, recursive: false, enabled: true,
        content: '克莱恩有哥哥班森与妹妹梅丽莎，家境清贫，靠班森的微薄薪水与梅丽莎的精打细算度日。他珍视这份偷来的亲情，既想护他们周全，又怕自己的秘密连累他们。'
      },
      {
        id: 'e-klein-3', book: 'wb-klein', name: '占卜能力',
        keys: ['灵摆', '塔罗', '占卜', '灵视', '通灵'],
        secondaryKeys: ['梦境', '占卜家'],
        mode: '关键词', depth: 1, order: 20, tokens: 260, recursive: true, enabled: true,
        content: '克莱恩掌握灵摆、塔罗、灵视与通灵等占卜家能力，常借占卜判断方向、真假与吉凶。占卜并非全知，答案模糊且可能被灵界误导，他因此总在结果中保留怀疑。'
      },
      {
        id: 'e-klein-4', book: 'wb-klein', name: '值夜者身份',
        keys: ['值夜者', '黑荆棘', '邓恩', '守秘'],
        secondaryKeys: ['黑夜女神', '教会'],
        mode: '常驻', depth: 0, order: 30, tokens: 240, recursive: false, enabled: true,
        content: '克莱恩是廷根值夜者小队的新成员，队长是邓恩·史密斯。他白天以安保公司职员身份示人，夜里随队处理非凡事件，始终警惕身份暴露，谨守非凡世界的守秘律令。'
      },
      {
        id: 'e-style-1', book: 'wb-style', name: '维多利亚腔调',
        keys: ['报刊', '长句', '庄重', '叙述'],
        secondaryKeys: ['正式', '时代'],
        mode: '常驻', depth: 0, order: 0, tokens: 240, recursive: false, enabled: true,
        content: '叙述与报纸文字采用维多利亚时代的庄重腔调：多用长句、从句与委婉措辞，语气克制而礼貌。描写上流与官方场合时更显繁复，街头对话则可口语，但仍带旧时称谓与敬语。'
      },
      {
        id: 'e-style-2', book: 'wb-style', name: '蒸汽时代器物',
        keys: ['蒸汽', '煤气灯', '马车', '电报', '列车'],
        secondaryKeys: ['工业', '机械'],
        mode: '关键词', depth: 1, order: 10, tokens: 220, recursive: false, enabled: true,
        content: '世界处于蒸汽与煤气并行的工业时代：蒸汽列车、煤气路灯、马车、电报与左轮手枪是常见器物。描写环境时点缀黄铜、煤烟、蒸汽的嘶鸣，营造工业与神秘并存的质感。'
      },
      {
        id: 'e-style-3', book: 'wb-style', name: '雾与不安',
        keys: ['雾', '雾气', '阴冷', '不安'],
        secondaryKeys: ['夜', '失踪'],
        mode: '关键词', depth: 1, order: 20, tokens: 200, recursive: false, enabled: true,
        content: '廷根的雾是贯穿全篇的氛围符号，浓重、湿冷、挥之不去，常与失踪、诡异与不详相连。描写雾夜时，压低色彩与声音，突出能见度极低带来的孤立与不安。'
      }
    ]
  },

  cases: [
    {
      id: 'c-1',
      code: 'TN-1349-07',
      title: '老城区连环失踪案',
      status: '侦办中',
      opened: '第五纪1349年7月8日',
      location: '廷根市老城区 水车巷、佐特兰街一带',
      brief: '自六月中旬起，老城区接连有三名青年男子于深夜雾中失踪，皆无尸首、无打斗痕迹，财物与门锁完好。警察厅束手无策，转请值夜者协助。',
      clues: [
        { id: 'cl-1-1', name: '失踪者档案', found: true, note: '三名失踪者均为独居青年，失踪前一周都曾到过佐特兰街的古玩行附近。' },
        { id: 'cl-1-2', name: '通灵残念', found: true, note: '对一处无名尸通灵，死者断断续续念出「镜子」「倒影」两个词。' },
        { id: 'cl-1-3', name: '灵界涟漪', found: true, note: '占卜显示失踪者最后的活动都指向同一栋废弃宅邸，但宅邸多次搜查空无一人。' },
        { id: 'cl-1-4', name: '目击者的低语', found: true, note: '一名住户称失踪当夜听见雾中传来低语，似在呼唤某个名字。' },
        { id: 'cl-1-5', name: '安提戈努斯旧笔记', found: false, note: '笔记中一段被涂黑的记载，似乎与一面能吞人的镜子有关。' }
      ],
      suspects: [
        { name: '塞尔玛·安提戈努斯', note: '古玩行就在失踪者活动范围，且与愚者途径相关旧物有关。', doubt: 65 },
        { name: '怨念铜镜（封印物）', note: '封印物「怨念铜镜」能照见死者，与通灵所得的「镜子」吻合，但仍在封存中。', doubt: 55 },
        { name: '无名流浪占卜师', note: '有摊贩称见过一名深夜为人占卜的外来者，行踪诡秘。', doubt: 40 }
      ],
      verdict: '案件仍在侦办，多线线索指向一面能「吞没」失踪者的镜子或镜像，真相尚未浮出水面。'
    },
    {
      id: 'c-2',
      code: 'TN-1349-05',
      title: '白鸦巷古玩失窃案',
      status: '已结案',
      opened: '第五纪1349年6月22日',
      location: '廷根市 白鸦巷十二号',
      brief: '白鸦巷一处旧货铺遭窃，店内一面古镜与数页旧书页不翼而飞。经查，窃贼为一名自称「占卜师」的外来者。',
      clues: [
        { id: 'cl-2-1', name: '窗台脚印', found: true, note: '后窗留下半枚泥脚印，鞋底花纹为市面少见的软底便鞋。' },
        { id: 'cl-2-2', name: '碎落的镜框', found: true, note: '失窃的古镜只取走了镜面，黄铜镜框被弃在原地，切口平整。' },
        { id: 'cl-2-3', name: '占卜摊证词', found: true, note: '一名摊贩认出窃贼曾在集市摆摊占卜，口音非本地人。' },
        { id: 'cl-2-4', name: '寄卖契约', found: true, note: '店主承认那面古镜是「代为寄卖」，真正的物主从未露面。' }
      ],
      suspects: [
        { name: '外来占卜师', note: '已被锁定，但于结案前夜离开廷根，去向不明。', doubt: 80 },
        { name: '旧货铺店主', note: '对古镜来历含糊其辞，疑似隐瞒物主身份。', doubt: 35 }
      ],
      verdict: '已结案：确认窃贼为流窜作案的外来占卜师，因古镜已不知所踪、窃贼出逃，追赃未果，案件转档悬置。'
    },
    {
      id: 'c-3',
      code: 'TN-1349-03',
      title: '码头无名尸案',
      status: '搁置',
      opened: '第五纪1349年6月14日',
      location: '廷根市 蒸汽码头',
      brief: '工人在码头货舱后发现一具无名男尸，尸体无外伤、面容安详，经查并非淹死。死者身份与死因成谜。',
      clues: [
        { id: 'cl-3-1', name: '尸检记录', found: true, note: '无外伤、无溺毙迹象，仿佛在睡梦中死去，死亡时间无法精确判定。' },
        { id: 'cl-3-2', name: '衣袋船票', found: true, note: '死者衣袋里有一张撕去半截的船票，只能辨认出「贝克兰德」字样。' },
        { id: 'cl-3-3', name: '码头工人证词', found: true, note: '有工人称前夜见死者独自站在货舱阴影里，一动不动直到深夜。' },
        { id: 'cl-3-4', name: '灵视残留', found: true, note: '值夜者以灵视查看，死者周身残留极淡的、不属于常人的灰色气场。' }
      ],
      suspects: [
        { name: '未知非凡者', note: '灰色气场表明死者生前或死后与非凡力量有过接触。', doubt: 60 },
        { name: '船运货主', note: '货主对货物清单含糊其辞，拒绝配合盘查。', doubt: 30 }
      ],
      verdict: '因死者身份长期无法确认、且涉及非凡痕迹，案件转由值夜者归档，暂时搁置，等待新线索。'
    }
  ],

  divination: {
    spreads: [
      { id: 's-1', name: '单张问事', cards: 1, cost: 0, desc: '抽一张牌，最直接的吉凶判断，适合回答是非与方向。' },
      { id: 's-2', name: '三时之牌', cards: 3, cost: 1, desc: '三张牌依次对应过去、现在、未来，看清一件事的来龙去脉。' },
      { id: 's-3', name: '命运十字', cards: 5, cost: 2, desc: '十字牌阵，正中为当下，四周为阻力、助力、根源与走向。' },
      { id: 's-4', name: '愚者之旅', cards: 22, cost: 5, desc: '铺开全部二十二张大阿卡纳，窥探一段命运的完整脉络，极耗灵性。' }
    ],
    deck: [
      { id: 'd-0', name: '愚者', latin: 'The Fool', upright: '新旅程的起点，凭直觉踏入未知，也是危险的轻率。', reversed: '迟疑不决，错失良机，或对眼前的深渊视而不见。', arcana: 0 },
      { id: 'd-1', name: '魔术师', latin: 'The Magician', upright: '掌握了撬动命运的工具，意志与技巧正在交汇。', reversed: '力量被误用，手段成了陷阱，或天赋被白白挥霍。', arcana: 1 },
      { id: 'd-2', name: '女祭司', latin: 'The High Priestess', upright: '秘辛在帷幕后低语，静默比追问更能听见真相。', reversed: '被表象蒙蔽，忽略了直觉，或秘密正在被泄露。', arcana: 2 },
      { id: 'd-3', name: '皇后', latin: 'The Empress', upright: '丰饶与庇护降临，情感与肉身都得到滋养。', reversed: '过度索取与依赖，创造力枯竭，或被温情捆缚。', arcana: 3 },
      { id: 'd-4', name: '皇帝', latin: 'The Emperor', upright: '秩序与权威确立，规则带来稳定，也带来枷锁。', reversed: '暴虐或失控，权威崩塌，秩序沦为僵死的教条。', arcana: 4 },
      { id: 'd-5', name: '教皇', latin: 'The Hierophant', upright: '传统与信仰指路，服从某种更高存在的庇护。', reversed: '教条僵化，盲从权威，或被伪神与旧律欺骗。', arcana: 5 },
      { id: 'd-6', name: '恋人', latin: 'The Lovers', upright: '两难中的抉择，联结与诱惑并至，须忠于内心。', reversed: '关系破裂，选择错误，或被欲望牵引背离本心。', arcana: 6 },
      { id: 'd-7', name: '战车', latin: 'The Chariot', upright: '意志驾驭分歧，向前冲锋，胜利需要付出代价。', reversed: '方向失控，内耗撕裂，或前进的冲劲半途而废。', arcana: 7 },
      { id: 'd-8', name: '力量', latin: 'Strength', upright: '以柔克刚，用耐性与勇气驯服内心的野兽。', reversed: '软弱或自疑，被本能反噬，或被恐惧压垮了勇气。', arcana: 8 },
      { id: 'd-9', name: '隐者', latin: 'The Hermit', upright: '退入寂静，独自追寻答案，灯只照亮脚下一步。', reversed: '孤立与偏执，拒绝帮助，或在独行中迷失方向。', arcana: 9 },
      { id: 'd-10', name: '命运之轮', latin: 'Wheel of Fortune', upright: '命运的轮盘转动，转机将至，因果正在闭合。', reversed: '厄运临头，时运不济，或抗拒那不可更改的轮回。', arcana: 10 },
      { id: 'd-11', name: '正义', latin: 'Justice', upright: '因果报应分明，真相与代价都将被称量。', reversed: '不公与偏见，逃避责任，或被错误的审判冤枉。', arcana: 11 },
      { id: 'd-12', name: '倒吊人', latin: 'The Hanged Man', upright: '以牺牲换取顿悟，悬置是为了看见颠倒的真相。', reversed: '无谓的牺牲，停滞不前，或拒绝放手徒增痛苦。', arcana: 12 },
      { id: 'd-13', name: '死神', latin: 'Death', upright: '旧我死去，新的开始，一场无可回避的蜕变。', reversed: '抗拒终结，执念未断，或变化被生生拖入僵局。', arcana: 13 },
      { id: 'd-14', name: '节制', latin: 'Temperance', upright: '调和矛盾，耐心地配比，失衡终将归于平和。', reversed: '过度与放纵，节奏紊乱，或在调和里丧失了自我。', arcana: 14 },
      { id: 'd-15', name: '恶魔', latin: 'The Devil', upright: '欲望的锁链缠身，诱惑与沉沦正在收紧。', reversed: '挣脱束缚，识破诱惑，或短暂摆脱却留下旧瘾。', arcana: 15 },
      { id: 'd-16', name: '塔', latin: 'The Tower', upright: '骤然的崩塌，旧秩序轰然倒下，惊变无可挽回。', reversed: '灾难被推迟，隐患未除，或在废墟上拒绝重建。', arcana: 16 },
      { id: 'd-17', name: '星星', latin: 'The Star', upright: '黑暗中的希望，微光指引前路，信念得以延续。', reversed: '希望渺茫，信念动摇，或仰望太久忘了脚下的路。', arcana: 17 },
      { id: 'd-18', name: '月亮', latin: 'The Moon', upright: '雾障重重，幻象与恐惧滋生，须辨明梦与现实。', reversed: '迷雾渐散，恐惧退去，或仍有暗流在平静下涌动。', arcana: 18 },
      { id: 'd-19', name: '太阳', latin: 'The Sun', upright: '真相大白，生命与欢愉复苏，阴霾一扫而空。', reversed: '短暂的阴翳，喜悦被遮蔽，或成功来得太过灼热。', arcana: 19 },
      { id: 'd-20', name: '审判', latin: 'Judgement', upright: '往昔被清算，召唤与新生，灵魂接受最后的裁决。', reversed: '逃避审判，自我否定，或沉溺于旧账无法重生。', arcana: 20 },
      { id: 'd-21', name: '世界', latin: 'The World', upright: '旅程圆满，抵达终点，一个循环的完成与超越。', reversed: '差最后一步，功亏一篑，或困在圆满的幻象里。', arcana: 21 }
    ],
    records: [
      { id: 'rec-1', time: '1349-06-29 午', spread: '单张问事', question: '这具身体原本的死，是否与我有关？', result: '正位 死神', note: '牌面指向一场旧我的终结，克莱恩沉默许久。' },
      { id: 'rec-2', time: '1349-07-01 夜', spread: '单张问事', question: '加入值夜者，是吉是凶？', result: '逆位 月亮', note: '迷雾难散，暗流涌动，他提醒自己加倍小心。' },
      { id: 'rec-3', time: '1349-07-04 夜', spread: '三时之牌', question: '失踪案的真相藏在何处？', result: '过去 隐者 / 现在 塔 / 未来 星星', note: '过去有人独守秘密，当下将生惊变，未来仍有一线微光。' },
      { id: 'rec-4', time: '1349-07-07 夜', spread: '命运十字', question: '我能否找到回家的路？', result: '正中 愚者 / 助 星星 / 阻 恶魔 / 根 命运之轮 / 向 世界', note: '一条漫长而危险的旅程，终点似有圆满，途中满是诱惑。' },
      { id: 'rec-5', time: '1349-07-09 夜', spread: '单张问事', question: '安提戈努斯的笔记，该不该继续追查？', result: '正位 倒吊人', note: '牺牲与顿悟并存，代价未明，克莱恩决定暂缓。' }
    ]
  },

  relations: [
    {
      id: 'rel-klein',
      name: '克莱恩·莫雷蒂',
      sequence: '序列9',
      org: '值夜者小队',
      affinity: 100,
      attitude: '平淡',
      tint: '#8f989e',
      lastMet: '始终在场',
      note: '主角自身，对所有关系的判断都经过理性的权衡。',
      edges: [
        { to: 'rel-dunn', kind: '上司' },
        { to: 'rel-benson', kind: '亲属' },
        { to: 'rel-melissa', kind: '亲属' },
        { to: 'rel-azik', kind: '师承' }
      ]
    },
    {
      id: 'rel-dunn',
      name: '邓恩·史密斯',
      sequence: '序列7',
      org: '值夜者小队',
      affinity: 62,
      attitude: '欣赏',
      tint: '#5d666b',
      lastMet: '1349-07-11 夜',
      note: '队长，为克莱恩背书，也始终警惕他带来的风险。',
      edges: [
        { to: 'rel-klein', kind: '上司' },
        { to: 'rel-leonard', kind: '同僚' },
        { to: 'rel-neil', kind: '同僚' }
      ]
    },
    {
      id: 'rel-leonard',
      name: '伦纳德·米切尔',
      sequence: '序列8',
      org: '值夜者小队',
      affinity: 55,
      attitude: '平淡',
      tint: '#2a6d90',
      lastMet: '1349-07-10 午',
      note: '同辈队友，散漫却敏锐，偶尔拿克莱恩的占卜开玩笑。',
      edges: [
        { to: 'rel-klein', kind: '同僚' },
        { to: 'rel-dunn', kind: '同僚' }
      ]
    },
    {
      id: 'rel-neil',
      name: '老尼尔',
      sequence: '序列9',
      org: '值夜者小队',
      affinity: 58,
      attitude: '信任',
      tint: '#7d7466',
      lastMet: '1349-07-11 晨',
      note: '和蔼的引路人，教克莱恩扮演法与队里的规矩。',
      edges: [
        { to: 'rel-klein', kind: '师承' },
        { to: 'rel-dunn', kind: '同僚' }
      ]
    },
    {
      id: 'rel-benson',
      name: '班森·莫雷蒂',
      sequence: '凡人',
      org: '铁路公司',
      affinity: 88,
      attitude: '信任',
      tint: '#23201c',
      lastMet: '1349-07-11 夜',
      note: '哥哥，勤恳顾家，对克莱恩的近况隐隐担忧。',
      edges: [
        { to: 'rel-klein', kind: '亲属' },
        { to: 'rel-melissa', kind: '亲属' }
      ]
    },
    {
      id: 'rel-melissa',
      name: '梅丽莎·莫雷蒂',
      sequence: '凡人',
      org: '廷根市',
      affinity: 92,
      attitude: '信任',
      tint: '#e0d6c4',
      lastMet: '1349-07-11 夜',
      note: '妹妹，聪明坚强，是克莱恩想守护的最重要的人。',
      edges: [
        { to: 'rel-klein', kind: '亲属' },
        { to: 'rel-benson', kind: '亲属' }
      ]
    },
    {
      id: 'rel-azik',
      name: '阿兹克·艾格斯',
      sequence: '高阶（隐藏）',
      org: '霍伊大学',
      affinity: 70,
      attitude: '欣赏',
      tint: '#16394d',
      lastMet: '1349-07-05 午',
      note: '恩师，温和而神秘，本能地亲近死神与命运相关之物。',
      edges: [
        { to: 'rel-klein', kind: '师承' }
      ]
    },
    {
      id: 'rel-naia',
      name: '娜亚·杭特',
      sequence: '序列9',
      org: '廷根市警察厅',
      affinity: 40,
      attitude: '警惕',
      tint: '#c9913c',
      lastMet: '1349-07-08 夜',
      note: '警探，与值夜者合作查案，对克莱恩的半遮半掩颇有戒心。',
      edges: [
        { to: 'rel-klein', kind: '同僚' }
      ]
    },
    {
      id: 'rel-selma',
      name: '塞尔玛·安提戈努斯',
      sequence: '序列8',
      org: '安提戈努斯家族',
      affinity: 0,
      attitude: '敌意',
      tint: '#7d2318',
      lastMet: '尚未见面',
      note: '未露面的古玩商，与愚者途径旧物相关，是潜在的对头。',
      edges: [
        { to: 'rel-klein', kind: '敌对' }
      ]
    },
    {
      id: 'rel-frye',
      name: '弗雷·舒尔茨',
      sequence: '序列9',
      org: '值夜者小队',
      affinity: 45,
      attitude: '平淡',
      tint: '#514a41',
      lastMet: '1349-07-09 夜',
      note: '不眠者同僚，刻板可靠，值夜班的中坚。',
      edges: [
        { to: 'rel-klein', kind: '同僚' },
        { to: 'rel-dunn', kind: '同僚' }
      ]
    }
  ],

  map: {
    regions: [
      { id: 'r-tingen', name: '廷根市', latin: 'Tingen', kind: '城市', x: 50, y: 46, discovered: true, note: '鲁恩王国的工业城市，煤烟与雾笼罩的灰城。' },
      { id: 'r-blackthorn', name: '黑荆棘安保公司', latin: 'Blackthorn Security Company', kind: '秘所', x: 44, y: 50, discovered: true, note: '值夜者据点，地下封存着危险封印物。' },
      { id: 'r-zouteland', name: '佐特兰街', latin: 'Zouteland Street', kind: '街区', x: 45, y: 52, discovered: true, note: '老城老街，古玩行与神秘交易汇集之地。' },
      { id: 'r-moretti', name: '莫雷蒂家宅', latin: 'Moretti Residence', kind: '建筑', x: 58, y: 40, discovered: true, note: '三兄妹的狭小居所。' },
      { id: 'r-police', name: '廷根市警察厅', latin: 'Tingen Police Station', kind: '建筑', x: 52, y: 38, discovered: true, note: '明面上追查失踪案的官方机构。' },
      { id: 'r-selena', name: '圣赛琳娜教堂', latin: 'St. Selena Church', kind: '建筑', x: 60, y: 44, discovered: true, note: '黑夜女神教堂，值夜者的名义上级。' },
      { id: 'r-hoy', name: '霍伊大学', latin: 'Hoy University', kind: '建筑', x: 66, y: 48, discovered: true, note: '克莱恩的母校，阿兹克执教之处。' },
      { id: 'r-library', name: '廷根市立图书馆', latin: 'Tingen Public Library', kind: '建筑', x: 56, y: 46, discovered: true, note: '查阅旧报纸与地方志的去处。' },
      { id: 'r-station', name: '廷根蒸汽车站', latin: 'Tingen Station', kind: '港口', x: 48, y: 56, discovered: false, note: '通往贝克兰德等地的枢纽，罢工传闻不断。' },
      { id: 'r-docks', name: '蒸汽码头', latin: 'Steam Dock', kind: '港口', x: 40, y: 58, discovered: true, note: '货轮往来，曾发现无名尸。' },
      { id: 'r-waterwheel', name: '水车巷', latin: 'Waterwheel Lane', kind: '街区', x: 47, y: 55, discovered: true, note: '失踪案频发的雾重之地。' },
      { id: 'r-whitecrow', name: '白鸦巷', latin: 'White Crow Lane', kind: '街区', x: 50, y: 49, discovered: true, note: '占卜摊与旧货铺聚集的小巷。' },
      { id: 'r-mansion', name: '废弃宅邸', latin: 'The Abandoned Mansion', kind: '遗迹', x: 43, y: 47, discovered: false, note: '占卜指向的失踪终点，屡次搜查却空无一人。' },
      { id: 'r-backlund', name: '贝克兰德', latin: 'Backlund', kind: '城市', x: 78, y: 22, discovered: false, note: '鲁恩首都，雾与阴谋共治的巨型都会。' }
    ],
    routes: [
      { from: 'r-moretti', to: 'r-blackthorn', hours: 0.5, mode: '步行' },
      { from: 'r-blackthorn', to: 'r-police', hours: 0.4, mode: '马车' },
      { from: 'r-blackthorn', to: 'r-zouteland', hours: 0.1, mode: '步行' },
      { from: 'r-moretti', to: 'r-library', hours: 0.3, mode: '步行' },
      { from: 'r-library', to: 'r-selena', hours: 0.3, mode: '步行' },
      { from: 'r-zouteland', to: 'r-waterwheel', hours: 0.4, mode: '步行' },
      { from: 'r-police', to: 'r-docks', hours: 0.6, mode: '马车' },
      { from: 'r-station', to: 'r-backlund', hours: 6, mode: '蒸汽列车' },
      { from: 'r-docks', to: 'r-backlund', hours: 72, mode: '轮船' },
      { from: 'r-zouteland', to: 'r-whitecrow', hours: 0.2, mode: '步行' }
    ],
    forsaken: [
      { id: 'f-1', name: '雾之深渊', note: '一片永不散去的浓雾，据说雾底沉着一座被遗忘的城。', risk: 4 },
      { id: 'f-2', name: '神弃之地', note: '被神祇遗弃的荒原，时间与方向在此失去意义。', risk: 5 },
      { id: 'f-3', name: '倒影之湖', note: '湖面平静如镜，却倒映着另一个不属于此世的世界。', risk: 3 },
      { id: 'f-4', name: '无声钟楼', note: '一座钟楼，钟声只对将死之人响起。', risk: 2 },
      { id: 'f-5', name: '白骨回廊', note: '由无数亡者遗骨砌成的长廊，尽头无人归来。', risk: 4 },
      { id: 'f-6', name: '红月旷野', note: '每逢红月，旷野上便会出现不属于人间的影子。', risk: 3 }
    ]
  }
};
