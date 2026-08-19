import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronDown, Feather } from 'lucide-react'
import { openingNarrative, scenes } from '@/data/mock'

/** 思维链折叠面板 —— 默认折叠，点击展开（diegetic：藏在正文之下的"导演手记"） */
export function ThinkingCollapse({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-3 overflow-hidden rounded-sm border border-gold-400/12 bg-abyss-900/60">
      <button
        id="thinking-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-gold-400/5"
      >
        <Brain size={13} className="text-gold-400/70" aria-hidden="true" />
        <span className="diegetic-caption">幕后手记</span>
        <ChevronDown
          size={13}
          className={`ml-auto text-gold-400/60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <motion.pre
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-h-56 overflow-y-auto whitespace-pre-wrap border-t border-gold-400/10 px-4 py-3 font-mono text-[11px] leading-relaxed text-ink-200/55"
        >
          {text}
        </motion.pre>
      )}
    </div>
  )
}

/** 正文卡片 —— 羊皮纸书页，段落渲染 */
export function MessageBlock() {
  const { 场景, 正文 } = openingNarrative
  const paragraphs = 正文.split('\n\n')
  return (
    <article className="parchment relative rounded-sm px-6 py-7 md:px-9" id="message-block">
      <header className="mb-5 border-b border-[#3a3322]/25 pb-3">
        <h3 className="font-serifcn text-[16px] font-bold tracking-wider text-[#2c2515]">【{场景}】</h3>
      </header>
      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="font-prose text-[15.5px] leading-[1.95] tracking-wide text-[#37301e] md:text-[16.5px]">
            {p}
          </p>
        ))}
      </div>
      <footer className="mt-6 flex items-center justify-between border-t border-[#3a3322]/25 pt-3">
        <span className="flex items-center gap-1.5 font-serifcn text-[11px] text-[#3a3322]/60">
          <Feather size={11} aria-hidden="true" /> 第五纪1349年6月28日 · 鲁恩王国 廷根市
        </span>
        <span className="font-serifen text-[11px] italic text-[#3a3322]/50">Round I</span>
      </footer>
    </article>
  )
}

/** 建议选项卡片 */
export function ActionCards({ onPick }: { onPick: (option: string) => void }) {
  return (
    <div className="grid gap-2 md:grid-cols-2" role="listbox" aria-label="建议选项">
      {openingNarrative.选项.map((opt, i) => (
        <motion.button
          key={opt}
          role="option"
          aria-selected={false}
          id={`action-option-${i}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 + i * 0.09, duration: 0.5 }}
          onClick={() => onPick(opt)}
          className="group ink-ripple relative overflow-hidden rounded-sm border border-gold-400/15 bg-abyss-850/80 px-4 py-3 text-left transition-all duration-300 hover:border-gold-400/45 hover:bg-gold-400/8 hover:shadow-gold-glow-sm"
        >
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[2.5px] bg-gold-400/0 transition-colors group-hover:bg-gold-400/80" />
          <span className="flex items-center gap-2.5">
            <span aria-hidden="true" className="font-display text-[11px] text-gold-400/60">
              {['I', 'II', 'III', 'IV'][i] ?? i + 1}
            </span>
            <span className="font-serifcn text-[13.5px] tracking-wide text-ink-100/90 group-hover:text-parchment-100">
              {opt}
            </span>
          </span>
        </motion.button>
      ))}
    </div>
  )
}

/** 输入区 —— 快捷指令 + 自由输入 + 发送 */
export function ChatInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState('')
  const quick = [
    { label: '观察', icon: '眼' },
    { label: '占卜', icon: '卦' },
    { label: '地图', icon: '图' },
    { label: '背包', icon: '囊' },
  ]
  return (
    <form
      id="chat-input-form"
      className="glass-panel rounded-sm p-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) return
        onSubmit(value.trim())
        setValue('')
      }}
    >
      <div className="mb-2.5 flex flex-wrap gap-2" aria-label="快捷指令">
        {quick.map((q) => (
          <button
            key={q.label}
            type="button"
            id={`quick-command-${q.label}`}
            onClick={() => setValue((v) => (v ? `${v} ${q.label}` : q.label))}
            className="btn-ghost rounded-sm px-3 py-1 text-[11.5px]"
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2.5">
        <textarea
          id="chat-input"
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="写下你的行动，或点击上方快捷指令……"
          aria-label="行动输入"
          className="max-h-28 min-h-[42px] flex-1 resize-none rounded-sm border border-gold-400/15 bg-abyss-900/70 px-4 py-2.5 font-serifcn text-[14px] leading-relaxed text-parchment-100 placeholder:text-ink-400/50 focus:border-gold-400/50 focus:outline-none focus:ring-1 focus:ring-gold-400/30"
        />
        <button id="chat-send" type="submit" className="btn-seal rounded-sm px-6 py-2.5 text-[13px]">
          行动
        </button>
      </div>
    </form>
  )
}

/** 场景插画 —— 纯 SVG 的维多利亚剪影（无图片资产，保证加载速度） */
export function SceneIllustration({ sceneId }: { sceneId: string }) {
  const scene = scenes.find((s) => s.id === sceneId) ?? scenes[0]
  const variant = sceneId === 'bookshop' ? 'bookshop' : sceneId === 'church' ? 'church' : 'reception'
  return (
    <figure className="relative h-full w-full overflow-hidden" id={`scene-illustration-${sceneId}`} aria-label={scene.名称}>
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img">
        <defs>
          <linearGradient id={`bg-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c0c16" />
            <stop offset="100%" stopColor="#07070d" />
          </linearGradient>
          <radialGradient id={`lamp-${variant}`} cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(240,217,140,0.34)" />
            <stop offset="55%" stopColor="rgba(212,175,55,0.07)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="800" height="500" fill={`url(#bg-${variant})`} />
        {/* 月光窗 */}
        <rect x="560" y="70" width="150" height="230" rx="60" fill="rgba(240,217,140,0.06)" stroke="rgba(212,175,55,0.3)" strokeWidth="2" />
        <line x1="635" y1="70" x2="635" y2="300" stroke="rgba(212,175,55,0.25)" strokeWidth="2" />
        <line x1="560" y1="185" x2="710" y2="185" stroke="rgba(212,175,55,0.25)" strokeWidth="2" />
        {/* 吊灯 */}
        <g opacity="0.9">
          <line x1="400" y1="0" x2="400" y2="80" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" />
          <ellipse cx="400" cy="92" rx="26" ry="14" fill="none" stroke="#d4af37" strokeWidth="1.4" opacity="0.65" />
          <circle cx="400" cy="95" r="6" fill="#f0d98c" opacity="0.9" />
          <rect x="0" y="0" width="800" height="300" fill={`url(#lamp-${variant})`} />
        </g>
        {variant === 'reception' && (
          <g>
            {/* 高背椅与办公桌 */}
            <rect x="180" y="300" width="300" height="14" rx="4" fill="rgba(212,175,55,0.16)" />
            <rect x="205" y="314" width="10" height="120" fill="rgba(212,175,55,0.14)" />
            <rect x="445" y="314" width="10" height="120" fill="rgba(212,175,55,0.14)" />
            <path d="M120 300 Q200 250 330 300 L330 380 Q200 340 120 380 Z" fill="rgba(20,20,34,0.9)" stroke="rgba(212,175,55,0.22)" />
            <path d="M470 300 Q540 260 680 300 L680 380 Q540 340 470 380 Z" fill="rgba(18,18,30,0.9)" stroke="rgba(212,175,55,0.18)" />
            {/* 墙上的画 */}
            <rect x="330" y="120" width="140" height="95" fill="rgba(14,14,24,0.9)" stroke="rgba(212,175,55,0.35)" strokeWidth="2" />
            <circle cx="400" cy="162" r="22" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1.4" />
          </g>
        )}
        {variant === 'bookshop' && (
          <g>
            {/* 书架阵列 */}
            {[80, 220, 480, 620].map((x) => (
              <g key={x}>
                <rect x={x} y="120" width="120" height="300" rx="3" fill="rgba(16,16,26,0.92)" stroke="rgba(212,175,55,0.22)" strokeWidth="1.6" />
                {[0, 1, 2, 3, 4].map((r) => (
                  <line key={r} x1={x + 10} y1={165 + r * 55} x2={x + 110} y2={165 + r * 55} stroke="rgba(212,175,55,0.16)" strokeWidth="1.4" />
                ))}
                {[0, 1, 2, 3, 4].map((r) =>
                  [0, 1, 2, 3].map((b) => (
                    <rect
                      key={`${r}-${b}`}
                      x={x + 14 + b * 25}
                      y={132 + r * 55}
                      width="17"
                      height="30"
                      fill={['rgba(139,0,0,0.35)', 'rgba(212,175,55,0.22)', 'rgba(90,100,130,0.3)', 'rgba(70,90,70,0.3)'][(r + b) % 4]}
                      rx="1"
                    />
                  ))
                )}
              </g>
            ))}
            {/* 柜台与灰猫 */}
            <rect x="340" y="330" width="150" height="90" rx="4" fill="rgba(20,18,30,0.95)" stroke="rgba(212,175,55,0.25)" strokeWidth="1.5" />
            <ellipse cx="415" cy="340" rx="26" ry="12" fill="rgba(60,60,80,0.85)" />
          </g>
        )}
        {variant === 'church' && (
          <g>
            {/* 彩窗与圣坛 */}
            <path d="M300 60 Q400 10 500 60 L500 250 L300 250 Z" fill="rgba(139,0,0,0.16)" stroke="rgba(212,175,55,0.4)" strokeWidth="2.4" />
            <path d="M400 60 L400 250 M300 130 L500 130" stroke="rgba(212,175,55,0.3)" strokeWidth="1.6" />
            <rect x="260" y="300" width="280" height="20" rx="4" fill="rgba(212,175,55,0.18)" />
            <rect x="290" y="320" width="12" height="110" fill="rgba(212,175,55,0.14)" />
            <rect x="498" y="320" width="12" height="110" fill="rgba(212,175,55,0.14)" />
            <path d="M400 330 L470 360 L400 460 L330 360 Z" fill="rgba(24,16,34,0.85)" stroke="rgba(212,175,55,0.3)" strokeWidth="1.6" />
            <circle cx="400" cy="372" r="12" fill="none" stroke="rgba(240,217,140,0.5)" strokeWidth="1.6" />
          </g>
        )}
        {/* 地面雾气 */}
        <rect x="0" y="430" width="800" height="70" fill="rgba(120,120,160,0.05)" />
      </svg>
      <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent px-6 pb-5 pt-14">
        <p className="font-serifcn text-[15px] font-semibold tracking-wider text-parchment-100">{scene.名称}</p>
        <p className="mt-1 font-serifcn text-[12px] leading-relaxed text-ink-200/70">{scene.描述}</p>
      </figcaption>
    </figure>
  )
}
