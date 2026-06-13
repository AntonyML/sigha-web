import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Plus, Search, X, AlertCircle, Eye, Pencil, Trash2 } from 'lucide-react'
import { permissionApiService } from '../../../services/permissionApiService'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

export default function PermissionListPage() {
  const [permissions, setPermissions] = useState<typeof permissionApiService extends never ? never : Awaited<ReturnType<typeof permissionApiService.getAll>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  useEffect(() => { loadPermissions() }, [])

  const loadPermissions = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await permissionApiService.getAll()
      setPermissions(data)
    } catch (err) {
      console.error('Error cargando permisos:', err)
      setError('Error al cargar permisos desde el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (permissionId: number, enabled: boolean, name: string) => {
    if (!enabled) {
      feedback.error('Los permisos deshabilitados no se pueden eliminar.')
      return
    }
    const ok = await feedback.confirm('Eliminar permiso', `¿Deseas eliminar el permiso "${name}"?\n\nEsta acción no se puede deshacer.`)
    if (!ok) return
    setError('')
    try {
      await permissionApiService.remove(permissionId)
      feedback.success('Permiso eliminado exitosamente')
      feedback.showNotification({ title: 'Permiso eliminado', message: `El permiso "${name}" fue eliminado.`, variant: 'success' })
      await loadPermissions()
    } catch (err) {
      console.error('Error eliminando permiso:', err)
      setError('Error al eliminar permiso del servidor')
    }
  }

  const filteredPermissions = permissions.filter(p => {
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return p.pName.toLowerCase().includes(q) || p.pModule.toLowerCase().includes(q) || p.pAction.toLowerCase().includes(q)
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filteredPermissions)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <div>
          <h2 className="lp-title">
            <Lock size={22} color="#2563eb" />
            Gestión de Permisos
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>Administra los permisos del sistema</p>
        </div>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/permissions/create')}>
            <Plus size={16} /> Nuevo Permiso
          </button>
        </div>
      </div>

      {error && (
        <div className="lp-error">
          <AlertCircle size={18} />
          {error}
          <button className="lp-error__retry" onClick={() => setError('')}>Cerrar</button>
        </div>
      )}

      <div className="lp-search-card">
        <div className="lp-search-wrap">
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar por nombre, módulo o acción..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Buscar permisos"
          />
          {searchTerm && (
            <button className="lp-search-clear" onClick={() => setSearchTerm('')} aria-label="Limpiar búsqueda">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando permisos...</span>
        </div>
      ) : filteredPermissions.length === 0 ? (
        <div className="lp-empty">
          <Lock size={48} className="lp-empty__icon" />
          <p>{searchTerm ? 'Intenta con otros términos.' : 'No hay permisos registrados.'}</p>
          {!searchTerm && (
            <button className="lp-btn lp-btn--primary" onClick={() => navigate('/permissions/create')}>
              <Plus size={15} /> Crear Permiso
            </button>
          )}
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>ID</th>
                  <th>Nombre / Descripción</th>
                  <th>Módulo</th>
                  <th>Acción</th>
                  <th className="center">Estado</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(permission => (
                  <tr key={permission.id}>
                    <td><span className="lp-badge lp-badge--id">#{permission.id}</span></td>
                    <td>
                      <strong style={{ display: 'block' }}>{permission.pName}</strong>
                      {permission.pDescription && <span className="lp-muted">{permission.pDescription}</span>}
                    </td>
                    <td><span className="lp-badge lp-badge--info">{permission.pModule}</span></td>
                    <td><span className="lp-badge lp-badge--warning">{permission.pAction}</span></td>
                    <td className="center">
                      <span className={`lp-badge ${permission.pEnabled ? 'lp-badge--success' : 'lp-badge--danger'}`}>
                        {permission.pEnabled ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button className="lp-icon-btn lp-icon-btn--view" title="Ver detalles" onClick={() => navigate(`/permissions/view/${permission.id}`)} aria-label={`Ver ${permission.pName}`}>
                          <Eye size={14} />
                        </button>
                        <button className="lp-icon-btn lp-icon-btn--edit" title="Editar" onClick={() => navigate(`/permissions/edit/${permission.id}`)} aria-label={`Editar ${permission.pName}`}>
                          <Pencil size={14} />
                        </button>
                        {permission.pEnabled && (
                          <button className="lp-icon-btn lp-icon-btn--delete" title="Eliminar" onClick={() => handleDelete(permission.id, permission.pEnabled, permission.pName)} aria-label={`Eliminar ${permission.pName}`}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
        </div>
      )}
    </div>
  )
}
