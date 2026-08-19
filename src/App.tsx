import { useUI } from './store/ui'
import { OpeningSequence } from './components/OpeningSequence'
import { LoginPage } from './components/LoginPage'
import { GameScreen, OverlayHost } from './components/GameScreen'
import { ToastHost } from './components/ui/ToastHost'

export default function App() {
  const stage = useUI((s) => s.stage)
  return (
    <div className="h-full w-full">
      {stage === 'opening' && <OpeningSequence />}
      {stage === 'login' && <LoginPage />}
      {stage === 'game' && <GameScreen />}
      <OverlayHost />
      <ToastHost />
    </div>
  )
}
