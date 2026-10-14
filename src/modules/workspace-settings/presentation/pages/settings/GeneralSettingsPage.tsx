/* eslint-disable @next/next/no-img-element -- Logo URLs come from storage and may not match configured Next image hosts. */
import { getApiErrorMessage } from '@/shared/lib/apiError'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@/shared/navigation'
import { Building2, CheckCircle2, Globe2, Image as ImageIcon, MapPin, Save, Upload } from 'lucide-react'
import { settingsService } from '@/infrastructure/api/services/settingsService'
import { PermissionUtils, usePermissions } from '@/shared/lib/permissionUtils'
import { useGeneralSettingsUpdate } from '@/app/providers/SettingsContext'
import { Alert } from '@/shared/ui/feedback/Alert/Alert'
import { LoadingSpinner } from '@/shared/ui/feedback/LoadingSpinner/LoadingSpinner'
import { Button } from '@/shared/ui/forms/Button/ButtonNew'
import { Input } from '@/shared/ui/forms/Input/InputNew'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/shared/ui/data-display/Card/Card'
import { PageHeader } from '@/shared/ui/layouts/PageHeader/PageHeader'
import styles from './GeneralSettingsPage.module.css'

const TIMEZONES = [
  'America/Costa_Rica',
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/Sao_Paulo',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/Madrid',
  'Europe/London',
  'UTC',
]

export default function GeneralSettingsPage() {
  const navigate = useNavigate()
  const { canPerformAction, isLoaded } = usePermissions()
  const hasEdit = canPerformAction('settings', 'edit')
  const hasAccess = PermissionUtils.canAccessModule('settings')
  const updateGeneral = useGeneralSettingsUpdate()

  const [form, setForm] = useState({
    appName: '',
    language: '',
    timezone: '',
    logoUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!hasAccess) {
      navigate('/settings')
      return
    }
    ;(async () => {
      try {
        const data = await settingsService.getGeneralSettings()
        setForm({
          appName: data.appName || '',
          language: data.language || 'es',
          timezone: data.timezone || 'America/Costa_Rica',
          logoUrl: data.logoUrl || '',
        })
      } catch {
        setError('No se pudo cargar la configuración general. Si es la primera vez, guarda los valores para inicializarla.')
      } finally {
        setLoading(false)
      }
    })()
  }, [hasAccess, isLoaded, navigate])

  if (!hasAccess) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!hasEdit) {
      setError('No tienes permiso para editar la configuración general.')
      return
    }
    setSaving(true)
    try {
      const result = await settingsService.updateGeneralSettings({
        appName: form.appName,
        language: form.language,
        timezone: form.timezone,
        logoUrl: form.logoUrl,
      })
      updateGeneral({
        appName: form.appName,
        logoUrl: result.logoUrl || '',
        timezone: form.timezone,
      })
      setForm(prev => ({ ...prev, logoUrl: result.logoUrl || '' }))
      setMessage('Configuración guardada correctamente.')
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Error al guardar.'))
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setMessage(null)
    setUploading(true)
    try {
      const result = await settingsService.uploadLogo(file)
      setForm(prev => ({ ...prev, logoUrl: result.logoUrl }))
      updateGeneral({ appName: form.appName, logoUrl: result.logoUrl, timezone: form.timezone })
      setMessage('Logo subido correctamente.')
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Error al subir el logo.'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className={`lp-page ${styles.loading}`}>
        <LoadingSpinner message="Cargando la configuración general..." />
      </div>
    )
  }

  return (
    <div className={`lp-page ${styles.page}`}>
      <PageHeader
        title="Configuración general"
        subtitle="Administra el nombre, el idioma, la zona horaria y el logo que identifican este espacio de trabajo."
        icon="bi-sliders"
        className={styles.pageHeader}
      />

      <div className={styles.layout}>
        <Card className={styles.formCard}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.sectionIcon} aria-hidden="true">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Identidad y región</h3>
              <CardDescription className={styles.cardDescription}>
                Define cómo se presenta el sistema y cómo organiza las fechas y horas.
              </CardDescription>
            </div>
            {!hasEdit && <span className={styles.readOnly}>Solo lectura</span>}
          </CardHeader>

          <form onSubmit={handleSubmit} aria-busy={saving || uploading}>
            <CardContent className={styles.formContent}>
              {error && <Alert variant="error" title="No se pudo completar la operación">{error}</Alert>}
              {message && <Alert variant="success" title="Listo">{message}</Alert>}

              <div className={styles.fields}>
                <div className={styles.fieldWide}>
                  <label htmlFor="general-app-name" className={styles.label}>Nombre de la aplicación</label>
                  <Input
                    id="general-app-name"
                    name="appName"
                    value={form.appName}
                    onChange={handleChange}
                    className={styles.control}
                    placeholder="Ej.: SIGHA"
                    autoComplete="organization"
                    disabled={!hasEdit}
                    aria-describedby="general-app-name-help"
                  />
                  <p id="general-app-name-help" className={styles.helpText}>
                    Este nombre aparece en las áreas principales del sistema.
                  </p>
                </div>

                <div>
                  <label htmlFor="general-language" className={styles.label}>Idioma</label>
                  <select
                    id="general-language"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className={styles.selectControl}
                    disabled={!hasEdit}
                  >
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="general-timezone" className={styles.label}>Zona horaria</label>
                  <select
                    id="general-timezone"
                    name="timezone"
                    value={form.timezone}
                    onChange={handleChange}
                    className={styles.selectControl}
                    disabled={!hasEdit}
                    aria-describedby="general-timezone-help"
                  >
                    {TIMEZONES.map(timezone => <option key={timezone} value={timezone}>{timezone}</option>)}
                  </select>
                  <p id="general-timezone-help" className={styles.helpText}>
                    Se utiliza para mostrar horarios en todo el sistema.
                  </p>
                </div>
              </div>

              <section className={styles.logoSection} aria-labelledby="logo-section-title">
                <div className={styles.logoHeading}>
                  <div>
                    <h3 id="logo-section-title" className={styles.label}>Logo de la aplicación</h3>
                    <p className={styles.helpText}>Usa una imagen cuadrada para que se vea bien en la navegación.</p>
                  </div>
                </div>

                <div className={styles.logoRow}>
                  <div className={styles.logoPreview}>
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt={`Logo de ${form.appName || 'la aplicación'}`}
                        width={88}
                        height={88}
                        loading="lazy"
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
                      id="general-logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      disabled={uploading || saving || !hasEdit}
                      className={styles.fileInput}
                      tabIndex={-1}
                      aria-label="Seleccionar logo"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || !hasEdit}
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
              {!hasEdit && <p className={styles.permissionNote}>Tienes acceso de consulta. Contacta a una persona administradora para editar estos datos.</p>}
              <Button type="submit" disabled={saving || uploading || !hasEdit} className={styles.saveButton}>
                <Save size={16} aria-hidden="true" />
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <aside className={styles.previewColumn} aria-label="Vista previa de la identidad">
          <Card className={styles.previewCard}>
            <CardHeader className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Vista previa</h3>
              <CardDescription className={styles.cardDescription}>
                Así se verá la identidad del espacio de trabajo.
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.previewContent}>
              <div className={styles.previewCanvas}>
                <div className={styles.previewBrand}>
                  <div className={styles.previewMark}>
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt=""
                        width={44}
                        height={44}
                        loading="lazy"
                        decoding="async"
                        className={styles.previewImage}
                      />
                    ) : (
                      <Building2 size={21} aria-hidden="true" />
                    )}
                  </div>
                  <div className={styles.previewName}>
                    <span className={styles.previewEyebrow}>Espacio de trabajo</span>
                    <strong>{form.appName.trim() || 'Nombre de la aplicación'}</strong>
                  </div>
                </div>

                <div className={styles.previewDivider} />

                <div className={styles.previewDetails}>
                  <div className={styles.previewDetail}>
                    <Globe2 size={16} aria-hidden="true" />
                    <span>Idioma</span>
                    <strong>{form.language === 'es' || !form.language ? 'Español' : form.language}</strong>
                  </div>
                  <div className={styles.previewDetail}>
                    <MapPin size={16} aria-hidden="true" />
                    <span>Zona horaria</span>
                    <strong>{form.timezone || 'America/Costa_Rica'}</strong>
                  </div>
                </div>
              </div>

              <p className={styles.previewNote}>
                <CheckCircle2 size={16} aria-hidden="true" />
                La vista se actualiza mientras editas los campos.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
