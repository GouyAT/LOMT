import { BookOpen, ScrollText, Sparkles, Newspaper, Users, Swords, Compass } from 'lucide-react'
import { useUI } from '@/store/ui'
import { chronicle, npcs, newspaper, regions } from '@/data/mock'

const entries = [
  { id: 'map', title: '世界地图', icon: Compass, hint: '鲁恩王国 · 廷根市', desc: '王国舆图与地标一览' },
  { id: 'compendium', title: '图鉴', icon: BookOpen, hint: `${npcs.length + 4} 份档案`, desc: '人物 · 物品 · 神秘学知识' },
  { id: 'chronicle', title: '编年史', icon: ScrollText, hint: `${chronicle.length} 条经历`, desc: '你的旅途实录' },
  { id: 'divination', title: '占卜', icon: Sparkles, hint: '消耗灵性 5', desc: '塔罗牌阵揭示命运' },
  { id: 'newspaper', title: '鲁恩日报', icon: Newspaper, hint: newspaper.日期, desc: '世界正在发生的事' },
  { id: 'relation', title: '人物关系', icon: Users, hint: `${npcs.length} 位相识`, desc: '恩怨情仇的账册' },
  { id: 'battle', title: '战术棋盘', icon: Swords, hint: '筹备中', desc: '规则演算 · 战报演绎' },
] as const

/** 右栏 —— 档案入口与今日一览 */
export function ArchivePanel() {
  const openOverlay = useUI((s) => s.openOverlay)

  return (
    <aside className="flex h-full flex-col gap-3 overflow-y-auto pl-1" id="archive-panel" aria-label="档案库">
      {/* 地图缩略 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="舆图速览">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="panel-title">舆图</h4>
          <button
            id="map-open-from-sidebar"
            className="font-serifcn text-[11px] text-gold-300/80 transition-colors hover:text-gold-200"
            onClick={() => openOverlay('map')}
          >
            展开
          </button>
        </div>
        <button id="map-mini-thumbnail" onClick={() => openOverlay('map')} className="group relative block w-full overflow-hidden rounded-sm border border-gold-400/15 transition-all duration-300 hover:border-gold-400/45" aria-label="打开世界地图">
          <MiniMap />
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-black/75 px-2.5 py-1 font-serifcn text-[11px] text-parchment-100">
            {regions[0].名称} · {regions[0].地标[1]}
          </span>
        </button>
      </section>

      {/* 档案入口 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="档案入口">
        <h4 className="panel-title mb-3">档案</h4>
        <ul className="space-y-1.5">
          {entries.map((e) => (
            <li key={e.id}>
              <button
                id={`archive-entry-${e.id}`}
                onClick={() => openOverlay(e.id)}
                className="group flex w-full items-center gap-3 rounded-sm border border-transparent px-2.5 py-2.5 text-left transition-all duration-300 hover:border-gold-400/30 hover:bg-gold-400/6"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-gold-400/25 bg-abyss-900/70 text-gold-300 transition-transform duration-300 group-hover:scale-105" aria-hidden="true">
                  <e.icon size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-serifcn text-[13px] tracking-wide text-ink-100/90">{e.title}</span>
                    <span className="diegetic-caption shrink-0">{e.hint}</span>
                  </span>
                  <span className="diegetic-caption mt-0.5 block truncate">{e.desc}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 今日头条 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="今日头条">
        <h4 className="panel-title mb-2.5">今日头条</h4>
        <p className="font-serifcn text-[12.5px] font-medium leading-relaxed text-parchment-100/90">{newspaper.头条}</p>
        <p className="diegetic-caption mt-1.5">——《{newspaper.报刊名}》</p>
      </section>
    </aside>
  )
}

/** 袖珍舆图 —— 纯 SVG 的王国轮廓示意 */
function MiniMap() {
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" role="img" aria-label="王国舆图缩略">
      <rect width="320" height="190" fill="#0c0c15" />
      {/* 海面 */}
      <path d="M0 120 Q 80 100 160 124 T 320 118 L320 190 L0 190 Z" fill="#0a0d18" />
      <path d="M0 120 Q 80 100 160 124 T 320 118" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" strokeDasharray="4 4" />
      {/* 陆地块 */}
      <path d="M30 40 L110 28 L150 62 L118 108 L52 112 L20 78 Z" fill="#12121f" stroke="rgba(212,175,55,0.4)" strokeWidth="1.2" />
      <path d="M170 34 L240 22 L282 56 L262 96 L196 104 L162 70 Z" fill="#12121f" stroke="rgba(212,175,55,0.4)" strokeWidth="1.2" />
      <path d="M60 140 L120 132 L150 168 L70 178 Z" fill="#10101a" stroke="rgba(212,175,55,0.32)" strokeWidth="1.1" />
      {/* 地标点 */}
      <circle cx="70" cy="62" r="2.2" fill="#f0d98c" />
      <text x="77" y="65" fill="rgba(232,226,208,0.75)" fontSize="9">贝克兰德</text>
      <circle cx="96" cy="96" r="2.6" fill="#e6c768" className="animate-pulse-soft" />
      <text x="104" y="99" fill="rgba(240,217,140,0.9)" fontSize="9">廷根</text>
      <circle cx="216" cy="52" r="2.2" fill="#f0d98c" />
      <text x="224" y="55" fill="rgba(232,226,208,0.75)" fontSize="9">特里尔</text>
    </svg>
  )
}
