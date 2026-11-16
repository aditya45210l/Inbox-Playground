import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ExternalLink, MessageSquare, ShieldCheck, Workflow } from 'lucide-react'
import { CHANNELS, NODE_ORDER, nodeInfo, type Channel } from '../engine/data'
import { Footer, PlaygroundLink, ProductLink, SiteNav } from '../components/Site'
import { Avatar, Badge, Card, ChannelIcon, LiveDot, SectionHead, buttonClass } from '../components/ui'
import { Pricing } from '../sections/Pricing'

const FEED: { name: string; ch: Channel; text: string; hue: number }[] = [
  { name: 'Sofia Alvarez', ch: 'whatsapp', text: 'Perfect, see you Thursday at 11!', hue: 120 },
  { name: 'Eddy Chen', ch: 'imessage', text: 'Sounds good. What time works?', hue: 180 },
  { name: 'Marcus Holt', ch: 'sms', text: 'Can you resend the invoice link?', hue: 240 },
  { name: 'Priya Raman', ch: 'whatsapp', text: 'How much is teeth whitening?', hue: 0 },
  { name: 'Liam Ortiz', ch: 'imessage', text: 'Booked! Thanks so much', hue: 60 },
  { name: 'Ana Costa', ch: 'whatsapp', text: 'Do you have a slot tomorrow?', hue: 300 },
  { name: 'Ken Watanabe', ch: 'sms', text: 'Running 5 min late, sorry!', hue: 120 },
]

function InboxPreview() {
  const [n, setN] = useState(4)
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => v + 1), 2400)
    return () => window.clearInterval(id)
  }, [])
  const rows = Array.from({ length: 5 }, (_, i) => ({ ...FEED[(n - i) % FEED.length], key: n - i }))
  return (
    <Card className="w-full max-w-md overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-semibold">Conversations</p>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <LiveDot /> All channels
        </span>
      </div>
      <div className="divide-y">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((r, i) => (
            <motion.div
              key={r.key}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              className={i === 0 ? 'flex items-center gap-3 bg-brand/10 px-4 py-3' : 'flex items-center gap-3 px-4 py-3'}
            >
              <span className="relative">
                <Avatar name={r.name} hue={r.hue} size={34} />
                <span className="absolute -bottom-0.5 -right-0.5">
                  <ChannelIcon channel={r.ch} size="xs" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">{r.text}</p>
              </div>
              <span className="text-xs text-muted-foreground">{i === 0 ? 'now' : `${i * 3}m`}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  )
}

const EXPLORE = [
  {
    icon: MessageSquare,
    title: 'Playground',
    body: 'Chat as a lead on the phone and reply from the CRM as your team. Hover any message to see how it was processed.',
    cta: 'Open playground',
    href: '/playground',
    external: true,
  },
  {
    icon: Workflow,
    title: 'Workflow walkthrough',
    body: 'A guided, step-by-step view of one message travelling from the phone to the CRM, the workflow and the AI agent.',
    cta: 'Start walkthrough',
    href: '/walkthrough',
  },
  {
    icon: ShieldCheck,
    title: 'Ban protection',
    body: 'Simulate how a WhatsApp number is used and watch the risk score, chart and AI insights react.',
    cta: 'Check ban risk',
    href: '/ban-protection',
  },
]

const CHANNEL_POINTS: Record<Channel, string[]> = {
  whatsapp: ['Scan a QR code, keep your number', 'Buttons, voice notes, groups', 'Local proxies and drip pacing'],
  imessage: ['Real blue bubbles and read receipts', 'Hosted Mac, iPhone and US/AU SIM', 'Managed plan, monitored 24/7'],
  sms: ['Text from your own SIM', 'No Twilio, no per-message fees', 'Works where telephony is limited'],
}

export default function Landing() {
  useEffect(() => {
    document.title = 'Inbox Playground'
  }, [])

  return (
    <>
      <SiteNav />
      <main>
        {/* hero */}
        <section className="container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Badge className="text-muted-foreground">Interactive concept · no signup</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">See how every WhatsApp, iMessage and SMS lands in your CRM</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Send a message as a lead, watch it appear in Conversations, see the workflow fire and the AI reply. Every step is visible, nothing is hidden.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PlaygroundLink className={buttonClass('default', 'lg')} children="Try the playground" />
              <a href="/walkthrough" className={buttonClass('outline', 'lg')}>
                Walk through the workflow <ArrowRight size={15} />
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Simulated demo. No real messages are sent.</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <InboxPreview />
          </div>
        </section>

        {/* explore */}
        <section className="border-t bg-surface py-20">
          <div className="container">
            <SectionHead eyebrow="Explore" title="Three ways to try it" sub="Pick the one that answers your question fastest." />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {EXPLORE.map((e) => (
                <Card key={e.title} className="flex flex-col p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border bg-card">
                    <e.icon size={17} />
                  </span>
                  <h3 className="mt-4 font-semibold">{e.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{e.body}</p>
                  <a
                    href={e.href}
                    target={e.external ? '_blank' : undefined}
                    rel={e.external ? 'noopener' : undefined}
                    className={buttonClass(e.external ? 'default' : 'outline', 'md', 'mt-5 w-full')}
                  >
                    {e.cta} {e.external ? <ExternalLink size={14} /> : <ArrowRight size={14} />}
                  </a>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* how it works */}
        <section className="border-t py-20">
          <div className="container">
            <SectionHead eyebrow="How it works" title="What happens to a message in under a second" />
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NODE_ORDER.map((id, i) => {
                const n = nodeInfo(id, 'whatsapp')
                return (
                  <li key={id} className="rounded-lg border p-5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold">{i + 1}</span>
                    <h3 className="mt-3 font-semibold">{n.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* channels */}
        <section className="border-t bg-surface py-20">
          <div className="container">
            <SectionHead eyebrow="Channels" title="Three channels, one inbox" sub="Each channel connects differently, but every message ends up on the same contact and the same thread." />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {(['whatsapp', 'imessage', 'sms'] as Channel[]).map((c) => (
                <Card key={c} className="p-5">
                  <div className="flex items-center gap-3">
                    <ChannelIcon channel={c} size="md" />
                    <h3 className="font-semibold">{CHANNELS[c].label}</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{nodeInfo('relay', c).body}</p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {CHANNEL_POINTS[c].map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-foreground" /> {p}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Pricing />

        {/* cta */}
        <section className="border-t py-20">
          <div className="container flex flex-col items-center text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Try it yourself in under a minute</h2>
            <p className="mt-3 max-w-lg text-muted-foreground">Open the playground, type as a lead, and watch your message arrive in the CRM.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <PlaygroundLink className={buttonClass('default', 'lg')} children="Open the playground" />
              <ProductLink className={buttonClass('outline', 'lg')} children="Get the real product" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">This playground is a demo. The real WhatsApp, iMessage and SMS integration is at goghl.ai.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
