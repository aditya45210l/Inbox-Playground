import { useEffect } from 'react'
import { GraduationCap, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { CHANNELS, type Channel } from '../engine/data'
import { nextStep, setAutoMode, setChannel, startAuto, toggleFeature, useDemo, type Features } from '../engine/store'
import { toggleTheme } from '../lib/theme'
import { PhoneMock } from '../components/PhoneMock'
import { CrmApp } from '../components/CrmApp'
import { ModeControls } from '../components/ModeControls'
import { Logo, ProductLink } from '../components/Site'
import { startTour, tourSeen } from '../components/tour'
import { Button, buttonClass, ChannelIcon, Dropdown, Kbd, Switch, Tabs, ThemeToggle } from '../components/ui'

const FEATURES: { k: keyof Features; label: string; hint: string }[] = [
  { k: 'buttons', label: 'Reply buttons', hint: 'Tap-to-answer buttons in replies' },
  { k: 'voice', label: 'Voice notes', hint: 'AI answers with a voice message' },
  { k: 'spintax', label: 'Varied greetings', hint: 'Hi / Hey / Hello, never the same twice' },
  { k: 'drip', label: 'Human-like pace', hint: 'Waits a few seconds before replying' },
]

const SHORTCUTS: [string, string][] = [
  ['N', 'Next step'],
  ['A', 'Auto-play on / off'],
  ['1 2 3', 'WhatsApp / iMessage / SMS'],
  ['R', 'Replay the demo'],
  ['T', 'Light / dark theme'],
  ['?', 'Show the tutorial'],
]

const SUGGESTIONS = ['How much is whitening?', 'Can I book Tuesday?', 'Please call me']
const CHANNEL_KEYS: Record<string, Channel> = { '1': 'whatsapp', '2': 'imessage', '3': 'sms' }

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target instanceof Element ? e.target : null
      if (el?.closest('input, textarea, select, [contenteditable="true"]') || document.querySelector('.driver-popover')) return
      const k = e.key.toLowerCase()
      if (k === 'n' || e.key === 'ArrowRight') nextStep()
      else if (k === 'a') setAutoMode(!useDemo.getState().autoMode)
      else if (k === 'r') {
        setAutoMode(true)
        startAuto()
      } else if (k === 't') toggleTheme()
      else if (e.key === '?') startTour()
      else if (CHANNEL_KEYS[e.key]) setChannel(CHANNEL_KEYS[e.key])
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export default function Playground() {
  const channel = useDemo((s) => s.channel)
  const features = useDemo((s) => s.features)
  const caption = useDemo((s) => s.caption)
  const phase = useDemo((s) => s.phase)
  const busy = useDemo((s) => s.busy)
  const autoMode = useDemo((s) => s.autoMode)
  const waiting = useDemo((s) => s.waiting)
  const nextLabel = useDemo((s) => s.nextLabel)

  useShortcuts()

  useEffect(() => {
    document.title = 'Playground · Inbox Playground'
    // first visit: show the tutorial; afterwards: autoplay the demo
    const t = window.setTimeout(() => (tourSeen() ? startAuto() : startTour()), 300)
    return () => window.clearTimeout(t)
  }, [])

  const status = waiting
    ? `Next: ${nextLabel}`
    : phase === 'auto' || busy
      ? caption
      : autoMode
        ? 'Type as the customer on the phone, or reply from the inbox.'
        : 'Send a message, then press Next to follow it step by step.'

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:h-screen lg:overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4 lg:px-5">
        <Logo />
        <span className="hidden h-5 w-px bg-border sm:block" />
        <ModeControls />
        <div data-tour="settings" className="ml-auto flex items-center gap-2">
          <Tabs<Channel>
            value={channel}
            options={['whatsapp', 'imessage', 'sms']}
            onChange={setChannel}
            render={(c) => (
              <>
                <ChannelIcon channel={c} size="xs" />
                <span className="hidden md:inline">{CHANNELS[c].label}</span>
              </>
            )}
          />
          <Dropdown
            label={
              <>
                <SlidersHorizontal size={14} /> <span className="hidden sm:inline">Options</span>
              </>
            }
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">Reply extras</p>
            <div className="space-y-3">
              {FEATURES.map((f) => (
                <div key={f.k}>
                  <Switch on={features[f.k]} onClick={() => toggleFeature(f.k)} label={f.label} />
                  <p className="ml-11 text-[11px] text-muted-foreground">{f.hint}</p>
                </div>
              ))}
            </div>
            <div className="my-3 h-px bg-border" />
            <p className="mb-2 text-xs font-medium text-muted-foreground">Keyboard shortcuts</p>
            <ul className="space-y-1.5">
              {SHORTCUTS.map(([k, label]) => (
                <li key={k} className="flex items-center justify-between text-xs">
                  {label}
                  <span className="flex gap-1">
                    {k.split(' ').map((p) => (
                      <Kbd key={p}>{p}</Kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="my-3 h-px bg-border" />
            <ProductLink className={buttonClass('default', 'sm', 'w-full')} children="Get the real product" />
          </Dropdown>
        </div>
        {autoMode && (
          <Button variant="ghost" size="icon" onClick={startAuto} title="Replay the demo (R)" aria-label="Replay the demo">
            <RotateCcw size={15} />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={startTour} title="Show the tutorial (?)">
          <GraduationCap size={15} /> <span className="hidden lg:inline">Tutorial</span>
        </Button>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center gap-4 p-4 lg:min-h-0 lg:flex-row lg:items-stretch">
        <div className="flex shrink-0 flex-col items-center">
          <PhoneMock height="clamp(500px, calc(100vh - 104px), 700px)" suggestions={SUGGESTIONS} />
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col lg:min-h-0">
          <CrmApp className="h-[640px] lg:h-auto lg:min-h-0 lg:flex-1" />
          <p className="mt-2 truncate text-center text-xs text-muted-foreground" aria-live="polite">
            {status}
          </p>
        </div>
      </main>
    </div>
  )
}
