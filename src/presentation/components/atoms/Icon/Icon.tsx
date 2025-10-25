import type { HTMLAttributes } from 'react'
import icons from './icons.json'

type IconName = typeof icons[number]

type Props = HTMLAttributes<HTMLSpanElement> & {
  name: IconName
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'outlined' | 'filled' | 'sharp'
  color?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}

export default function Icon({
  name,
  size = 'md',
  variant = 'sharp',
  color,
  className = '',
  ...rest
}: Props) {
  // Map legacy Bootstrap icons to Material Symbols
  const iconMap: Record<string, string> = {
    'bi-shield-lock': 'shield',
    'bi-shield-plus': 'shield',
    'bi-check-circle': 'check_circle',
    'bi-exclamation-triangle': 'warning',
    'bi-arrow-left': 'arrow_back',
    'bi-plus-lg': 'add',
    'bi-search': 'search',
    'bi-x-lg': 'close',
    'bi-people-fill': 'group',
    'bi-person-fill': 'person',
    'bi-envelope': 'email',
    'bi-patch-check-fill': 'verified',
    'bi-check-circle-fill': 'check_circle',
    'bi-x-circle-fill': 'cancel',
    'bi-eye': 'visibility',
    'bi-pencil': 'edit',
    'bi-toggle-on': 'toggle_on',
    'bi-toggle-off': 'toggle_off',
    'bi-trash': 'delete',
    'bi-plus-circle': 'add',
    'bi-graph-up': 'dashboard',
    'bi-download': 'download',
    'bi-shield-check': 'shield',
    'bi-funnel': 'filter_list',
    'bi-list-ul': 'list',
    'bi-inbox': 'inbox',
    'bi-person-circle': 'person',
    'bi-chevron-left': 'chevron_left',
    'bi-chevron-right': 'chevron_right'
  }

  const materialIcon = iconMap[name] || name.replace(/_/g, '')

  const fontFamilyMap = {
    outlined: 'Material Symbols Outlined',
    filled: 'Material Symbols Sharp', // Filled uses Sharp with FILL variation
    sharp: 'Material Symbols Sharp'
  }

  const style: React.CSSProperties = {
    fontFamily: fontFamilyMap[variant],
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: 'inherit',
    lineHeight: 1,
    letterSpacing: 'normal',
    textTransform: 'none',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    direction: 'ltr',
    fontFeatureSettings: '"liga"',
    fontVariationSettings: variant === 'filled' 
      ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24'
      : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24',
    ...(color && { color })
  }

  return (
    <span
      className={`${sizeClasses[size]} ${className}`}
      style={style}
      {...rest}
    >
      {materialIcon}
    </span>
  )
}