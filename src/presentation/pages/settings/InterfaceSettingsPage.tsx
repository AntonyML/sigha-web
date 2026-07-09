// src/presentation/pages/settings/InterfaceSettingsPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import { settingsService } from '../../../services/settingsService'
import { PermissionUtils, usePermissions } from '../../../utils/permissionUtils'

interface FormState {
  theme: string
  density: string
  typography: string
  brandColor: string
}

export default function InterfaceSettingsPage() {
  const navigate = useNavigate()
  const { canPerformAction, isLoaded } = usePermissions()
  const hasEdit = canPerformAction('settings', 'edit') // permission to edit settings
  const hasAccess = PermissionUtils.canAccessModule('settings')

  const [form, setForm] = useState<FormState>({
    theme: 'light',
    density: 'comfortable',
    typography: 'system-ui, -apple-system, sans-serif',
    brandColor: '#2563eb',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!hasAccess) {
      navigate('/settings')
      return
    }
    ;(async () => {
      try {
        const data = await settingsService.getInterfaceSettings()
        setForm({
          theme: data.theme || 'light',
          density: data.density || 'comfortable',
          typography: data.typography || 'system-ui, -apple-system, sans-serif',
          brandColor: data.brandColor || '#2563eb',
        })
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'No se pudo cargar la configuración de interfaz. Si es la primera vez, guarda los valores para inicializarla.')
      } finally {
        setLoading(false)
      }
    })()
  }, [hasAccess, isLoaded])

  if (!hasAccess) return null

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!hasEdit) {
      setError('No tienes permiso para editar la configuración de interfaz.')
      return
    }
    setSaving(true)
    try {
      await settingsService.updateInterfaceSettings(form)
      setMessage('Configuración guardada correctamente.')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
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
          Interfaz
        </h2>
        <p className="text-sm text-gray-600">
          Personaliza la apariencia y comportamiento visual del sistema.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg">
        {/* Tema */}
        <div>
          <label className="block font-medium mb-1">Tema</label>
          <select name="theme" value={form.theme} onChange={handleChange} className="input">
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
            <option value="system">Según Sistema</option>
          </select>
        </div>
        {/* Densidad */}
        <div>
          <label className="block font-medium mb-1">Densidad</label>
          <select name="density" value={form.density} onChange={handleChange} className="input">
            <option value="compact">Compacta</option>
            <option value="comfortable">Confortable</option>
            <option value="spacious">Espaciosa</option>
          </select>
        </div>
        {/* Tipografía */}
        <div>
          <label className="block font-medium mb-1">Tipografía</label>
          <select name="typography" value={form.typography} onChange={handleChange} className="input">
            <option value="system-ui, -apple-system, sans-serif">Sistema (predeterminado)</option>
            <option value='Georgia, "Times New Roman", serif'>Serif (tradicional)</option>
            <option value='"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'>Sans-serif (legible)</option>
            <option value='"Courier New", Consolas, monospace'>Monoespaciada</option>
          </select>
        </div>
        {/* Color de Marca */}
        <div>
          <label className="block font-medium mb-1">Color de Marca</label>
          <input type="color" name="brandColor" value={form.brandColor} onChange={handleChange} className="input w-16 h-10 p-0 border-0" />
        </div>
        {/* Guardar */}
        <button type="submit" disabled={saving || !hasEdit} className="btn btn-primary">
          {saving ? 'Guardando…' : 'Guardar'}
          {hasEdit && <Save size={16} className="ml-2 inline" />}
        </button>
        {!hasEdit && <p className="text-sm text-gray-500 mt-2">Solo tienes permiso de visualización.</p>}
      </form>
    </div>
  )
}
