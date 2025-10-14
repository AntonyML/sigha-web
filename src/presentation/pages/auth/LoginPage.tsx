import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../../assets/images/asopogua.png'
import { authFlow } from '../../../infrastructure/flows/authFlow'
import { authStorage } from '../../../infrastructure/storage/authStorage'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  /**
   * Maneja el login inicial (email + password)
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor ingrese email y contraseña')
      return
    }

    setLoading(true)

    try {
      // Llamar al authFlow para hacer login
      const result = await authFlow.login({ email, password })

      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión')
        return
      }

      // Caso 1: Requiere 2FA
      if (result.requiresTwoFactor && result.tempToken) {
        // El tempToken ya fue guardado por el authService
        setRequiresTwoFactor(true)
        setError('')
        return
      }

      // Caso 2: Login exitoso sin 2FA
      if (result.user) {
        // Redirigir al menú principal
        navigate('/main-menu')
      }
    } catch (err: any) {
      console.error('Error en login:', err)
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Maneja la verificación del código 2FA
   */
  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!twoFactorCode) {
      setError('Por favor ingrese el código de 6 dígitos')
      return
    }

    setLoading(true)

    try {
      // Llamar al authFlow para verificar 2FA
      const result = await authFlow.verify2FA(twoFactorCode)

      if (!result.success) {
        setError(result.error || 'Código 2FA inválido')
        return
      }

      // Login completado exitosamente
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

  /**
   * Cancela el proceso de 2FA y vuelve al login
   */
  function cancelTwoFactor() {
    setRequiresTwoFactor(false)
    setTwoFactorCode('')
    setError('')
    authStorage.removeTempToken()
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="card shadow-lg" style={{
        width: '100%',
        maxWidth: '400px'
      }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <img
              src={Logo}
              alt="Logo"
              style={{ width: '150px', height: '150px', marginBottom: '20px' }}
            />
            <h4 className="text-primary">
              {requiresTwoFactor ? 'Verificación 2FA' : 'Iniciar sesión'}
            </h4>
            <p className="text-muted">Hogar de Ancianos</p>
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Formulario de Login Normal */}
          {!requiresTwoFactor && (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Correo</label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingrese su correo"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              <button
                className="btn btn-primary w-100"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Iniciando sesión...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          )}

          {/* Formulario de Verificación 2FA */}
          {requiresTwoFactor && (
            <form onSubmit={handleVerify2FA}>
              <div className="alert alert-info mb-3" role="alert">
                <i className="bi bi-shield-lock me-2"></i>
                Ingrese el código de 6 dígitos de su aplicación 2FAS
              </div>

              <div className="mb-3">
                <label className="form-label">Código 2FA</label>
                <input
                  className="form-control text-center"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => {
                    // Solo permitir números
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setTwoFactorCode(value);
                    }
                  }}
                  placeholder="123456"
                  maxLength={6}
                  disabled={loading}
                  autoFocus
                  style={{
                    fontSize: '1.5rem',
                    letterSpacing: '0.5rem',
                    fontFamily: 'monospace'
                  }}
                />
                <small className="text-muted">
                  Ingrese el código que aparece en su app 2FAS
                </small>
              </div>

              <button
                className="btn btn-primary w-100 mb-2"
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Verificando...
                  </>
                ) : (
                  'Verificar Código'
                )}
              </button>

              <button
                className="btn btn-outline-secondary w-100"
                type="button"
                onClick={cancelTwoFactor}
                disabled={loading}
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}