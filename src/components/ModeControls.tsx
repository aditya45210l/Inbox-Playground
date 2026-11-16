import { ChevronRight } from 'lucide-react'
import { nextStep, setAutoMode, setStepMode, useDemo } from '../engine/store'
import { cn } from '../lib/cn'
import { Button, Kbd, Switch } from './ui'

/** three little bars that bounce while something is playing */
function PlayingBars({ active }: { active: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn('w-[3px] rounded-sm bg-blue-500', active ? 'animate-eq' : 'h-1')}
          style={active ? { animationDelay: `${i * 0.18}s` } : undefined}
        />
      ))}
    </span>
  )
}

/**
 * Auto-play switch (plays the demo conversation by itself).
 * When Step-by-step is on, a Next button appears and pulses while a stage is waiting.
 */
export function ModeControls({ withStepToggle = false }: { withStepToggle?: boolean }) {
  const autoMode = useDemo((s) => s.autoMode)
  const stepMode = useDemo((s) => s.stepMode)
  const busy = useDemo((s) => s.busy)
  const waiting = useDemo((s) => s.waiting)
  const nextLabel = useDemo((s) => s.nextLabel)
  return (
    <div data-tour="controls" className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={autoMode}
        onClick={() => setAutoMode(!autoMode)}
        title="On: a demo conversation plays by itself. Off: you chat yourself (shortcut A)."
        className={cn(
          'relative inline-flex h-8 items-center gap-2 rounded-full border px-2.5 text-sm transition-colors',
          autoMode ? 'border-blue-500/40 bg-blue-500/10 text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <span className={cn('relative h-4 w-7 rounded-full transition-colors', autoMode ? 'bg-blue-500' : 'bg-input')}>
          {/* radar pulse on the switch only */}
          {autoMode && (
            <>
              <span className="pointer-events-none absolute -inset-0.5 animate-radar rounded-full border-2 border-blue-500/70" />
              <span className="pointer-events-none absolute -inset-0.5 animate-radar rounded-full border-2 border-blue-500/50 [animation-delay:1s]" />
            </>
          )}
          <span className={cn('absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all', autoMode ? 'left-3.5' : 'left-0.5')} />
        </span>
        <span className="font-medium">Auto-play</span>
        {autoMode && <PlayingBars active={busy} />}
      </button>

      {withStepToggle && <Switch on={stepMode} onClick={() => setStepMode(!stepMode)} label="Step-by-step" hint="Each stage waits for Next (shortcut S)" />}

      {stepMode && (
        <span className="relative inline-flex">
          {/* while a stage is waiting, the radar pulse moves here so people know to click Next */}
          {waiting && (
            <>
              <span className="pointer-events-none absolute inset-0 animate-radar-sm rounded-md border-2 border-blue-500/70" />
              <span className="pointer-events-none absolute inset-0 animate-radar-sm rounded-md border-2 border-blue-500/50 [animation-delay:1s]" />
            </>
          )}
          <Button size="sm" variant="brand" className="relative" onClick={nextStep} disabled={!waiting} title={waiting ? `Next: ${nextLabel} (shortcut N)` : 'Send a message first'}>
            Next
            {waiting && <span className="hidden max-w-[160px] truncate font-normal opacity-80 2xl:inline">· {nextLabel}</span>}
            <ChevronRight size={14} />
          </Button>
        </span>
      )}
      {stepMode && (
        <span className="hidden text-xs text-muted-foreground xl:inline">
          or press <Kbd>N</Kbd>
        </span>
      )}
    </div>
  )
}
