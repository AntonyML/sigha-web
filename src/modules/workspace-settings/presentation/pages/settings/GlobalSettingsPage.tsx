/* eslint-disable @next/next/no-img-element -- uploaded logos may use the storage CDN URL. */
'use client'

import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock3, ImagePlus, LockKeyhole, Save, ShieldCheck } from 'lucide-react'
import { usePlatformBranding } from '@/app/providers/PlatformBrandingContext'
import { settingsService } from '@/infrastructure/api/services/settingsService'
import { getApiErrorMessage } from '@/shared/lib/apiError'
import { usePermissions } from '@/shared/lib/permissionUtils'
import { Alert } from '@/shared/ui/feedback/Alert/Alert'
import { LoadingSpinner } from '@/shared/ui/feedback/LoadingSpinner/LoadingSpinner'
import { Button } from '@/shared/ui/forms/Button/ButtonNew'
import { Input } from '@/shared/ui/forms/Input/InputNew'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/shared/ui/data-display/Card/Card'
import { PageHeader } from '@/shared/ui/layouts/PageHeader/PageHeader'
import styles from './GlobalSettingsPage.module.css'

function responseStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object' || !('response' in error)) return undefined
  const response = (error as { response?: { status?: unknown } }).response
  return typeof response?.status === 'number' ? response.status : undefined
}

function formatExpiry(expiry: string): string {
  const date = new Date(expiry)
  if (Number.isNaN(date.getTime())) return '5 minutos'
  return date.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
}

export default function GlobalSettingsPage() {
  const router = useRouter()
  const { updateBranding } = usePlatformBranding()
  const { isLoaded, isAdminSync, isSuperAdminSync } = usePermissions()
  const canManageGlobalSettings = isAdminSync() || isSuperAdminSync()

  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [appName, setAppName] = useState('SIGHA')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !canManageGlobalSettings) router.replace('/settings')
  }, [canManageGlobalSettings, isLoaded, router])

  useEffect(() => {
    if (!accessToken || !expiresAt) return

    const expireAccess = () => {
      setAccessToken(null)
      setExpiresAt(null)
      setSettingsLoaded(false)
      setTwoFactorCode('')
      setMessage(null)
      setError('La verificación 2FA expiró. Ingresa un código nuevo para continuar.')
    }

    const timeout = window.setTimeout(
      expireAccess,
      Math.max(0, new Date(expiresAt).getTime() - Date.now()),
    )
    return () => window.clearTimeout(timeout)
  }, [accessToken, expiresAt])

  const lockSettings = (notice: string) => {
    setAccessToken(null)
    setExpiresAt(null)
    setSettingsLoaded(false)
    setTwoFactorCode('')
    setMessage(null)
    setError(notice)
  }

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (!/^\d{6}$/.test(twoFactorCode)) {
      setError('Ingresa el código de 6 dígitos de tu aplicación autenticadora.')
      return
    }

    setVerifying(true)
    try {
      const grant = await settingsService.verifyGlobalSettingsAccess(twoFactorCode)
      const settings = await settingsService.getGlobalSettings(grant.accessToken)
      setAppName(settings.appName || 'SIGHA')
      setLogoUrl(settings.logoUrl || null)
      updateBranding({ appName: settings.appName || 'SIGHA', logoUrl: settings.logoUrl || null })
      setAccessToken(grant.accessToken)
      setExpiresAt(grant.expiresAt)
      setSettingsLoaded(true)
      setTwoFactorCode('')
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, 'No se pudo validar el código 2FA.'))
    } finally {
      setVerifying(false)
    }
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accessToken || !settingsLoaded) return
    setError(null)
    setMessage(null)
    setSaving(true)
    try {
      const updated = await settingsService.updateGlobalSettings(accessToken, { appName })
      setAppName(updated.appName)
      setLogoUrl(updated.logoUrl || null)
      updateBranding({ appName: updated.appName, logoUrl: updated.logoUrl || null })
      setMessage('La identidad global de la plataforma se guardó correctamente.')
    } catch (requestError: unknown) {
      if ([401, 403].includes(responseStatus(requestError) ?? 0)) {
        lockSettings('La verificación ya no está activa. Ingresa un código 2FA nuevo.')
      } else {
        setError(getApiErrorMessage(requestError, 'No se pudo guardar la identidad global.'))
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.currentTarget
    const file = fileInput.files?.[0]
    if (!file || !accessToken || !settingsLoaded) return

    setError(null)
    setMessage(null)
    setUploading(true)
    try {
      const result = await settingsService.uploadGlobalLogo(accessToken, file)
      setLogoUrl(result.logoUrl)
      updateBranding({ appName, logoUrl: result.logoUrl })
      setMessage('El logo global se actualizó correctamente.')
    } catch (requestError: unknown) {
      if ([401, 403].includes(responseStatus(requestError) ?? 0)) {
        lockSettings('La verificación ya no está activa. Ingresa un código 2FA nuevo.')
      } else {
        setError(getApiErrorMessage(requestError, 'No se pudo cargar el logo global.'))
      }
    } finally {
      fileInput.value = ''
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!accessToken || !settingsLoaded) return
    setError(null)
    setMessage(null)
    setSaving(true)
    try {
      const updated = await settingsService.updateGlobalSettings(accessToken, {
        appName,
        logoUrl: null,
      })
      setLogoUrl(updated.logoUrl || null)
      updateBranding({ appName: updated.appName, logoUrl: updated.logoUrl || null })
      setMessage('Se quitó el logo global de la plataforma.')
    } catch (requestError: unknown) {
      if ([401, 403].includes(responseStatus(requestError) ?? 0)) {
        lockSettings('La verificación ya no está activa. Ingresa un código 2FA nuevo.')
      } else {
        setError(getApiErrorMessage(requestError, 'No se pudo quitar el logo global.'))
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded) {
    return <div className={`lp-page ${styles.loading}`}><LoadingSpinner message="Validando permisos..." /></div>
  }

  if (!canManageGlobalSettings) return null

  return (
    <main className={`lp-page ${styles.page}`}>
      <PageHeader
        title="Configuraciones Globales"
        subtitle="Administra la identidad que representa a SIGHA en toda la plataforma."
        icon="bi-shield-lock"
        className={styles.header}
      />

      <div className={styles.backRow}>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings">Volver a configuración</Link>
        </Button>
        {expiresAt && accessToken && (
          <span className={styles.expiry}>
            <Clock3 size={15} aria-hidden="true" />
            Verificación válida hasta las {formatExpiry(expiresAt)}
          </span>
        )}
      </div>

      <Alert variant="warning" title="Este cambio aplica a toda la plataforma">
        El nombre y el logo de cada organización se administran por separado y no se modifican desde aquí.
      </Alert>

      {error && <Alert variant="error" title="No se pudo completar la operación">{error}</Alert>}
      {message && <Alert variant="success" title="Listo">{message}</Alert>}

      {!settingsLoaded ? (
        <Card className={styles.securityCard}>
          <CardHeader className={styles.securityHeader}>
            <span className={styles.securityIcon} aria-hidden="true"><LockKeyhole size={21} /></span>
            <div>
              <h2 className={styles.cardTitle}>Confirma tu identidad</h2>
              <CardDescription>Para ingresar, vuelve a verificarte con el código de tu aplicación autenticadora.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className={styles.securityContent}>
            <form onSubmit={handleVerify} className={styles.verifyForm}>
              <label htmlFor="global-settings-2fa" className={styles.label}>Código de autenticación</label>
              <Input
                id="global-settings-2fa"
                name="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(event) => setTwoFactorCode(event.currentTarget.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                aria-describedby="global-settings-2fa-help"
                className={styles.codeInput}
                required
              />
              <p id="global-settings-2fa-help" className={styles.helpText}>
                Solo se acepta el código temporal de 6 dígitos; los códigos de recuperación no abren esta sección.
              </p>
              <div className={styles.verifyActions}>
                <Button type="submit" disabled={verifying || twoFactorCode.length !== 6}>
                  <ShieldCheck size={16} aria-hidden="true" />
                  {verifying ? 'Verificando…' : 'Verificar y continuar'}
                </Button>
              </div>
            </form>
            <p className={styles.securityFootnote}>
              El acceso se limita a administradores y superadministradores, dura cinco minutos y se vuelve a validar en el servidor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className={styles.settingsCard}>
          <CardHeader className={styles.settingsHeader}>
            <span className={styles.brandIcon} aria-hidden="true"><ShieldCheck size={21} /></span>
            <div>
              <h2 className={styles.cardTitle}>Identidad de SIGHA</h2>
              <CardDescription>Estos valores son compartidos por toda la plataforma.</CardDescription>
            </div>
            <span className={styles.scopeBadge}>Plataforma</span>
          </CardHeader>

          <form onSubmit={handleSave} aria-busy={saving}>
            <CardContent className={styles.settingsContent}>
              <div className={styles.brandPreview}>
                <div className={styles.logoFrame}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo global de SIGHA" className={styles.logoImage} />
                  ) : (
                    <ShieldCheck size={25} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.previewText}>
                  <span>Nombre visible de la plataforma</span>
                  <strong>{appName || 'SIGHA'}</strong>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="global-app-name" className={styles.label}>Nombre de la plataforma</label>
                <Input
                  id="global-app-name"
                  value={appName}
                  onChange={(event) => setAppName(event.currentTarget.value)}
                  maxLength={100}
                  required
                  aria-describedby="global-app-name-help"
                />
                <p id="global-app-name-help" className={styles.helpText}>
                  Se aplica a SIGHA completo; el nombre de cada organización permanece independiente.
                </p>
              </div>

              <div className={styles.field}>
                <label htmlFor="global-logo" className={styles.label}>Logo global</label>
                <Input
                  id="global-logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploading || saving}
                  aria-describedby="global-logo-help"
                  className={styles.fileInput}
                />
                <p id="global-logo-help" className={styles.helpText}>
                  PNG, JPEG o WebP; tamaño máximo de 2 MB. El logo de la organización activa no cambia.
                </p>
              </div>
            </CardContent>

            <CardFooter className={styles.settingsFooter}>
              <div className={styles.logoActions}>
                {logoUrl && (
                  <Button type="button" variant="outline" onClick={handleRemoveLogo} disabled={saving || uploading}>
                    Quitar logo global
                  </Button>
                )}
                {uploading && <span className={styles.uploadStatus}><ImagePlus size={15} aria-hidden="true" /> Cargando logo…</span>}
              </div>
              <Button type="submit" disabled={saving || uploading || !appName.trim()}>
                <Save size={16} aria-hidden="true" />
                {saving ? 'Guardando…' : 'Guardar nombre'}
              </Button>
            </CardFooter>
          </form>

          <div className={styles.lockRow}>
            <span>Termina la sesión protegida cuando acabes.</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => lockSettings('La sección quedó bloqueada. Verifícate de nuevo para volver a ingresar.')}
            >
              Bloquear ahora
            </Button>
          </div>
        </Card>
      )}
    </main>
  )
}
