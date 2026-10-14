'use client'

/* eslint-disable @next/next/no-img-element -- Organization logos are hosted outside configured Next image domains. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@/shared/navigation'
import { Building2, CheckCircle2, Image as ImageIcon, Save, Upload } from 'lucide-react'
import { organizationsService, type ActiveOrganization } from '@/infrastructure/api/services/organizationsService'
import { usePermissions } from '@/shared/lib/permissionUtils'
import { useOrganizationSettings } from '@/app/providers/SettingsContext'
import { Alert } from '@/shared/ui/feedback/Alert/Alert'
import { LoadingSpinner } from '@/shared/ui/feedback/LoadingSpinner/LoadingSpinner'
import { Button } from '@/shared/ui/forms/Button/ButtonNew'
import { Input } from '@/shared/ui/forms/Input/InputNew'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/shared/ui/data-display/Card/Card'
import { PageHeader } from '@/shared/ui/layouts/PageHeader/PageHeader'
import styles from './OrganizationSettingsPage.module.css'

const ACCEPTED_MIMETYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB, espejo del backend

function apiMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: unknown } } }).response
    if (typeof response?.data?.message === 'string') return response.data.message
  }
  return fallback
}

export default function OrganizationSettingsPage() {
  const navigate = useNavigate()
  const { isLoaded, isAdminOrDirectorSync } = usePermissions()
  const isAdmin = isAdminOrDirectorSync()
  const {
    activeOrganization,
    loaded: organizationContextLoaded,
    updateActiveOrganization,
  } = useOrganizationSettings()
  const activeOrganizationId = activeOrganization?.id

  const [org, setOrg] = useState<ActiveOrganization | null>(null)
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoaded || !organizationContextLoaded) return
    if (!isAdmin) {
      navigate('/settings')
      return
    }
    let cancelled = false
    if (!activeOrganizationId) {
      void Promise.resolve().then(() => {
        if (cancelled) return
        setOrg(null)
        setName('')
        setLogoUrl('')
        setError('No hay una organización activa para editar.')
        setLoading(false)
      })
      return () => { cancelled = true }
    }

    void Promise.resolve().then(async () => {
      if (cancelled) return
      setLoading(true)
      setOrg(null)
      setName('')
      setLogoUrl('')
      setError(null)
      try {
        const current = await organizationsService.getCurrent()
        if (cancelled) return
        if (current.id !== activeOrganizationId) {
          setError('La organización activa cambió. Espera a que se actualice e inténtalo de nuevo.')
          return
        }
        setOrg(current)
        setName(current.name || '')
        setLogoUrl(current.logoUrl || '')
      } catch {
        if (cancelled) return
        setError('No se pudo cargar la organización activa.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [activeOrganizationId, isAdmin, isLoaded, navigate, organizationContextLoaded])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  if (!isLoaded || loading) {
    return (
      <div className={`lp-page ${styles.loading}`}>
        <LoadingSpinner message="Cargando la organización activa..." />
      </div>
    )
  }

  if (!isAdmin) return null

  const notifyBrandChange = (next: ActiveOrganization) => {
    setOrg(next)
    setLogoUrl(next.logoUrl || '')
    updateActiveOrganization(next)
    window.dispatchEvent(new CustomEvent('organizationChanged', { detail: next }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setError('El nombre de la organización no puede estar vacío.')
      return
    }
    if (trimmed.length > 200) {
      setError('El nombre no puede exceder 200 caracteres.')
      return
    }
    setSaving(true)
    try {
      const updated = await organizationsService.updateCurrent(trimmed)
      notifyBrandChange(updated)
      setName(updated.name)
      setMessage('Organización actualizada correctamente.')
    } catch (err: unknown) {
      setError(apiMessage(err, 'Error al guardar.'))
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setMessage(null)
    if (!ACCEPTED_MIMETYPES.includes(file.type)) {
      setError('Tipo de archivo no permitido. Usa PNG, JPG o WebP.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('El archivo excede el tamaño máximo de 2MB.')
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setUploading(true)
    try {
      const updated = await organizationsService.uploadLogo(file)
      notifyBrandChange(updated)
      setPreviewUrl(null)
      URL.revokeObjectURL(localPreview)
      setMessage('Logo de la organización actualizado correctamente.')
    } catch (err: unknown) {
      setError(apiMessage(err, 'Error al subir el logo.'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const shownLogo = previewUrl || logoUrl
  const shownName = name.trim() || org?.name || 'Organización activa'

  return (
    <div className={`lp-page ${styles.page}`}>
      <PageHeader
        title="Organización"
        subtitle="Personaliza el nombre y el logo de la organización activa. Cada organización tiene su propia identidad."
        icon="bi-building"
        className={styles.pageHeader}
      />

      <div className={styles.layout}>
        <Card className={styles.formCard}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.sectionIcon} aria-hidden="true">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Identidad de la organización activa</h3>
              <CardDescription className={styles.cardDescription}>
                Estos cambios se guardan en la organización seleccionada y no alteran SIGHA ni otros espacios.
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit} aria-busy={saving || uploading}>
            <CardContent className={styles.formContent}>
              {error && <Alert variant="error" title="No se pudo completar la operación">{error}</Alert>}
              {message && <Alert variant="success" title="Listo">{message}</Alert>}

              <div>
                <label htmlFor="organization-name" className={styles.label}>Nombre visible en esta organización</label>
                <Input
                  id="organization-name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError(null)
                    setMessage(null)
                  }}
                  className={styles.control}
                  placeholder="Ej.: Clínica Roble"
                  maxLength={200}
                  autoComplete="organization"
                  disabled={saving || uploading || !org}
                  aria-describedby="organization-name-help"
                />
                <p id="organization-name-help" className={styles.helpText}>
                  Se muestra a las personas que trabajan en la organización activa.
                </p>
              </div>

              <section className={styles.logoSection} aria-labelledby="organization-logo-title">
                <div>
                  <h3 id="organization-logo-title" className={styles.label}>Logo de esta organización</h3>
                  <p className={styles.helpText}>
                    El logo se aplica solo a esta organización y se actualiza al subirlo.
                  </p>
                </div>

                <div className={styles.logoRow}>
                  <div className={styles.logoPreview}>
                    {shownLogo ? (
                      <img
                        src={shownLogo}
                        alt={`Logo de ${shownName}`}
                        width={88}
                        height={88}
                        decoding="async"
                        className={styles.logoImage}
                      />
                    ) : (
                      <div className={styles.logoEmpty}>
                        <ImageIcon size={22} aria-hidden="true" />
                        <span>Sin logo</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.uploadControls}>
                    <input
                      ref={fileInputRef}
                      id="organization-logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      disabled={uploading || saving || !org}
                      className={styles.fileInput}
                      tabIndex={-1}
                      aria-label="Subir logo de la organización"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || saving || !org}
                    >
                      <Upload size={16} aria-hidden="true" />
                      {uploading ? 'Subiendo…' : 'Subir logo'}
                    </Button>
                    <p className={styles.helpText}>PNG, JPG o WebP · Máximo 2 MB</p>
                  </div>
                </div>
              </section>
            </CardContent>

            <CardFooter className={styles.cardFooter}>
              <p className={styles.permissionNote}>
                La edición se limita a la organización activa.
              </p>
              <Button
                type="submit"
                disabled={!org || saving || uploading || !name.trim() || name.trim() === org?.name}
                className={styles.saveButton}
              >
                <Save size={16} aria-hidden="true" />
                {saving ? 'Guardando…' : 'Guardar nombre'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <aside className={styles.previewColumn} aria-label="Vista previa de la organización">
          <Card className={styles.previewCard}>
            <CardHeader className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Vista previa</h3>
              <CardDescription className={styles.cardDescription}>
                Así se verá la identidad de esta organización en la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.previewContent}>
              <div className={styles.previewCanvas}>
                <div className={styles.previewBrand}>
                  <div className={styles.previewMark}>
                    {shownLogo ? (
                      <img src={shownLogo} alt="" width={44} height={44} className={styles.previewImage} />
                    ) : (
                      <Building2 size={21} aria-hidden="true" />
                    )}
                  </div>
                  <div className={styles.previewName}>
                    <span className={styles.previewEyebrow}>Organización activa</span>
                    <strong>{shownName}</strong>
                  </div>
                </div>

                {org?.slug && (
                  <>
                    <div className={styles.previewDivider} />
                    <p className={styles.slugLine}>Identificador interno <code>{org.slug}</code></p>
                  </>
                )}
              </div>

              <p className={styles.previewNote}>
                <CheckCircle2 size={16} aria-hidden="true" />
                La marca se guarda para esta organización únicamente.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
