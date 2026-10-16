import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { MONTH_NAMES_ES } from '../Calendar/calendarUtils'

export interface MonthPickerProps {
  /** Value string in 'YYYY-MM' format */
  value?: string
  /** Change callback with 'YYYY-MM' */
  onChange?: (monthYear: string, year: number, month: number) => void
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
  /** Allow clear */
  allowClear?: boolean
  /** Min month in 'YYYY-MM' */
  min?: string
  /** Max month in 'YYYY-MM' */
  max?: string
  /** Additional class */
  className?: string
  inputClassName?: string
  containerClassName?: string
}

export default function MonthPicker({
  value = '',
  onChange,
  id,
  name,
  label,
  placeholder = 'Seleccionar mes',
  error,
  disabled = false,
  required = false,
  allowClear = true,
  min,
  max,
  className = '',
  inputClassName = '',
  containerClassName = '',
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Current year & month from value or today
  const [valYear, valMonth] = useMemo(() => {
    if (!value || !value.includes('-')) return [new Date().getFullYear(), new Date().getMonth()]
    const [y, m] = value.split('-')
    return [parseInt(y, 10), parseInt(m, 10) - 1]
  }, [value])

  const [viewYear, setViewYear] = useState(valYear)

  useEffect(() => {
    setViewYear(valYear)
  }, [valYear, isOpen])

  const displayText = useMemo(() => {
    if (!value || !value.includes('-')) return ''
    const [y, m] = value.split('-')
    const mIdx = parseInt(m, 10) - 1
    if (mIdx >= 0 && mIdx < 12) {
      return `${MONTH_NAMES_ES[mIdx]} ${y}`
    }
    return value
  }, [value])

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

  const handleSelectMonth = useCallback(
    (monthIdx: number) => {
      const formatted = `${viewYear}-${String(monthIdx + 1).padStart(2, '0')}`
      onChange?.(formatted, viewYear, monthIdx)
      setIsOpen(false)
    },
    [viewYear, onChange]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.('', viewYear, 0)
    },
    [viewYear, onChange]
  )

  const handleThisMonthJump = useCallback(() => {
    const today = new Date()
    const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    onChange?.(formatted, today.getFullYear(), today.getMonth())
    setIsOpen(false)
  }, [onChange])

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
          onChange={(e) => {
            const val = e.target.value
            const [y, m] = val.split('-')
            onChange?.(val, Number(y) || viewYear, Number(m) ? Number(m) - 1 : 0)
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
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className={cn('truncate', !displayText && 'text-slate-400 dark:text-slate-500')}>
              {displayText || placeholder}
            </span>
          </div>
        </button>

        {allowClear && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Borrar mes"
            aria-label="Borrar mes"
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
            'absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-900',
            className
          )}
        >
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setViewYear((y) => y - 1)}
                aria-label="Año anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setViewYear((y) => y + 1)}
                aria-label="Año siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-3 gap-1.5 py-1">
            {MONTH_NAMES_ES.map((name, idx) => {
              const formattedCandidate = `${viewYear}-${String(idx + 1).padStart(2, '0')}`
              const isSelected = value === formattedCandidate
              const isCurrentMonthNow =
                new Date().getFullYear() === viewYear && new Date().getMonth() === idx

              let isMonthDisabled = false
              if (min && formattedCandidate < min) isMonthDisabled = true
              if (max && formattedCandidate > max) isMonthDisabled = true

              return (
                <button
                  key={name}
                  type="button"
                  disabled={isMonthDisabled}
                  className={cn(
                    'rounded-xl py-2 text-xs font-semibold transition-all',
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                      : isCurrentMonthNow
                        ? 'border border-blue-400 font-bold text-blue-600 dark:border-blue-500 dark:text-blue-400'
                        : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
                    isMonthDisabled && 'cursor-not-allowed opacity-30'
                  )}
                  onClick={() => handleSelectMonth(idx)}
                >
                  {name.slice(0, 3)}
                </button>
              )
            })}
          </div>

          {/* Footer with "Este Mes" */}
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={handleThisMonthJump}
            >
              Este mes
            </button>
            <button
              type="button"
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setIsOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
