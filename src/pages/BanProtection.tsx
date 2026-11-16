import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, RotateCcw, Sparkles, WandSparkles } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { clamp, cn } from '../lib/cn'
import { Footer, SiteNav } from '../components/Site'
import { Button, Card, Tabs } from '../components/ui'

interface Params {
  outbound: number
  inbound: number
  reply: number
  spike: number
}

const DEFAULTS: Params = { outbound: 28, inbound: 10, reply: 26, spike: 175 }
const SAFE: Params = { outbound: 22, inbound: 10, reply: 38, spike: 0 }

const noise = (i: number) => 1 + 0.28 * Math.sin(i * 2.1 + 1.3) + 0.12 * Math.cos(i * 5.7)

function model(p: Params, days: number) {
  const spikeIdx = Math.max(0, days - 4)
  const today = new Date()
  const rows = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    const isSpike = i === spikeIdx && p.spike > 0
    const out = Math.max(1, Math.round(p.outbound * noise(i) * (isSpike ? 1 + p.spike / 100 : 1)))
    const replied = Math.round(out * (p.reply / 100) * (isSpike ? 0.45 : 1))
    const inbound = Math.max(0, Math.round(p.inbound * noise(i + 3)))
    return {
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Inbound: inbound,
      'Outbound · replied': replied,
      'Outbound · pending': out - replied,
      out,
      replied,
      inbound,
    }
  })
  const outbound = rows.reduce((a, r) => a + r.out, 0)
  const inbound = rows.reduce((a, r) => a + r.inbound, 0)
  const replied = rows.reduce((a, r) => a + r.replied, 0)
  const conversations = outbound + inbound
  const responseRate = outbound ? replied / outbound : 0
  const startsWithYou = conversations ? outbound / conversations : 0
  const avgOut = outbound / days
  const spikeRow = rows[spikeIdx]
  const spikePct = Math.round((spikeRow.out / (avgOut || 1) - 1) * 100)
  const busiest = rows.reduce((a, r) => (r.out + r.inbound > a.out + a.inbound ? r : a), rows[0])
  const fewestReplies = rows.reduce((a, r) => (r.replied / r.out < a.replied / a.out ? r : a), rows[0])

  const risk = Math.round(
    100 * (0.3 * clamp(p.spike / 250) + 0.3 * clamp((55 - p.reply) / 50) + 0.2 * clamp((startsWithYou - 0.45) / 0.45) + 0.2 * clamp((p.outbound - 25) / 75)),
  )

  const insights: { tone: 'bad' | 'warn' | 'info' | 'ok'; text: string }[] = []
  if (p.spike > 40) insights.push({ tone: 'bad', text: `Outbound jumped ${spikePct}% on ${spikeRow.label}` })
  insights.push(
    responseRate < 0.35
      ? { tone: 'warn', text: `Response rate could be higher (${Math.round(responseRate * 100)}%)` }
      : { tone: 'ok', text: `Healthy response rate (${Math.round(responseRate * 100)}%)` },
  )
  if (p.spike > 40) insights.push({ tone: 'warn', text: `${fewestReplies.label} had unusually few replies` })
  insights.push({ tone: startsWithYou > 0.65 ? 'warn' : 'info', text: `${Math.round(startsWithYou * 100)}% of conversations start with you` })
  insights.push({ tone: 'info', text: `${busiest.label} was your busiest day` })

  const tip =
    risk >= 65
      ? `Cap new outbound chats at about ${Math.min(25, p.outbound)} a day, turn on Drip mode, and spread campaigns across 3 or more days.`
      : risk >= 35
        ? 'Turn on Drip mode and open with a question to lift replies before scaling volume.'
        : 'Looks natural. Keep warming up gradually before any big campaign.'

  return { rows, outbound, conversations, responseRate, pending: outbound - replied, risk, insights, tip }
}

function RiskMeter({ value }: { value: number }) {
  const level = value >= 65 ? { label: 'High risk', bar: 'bg-red-500', text: 'text-red-500' } : value >= 35 ? { label: 'Medium risk', bar: 'bg-amber-500/100', text: 'text-amber-500' } : { label: 'Low risk', bar: 'bg-emerald-500/100', text: 'text-emerald-500' }
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">Ban risk score</p>
        <p className={cn('text-sm font-medium', level.text)}>{level.label}</p>
      </div>
      <p className="tnum mt-1 text-4xl font-semibold tracking-tight">
        {value}
        <span className="text-base font-normal text-muted-foreground"> / 100</span>
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all duration-500', level.bar)} style={{ width: `${Math.max(3, value)}%` }} />
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, unit, onChange, hint }: { label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void; hint: string }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tnum font-medium">
          {value}
          {unit}
        </span>
      </span>
      <input type="range" className="range mt-2.5" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ['--pct' as string]: `${pct}%` }} />
      <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
    </label>
  )
}

const DOT = { bad: 'bg-red-500', warn: 'bg-amber-500/100', info: 'bg-blue-500/100', ok: 'bg-emerald-500/100' }

export default function BanProtection() {
  const [p, setP] = useState<Params>(DEFAULTS)
  const [days, setDays] = useState<'7d' | '14d' | '30d'>('7d')
  const anim = useRef<number | undefined>(undefined)
  const m = useMemo(() => model(p, parseInt(days)), [p, days])
  const upd = (k: keyof Params) => (v: number) => setP((s) => ({ ...s, [k]: v }))

  useEffect(() => {
    document.title = 'Ban protection · Inbox Playground'
    return () => window.clearInterval(anim.current)
  }, [])

  const autoFix = () => {
    window.clearInterval(anim.current)
    const from = { ...p }
    let t = 0
    anim.current = window.setInterval(() => {
      t += 1 / 24
      const e = 1 - Math.pow(1 - Math.min(t, 1), 3)
      setP({
        outbound: Math.round(from.outbound + (SAFE.outbound - from.outbound) * e),
        inbound: from.inbound,
        reply: Math.round(from.reply + (Math.max(from.reply, SAFE.reply) - from.reply) * e),
        spike: Math.round(from.spike + (SAFE.spike - from.spike) * e),
      })
      if (t >= 1) window.clearInterval(anim.current)
    }, 30)
  }

  const kpis = [
    { l: 'Conversations', v: m.conversations.toLocaleString('en-US') },
    { l: 'Outbound', v: m.outbound.toLocaleString('en-US') },
    { l: 'Response rate', v: `${(m.responseRate * 100).toFixed(1)}%`, color: m.responseRate < 0.35 ? 'text-amber-500' : 'text-emerald-500' },
    { l: 'Pending replies', v: m.pending.toLocaleString('en-US') },
  ]

  return (
    <>
      <SiteNav />
      <main className="container py-10">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand">AI ban protection</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">See the ban risk before it happens</h1>
          <p className="mt-2 text-muted-foreground">
            Move the sliders to simulate how a WhatsApp number is used. The risk score, chart and insights update instantly, and one click shows how drip pacing brings it back to safe.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="space-y-6 p-5">
            <RiskMeter value={m.risk} />
            <div className="h-px bg-border" />
            <Slider label="New outbound chats per day" value={p.outbound} min={5} max={120} onChange={upd('outbound')} hint="Conversations you start each day" />
            <Slider label="Inbound chats per day" value={p.inbound} min={0} max={60} onChange={upd('inbound')} hint="Leads who message you first" />
            <Slider label="Reply rate" value={p.reply} min={5} max={90} unit="%" onChange={upd('reply')} hint="How many people answer your outreach" />
            <Slider label="Campaign spike" value={p.spike} min={0} max={300} unit="%" onChange={upd('spike')} hint="Extra volume from a one-day blast" />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={autoFix}>
                <WandSparkles size={14} /> Auto-fix with drip
              </Button>
              <Button variant="outline" size="icon" onClick={() => setP(DEFAULTS)} aria-label="Reset">
                <RotateCcw size={14} />
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Activity size={17} />
                </span>
                <div>
                  <p className="text-sm font-medium">+1 (415) 555-0199</p>
                  <p className="text-xs text-muted-foreground">America/New_York</p>
                </div>
              </div>
              <Tabs value={days} options={['7d', '14d', '30d']} onChange={setDays} render={(d) => d} />
            </div>

            <div className="-mr-px grid grid-cols-2 md:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.l} className="border-b border-r p-4">
                  <p className="text-xs text-muted-foreground">{k.l}</p>
                  <p className={cn('tnum mt-1 text-2xl font-semibold tracking-tight', k.color)}>{k.v}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-[1fr_1.3fr]">
              <div className="border-b p-4 md:border-b-0 md:border-r">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles size={15} /> AI insights
                </p>
                <ul className="mt-2 divide-y">
                  {m.insights.map((i) => (
                    <li key={i.text} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', DOT[i.tone])} />
                      {i.text}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Recommended: </span>
                  {m.tip}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium">Conversations started</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-emerald-500/100" /> Inbound
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-amber-400" /> Outbound · replied
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-red-500" /> Outbound · pending
                  </span>
                </div>
                <div className="mt-3 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={m.rows} barGap={2} margin={{ left: -18, right: 4, top: 8 }}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} interval={days === '30d' ? 4 : days === '14d' ? 1 : 0} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted) / .5)' }}
                        contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', fontSize: 12 }}
                      />
                      <Bar dataKey="Outbound · replied" stackId="o" fill="#FBBF24" animationDuration={300} />
                      <Bar dataKey="Outbound · pending" stackId="o" fill="#EF4444" radius={[2, 2, 0, 0]} animationDuration={300} />
                      <Bar dataKey="Inbound" fill="#10B981" radius={[2, 2, 0, 0]} animationDuration={300} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
