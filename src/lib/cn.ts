import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function nowTime(offsetMin = 0) {
  const d = new Date(Date.now() + offsetMin * 60_000)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
