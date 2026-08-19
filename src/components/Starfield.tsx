import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  vy: number
  tw: number
  twPhase: number
  depth: number
}

/** 星空粒子背景 —— 缓慢漂浮 + 轻微视差，GPU 友好的 Canvas 实现 */
export function Starfield({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let stars: Star[] = []
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: 0.5, y: 0.5 }

    const seed = () => {
      const count = Math.min(240, Math.floor((w * h) / 6500))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.15,
        vy: 0.02 + Math.random() * 0.09,
        tw: 0.5 + Math.random() * 0.5,
        twPhase: Math.random() * Math.PI * 2,
        depth: 0.25 + Math.random() * 0.75,
      }))
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const px = s.x - (mouse.x - 0.5) * 14 * s.depth
        const py = s.y - (mouse.y - 0.5) * 10 * s.depth
        const a = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.001 * s.tw + s.twPhase))
        ctx.globalAlpha = a * (0.35 + 0.65 * s.depth)
        ctx.fillStyle = s.depth > 0.72 ? '#f0d98c' : '#e8e2d0'
        ctx.beginPath()
        ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fill()
        s.y += s.vy * s.depth
        if (s.y > h + 4) {
          s.y = -4
          s.x = Math.random() * w
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />
}
