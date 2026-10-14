import type { HTMLAttributes } from 'react'
import * as OutlineIcons from '@heroicons/react/24/outline'
import * as SolidIcons from '@heroicons/react/24/solid'

type IconName = string

type Props = HTMLAttributes<HTMLSpanElement> & {
  name: IconName
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'outlined' | 'filled' | 'sharp'
  color?: string
}

const sizeDimensions = {
  sm: 'w-4 h-4', // 16px
  md: 'w-5 h-5', // 20px
  lg: 'w-6 h-6', // 24px
  xl: 'w-8 h-8'  // 32px
}

// Map legacy Bootstrap icons to Material Symbols (now used for Heroicons mapping)
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
  'bi-chevron-right': 'chevron_right',
  'bi-info-circle': 'info',
  'bi-lightning-charge-fill': 'bolt',
  'bi-box-arrow-in-right': 'arrow_right_circle',
  'bi-shield-exclamation': 'exclamation_triangle'
}

// Map Material Symbols names to Heroicons names
const nameMap: Record<string, string> = {
  arrow_back: 'arrow_left',
  arrow_left: 'arrow_left',
  search: 'magnifying_glass',
  close: 'x_mark',
  group: 'users',
  person: 'user',
  email: 'envelope',
  verified: 'check_badge',
  check_circle: 'check_circle',
  cancel: 'x_circle',
  visibility: 'eye',
  edit: 'pencil',
  toggle_on: 'check',
  toggle_off: 'x_mark',
  delete: 'trash',
  warning: 'exclamation_triangle',
  shield: 'shield_check',
  add: 'plus',
  chevron_left: 'chevron_left',
  chevron_right: 'chevron_right',
  download: 'arrow_down_tray',
  filter_list: 'funnel',
  list: 'list_bullet',
  list_bullet: 'list_bullet',
  inbox: 'inbox',
  dashboard: 'chart_bar',
  menu: 'bars_3',
  star: 'star',
  favorite: 'heart',
  notifications: 'bell',
  account_circle: 'user_circle',
  shopping_cart: 'shopping_cart',
  visibility_off: 'eye_slash',
  save: 'document',
  refresh: 'arrow_path',
  arrow_path: 'arrow_path',
  more_vert: 'ellipsis_vertical',
  more_horiz: 'ellipsis_horizontal',
  expand_more: 'chevron_down',
  expand_less: 'chevron_up',
  keyboard_arrow_down: 'chevron_down',
  keyboard_arrow_up: 'chevron_up',
  keyboard_arrow_left: 'chevron_left',
  keyboard_arrow_right: 'chevron_right',
  arrow_upward: 'arrow_up',
  arrow_downward: 'arrow_down',
  arrow_forward: 'arrow_right',
  arrow_back_ios: 'chevron_left',
  first_page: 'chevron_double_left',
  last_page: 'chevron_double_right',
  fullscreen: 'arrows_pointing_out',
  fullscreen_exit: 'arrows_pointing_in',
  zoom_in: 'magnifying_glass_plus',
  zoom_out: 'magnifying_glass_minus',
  photo_camera: 'camera',
  videocam: 'video_camera',
  mic: 'microphone',
  volume_up: 'speaker_wave',
  volume_off: 'speaker_x_mark',
  play_arrow: 'play',
  assignment: 'clipboard_document',
  lock: 'lock_closed',
  transfer_within_a_station: 'arrows_right_left',
  info: 'information_circle',
  bolt: 'bolt',
  arrow_right_circle: 'arrow_right_circle',
  exclamation_triangle: 'exclamation_triangle',
  admin_panel_settings: 'cog_6_tooth',
  security: 'shield_check'
}

export default function Icon({
  name,
  size = 'md',
  variant = 'sharp',
  color,
  className = '',
  ...rest
}: Props) {
  const mappedName = iconMap[name] || name
  const heroName = nameMap[mappedName] || mappedName
  const iconName = heroName.split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Icon'
  const iconSet = variant === 'outlined' ? OutlineIcons : SolidIcons
  const IconComponent = (iconSet as any)[iconName]

  if (!IconComponent) {
    console.warn(`Icon ${name} not found in Heroicons`)
    return <div className={`${sizeDimensions[size]} ${className}`} style={color ? { color } : undefined} {...rest}>?</div>
  }

  return (
    <IconComponent
      className={`${sizeDimensions[size]} ${className}`}
      style={color ? { color } : undefined}
      {...rest}
    />
  )
}