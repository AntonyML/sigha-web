import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2, Shield } from 'lucide-react'
import { authFlow } from '@/modules/auth/application/flows/auth'
import { useTwoFactorStatus } from '@/modules/security/application/flows/twoFactor'
import {
  ButtonNew as Button,
  InputNew as Input,
  Label,
} from '@/shared/ui'
import { AuthLayout } from '@/shared/ui'

export default function TwoFactorVerificationPage() {
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refresh, markEnabled } = useTwoFactorStatus()

  const email = searchParams.get('email') || ''

  useEffect(() => {
    if (!email) {
      // If no email in state, redirect to login
      router.replace('/login')
    }
  }, [email, router])

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!twoFactorCode) {
      setError('Por favor ingrese el código de 6 u 8 dígitos')
      return
    }

    if (twoFactorCode.length !== 6 && twoFactorCode.length !== 8) {
      setError('El código debe tener 6 dígitos (TOTP) u 8 dígitos (código de respaldo)')
      return
    }

    setLoading(true)

    try {
      const result = await authFlow.verify2FA(twoFactorCode)

      if (!result.success) {
        setError(result.error || 'Código 2FA inválido')
        return
      }

      if (result.user) {
        const organizations = result.organizations ?? []
        const hasSingleActiveOrganization = organizations.length === 1
          && organizations[0].id === result.activeOrganizationId

        if (hasSingleActiveOrganization) {
          // Refresh 2FA before the workspace mounts, preserving the guard's
          // state while avoiding product API requests before org selection.
          await refresh()
          markEnabled()
        }
        router.replace(hasSingleActiveOrganization ? '/dashboard' : '/seleccionar-organizacion')
      } else {
        setError('Verificación exitosa pero no se recibió información del usuario')
      }
    } catch (err: unknown) {
      console.error('Error en verificación 2FA:', err)
      setError('Error inesperado al verificar código')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    authFlow.clearLocalSession()
    router.replace('/login')
  }

  return (
    <AuthLayout
      title="Verificar Código"
      description={`Autenticado como ${email}`}
      showBackButton={true}
      onBackClick={handleCancel}
      backButtonText="Volver al inicio de sesión"
    >
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
          Ingrese el código de 6 dígitos de su app autenticadora o un código de respaldo de 8 dígitos
        </p>
      </div>

      {/* 2FA Verification Form */}
      <form onSubmit={handleVerify2FA} className="space-y-6 animate-slide-in">
        <div className="space-y-4">
          <Label htmlFor="twoFactorCode" className="text-base font-semibold">
            Código de Verificación
          </Label>
          <Input
            id="twoFactorCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={twoFactorCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              if (value.length <= 8) {
                setTwoFactorCode(value)
              }
            }}
            placeholder="12345678"
            maxLength={8}
            disabled={loading}
            autoFocus
            required
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby="code-hint"
            className="text-center text-2xl tracking-widest font-mono font-semibold tabular-nums h-12"
          />
          <p id="code-hint" className="text-sm text-muted-foreground text-center">
            Los códigos de 8 dígitos solo se utilizan una vez.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 h-12 text-base font-semibold"
            size="lg"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || twoFactorCode.length < 6 || twoFactorCode.length > 8}
            className="flex-1 h-12 text-base font-semibold"
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
        </div>
      </form>
    </AuthLayout>
  )
}
