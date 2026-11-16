import { useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle, MessageSquare, Moon, Smartphone, Smile, Sun } from 'lucide-react'
import { createAvatar } from '@dicebear/core'
import { notionists } from '@dicebear/collection'
import { CHANNELS, type Channel } from '../engine/data'
import { cn } from '../lib/cn'
import { toggleTheme, useTheme } from '../lib/theme'

/* ---------------------------------------------------------------- Button */

type Variant = 'default' | 'outline' | 'secondary' | 'ghost' | 'brand'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const VARIANTS: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  brand: 'bg-brand text-white hover:bg-brand-hover',
  outline: 'border border-input bg-background hover:bg-accent',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent',
}
const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-sm',
  icon: 'h-9 w-9',
}

export function buttonClass(variant: Variant = 'default', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}

export function Button({ variant, size, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...rest} />
}

/* ---------------------------------------------------------------- Badge / Card */

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium', className)}>{children}</span>
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>{children}</div>
}

/* ---------------------------------------------------------------- Channel / Avatar */

export function ChannelIcon({ channel, size = 'sm' }: { channel: Channel; size?: 'xs' | 'sm' | 'md' }) {
  const Icon = channel === 'whatsapp' ? MessageCircle : channel === 'imessage' ? MessageSquare : Smartphone
  const dim = size === 'xs' ? 'h-4 w-4' : size === 'sm' ? 'h-5 w-5' : 'h-8 w-8'
  const ic = size === 'xs' ? 9 : size === 'sm' ? 11 : 16
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full text-white ring-2 ring-card', dim)}
      style={{ background: CHANNELS[channel].color }}
      title={CHANNELS[channel].label}
    >
      <Icon size={ic} strokeWidth={2.5} />
    </span>
  )
}


export function ThemeToggle() {
  const mode = useTheme((s) => s.mode)
  return (
    <button type="button" onClick={toggleTheme} className={buttonClass('ghost', 'icon')} aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title="Toggle theme">
      {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

// Illustrated avatars generated locally (no network) and cached per name
const AVATAR_TINTS = ['dbeafe', 'dcfce7', 'fef3c7', 'fce7f3', 'ede9fe', 'e0f2fe']
const avatarCache = new Map<string, string>()
function avatarUri(seed: string, tint: string) {
  const key = seed + tint
  let uri = avatarCache.get(key)
  if (!uri) {
    uri = createAvatar(notionists, { seed, backgroundColor: [tint], scale: 110 }).toDataUri()
    avatarCache.set(key, uri)
  }
  return uri
}

export function Avatar({ name, hue = 0, size = 36, className }: { name: string; hue?: number; size?: number; className?: string }) {
  const tint = AVATAR_TINTS[Math.abs(Math.round(hue / 60)) % AVATAR_TINTS.length]
  return (
    <img
      src={avatarUri(name, tint)}
      alt=""
      aria-hidden
      draggable={false}
      className={cn('inline-block shrink-0 rounded-full object-cover ring-1 ring-border', className)}
      style={{ width: size, height: size }}
    />
  )
}

/** logo-style avatar for the business (the dental clinic) */
export function BusinessAvatar({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-teal-500 text-white" style={{ width: size, height: size }} aria-hidden>
      <Smile size={Math.round(size * 0.55)} strokeWidth={2.25} />
    </span>
  )
}

/* ---------------------------------------------------------------- Switch / Tabs */

export function Switch({ on, onClick, label, hint }: { on: boolean; onClick: () => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} title={hint} className="inline-flex items-center gap-2 text-sm">
      <span className={cn('relative h-5 w-9 rounded-full transition-colors', on ? 'bg-primary' : 'bg-input')}>
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', on ? 'left-[18px]' : 'left-0.5')} />
      </span>
      <span className={on ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </button>
  )
}

export function Tabs<T extends string>({ value, options, onChange, render }: { value: T; options: T[]; onChange: (v: T) => void; render: (v: T) => ReactNode }) {
  return (
    <div className="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground" role="tablist">
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-all',
            value === o ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground',
          )}
        >
          {render(o)}
        </button>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- misc */

export function TypingDots({ color = '#8696A0' }: { color?: string }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label="typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 animate-bounce3 rounded-full" style={{ background: color, animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  )
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex h-2 w-2', className)}>
      <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-emerald-500" />
      <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  )
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const fn = () => setMatch(m.matches)
    fn()
    m.addEventListener('change', fn)
    return () => m.removeEventListener('change', fn)
  }, [query])
  return match
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">{children}</kbd>
}

/** click-to-open menu anchored under its trigger; closes on outside click or Escape */
export function Dropdown({ label, children, align = 'end' }: { label: ReactNode; children: ReactNode; align?: 'start' | 'end' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={buttonClass('outline', 'sm')}>
        {label}
      </button>
      {open && <div className={cn('absolute top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg', align === 'end' ? 'right-0' : 'left-0')}>{children}</div>}
    </div>
  )
}

export function SectionHead({ eyebrow, title, sub, align = 'center' }: { eyebrow: string; title: string; sub?: string; align?: 'center' | 'left' }) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p className="text-sm font-medium text-brand">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  )
}

/* ---------------------------------------------------------------- HoverCard (portal, so it is never clipped) */

export function HoverCard({ trigger, children, side = 'top', align = 'start' }: { trigger: ReactNode; children: ReactNode; side?: 'top' | 'bottom'; align?: 'start' | 'end' }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; below: boolean } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const closeT = useRef<number | undefined>(undefined)

  const show = () => {
    window.clearTimeout(closeT.current)
    setOpen(true)
  }
  const hide = () => {
    closeT.current = window.setTimeout(() => setOpen(false), 120)
  }

  useLayoutEffect(() => {
    if (!open || !ref.current) return
    const place = () => {
      const r = ref.current!.getBoundingClientRect()
      const ph = panel.current?.offsetHeight ?? 280
      const pw = panel.current?.offsetWidth ?? 300
      const below = side === 'bottom' || r.top < ph + 16
      let left = align === 'start' ? r.left : r.right - pw
      left = Math.max(8, Math.min(left, window.innerWidth - pw - 8))
      setPos({ top: below ? r.bottom + 6 : r.top - ph - 6, left, below })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open, side, align, children])

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => setOpen((v) => !v)}
        tabIndex={0}
        className="inline-flex cursor-default outline-none"
      >
        {trigger}
      </span>
      {open &&
        createPortal(
          <div
            ref={panel}
            onMouseEnter={show}
            onMouseLeave={hide}
            role="tooltip"
            className="fixed z-[100] w-[300px] rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg"
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  )
}
