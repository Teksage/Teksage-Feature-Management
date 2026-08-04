export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}

/** Normalize DB time `HH:mm:ss` → `HH:mm` for <input type="time"> */
export function toTimeInputValue(time?: string | null) {
  if (!time) return ''
  return time.slice(0, 5)
}

/** Normalize DB date to `YYYY-MM-DD` for <input type="date"> */
export function toDateInputValue(date?: string | null) {
  if (!date) return ''
  return date.slice(0, 10)
}
