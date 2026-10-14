import { useId, useState, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export default function PasswordInput({ label, id, className = '', ...rest }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const generatedId = useId()
  const inputId = id ?? `password_input_${generatedId}`

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="position-relative">
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`form-control ${className}`}
          {...rest}
        />
        <button
          type="button"
          className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent"
          onClick={togglePasswordVisibility}
          style={{ zIndex: 5 }}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`} style={{ fontSize: '1.1rem' }}></i>
        </button>
      </div>
    </div>
  )
}
