/** Input validation — use in all server actions before touching the DB. */

export function sanitizeStr(v: unknown, max = 2000): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

export function validateUUID(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) ? s : null
}

export function validateEmail(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim().toLowerCase().slice(0, 254)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null
}

export function validatePhone(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, 20)
  return /^[+\d\s\-()]{7,20}$/.test(s) ? s : null
}

export function validateName(v: unknown): string | null {
  const s = sanitizeStr(v, 100)
  return s.length >= 2 ? s : null
}

export function validatePrice(v: unknown): number | null {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v)
  if (isNaN(n) || n < 0 || n > 10_000_000) return null
  return Math.round(n * 100) / 100
}

export function validateQty(v: unknown): number | null {
  const n = typeof v === 'string' ? parseInt(v, 10) : Number(v)
  if (isNaN(n) || n < 1 || n > 100_000) return null
  return Math.floor(n)
}

export function safeGet(fd: FormData, key: string, max = 2000): string {
  try {
    const v = fd.get(key)
    return typeof v === 'string' ? v.trim().slice(0, max) : ''
  } catch { return '' }
}
