import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BadgeCheck, BatteryFull, Camera, Lock, Sparkles, Check, CheckCheck, ChevronLeft, Clock, Mic, Phone, Play, Plus, SendHorizontal, Signal, Video, Wifi } from 'lucide-react'
import { BUSINESS, type Channel } from '../engine/data'
import { sendAsLead, setComposer, useDemo, type Msg } from '../engine/store'
import { cn } from '../lib/cn'
import { useTheme } from '../lib/theme'
import { BusinessAvatar, TypingDots } from './ui'

interface PhoneTheme {
  screen: string
  head: string
  text: string
  sub: string
  out: string
  outText: string
  in: string
  inText: string
  send: string
  accent: string
  chip: string
  input: string
  divider: string
  button: string
}

function phoneTheme(ch: Channel, dark: boolean): PhoneTheme {
  if (ch === 'whatsapp') {
    return dark
      ? { screen: '', head: '#1F2C34', text: '#E9EDEF', sub: '#8696A0', out: '#005C4B', outText: '#E9EDEF', in: '#202C33', inText: '#E9EDEF', send: '#00A884', accent: '#00A884', chip: '#182229', input: '#2A3942', divider: 'rgba(255,255,255,.06)', button: '#53BDEB' }
      : { screen: '', head: '#F6F6F6', text: '#111B21', sub: '#667781', out: '#D9FDD3', outText: '#111B21', in: '#FFFFFF', inText: '#111B21', send: '#25D366', accent: '#007AFF', chip: '#FFFFFF', input: '#FFFFFF', divider: 'rgba(0,0,0,.06)', button: '#027EB5' }
  }
  const green = ch === 'sms'
  return dark
    ? { screen: '#000000', head: 'rgba(28,28,30,.94)', text: '#FFFFFF', sub: '#8E8E93', out: green ? '#30D158' : '#0A84FF', outText: '#FFFFFF', in: '#26262A', inText: '#FFFFFF', send: green ? '#30D158' : '#0A84FF', accent: '#0A84FF', chip: 'transparent', input: '#1C1C1E', divider: 'rgba(255,255,255,.1)', button: '#0A84FF' }
    : { screen: '#FFFFFF', head: 'rgba(249,249,249,.94)', text: '#000000', sub: '#8E8E93', out: green ? '#34C759' : '#007AFF', outText: '#FFFFFF', in: '#E9E9EB', inText: '#000000', send: green ? '#34C759' : '#007AFF', accent: '#007AFF', chip: 'transparent', input: '#FFFFFF', divider: 'rgba(0,0,0,.1)', button: '#007AFF' }
}

function Ticks({ status, sub }: { status: Msg['status']; sub: string }) {
  if (status === 'sending') return <Clock size={11} color={sub} />
  if (status === 'sent') return <Check size={13} color={sub} />
  return <CheckCheck size={14} color={status === 'read' ? '#53BDEB' : sub} />
}

function Voice({ seconds, color }: { seconds: number; color: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: color }}>
        <Play size={12} className="ml-0.5" fill="white" color="white" />
      </span>
      <span className="flex h-6 items-center gap-[2px]">
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} className="w-[2px] rounded-full opacity-60" style={{ height: `${25 + ((i * 37) % 70)}%`, background: 'currentColor' }} />
        ))}
      </span>
      <span className="text-[10px] opacity-60">0:{String(seconds).padStart(2, '0')}</span>
    </div>
  )
}

export function PhoneMock({ height = 640, suggestions }: { height?: number | string; suggestions?: string[] }) {
  const channel = useDemo((s) => s.channel)
  const all = useDemo((s) => s.messages)
  const composer = useDemo((s) => s.composer)
  const bizTyping = useDemo((s) => s.bizTyping)
  const phase = useDemo((s) => s.phase)
  const busy = useDemo((s) => s.busy)
  const waiting = useDemo((s) => s.waiting)
  const dark = useTheme((s) => s.mode === 'dark')
  const t = phoneTheme(channel, dark)
  const scroller = useRef<HTMLDivElement>(null)
  const canType = phase !== 'auto' && !busy
  const messages = all.filter((m) => m.onPhone)
  const wa = channel === 'whatsapp'

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, bizTyping, composer])

  const lastLead = [...messages].reverse().find((m) => m.from === 'lead')

  const empty = messages.length === 0
  const [tips, setTips] = useState(false)
  useEffect(() => {
    if (!suggestions?.length || !empty || !canType) {
      setTips(false)
      return
    }
    setTips(true)
    const id = window.setTimeout(() => setTips(false), 9000)
    return () => window.clearTimeout(id)
  }, [empty, canType, suggestions, channel])

  return (
    <div data-tour="phone" className="relative mx-auto w-[310px] shrink-0 rounded-[52px] bg-zinc-900 p-[11px] shadow-xl ring-1 ring-zinc-700" style={{ height }}>
      <div className={cn('relative flex h-full w-full flex-col overflow-hidden rounded-[42px]', wa && 'wa-wallpaper')} style={{ background: wa ? undefined : t.screen, color: t.text }}>
        {/* status bar */}
        <div className="relative z-20 flex h-11 shrink-0 items-center justify-between px-8 pt-1 text-[13px] font-semibold" style={{ background: t.head }}>
          <span>9:41</span>
          <span className="absolute left-1/2 top-2.5 h-[24px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <Signal size={13} />
            <Wifi size={13} />
            <BatteryFull size={17} />
          </span>
        </div>

        {/* header */}
        {wa ? (
          <div className="flex shrink-0 items-center gap-2 px-2.5 pb-2 pt-1" style={{ background: t.head, borderBottom: `1px solid ${t.divider}` }}>
            <ChevronLeft size={24} className="-mr-1" color={t.accent} />
            <BusinessAvatar size={34} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[14px] font-semibold">{BUSINESS.name}</p>
              <p className="text-[11px]" style={{ color: t.sub }}>
                {bizTyping ? 'typing…' : 'online'}
              </p>
            </div>
            <span className="flex gap-4 pr-1" style={{ color: t.accent }}>
              <Video size={20} />
              <Phone size={18} />
            </span>
          </div>
        ) : (
          <div className="relative flex shrink-0 flex-col items-center gap-1 pb-2 pt-1 backdrop-blur" style={{ background: t.head, borderBottom: `1px solid ${t.divider}` }}>
            <ChevronLeft className="absolute left-2 top-3" size={26} color={t.accent} />
            <BusinessAvatar size={38} />
            <span className="text-[11px]">{BUSINESS.name} ›</span>
          </div>
        )}

        {/* messages */}
        <div ref={scroller} className="scroll-thin flex-1 space-y-1.5 overflow-y-auto px-2.5 py-3">
          <div className="mb-2 flex justify-center">
            <span className={cn('rounded-md px-2 py-0.5 text-[10.5px] font-medium', wa && 'shadow-sm')} style={{ background: t.chip, color: t.sub }}>
              {wa ? 'Today' : channel === 'imessage' ? 'iMessage · Today' : 'Text Message · Today'}
            </span>
          </div>
          {messages.length === 0 && !bizTyping && (
            <div className="space-y-3 px-2">
              {wa && (
                <p
                  className="mx-auto flex max-w-[250px] gap-1.5 rounded-lg px-2.5 py-1.5 text-center text-[10.5px] leading-snug shadow-sm"
                  style={{ background: dark ? '#182229' : '#FFEECD', color: dark ? '#FFD279' : '#54656F' }}
                >
                  <Lock size={11} className="mt-0.5 shrink-0" />
                  Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
                </p>
              )}
              <div className="mx-auto flex max-w-[230px] flex-col items-center rounded-xl px-4 py-4 text-center" style={{ background: wa ? t.in : 'transparent' }}>
                <BusinessAvatar size={56} />
                <p className="mt-2 text-[14px] font-semibold">{BUSINESS.name}</p>
                <p className="flex items-center gap-1 text-[11px]" style={{ color: t.sub }}>
                  {wa ? (
                    <>
                      <BadgeCheck size={12} color="#25D366" /> Business account
                    </>
                  ) : channel === 'imessage' ? (
                    'iMessage'
                  ) : (
                    'Text Message · SMS'
                  )}
                </p>
                <p className="mt-2 text-[11px]" style={{ color: t.sub }}>
                  Usually replies in seconds
                </p>
              </div>
              <p className="text-center text-[11px]" style={{ color: t.sub }}>
                Say hi 👋 to start the chat
              </p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const out = m.from === 'lead'
              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22 }}
                  className={cn('flex flex-col', out ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cn('max-w-[80%] px-2.5 py-1.5 text-[13px] leading-snug', wa ? (out ? 'rounded-lg rounded-tr-none shadow-sm' : 'rounded-lg rounded-tl-none shadow-sm') : 'rounded-[18px] px-3')}
                    style={{ background: out ? t.out : t.in, color: out ? t.outText : t.inText }}
                  >
                    {m.voice ? <Voice seconds={m.voice} color={wa ? '#00A884' : '#0A84FF'} /> : null}
                    <p className={cn('whitespace-pre-line', m.voice && 'mt-1 border-t border-current/10 pt-1 text-[11.5px] italic opacity-75')}>{m.voice ? `“${m.text}”` : m.text}</p>
                    {wa && (
                      <span className="float-right ml-2 mt-1 flex items-center gap-1 text-[10px]" style={{ color: t.sub }}>
                        {m.time}
                        {out && <Ticks status={m.status} sub={t.sub} />}
                      </span>
                    )}
                  </div>
                  {m.buttons && (
                    <div className="mt-1 w-[80%] space-y-1">
                      {m.buttons.map((b) => (
                        <button
                          key={b}
                          disabled={!canType}
                          onClick={() => sendAsLead(b)}
                          className="block w-full rounded-lg py-1.5 text-center text-[13px] font-medium shadow-sm transition enabled:hover:brightness-110 disabled:opacity-80"
                          style={{ background: t.in, color: t.button }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                  {out && !wa && m.id === lastLead?.id && (
                    <span className="mr-1 mt-0.5 text-[10px]" style={{ color: t.sub }}>
                      {m.status === 'sending' ? 'Sending…' : m.status === 'sent' ? 'Sent' : m.status === 'read' && channel === 'imessage' ? `Read ${m.time}` : 'Delivered'}
                    </span>
                  )}
                </motion.div>
              )
            })}
            {bizTyping && (
              <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex">
                <span className={cn('px-3 py-2.5', wa ? 'rounded-lg rounded-tl-none shadow-sm' : 'rounded-[18px]')} style={{ background: t.in }}>
                  <TypingDots color={t.sub} />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ChatGPT-style suggestions: only on an empty chat, fade out after a few seconds */}
        <AnimatePresence>
          {tips && !composer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 space-y-1.5 px-3 pb-2"
            >
              <p className="flex items-center gap-1 px-1 text-[10.5px] font-medium" style={{ color: t.sub }}>
                <Sparkles size={11} /> Try saying
              </p>
              {suggestions!.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                  onClick={() => sendAsLead(s)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-[12.5px] shadow-sm transition hover:brightness-110"
                  style={{ background: t.in, color: t.inText, border: `1px solid ${t.divider}` }}
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* composer */}
        <form
          className="flex shrink-0 items-center gap-2 px-2.5 pb-7 pt-2"
          style={{ background: t.head, borderTop: `1px solid ${t.divider}` }}
          onSubmit={(e) => {
            e.preventDefault()
            sendAsLead(composer)
          }}
        >
          {wa ? <Plus size={22} color={t.accent} /> : <Camera size={21} color={t.sub} />}
          <input
            data-tour="phone-input"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            disabled={!canType}
            placeholder={waiting ? 'Press Next to continue…' : wa ? 'Message' : channel === 'imessage' ? 'iMessage' : 'Text Message'}
            aria-label="Type a message as the lead"
            className="min-w-0 flex-1 rounded-full px-3.5 py-1.5 text-[13px] focus:outline-none"
            style={{ background: t.input, color: t.text, border: `1px solid ${t.divider}`, ['--tw-placeholder' as string]: t.sub } as CSSProperties}
          />
          <button
            data-tour="phone-send"
            type="submit"
            disabled={!canType || !composer.trim()}
            aria-label="Send"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition disabled:opacity-50"
            style={{ background: t.send }}
          >
            {composer.trim() ? <SendHorizontal size={15} /> : <Mic size={15} />}
          </button>
        </form>
      </div>
    </div>
  )
}
