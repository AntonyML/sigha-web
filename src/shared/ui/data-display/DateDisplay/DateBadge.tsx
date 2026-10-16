import React from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import DateDisplay, { type DateDisplayProps } from './DateDisplay'

export interface DateBadgeProps extends DateDisplayProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'outline'
  size?: 'sm' | 'md'
}

export default function DateBadge({
  variant = 'default',
  size = 'md',
  className = '',
  showIcon = true,
  ...rest
}: DateBadgeProps) {
  const variantStyles = {
    default:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    primary:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900',
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900',
    warning:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
    info:
      'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-900',
    outline:
      'bg-transparent text-slate-700 border-slate-300 dark:text-slate-300 dark:border-slate-700',
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <DateDisplay showIcon={showIcon} {...rest} />
    </span>
  )
}
