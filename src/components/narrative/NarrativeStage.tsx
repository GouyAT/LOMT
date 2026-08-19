import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Compass, ArrowLeft, X } from 'lucide-react'
import { useUI } from '@/store/ui'
import { openingNarrative, scenes } from '@/data/mock'
import { ThinkingCollapse, MessageBlock, ActionCards, ChatInput, SceneIllustration } from './NarrativeBlocks'

/** 叙事舞台 —— 三态切换：窄条叙事 ⇄ 全屏阅读 ⇄ 探索热区 */
export function NarrativeStage() {
  const mode = useUI((s) => s.narrativeMode)
  const setMode = useUI((s) => s.setNarrativeMode)
  const pushToast = useUI((s) => s.pushToast)

  const handlePick = (opt: string) => pushToast({ kind: 'info', title: '行动已选定', description: opt })
  const handleSubmit = (text: string) => pushToast({ kind: 'success', title: '帷幕再启', description: `你的行动：${text}` })

  return (
    <section className="relative flex h-full min-h-0 flex-col" id="narrative-stage" aria-label="叙事舞台">
      {/* 模式切换工具条 */}
      <div className="mb-3 flex items-center justify-between" role="toolbar" aria-label="演出模式">
        <div className="flex items-center gap-2 overflow-hidden rounded-sm border border-gold-400/15 bg-abyss-850/70 p-1">
          <ModeButton id="mode-narrow" active={mode === 'narrow'} onClick={() => setMode('narrow')} icon={<span aria-hidden="true" className="font-serifcn text-[11px]">幕</span>} label="窄条叙事" />
          <ModeButton id="mode-read" active={mode === 'read'} onClick={() => setMode('read')} icon={<Maximize2 size={12} aria-hidden="true" />} label="全屏阅读" />
          <ModeButton id="mode-explore" active={mode === 'explore'} onClick={() => setMode('explore')} icon={<Compass size={12} aria-hidden="true" />} label="场景探索" />
        </div>
        <span className="diegetic-caption hidden md:inline">第〇幕 · 异乡人</span>
      </div>

      {/* 窄条叙事（默认） */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-2 pr-1">
        <ThinkingCollapse text={openingNarrative.thinking} />
        <MessageBlock />
        <ActionCards onPick={handlePick} />
      </div>
      <div className="pt-3">
        <ChatInput onSubmit={handleSubmit} />
      </div>

      {/* 全屏阅读 */}
      <AnimatePresence>
        {mode === 'read' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-30 flex flex-col bg-abyss-950/97"
            id="read-mode-overlay"
          >
            <header className="flex items-center justify-between px-6 py-4">
              <span className="panel-title">克莱恩的神秘学笔记</span>
              <button id="read-mode-exit" className="btn-ghost flex items-center gap-2 rounded-sm px-4 py-2 text-[12.5px]" onClick={() => setMode('narrow')}>
                <ArrowLeft size={14} aria-hidden="true" /> 返回剧场
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 md:px-16">
              <div className="mx-auto max-w-3xl">
                <div className="parchment relative rounded-sm px-8 py-10 md:px-14 md:py-14">
                  <p className="mb-8 text-center font-serifcn text-[12px] tracking-[0.3em] text-[#3a3322]/50">第十五页</p>
                  <h2 className="mb-7 text-center font-serifcn text-xl font-bold tracking-widest text-[#2c2515]">
                    {openingNarrative.场景}
                  </h2>
                  <div className="space-y-5">
                    {openingNarrative.正文.split('\n\n').map((p, i) => (
                      <p key={i} className="font-prose text-[17px] leading-[2.05] tracking-wide text-[#37301e]">
                        {i === 0 ? (
                          <>
                            <span className="float-left mr-3 mt-1 font-display text-[42px] leading-[0.85] text-[#6b5418]">
                              {p[0]}
                            </span>
                            {p.slice(1)}
                          </>
                        ) : (
                          p
                        )}
                      </p>
                    ))}
                  </div>
                  <footer className="mt-10 flex items-center justify-between border-t border-[#3a3322]/25 pt-4">
                    <span className="font-serifcn text-[12px] text-[#3a3322]/60">—— 记于廷根市，水仙花街</span>
                    <span className="font-serifen text-[12px] italic text-[#3a3322]/45">1349.VI.28</span>
                  </footer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 探索热区 */}
      <AnimatePresence>
        {mode === 'explore' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-abyss-950"
            id="explore-mode-overlay"
          >
            <div className="relative h-full w-full">
              <SceneIllustration sceneId="reception" />
              {/* 热区按钮 */}
              <div className="absolute inset-0" aria-label="场景热区">
                {scenes[0].热区.map((hz, i) => (
                  <motion.button
                    key={hz}
                    id={`hotspot-${i}`}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.15, type: 'spring', damping: 18 }}
                    onClick={() => pushToast({ kind: 'info', title: `走近${hz}`, description: '你的目光落向那里——' })}
                    className={`group absolute ${[
                      'left-[18%] top-[58%]',
                      'left-[62%] top-[48%]',
                      'left-[42%] top-[30%]',
                      'left-[82%] top-[66%]',
                    ][i]}`}
                    aria-label={`探索热区：${hz}`}
                  >
                    <span className="flex flex-col items-center gap-1.5">
                      <span className="grid h-9 w-9 place-items-center rounded-full border border-gold-400/50 bg-abyss-900/70 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-gold-300 group-hover:shadow-gold-glow-sm">
                        <span aria-hidden="true" className="font-serifcn text-[11px] text-gold-200">探</span>
                      </span>
                      <span className="rounded-sm bg-black/70 px-2 py-0.5 font-serifcn text-[11px] text-parchment-100/90">{hz}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
              {/* 顶部返回 */}
              <button
                id="explore-mode-exit"
                className="btn-ghost absolute right-4 top-4 z-10 flex items-center gap-2 rounded-sm px-4 py-2 text-[12.5px]"
                onClick={() => setMode('narrow')}
              >
                <X size={14} aria-hidden="true" /> 返回剧场
              </button>
              {/* 底部缩略文本条 */}
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-6 pb-6 pt-16">
                <p className="font-serifcn text-[13px] leading-relaxed text-ink-100/85 line-clamp-2">
                  {openingNarrative.正文.split('\n\n')[0]}
                </p>
                <button
                  id="explore-read-more"
                  className="mt-2 font-serifcn text-[11.5px] tracking-widest text-gold-300/80 underline-offset-4 hover:underline"
                  onClick={() => setMode('read')}
                >
                  展开阅读全文
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function ModeButton({
  id,
  active,
  onClick,
  icon,
  label,
}: {
  id: string
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[11.5px] tracking-wide transition-all duration-300 ${
        active ? 'bg-gold-400/15 text-gold-200 shadow-gold-glow-sm' : 'text-ink-200/60 hover:bg-gold-400/6 hover:text-ink-100'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
