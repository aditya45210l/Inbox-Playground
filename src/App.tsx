import { MotionConfig } from 'motion/react'
import { CURRENT } from './components/Site'
import Landing from './pages/Landing'
import Playground from './pages/Playground'
import Walkthrough from './pages/Walkthrough'
import BanProtection from './pages/BanProtection'

const ROUTES: Record<string, () => React.JSX.Element> = {
  '/playground': Playground,
  '/walkthrough': Walkthrough,
  '/ban-protection': BanProtection,
}

export default function App() {
  const Page = ROUTES[CURRENT] ?? Landing
  return (
    <MotionConfig reducedMotion="user">
      <Page />
    </MotionConfig>
  )
}
