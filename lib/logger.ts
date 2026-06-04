/**
 * Dukaanify — Structured Logger
 * Outputs JSON logs in production, readable logs in development.
 * Drop-in ready for Sentry, Datadog, or any log aggregator.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  route?: string
  userId?: string
  businessId?: string
  error?: string
  stack?: string
  [key: string]: unknown
}

const isDev = process.env.NODE_ENV !== 'production'

function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  }

  // Never log sensitive fields
  const safe = sanitizeLog(entry)

  if (isDev) {
    const color = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' }[level]
    console[level === 'debug' ? 'log' : level](
      `${color}[${level.toUpperCase()}]\x1b[0m ${safe.timestamp} — ${safe.message}`,
      Object.keys(meta).length ? meta : ''
    )
  } else {
    // Production: structured JSON for log aggregators
    process.stdout.write(JSON.stringify(safe) + '\n')
  }
}

function sanitizeLog(entry: LogEntry): LogEntry {
  const SENSITIVE = ['password', 'token', 'secret', 'key', 'authorization', 'cookie']
  const cleaned = { ...entry }
  for (const key of SENSITIVE) {
    if (key in cleaned) cleaned[key] = '[REDACTED]'
  }
  return cleaned
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info:  (msg: string, meta?: Record<string, unknown>) => log('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),

  /** Log a caught error with full context */
  exception(error: unknown, context: { route?: string; userId?: string; action?: string } = {}) {
    const err = error instanceof Error ? error : new Error(String(error))
    log('error', err.message, {
      ...context,
      error: err.message,
      stack: isDev ? err.stack : undefined,
      name: err.name,
    })
  },
}
