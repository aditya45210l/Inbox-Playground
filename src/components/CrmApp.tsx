import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  Circle,
  CircleCheck,
  FileText,
  Filter,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  MessageSquare,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  SendHorizontal,
  Settings,
  Smile,
  Sparkles,
  Star,
  Tag,
  Timer,
  User,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'
import { CHANNELS, LEAD, OTHER_THREADS } from '../engine/data'
import { sendAsTeam, toggleFeature, useDemo, type Msg } from '../engine/store'
import { cn } from '../lib/cn'
import { Avatar, ChannelIcon, HoverCard, LiveDot, TypingDots } from './ui'

/* ---------------------------------------------------------------- processing trace */

const fmt = (ms?: number) => (ms === undefined ? '' : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`)

function TracePanel({ msg }: { msg: Msg }) {
  const trace = msg.trace ?? []
  const i = msg.traceIdx ?? 0
  const done = i >= trace.length
  const total = trace[trace.length - 1]?.ms
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">{msg.from === 'lead' ? 'Inbound message processing' : 'Outbound delivery'}</p>
        {done ? (
          <span className="whitespace-nowrap text-xs text-muted-foreground">Done · {fmt(total)}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500">
            <LiveDot /> Live
          </span>
        )}
      </div>
      <ol className="relative space-y-0">
        {trace.map((t, k) => {
          const state = k < i ? 'done' : k === i ? 'active' : 'pending'
          return (
            <li key={k} className="relative flex gap-2.5 pb-2.5 last:pb-0">
              {k < trace.length - 1 && <span className={cn('absolute left-[7px] top-4 h-full w-px', state === 'done' ? 'bg-emerald-500/40' : 'bg-border')} />}
              <span className="relative mt-0.5 bg-popover">
                {state === 'done' ? (
                  <CircleCheck size={15} className="text-emerald-500" />
                ) : state === 'active' ? (
                  <LoaderCircle size={15} className="animate-spin text-brand" />
                ) : (
                  <Circle size={15} className="text-zinc-600" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn('text-[13px] leading-tight', state === 'pending' ? 'text-muted-foreground' : 'font-medium')}>{t.label}</p>
                  {t.ms !== undefined && <span className="tnum shrink-0 font-mono text-[10.5px] text-muted-foreground">+{fmt(t.ms)}</span>}
                </div>
                {t.detail && <p className="mt-0.5 text-xs text-muted-foreground">{t.detail}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function ProcessingChip({ msg, align }: { msg: Msg; align: 'start' | 'end' }) {
  const trace = msg.trace ?? []
  const i = msg.traceIdx ?? 0
  const done = i >= trace.length
  return (
    <HoverCard
      align={align}
      trigger={
        done ? (
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted">
            <Zap size={11} /> Processed in {fmt(trace[trace.length - 1]?.ms)}
          </span>
        ) : (
          <span className="inline-flex max-w-[230px] items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-500">
            <LoaderCircle size={11} className="shrink-0 animate-spin" />
            <span className="truncate">Processing · {trace[i]?.label}</span>
          </span>
        )
      }
    >
      <TracePanel msg={msg} />
    </HoverCard>
  )
}

/* ---------------------------------------------------------------- side panel */

const STAGES = ['New lead', 'Engaged', 'Booked']

function WorkflowSteps() {
  const channel = useDemo((s) => s.channel)
  const active = useDemo((s) => s.wfActive)
  const done = useDemo((s) => s.wfDone)
  const features = useDemo((s) => s.features)
  const steps = [
    { icon: Zap, label: `Inbound ${CHANNELS[channel].label} message` },
    { icon: Tag, label: 'Add tag · new-lead' },
    { icon: Sparkles, label: features.autoReply ? 'AI agent drafts reply' : 'Notify team' },
    { icon: Timer, label: `${features.drip ? 'Drip send' : 'Send'} via ${CHANNELS[channel].label}` },
    { icon: Check, label: 'Move pipeline · Booked' },
  ]
  return (
    <ol className="space-y-1">
      {steps.map((s, i) => {
        const isActive = active === i
        const isDone = done.includes(i) && !isActive
        const Icon = s.icon
        return (
          <li key={i} className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-xs', isActive ? 'bg-blue-500/10 text-blue-500' : isDone ? 'text-foreground' : 'text-muted-foreground')}>
            <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border', isDone ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : isActive ? 'border-blue-500/30 bg-card' : 'bg-card')}>
              {isActive ? <LoaderCircle size={11} className="animate-spin" /> : isDone ? <Check size={11} /> : <Icon size={11} />}
            </span>
            <span className="truncate">{s.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-[13px]">{children}</div>
    </div>
  )
}

function DetailsPanel() {
  const tags = useDemo((s) => s.tags)
  const stage = useDemo((s) => s.stage)
  const started = useDemo((s) => s.messages.some((m) => m.inCrm))
  return (
    <aside data-tour="crm-details" className="scroll-thin hidden w-[260px] shrink-0 overflow-y-auto border-l bg-card lg:block">
      <div className="flex flex-col items-center border-b px-4 py-5 text-center">
        <Avatar name={LEAD.name} hue={0} size={52} />
        <p className="mt-2 text-sm font-semibold">{LEAD.name}</p>
        <p className="text-xs text-muted-foreground">Lead · {LEAD.source.split(' · ')[0]}</p>
        <div className="mt-3 flex gap-2">
          {[Phone, Mail, CalendarDays].map((I, i) => (
            <span key={i} className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground">
              <I size={14} />
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 border-b px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
        <Field label="Phone">{LEAD.phone}</Field>
        <Field label="Email">{LEAD.email}</Field>
        <Field label="Source">{LEAD.source}</Field>
      </div>

      <div className="border-b px-4 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</p>
        <div className="flex min-h-[22px] flex-wrap gap-1.5">
          {tags.length === 0 && <span className="text-xs text-muted-foreground">No tags</span>}
          <AnimatePresence>
            {tags.map((t) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'rounded-md border px-1.5 py-0.5 text-[11px] font-medium',
                  t === 'booked' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : t === 'needs-human' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' : 'bg-secondary text-secondary-foreground',
                )}
              >
                {t}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-b px-4 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opportunity</p>
        <div className="rounded-md border p-2.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium">Teeth whitening</span>
            <span className="tnum text-muted-foreground">$199</span>
          </div>
          <div className="mt-2 flex gap-1">
            {STAGES.map((s, i) => (
              <span
                key={s}
                className={cn(
                  'flex-1 rounded py-1 text-center text-[10.5px] font-medium transition-colors',
                  started && i <= stage ? (i === 2 ? 'bg-emerald-600 text-white' : 'bg-primary text-primary-foreground') : 'bg-muted text-muted-foreground',
                )}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active workflow</p>
          <Workflow size={13} className="text-muted-foreground" />
        </div>
        <p className="mb-2 text-[13px] font-medium">Lead auto-reply</p>
        <WorkflowSteps />
      </div>
    </aside>
  )
}

/* ---------------------------------------------------------------- list */

function ConversationList() {
  const channel = useDemo((s) => s.channel)
  const unread = useDemo((s) => s.unread)
  const msgs = useDemo((s) => s.messages)
  const crm = msgs.filter((m) => m.inCrm)
  const last = crm[crm.length - 1]
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r bg-card min-[1360px]:flex">
      <div className="flex items-center gap-4 border-b px-3 text-[13px]">
        {['Unread', 'Recent', 'All'].map((t, i) => (
          <span key={t} className={cn('-mb-px border-b-2 py-2.5', i === 0 ? 'border-brand font-medium text-foreground' : 'border-transparent text-muted-foreground')}>
            {t}
          </span>
        ))}
        <Filter size={14} className="ml-auto text-muted-foreground" />
      </div>
      <div className="p-2">
        <div className="flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs text-muted-foreground">
          <Search size={13} /> Search conversations
        </div>
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {last && (
            <motion.div key="lead" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-2.5 border-l-2 border-brand bg-brand/10 px-3 py-2.5">
              <span className="relative">
                <Avatar name={LEAD.name} hue={0} size={34} />
                <span className="absolute -bottom-0.5 -right-0.5">
                  <ChannelIcon channel={channel} size="xs" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-[13px] font-semibold">{LEAD.name}</p>
                  <span className="text-[11px] text-muted-foreground">now</span>
                </div>
                <div className="flex items-center gap-1">
                  <p className="flex-1 truncate text-xs text-muted-foreground">
                    {last.from === 'biz' ? 'You: ' : ''}
                    {last.text}
                  </p>
                  {unread > 0 && <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {OTHER_THREADS.map((t) => (
          <div key={t.name} className="flex gap-2.5 px-3 py-2.5 hover:bg-muted/60">
            <span className="relative">
              <Avatar name={t.name} hue={t.hue} size={34} />
              <span className="absolute -bottom-0.5 -right-0.5">
                <ChannelIcon channel={t.channel} size="xs" />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className={cn('truncate text-[13px]', t.unread ? 'font-semibold' : 'font-medium')}>{t.name}</p>
                <span className="text-[11px] text-muted-foreground">{t.ago}</span>
              </div>
              <div className="flex items-center gap-1">
                <p className="flex-1 truncate text-xs text-muted-foreground">{t.preview}</p>
                {t.unread && <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">{t.unread}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

/* ---------------------------------------------------------------- thread + composer */

function Composer() {
  const channel = useDemo((s) => s.channel)
  const busy = useDemo((s) => s.busy)
  const waiting = useDemo((s) => s.waiting)
  const phase = useDemo((s) => s.phase)
  const autoReply = useDemo((s) => s.features.autoReply)
  const [text, setText] = useState('')
  const disabled = busy || phase === 'auto'
  const submit = () => {
    if (!text.trim() || disabled) return
    sendAsTeam(text)
    setText('')
  }
  return (
    <div data-tour="crm-composer" className="shrink-0 border-t bg-card p-3">
      <div className="rounded-lg border focus-within:ring-1 focus-within:ring-ring">
        <div className="flex items-center gap-3 border-b px-3 py-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ChannelIcon channel={channel} size="xs" /> {CHANNELS[channel].label}
            <ChevronDown size={12} className="text-muted-foreground" />
          </span>
          <span className="text-muted-foreground">Internal comment</span>
          <span className="ml-auto text-muted-foreground">From: +1 (415) 555-0199</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          rows={2}
          placeholder={waiting ? 'Press Next to continue…' : disabled ? 'Wait for the current message to finish…' : `Type a ${CHANNELS[channel].label} message…`}
          aria-label="Reply as your team"
          className="block w-full resize-none bg-transparent px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          {[Paperclip, Smile, FileText].map((I, i) => (
            <span key={i} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
              <I size={15} />
            </span>
          ))}
          <button
            type="button"
            data-tour="ai-toggle"
            onClick={() => toggleFeature('autoReply')}
            className={cn('ml-1 inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-medium', autoReply ? 'border-blue-500/30 bg-blue-500/10 text-blue-500' : 'text-muted-foreground')}
            title="Let the AI agent reply automatically to inbound messages"
          >
            <Bot size={13} /> AI auto-reply {autoReply ? 'on' : 'off'}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !text.trim()}
            className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            Send <SendHorizontal size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

function Thread() {
  const channel = useDemo((s) => s.channel)
  const all = useDemo((s) => s.messages)
  const aiDrafting = useDemo((s) => s.aiDrafting)
  const msgs = all.filter((m) => m.inCrm)
  const processing = [...all].reverse().find((m) => m.from === 'lead' && m.trace && (m.traceIdx ?? 0) < m.trace.length)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs.length, aiDrafting])

  return (
    <section data-tour="crm-thread" className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
        <Avatar name={LEAD.name} hue={0} size={34} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{LEAD.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ChannelIcon channel={channel} size="xs" /> {CHANNELS[channel].label} · {LEAD.phone}
          </p>
        </div>
        {[Phone, Star, MoreVertical].map((I, i) => (
          <span key={i} className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted sm:flex">
            <I size={16} />
          </span>
        ))}
      </div>

      <div ref={scroller} className="scroll-thin flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> Today <span className="h-px flex-1 bg-border" />
        </div>
        {msgs.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <MessageSquare size={22} />
            <p className="text-xs">No messages yet. Type on the phone as the lead.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {msgs.map((m) => {
            const inbound = m.from === 'lead'
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-2', inbound ? 'justify-start' : 'justify-end')}>
                {inbound && <Avatar name={LEAD.name} hue={0} size={28} className="mt-0.5" />}
                <div className={cn('flex max-w-[75%] flex-col', inbound ? 'items-start' : 'items-end')}>
                  <div
                    className={cn(
                      'whitespace-pre-line rounded-lg px-3 py-2 text-[13px] leading-snug',
                      inbound ? 'border bg-card text-foreground' : m.status === 'sending' ? 'bg-brand/70 text-white' : 'bg-brand text-white',
                    )}
                  >
                    {m.voice && (
                      <span className="mb-1 flex items-center gap-1 text-[11px] font-medium opacity-80">
                        <Mic size={12} /> Voice note · 0:{String(m.voice).padStart(2, '0')}
                      </span>
                    )}
                    {m.text}
                    {m.buttons && (
                      <span className="mt-2 flex flex-wrap gap-1">
                        {m.buttons.map((b) => (
                          <span key={b} className="rounded border border-white/30 px-1.5 py-0.5 text-[11px]">
                            {b}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                  <div className={cn('mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground', !inbound && 'justify-end')}>
                    <ChannelIcon channel={channel} size="xs" />
                    <span>{m.time}</span>
                    {!inbound && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          {m.by === 'ai' ? <Bot size={11} /> : <User size={11} />}
                          {m.by === 'ai' ? 'AI agent' : 'You'}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-0.5">
                          {m.status === 'sending' ? (
                            'Sending'
                          ) : (
                            <>
                              <CheckCheck size={12} className={m.status === 'read' ? 'text-brand' : ''} />
                              {m.status === 'read' ? 'Read' : m.status === 'sent' ? 'Sent' : 'Delivered'}
                            </>
                          )}
                        </span>
                      </>
                    )}
                    {m.spintax && (
                      <span className="rounded border px-1" title={m.spintax}>
                        spintax
                      </span>
                    )}
                    {m.trace && <ProcessingChip msg={m} align={inbound ? 'start' : 'end'} />}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {aiDrafting && processing && (
          <div className="flex justify-end">
            <HoverCard
              align="end"
              trigger={
                <span className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-500">
                  <Sparkles size={13} /> AI agent is drafting a reply <TypingDots color="#1D4ED8" />
                  <span className="font-normal text-blue-500/70">· hover for steps</span>
                </span>
              }
            >
              <TracePanel msg={processing} />
            </HoverCard>
          </div>
        )}
      </div>

      <Composer />
    </section>
  )
}

/* ---------------------------------------------------------------- shell */

const RAIL = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: MessageSquare, label: 'Conversations', active: true },
  { icon: Users, label: 'Contacts' },
  { icon: CalendarDays, label: 'Calendars' },
  { icon: Workflow, label: 'Automation' },
  { icon: BarChart3, label: 'Reporting' },
]

export function CrmApp({ className, compact = false }: { className?: string; compact?: boolean }) {
  const unread = useDemo((s) => s.unread)
  return (
    <div className={cn('flex h-[640px] min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm', className)}>
      <nav className="hidden w-14 shrink-0 flex-col items-center gap-1 bg-zinc-950 py-3 md:flex" aria-label="CRM navigation">
        <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-brand">
          <Activity size={16} className="text-white" />
        </span>
        {RAIL.map((r) => (
          <span key={r.label} title={r.label} className={cn('relative flex h-9 w-9 items-center justify-center rounded-md', r.active ? 'bg-zinc-800 text-white' : 'text-zinc-500')}>
            <r.icon size={17} />
            {r.active && unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand" />}
          </span>
        ))}
        <span className="mt-auto flex h-9 w-9 items-center justify-center rounded-md text-zinc-500">
          <Settings size={17} />
        </span>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
          <p className="text-sm font-semibold">Conversations</p>
          <span className="hidden items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] text-muted-foreground sm:inline-flex">
            <LiveDot /> Connected · WhatsApp, iMessage, SMS
          </span>
          <div className="ml-auto hidden h-8 w-56 items-center gap-2 rounded-md border px-2.5 text-xs text-muted-foreground xl:flex">
            <Search size={13} /> Search contacts
          </div>
          <Bell size={16} className="text-muted-foreground" />
          <Avatar name="Team Admin" hue={60} size={28} />
        </header>
        <div className="flex min-h-0 flex-1">
          {!compact && <ConversationList />}
          <Thread />
          <DetailsPanel />
        </div>
      </div>
    </div>
  )
}
