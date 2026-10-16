import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Calendar } from '../Calendar'
import type { CalendarProps } from '../Calendar/types'
import { parseDateIso, MONTH_NAMES_ES } from '../Calendar/calendarUtils'

export interface DatePickerProps extends Omit<CalendarProps, 'mode' | 'value' | 'onChange'> {
  /** Value string in 'YYYY-MM-DD' format or Date */
  value?: string | Date | null
  /** Change callback with new ISO date string */
  onChange?: (date: string, rawDate?: Date) => void
  /** Input name */
  name?: string
  /** Input ID */
  id?: string
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Validation error text */
  error?: string
  /** Disabled state */
  disabled?: boolean
  /** Required attribute */
  required?: boolean
  /** Allows clearing with X button */
  allowClear?: boolean
  /** Native input fallback or hidden input for forms */
  nameFallback?: boolean
  /** Format of display text in input */
  displayFormat?: 'iso' | 'formatted' | 'full'
  /** Input class */
  inputClassName?: string
  /** Container class */
  containerClassName?: string
  /** Accessible label */
  'aria-label'?: string
}

export default function DatePicker({
  value,
  onChange,
  name,
  id,
  label,
  placeholder = 'Seleccionar fecha',
  error,
  disabled = false,
  required = false,
  allowClear = true,
  displayFormat = 'formatted',
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
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Current string representation
  const stringValue = typeof value === 'string' ? value : value instanceof Date ? value.toISOString().split('T')[0] : ''

  // Formatted display text
  const displayText = React.useMemo(() => {
    if (!stringValue) return ''
    const parsed = parseDateIso(stringValue)
    if (!parsed) return stringValue
    if (displayFormat === 'iso') return stringValue
    if (displayFormat === 'full') {
      return `${parsed.getDate()} de ${MONTH_NAMES_ES[parsed.getMonth()]} de ${parsed.getFullYear()}`
    }
    return `${parsed.getDate()} ${MONTH_NAMES_ES[parsed.getMonth()].slice(0, 3)} ${parsed.getFullYear()}`
  }, [stringValue, displayFormat])

  // Close on outside click
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

  const handleSelectDate = useCallback(
    (isoDate: string, rawDate: Date) => {
      onChange?.(isoDate, rawDate)
      setIsOpen(false)
    },
    [onChange]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.('', undefined)
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

      {/* Trigger button/input */}
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          aria-label={ariaLabel}
          value={stringValue}
          onChange={(e) => {
            const val = e.target.value
            onChange?.(val, val ? (parseDateIso(val) || undefined) : undefined)
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
            allowClear && stringValue && 'pr-8',
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

        {allowClear && stringValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Borrar selección"
            aria-label="Borrar selección"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{error}</p>}

      {/* Floating Popover Calendar */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-1.5 animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          <Calendar
            mode="single"
            value={stringValue}
            onChange={handleSelectDate}
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
              onChange?.('', undefined)
              setIsOpen(false)
            }}
            locale={locale}
          />
        </div>
      )}
    </div>
  )
}
