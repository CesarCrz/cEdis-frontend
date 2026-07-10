const isDev = process.env.NODE_ENV === "development"

export const logger = {
  /** Debug/info — dev only. Never use for sensitive data in production. */
  dev: (...args: unknown[]) => {
    if (isDev) console.log(...args)
  },
  /** Sensitive data (tokens, URLs with codes, emails) — dev only, clearly marked. */
  sensitive: (...args: unknown[]) => {
    if (isDev) console.log("[sensitive]", ...args)
  },
  /** Operational errors — always logged (server: Vercel logs / client: devtools). */
  error: (...args: unknown[]) => {
    console.error(...args)
  },
  /** Non-critical warnings — always logged. */
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },
}
