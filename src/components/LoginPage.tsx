import { motion } from 'framer-motion'
import { useUI } from '@/store/ui'

/** 登录页 —— 剧场舞台布景：横楣灯牌、聚光灯、天鹅绒侧幕、金色流苏 */
export function LoginPage({ decorative = false }: { decorative?: boolean }) {
  const enterGame = useUI((s) => s.enterGame)
  const pushToast = useUI((s) => s.pushToast)
  const openOverlay = useUI((s) => s.openOverlay)

  const noop = () => {}

  return (
    <main
      className={`relative flex h-full flex-col items-center justify-center overflow-hidden ${decorative ? 'pointer-events-none' : ''}`}
      id="login-page"
    >
      <div className="spotlight left-1/2 -translate-x-1/2" aria-hidden="true" />
      <div className="stage-floor absolute inset-x-0 bottom-0 h-[26%]" aria-hidden="true" />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-gold-600/50 via-gold-400/30 to-transparent md:w-5" />
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-gold-600/50 via-gold-400/30 to-transparent md:w-5" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        {/* 徽记 —— 塔罗式星盘 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-7 h-28 w-28"
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" className="animate-spin-slow h-full w-full">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#d4af37" strokeWidth="1.2" strokeDasharray="3 4" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="#d4af37" strokeWidth="0.8" />
            <path d="M50 8v24M50 68v24M8 50h24M68 50h24" stroke="#d4af37" strokeWidth="0.9" />
            <path d="M20 20l17 17M63 63l17 17M80 20L63 37M37 63L20 80" stroke="#8a6d1f" strokeWidth="0.7" />
            <circle cx="50" cy="50" r="7" fill="#d4af37" opacity="0.9" />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display text-xl text-gold-300">愚</span>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9 }}
          className="gold-glow-text font-display text-4xl tracking-[0.18em] md:text-5xl"
        >
          诡秘剧场
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.9 }}
          className="mt-2 font-serifen text-[11px] uppercase tracking-[0.42em] text-ink-200/55"
        >
          Lord of Mysteries Theatre
        </motion.p>

        <motion.nav
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.9 }}
          className="mt-10 flex w-full flex-col gap-3.5"
          aria-label="主菜单"
        >
          <button
            id="login-new-journey"
            className="btn-seal ink-ripple rounded-sm px-6 py-3.5 text-[15px]"
            onClick={decorative ? noop : () => {
              pushToast({ kind: 'info', title: '序幕将启', description: '正在为你布置舞台……' })
              enterGame()
            }}
          >
            开始新的旅程
          </button>
          <button
            id="login-continue"
            className="btn-ghost rounded-sm px-6 py-3.5 text-[14px]"
            onClick={decorative ? noop : () =>
              pushToast({ kind: 'warning', title: '暂无可用存档', description: '档案馆尚在筹备之中，请先开启一段旅程。' })
            }
          >
            继续上次的冒险
          </button>
          <button
            id="login-archive"
            className="btn-ghost rounded-sm px-6 py-3.5 text-[14px]"
            onClick={decorative ? noop : () =>
              pushToast({ kind: 'info', title: '档案馆', description: '档案陈列室即将开放。' })
            }
          >
            档案馆
          </button>
          <button id="login-settings" className="btn-ghost rounded-sm px-6 py-3.5 text-[14px]" onClick={decorative ? noop : () => openOverlay('settings')}>
            设置
          </button>
        </motion.nav>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 1 }}
          className="mt-12 w-full text-center"
        >
          <div className="filigree-divider mb-3">
            <span className="text-[10px] tracking-[0.3em] text-gold-400/50">更新公告</span>
          </div>
          <p className="font-serifcn text-[12px] leading-relaxed text-ink-200/50">
            剧院正在排练新一幕：世界演化的齿轮已开始转动。
            <br />
            本轮公测版本 · 第〇幕《异乡人》
          </p>
        </motion.footer>
      </div>
    </main>
  )
}
