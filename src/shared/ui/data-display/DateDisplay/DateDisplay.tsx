import React, { useMemo } from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import {
  parseDateIso,
  getIslamicDateInfo,
  MONTH_NAMES_ES,
  WEEKDAYS_SHORT_ES,
} from '@/shared/ui/forms/Calendar/calendarUtils'

export type DateDisplayFormat =
  | 'date' // e.g. "16 Oct 2026"
  | 'time' // e.g. "14:30"
  | 'datetime' // e.g. "16 Oct 2026 · 14:30"
  | 'full' // e.g. "Viernes, 16 de Octubre de 2026"
  | 'full-datetime' // e.g. "Viernes, 16 de Octubre de 2026 a las 14:30"
  | 'day-only' // e.g. "16"
  | 'month-only' // e.g. "Octubre"
  | 'year-only' // e.g. "2026"
  | 'month-year' // e.g. "Octubre 2026"
  | 'day-month' // e.g. "16 Oct"
  | 'relative' // e.g. "Hoy", "Ayer", "Hace 3 días"

export interface DateDisplayProps {
  /** Date object, ISO string, or YYYY-MM-DD string */
  value?: Date | string | null
  /** Format of the output */
  format?: DateDisplayFormat
  /** Calendar system */
  calendarSystem?: 'gregorian' | 'islamic' | 'both'
  /** Show leading icon */
  showIcon?: boolean
  /** Custom icon component */
  icon?: React.ReactNode
  /** Additional CSS class */
  className?: string
  /** Fallback string if value is null or empty */
  fallback?: string
  /** Locale */
  locale?: string
}

export default function DateDisplay({
  value,
  format = 'date',
  calendarSystem = 'gregorian',
  showIcon = false,
  icon,
  className = '',
  fallback = '—',
  locale = 'es',
}: DateDisplayProps) {
  const parsed = useMemo(() => {
    if (!value) return null
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value
    }
    if (typeof value === 'string') {
      const clean = value.trim()
      if (!clean) return null
      // Check ISO or YYYY-MM-DDTHH:mm
      if (clean.includes('T') || clean.includes(' ')) {
        const d = new Date(clean)
        return isNaN(d.getTime()) ? null : d
      }
      return parseDateIso(clean)
    }
    return null
  }, [value])

  const { text, timeStr } = useMemo(() => {
    if (!parsed) return { text: fallback, timeStr: '' }

    const y = parsed.getFullYear()
    const m = parsed.getMonth()
    const d = parsed.getDate()
    const dow = parsed.getDay()
    const hh = String(parsed.getHours()).padStart(2, '0')
    const mm = String(parsed.getMinutes()).padStart(2, '0')
    const timeFormatted = `${hh}:${mm}`

    // Spanish day of week
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

    switch (format) {
      case 'time':
        return { text: timeFormatted, timeStr: timeFormatted }
      case 'day-only':
        return { text: String(d), timeStr: timeFormatted }
      case 'month-only':
        return { text: MONTH_NAMES_ES[m], timeStr: timeFormatted }
      case 'year-only':
        return { text: String(y), timeStr: timeFormatted }
      case 'month-year':
        return { text: `${MONTH_NAMES_ES[m]} ${y}`, timeStr: timeFormatted }
      case 'day-month':
        return { text: `${d} ${MONTH_NAMES_ES[m].slice(0, 3)}`, timeStr: timeFormatted }
      case 'full':
        return { text: `${dayNames[dow]}, ${d} de ${MONTH_NAMES_ES[m]} de ${y}`, timeStr: timeFormatted }
      case 'full-datetime':
        return {
          text: `${dayNames[dow]}, ${d} de ${MONTH_NAMES_ES[m]} de ${y} · ${timeFormatted}`,
          timeStr: timeFormatted,
        }
      case 'datetime':
        return {
          text: `${d} ${MONTH_NAMES_ES[m].slice(0, 3)} ${y} · ${timeFormatted}`,
          timeStr: timeFormatted,
        }
      case 'relative': {
        const now = new Date()
        const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        const startTarget = new Date(y, m, d).getTime()
        const diffDays = Math.round((startTarget - startToday) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return { text: 'Hoy', timeStr: timeFormatted }
        if (diffDays === -1) return { text: 'Ayer', timeStr: timeFormatted }
        if (diffDays === 1) return { text: 'Mañana', timeStr: timeFormatted }
        if (diffDays > 1 && diffDays <= 7) return { text: `En ${diffDays} días`, timeStr: timeFormatted }
        if (diffDays < -1 && diffDays >= -7) return { text: `Hace ${Math.abs(diffDays)} días`, timeStr: timeFormatted }
        return { text: `${d} ${MONTH_NAMES_ES[m].slice(0, 3)} ${y}`, timeStr: timeFormatted }
      }
      case 'date':
      default:
        return { text: `${d} ${MONTH_NAMES_ES[m].slice(0, 3)} ${y}`, timeStr: timeFormatted }
    }
  }, [parsed, format, fallback])

  // Islamic info
  const islamic = useMemo(() => {
    if (!parsed) return null
    if (calendarSystem === 'islamic' || calendarSystem === 'both') {
      return getIslamicDateInfo(parsed, locale)
    }
    return null
  }, [parsed, calendarSystem, locale])

  if (!parsed) {
    return <span className={cn('text-slate-400 dark:text-slate-500', className)}>{fallback}</span>
  }

  const defaultIcon =
    format === 'time' ? (
      <Clock className="h-3.5 w-3.5 text-slate-400" />
    ) : (
      <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
    )

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-slate-800 dark:text-slate-200', className)}
      title={islamic ? `Islámico: ${islamic.formatted}` : undefined}
    >
      {showIcon && (icon || defaultIcon)}

      {calendarSystem === 'islamic' && islamic ? (
        <span>{islamic.formatted}</span>
      ) : (
        <span>{text}</span>
      )}

      {calendarSystem === 'both' && islamic && (
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          ({islamic.day} {islamic.month} {islamic.year})
        </span>
      )}
    </span>
  )
}
