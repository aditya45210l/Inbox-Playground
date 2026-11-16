import { create } from 'zustand'

export type ThemePref = 'light' | 'dark' | 'system'

const KEY = 'cp-theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* storage may be blocked */
  }
  return 'system'
}

const resolve = (p: ThemePref) => (p === 'system' ? (media.matches ? 'dark' : 'light') : p)

function apply(mode: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

export const useTheme = create<{ pref: ThemePref; mode: 'light' | 'dark' }>(() => {
  const pref = readPref()
  return { pref, mode: resolve(pref) }
})

apply(useTheme.getState().mode)

media.addEventListener('change', () => {
  const { pref } = useTheme.getState()
  if (pref !== 'system') return
  const mode = resolve(pref)
  apply(mode)
  useTheme.setState({ mode })
})

export function toggleTheme() {
  const next = useTheme.getState().mode === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* ignore */
  }
  apply(next)
  useTheme.setState({ pref: next, mode: next })
}
