import { create } from 'zustand'
import { CHANNELS, LEAD, SLOTS, type Channel, type NodeId } from './data'
import { nowTime } from '../lib/cn'

export type MsgStatus = 'sending' | 'sent' | 'delivered' | 'read'

export interface TraceStep {
  label: string
  detail?: string
  ms?: number // simulated time since the message arrived, set when the step completes
}

export interface Msg {
  id: string
  from: 'lead' | 'biz'
  by?: 'ai' | 'team'
  text: string
  time: string
  status: MsgStatus
  inCrm: boolean
  onPhone: boolean
  buttons?: string[]
  voice?: number
  spintax?: string
  syncMs?: number
  trace?: TraceStep[]
  traceIdx?: number
}

export interface Features {
  buttons: boolean
  voice: boolean
  spintax: boolean
  drip: boolean
  autoReply: boolean
}

export type Phase = 'idle' | 'auto' | 'free'

interface EdgeAnim {
  index: number
  dir: 1 | -1
  key: number
  ms: number
}

interface State {
  channel: Channel
  features: Features
  phase: Phase
  paused: boolean
  busy: boolean
  messages: Msg[]
  composer: string
  bizTyping: boolean
  aiDrafting: boolean
  activeNode: NodeId | null
  selectedNode: NodeId | null
  edge: EdgeAnim | null
  caption: string
  tags: string[]
  stage: number
  wfActive: number | null
  wfDone: number[]
  unread: number
  lastOptions: string[]
  autoMode: boolean
  waiting: boolean
  nextLabel: string
}

const initial = (): Omit<State, 'channel' | 'features' | 'autoMode'> => ({
  phase: 'idle',
  paused: false,
  busy: false,
  messages: [],
  composer: '',
  bizTyping: false,
  aiDrafting: false,
  activeNode: null,
  selectedNode: null,
  edge: null,
  caption: 'Press play to watch a lead message travel through the system',
  tags: [],
  stage: 0,
  wfActive: null,
  wfDone: [],
  unread: 0,
  lastOptions: [],
  waiting: false,
  nextLabel: '',
})

export const useDemo = create<State>(() => ({
  channel: 'whatsapp',
  features: { buttons: true, voice: false, spintax: false, drip: false, autoReply: true },
  autoMode: true,
  ...initial(),
}))

const set = useDemo.setState
const get = useDemo.getState

/* ---------------------------------------------------------------- player */

interface Step {
  wait: number
  run: () => void
  /** in manual mode the player stops before this step until the user presses "Next step" */
  gate?: string
}

let queue: Step[] = []
let idx = 0
let timer: number | undefined
let onFinish: (() => void) | null = null
let edgeKey = 0
let uid = 0

function tick() {
  if (get().paused) return
  if (idx >= queue.length) {
    queue = []
    idx = 0
    set({ busy: false })
    const f = onFinish
    onFinish = null
    f?.()
    return
  }
  const step = queue[idx]
  if (step.gate && !get().autoMode) {
    set({ waiting: true, nextLabel: step.gate })
    return
  }
  timer = window.setTimeout(() => {
    timer = undefined
    step.run()
    idx++
    tick()
  }, step.wait)
}

function stopTimer() {
  if (timer !== undefined) window.clearTimeout(timer)
  timer = undefined
}

function runSteps(steps: Step[], after?: () => void) {
  stopTimer()
  queue = steps
  idx = 0
  onFinish = after ?? null
  set({ busy: true })
  tick()
}

/* ---------------------------------------------------------------- helpers */

const updMsg = (id: string, patch: Partial<Msg>) =>
  set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))

/** completes the current trace step of a message, stamping its simulated time */
function advance(id: string, cum: number[]) {
  set((s) => ({
    messages: s.messages.map((m) => {
      if (m.id !== id || !m.trace) return m
      const i = m.traceIdx ?? 0
      if (i >= m.trace.length) return m
      const trace = m.trace.map((t, k) => (k === i ? { ...t, ms: cum[i] } : t))
      return { ...m, trace, traceIdx: i + 1 }
    }),
  }))
}

const cumulative = (parts: number[]) => parts.reduce<number[]>((a, p) => [...a, (a[a.length - 1] ?? 0) + p], [])

const nodesByIndex: NodeId[] = ['lead', 'relay', 'bridge', 'crm', 'workflow', 'ai']

function hop(index: number, dir: 1 | -1, ms: number, caption?: string) {
  const node = nodesByIndex[dir === 1 ? index + 1 : index]
  set({ edge: { index, dir, key: ++edgeKey, ms }, activeNode: node, ...(caption ? { caption } : {}) })
}

function wf(n: number) {
  set((s) => ({
    wfActive: n,
    wfDone: Array.from(new Set([...s.wfDone, ...Array.from({ length: n }, (_, i) => i)])),
  }))
}

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
const rnd = (a: number, b: number) => Math.round(a + Math.random() * (b - a))

type Intent = 'booking' | 'pricing' | 'human' | 'greeting' | 'general'

interface Reply {
  text: string
  intent: Intent
  buttons?: string[]
  voice?: number
  spintax?: string
  tags: string[]
  stage: number
  booked?: boolean
}

function buildReply(input: string, f: Features, ch: Channel): Reply {
  const t = input.toLowerCase().trim()
  const hi = f.spintax ? pick(['Hi', 'Hey', 'Hello']) : 'Hi'
  const greet = `${hi} ${LEAD.first}!`
  let r: Reply

  const slot = /thu/.test(t) ? SLOTS[1] : SLOTS[0]
  if (/(book|tue|thu|slot|schedule|appointment|works for me|yes)/.test(t)) {
    r = { intent: 'booking', text: `You're booked ✅ ${slot}. We'll send a reminder the day before. Reply here anytime!`, tags: ['booked'], stage: 2, booked: true }
  } else if (/(price|cost|how much|\$|whiten)/.test(t)) {
    r = {
      intent: 'pricing',
      text: `${greet} Teeth whitening is $199, and this week your first consult is free. Want to grab a slot?`,
      buttons: [`Book ${SLOTS[0]}`, `Book ${SLOTS[1]}`, 'Talk to a human'],
      tags: ['whitening'],
      stage: 1,
    }
  } else if (/(human|call|person|someone|staff)/.test(t)) {
    r = { intent: 'human', text: 'Of course! Sam from our front desk will call you in the next few minutes 📞', tags: ['needs-human'], stage: 1 }
  } else if (/^(hi|hey|hello|yo|hola)\b/.test(t)) {
    r = {
      intent: 'greeting',
      text: `${greet} Thanks for reaching out to Bright Smile Dental. Are you asking about whitening, a cleaning, or something else?`,
      buttons: ['Whitening price', 'Book a cleaning', 'Talk to a human'],
      tags: [],
      stage: 1,
    }
  } else {
    r = {
      intent: 'general',
      text: `Thanks, ${LEAD.first}! I can share prices, book you in, or connect you with the team. What works best?`,
      buttons: ['See prices', `Book ${SLOTS[0]}`, 'Talk to a human'],
      tags: [],
      stage: 1,
    }
  }
  r.spintax = f.spintax && r.text.startsWith(greet) ? '{Hi|Hey|Hello} {{contact.first_name}}!' : undefined

  if (!f.buttons) r.buttons = undefined
  if (r.buttons && ch !== 'whatsapp') {
    // iMessage / SMS have no native buttons, so fall back to numbered replies
    r.text += '\n\n' + r.buttons.map((b, i) => `${i + 1} = ${b}`).join('\n')
  }
  if (f.voice) r.voice = Math.max(4, Math.round(r.text.length / 14))
  return r
}

/* ---------------------------------------------------------------- inbound exchange (lead → CRM → AI → lead) */

const RELAY_CAPTION: Record<Channel, string> = {
  whatsapp: 'Goes out through a local residential IP, like normal WhatsApp Web',
  imessage: 'A hosted Mac + iPhone receives the blue bubble',
  sms: 'Your Android phone + SIM receives the text',
}

export const RELAY_DETAIL: Record<Channel, string> = {
  whatsapp: 'Linked device · US residential proxy',
  imessage: 'Hosted Mac + iPhone · US SIM',
  sms: 'Android gateway · your SIM',
}

function exchange(text: string, typed: boolean, ctxInput?: string): Step[] {
  const { features, channel } = get()
  const label = CHANNELS[channel].label
  const id = `m${++uid}`
  const bizId = `m${++uid}`
  const reply = buildReply(ctxInput ?? text, features, channel)
  const auto = features.autoReply

  const trace: TraceStep[] = [
    { label: `Received on ${label}`, detail: RELAY_DETAIL[channel] },
    { label: 'Contact matched', detail: `${LEAD.name} · ${LEAD.phone}` },
    { label: 'Added to Conversations', detail: 'Team inbox · marked unread' },
    { label: `Trigger: Inbound ${label} message`, detail: 'Workflow · Lead auto-reply' },
    { label: 'Tag added', detail: 'new-lead' },
    ...(auto
      ? [
          { label: 'AI agent drafted a reply', detail: features.drip ? 'Drip mode held it ~3s to feel human' : `Detected intent: ${reply.intent}` },
          { label: `Reply sent via ${label}`, detail: reply.booked ? 'Delivered · pipeline moved to Booked' : 'Delivered to the lead' },
        ]
      : [{ label: 'Team notified', detail: 'AI auto-reply is off · waiting for your reply' }]),
  ]
  const cum = cumulative([
    rnd(60, 110),
    rnd(40, 80),
    rnd(150, 260),
    rnd(20, 40),
    rnd(15, 30),
    auto ? (features.drip ? rnd(3000, 3300) : rnd(900, 1400)) : rnd(30, 60),
    rnd(250, 400),
  ])

  const steps: Step[] = []

  if (typed) {
    steps.push({ wait: 500, run: () => set({ caption: 'A lead types a message on their phone…', activeNode: 'lead' }) })
    for (let k = 2; k <= text.length + 1; k += 2) {
      steps.push({ wait: 38, run: () => set({ composer: text.slice(0, k) }) })
    }
  }

  steps.push({
    wait: typed ? 300 : 50,
    run: () =>
      set((s) => ({
        composer: '',
        wfActive: null,
        wfDone: [],
        activeNode: 'lead',
        caption: `Lead sends it from ${label}`,
        messages: [...s.messages, { id, from: 'lead', text, time: nowTime(), status: 'sending', inCrm: false, onPhone: true, trace, traceIdx: 0 }],
      })),
  })
  steps.push({
    wait: 380,
    gate: trace[0].label,
    run: () => {
      updMsg(id, { status: 'sent' })
      advance(id, cum)
      hop(0, 1, 480, RELAY_CAPTION[channel])
    },
  })
  steps.push({
    wait: 560,
    gate: trace[1].label,
    run: () => {
      advance(id, cum)
      hop(1, 1, 480, 'Bridge matches the contact by phone number and blocks duplicates')
    },
  })
  steps.push({
    wait: 560,
    gate: trace[2].label,
    run: () => {
      advance(id, cum)
      hop(2, 1, 480, 'Lands in the CRM inbox, on the right contact')
      updMsg(id, { status: 'delivered', inCrm: true, syncMs: cum[2] })
      set((s) => ({ unread: s.unread + 1 }))
    },
  })
  steps.push({
    wait: 700,
    gate: trace[3].label,
    run: () => {
      advance(id, cum)
      hop(3, 1, 480, `"Inbound ${label} message" trigger fires the workflow`)
      wf(0)
    },
  })
  steps.push({
    wait: 520,
    gate: trace[4].label,
    run: () => {
      advance(id, cum)
      wf(1)
      set((s) => ({ tags: s.tags.includes('new-lead') ? s.tags : [...s.tags, 'new-lead'] }))
    },
  })

  if (!auto) {
    steps.push({
      wait: 600,
      gate: trace[5].label,
      run: () => {
        advance(id, cum)
        set((s) => ({
          activeNode: null,
          edge: null,
          wfActive: null,
          wfDone: [0, 1],
          stage: Math.max(s.stage, 1),
          caption: 'AI auto-reply is off. Reply from the CRM as your team',
        }))
      },
    })
    return steps
  }

  steps.push({
    wait: 520,
    gate: 'AI agent reads the message',
    run: () => {
      hop(4, 1, 480, 'AI agent reads the message and drafts a reply')
      wf(2)
      set({ aiDrafting: true, unread: 0 })
      updMsg(id, { status: 'read' })
    },
  })

  if (features.drip) {
    steps.push({ wait: 700, run: () => set({ caption: 'Drip mode adds a natural, human-like delay' }) })
    steps.push({ wait: 2600, run: () => {} })
  }

  steps.push({
    wait: 1000,
    gate: trace[5].label,
    run: () => {
      set({ bizTyping: true })
      wf(3)
      hop(4, -1, 200, 'Reply travels back the same path')
    },
  })
  for (const i of [3, 2, 1, 0]) steps.push({ wait: 230, run: () => hop(i, -1, 200) })

  steps.push({
    wait: 650,
    gate: trace[6]?.label,
    run: () => {
      advance(id, cum)
      set((s) => ({
        bizTyping: false,
        aiDrafting: false,
        stage: Math.max(s.stage, reply.stage),
        tags: Array.from(new Set([...s.tags, ...reply.tags])),
        lastOptions: reply.buttons ?? s.lastOptions,
        caption: reply.booked ? 'Booked! The pipeline moves automatically' : "Reply delivered to the lead's phone",
        messages: [
          ...s.messages,
          {
            id: bizId,
            from: 'biz',
            by: 'ai',
            text: reply.text,
            time: nowTime(),
            status: 'delivered',
            inCrm: true,
            onPhone: true,
            buttons: channel === 'whatsapp' ? reply.buttons : undefined,
            voice: reply.voice,
            spintax: reply.spintax,
          },
        ],
      }))
      wf(4)
      if (!reply.booked) set({ wfActive: null })
    },
  })
  steps.push({
    wait: 1100,
    run: () => {
      advance(id, cum)
      updMsg(bizId, { status: 'read' })
      set({ activeNode: null, edge: null, wfActive: null })
      if (reply.booked) set((s) => ({ wfDone: Array.from(new Set([...s.wfDone, 4])) }))
    },
  })
  return steps
}

/* ---------------------------------------------------------------- outbound (team replies from the CRM) */

function teamSend(text: string): Step[] {
  const { channel } = get()
  const label = CHANNELS[channel].label
  const id = `m${++uid}`
  const trace: TraceStep[] = [
    { label: 'Sent from Conversations', detail: 'By you · Team inbox' },
    { label: 'Picked up by the bridge', detail: 'Queued once · duplicate-safe' },
    { label: `Delivered on ${label}`, detail: RELAY_DETAIL[channel] },
    { label: 'Read by the lead', detail: LEAD.name },
  ]
  const cum = cumulative([rnd(20, 50), rnd(120, 220), rnd(200, 380), rnd(1800, 2600)])
  return [
    {
      wait: 0,
      run: () =>
        set((s) => ({
          activeNode: 'crm',
          caption: 'Your team replies from the CRM inbox',
          unread: 0,
          messages: [...s.messages, { id, from: 'biz', by: 'team', text, time: nowTime(), status: 'sending', inCrm: true, onPhone: false, trace, traceIdx: 0 }],
        })),
    },
    {
      wait: 400,
      gate: trace[0].label,
      run: () => {
        advance(id, cum)
        updMsg(id, { status: 'sent' })
        hop(2, -1, 380, 'Bridge sends it out on the same channel')
      },
    },
    {
      wait: 450,
      gate: trace[1].label,
      run: () => {
        advance(id, cum)
        hop(1, -1, 380)
      },
    },
    {
      wait: 450,
      gate: trace[2].label,
      run: () => {
        advance(id, cum)
        hop(0, -1, 380, `Delivered to the lead's ${label}`)
        updMsg(id, { status: 'delivered', onPhone: true })
      },
    },
    {
      wait: 1600,
      gate: trace[3].label,
      run: () => {
        advance(id, cum)
        updMsg(id, { status: 'read' })
        set({ activeNode: null, edge: null })
      },
    },
  ]
}

/* ---------------------------------------------------------------- public API */

const FIRST_MSG = 'Hi! I saw your ad for teeth whitening. How much is it?'
const FREE_CAPTION = 'Your turn: type on the phone as the lead, or reply from the CRM'

export function startAuto() {
  stopTimer()
  set({ ...initial(), phase: 'auto' })
  runSteps(exchange(FIRST_MSG, true), () => {
    const { channel, features } = get()
    if (!features.autoReply) {
      set({ phase: 'free' })
      return
    }
    const second = channel === 'whatsapp' && features.buttons ? `Book ${SLOTS[0]}` : features.buttons ? '1' : 'Tuesday 2pm works for me'
    const ctx = second === '1' ? `Book ${SLOTS[0]}` : undefined
    runSteps(
      [
        { wait: 1400, run: () => set({ caption: channel === 'whatsapp' && features.buttons ? 'The lead taps a button…' : 'The lead replies…' }) },
        ...exchange(second, channel !== 'whatsapp' || !features.buttons, ctx),
      ],
      () => set({ phase: 'free', caption: FREE_CAPTION }),
    )
  })
}

/** manual mode: run the step the player is waiting on */
export function nextStep() {
  if (!get().waiting) return
  set({ waiting: false, nextLabel: '' })
  const step = queue[idx]
  if (!step) return
  step.run()
  idx++
  tick()
}

/**
 * Finish whatever is in flight instantly, drop the rest of the scripted demo,
 * and hand control back to the user (inputs unlocked).
 */
function finishNow() {
  stopTimer()
  set({ waiting: false, nextLabel: '', paused: false })
  while (idx < queue.length) {
    queue[idx].run()
    idx++
  }
  queue = []
  idx = 0
  onFinish = null
  set({ busy: false, phase: 'free', bizTyping: false, aiDrafting: false, composer: '', activeNode: null, edge: null, wfActive: null, caption: FREE_CAPTION })
}

export function setAutoMode(on: boolean) {
  const s = get()
  if (s.autoMode === on) return
  set({ autoMode: on })
  if (on) {
    if (s.waiting) nextStep() // continue the message that was waiting for "Next"
    else if (!s.busy && s.messages.length === 0) startAuto() // empty chat: play the demo
    return
  }
  // Turning auto-play off while the scripted demo is running: don't leave the
  // user stuck stepping through a script they didn't start. Complete the current
  // message, stop the script, and let them type their own.
  if (s.phase === 'auto' && s.busy) finishNow()
}

export function resetDemo() {
  stopTimer()
  queue = []
  idx = 0
  onFinish = null
  set({ ...initial() })
}

export function togglePause() {
  const { paused, busy } = get()
  if (!busy) return
  if (paused) {
    set({ paused: false })
    tick()
  } else {
    stopTimer()
    set({ paused: true })
  }
}

export function sendAsLead(text: string) {
  const s = get()
  const clean = text.trim()
  if (!clean || s.busy) return
  if (s.phase !== 'free') set({ phase: 'free' })
  const n = Number(clean)
  const ctx = Number.isInteger(n) && s.lastOptions[n - 1] ? s.lastOptions[n - 1] : undefined
  runSteps(exchange(clean, false, ctx), () => set({ caption: FREE_CAPTION }))
}

export function sendAsTeam(text: string) {
  const s = get()
  const clean = text.trim()
  if (!clean || s.busy) return
  if (s.phase !== 'free') set({ phase: 'free' })
  runSteps(teamSend(clean), () => set({ caption: FREE_CAPTION }))
}

export function setChannel(channel: Channel) {
  if (get().channel === channel) return
  resetDemo()
  set({ channel })
  // auto-play replays the demo on the new channel; manual mode starts from an empty chat
  if (get().autoMode) startAuto()
}

export function toggleFeature(k: keyof Features) {
  set((s) => ({ features: { ...s.features, [k]: !s.features[k] } }))
}

export function selectNode(n: NodeId | null) {
  set({ selectedNode: n })
}

export function setComposer(v: string) {
  set({ composer: v })
}
