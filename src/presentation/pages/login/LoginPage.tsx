import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Shield, Mail, UserPlus, ArrowLeft } from 'lucide-react'
import Logo from '../../../assets/images/asopogua.png'
import { authFlow } from '../../../infrastructure/flows/auth'
import { passwordRecoveryFlow } from '../../../infrastructure/flows/passwordRecovery'
import { 
  ButtonNew as Button, 
  InputNew as Input, 
  Label, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '../../components'

type LoginMode = 'login' | 'recovery_request' | 'recovery_verify' | 'recovery_reset' | 'create_user'

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Por favor ingrese email y contraseña')
      return
    }

    setLoading(true)

    try {
      const result = await authFlow.login({ email, password })

      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión')
        return
      }

      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true)
        setError('')
        return
      }

      if (result.user) {
        navigate('/main-menu')
      }
    } catch (err: unknown) {
      console.error('Error en login:', err)
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

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
      console.log('Resultado de verify2FA:', result)

      if (!result.success) {
        console.log('Verificación fallida:', result.error)
        setError(result.error || 'Código 2FA inválido')
        return
      }

      if (result.user) {
        console.log('Usuario verificado, navegando al menú:', result.user)
        navigate('/main-menu')
      } else {
        console.log('Verificación exitosa pero sin usuario')
        setError('Verificación exitosa pero no se recibió información del usuario')
      }
    } catch (err: unknown) {
      console.error('Error en verificación 2FA:', err)
      setError('Error inesperado al verificar código')
    } finally {
      setLoading(false)
    }
  }

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
      setMode('recovery_verify')
    } catch (err: unknown) {
      console.error('Error en solicitud de recuperación:', err)
      setError('Error inesperado al solicitar recuperación')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyRecovery(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!recoveryCode) {
      setError('Por favor ingrese el código de recuperación')
      return
    }

    setLoading(true)

    try {
      const result = await passwordRecoveryFlow.verifyRecoveryCode(recoveryCode)

      if (!result.success) {
        setError(result.error || 'Código inválido')
        return
      }

      setSuccess(result.message || 'Código verificado')
      setMode('recovery_reset')
    } catch (err: unknown) {
      console.error('Error en verificación de recuperación:', err)
      setError('Error inesperado al verificar código')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newPassword || !confirmPassword) {
      setError('Por favor complete todos los campos')
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
      // Volver al login después de un breve delay
      setTimeout(() => {
        setMode('login')
        setEmail('')
        setPassword('')
        setRecoveryCode('')
        setNewPassword('')
        setConfirmPassword('')
        setSuccess('')
      }, 2000)
    } catch (err: unknown) {
      console.error('Error en cambio de contraseña:', err)
      setError('Error inesperado al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  function cancelTwoFactor() {
    setRequiresTwoFactor(false)
    setTwoFactorCode('')
    setError('')
    authFlow.clearLocalSession()
  }

  function goBack() {
    setMode('login')
    setEmail('')
    setPassword('')
    setRecoveryCode('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 tablet:p-6">
      <Card className="w-full max-w-[500px] tablet:max-w-[550px] shadow-2xl border-2 animate-fade-in">
        <CardHeader className="text-center space-y-2 pb-3">
          <img
            src={Logo}
            alt="Logo Hogar de Ancianos"
            className="w-24 h-24 mx-auto tablet:w-28 tablet:h-28 object-contain"
          />
          <div className="space-y-1">
            <CardTitle className={`font-bold text-primary ${requiresTwoFactor ? 'text-lg tablet:text-xl' : 'text-2xl tablet:text-3xl'}`}>
              {requiresTwoFactor ? (
                <span className="flex items-center justify-center gap-1">
                  Verificar Código
                </span>
              ) : mode === 'recovery_request' ? (
                'Recuperar Contraseña'
              ) : mode === 'recovery_verify' ? (
                'Verificar Código'
              ) : mode === 'recovery_reset' ? (
                'Nueva Contraseña'
              ) : mode === 'create_user' ? (
                'Crear Usuario'
              ) : (
                'Iniciar Sesión'
              )}
            </CardTitle>
            <CardDescription className="text-base">
              {requiresTwoFactor ? (
                <>
                  Autenticado como <span className="font-semibold text-foreground">{email}</span>
                </>
              ) : mode === 'recovery_request' ? (
                'Ingresa tu email para recibir códigos de recuperación'
              ) : mode === 'recovery_verify' ? (
                'Ingresa el código de recuperación enviado a tu email'
              ) : mode === 'recovery_reset' ? (
                'Ingresa tu nueva contraseña'
              ) : mode === 'create_user' ? (
                'Formulario de registro próximamente'
              ) : (
                'Hogar de Ancianos ASOPOGUA'
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
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

          {/* Back Button for recovery modes */}
          {(mode !== 'login' && !requiresTwoFactor) && (
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Button>
          )}

          {/* Login Form */}
          {!requiresTwoFactor && mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  disabled={loading}
                  autoComplete="email"
                  required
                  aria-required="true"
                  aria-invalid={!!error && !email}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  aria-invalid={!!error && !password}
                  className="text-base"
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
                    Iniciando sesión...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              {/* Additional Options */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode('recovery_request')}
                  className="text-sm text-muted-foreground hover:text-primary"
                  disabled={loading}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode('create_user')}
                  className="text-sm text-muted-foreground hover:text-primary"
                  disabled={loading}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Crear usuario
                </Button>
              </div>
            </form>
          )}

          {/* Recovery Request Form */}
          {mode === 'recovery_request' && (
            <form onSubmit={handleRequestRecovery} className="space-y-4">
              <div className="space-y-2">
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
                  className="text-base"
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
          )}

          {/* Recovery Verify Form */}
          {mode === 'recovery_verify' && (
            <form onSubmit={handleVerifyRecovery} className="space-y-4">
              <div 
                className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary"
                role="status"
              >
                <Shield className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm font-medium">
                  Ingresa uno de los códigos de recuperación enviados a tu email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recovery-code" className="text-base font-semibold">
                  Código de Recuperación
                </Label>
                <Input
                  id="recovery-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={recoveryCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 8) {
                      setRecoveryCode(value);
                    }
                  }}
                  placeholder="12345678"
                  maxLength={8}
                  disabled={loading}
                  autoFocus
                  required
                  aria-required="true"
                  className="text-center text-2xl tracking-widest font-mono font-semibold tabular-nums"
                />
                <p className="text-sm text-muted-foreground text-center">
                  El código tiene 8 dígitos
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || recoveryCode.length !== 8}
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
          )}

          {/* Recovery Reset Form */}
          {mode === 'recovery_reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
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
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
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
                  className="text-base"
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
          )}

          {/* Create User Placeholder */}
          {mode === 'create_user' && (
            <div className="space-y-4 text-center">
              <div className="p-6 rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/25">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Registro de Usuarios</h3>
                <p className="text-muted-foreground mb-4">
                  El registro de nuevos usuarios debe ser realizado por un administrador del sistema.
                </p>
                <p className="text-sm text-muted-foreground">
                  Contacta al administrador para crear tu cuenta de usuario.
                </p>
              </div>
            </div>
          )}

          {/* 2FA Verification Form */}
          {requiresTwoFactor && (
            <form onSubmit={handleVerify2FA} className="space-y-4 animate-slide-in">
              <div 
                className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary"
                role="status"
              >
                <Shield className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm font-medium">
                  Ingrese el código de 6 dígitos de su app autenticadora o un código de respaldo de 8 dígitos
                </p>
              </div>

              <div className="space-y-2">
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
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 8) {
                      setTwoFactorCode(value);
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
                  className="text-center text-2xl tracking-widest font-mono font-semibold tabular-nums"
                />
                <p id="code-hint" className="text-sm text-muted-foreground text-center">
                  Los códigos de 8 dígitos solo se utilizan una vez.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelTwoFactor}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
