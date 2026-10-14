import { useId, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export default function Checkbox({ label, id, className = '', ...rest }: Props) {
  const generatedId = useId()
  const inputId = id ?? `chk_${generatedId}`
  return (
    <div className="form-check mb-3">
      <input id={inputId} className={`form-check-input ${className}`} type="checkbox" {...rest} />
      {label && (
        <label className="form-check-label" htmlFor={inputId}>
          {label}
        </label>
      )}
    </div>
  )
}
