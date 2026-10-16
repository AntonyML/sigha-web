import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Clock, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface TimePickerProps {
  /** Time string in 'HH:mm' format (24h) */
  value?: string
  /** Change callback */
  onChange?: (time: string) => void
  /** Input ID */
  id?: string
  /** Input name */
  name?: string
  /** Field label */
  label?: string
  /** Placeholder */
  placeholder?: string
  /** Error text */
  error?: string
  /** Disabled */
  disabled?: boolean
  /** Required */
  required?: boolean
  /** Step in minutes for selector (default 5) */
  minuteStep?: number
  /** Quick presets list */
  presets?: { label: string; time: string }[]
  /** Allow clear button */
  allowClear?: boolean
  /** Additional classes */
  className?: string
  inputClassName?: string
  containerClassName?: string
}

const DEFAULT_TIME_PRESETS = [
  { label: 'Mañana temprano', time: '07:00' },
  { label: 'Mañana', time: '09:00' },
  { label: 'Mediodía', time: '12:00' },
  { label: 'Tarde', time: '14:00' },
  { label: 'Tarde noche', time: '18:00' },
]

export default function TimePicker({
  value = '',
  onChange,
  id,
  name,
  label,
  placeholder = 'Seleccionar hora',
  error,
  disabled = false,
  required = false,
  minuteStep = 5,
  presets = DEFAULT_TIME_PRESETS,
  allowClear = true,
  className = '',
  inputClassName = '',
  containerClassName = '',
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse current hour and minute
  const [selectedHour, selectedMinute] = useMemo(() => {
    if (!value || !value.includes(':')) return ['', '']
    const [h, m] = value.split(':')
    return [h.padStart(2, '0'), m.padStart(2, '0')]
  }, [value])

  // Generate hours 00..23
  const hoursList = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  }, [])

  // Generate minutes 00..59 with step
  const minutesList = useMemo(() => {
    const list: string[] = []
    for (let i = 0; i < 60; i += minuteStep) {
      list.push(String(i).padStart(2, '0'))
    }
    return list
  }, [minuteStep])

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

  const handleSelectHour = useCallback(
    (h: string) => {
      const min = selectedMinute || '00'
      onChange?.(`${h}:${min}`)
    },
    [selectedMinute, onChange]
  )

  const handleSelectMinute = useCallback(
    (m: string) => {
      const hr = selectedHour || '12'
      onChange?.(`${hr}:${m}`)
    },
    [selectedHour, onChange]
  )

  const handleNowJump = useCallback(() => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const roundedMin = Math.round(now.getMinutes() / minuteStep) * minuteStep
    const mm = String(roundedMin >= 60 ? 55 : roundedMin).padStart(2, '0')
    onChange?.(`${hh}:${mm}`)
    setIsOpen(false)
  }, [minuteStep, onChange])

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.('')
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

      {/* Trigger */}
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
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
            allowClear && value && 'pr-8',
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
            <Clock className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className={cn('truncate', !value && 'text-slate-400 dark:text-slate-500')}>
              {value || placeholder}
            </span>
          </div>
        </button>

        {allowClear && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Borrar hora"
            aria-label="Borrar hora"
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
            'absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-900',
            className
          )}
        >
          {/* Quick presets */}
          {presets && presets.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-1 border-b border-slate-100 pb-2 dark:border-slate-800">
              <button
                type="button"
                className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                onClick={handleNowJump}
              >
                Ahora
              </button>
              {presets.map((preset) => (
                <button
                  key={preset.time}
                  type="button"
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={() => {
                    onChange?.(preset.time)
                    setIsOpen(false)
                  }}
                >
                  {preset.time}
                </button>
              ))}
            </div>
          )}

          {/* Hour & Minute Column Selectors */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div>
              <span className="mb-1 block font-semibold text-slate-500 dark:text-slate-400">
                Hora
              </span>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 p-1 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-1">
                  {hoursList.map((h) => {
                    const isSelected = h === selectedHour
                    return (
                      <button
                        key={h}
                        type="button"
                        className={cn(
                          'rounded-lg py-1.5 text-xs font-medium transition-all',
                          isSelected
                            ? 'bg-blue-600 font-bold text-white shadow-sm dark:bg-blue-500'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        )}
                        onClick={() => handleSelectHour(h)}
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
                    const isSelected = m === selectedMinute
                    return (
                      <button
                        key={m}
                        type="button"
                        className={cn(
                          'rounded-lg py-1.5 text-xs font-medium transition-all',
                          isSelected
                            ? 'bg-blue-600 font-bold text-white shadow-sm dark:bg-blue-500'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        )}
                        onClick={() => {
                          handleSelectMinute(m)
                          // Auto close if hour was already chosen
                          if (selectedHour) {
                            setIsOpen(false)
                          }
                        }}
                      >
                        {m}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Apply / Close */}
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {value || '--:--'}
            </span>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
