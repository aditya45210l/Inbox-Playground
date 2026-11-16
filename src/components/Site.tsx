import { Activity, ArrowUpRight, ExternalLink } from 'lucide-react'
import { cn } from '../lib/cn'
import { buttonClass, ThemeToggle } from './ui'

export const CURRENT = window.location.pathname.replace(/\/+$/, '') || '/'

/** the real product this playground demonstrates */
export const PRODUCT_URL = 'https://goghl.ai'

export function ProductLink({ className, children = 'Get the real product' }: { className?: string; children?: string }) {
  return (
    <a href={PRODUCT_URL} target="_blank" rel="noopener noreferrer" className={className ?? buttonClass('outline', 'md')}>
      {children} <ArrowUpRight size={14} />
    </a>
  )
}

const LINKS = [
  { href: '/walkthrough', label: 'Workflow walkthrough' },
  { href: '/ban-protection', label: 'Ban protection' },
  { href: '/#pricing', label: 'Pricing' },
]

export function Logo() {
  return (
    <a href="/" className="flex shrink-0 items-center gap-2 text-[13px] font-semibold tracking-tight">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand">
        <Activity size={13} className="text-white" />
      </span>
      <span className="hidden sm:inline">Inbox Playground</span>
    </a>
  )
}

export function PlaygroundLink({ className, children = 'Try playground' }: { className?: string; children?: string }) {
  return (
    <a href="/playground" target="_blank" rel="noopener" className={className ?? buttonClass('default', 'md')}>
      {children} <ExternalLink size={14} />
    </a>
  )
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center gap-6">
        <Logo />
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent',
                CURRENT === l.href ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {l.label}
            </a>
          ))}
          <a href={PRODUCT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            GoGHL <ArrowUpRight size={13} />
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          <PlaygroundLink className={buttonClass('default', 'sm')} />
        </div>
      </div>
      <nav className="container flex gap-1 overflow-x-auto pb-2 md:hidden">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="whitespace-nowrap rounded-md border px-2.5 py-1 text-xs text-muted-foreground">
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-2 py-6 text-center text-xs text-muted-foreground md:flex-row md:text-left">
        <p>
          Interactive concept for{' '}
          <a href={PRODUCT_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline-offset-4 hover:underline">
            GoGHL
          </a>
          . Unofficial and not affiliated. Simulated demo, no real messages are sent.
        </p>
        <p>
          Built with <span className="text-red-500">♥</span> by <span className="font-medium text-foreground">Aditya Singh</span>
        </p>
      </div>
    </footer>
  )
}
