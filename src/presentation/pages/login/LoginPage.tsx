import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, UserPlus } from 'lucide-react'
import { authFlow } from '../../../infrastructure/flows/auth'
import {
  ButtonNew as Button,
  InputNew as Input,
  Label,
} from '../../components'
import { AuthLayout } from '../../components/molecules'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    console.log('[DEBUG] handleLogin called')
    console.log('[DEBUG] Form event:', e)
    console.log('[DEBUG] Email:', email, 'Password length:', password.length)
    setError('')
    console.log('Iniciando login con:', { email, password: '***' })

    if (!email || !password) {
      setError('Por favor ingrese email y contraseña')
      return
    }

    setLoading(true)

    try {
      console.log('Llamando authFlow.login...')
      const result = await authFlow.login({ email, password })
      console.log('Respuesta de authFlow.login:', result)

      if (!result.success) {
        console.log('Login falló:', result.error)
        setError(result.error || 'Error al iniciar sesión')
        return
      }

      if (result.requiresTwoFactor) {
        console.log('Requiere 2FA, navegando a /auth/verify-2fa')
        // Navigate to 2FA verification page
        navigate('/auth/verify-2fa', {
          state: { email }
        })
        return
      }

      if (result.user) {
        console.log('Login exitoso, usuario:', result.user)
        console.log('Navegando a /main-menu')
        navigate('/main-menu')
      } else {
        console.log('Login exitoso pero sin usuario en respuesta')
        setError('Login exitoso pero no se recibió información del usuario')
      }
    } catch (err: unknown) {
      console.error('Error en login:', err)
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
      console.log('[DEBUG] handleLogin completed, loading set to false')
    }
  }

  return (
    <AuthLayout
      title="Iniciar Sesión"
      description="Hogar de Ancianos ASOPOGUA"
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

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
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
            className="text-base h-12"
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="password" className="text-base font-semibold">
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={!!error && !password}
              className="text-base h-12 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              tabIndex={-1}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '1.1rem' }}></i>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold"
          size="lg"
          onClick={() => console.log('[DEBUG] Botón Entrar clicked')}
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
        <div className="flex flex-col gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="link"
            onClick={() => navigate('/auth/forgot-password')}
            className="text-sm text-muted-foreground hover:text-primary justify-start p-0 h-auto"
            disabled={loading}
          >
            ¿Olvidaste tu contraseña?
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={() => navigate('/auth/create-user')}
            className="text-sm text-muted-foreground hover:text-primary justify-start p-0 h-auto"
            disabled={loading}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Crear usuario
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
