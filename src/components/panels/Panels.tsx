import { useState } from 'react'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import {
  Compass, BookOpen, ScrollText, Sparkles, Newspaper, Users, Backpack, Settings, History, Swords,
  MapPin, Clock3, Heart, Shield, Key, ChevronRight,
} from 'lucide-react'
import { Overlay, ConfirmDialog } from '../ui/Overlay'
import { useUI } from '@/store/ui'
import { regions, npcs, inventory, equipment, abilities, traits, chronicle, newspaper, tarotDeck, statBlock, scenes } from '@/data/mock'

/* ================= 世界地图 ================= */
export function MapOverlay() {
  const pushToast = useUI((s) => s.pushToast)
  return (
    <Overlay id="map" title="王国舆图" subtitle="世界地图 · 点击地标安排行程" icon={<Compass size={17} />} width="xl">
      <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <div className="corner-frame relative overflow-hidden rounded-sm border border-gold-400/18">
          <svg viewBox="0 0 640 380" className="w-full" role="img" aria-label="鲁恩王国及周边舆图">
            <rect width="640" height="380" fill="#0b0b14" />
            <path d="M0 240 Q 160 200 320 248 T 640 236 L640 380 L0 380 Z" fill="#080b16" />
            <path d="M0 240 Q 160 200 320 248 T 640 236" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1.2" strokeDasharray="5 5" />
            <path d="M60 80 L220 56 L300 124 L236 216 L104 224 L40 156 Z" fill="#12121f" stroke="rgba(212,175,55,0.45)" strokeWidth="1.4" />
            <path d="M340 68 L480 44 L564 112 L524 192 L392 208 L324 140 Z" fill="#12121f" stroke="rgba(212,175,55,0.45)" strokeWidth="1.4" />
            <path d="M120 280 L240 264 L300 336 L140 356 Z" fill="#10101a" stroke="rgba(212,175,55,0.34)" strokeWidth="1.2" />
            <path d="M460 300 L560 288 L600 348 L480 360 Z" fill="#10101a" stroke="rgba(212,175,55,0.34)" strokeWidth="1.2" />
            {[
              { x: 140, y: 124, t: '贝克兰德', cur: false },
              { x: 192, y: 192, t: '廷根', cur: true },
              { x: 96, y: 240, t: '比格港', cur: false },
              { x: 420, y: 108, t: '特里尔', cur: false },
              { x: 356, y: 300, t: '圣密隆', cur: false },
            ].map((p) => (
              <g key={p.t} className="cursor-pointer" onClick={() => pushToast({ kind: 'info', title: p.t, description: p.cur ? '你正在这里。' : '旅程尚未开始——启程需要一回合。' })}>
                <circle cx={p.x} cy={p.y} r={p.cur ? 5 : 3.2} fill={p.cur ? '#f0d98c' : '#e8e2d0'} className={p.cur ? 'animate-pulse-soft' : ''} />
                {p.cur && <circle cx={p.x} cy={p.y} r={10} fill="none" stroke="rgba(240,217,140,0.5)" strokeWidth="1" />}
                <text x={p.x + 9} y={p.y + 4} fill={p.cur ? '#f0d98c' : 'rgba(232,226,208,0.7)'} fontSize="12" fontFamily="Noto Serif SC, serif">
                  {p.t}
                </text>
              </g>
            ))}
            <text x="500" y="70" fill="rgba(212,175,55,0.4)" fontSize="11" fontFamily="Noto Serif SC, serif">北方冻土</text>
            <text x="470" y="300" fill="rgba(212,175,55,0.35)" fontSize="11" fontFamily="Noto Serif SC, serif">迷雾海</text>
          </svg>
        </div>
        <div className="space-y-3">
          {regions.map((r) => (
            <section key={r.名称} className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-3.5">
              <div className="mb-1.5 flex items-baseline justify-between">
                <h4 className="font-serifcn text-[13.5px] font-semibold tracking-wide text-parchment-100">{r.名称}</h4>
                <span className="diegetic-caption">都城 {r.首都}</span>
              </div>
              <p className="font-serifcn text-[12px] leading-relaxed text-ink-200/65">{r.描述}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.地标.map((lm) => (
                  <span key={lm} className={`rounded-sm border px-2 py-0.5 font-serifcn text-[11px] ${lm === '廷根' ? 'border-gold-300/60 bg-gold-400/12 text-gold-200' : 'border-gold-400/18 text-ink-200/70'}`}>
                    {lm}
                  </span>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Overlay>
  )
}

/* ================= 图鉴 ================= */
export function CompendiumOverlay() {
  const [sel, setSel] = useState<number | null>(null)
  return (
    <Overlay id="compendium" title="图鉴" subtitle="人物 · 物品 · 神秘学知识" icon={<BookOpen size={17} />} width="lg">
      <Tabs.Root defaultValue="people" className="space-y-4">
        <Tabs.List className="flex gap-1.5 rounded-sm border border-gold-400/15 bg-abyss-850/70 p-1" aria-label="图鉴分类">
          {[
            { v: 'people', t: '人物档案' },
            { v: 'items', t: '物品图鉴' },
            { v: 'lore', t: '神秘学知识' },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.v}
              value={tab.v}
              className="flex-1 rounded-sm px-3 py-2 font-serifcn text-[12.5px] tracking-wide text-ink-200/60 transition-all data-[state=active]:bg-gold-400/14 data-[state=active]:text-gold-200 data-[state=active]:shadow-gold-glow-sm"
            >
              {tab.t}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="people">
          <ul className="grid gap-2 md:grid-cols-2">
            {npcs.map((n, i) => (
              <li key={n.名称}>
                <button
                  id={`compendium-npc-${i}`}
                  onClick={() => setSel(sel === i ? null : i)}
                  className="w-full rounded-sm border border-gold-400/14 bg-abyss-850/60 p-3.5 text-left transition-all duration-300 hover:border-gold-400/40 hover:bg-gold-400/5"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-serifcn text-[13.5px] font-semibold text-parchment-100">{n.名称}</span>
                    <span className="diegetic-caption">{n.状态}</span>
                  </div>
                  <p className="mt-1 font-serifcn text-[12px] text-ink-200/70">{n.身份}</p>
                  {sel === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                      <p className="mt-2.5 border-t border-gold-400/12 pt-2.5 font-serifcn text-[12px] leading-relaxed text-ink-200/80">
                        外貌：{n.外貌}
                        <br />
                        性格：{n.性格}
                        <br />
                        近期：{n.事件历史}
                      </p>
                    </motion.div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Tabs.Content>
        <Tabs.Content value="items">
          <ul className="space-y-2">
            {[...Object.values(equipment), ...inventory].map((it, i) => (
              <li key={`${it.名称}-${i}`} className="flex items-start gap-3.5 rounded-sm border border-gold-400/14 bg-abyss-850/60 p-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-gold-400/25 text-gold-300" aria-hidden="true">
                  {it.类型 === '武器' ? <Swords size={14} /> : it.类型 === '消耗品' ? <Sparkles size={14} /> : <Key size={14} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline justify-between gap-2">
                    <span className="font-serifcn text-[13px] font-semibold text-parchment-100">{it.名称}</span>
                    <span className="diegetic-caption shrink-0">{it.序列 ?? '—'}</span>
                  </p>
                  <p className="mt-0.5 font-serifcn text-[12px] leading-relaxed text-ink-200/70">{it.描述}</p>
                </div>
              </li>
            ))}
          </ul>
        </Tabs.Content>
        <Tabs.Content value="lore">
          <div className="space-y-3">
            <section className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-4">
              <h4 className="font-serifcn text-[13.5px] font-semibold text-parchment-100">序列途径</h4>
              <p className="mt-1.5 font-serifcn text-[12px] leading-relaxed text-ink-200/70">
                序列9「入门者」— 通过密契仪式接触不朽边缘。晋升需完成相应扮演法，谨慎规避失控。
              </p>
            </section>
            <section className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-4">
              <h4 className="font-serifcn text-[13.5px] font-semibold text-parchment-100">扮演守则</h4>
              <p className="mt-1.5 font-serifcn text-[12px] leading-relaxed text-ink-200/70">
                扮演并非伪装，而是以自身之躯容纳旧日之影。时刻记住你的名字——人性是最后的锚。
              </p>
            </section>
            <section className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-4">
              <h4 className="font-serifcn text-[13.5px] font-semibold text-parchment-100">隐秘组织</h4>
              <p className="mt-1.5 font-serifcn text-[12px] leading-relaxed text-ink-200/70">
                值夜者守护长夜，塔罗会俯瞰命运，而更深处，还有不可言说的存在注视着一切。
              </p>
            </section>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </Overlay>
  )
}

/* ================= 编年史 ================= */
export function ChronicleOverlay() {
  return (
    <Overlay id="chronicle" title="编年史" subtitle="你的旅途实录 · 按时间归档" icon={<ScrollText size={17} />} width="lg">
      <ol className="relative space-y-5 border-l border-gold-400/20 pl-6">
        {chronicle.map((c) => (
          <li key={c.序号} className="group relative">
            <span aria-hidden="true" className="absolute -left-[31px] top-1.5 grid h-4 w-4 place-items-center rounded-full border border-gold-400/50 bg-abyss-900">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400 transition-transform duration-300 group-hover:scale-150" />
            </span>
            <div className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-4 transition-all duration-300 hover:border-gold-400/40 hover:shadow-gold-glow-sm">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="font-serifcn text-[14px] font-bold tracking-wide text-gold-200">{c.标题}</h4>
                <span className="diegetic-caption shrink-0">经历 #{c.序号}</span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-serifcn text-[11.5px] text-ink-200/60">
                <span className="flex items-center gap-1"><Clock3 size={10} aria-hidden="true" />{c.日期}</span>
                <span className="flex items-center gap-1"><MapPin size={10} aria-hidden="true" />{c.地点}</span>
                <span className="flex items-center gap-1"><Users size={10} aria-hidden="true" />{c.人物}</span>
              </p>
              <p className="mt-2 font-serifcn text-[12.5px] leading-relaxed text-ink-100/85">{c.描述}</p>
              <p className="mt-2 border-t border-gold-400/10 pt-2 font-serifcn text-[11.5px] leading-relaxed text-gold-200/60">
                {c.重要信息}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Overlay>
  )
}

/* ================= 占卜 ================= */
export function DivinationOverlay() {
  const [flipped, setFlipped] = useState<number[]>([])
  const [drawn] = useState(() => [tarotDeck[0], tarotDeck[7], tarotDeck[16]])
  const pushToast = useUI((s) => s.pushToast)

  const flip = (i: number) => {
    if (flipped.includes(i)) return
    setFlipped((f) => [...f, i])
    if (flipped.length === 2) {
      pushToast({ kind: 'success', title: '牌阵已揭示', description: `灵性 -5 · ${drawn.map((d) => d.名称).join('、')}` })
    }
  }

  return (
    <Overlay id="divination" title="占卜" subtitle="塔罗牌阵 · 每次揭示消耗灵性 5" icon={<Sparkles size={17} />} width="md">
      <div className="flex flex-col items-center">
        <div className="relative my-6 flex items-end gap-3" aria-label="三张牌阵">
          {drawn.map((card, i) => (
            <div
              key={card.名称}
              className={`tarot-card h-40 w-[104px] sm:h-44 sm:w-[116px] ${flipped.includes(i) ? 'flipped' : ''}`}
              data-flipped={flipped.includes(i)}
            >
              <button
                id={`tarot-card-${i}`}
                onClick={() => flip(i)}
                aria-label={flipped.includes(i) ? card.名称 : '未揭示的塔罗牌'}
                className="card-face card-back absolute inset-0 grid place-items-center"
              >
                <span aria-hidden="true" className="font-display text-2xl text-gold-400/70">✦</span>
              </button>
              <div className="card-face card-front absolute inset-0 flex flex-col items-center justify-between px-2 py-4" aria-hidden="true">
                <span className="font-display text-xl text-[#6b5418]">{['Ⅰ', 'Ⅷ', 'ⅩⅦ'][i]}</span>
                <span className="font-serifcn text-[15px] font-bold tracking-widest text-[#3a3322]">{card.名称}</span>
                <span className="h-px w-8 bg-[#8a6d1f]/40" />
                <span className="font-serifcn text-[9px] leading-snug text-[#3a3322]/75 text-center">{card.释义.slice(0, 18)}…</span>
              </div>
            </div>
          ))}
        </div>
        <p className="diegetic-caption mb-2">点击牌背，逐一揭示命运的启示</p>
        {flipped.length === 3 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-sm border border-gold-400/18 bg-abyss-850/60 p-4">
            <h4 className="font-serifcn text-[13px] font-semibold text-gold-200">牌阵释义 · 命运之途</h4>
            <p className="mt-2 font-serifcn text-[12.5px] leading-relaxed text-ink-100/85">
              {drawn[0].名称}——{drawn[0].释义} {drawn[1].名称}——{drawn[1].释义} {drawn[2].名称}——{drawn[2].释义}
            </p>
          </motion.div>
        )}
      </div>
    </Overlay>
  )
}

/* ================= 报纸 ================= */
export function NewspaperOverlay() {
  return (
    <Overlay id="newspaper" title="鲁恩日报" subtitle={`廷根晚报 · ${newspaper.日期}`} icon={<Newspaper size={17} />} width="md">
      <article className="parchment relative rounded-sm px-6 py-7">
        <header className="border-b-2 border-[#3a3322]/50 pb-3 text-center">
          <h3 className="font-display text-xl tracking-[0.3em] text-[#2c2515]">廷根晚报</h3>
          <p className="mt-1 font-serifcn text-[11px] tracking-[0.25em] text-[#3a3322]/60">Tingen Evening Post · 创刊于第五纪1287年</p>
        </header>
        <h4 className="mt-5 text-center font-serifcn text-[17px] font-bold leading-relaxed text-[#2c2515]">{newspaper.头条}</h4>
        <p className="mt-3 font-prose text-[14px] leading-[1.9] text-[#37301e]">
          近日，水仙花街一带接连有市民于深夜失踪。治安官已加强夜间巡逻，并提醒广大市民：入夜后请结伴而行，切勿靠近废弃的码头仓库。
          据不愿透露姓名的目击者称，曾在雾中见过"提着旧提灯的人影"……
        </p>
        <div className="mt-5 space-y-1.5 border-t border-[#3a3322]/30 pt-4">
          {newspaper.条目.map((t) => (
            <p key={t.标题} className="font-prose text-[12.5px] leading-relaxed text-[#37301e]/85">
              【{t.版块}】{t.标题}
            </p>
          ))}
        </div>
      </article>
    </Overlay>
  )
}

/* ================= 关系 ================= */
export function RelationOverlay() {
  return (
    <Overlay id="relation" title="人物关系" subtitle="恩怨情仇的账册" icon={<Users size={17} />} width="lg">
      <ul className="grid gap-3 md:grid-cols-2">
        {npcs.map((n) => (
          <li key={n.名称} className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-4 transition-all duration-300 hover:border-gold-400/40">
            <div className="flex items-baseline justify-between">
              <h4 className="font-serifcn text-[14px] font-bold text-parchment-100">{n.名称}</h4>
              <span className="diegetic-caption">{n.关系}</span>
            </div>
            <p className="mt-1 font-serifcn text-[12px] text-ink-200/70">{n.身份}</p>
            <div className="mt-3 flex items-center gap-3">
              <Heart size={13} className="shrink-0 text-red-400/80" aria-hidden="true" />
              <div className="stat-track flex-1">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blood-600 to-red-400" style={{ width: `${Math.min(100, n.好感度 / 1.6)}%` }} aria-hidden="true" />
              </div>
              <span className="font-serifen text-[12px] tabular-nums text-parchment-100/90">{n.好感度}</span>
            </div>
            <p className="mt-3 border-t border-gold-400/10 pt-2.5 font-serifcn text-[11.5px] leading-relaxed text-ink-200/65">{n.事件历史}</p>
          </li>
        ))}
      </ul>
    </Overlay>
  )
}

/* ================= 背包 ================= */
export function InventoryOverlay() {
  const pushToast = useUI((s) => s.pushToast)
  return (
    <Overlay id="inventory" title="行囊" subtitle="随身物品 · 由系统账本记录" icon={<Backpack size={17} />} width="lg">
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {inventory.map((it, i) => (
          <li key={it.名称}>
            <button
              id={`inventory-item-${i}`}
              onClick={() => pushToast({ kind: 'info', title: it.名称, description: it.描述 })}
              className="group w-full rounded-sm border border-gold-400/14 bg-abyss-850/60 p-3.5 text-left transition-all duration-300 hover:border-gold-400/45 hover:bg-gold-400/5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-serifcn text-[13px] font-semibold text-parchment-100">{it.名称}</span>
                <span className="diegetic-caption">{it.数量 ? `× ${it.数量}` : '—'}</span>
              </div>
              <p className="mt-1 font-serifcn text-[12px] leading-relaxed text-ink-200/70">{it.描述}</p>
              {it.状态 && <p className="mt-1.5 font-serifcn text-[11px] text-gold-200/70">状态：{it.状态}</p>}
            </button>
          </li>
        ))}
      </ul>
      <p className="diegetic-caption mt-4 text-center">物品增删由系统账本记录——模型只作叙事声明，无权改写行囊。</p>
    </Overlay>
  )
}

/* ================= 设置 ================= */
export function SettingsOverlay() {
  const pushToast = useUI((s) => s.pushToast)
  const [tier, setTier] = useState('单API档')
  return (
    <Overlay id="settings" title="设置" subtitle="剧场偏好与模型配置" icon={<Settings size={17} />} width="lg">
      <Tabs.Root defaultValue="model" className="space-y-4">
        <Tabs.List className="flex gap-1.5 rounded-sm border border-gold-400/15 bg-abyss-850/70 p-1" aria-label="设置分类">
          {[
            { v: 'model', t: '模型' },
            { v: 'visual', t: '演出' },
            { v: 'interface', t: '界面' },
            { v: 'performance', t: '性能' },
          ].map((tab) => (
            <Tabs.Trigger key={tab.v} value={tab.v} className="flex-1 rounded-sm px-3 py-2 font-serifcn text-[12.5px] tracking-wide text-ink-200/60 transition-all data-[state=active]:bg-gold-400/14 data-[state=active]:text-gold-200">
              {tab.t}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="model" className="space-y-4">
          <section className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-4">
            <h4 className="panel-title mb-3">调用档位</h4>
            <div className="grid gap-2 sm:grid-cols-3">
              {['单API档', '多API档', 'Agent档'].map((t) => (
                <button
                  key={t}
                  id={`tier-${t}`}
                  onClick={() => {
                    setTier(t)
                    pushToast({ kind: 'success', title: '档位已切换', description: `当前：${t}` })
                  }}
                  className={`rounded-sm border px-3 py-3 text-center font-serifcn text-[12.5px] transition-all duration-300 ${
                    tier === t ? 'border-gold-300/70 bg-gold-400/12 text-gold-200 shadow-gold-glow-sm' : 'border-gold-400/18 text-ink-200/70 hover:border-gold-400/40'
                  }`}
                >
                  {t}
                  <p className="mt-1 text-[10.5px] text-ink-300/70">
                    {{ 单API档: '每回合 1 次调用', 多API档: '正文与变量分流', Agent档: '工具调用 · 上限可调' }[t]}
                  </p>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-4">
            <h4 className="panel-title mb-3">API 配置</h4>
            {['主线模型', '变量模型', '记忆检索'].map((m) => (
              <div key={m} className="mb-2.5 flex items-center gap-3">
                <label htmlFor={`api-${m}`} className="w-20 shrink-0 font-serifcn text-[12px] text-ink-100/80">
                  {m}
                </label>
                <input
                  id={`api-${m}`}
                  type="text"
                  placeholder={m === '主线模型' ? 'gemini-3-pro' : m === '变量模型' ? '未启用（同主线）' : '未启用'}
                  className="min-w-0 flex-1 rounded-sm border border-gold-400/18 bg-abyss-900/70 px-3 py-2 font-mono text-[12px] text-parchment-100 placeholder:text-ink-400/40 focus:border-gold-400/50 focus:outline-none"
                />
              </div>
            ))}
            <p className="diegetic-caption mt-2">密钥仅保存在本机浏览器，绝不离开你的设备。</p>
          </section>
        </Tabs.Content>
        <Tabs.Content value="visual" className="space-y-3">
          <ToggleRow id="visual-image-mode" label="演出模式" desc="高图 / 低图 / 纯文字" />
          <ToggleRow id="visual-diegetic" label="文档美化" desc="信件、报纸以羊皮纸版式渲染" />
          <ToggleRow id="visual-anim" label="微交互动画" desc="悬停、涟漪与转场效果" />
        </Tabs.Content>
        <Tabs.Content value="interface" className="space-y-3">
          <ToggleRow id="iface-font" label="现代排版" desc="衬线字体与字距微调" />
          <ToggleRow id="iface-panels" label="侧栏常驻" desc="PC 端三栏布局（关闭后为沉浸式）" />
        </Tabs.Content>
        <Tabs.Content value="performance" className="space-y-3">
          <ToggleRow id="perf-stream" label="流式渲染" desc="正文逐字呈现" />
          <ToggleRow id="perf-stars" label="星空粒子" desc="背景粒子系统（低端设备可关）" />
          <ToggleRow id="perf-reduce" label="减少动态" desc="关闭大部分动画" />
        </Tabs.Content>
      </Tabs.Root>
    </Overlay>
  )
}

function ToggleRow({ id, label, desc }: { id: string; label: string; desc: string }) {
  const [on, setOn] = useState(true)
  return (
    <button
      id={id}
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className="flex w-full items-center justify-between rounded-sm border border-gold-400/14 bg-abyss-850/60 px-4 py-3 text-left transition-all hover:border-gold-400/35"
    >
      <span>
        <span className="block font-serifcn text-[13px] text-ink-100/90">{label}</span>
        <span className="diegetic-caption mt-0.5 block">{desc}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-5 w-10 shrink-0 rounded-full border transition-colors duration-300 ${on ? 'border-gold-400/60 bg-gold-400/20' : 'border-gold-400/20 bg-abyss-800'}`}
      >
        <span
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all duration-300 ${on ? 'left-[22px] bg-gold-300' : 'left-1 bg-ink-400/60'}`}
        />
      </span>
    </button>
  )
}

/* ================= 存档 ================= */
export function SaveOverlay() {
  const pushToast = useUI((s) => s.pushToast)
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <Overlay id="save" title="档案馆" subtitle="节点树存档 · 回溯与分支" icon={<History size={17} />} width="md">
      <div className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-4">
        <h4 className="panel-title mb-4">时间线</h4>
        <ol className="relative space-y-4 border-l border-gold-400/20 pl-5">
          {[
            { t: '序幕 · 异乡人', d: '第五纪1349年6月28日', cur: true },
            { t: '第一章 · 值夜者', d: '尚未展开', cur: false },
          ].map((n, i) => (
            <li key={n.t} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-[25px] top-1 h-3 w-3 rounded-full border ${n.cur ? 'border-gold-300 bg-gold-400/50 shadow-gold-glow-sm' : 'border-gold-400/30 bg-abyss-900'}`}
              />
              <div className={`rounded-sm border p-3 ${n.cur ? 'border-gold-400/40 bg-gold-400/6' : 'border-gold-400/12 bg-abyss-900/50'}`}>
                <p className="font-serifcn text-[13px] font-semibold text-parchment-100">
                  {n.t} {n.cur && <span className="ml-2 text-[10.5px] text-gold-300">当前节点</span>}
                </p>
                <p className="diegetic-caption mt-0.5">{n.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex gap-2.5">
          <button id="save-rollback" className="btn-ghost flex-1 rounded-sm px-4 py-2.5 text-[12.5px]" onClick={() => setConfirmOpen(true)}>
            回滚上一节点
          </button>
          <button id="save-export" className="btn-seal flex-1 rounded-sm px-4 py-2.5 text-[12.5px]" onClick={() => pushToast({ kind: 'success', title: '存档已导出', description: '世界快照不含图片资产。' })}>
            导出世界快照
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>
          pushToast({ kind: 'warning', title: '时光回溯', description: '已回到上一节点（原型演示）。' })
        }
        title="回滚存档"
        description="回滚将抹去当前节点之后的所有演出。此操作不可撤销，确定要翻回上一页吗？"
        confirmLabel="翻回"
        danger
      />
    </Overlay>
  )
}

/* ================= 战术棋盘 ================= */
export function BattleOverlay() {
  const pushToast = useUI((s) => s.pushToast)
  return (
    <Overlay id="battle" title="战术棋盘" subtitle="规则演算 · 战报演绎 · 筹备中" icon={<Swords size={17} />} width="lg">
      <div className="space-y-4">
        <div className="corner-frame relative overflow-hidden rounded-sm border border-gold-400/18 p-4">
          <div className="grid grid-cols-6 gap-1.5" role="grid" aria-label="战术棋盘">
            {Array.from({ length: 36 }).map((_, i) => {
              const terrain = i === 7 || i === 8 || i === 13 || i === 14 ? 'bg-gold-400/10 border-gold-400/30' : i === 21 ? 'bg-blood-500/10 border-blood-500/40' : 'border-gold-400/10 bg-abyss-900/60'
              const unit = i === 15 ? '古' : i === 20 ? '敌' : i === 9 ? '邓' : ''
              return (
                <button
                  key={i}
                  id={`battle-cell-${i}`}
                  role="gridcell"
                  aria-label={`棋盘格 ${i + 1}${unit ? `，${unit}在此` : ''}`}
                  onClick={() => unit && pushToast({ kind: 'info', title: unit === '古' ? '古弈 · 序列9 入门者' : unit === '邓' ? '邓恩 · 友方' : '未知敌对者', description: '点击目标后选择能力（原型演示）。' })}
                  className={`relative aspect-square rounded-sm border ${terrain} grid place-items-center font-serifcn text-[13px] text-parchment-100 transition-all hover:border-gold-400/60 hover:bg-gold-400/8 ${unit ? 'cursor-pointer' : ''}`}
                >
                  {unit}
                </button>
              )
            })}
          </div>
          <p className="diegetic-caption mt-3 text-center">地形与单位仅供参考 · 判定由前端规则演算，AI 仅演绎战报</p>
        </div>
        <div className="rounded-sm border border-gold-400/14 bg-abyss-850/60 p-4">
          <h4 className="panel-title mb-2">能力白名单</h4>
          <div className="flex flex-wrap gap-2">
            {abilities.map((a) => (
              <span key={a.名称} className="rounded-sm border border-gold-400/25 bg-abyss-900/70 px-3 py-1.5 font-serifcn text-[12px] text-gold-200/90">
                {a.名称}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Overlay>
  )
}
