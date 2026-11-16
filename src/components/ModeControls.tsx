import { ChevronRight } from 'lucide-react'
import { nextStep, setAutoMode, useDemo } from '../engine/store'
import { cn } from '../lib/cn'
import { Button, Kbd } from './ui'

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

/** "Auto-play" switch, plus a Next step button while the manual player is waiting */
export function ModeControls() {
  const autoMode = useDemo((s) => s.autoMode)
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
        title="On: messages move by themselves. Off: you move each step with Next (shortcut A)."
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
      {!autoMode && (
        <span className="relative inline-flex">
          {/* when a step is waiting, the radar pulse moves here so people know to click Next */}
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
      {!autoMode && (
        <span className="hidden text-xs text-muted-foreground xl:inline">
          or press <Kbd>N</Kbd>
        </span>
      )}
    </div>
  )
}
