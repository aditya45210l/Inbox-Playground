import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { resetDemo, setAutoMode } from '../engine/store'

const KEY = 'cp-tour-done'

// Six short steps. Every step highlights something on screen.
const STEPS: DriveStep[] = [
  {
    element: '[data-tour="phone"]',
    popover: {
      title: "1. Your customer's phone",
      description: 'This is what your customer sees. Type a message at the bottom and tap the green send button, or tap one of the "Try saying" suggestions.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="crm-thread"]',
    popover: {
      title: '2. It arrives in your inbox',
      description: 'The message shows up here a moment later. Point at the small "Processing" label under it to see every step it went through.',
      side: 'left',
    },
  },
  {
    element: '[data-tour="crm-details"]',
    popover: {
      title: '3. The contact updates itself',
      description: 'Tags, the sales stage and the automation steps fill in on their own as the message is handled.',
      side: 'left',
    },
  },
  {
    element: '[data-tour="crm-composer"]',
    popover: {
      title: '4. Reply yourself, or let AI do it',
      description: 'Type here and press Send to answer as your team. The "AI auto-reply" button lets an AI answer for you instead.',
      side: 'top',
    },
  },
  {
    element: '[data-tour="controls"]',
    popover: {
      title: '5. Watch or chat',
      description: 'Auto-play runs a demo conversation by itself. It is off now, so you can chat yourself and everything happens automatically. Want to go slower? Turn on Step-by-step in Options and press Next.',
      side: 'bottom',
    },
  },
  {
    element: '[data-tour="settings"]',
    popover: {
      title: '6. Try other channels',
      description: 'Switch between WhatsApp, iMessage and SMS, and open Options for extras like buttons and voice notes. That is it, have fun!',
      side: 'bottom',
    },
  },
]

export function startTour() {
  resetDemo()
  setAutoMode(false)
  const d = driver({
    showProgress: true,
    progressText: '{{current}} of {{total}}',
    nextBtnText: 'Next',
    prevBtnText: 'Back',
    doneBtnText: 'Start',
    allowClose: true,
    overlayColor: '#000',
    overlayOpacity: 0.78,
    stagePadding: 8,
    stageRadius: 10,
    popoverClass: 'cp-tour',
    steps: STEPS,
    onDestroyed: () => {
      try {
        localStorage.setItem(KEY, '1')
      } catch {
        /* ignore */
      }
    },
  })
  d.drive()
}

export function tourSeen() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}
