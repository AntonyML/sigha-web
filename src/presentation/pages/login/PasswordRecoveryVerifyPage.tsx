import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle, Loader2, Shield } from 'lucide-react'
import { passwordRecoveryFlow } from '../../../infrastructure/flows/passwordRecovery'
import {
  ButtonNew as Button,
  InputNew as Input,
  Label,
} from '../../components'
import { AuthLayout } from '../../components/molecules'

export default function PasswordRecoveryVerifyPage() {
  const [recoveryPart1, setRecoveryPart1] = useState('')
  const [recoveryPart2, setRecoveryPart2] = useState('')
  const recoveryPart2Ref = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // Get email from navigation state
  const email = location.state?.email || ''

  useEffect(() => {
    if (!email) {
      // If no email in state, redirect to request page
      navigate('/auth/forgot-password')
    }
  }, [email, navigate])

  async function handleVerifyRecovery(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (recoveryPart1.length !== 4 || recoveryPart2.length !== 4) {
      setError('Por favor ingrese el código de recuperación completo (4 + 4 dígitos)')
      return
    }

    setLoading(true)

    try {
      const combined = `${recoveryPart1} ${recoveryPart2}`
      const result = await passwordRecoveryFlow.validateRecoveryCodeFormat(combined)

      if (!result.success) {
        setError(result.error || 'Código inválido')
        return
      }

      // Almacenar token limpio en sessionStorage para el siguiente paso
      if (result.cleanToken) {
        sessionStorage.setItem('recovery_token', result.cleanToken)
      }

      setSuccess(result.message || 'Código verificado')
      // Navigate to reset password page after a brief delay
      setTimeout(() => {
        navigate('/auth/recovery/reset')
      }, 2000)
    } catch (err: unknown) {
      console.error('Error en verificación de recuperación:', err)
      setError('Error inesperado al verificar código')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Verificar Código"
      description="Ingresa el código de recuperación enviado a tu email"
      showBackButton={true}
      onBackClick={() => navigate('/auth/forgot-password')}
      backButtonText="Volver"
    >
      {/* Success Alert */}
      {success && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 animate-slide-in"
        >
          <Shield className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-slide-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Info Alert */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary"
        role="status"
      >
        <Shield className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm font-medium">
          Ingresa el código de recuperación enviado a tu email
        </p>
      </div>

      {/* Recovery Verify Form */}
      <form onSubmit={handleVerifyRecovery} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="recovery-code" className="text-base font-semibold text-center block">
            Código de Recuperación
          </Label>

          <div className="flex items-center justify-center gap-4 py-4">
            <Input
              id="recovery-code-part1"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={recoveryPart1}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                if (v.length <= 4) {
                  setRecoveryPart1(v)
                  if (v.length === 4) {
                    setTimeout(() => recoveryPart2Ref.current?.focus(), 0)
                  }
                }
              }}
              onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                const text = e.clipboardData.getData('text') || ''
                const digits = text.replace(/\D/g, '')
                if (digits.length >= 8) {
                  setRecoveryPart1(digits.slice(0, 4))
                  setRecoveryPart2(digits.slice(4, 8))
                  setTimeout(() => recoveryPart2Ref.current?.focus(), 0)
                } else if (digits.length > 4) {
                  setRecoveryPart1(digits.slice(0, 4))
                  setRecoveryPart2(digits.slice(4))
                  setTimeout(() => recoveryPart2Ref.current?.focus(), 0)
                } else {
                  setRecoveryPart1(digits)
                }
                e.preventDefault()
              }}
              placeholder="1234"
              maxLength={4}
              disabled={loading}
              autoFocus
              required
              aria-required="true"
              className="w-24 h-16 text-center text-4xl font-mono font-bold tabular-nums border-2 border-input focus:border-primary transition-colors"
            />

            <span className="text-3xl font-mono text-muted-foreground font-bold">-</span>

            <Input
              ref={recoveryPart2Ref}
              id="recovery-code-part2"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={recoveryPart2}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                if (v.length <= 4) {
                  setRecoveryPart2(v)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && recoveryPart2.length === 0) {
                  const el = document.getElementById('recovery-code-part1') as HTMLInputElement | null
                  el?.focus()
                }
              }}
              placeholder="5678"
              maxLength={4}
              disabled={loading}
              required
              aria-required="true"
              className="w-24 h-16 text-center text-4xl font-mono font-bold tabular-nums border-2 border-input focus:border-primary transition-colors"
            />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Ingresa el código de 8 dígitos enviado a tu email
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || recoveryPart1.length !== 4 || recoveryPart2.length !== 4}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              Verificando...
            </>
          ) : (
            'Verificar Código'
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}