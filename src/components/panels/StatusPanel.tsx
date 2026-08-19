import { motion } from 'framer-motion'
import { Sword, Shirt, Gem, Backpack, Crown, Clock3, MapPin, Sparkles, ChevronRight } from 'lucide-react'
import { statBlock, equipment, inventory, factions, abilities, traits } from '@/data/mock'
import { useUI } from '@/store/ui'

function StatBar({ label, current, max, danger }: { label: string; current: number; max: number; danger?: boolean }) {
  const pct = Math.min(100, Math.round((current / max) * 100))
  return (
    <div className="group">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-serifcn text-[12px] tracking-wider text-ink-100/85">{label}</span>
        <span className={`font-serifen text-[12px] tabular-nums ${danger ? 'text-red-400' : 'text-gold-200/90'}`}>
          {current}
          <span className="text-ink-400/70"> / {max}</span>
        </span>
      </div>
      <div className="stat-track">
        <motion.div
          className={`stat-fill ${danger ? 'danger' : ''}`}
          initial={{ transform: 'scaleX(0)' }}
          animate={{ transform: `scaleX(${pct / 100})` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

const equipmentSlots = [
  { key: '武器', icon: Sword },
  { key: '衣物', icon: Shirt },
  { key: '饰品', icon: Gem },
] as const

/** 左栏 —— 玩家状态卷宗 */
export function StatusPanel() {
  const openOverlay = useUI((s) => s.openOverlay)
  const dims = [
    { 名: '活力', 现: statBlock.当前活力, 基: statBlock.基础活力 },
    { 名: '灵性', 现: statBlock.当前灵性, 基: statBlock.基础灵性 },
    { 名: '理智', 现: statBlock.当前理智, 基: statBlock.基础理智 },
    { 名: '人性', 现: statBlock.当前人性, 基: statBlock.基础人性 },
    { 名: '敏捷', 现: statBlock.当前敏捷, 基: statBlock.基础敏捷 },
    { 名: '运气', 现: statBlock.当前运气, 基: statBlock.基础运气 },
  ]

  return (
    <aside className="flex h-full flex-col gap-3 overflow-y-auto pr-1" id="status-panel" aria-label="玩家状态">
      {/* 玩家卡 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="角色档案">
        <div className="flex items-center gap-3.5">
          <div className="relative h-16 w-16 shrink-0" aria-hidden="true">
            <svg viewBox="0 0 64 64" className="h-full w-full">
              <circle cx="32" cy="32" r="30" fill="#14141f" stroke="#d4af37" strokeWidth="1.2" />
              <circle cx="32" cy="32" r="24" fill="none" stroke="#8a6d1f" strokeWidth="0.7" strokeDasharray="2 3" />
              <path d="M32 14c-6 0-10 4-10 10 0 5 3 8 3 12h14c0-4 3-7 3-12 0-6-4-10-10-10z" fill="#1c1c2e" stroke="#d4af37" strokeWidth="0.9" />
              <path d="M22 42c0 6 4.5 10 10 10s10-4 10-10" fill="none" stroke="#d4af37" strokeWidth="1" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-serifcn text-[16px] font-bold tracking-wider text-parchment-100">{statBlock.名称}</h3>
            <p className="mt-0.5 font-serifcn text-[11.5px] text-ink-200/70">{statBlock.性别}</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-sm border border-gold-400/30 bg-gold-400/8 px-2 py-0.5">
              <Sparkles size={10} className="text-gold-300" aria-hidden="true" />
              <span className="font-serifcn text-[11px] tracking-wide text-gold-200">{statBlock.当前序列}</span>
            </p>
          </div>
        </div>
        <p className="mt-3 border-t border-gold-400/12 pt-2.5 font-serifcn text-[11.5px] leading-relaxed text-ink-200/60">
          晋升体系：{statBlock.晋升体系} · 消化进度 {statBlock.消化进度}%
          <span className="text-blood-500/90"> · 失控 {statBlock.失控进度}%</span>
        </p>
      </section>

      {/* 时间地点 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="时空坐标">
        <p className="mb-2.5 flex items-center gap-2 font-serifcn text-[12px] text-ink-100/85">
          <Clock3 size={13} className="text-gold-400/80" aria-hidden="true" />
          {statBlock.当前时间纪元}
        </p>
        <p className="flex items-start gap-2 font-serifcn text-[12px] leading-relaxed text-ink-100/85">
          <MapPin size={13} className="mt-0.5 shrink-0 text-gold-400/80" aria-hidden="true" />
          <span>
            {statBlock.当前区域} · {statBlock.当前地标}
            <br />
            <span className="text-ink-200/60">{statBlock.当前坐标}</span>
          </span>
        </p>
      </section>

      {/* 六维 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="六维属性">
        <h4 className="panel-title mb-3">六维</h4>
        <div className="space-y-2.5">
          {dims.map((d) => (
            <StatBar key={d.名} label={d.名} current={d.现} max={d.基} danger={d.现 / d.基 < 0.35} />
          ))}
        </div>
      </section>

      {/* 装备槽 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="装备栏">
        <h4 className="panel-title mb-3">装备</h4>
        <div className="grid grid-cols-3 gap-2.5">
          {equipmentSlots.map(({ key, icon: Icon }) => {
            const item = equipment[key]
            return (
              <div key={key} className="group relative rounded-sm border border-gold-400/14 bg-abyss-900/60 p-2.5 text-center transition-all duration-300 hover:border-gold-400/45 hover:shadow-gold-glow-sm">
                <Icon size={15} className="mx-auto mb-1.5 text-gold-400/70" aria-hidden="true" />
                <p className="truncate font-serifcn text-[11px] text-ink-100/85" title={item.名称}>
                  {item.名称}
                </p>
                <p className="diegetic-caption mt-0.5">{item.序列}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 背包摘要 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="随身行囊">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="panel-title">行囊</h4>
          <button
            id="inventory-open-from-sidebar"
            className="flex items-center gap-1 font-serifcn text-[11px] text-gold-300/80 transition-colors hover:text-gold-200"
            onClick={() => openOverlay('inventory')}
          >
            全部 <ChevronRight size={11} aria-hidden="true" />
          </button>
        </div>
        <ul className="space-y-1.5">
          {inventory.slice(0, 4).map((it) => (
            <li key={it.名称} className="flex items-center justify-between gap-2 font-serifcn text-[12px] text-ink-100/80">
              <span className="flex min-w-0 items-center gap-2">
                <Backpack size={11} className="shrink-0 text-gold-400/50" aria-hidden="true" />
                <span className="truncate">{it.名称}</span>
              </span>
              <span className="shrink-0 font-serifen text-[11.5px] text-gold-200/80">{it.数量 ? `×${it.数量}` : '—'}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 阵营声望 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="阵营声望">
        <h4 className="panel-title mb-3">势力</h4>
        <ul className="space-y-2.5">
          {factions.map((f) => (
            <li key={f.名称}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-serifcn text-[12px] text-ink-100/85">{f.名称}</span>
                <span className="diegetic-caption">{f.职位}</span>
              </div>
              <div className="stat-track h-[3px]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-600 to-gold-300"
                  style={{ width: `${Math.min(100, Math.max(4, (f.声望 + 100) / 12))}%` }}
                  aria-hidden="true"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 剧场点数 */}
      <section className="glass-panel corner-frame relative flex items-center justify-between rounded-sm p-4" aria-label="剧场点数">
        <span className="flex items-center gap-2 font-serifcn text-[12px] text-ink-100/85">
          <Crown size={13} className="text-gold-400/80" aria-hidden="true" /> 剧场点数
        </span>
        <span className="font-display text-lg text-gold-200">{statBlock.剧场点数}</span>
      </section>

      {/* 能力摘要 */}
      <section className="glass-panel corner-frame relative rounded-sm p-4" aria-label="非凡能力">
        <h4 className="panel-title mb-2.5">非凡能力</h4>
        <ul className="space-y-2">
          {abilities.map((a) => (
            <li key={a.名称} className="border-l-2 border-gold-400/30 pl-2.5">
              <p className="font-serifcn text-[12.5px] font-medium text-parchment-100">{a.名称}</p>
              <p className="diegetic-caption mt-0.5">{a.类型} · {a.序列来源}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="特质">
          {traits.map((t) => (
            <span key={t.名称} className="rounded-sm border border-gold-400/20 bg-gold-400/6 px-2 py-0.5 font-serifcn text-[10.5px] text-gold-200/80" title={t.描述}>
              {t.名称}
            </span>
          ))}
        </div>
      </section>
    </aside>
  )
}
