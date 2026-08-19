import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Starfield } from './Starfield'
import { LoginPage } from './LoginPage'
import { useUI } from '@/store/ui'

/** 开场序列 —— 星空标题 → 点击 → 星空幕布自中间分开 → 剧场帷幕拉开 → 舞台亮相 */
export function OpeningSequence() {
  const setStage = useUI((s) => s.setStage)
  const [phase, setPhase] = useState<'title' | 'split' | 'curtain'>('title')

  return (
    <div className="fixed inset-0 overflow-hidden bg-abyss-950" role="presentation">
      {/* 底层：舞台（帷幕拉开后显现） */}
      <div className="absolute inset-0">
        <div className="stage-floor absolute inset-x-0 bottom-0 h-[30%]" aria-hidden="true" />
        <div className="spotlight left-1/2 -translate-x-1/2" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 flex justify-center pt-[11vh]">
          <div className="marquee-light flex items-center gap-4 rounded-sm border px-8 py-3">
            <span className="font-display text-lg tracking-[0.3em] text-gold-200 md:text-2xl">诡秘剧场</span>
            <span className="hidden font-serifen text-[11px] uppercase tracking-[0.4em] text-gold-400/70 md:inline">
              Lord of Mysteries Theatre
            </span>
          </div>
        </div>
        <motion.div
          aria-hidden="true"
          className="curtain absolute inset-y-0 left-0 w-1/2"
          initial={{ x: '-101%' }}
          animate={phase === 'curtain' ? { x: '-101%', opacity: 0 } : { x: 0 }}
          transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
        />
        <motion.div
          aria-hidden="true"
          className="curtain absolute inset-y-0 right-0 w-1/2"
          initial={{ x: '101%' }}
          animate={phase === 'curtain' ? { x: '101%', opacity: 0 } : { x: 0 }}
          transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
        />
      </div>

      {/* 上层：星空幕布（点击后自中间分开） */}
      <AnimatePresence>
        {phase !== 'curtain' && (
          <motion.div key="starshroud" className="absolute inset-0 z-10" exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <div className="absolute inset-0 bg-gradient-to-b from-abyss-950 via-abyss-900 to-abyss-850" />
            <Starfield />
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1/2 bg-abyss-950"
              initial={{ x: 0 }}
              animate={phase === 'split' ? { x: '-100%' } : { x: 0 }}
              transition={{ duration: 0.85, ease: [0.7, 0, 0.3, 1] }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-1/2 bg-abyss-950"
              initial={{ x: 0 }}
              animate={phase === 'split' ? { x: '100%' } : { x: 0 }}
              transition={{ duration: 0.85, ease: [0.7, 0, 0.3, 1] }}
              onAnimationComplete={() => {
                if (phase === 'split') setPhase('curtain')
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 标题层 */}
      <AnimatePresence>
        {phase === 'title' && (
          <motion.button
            key="title"
            type="button"
            id="opening-title-trigger"
            aria-label="点击启幕"
            onClick={() => setPhase('split')}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-20 grid cursor-pointer place-items-center bg-transparent"
          >
            <div className="flex flex-col items-center gap-5 px-6 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                className="gold-glow-text font-display text-5xl tracking-[0.22em] md:text-7xl"
              >
                诡秘剧场
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 1.2 }}
                className="font-serifen text-xs uppercase tracking-[0.5em] text-ink-200/60 md:text-sm"
              >
                Lord of Mysteries · Theatre
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 1 }}
                className="filigree-divider w-64 md:w-96"
              >
                <span className="h-1.5 w-1.5 rotate-45 border border-gold-400/60" aria-hidden="true" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.3, duration: 1 }}
                className="animate-pulse-soft font-serifcn text-sm tracking-[0.3em] text-gold-200/70"
              >
                轻触帷幕 · 启幕
              </motion.p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 帷幕拉开完成 → 切换至登录舞台 */}
      {phase === 'curtain' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.55, duration: 0.7 }}
          onAnimationComplete={() => setStage('login')}
          className="absolute inset-0 z-20"
          aria-hidden="true"
        >
          <LoginPage decorative />
        </motion.div>
      )}
    </div>
  )
}
