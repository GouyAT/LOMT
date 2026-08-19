import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, Save, Settings, Menu, Compass, BookOpen, Backpack, MessageSquareText } from 'lucide-react'
import { useUI } from '@/store/ui'
import { Starfield } from './Starfield'
import { NarrativeStage } from './narrative/NarrativeStage'
import { StatusPanel } from './panels/StatusPanel'
import { ArchivePanel } from './panels/ArchivePanel'
import {
  MapOverlay, CompendiumOverlay, ChronicleOverlay, DivinationOverlay, NewspaperOverlay,
  RelationOverlay, InventoryOverlay, SettingsOverlay, SaveOverlay, BattleOverlay,
} from './panels/Panels'

const mobileTabs = [
  { id: 'narrative', label: '剧场', icon: MessageSquareText, overlay: null },
  { id: 'map', label: '舆图', icon: Compass, overlay: 'map' },
  { id: 'compendium', label: '图鉴', icon: BookOpen, overlay: 'compendium' },
  { id: 'inventory', label: '行囊', icon: Backpack, overlay: 'inventory' },
  { id: 'settings', label: '设置', icon: Settings, overlay: 'settings' },
] as const

/** 游戏主界面 —— PC 三栏剧场 / 移动端单栏+底部标签 */
export function GameScreen() {
  const viewMode = useUI((s) => s.viewMode)
  const setViewMode = useUI((s) => s.setViewMode)
  const openOverlay = useUI((s) => s.openOverlay)
  const [autoMobile, setAutoMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setAutoMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isMobile = viewMode === 'mobile' || (viewMode === 'pc' && autoMobile)

  return (
    <div className="relative flex h-full flex-col overflow-hidden" id="game-screen">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-abyss-950 via-abyss-900 to-abyss-850" aria-hidden="true" />
      <div className="absolute inset-0 opacity-40" aria-hidden="true">
        <Starfield />
      </div>

      {/* 顶栏 */}
      <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 border-b border-gold-400/12 bg-abyss-950/70 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full border border-gold-400/50">
            <svg viewBox="0 0 32 32" className="h-5 w-5">
              <circle cx="16" cy="16" r="13" fill="none" stroke="#d4af37" strokeWidth="1.2" />
              <circle cx="16" cy="16" r="4" fill="#d4af37" opacity="0.85" />
            </svg>
          </span>
          <div className="leading-tight">
            <h1 className="font-display text-[15px] tracking-[0.2em] text-gold-200">诡秘剧场</h1>
            <p className="diegetic-caption hidden sm:block">第〇幕 · 异乡人 · 单API档</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* 视图切换 */}
          <div className="hidden items-center gap-1 rounded-sm border border-gold-400/15 bg-abyss-850/70 p-1 md:flex" role="group" aria-label="视图切换">
            <button
              id="view-pc"
              aria-pressed={viewMode === 'pc'}
              onClick={() => setViewMode('pc')}
              className={`grid h-7 w-8 place-items-center rounded-sm transition-all ${viewMode === 'pc' ? 'bg-gold-400/15 text-gold-200' : 'text-ink-300/70 hover:text-ink-100'}`}
            >
              <Monitor size={13} aria-hidden="true" />
            </button>
            <button
              id="view-mobile"
              aria-pressed={viewMode === 'mobile'}
              onClick={() => setViewMode('mobile')}
              className={`grid h-7 w-8 place-items-center rounded-sm transition-all ${viewMode === 'mobile' ? 'bg-gold-400/15 text-gold-200' : 'text-ink-300/70 hover:text-ink-100'}`}
            >
              <Smartphone size={13} aria-hidden="true" />
            </button>
          </div>
          <button id="topbar-save" className="btn-ghost hidden h-9 items-center gap-1.5 rounded-sm px-3 text-[12px] sm:flex" onClick={() => openOverlay('save')}>
            <Save size={13} aria-hidden="true" /> 存档
          </button>
          <button id="topbar-settings" className="btn-ghost grid h-9 w-9 place-items-center rounded-sm" aria-label="设置" onClick={() => openOverlay('settings')}>
            <Settings size={14} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* 主体 */}
      {isMobile ? <MobileLayout /> : (
        <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_300px] gap-3 px-4 py-4 xl:grid-cols-[310px_minmax(0,1fr)_330px]">
          <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="min-h-0">
            <StatusPanel />
          </motion.div>
          <motion.main
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-0"
          >
            <NarrativeStage />
          </motion.main>
          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="min-h-0">
            <ArchivePanel />
          </motion.div>
        </div>
      )}
    </div>
  )
}

/** 移动端布局 —— 单栏叙事 + 底部标签栏 */
function MobileLayout() {
  const openOverlay = useUI((s) => s.openOverlay)
  const [tab, setTab] = useState('narrative')
  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="min-h-0 flex-1 px-3 pt-3">
        <NarrativeStage />
      </motion.div>
      <nav className="flex shrink-0 items-stretch border-t border-gold-400/15 bg-abyss-950/80 backdrop-blur-md" aria-label="底部导航">
        {mobileTabs.map((t) => (
          <button
            key={t.id}
            id={`mobile-tab-${t.id}`}
            onClick={() => {
              setTab(t.id)
              if (t.overlay) openOverlay(t.overlay)
            }}
            aria-current={tab === t.id}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${tab === t.id ? 'text-gold-200' : 'text-ink-300/70'}`}
          >
            <t.icon size={17} aria-hidden="true" />
            <span className="font-serifcn text-[10px] tracking-wider">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/** 面板宿主 —— 所有幕帘模态在此注册（挂于 App 全局，登录页亦可使用） */
export function OverlayHost() {
  return (
    <>
      <MapOverlay />
      <CompendiumOverlay />
      <ChronicleOverlay />
      <DivinationOverlay />
      <NewspaperOverlay />
      <RelationOverlay />
      <InventoryOverlay />
      <SettingsOverlay />
      <SaveOverlay />
      <BattleOverlay />
    </>
  )
}
