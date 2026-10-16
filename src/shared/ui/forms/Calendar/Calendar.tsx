import React, { useState, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { CalendarProps, CalendarDayInfo, SpecialDateItem } from './types'
import {
  formatDateIso,
  parseDateIso,
  isSameDay,
  isDateInRange,
  isDayDisabled,
  buildMonthDays,
  getIslamicDateInfo,
  MONTH_NAMES_ES,
  WEEKDAYS_SHORT_ES,
  RANGE_PRESETS,
} from './calendarUtils'

export default function Calendar({
  mode = 'single',
  value,
  rangeValue,
  multipleValue = [],
  onChange,
  onRangeChange,
  onMultipleChange,
  minDate,
  maxDate,
  disabledDates = [],
  isDateDisabled,
  disableWeekends = false,
  specialDates = [],
  calendarSystem: initialSystem = 'gregorian',
  showCalendarSystemToggle = true,
  showPresets = false,
  showTodayButton = true,
  showClearButton = false,
  onClear,
  className = '',
  initialDate,
  locale = 'es',
}: CalendarProps) {
  // Parsed initial date for initial view
  const baseDate = useMemo(() => {
    if (initialDate) return parseDateIso(initialDate) ?? new Date()
    if (value) return parseDateIso(value) ?? new Date()
    if (rangeValue?.start) return parseDateIso(rangeValue.start) ?? new Date()
    return new Date()
  }, [initialDate, value, rangeValue?.start])

  const [currentYear, setCurrentYear] = useState(() => baseDate.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(() => baseDate.getMonth())
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [calendarSystem, setCalendarSystem] = useState(initialSystem)
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>(
    mode === 'month' ? 'months' : 'days'
  )

  // Range tracking internal state if not fully controlled
  const [internalRange, setInternalRange] = useState<{ start: string | null; end: string | null }>(() => ({
    start: rangeValue?.start ?? null,
    end: rangeValue?.end ?? null,
  }))

  const effectiveRange = useMemo(() => {
    return {
      start: rangeValue?.start !== undefined ? rangeValue.start : internalRange.start,
      end: rangeValue?.end !== undefined ? rangeValue.end : internalRange.end,
    }
  }, [rangeValue, internalRange])

  // Single parsed value
  const selectedDate = useMemo(() => parseDateIso(value), [value])
  const parsedRangeStart = useMemo(() => parseDateIso(effectiveRange.start), [effectiveRange.start])
  const parsedRangeEnd = useMemo(() => parseDateIso(effectiveRange.end), [effectiveRange.end])

  // Multiple parsed values
  const multipleSelectedSet = useMemo(() => {
    const s = new Set<string>()
    for (const item of multipleValue) {
      const p = parseDateIso(item)
      if (p) s.add(formatDateIso(p))
    }
    return s
  }, [multipleValue])

  // Special dates map for fast lookup
  const specialDatesMap = useMemo(() => {
    const map = new Map<string, SpecialDateItem>()
    for (const item of specialDates) {
      const p = parseDateIso(item.date)
      if (p) map.set(formatDateIso(p), item)
    }
    return map
  }, [specialDates])

  // Islamic info for header
  const islamicHeader = useMemo(() => {
    const midMonthDate = new Date(currentYear, currentMonth, 15)
    return getIslamicDateInfo(midMonthDate, locale)
  }, [currentYear, currentMonth, locale])

  // Navigation handlers
  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }, [currentMonth])

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }, [currentMonth])

  const handleTodayJump = useCallback(() => {
    const today = new Date()
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    if (mode === 'single') {
      const todayIso = formatDateIso(today)
      onChange?.(todayIso, today)
    }
  }, [mode, onChange])

  // Day selection handler
  const handleDayClick = useCallback(
    (day: CalendarDayInfo) => {
      if (day.isDisabled) return

      const iso = day.iso

      if (mode === 'single') {
        onChange?.(iso, day.date)
      } else if (mode === 'range') {
        if (!effectiveRange.start || (effectiveRange.start && effectiveRange.end)) {
          // First click: select start
          const nextRange = { start: iso, end: '' }
          setInternalRange(nextRange)
          onRangeChange?.({ start: iso, end: '' })
        } else {
          // Second click: select end
          const startD = parseDateIso(effectiveRange.start)!
          let finalStart = effectiveRange.start
          let finalEnd = iso
          if (day.date.getTime() < startD.getTime()) {
            finalStart = iso
            finalEnd = effectiveRange.start
          }
          const nextRange = { start: finalStart, end: finalEnd }
          setInternalRange(nextRange)
          onRangeChange?.(nextRange)
        }
      } else if (mode === 'multiple') {
        const nextSet = new Set(multipleSelectedSet)
        if (nextSet.has(iso)) {
          nextSet.delete(iso)
        } else {
          nextSet.add(iso)
        }
        onMultipleChange?.(Array.from(nextSet).sort())
      }
    },
    [
      mode,
      effectiveRange.start,
      effectiveRange.end,
      multipleSelectedSet,
      onChange,
      onRangeChange,
      onMultipleChange,
    ]
  )

  // Generate days array
  const daysGrid = useMemo(() => {
    const rawDays = buildMonthDays(currentYear, currentMonth, true)
    return rawDays.map((d): CalendarDayInfo => {
      const isDisabled = isDayDisabled(d.date, {
        minDate,
        maxDate,
        disabledDates,
        isDateDisabled,
        disableWeekends,
      })

      const isSelected =
        mode === 'single'
          ? isSameDay(d.date, selectedDate)
          : mode === 'multiple'
            ? multipleSelectedSet.has(d.iso)
            : false

      const isRangeStart = mode === 'range' && Boolean(parsedRangeStart && isSameDay(d.date, parsedRangeStart))
      const isRangeEnd = mode === 'range' && Boolean(parsedRangeEnd && isSameDay(d.date, parsedRangeEnd))
      const isInRange =
        mode === 'range' &&
        Boolean(parsedRangeStart && parsedRangeEnd && isDateInRange(d.date, parsedRangeStart, parsedRangeEnd))

      const isHoveredRange =
        mode === 'range' &&
        Boolean(
          parsedRangeStart &&
            !parsedRangeEnd &&
            hoveredDate &&
            isDateInRange(d.date, parsedRangeStart, hoveredDate)
        )

      const special = specialDatesMap.get(d.iso)
      const islamic =
        calendarSystem === 'islamic' || calendarSystem === 'both'
          ? getIslamicDateInfo(d.date, locale)
          : undefined

      return {
        ...d,
        isDisabled,
        isSelected: isSelected || isRangeStart || isRangeEnd,
        isRangeStart,
        isRangeEnd,
        isInRange: isInRange || isHoveredRange,
        isHoveredRange,
        special,
        islamicDay: islamic?.day,
        islamicMonth: islamic?.month,
      }
    })
  }, [
    currentYear,
    currentMonth,
    minDate,
    maxDate,
    disabledDates,
    isDateDisabled,
    disableWeekends,
    mode,
    selectedDate,
    multipleSelectedSet,
    parsedRangeStart,
    parsedRangeEnd,
    hoveredDate,
    specialDatesMap,
    calendarSystem,
    locale,
  ])

  // Color helper for special badges
  const getSpecialBadgeClass = (color?: SpecialDateItem['color']) => {
    switch (color) {
      case 'green':
        return 'bg-emerald-500'
      case 'amber':
        return 'bg-amber-500'
      case 'red':
        return 'bg-rose-500'
      case 'purple':
        return 'bg-purple-500'
      case 'slate':
        return 'bg-slate-500'
      default:
        return 'bg-blue-500'
    }
  }

  // Years for Year picker (currentYear - 20 to currentYear + 20)
  const yearsList = useMemo(() => {
    const list: number[] = []
    const startYear = Math.floor(currentYear / 12) * 12
    for (let i = startYear - 1; i <= startYear + 14; i++) {
      list.push(i)
    }
    return list
  }, [currentYear])

  return (
    <div
      className={cn(
        'calendar-root inline-block w-full max-w-[340px] select-none rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900',
        className
      )}
      role="region"
      aria-label="Calendario"
    >
      {/* Header with Title and Nav */}
      <div className="mb-3 flex items-center justify-between gap-1">
        <div className="flex flex-col">
          <button
            type="button"
            className="flex items-center gap-1.5 text-left text-sm font-semibold text-slate-800 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
            onClick={() => setViewMode((m) => (m === 'days' ? 'months' : 'days'))}
            aria-label="Cambiar vista de mes y año"
          >
            <span>{MONTH_NAMES_ES[currentMonth]}</span>
            <span className="text-slate-500 dark:text-slate-400">{currentYear}</span>
          </button>

          {/* Islamic Hijri Subtitle if Islamic or Both */}
          {(calendarSystem === 'islamic' || calendarSystem === 'both') && (
            <span
              className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
              title={`Calendario Islámico / Hijri: ${islamicHeader.formatted}`}
            >
              {islamicHeader.month} {islamicHeader.year} {islamicHeader.era}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {showCalendarSystemToggle && (
            <button
              type="button"
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors',
                calendarSystem === 'islamic'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : calendarSystem === 'both'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}
              title={`Sistema de calendario: ${calendarSystem === 'islamic' ? 'Hijri' : calendarSystem === 'both' ? 'Dual' : 'Gregoriano'}`}
              onClick={() => {
                setCalendarSystem((curr) =>
                  curr === 'gregorian' ? 'both' : curr === 'both' ? 'islamic' : 'gregorian'
                )
              }}
              aria-label="Alternar sistema de calendario"
            >
              {calendarSystem === 'islamic' ? (
                <Moon className="h-3.5 w-3.5" />
              ) : calendarSystem === 'both' ? (
                <Sparkles className="h-3.5 w-3.5" />
              ) : (
                <Sun className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Range Quick Presets if enabled */}
      {mode === 'range' && showPresets && (
        <div className="mb-3 flex flex-wrap gap-1 border-b border-slate-100 pb-2 dark:border-slate-800">
          {RANGE_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => {
                const val = preset.getValue()
                if (val.start && val.end) {
                  setInternalRange({ start: val.start, end: val.end })
                  onRangeChange?.({ start: val.start, end: val.end })
                }
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Main View: Days Grid */}
      {viewMode === 'days' && (
        <div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {WEEKDAYS_SHORT_ES.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div
            className="mt-1 grid grid-cols-7 gap-1 text-center"
            role="grid"
            onMouseLeave={() => setHoveredDate(null)}
          >
            {daysGrid.map((day) => {
              const isLeadOrTrail = !day.isCurrentMonth
              return (
                <button
                  key={day.iso}
                  type="button"
                  disabled={day.isDisabled}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => {
                    if (mode === 'range' && effectiveRange.start && !effectiveRange.end) {
                      setHoveredDate(day.date)
                    }
                  }}
                  className={cn(
                    'group relative flex h-9 w-full flex-col items-center justify-center rounded-lg text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    // Default state
                    isLeadOrTrail
                      ? 'text-slate-300 dark:text-slate-600'
                      : 'text-slate-700 dark:text-slate-200',
                    // Hover
                    !day.isDisabled &&
                      !day.isSelected &&
                      'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400',
                    // Disabled
                    day.isDisabled && 'cursor-not-allowed opacity-30',
                    // Today marker
                    day.isToday &&
                      !day.isSelected &&
                      'border border-blue-400 font-bold text-blue-600 dark:border-blue-500 dark:text-blue-400',
                    // In-range selection background
                    day.isInRange &&
                      !day.isRangeStart &&
                      !day.isRangeEnd &&
                      'rounded-none bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200',
                    // Range start
                    day.isRangeStart &&
                      'rounded-l-lg rounded-r-none bg-blue-600 font-bold text-white shadow-sm dark:bg-blue-500',
                    // Range end
                    day.isRangeEnd &&
                      'rounded-r-lg rounded-l-none bg-blue-600 font-bold text-white shadow-sm dark:bg-blue-500',
                    // Single or full range match (both start & end on same day)
                    day.isSelected &&
                      (!day.isInRange || (day.isRangeStart && day.isRangeEnd)) &&
                      'rounded-lg bg-blue-600 font-bold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  )}
                  aria-label={`${day.dayNumber} de ${MONTH_NAMES_ES[currentMonth]} de ${currentYear}`}
                  aria-selected={day.isSelected}
                  aria-disabled={day.isDisabled}
                >
                  <span className="leading-none">{day.dayNumber}</span>

                  {/* Dual Islamic day subtext */}
                  {(calendarSystem === 'islamic' || calendarSystem === 'both') && day.islamicDay && (
                    <span
                      className={cn(
                        'text-[8px] leading-none opacity-80',
                        day.isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      {day.islamicDay}
                    </span>
                  )}

                  {/* Special Date Indicator Dot / Badge */}
                  {day.special && (
                    <span
                      className={cn(
                        'absolute bottom-1 h-1.5 w-1.5 rounded-full ring-1 ring-white dark:ring-slate-900',
                        getSpecialBadgeClass(day.special.color)
                      )}
                      title={day.special.label || day.special.tooltip}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Month Picker View */}
      {viewMode === 'months' && (
        <div className="grid grid-cols-3 gap-2 py-2">
          {MONTH_NAMES_ES.map((name, idx) => {
            const isCurrent = idx === currentMonth
            return (
              <button
                key={name}
                type="button"
                className={cn(
                  'rounded-xl py-2.5 text-xs font-semibold transition-all',
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                    : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                )}
                onClick={() => {
                  setCurrentMonth(idx)
                  if (mode === 'month') {
                    const mIso = `${currentYear}-${String(idx + 1).padStart(2, '0')}`
                    onChange?.(mIso, new Date(currentYear, idx, 1))
                  } else {
                    setViewMode('days')
                  }
                }}
              >
                {name.slice(0, 3)}
              </button>
            )
          })}
        </div>
      )}

      {/* Footer controls: Today & Clear */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
        <div>
          {showTodayButton && (
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={handleTodayJump}
              aria-label="Ir a hoy"
            >
              <CalendarIcon className="h-3 w-3" />
              <span>Hoy</span>
            </button>
          )}
        </div>

        <div>
          {showClearButton && (
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium text-slate-500 transition-colors hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
              onClick={() => {
                setInternalRange({ start: null, end: null })
                onClear?.()
              }}
            >
              <RotateCcw className="h-3 w-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
