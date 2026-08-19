# 诡秘剧场 · Lord of Mysteries Theatre

《诡秘之主》AI 角色扮演（AIRP）重制版 —— **前端原型**（纯 UI，不含后端/LLM 逻辑）。

## 技术栈

- Vite 5 + React 18 + TypeScript
- Tailwind CSS 3（自定义设计系统：深渊黑/烛金/血红/羊皮纸色板）
- Framer Motion（帷幕、模态、翻牌、微交互动画）
- Radix UI（Dialog / Tabs / Toast / 无障碍基元）
- Lucide React（线性图标，全站无 emoji）
- Zustand（UI 状态）

## 运行

```bash
npm install          # 注意：需清除 HTTP_PROXY 环境变量（本地代理未运行时）
npm run dev          # http://localhost:5173
npm run build        # 产物在 dist/
node shots.mjs       # 生成 14 张验收截图到 screenshots/
node checks.mjs      # DOM 级自动化验收（溢出/定位/错误/移动端）
```

> 本机沙箱说明：`npm run dev` / `npm run build` / playwright 脚本需要启动子进程，
> 在受限沙箱下会报 `spawn EPERM`，需以更宽权限运行。

## 界面地图

| 界面 | 入口 | 说明 |
|---|---|---|
| 开场序列 | 打开即见 | 星空标题 → 点击 → 星空幕布分开 → 天鹅绒帷幕拉开 → 舞台亮相 |
| 登录页 | 开场完成 | 剧场舞台布景：横楣灯牌/聚光灯/流苏侧幕；开始旅程/继续/档案馆/设置 |
| PC 主界面 | 开始新旅程 | 三栏：状态卷宗（左）/ 叙事舞台（中）/ 档案库（右） |
| 三态切换 | 叙事区工具条 | 窄条叙事 ⇄ 全屏阅读 ⇄ 场景探索（热区） |
| 移动端 | 顶栏视图切换或窄屏自动 | 单栏叙事 + 底部标签栏 + 底部抽屉 |
| 面板（幕帘模态） | 右栏档案入口/顶栏 | 世界地图/图鉴/编年史/占卜/鲁恩日报/人物关系/行囊/设置/档案馆/战术棋盘 |
| Toast | 全局 | 右上角羊皮纸卷轴堆叠，内部通知系统 |
| 确认框 | 档案馆→回滚 | 火漆印章确认框，内部对话框 |

## 设计系统

- **材质**：羊皮纸（SVG 噪点）、天鹅绒帷幕（褶皱渐变）、金箔、火漆印章、木纹舞台地板
- **字体**：Cinzel Decorative（标题）/ Cinzel / EB Garamond（西文）/ Noto Serif SC（中文正文）
- **装饰**：四角金饰、纹章分隔线、聚光灯、剧院招牌灯
- **动画**：星空粒子（Canvas 视差）、帷幕拉开、塔罗翻面（3D）、墨水涟漪、六维属性条流动、打字光标
- **Diegetic UI**：状态=神秘学笔记，文档=羊皮纸版面，通知=卷轴

## 目录

```
src/
├── components/
│   ├── OpeningSequence.tsx    # 开场三幕（标题/幕布分开/帷幕拉开）
│   ├── LoginPage.tsx          # 剧场舞台登录页
│   ├── GameScreen.tsx         # PC 三栏 + 移动端 + OverlayHost
│   ├── Starfield.tsx          # Canvas 星空粒子
│   ├── narrative/             # NarrativeStage（三态）+ 正文/思维链/选项/输入/场景插画
│   ├── panels/                # StatusPanel / ArchivePanel / 十个幕帘面板
│   └── ui/                    # Overlay（幕帘模态）/ ConfirmDialog / ToastHost
├── data/mock.ts               # 取自老卡真实存档的演示数据
├── store/ui.ts                # Zustand UI 状态
└── index.css                  # 设计系统（材质/装饰/动画）
```

## 验收记录

- DOM 验收：无溢出、无 console 错误、8 个面板全部视口内、移动抽屉贴底、占卜翻牌 3/3
- 截图：`screenshots/01-15`（开场/登录/PC/三态/各面板/移动端/确认框）
- 生产构建：2.5s，gzip 136KB
