import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Save, Upload } from 'lucide-react'
import { settingsService } from '../../../services/settingsService'
import { PermissionUtils, usePermissions } from '../../../utils/permissionUtils'

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
  }, [hasAccess, isLoaded])

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
      setForm(prev => ({ ...prev, logoUrl: result.logoUrl || '' }))
      setMessage('Configuración guardada correctamente.')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al guardar.')
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
      setMessage('Logo subido correctamente.')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al subir el logo.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return <div className="centered">Cargando...</div>
  }

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <SettingsIcon size={22} className="mr-2" />
          General
        </h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Identidad institucional, idioma, zona horaria y logo de la aplicación.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg">
        {/* Nombre de la app */}
        <div>
          <label className="block font-medium mb-1">Nombre de la aplicación</label>
          <input
            name="appName"
            value={form.appName}
            onChange={handleChange}
            className="input"
            placeholder="Ej.: SIGHA"
            disabled={!hasEdit}
          />
        </div>

        {/* Idioma */}
        <div>
          <label className="block font-medium mb-1">Idioma</label>
          <select name="language" value={form.language} onChange={handleChange} className="input" disabled={!hasEdit}>
            <option value="es">Español</option>
          </select>
        </div>

        {/* Zona horaria */}
        <div>
          <label className="block font-medium mb-1">Zona horaria</label>
          <select name="timezone" value={form.timezone} onChange={handleChange} className="input" disabled={!hasEdit}>
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Logo */}
        <div>
          <label className="block font-medium mb-1">Logo de la aplicación</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f8fafc', flexShrink: 0,
            }}>
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Sin logo</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                disabled={uploading || !hasEdit}
                style={{ display: 'block', marginBottom: '0.25rem' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !hasEdit}
                className="btn btn-outline-secondary btn-sm"
              >
                {uploading ? 'Subiendo…' : 'Subir logo'}
                {!uploading && hasEdit && <Upload size={14} className="ml-1 inline" />}
              </button>
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                PNG, JPG o WebP. Máximo 2 MB.
              </p>
            </div>
          </div>
        </div>

        {/* Guardar */}
        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit" disabled={saving || !hasEdit} className="btn btn-primary">
            {saving ? 'Guardando…' : 'Guardar cambios'}
            {hasEdit && <Save size={16} className="ml-2 inline" />}
          </button>
          {!hasEdit && <p className="text-sm text-gray-500 mt-2">Solo tienes permiso de visualización.</p>}
        </div>
      </form>
    </div>
  )
}
