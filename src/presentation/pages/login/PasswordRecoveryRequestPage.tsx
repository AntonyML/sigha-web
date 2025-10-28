import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Mail } from 'lucide-react'
import { passwordRecoveryFlow } from '../../../infrastructure/flows/passwordRecovery'
import {
  ButtonNew as Button,
  InputNew as Input,
  Label,
} from '../../components'
import { AuthLayout } from '../../components/molecules'

export default function PasswordRecoveryRequestPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  async function handleRequestRecovery(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email) {
      setError('Por favor ingrese su email')
      return
    }

    setLoading(true)

    try {
      const result = await passwordRecoveryFlow.requestRecovery(email)

      if (!result.success) {
        setError(result.error || 'Error al solicitar recuperación')
        return
      }

      setSuccess(result.message || 'Códigos enviados exitosamente')
      // Navigate to verification page after a brief delay
      setTimeout(() => {
        navigate('/auth/recovery/verify', { state: { email } })
      }, 2000)
    } catch (err: unknown) {
      console.error('Error en solicitud de recuperación:', err)
      setError('Error inesperado al solicitar recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      description="Ingresa tu email para recibir códigos de recuperación"
      showBackButton={true}
      onBackClick={() => navigate('/login')}
      backButtonText="Volver al inicio de sesión"
    >
      {/* Success Alert */}
      {success && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 animate-slide-in"
        >
          <Mail className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
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

      {/* Recovery Request Form */}
      <form onSubmit={handleRequestRecovery} className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="recovery-email" className="text-base font-semibold">
            Correo Electrónico
          </Label>
          <Input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            disabled={loading}
            autoComplete="email"
            required
            aria-required="true"
            className="text-base h-12"
          />
          <p className="text-xs text-muted-foreground">
            Ingresa el email asociado a tu cuenta
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              Enviando códigos...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-5 w-5" />
              Enviar códigos de recuperación
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}