import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Shield } from 'lucide-react'
import Logo from '../../../assets/images/asopogua.png'
import { authFlow } from '../../../infrastructure/flows/authFlow'
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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

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

      if (result.requiresTwoFactor && result.tempToken) {
        setRequiresTwoFactor(true)
        setError('')
        return
      }

      if (result.user) {
        navigate('/main-menu')
      }
    } catch (err: any) {
      console.error('Error en login:', err)
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!twoFactorCode) {
      setError('Por favor ingrese el código de 6 dígitos')
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
        navigate('/main-menu')
      }
    } catch (err: any) {
      console.error('Error en verificación 2FA:', err)
      setError('Error inesperado al verificar código')
    } finally {
      setLoading(false)
    }
  }

  function cancelTwoFactor() {
    setRequiresTwoFactor(false)
    setTwoFactorCode('')
    setError('')
    localStorage.removeItem('tempToken')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 tablet:p-6">
      <Card className="w-full max-w-[400px] tablet:max-w-[420px] shadow-2xl border-2 animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-4">
          <img
            src={Logo}
            alt="Logo Hogar de Ancianos"
            className="w-32 h-32 mx-auto tablet:w-36 tablet:h-36 object-contain"
          />
          <div className="space-y-1">
            <CardTitle className="text-2xl tablet:text-3xl font-bold text-primary">
              {requiresTwoFactor ? (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-6 h-6" />
                  Verificación 2FA
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </CardTitle>
            <CardDescription className="text-base">
              {requiresTwoFactor ? (
                <>
                  Autenticado como <span className="font-semibold text-foreground">{email}</span>
                </>
              ) : (
                'Hogar de Ancianos ASOPOGUA'
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
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

          {/* Login Form */}
          {!requiresTwoFactor && (
            <form onSubmit={handleLogin} className="space-y-5">
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
            </form>
          )}

          {/* 2FA Verification Form */}
          {requiresTwoFactor && (
            <form onSubmit={handleVerify2FA} className="space-y-5 animate-slide-in">
              <div 
                className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary"
                role="status"
              >
                <Shield className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm font-medium">
                  Ingrese el código de 6 dígitos de su aplicación 2FAS o autenticador
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
                    if (value.length <= 6) {
                      setTwoFactorCode(value);
                    }
                  }}
                  placeholder="123456"
                  maxLength={6}
                  disabled={loading}
                  autoFocus
                  required
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby="code-hint"
                  className="text-center text-2xl tracking-widest font-mono font-semibold tabular-nums"
                />
                <p id="code-hint" className="text-sm text-muted-foreground text-center">
                  Ingrese el código que aparece en su app autenticadora
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading || twoFactorCode.length !== 6}
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelTwoFactor}
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
