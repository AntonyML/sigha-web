import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Calendar as CalendarIcon, ArrowRight, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Calendar } from '../Calendar'
import type { CalendarProps, DateRangeValue } from '../Calendar/types'
import { parseDateIso, MONTH_NAMES_ES } from '../Calendar/calendarUtils'

export interface DateRangePickerProps extends Omit<CalendarProps, 'mode' | 'value' | 'onChange' | 'rangeValue' | 'onRangeChange'> {
  /** Range value with start and end in ISO format */
  value?: DateRangeValue
  /** Callback when range changes */
  onChange?: (range: { start: string; end: string }) => void
  /** Input ID */
  id?: string
  /** Input name */
  name?: string
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Error message */
  error?: string
  /** Disabled */
  disabled?: boolean
  /** Required */
  required?: boolean
  /** Allow clear button */
  allowClear?: boolean
  /** Input class */
  inputClassName?: string
  /** Container class */
  containerClassName?: string
}

export default function DateRangePicker({
  value,
  onChange,
  id,
  name,
  label,
  placeholder = 'Seleccionar rango de fechas',
  error,
  disabled = false,
  required = false,
  allowClear = true,
  inputClassName = '',
  containerClassName = '',
  className = '',
  minDate,
  maxDate,
  disabledDates,
  isDateDisabled,
  disableWeekends,
  specialDates,
  calendarSystem = 'gregorian',
  showCalendarSystemToggle = true,
  locale = 'es',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const formatSingle = (iso?: string | null) => {
    if (!iso) return ''
    const p = parseDateIso(iso)
    if (!p) return iso
    return `${p.getDate()} ${MONTH_NAMES_ES[p.getMonth()].slice(0, 3)} ${p.getFullYear()}`
  }

  const displayText = useMemo(() => {
    if (!value?.start && !value?.end) return ''
    if (value.start && value.end) {
      if (value.start === value.end) return formatSingle(value.start)
      return `${formatSingle(value.start)} — ${formatSingle(value.end)}`
    }
    if (value.start) return `${formatSingle(value.start)} — ...`
    return `... — ${formatSingle(value.end)}`
  }, [value])

  // Close on click outside or escape
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleRangeChange = useCallback(
    (range: { start: string; end: string }) => {
      onChange?.(range)
      if (range.start && range.end) {
        // Auto close when range is complete
        setIsOpen(false)
      }
    },
    [onChange]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.({ start: '', end: '' })
    },
    [onChange]
  )

  return (
    <div className={cn('relative w-full', containerClassName)} ref={containerRef}>
      {label && (
        <div className="mb-1.5 flex items-center gap-1">
          <label
            htmlFor={id}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
          {required && <span aria-hidden="true" className="text-rose-500 font-bold text-xs">*</span>}
        </div>
      )}

      {/* Trigger button */}
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={value?.start && value?.end ? `${value.start} - ${value.end}` : (value?.start || '')}
          onChange={(e) => {
            const [start, end] = e.target.value.split(/\s*-\s*|\s*,\s*/)
            onChange?.({ start: start?.trim() || '', end: end?.trim() || '' })
          }}
          aria-required={required}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="false"
        />
        <button
          type="button"
          id={id ? `${id}-trigger` : undefined}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:bg-slate-900',
            allowClear && (value?.start || value?.end) && 'pr-8',
            error
              ? 'border-rose-400 text-rose-900 focus:ring-rose-500 dark:border-rose-700 dark:text-rose-200'
              : 'border-slate-200 text-slate-800 hover:border-slate-300 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-600',
            disabled && 'cursor-not-allowed bg-slate-50 opacity-60 dark:bg-slate-800/50',
            inputClassName
          )}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className={cn('truncate', !displayText && 'text-slate-400 dark:text-slate-500')}>
              {displayText || placeholder}
            </span>
          </div>
        </button>

        {allowClear && (value?.start || value?.end) && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Borrar rango"
            aria-label="Borrar rango"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{error}</p>}

      {/* Popover */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-1.5 animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          <Calendar
            mode="range"
            rangeValue={value}
            onRangeChange={handleRangeChange}
            showPresets={true}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            isDateDisabled={isDateDisabled}
            disableWeekends={disableWeekends}
            specialDates={specialDates}
            calendarSystem={calendarSystem}
            showCalendarSystemToggle={showCalendarSystemToggle}
            showTodayButton={true}
            showClearButton={allowClear}
            onClear={() => {
              onChange?.({ start: '', end: '' })
              setIsOpen(false)
            }}
            locale={locale}
          />
        </div>
      )}
    </div>
  )
}
