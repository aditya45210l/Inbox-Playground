# Inbox Playground

**An interactive, no-signup playground that shows how WhatsApp, iMessage and SMS messages flow into a CRM inbox, trigger a workflow and get an AI reply, step by step.**

Built as an unofficial product concept for [GoGHL](https://goghl.ai), a GoHighLevel marketplace app that connects WhatsApp, iMessage and SMS to the GoHighLevel Conversations inbox. Everything runs in the browser. No accounts, no backend, and no real messages are sent.

> Their landing page lists a lot of features. This playground lets a visitor *use* them in about 60 seconds instead of reading about them.

<!-- Add a screenshot or GIF here, e.g. docs/playground.gif -->

---

## Features

### Playground (`/playground`)
- **A phone next to a CRM inbox.** Type as the customer on a realistic WhatsApp, iMessage or SMS phone and watch the message land in a CRM Conversations screen.
- **Live processing trace.** Every message has a "Processing" label. Hover it to see each step (received → contact matched → added to inbox → workflow trigger → tag → AI reply → delivered) with simulated timings.
- **Reply as the team.** Send from the CRM composer and the reply travels back to the phone with sent, delivered and read receipts.
- **Auto-play or step-by-step.** With Auto-play on, everything runs by itself. With it off, each stage waits for **Next**, so people can follow the flow at their own pace.
- **AI auto-reply** with simple intent detection (pricing, booking, call-back, greeting), quick-reply buttons, voice notes, varied greetings (spintax) and human-like pacing (drip mode).
- **Live contact panel.** Tags, the pipeline stage and the active workflow update as the message is processed.
- **Guided tutorial** (6 steps), **keyboard shortcuts**, and in-phone "Try saying" suggestions.

### Workflow walkthrough (`/walkthrough`)
An animated map of the message path (phone → relay → bridge → CRM → workflow → AI and back), synced with the phone and the inbox. Click any step for a plain-English explanation.

### Ban protection (`/ban-protection`)
A risk sandbox: sliders for outbound volume, reply rate and campaign spikes drive a risk score, KPIs, a daily chart and AI-style insights. **Auto-fix with drip** animates the numbers back to safe values.

### Landing page (`/`)
An overview, how it works, the channels, and a pricing calculator comparing flat pricing with per-message costs.

### Everywhere
- **Light and dark themes.** Follows the system setting by default, with a toggle that is remembered.
- Responsive layout, reduced-motion support, and accessible labels.

## Keyboard shortcuts (playground)

| Key | Action |
|---|---|
| `N` or `→` | Next step (when Auto-play is off) |
| `A` | Auto-play on / off |
| `1` `2` `3` | WhatsApp / iMessage / SMS |
| `R` | Replay the demo |
| `T` | Light / dark theme |
| `?` | Show the tutorial |

## Tech stack

| | |
|---|---|
| Framework | React 19 + TypeScript, Vite |
| Styling | Tailwind CSS with the [shadcn/ui](https://ui.shadcn.com) "Zinc" design tokens (light + dark) |
| State | Zustand |
| Animation | Motion (formerly Framer Motion) |
| Charts | Recharts |
| Tutorial | driver.js |
| Icons / avatars | lucide-react, DiceBear (generated locally) |

## How it works

The core is a small **scenario engine** in [`src/engine/store.ts`](src/engine/store.ts).

- **Each message is a list of timed steps** (`{ wait, run, gate? }`). One timer runner plays them with pause, resume and reset.
- **One shared store** drives the phone, the inbox, the flow map, tags, pipeline and workflow, so every panel moves together.
- **Gates** turn the same script into a step-by-step experience. When Auto-play is off, the player stops before each gated step until the user presses Next. Turning Auto-play off during the scripted demo completes the current message and hands control back to the user, so nothing gets stuck.
- **Each message carries a trace** (its processing steps with simulated timings). The hover popover reads it live.

```
src/
├─ engine/        data.ts (channels, copy) · store.ts (scenario player + state)
├─ components/    PhoneMock · CrmApp · FlowMap · ModeControls · tour · ui (design system) · Site (nav/footer)
├─ pages/         Landing · Playground · Walkthrough · BanProtection
├─ sections/      Pricing
└─ lib/           theme (light/dark) · cn (helpers)
```

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Deploy `dist/` to any static host. `vercel.json` includes the rewrite needed for the client-side routes.

## Disclaimer

This is an independent, unofficial concept built as a portfolio project. It is not affiliated with or endorsed by GoGHL, HighLevel, WhatsApp or Apple. All data, names and timings are simulated. Prices were taken from GoGHL's public pricing page in November 2026, for illustration only. For the real product, visit [goghl.ai](https://goghl.ai).

---

Built with ♥ by **Aditya Singh**
