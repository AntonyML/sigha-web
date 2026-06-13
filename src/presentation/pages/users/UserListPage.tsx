import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/atoms'
import { userManagementFlow } from '../../../infrastructure/flows/userManagement'
import { getFullName } from '../../../utils/userUtils'
import { PermissionUtils } from '../../../utils/permissionUtils'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import type { User } from '../../../types/user'
import '../../styles/lp.css'

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [canDeleteUsers, setCanDeleteUsers] = useState(false)
  const [canCreateUsers, setCanCreateUsers] = useState(false)
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  useEffect(() => { loadUsersAndPermissions() }, [])

  const loadUsersAndPermissions = async () => {
    setLoading(true)
    setError('')
    try {
      const [canDelete, canCreate] = await Promise.all([
        PermissionUtils.canDeleteUsers(),
        PermissionUtils.canCreateUsers()
      ])
      setCanDeleteUsers(canDelete)
      setCanCreateUsers(canCreate)

      const result = await userManagementFlow.getAllUsers()
      if (result.success && result.users) {
        setUsers(result.users)
      } else {
        setError(result.error || 'Error al cargar usuarios')
      }
    } catch (err) {
      console.error('Error cargando usuarios y permisos:', err)
      setError('Error inesperado al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = async (user: User) => {
    if (!canDeleteUsers) {
      feedback.error('No tienes permisos para eliminar usuarios', 'Acceso denegado')
      return
    }
    const fullName = getFullName(user)
    const confirmed = await feedback.confirm(
      'Eliminar usuario',
      `¿Estás seguro que deseas eliminar al usuario "${fullName}"?\n\nEsta acción no se puede deshacer.`
    )
    if (!confirmed) return

    setLoading(true)
    const result = await userManagementFlow.deleteUser(user.id)
    if (result.success) {
      await loadUsersAndPermissions()
      feedback.success(result.message || 'Usuario eliminado exitosamente')
      feedback.showNotification({
        title: 'Usuario eliminado',
        message: `El usuario "${fullName}" ha sido eliminado del sistema`,
        variant: 'success'
      })
    } else {
      feedback.error(result.error || 'Error al eliminar usuario', 'Error de eliminación')
    }
    setLoading(false)
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      user.uName.toLowerCase().includes(q) ||
      user.uEmail.toLowerCase().includes(q) ||
      (user.uIdentification || '').toString().toLowerCase().includes(q)
    )
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filteredUsers)

  if (loading) {
    return (
      <div className="lp-loading" style={{ minHeight: '100vh' }}>
        <div className="lp-spinner" style={{ width: '3rem', height: '3rem' }} />
        <span>Cargando usuarios...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lp-page">
        <div className="lp-error" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <strong>Error</strong>
          <p style={{ margin: 0 }}>{error}</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="lp-btn lp-btn--back" onClick={() => navigate('/dashboard')}>Volver al inicio</button>
            <button className="lp-btn lp-btn--primary" onClick={loadUsersAndPermissions}>Reintentar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lp-page">
      <div className="lp-header">
        <div>
          <h2 className="lp-title">
            <Icon name="group" size="md" />
            Gestión de Usuarios
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>Administra los usuarios del sistema</p>
        </div>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--warning" onClick={() => navigate('/users/deleted')}>
            <Icon name="refresh" size="sm" /> Recuperar Eliminados
          </button>
          <button
            className="lp-btn lp-btn--primary"
            onClick={() => navigate('/users/create')}
            disabled={!canCreateUsers}
            title={!canCreateUsers ? 'No tienes permisos para crear usuarios' : 'Crear nuevo usuario'}
          >
            <Icon name="add" size="sm" /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="lp-search-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="lp-search-wrap" style={{ flex: 1, minWidth: '220px' }}>
            <Icon name="search" size="sm" className="lp-search-icon" />
            <input
              type="text"
              className="lp-search-input"
              placeholder="Buscar por nombre, correo o identificación..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="lp-search-clear" onClick={() => setSearchTerm('')}>
                <Icon name="close" size="sm" />
              </button>
            )}
          </div>
          <span className="lp-count">
            <Icon name="group" size="sm" />
            {filteredUsers.length} usuarios
          </span>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="lp-empty">
          <Icon name="person" size="xl" className="lp-empty__icon" />
          <p>{searchTerm ? 'No se encontraron resultados. Intenta con otros términos.' : 'No hay usuarios registrados.'}</p>
          {!searchTerm && (
            <button className="lp-btn lp-btn--primary" onClick={() => navigate('/users/create')} disabled={!canCreateUsers}>
              <Icon name="add" size="sm" /> Crear primer usuario
            </button>
          )}
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>#</th>
                  <th>Identificación</th>
                  <th>Nombre Completo</th>
                  <th>Correo</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((user, index) => (
                  <tr key={user.id}>
                    <td><span className="lp-badge lp-badge--secondary">{(page - 1) * pageSize + index + 1}</span></td>
                    <td><span style={{ fontWeight: 500 }}>{user.uIdentification}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name="person" size="md" style={{ color: '#2563eb' }} />
                        </div>
                        <span style={{ fontWeight: 500 }}>{getFullName(user)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon name="email" size="sm" style={{ color: '#94a3b8' }} />
                        <span>{user.uEmail}</span>
                        {user.uEmailVerified && (
                          <span className="lp-badge lp-badge--info" title="Email verificado">
                            <Icon name="verified" size="sm" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button className="lp-icon-btn lp-icon-btn--view" title="Ver detalles" onClick={() => navigate(`/users/view/${user.id}`)}>
                          <Icon name="visibility" size="sm" />
                        </button>
                        <button className="lp-icon-btn lp-icon-btn--edit" title="Editar" onClick={() => navigate(`/users/edit/${user.id}`)}>
                          <Icon name="edit" size="sm" />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title={canDeleteUsers ? 'Eliminar' : 'No tienes permisos para eliminar usuarios'}
                          disabled={!canDeleteUsers}
                          onClick={() => handleDeleteClick(user)}
                        >
                          <Icon name="delete" size="sm" />
                        </button>
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