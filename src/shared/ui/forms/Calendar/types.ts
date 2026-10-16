export type CalendarMode = 'single' | 'range' | 'multiple' | 'month'

export type CalendarSystem = 'gregorian' | 'islamic' | 'both'

export interface SpecialDateItem {
  date: string | Date
  label?: string
  badge?: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate'
  dot?: boolean
  tooltip?: string
}

export interface DateRangeValue {
  start?: string | null
  end?: string | null
}

export interface CalendarDayInfo {
  date: Date
  iso: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  islamicDay?: string
  islamicMonth?: string
  special?: SpecialDateItem
  isDisabled: boolean
  isSelected: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
  isHoveredRange: boolean
}

export interface CalendarProps {
  /** Mode of selection */
  mode?: CalendarMode
  /** Currently selected single date (YYYY-MM-DD or Date) */
  value?: string | Date | null
  /** Value for range mode */
  rangeValue?: DateRangeValue
  /** Value for multiple mode */
  multipleValue?: (string | Date)[]
  /** Callback when single date changes */
  onChange?: (date: string, rawDate: Date) => void
  /** Callback when range changes */
  onRangeChange?: (range: { start: string; end: string }) => void
  /** Callback when multiple dates change */
  onMultipleChange?: (dates: string[]) => void
  /** Minimum selectable date */
  minDate?: string | Date
  /** Maximum selectable date */
  maxDate?: string | Date
  /** Specific dates that are disabled */
  disabledDates?: (string | Date)[]
  /** Custom predicate to disable dates */
  isDateDisabled?: (date: Date) => boolean
  /** Disable Saturdays and Sundays */
  disableWeekends?: boolean
  /** Special marked dates (with dots/badges/tooltips) */
  specialDates?: SpecialDateItem[]
  /** Active calendar system */
  calendarSystem?: CalendarSystem
  /** Allow switching calendar system via toggle */
  showCalendarSystemToggle?: boolean
  /** Show fast presets for range selection */
  showPresets?: boolean
  /** Show today button */
  showTodayButton?: boolean
  /** Show clear button */
  showClearButton?: boolean
  /** On clear callback */
  onClear?: () => void
  /** Additional CSS class */
  className?: string
  /** Initial month to display */
  initialDate?: Date | string
  /** Locale, defaults to 'es' */
  locale?: string
}
