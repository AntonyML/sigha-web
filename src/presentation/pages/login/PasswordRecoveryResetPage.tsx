import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle, Loader2, Shield } from 'lucide-react'
import { passwordRecoveryFlow } from '../../../infrastructure/flows/passwordRecovery'
import {
  ButtonNew as Button,
  InputNew as Input,
  Label,
} from '../../components'
import { AuthLayout } from '../../components/molecules'

export default function PasswordRecoveryResetPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // Get data from navigation state
  const email = location.state?.email || ''
  const recoveryCode = location.state?.recoveryCode || ''

  useEffect(() => {
    if (!email || !recoveryCode) {
      // If no required data in state, redirect to request page
      navigate('/auth/forgot-password')
    }
  }, [email, recoveryCode, navigate])

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newPassword || !confirmPassword) {
      setError('Por favor complete todos los campos')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const result = await passwordRecoveryFlow.resetPassword(newPassword, confirmPassword)

      if (!result.success) {
        setError(result.error || 'Error al cambiar contraseña')
        return
      }

      setSuccess(result.message || 'Contraseña cambiada exitosamente')
      // Navigate to login page after a brief delay
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: unknown) {
      console.error('Error en cambio de contraseña:', err)
      setError('Error inesperado al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Nueva Contraseña"
      description="Ingresa tu nueva contraseña"
      showBackButton={true}
      onBackClick={() => navigate('/auth/recovery/verify')}
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

      {/* Reset Password Form */}
      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="new-password" className="text-base font-semibold">
            Nueva Contraseña
          </Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            required
            aria-required="true"
            className="text-base h-12"
          />
          <p className="text-xs text-muted-foreground">
            Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números
          </p>
        </div>

        <div className="space-y-4">
          <Label htmlFor="confirm-password" className="text-base font-semibold">
            Confirmar Contraseña
          </Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            required
            aria-required="true"
            className="text-base h-12"
          />
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
              Cambiando contraseña...
            </>
          ) : (
            'Cambiar Contraseña'
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}