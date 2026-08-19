import * as Toast from '@radix-ui/react-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertTriangle, Info, XCircle } from 'lucide-react'
import { useUI } from '@/store/ui'

const kindMap = {
  success: { icon: Check, color: 'text-gold-300', bar: 'bg-gold-400' },
  warning: { icon: AlertTriangle, color: 'text-gold-200', bar: 'bg-gold-300' },
  danger: { icon: XCircle, color: 'text-red-400', bar: 'bg-blood-500' },
  info: { icon: Info, color: 'text-ink-100', bar: 'bg-ink-300' },
} as const

/** 内部通知系统 —— 右上角羊皮纸卷轴样式堆叠 */
export function ToastHost() {
  const toasts = useUI((s) => s.toasts)
  const dismiss = useUI((s) => s.dismissToast)

  return (
    <Toast.Provider swipeDirection="right">
      <AnimatePresence>
        {toasts.map((t) => {
          const cfg = kindMap[t.kind]
          const Icon = cfg.icon
          return (
            <Toast.Root key={t.id} asChild forceMount onOpenChange={(o) => !o && dismiss(t.id)}>
              <motion.div
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="pointer-events-auto fixed right-4 top-4 z-[70] w-[min(92vw,340px)] overflow-hidden"
              >
                <div className="parchment-dark corner-frame relative rounded-sm px-4 py-3">
                  <div className={`absolute bottom-0 left-0 top-0 w-[3px] ${cfg.bar}`} aria-hidden="true" />
                  <div className="flex items-start gap-3 pl-2">
                    <Icon size={16} className={`mt-0.5 shrink-0 ${cfg.color}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <Toast.Title className="font-serifcn text-[13px] font-semibold text-parchment-100">{t.title}</Toast.Title>
                      {t.description && (
                        <Toast.Description className="mt-0.5 font-serifcn text-[12px] leading-snug text-ink-200/75">
                          {t.description}
                        </Toast.Description>
                      )}
                    </div>
                    <Toast.Close asChild>
                      <button
                        id={`toast-close-${t.id}`}
                        aria-label="关闭通知"
                        className="rounded p-1 text-ink-300 transition-colors hover:text-parchment-100"
                      >
                        <XCircle size={14} aria-hidden="true" />
                      </button>
                    </Toast.Close>
                  </div>
                </div>
              </motion.div>
            </Toast.Root>
          )
        })}
      </AnimatePresence>
      <Toast.Viewport className="pointer-events-none fixed right-0 top-0 z-[70] h-0 w-full" />
    </Toast.Provider>
  )
}
