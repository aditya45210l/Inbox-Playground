import { Fragment } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeftRight, Bot, Globe, Inbox, Info, Laptop, RadioTower, Smartphone, Workflow, type LucideIcon } from 'lucide-react'
import { CHANNELS, NODE_ORDER, nodeInfo, type Channel, type NodeId } from '../engine/data'
import { selectNode, useDemo } from '../engine/store'
import { cn } from '../lib/cn'
import { useMedia } from './ui'

function iconFor(id: NodeId, ch: Channel): LucideIcon {
  switch (id) {
    case 'lead':
      return Smartphone
    case 'relay':
      return ch === 'whatsapp' ? Globe : ch === 'imessage' ? Laptop : RadioTower
    case 'bridge':
      return ArrowLeftRight
    case 'crm':
      return Inbox
    case 'workflow':
      return Workflow
    case 'ai':
      return Bot
  }
}

function Connector({ index, horizontal }: { index: number; horizontal: boolean }) {
  const edge = useDemo((s) => s.edge)
  const channel = useDemo((s) => s.channel)
  const live = edge && edge.index === index
  const from = live && edge.dir === -1 ? '100%' : '0%'
  const to = live && edge.dir === -1 ? '0%' : '100%'
  return (
    <div className={cn('relative shrink-0 bg-border', horizontal ? 'mx-1 h-px flex-1' : 'my-1 ml-[25px] h-6 w-px')}>
      {live && (
        <motion.span
          key={edge.key}
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-card"
          style={{ background: CHANNELS[channel].color, ...(horizontal ? { top: '50%' } : { left: '50%' }) }}
          initial={horizontal ? { left: from } : { top: from }}
          animate={horizontal ? { left: to } : { top: to }}
          transition={{ duration: edge.ms / 1000, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

export function FlowMap() {
  const channel = useDemo((s) => s.channel)
  const active = useDemo((s) => s.activeNode)
  const selected = useDemo((s) => s.selectedNode)
  const horizontal = useMedia('(min-width: 1024px)')
  const shown = selected ?? active ?? 'bridge'
  const info = nodeInfo(shown, channel)

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className={cn('flex', horizontal ? 'flex-row items-center' : 'flex-col')}>
        {NODE_ORDER.map((id, i) => {
          const Icon = iconFor(id, channel)
          const n = nodeInfo(id, channel)
          const isActive = active === id
          const isSel = selected === id
          return (
            <Fragment key={id}>
              <button
                onClick={() => selectNode(isSel ? null : id)}
                aria-pressed={isSel}
                className={cn(
                  'flex items-center gap-3 rounded-md border p-2.5 text-left transition-colors lg:w-[150px] lg:flex-col lg:text-center',
                  isActive ? 'border-brand bg-brand/10' : isSel ? 'border-foreground' : 'hover:bg-muted/60',
                )}
              >
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors', isActive ? 'bg-brand text-white' : 'bg-muted text-foreground')}>
                  <Icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-tight">{n.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{n.sub}</span>
                </span>
              </button>
              {i < NODE_ORDER.length - 1 && <Connector index={i} horizontal={horizontal} />}
            </Fragment>
          )
        })}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-md bg-muted/60 p-3">
        <Info size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
        <AnimatePresence mode="wait">
          <motion.div key={shown + channel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <p className="text-sm font-medium">
              {info.title} <span className="font-normal text-muted-foreground">· {selected ? 'selected' : active ? 'happening now' : 'click any step to learn more'}</span>
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{info.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
