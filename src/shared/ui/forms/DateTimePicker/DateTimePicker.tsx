import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, X, Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Calendar } from '../Calendar'
import type { CalendarProps } from '../Calendar/types'
import { parseDateIso, MONTH_NAMES_ES } from '../Calendar/calendarUtils'

export interface DateTimePickerProps
  extends Omit<CalendarProps, 'mode' | 'value' | 'onChange'> {
  /** Value string in 'YYYY-MM-DDTHH:mm' format or Date */
  value?: string | Date | null
  /** Change callback */
  onChange?: (datetime: string, rawDate?: Date) => void
  /** Input ID */
  id?: string
  /** Input name */
  name?: string
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Error text */
  error?: string
  /** Disabled */
  disabled?: boolean
  /** Required */
  required?: boolean
  /** Minute step */
  minuteStep?: number
  /** Allow clearing with X button */
  allowClear?: boolean
  /** Format of display text */
  displayFormat?: 'formatted' | 'iso'
  /** Input class */
  inputClassName?: string
  /** Container class */
  containerClassName?: string
}

export default function DateTimePicker({
  value,
  onChange,
  id,
  name,
  label,
  placeholder = 'Seleccionar fecha y hora',
  error,
  disabled = false,
  required = false,
  minuteStep = 5,
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
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date')
  const containerRef = useRef<HTMLDivElement>(null)

  // Split date and time
  const [datePart, timePart] = useMemo(() => {
    if (!value) return ['', '']
    let str = ''
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return ['', '']
      const y = value.getFullYear()
      const m = String(value.getMonth() + 1).padStart(2, '0')
      const d = String(value.getDate()).padStart(2, '0')
      const hh = String(value.getHours()).padStart(2, '0')
      const mm = String(value.getMinutes()).padStart(2, '0')
      str = `${y}-${m}-${d}T${hh}:${mm}`
    } else {
      str = String(value).trim()
    }
    const [d, t] = str.split('T')
    return [d || '', (t || '').slice(0, 5)]
  }, [value])

  const [tempDate, setTempDate] = useState(datePart)
  const [tempTime, setTempTime] = useState(timePart || '09:00')

  // Synchronize internal state on open or value change
  useEffect(() => {
    setTempDate(datePart)
    if (timePart) {
      setTempTime(timePart)
    }
  }, [datePart, timePart, isOpen])

  // Formatted display
  const displayText = useMemo(() => {
    if (!datePart) return ''
    const parsed = parseDateIso(datePart)
    if (!parsed) return datePart
    const timeFormatted = timePart || '00:00'
    if (displayFormat === 'iso') return `${datePart}T${timeFormatted}`
    return `${parsed.getDate()} ${MONTH_NAMES_ES[parsed.getMonth()].slice(0, 3)} ${parsed.getFullYear()} · ${timeFormatted}`
  }, [datePart, timePart, displayFormat])

  // Close on outside click or Escape
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

  const handleApply = useCallback(() => {
    if (!tempDate) return
    const finalTime = tempTime || '09:00'
    const combined = `${tempDate}T${finalTime}`
    const raw = new Date(`${tempDate}T${finalTime}`)
    onChange?.(combined, raw)
    setIsOpen(false)
  }, [tempDate, tempTime, onChange])

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.('', undefined)
    },
    [onChange]
  )

  // Hours and minutes for time tab
  const hoursList = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  }, [])

  const minutesList = useMemo(() => {
    const list: string[] = []
    for (let i = 0; i < 60; i += minuteStep) {
      list.push(String(i).padStart(2, '0'))
    }
    return list
  }, [minuteStep])

  const [currentH, currentM] = useMemo(() => {
    const [h, m] = (tempTime || '09:00').split(':')
    return [h?.padStart(2, '0') || '09', m?.padStart(2, '0') || '00']
  }, [tempTime])

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

      {/* Trigger */}
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={datePart ? (timePart ? `${datePart}T${timePart}` : datePart) : ''}
          onChange={(e) => {
            const val = e.target.value
            onChange?.(val, val ? new Date(val) : undefined)
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
            allowClear && (datePart || timePart) && 'pr-8',
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

        {allowClear && (datePart || timePart) && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Borrar fecha y hora"
            aria-label="Borrar fecha y hora"
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
            'absolute left-0 top-full z-50 mt-1.5 w-[340px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-900',
            className
          )}
        >
          {/* Tab buttons */}
          <div className="mb-2 flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
            <button
              type="button"
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all',
                activeTab === 'date'
                  ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
              onClick={() => setActiveTab('date')}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Fecha {tempDate ? `(${tempDate.slice(5)})` : ''}</span>
            </button>
            <button
              type="button"
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all',
                activeTab === 'time'
                  ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
              onClick={() => setActiveTab('time')}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Hora {tempTime ? `(${tempTime})` : ''}</span>
            </button>
          </div>

          {/* Date selection tab */}
          {activeTab === 'date' && (
            <div>
              <Calendar
                mode="single"
                value={tempDate}
                onChange={(d) => {
                  setTempDate(d)
                  // Auto advance to time tab if time wasn't explicitly set
                  if (!timePart) {
                    setActiveTab('time')
                  }
                }}
                minDate={minDate}
                maxDate={maxDate}
                disabledDates={disabledDates}
                isDateDisabled={isDateDisabled}
                disableWeekends={disableWeekends}
                specialDates={specialDates}
                calendarSystem={calendarSystem}
                showCalendarSystemToggle={showCalendarSystemToggle}
                showTodayButton={true}
                showClearButton={false}
                locale={locale}
                className="max-w-none border-0 p-0 shadow-none"
              />
            </div>
          )}

          {/* Time selection tab */}
          {activeTab === 'time' && (
            <div className="py-1">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="mb-1 block font-semibold text-slate-500 dark:text-slate-400">
                    Hora
                  </span>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 p-1 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-1">
                      {hoursList.map((h) => {
                        const isSelected = h === currentH
                        return (
                          <button
                            key={h}
                            type="button"
                            aria-label={`Hora ${h}`}
                            className={cn(
                              'rounded-lg py-1 text-xs font-medium transition-all',
                              isSelected
                                ? 'bg-blue-600 font-bold text-white shadow-sm dark:bg-blue-500'
                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                            )}
                            onClick={() => setTempTime(`${h}:${currentM}`)}
                          >
                            {h}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="mb-1 block font-semibold text-slate-500 dark:text-slate-400">
                    Minuto
                  </span>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 p-1 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-1">
                      {minutesList.map((m) => {
                        const isSelected = m === currentM
                        return (
                          <button
                            key={m}
                            type="button"
                            aria-label={`Minuto ${m}`}
                            className={cn(
                              'rounded-lg py-1 text-xs font-medium transition-all',
                              isSelected
                                ? 'bg-blue-600 font-bold text-white shadow-sm dark:bg-blue-500'
                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                            )}
                            onClick={() => setTempTime(`${currentH}:${m}`)}
                          >
                            {m}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer with Apply button */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
            <span className="truncate text-slate-600 dark:text-slate-400">
              {tempDate ? `${tempDate} ${tempTime || '09:00'}` : 'Seleccione fecha'}
            </span>
            <button
              type="button"
              disabled={!tempDate}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={handleApply}
            >
              <Check className="h-3 w-3" />
              <span>Confirmar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
