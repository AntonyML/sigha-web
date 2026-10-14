'use client'

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@/shared/navigation'
import { Settings as SettingsIcon, Save, Upload } from 'lucide-react'
import { organizationsService, type ActiveOrganization } from '@/infrastructure/api/services/organizationsService'
import { usePermissions } from '@/shared/lib/permissionUtils'
import { useAppSettings, useGeneralSettingsUpdate } from '@/app/providers/SettingsContext'

const ACCEPTED_MIMETYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB, espejo del backend (Tarea 2)

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
  const currentSettings = useAppSettings()
  const updateGeneral = useGeneralSettingsUpdate()

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
    if (!isLoaded) return
    if (!isAdminOrDirectorSync()) {
      navigate('/settings')
      return
    }
    ;(async () => {
      try {
        const current = await organizationsService.getCurrent()
        setOrg(current)
        setName(current.name || '')
        setLogoUrl(current.logoUrl || '')
      } catch {
        setError('No se pudo cargar la organización activa.')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  if (!isLoaded || loading) {
    return <div className="centered">Cargando...</div>
  }

  if (!isAdmin) return null

  const notifyBrandChange = (next: ActiveOrganization) => {
    updateGeneral({
      appName: next.name,
      logoUrl: next.logoUrl || '',
      timezone: currentSettings.timezone,
    })
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
      setOrg(updated)
      setName(updated.name)
      setLogoUrl(updated.logoUrl || '')
      notifyBrandChange(updated)
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
      setOrg(updated)
      setLogoUrl(updated.logoUrl || '')
      setPreviewUrl(null)
      URL.revokeObjectURL(localPreview)
      notifyBrandChange(updated)
      setMessage('Logo subido correctamente.')
    } catch (err: unknown) {
      setError(apiMessage(err, 'Error al subir el logo.'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const shownLogo = previewUrl || logoUrl

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <SettingsIcon size={22} className="mr-2" />
          Organización
        </h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Nombre y logo de la organización activa. El logo se muestra en las pantallas de acceso.
        </p>
      </div>

      {org && (
        <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>
          Identificador interno: <code>{org.slug}</code>
        </p>
      )}

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg">
        <div>
          <label htmlFor="org-name" className="block font-medium mb-1">Nombre de la organización</label>
          <input
            id="org-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Ej.: Mi organización"
            maxLength={200}
          />
        </div>

        <div>
          <span className="block font-medium mb-1">Logo de la organización</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f8fafc', flexShrink: 0,
            }}>
              {shownLogo ? (
                <img src={shownLogo} alt="Logo de la organización" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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
                disabled={uploading}
                style={{ display: 'block', marginBottom: '0.25rem' }}
                aria-label="Subir logo de la organización"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-outline-secondary btn-sm"
              >
                {uploading ? 'Subiendo…' : 'Subir logo'}
                {!uploading && <Upload size={14} className="ml-1 inline" />}
              </button>
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                PNG, JPG o WebP. Máximo 2 MB. Se previsualiza antes de confirmarse en el servidor.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit" disabled={saving || uploading} className="btn btn-primary">
            {saving ? 'Guardando…' : 'Guardar cambios'}
            <Save size={16} className="ml-2 inline" />
          </button>
        </div>
      </form>
    </div>
  )
}
