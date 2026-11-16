export type Channel = 'whatsapp' | 'imessage' | 'sms'
export type NodeId = 'lead' | 'relay' | 'bridge' | 'crm' | 'workflow' | 'ai'

export const NODE_ORDER: NodeId[] = ['lead', 'relay', 'bridge', 'crm', 'workflow', 'ai']

export const CHANNELS: Record<Channel, { label: string; short: string; color: string; tagline: string }> = {
  whatsapp: { label: 'WhatsApp', short: 'WA', color: '#25D366', tagline: 'Scan a QR, your existing number becomes a CRM channel' },
  imessage: { label: 'iMessage', short: 'iM', color: '#0A84FF', tagline: 'Blue bubbles from a hosted Mac + iPhone' },
  sms: { label: 'SMS', short: 'SMS', color: '#34C759', tagline: 'Texts from your own SIM, no per-message fees' },
}

export interface NodeInfo {
  title: string
  sub: string
  body: string
}

const RELAY: Record<Channel, NodeInfo> = {
  whatsapp: {
    title: 'Local proxy',
    sub: 'US residential IP',
    body: 'Your number connects like WhatsApp Web (scan a QR once). Traffic leaves through a residential IP in your country, so the number behaves like a normal phone and stays healthy.',
  },
  imessage: {
    title: 'Hosted Mac',
    sub: 'Mac + iPhone + SIM',
    body: 'Apple has no public iMessage API, so a real Mac and iPhone with a US/AU SIM send and receive the blue bubbles. On the managed plan these devices are hosted and monitored 24/7.',
  },
  sms: {
    title: 'Android + SIM',
    sub: 'Your own number',
    body: 'An Android phone with your SIM sends and receives the texts. No Twilio account, no registration queue, no per-message fees.',
  },
}

export function nodeInfo(id: NodeId, ch: Channel): NodeInfo {
  const label = CHANNELS[ch].label
  switch (id) {
    case 'lead':
      return {
        title: "Lead's phone",
        sub: `${label} app`,
        body: `The customer texts like they always do, in ${label}. Nothing to install, no links to click.`,
      }
    case 'relay':
      return RELAY[ch]
    case 'bridge':
      return {
        title: 'Sync bridge',
        sub: 'Match · dedupe · retry',
        body: 'Turns each chat message into a CRM message and back. Matches the contact by phone number, keeps one thread across channels, blocks duplicates and retries if a hop fails.',
      }
    case 'crm':
      return {
        title: 'CRM inbox',
        sub: 'Conversations tab',
        body: 'The message appears in Conversations like a built-in channel, on the right contact record. Your team can reply from here too.',
      }
    case 'workflow':
      return {
        title: 'Workflow',
        sub: 'Triggers & actions',
        body: `An "Inbound ${label} message" trigger fires: tag the lead, move the pipeline stage, notify staff, or hand off to AI.`,
      }
    case 'ai':
      return {
        title: 'AI agent',
        sub: 'Any AI, plugged in',
        body: 'The CRM\'s own AI, GPT, an n8n bot or any closer bot drafts the reply. It travels back the same path in under a second.',
      }
  }
}

export interface InboxItem {
  name: string
  channel: Channel
  preview: string
  ago: string
  unread?: number
  hue: number
}

export const OTHER_THREADS: InboxItem[] = [
  { name: 'Sofia Alvarez', channel: 'whatsapp', preview: 'Perfect, see you Thursday at 11!', ago: '2m', hue: 280 },
  { name: 'Eddy Chen', channel: 'imessage', preview: 'Sounds good. What time works?', ago: '9m', unread: 1, hue: 30 },
  { name: 'Marcus Holt', channel: 'sms', preview: 'Can you resend the invoice link?', ago: '1h', hue: 160 },
  { name: 'Maya Brooks', channel: 'whatsapp', preview: 'Thanks so much 🙏', ago: '3h', hue: 340 },
  { name: 'Jordan Rivera', channel: 'sms', preview: 'Is parking available?', ago: '5h', hue: 200 },
]

export const LEAD = {
  name: 'Priya Raman',
  first: 'Priya',
  phone: '+1 (415) 555-0142',
  email: 'priya.r@example.com',
  source: 'Facebook Ad · Whitening promo',
}

export const BUSINESS = { name: 'Bright Smile Dental', initials: 'BS' }

export const SLOTS = ['Tue 2:00 PM', 'Thu 11:00 AM']
