import { useEffect } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { CHANNELS, NODE_ORDER, type Channel } from '../engine/data'
import { setChannel, startAuto, toggleFeature, togglePause, useDemo, type Features } from '../engine/store'
import { cn } from '../lib/cn'
import { FlowMap } from '../components/FlowMap'
import { PhoneMock } from '../components/PhoneMock'
import { CrmApp } from '../components/CrmApp'
import { Footer, SiteNav } from '../components/Site'
import { Button, ChannelIcon, Switch, Tabs } from '../components/ui'
import { ModeControls } from '../components/ModeControls'

const FEATURES: { k: keyof Features; label: string }[] = [
  { k: 'buttons', label: 'Buttons' },
  { k: 'voice', label: 'Voice note' },
  { k: 'spintax', label: 'Spintax' },
  { k: 'drip', label: 'Drip mode' },
]

export default function Walkthrough() {
  const channel = useDemo((s) => s.channel)
  const features = useDemo((s) => s.features)
  const paused = useDemo((s) => s.paused)
  const busy = useDemo((s) => s.busy)
  const caption = useDemo((s) => s.caption)
  const active = useDemo((s) => s.activeNode)
  const step = active ? NODE_ORDER.indexOf(active) + 1 : 0

  useEffect(() => {
    document.title = 'Workflow walkthrough · Inbox Playground'
    startAuto()
    // pause while the tab is hidden, resume when it comes back (only if we paused it)
    let autoPaused = false
    const fn = () => {
      const s = useDemo.getState()
      if (document.hidden && s.busy && !s.paused) {
        autoPaused = true
        togglePause()
      } else if (!document.hidden && autoPaused) {
        autoPaused = false
        if (useDemo.getState().paused) togglePause()
      }
    }
    document.addEventListener('visibilitychange', fn)
    return () => document.removeEventListener('visibilitychange', fn)
  }, [])

  return (
    <>
      <SiteNav />
      <main className="container py-10">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand">Workflow walkthrough</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Follow one message, end to end</h1>
          <p className="mt-2 text-muted-foreground">
            Watch a lead's message travel from their phone to your CRM, trigger a workflow and get an AI reply. Click any step on the map to see what happens there.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Tabs<Channel>
            value={channel}
            options={['whatsapp', 'imessage', 'sms']}
            onChange={setChannel}
            render={(c) => (
              <>
                <ChannelIcon channel={c} size="xs" /> {CHANNELS[c].label}
              </>
            )}
          />
          <div className="flex flex-wrap gap-4">
            {FEATURES.map((f) => (
              <Switch key={f.k} on={features[f.k]} onClick={() => toggleFeature(f.k)} label={f.label} />
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-lg border bg-card p-2.5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <ModeControls />
            <Button variant="outline" size="sm" onClick={togglePause} disabled={!busy}>
              {paused ? <Play size={13} /> : <Pause size={13} />} {paused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="outline" size="sm" onClick={startAuto}>
              <RotateCcw size={13} /> Restart
            </Button>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
            <div className="hidden gap-1 sm:flex" aria-hidden>
              {NODE_ORDER.map((n, i) => (
                <span key={n} className={cn('h-1.5 w-4 rounded-full', i < step ? 'bg-primary' : 'bg-muted')} />
              ))}
            </div>
            <p className="truncate text-sm text-muted-foreground" aria-live="polite">
              {step > 0 && <span className="mr-1 font-medium text-foreground">Step {step} of 6 ·</span>}
              {caption}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <FlowMap />
        </div>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[310px_1fr]">
          <PhoneMock />
          <CrmApp compact />
        </div>
      </main>
      <Footer />
    </>
  )
}
