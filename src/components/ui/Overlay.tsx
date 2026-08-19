import { useEffect, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useUI } from '@/store/ui'

interface OverlayProps {
  id: string
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  width?: 'md' | 'lg' | 'xl'
}

/** 剧场幕帘模态 —— PC 从右侧滑入的档案卷宗，移动端自底部升起的抽屉 */
export function Overlay({ id, title, subtitle, icon, children, width = 'lg' }: OverlayProps) {
  const active = useUI((s) => s.activeOverlay)
  const close = useUI((s) => s.closeOverlay)
  const open = active === id
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const widthClass = { md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[width]

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && close()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[3px]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={isMobile ? { y: '100%' } : { x: '104%', opacity: 0.4 }}
                animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
                exit={isMobile ? { y: '100%' } : { x: '104%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-md md:inset-x-auto md:inset-y-3 md:right-3 md:max-h-[calc(100vh-24px)] md:w-auto md:rounded-md ${widthClass} parchment-dark corner-frame`}
              >
                <header className="flex items-center justify-between border-b border-gold-400/15 px-6 py-4">
                  <div className="flex items-center gap-3">
                    {icon && <span className="text-gold-300" aria-hidden="true">{icon}</span>}
                    <div>
                      <Dialog.Title className="panel-title text-[15px]">{title}</Dialog.Title>
                      {subtitle && <p className="diegetic-caption mt-0.5">{subtitle}</p>}
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      id={`overlay-close-${id}`}
                      aria-label={`关闭${title}`}
                      className="btn-ghost grid h-9 w-9 place-items-center rounded-full"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

/** 火漆确认框 —— 内置确认/警示对话框，绝不使用浏览器原生弹窗 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  danger = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-[3px]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 8 }}
                transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                className="parchment-dark corner-frame fixed left-1/2 top-1/2 z-[61] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-md p-7"
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className={`seal mt-0.5 grid h-11 w-11 shrink-0 place-items-center text-parchment-100 ${danger ? '!bg-red-900' : ''}`}
                  >
                    {danger ? '危' : '慎'}
                  </span>
                  <div className="min-w-0">
                    <Dialog.Title className="font-serifcn text-[15px] font-semibold tracking-wide text-parchment-100">
                      {title}
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 font-serifcn text-[13px] leading-relaxed text-ink-200/80">
                      {description}
                    </Dialog.Description>
                  </div>
                </div>
                <footer className="mt-6 flex justify-end gap-3">
                  <Dialog.Close asChild>
                    <button id="confirm-dialog-cancel" className="btn-ghost rounded px-5 py-2 text-[13px]">
                      {cancelLabel}
                    </button>
                  </Dialog.Close>
                  <button
                    id="confirm-dialog-ok"
                    onClick={() => {
                      onConfirm()
                      onClose()
                    }}
                    className={`rounded px-5 py-2 text-[13px] font-medium ${danger ? 'bg-blood-500 text-parchment-100 shadow-blood-glow hover:brightness-110' : 'btn-seal'}`}
                  >
                    {confirmLabel}
                  </button>
                </footer>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
