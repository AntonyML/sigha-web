import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'link' | 'danger' | 'info'
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  let cls = 'btn btn-primary'

  switch (variant) {
    case 'primary':
      cls = 'btn btn-primary'
      break
    case 'secondary':
      cls = 'btn btn-secondary'
      break
    case 'link':
      cls = 'btn btn-link'
      break
    case 'danger':
      cls = 'btn btn-danger'
      break
    case 'info':
      cls = 'btn btn-info'
      break
    default:
      cls = 'btn btn-primary'
  }

  return (
    <button className={`${cls} ${className}`} {...rest}>
      {children}
    </button>
  )
}
