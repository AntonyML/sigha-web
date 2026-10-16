import type { DateRangeValue, SpecialDateItem } from './types'

/**
 * Format a Date to local 'YYYY-MM-DD' string without timezone shift.
 */
export function formatDateIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Parse 'YYYY-MM-DD' or ISO string to local Date object (midnight local time).
 */
export function parseDateIso(str?: string | Date | null): Date | null {
  if (!str) return null
  if (str instanceof Date) {
    if (isNaN(str.getTime())) return null
    return new Date(str.getFullYear(), str.getMonth(), str.getDate())
  }
  if (typeof str !== 'string') return null
  const clean = str.trim()
  if (!clean) return null

  // Check if it's YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10)
    const month = parseInt(ymdMatch[2], 10) - 1
    const day = parseInt(ymdMatch[3], 10)
    const date = new Date(year, month, day)
    return isNaN(date.getTime()) ? null : date
  }

  // Fallback to standard Date parse
  const d = new Date(clean)
  if (isNaN(d.getTime())) return null
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Compare two dates by year, month, and day.
 */
export function isSameDay(d1?: Date | null, d2?: Date | null): boolean {
  if (!d1 || !d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * Check if a date is within [start, end] inclusive.
 */
export function isDateInRange(target: Date, start?: Date | null, end?: Date | null): boolean {
  if (!start && !end) return false
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()
  if (start && end) {
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
    const min = Math.min(s, e)
    const max = Math.max(s, e)
    return t >= min && t <= max
  }
  if (start) {
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    return t === s
  }
  if (end) {
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
    return t === e
  }
  return false
}

export interface DisabledCheckOptions {
  minDate?: string | Date
  maxDate?: string | Date
  disabledDates?: (string | Date)[]
  isDateDisabled?: (date: Date) => boolean
  disableWeekends?: boolean
}

/**
 * Check if a date is disabled according to restrictions.
 */
export function isDayDisabled(date: Date, options?: DisabledCheckOptions): boolean {
  if (!options) return false

  // Check weekends
  if (options.disableWeekends) {
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return true
  }

  const dIso = formatDateIso(date)
  const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

  // Min date
  if (options.minDate) {
    const min = parseDateIso(options.minDate)
    if (min && dTime < min.getTime()) return true
  }

  // Max date
  if (options.maxDate) {
    const max = parseDateIso(options.maxDate)
    if (max && dTime > max.getTime()) return true
  }

  // Disabled list
  if (options.disabledDates && options.disabledDates.length > 0) {
    for (const item of options.disabledDates) {
      const parsed = parseDateIso(item)
      if (parsed && formatDateIso(parsed) === dIso) {
        return true
      }
    }
  }

  // Custom predicate
  if (options.isDateDisabled && options.isDateDisabled(date)) {
    return true
  }

  return false
}

/**
 * Islamic (Hijri) date details extraction using native Intl.
 */
export interface IslamicDateInfo {
  day: string
  month: string
  year: string
  era: string
  formatted: string
  monthCode?: string
}

const islamicFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getIslamicFormatter(locale: string): Intl.DateTimeFormat {
  if (!islamicFormatterCache.has(locale)) {
    try {
      const fmt = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        era: 'short',
      })
      islamicFormatterCache.set(locale, fmt)
    } catch {
      // Fallback to standard islamic calendar
      const fmt = new Intl.DateTimeFormat(`${locale}-u-ca-islamic`, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        era: 'short',
      })
      islamicFormatterCache.set(locale, fmt)
    }
  }
  return islamicFormatterCache.get(locale)!
}

export function getIslamicDateInfo(date: Date, locale = 'es'): IslamicDateInfo {
  try {
    const formatter = getIslamicFormatter(locale)
    const parts = formatter.formatToParts(date)

    const day = parts.find((p) => p.type === 'day')?.value ?? ''
    const month = parts.find((p) => p.type === 'month')?.value ?? ''
    const year = parts.find((p) => p.type === 'year')?.value ?? ''
    const era = parts.find((p) => p.type === 'era')?.value ?? 'AH'

    return {
      day,
      month,
      year,
      era,
      formatted: `${day} ${month} ${year} ${era}`.trim(),
    }
  } catch {
    return {
      day: '',
      month: '',
      year: '',
      era: '',
      formatted: '',
    }
  }
}

/**
 * Generates the days array for a month view (including previous/next month filler days).
 * Standard 7-column layout starting on Monday (or Sunday if weekStartsOnMonday = false).
 */
export function buildMonthDays(
  year: number,
  month: number,
  weekStartsOnMonday = true
): {
  date: Date
  iso: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
}[] {
  const today = new Date()
  const todayIso = formatDateIso(today)

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  let startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday...
  if (weekStartsOnMonday) {
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
  }

  const days: {
    date: Date
    iso: string
    dayNumber: number
    isCurrentMonth: boolean
    isToday: boolean
    isWeekend: boolean
  }[] = []

  // Trailing days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const d = new Date(year, month - 1, dayNum)
    const dDow = d.getDay()
    days.push({
      date: d,
      iso: formatDateIso(d),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: formatDateIso(d) === todayIso,
      isWeekend: dDow === 0 || dDow === 6,
    })
  }

  // Days of current month
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    const cur = new Date(year, month, d)
    const curDow = cur.getDay()
    days.push({
      date: cur,
      iso: formatDateIso(cur),
      dayNumber: d,
      isCurrentMonth: true,
      isToday: formatDateIso(cur) === todayIso,
      isWeekend: curDow === 0 || curDow === 6,
    })
  }

  // Leading days of next month to complete the grid (multiples of 7, up to 35 or 42)
  const remaining = (7 - (days.length % 7)) % 7
  for (let nextDay = 1; nextDay <= remaining; nextDay++) {
    const d = new Date(year, month + 1, nextDay)
    const dDow = d.getDay()
    days.push({
      date: d,
      iso: formatDateIso(d),
      dayNumber: nextDay,
      isCurrentMonth: false,
      isToday: formatDateIso(d) === todayIso,
      isWeekend: dDow === 0 || dDow === 6,
    })
  }

  return days
}

export const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const WEEKDAYS_SHORT_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export const RANGE_PRESETS = [
  {
    id: 'today',
    label: 'Hoy',
    getValue: (): DateRangeValue => {
      const today = formatDateIso(new Date())
      return { start: today, end: today }
    },
  },
  {
    id: 'yesterday',
    label: 'Ayer',
    getValue: (): DateRangeValue => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const iso = formatDateIso(yesterday)
      return { start: iso, end: iso }
    },
  },
  {
    id: 'this_week',
    label: 'Esta semana',
    getValue: (): DateRangeValue => {
      const now = new Date()
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
      const monday = new Date(now.setDate(diff))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return { start: formatDateIso(monday), end: formatDateIso(sunday) }
    },
  },
  {
    id: 'last_7_days',
    label: 'Últimos 7 días',
    getValue: (): DateRangeValue => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 6)
      return { start: formatDateIso(start), end: formatDateIso(end) }
    },
  },
  {
    id: 'this_month',
    label: 'Este mes',
    getValue: (): DateRangeValue => {
      const now = new Date()
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { start: formatDateIso(first), end: formatDateIso(last) }
    },
  },
  {
    id: 'last_month',
    label: 'Mes anterior',
    getValue: (): DateRangeValue => {
      const now = new Date()
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const last = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: formatDateIso(first), end: formatDateIso(last) }
    },
  },
  {
    id: 'last_30_days',
    label: 'Últimos 30 días',
    getValue: (): DateRangeValue => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 29)
      return { start: formatDateIso(start), end: formatDateIso(end) }
    },
  },
  {
    id: 'this_year',
    label: 'Este año',
    getValue: (): DateRangeValue => {
      const now = new Date()
      const first = new Date(now.getFullYear(), 0, 1)
      const last = new Date(now.getFullYear(), 11, 31)
      return { start: formatDateIso(first), end: formatDateIso(last) }
    },
  },
]
