import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Plus, Search, X, AlertCircle, Eye, Pencil, Trash2, RefreshCw, History } from 'lucide-react'
import { roleFlow } from '../../../infrastructure/flows/role'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import type { UserRole } from '../../../types/user'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

export default function RoleListPage() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  useEffect(() => { loadRoles() }, [])

  const loadRoles = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await roleFlow.getAllRoles()
      if (result.success && result.roles) {
        setRoles(result.roles)
      } else {
        setError(result.error || 'Error al cargar roles')
      }
    } catch (err) {
      console.error(err)
      setError('Error inesperado al cargar roles')
    } finally {
      setLoading(false)
    }
  }

    const handleDeleteRole = async (role: UserRole) => {
        if (isSystemRoleName(role.rName)) {
            feedback.error('No se pueden eliminar los roles del sistema.');
            return;
        }
    const ok = await feedback.confirm('Eliminar rol', `¿Estás seguro de que deseas eliminar el rol "${role.rName}"?\n\nEsta acción no se puede deshacer.`)
    if (!ok) return
    setError('')
    try {
      const result = await roleFlow.deleteRole(role.id)
      if (result.success) {
        feedback.success('Rol eliminado exitosamente')
        feedback.showNotification({ title: 'Rol eliminado', message: `El rol "${role.rName}" ha sido eliminado exitosamente.`, variant: 'success' })
        await loadRoles()
      } else {
        setError(result.error || 'Error al eliminar rol')
      }
    } catch (err) {
      console.error(err)
      setError('Error inesperado al eliminar rol')
    }
  }

  const filteredRoles = roles.filter(role =>
    !searchTerm.trim() || role.rName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filteredRoles)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <div>
          <h2 className="lp-title">
            <ShieldCheck size={22} color="#2563eb" />
            Gestión de Roles
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>Administra los roles y permisos del sistema</p>
        </div>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/role-changes')}>
            <History size={14} /> Historial de cambios
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/roles/create')}>
            <Plus size={16} /> Nuevo Rol
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
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="lp-search-clear" onClick={() => setSearchTerm('')}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando roles...</span>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="lp-empty">
          <ShieldCheck size={48} className="lp-empty__icon" />
          <p>{searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Aún no hay roles registrados.'}</p>
          {!searchTerm && (
            <button className="lp-btn lp-btn--primary" onClick={() => navigate('/roles/create')}>
              <Plus size={15} /> Crear Primer Rol
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
                  <th>Nombre del Rol</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(role => (
                  <tr key={role.id}>
                    <td><span className="lp-badge lp-badge--id">#{role.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ShieldCheck size={16} color="#2563eb" />
                        </div>
                        <div>
                          <strong>{role.rName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rol del sistema</div>
                        </div>
                      </div>
                    </td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button className="lp-icon-btn lp-icon-btn--view" title="Ver detalles" onClick={() => navigate(`/roles/view/${role.id}`)}>
                          <Eye size={14} />
                        </button>
                        <button className="lp-icon-btn lp-icon-btn--edit" title="Editar" onClick={() => navigate(`/roles/edit/${role.id}`)}>
                          <Pencil size={14} />
                        </button>
                        {!isSystemRoleName(role.rName) && (
                          <button className="lp-icon-btn lp-icon-btn--delete" title="Eliminar" onClick={() => handleDeleteRole(role)}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
            <button className="lp-btn lp-btn--back lp-btn--sm" onClick={loadRoles} disabled={loading}>
              <RefreshCw size={13} /> Actualizar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const SYSTEM_ROLE_NAMES: ReadonlySet<string> = new Set<string>([
  'super admin',
  'admin',
  'director',
  'nurse',
  'physiotherapist',
  'psychologist',
  'social worker',
  'not specified',
]);

function isSystemRoleName(name: string): boolean {
  return SYSTEM_ROLE_NAMES.has(name.toLowerCase());
}