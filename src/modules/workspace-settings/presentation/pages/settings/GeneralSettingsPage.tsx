/* eslint-disable @next/next/no-img-element -- Organization logos are hosted outside configured Next image domains. */
import { getApiErrorMessage } from '@/shared/lib/apiError'
import { useEffect, useState } from 'react'
import { useNavigate } from '@/shared/navigation'
import { Building2, CheckCircle2, Globe2, MapPin, Save } from 'lucide-react'
import { settingsService } from '@/infrastructure/api/services/settingsService'
import { PermissionUtils, usePermissions } from '@/shared/lib/permissionUtils'
import {
  useAppSettings,
  useGeneralSettingsUpdate,
  useOrganizationSettings,
} from '@/app/providers/SettingsContext'
import { Alert } from '@/shared/ui/feedback/Alert/Alert'
import { LoadingSpinner } from '@/shared/ui/feedback/LoadingSpinner/LoadingSpinner'
import { Button } from '@/shared/ui/forms/Button/ButtonNew'
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

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('response' in error)) return false
  const response = (error as { response?: { status?: unknown } }).response
  return response?.status === 404
}

export default function GeneralSettingsPage() {
  const navigate = useNavigate()
  const { canPerformAction, isLoaded, isAdminOrDirectorSync } = usePermissions()
  const hasEdit = canPerformAction('settings', 'edit')
  const hasAccess = PermissionUtils.canAccessModule('settings')
  const canManageOrganization = isAdminOrDirectorSync()
  const updateGeneral = useGeneralSettingsUpdate()
  const currentSettings = useAppSettings()
  const { activeOrganization, loaded: organizationSettingsLoaded } = useOrganizationSettings()

  const [form, setForm] = useState({ language: 'es', timezone: 'America/Costa_Rica' })
  const [globalIdentity, setGlobalIdentity] = useState({ appName: 'SIGHA', logoUrl: '' })
  const [loading, setLoading] = useState(true)
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)
  const [needsInitialization, setNeedsInitialization] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !organizationSettingsLoaded) return
    if (!hasAccess) {
      navigate('/settings')
      return
    }
    ;(async () => {
      try {
        const data = await settingsService.getGeneralSettings()
        setGlobalIdentity({ appName: data.appName || 'SIGHA', logoUrl: data.logoUrl || '' })
        setForm({
          language: data.language || 'es',
          timezone: data.timezone || 'America/Costa_Rica',
        })
        setPreferencesLoaded(true)
      } catch (loadError: unknown) {
        if (isNotFoundError(loadError)) {
          setGlobalIdentity({ appName: 'SIGHA', logoUrl: '' })
          setPreferencesLoaded(true)
          setNeedsInitialization(true)
        } else {
          setError('No se pudieron cargar las preferencias generales. Inténtalo de nuevo antes de guardar.')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [hasAccess, isLoaded, navigate, organizationSettingsLoaded])

  if (!hasAccess) return null

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError(null)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!hasEdit) {
      setError('No tienes permiso para editar las preferencias generales.')
      return
    }
    if (!preferencesLoaded) {
      setError('No se pudieron cargar las preferencias generales. Inténtalo de nuevo antes de guardar.')
      return
    }

    setSaving(true)
    try {
      const result = await settingsService.updateGeneralSettings({
        ...globalIdentity,
        language: form.language,
        timezone: form.timezone,
      })
      updateGeneral({
        appName: activeOrganization?.name || currentSettings.appName,
        logoUrl: activeOrganization?.logoUrl || '',
        timezone: result.timezone || form.timezone,
      })
      setNeedsInitialization(false)
      setMessage('Preferencias guardadas correctamente.')
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Error al guardar las preferencias.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading || !organizationSettingsLoaded) {
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
        subtitle="Administra el idioma y la zona horaria. El nombre y el logo se configuran por organización."
        icon="bi-sliders"
        className={styles.pageHeader}
      />

      <div className={styles.layout}>
        <Card className={styles.formCard}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.sectionIcon} aria-hidden="true">
              <Globe2 size={20} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Preferencias regionales</h3>
              <CardDescription className={styles.cardDescription}>
                Ajusta cómo se muestran el idioma y las fechas en SIGHA.
              </CardDescription>
            </div>
            {!hasEdit && <span className={styles.readOnly}>Solo lectura</span>}
          </CardHeader>

          <form onSubmit={handleSubmit} aria-busy={saving}>
            <CardContent className={styles.formContent}>
              {error && <Alert variant="error" title="No se pudo completar la operación">{error}</Alert>}
              {message && <Alert variant="success" title="Listo">{message}</Alert>}
              {needsInitialization && (
                <p className={styles.helpText}>
                  Aún no hay preferencias generales guardadas. Al guardar se inicializarán con los valores predeterminados de SIGHA.
                </p>
              )}

              <div className={styles.fields}>
                <div>
                  <label htmlFor="general-language" className={styles.label}>Idioma</label>
                  <select
                    id="general-language"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className={styles.selectControl}
                    disabled={!hasEdit || !preferencesLoaded}
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
                    disabled={!hasEdit || !preferencesLoaded}
                    aria-describedby="general-timezone-help"
                  >
                    {TIMEZONES.map(timezone => <option key={timezone} value={timezone}>{timezone}</option>)}
                  </select>
                  <p id="general-timezone-help" className={styles.helpText}>
                    Se utiliza para mostrar horarios en todo SIGHA.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className={styles.cardFooter}>
              {!hasEdit && <p className={styles.permissionNote}>Tienes acceso de consulta. Contacta a una persona administradora para editar estos datos.</p>}
              <Button type="submit" disabled={saving || !hasEdit || !preferencesLoaded} className={styles.saveButton}>
                <Save size={16} aria-hidden="true" />
                {saving ? 'Guardando…' : 'Guardar preferencias'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <aside className={styles.previewColumn} aria-label="Identidad de la organización activa">
          <Card className={styles.previewCard}>
            <CardHeader className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Organización activa</h3>
              <CardDescription className={styles.cardDescription}>
                Cada organización conserva su propio nombre y logo.
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.previewContent}>
              <div className={styles.previewCanvas}>
                <div className={styles.previewBrand}>
                  <div className={styles.previewMark}>
                    {activeOrganization?.logoUrl ? (
                      <img
                        src={activeOrganization.logoUrl}
                        alt={`Logo de ${activeOrganization.name}`}
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
                    <span className={styles.previewEyebrow}>Nombre visible en esta organización</span>
                    <strong>{activeOrganization?.name || 'No hay organización activa'}</strong>
                  </div>
                </div>

                {activeOrganization?.slug && (
                  <>
                    <div className={styles.previewDivider} />
                    <div className={styles.previewDetail}>
                      <MapPin size={16} aria-hidden="true" />
                      <span>Identificador</span>
                      <strong>{activeOrganization.slug}</strong>
                    </div>
                  </>
                )}
              </div>

              <p className={styles.previewNote}>
                <CheckCircle2 size={16} aria-hidden="true" />
                Cambiar esta identidad no modifica SIGHA ni las demás organizaciones.
              </p>

              {canManageOrganization ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/settings/organization')}
                  disabled={!activeOrganization}
                  className={styles.organizationButton}
                >
                  Administrar nombre y logo
                </Button>
              ) : (
                <p className={styles.permissionNote}>Solo administración o dirección pueden cambiar la identidad de la organización.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
