import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../lib/cn'
import { Card, SectionHead, Switch } from '../components/ui'
import { PRODUCT_URL } from '../components/Site'

// Public list prices (Nov 2026), used for illustration only.
const tierPrice = (subs: number) => (subs >= 10 ? 19 : subs >= 3 ? 22 : 29)
const EXTRA_NUMBER = 9
const MANAGED_IMESSAGE = 250
const PER_MSG_ESTIMATE = 0.01 // rough per-message SMS/API cost

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground">
        {label}
        {sub && <span className="block text-xs">{sub}</span>}
      </span>
      <span className="tnum font-medium">{value}</span>
    </div>
  )
}

function Num({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className="block">
      <span className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tnum font-medium">{value.toLocaleString('en-US')}</span>
      </span>
      <input
        type="range"
        className="range mt-2.5"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--pct' as string]: `${pct}%` }}
      />
    </label>
  )
}

export function Pricing() {
  const [subs, setSubs] = useState(12)
  const [extra, setExtra] = useState(0)
  const [imsg, setImsg] = useState(1)
  const [msgs, setMsgs] = useState(3000)
  const [annual, setAnnual] = useState(false)

  const per = tierPrice(subs)
  const base = subs * per + subs * extra * EXTRA_NUMBER
  const subscription = annual ? (base * 10) / 12 : base
  const monthly = subscription + imsg * MANAGED_IMESSAGE
  const perMessageCost = subs * msgs * PER_MSG_ESTIMATE
  const saving = Math.max(0, perMessageCost - subscription)
  const tier = subs >= 10 ? 'Enterprise agencies' : subs >= 3 ? 'Growing agencies' : 'Freelancers'

  return (
    <section id="pricing" className="scroll-mt-16 border-t bg-surface py-20">
      <div className="container">
        <SectionHead eyebrow="Pricing calculator" title="What would it cost your agency?" sub="A flat price per sub-account with unlimited messages, compared with paying per message." />

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          <Card className="space-y-6 p-5">
            <Num label="Sub-accounts (clients)" value={subs} min={1} max={60} onChange={setSubs} />
            <Num label="Extra WhatsApp numbers per sub-account" value={extra} min={0} max={10} onChange={setExtra} />
            <Num label="Managed iMessage lines" value={imsg} min={0} max={10} onChange={setImsg} />
            <Num label="Messages per sub-account per month" value={msgs} min={500} max={20000} step={500} onChange={setMsgs} />
            <Switch on={annual} onClick={() => setAnnual((v) => !v)} label="Annual billing (2 months free)" />
          </Card>

          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{tier} plan</p>
            <p className="tnum mt-1 text-4xl font-semibold tracking-tight">
              {usd(monthly)}
              <span className="text-base font-normal text-muted-foreground"> / month</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">${per} per sub-account · 5 WhatsApp numbers included each</p>

            <div className="mt-4 divide-y border-y">
              <Row label={`${subs} sub-accounts × $${per}`} value={usd(subs * per)} />
              {extra > 0 && <Row label={`Extra numbers (${subs * extra} × $${EXTRA_NUMBER})`} value={usd(subs * extra * EXTRA_NUMBER)} />}
              {annual && <Row label="Annual discount" value={`−${usd(base - subscription)}`} />}
              {imsg > 0 && <Row label={`Managed iMessage (${imsg} × $${MANAGED_IMESSAGE})`} value={usd(imsg * MANAGED_IMESSAGE)} sub="Mac, iPhone and SIM hosted for you" />}
            </div>

            <div className={cn('mt-4 rounded-md border p-3', saving > 0 ? 'border-emerald-500/30 bg-emerald-500/10' : 'bg-muted/50')}>
              <p className="text-sm text-muted-foreground">If you paid per message instead (about ${PER_MSG_ESTIMATE} each)</p>
              <p className="tnum text-xl font-semibold">{usd(perMessageCost)} / month</p>
              {saving > 0 && <p className="mt-0.5 text-sm font-medium text-emerald-500">About {usd(saving)} saved every month on messaging</p>}
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {['Unlimited messages', 'Inside your CRM', 'White-label ready', 'Workflow triggers'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Prices from the public pricing page (Nov 2026), for illustration. The per-message figure is a rough estimate.{' '}
              <a href={PRODUCT_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-4">
                See current pricing
              </a>
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
