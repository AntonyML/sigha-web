import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export default function TextInput({ label, id, className = '', ...rest }: Props) {
  const inputId = id ?? `input_${Math.random().toString(36).slice(2, 8)}`
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input id={inputId} className={`form-control ${className}`} {...rest} />
    </div>
  )
}
