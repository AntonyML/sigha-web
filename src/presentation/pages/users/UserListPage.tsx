import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userFlow } from '../../../infrastructure/flows/userFlow';
import type { User } from '../../../types/user';

export default function UserListPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const navigate = useNavigate();

    // Cargar usuarios al montar el componente
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await userFlow.getAllUsers();

            if (result.success && result.users) {
                setUsers(result.users);
                setFilteredUsers(result.users);
            } else {
                setError(result.error || 'Error al cargar usuarios');
            }
        } catch (err) {
            console.error('Error cargando usuarios:', err);
            setError('Error inesperado al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = users;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(user => 
                filterStatus === 'active' ? user.uIsActive : !user.uIsActive
            );
        }

        if (searchTerm.trim()) {
            filtered = filtered.filter(user =>
                user.uName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.uEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.uIdentification || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, filterStatus]);

    // Función para limpiar la búsqueda
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const handleView = (user: User) => {
        navigate(`/users/view/${user.id}`);
    };

    const handleEdit = (user: User) => {
        navigate(`/users/edit/${user.id}`);
    };

    const handleDeleteClick = async (user: User) => {
        const fullName = userFlow.getFullName(user);
        const ok = window.confirm(`¿Estás seguro que deseas eliminar al usuario "${fullName}"?`);
        if (!ok) return;

        setLoading(true);
        const result = await userFlow.deleteUser(user.id);

        if (result.success) {
            // Recargar la lista de usuarios
            await loadUsers();
            alert(result.message || 'Usuario eliminado exitosamente');
        } else {
            alert(result.error || 'Error al eliminar usuario');
        }
        setLoading(false);
    };

    const handleToggleStatus = async (user: User) => {
        const newStatus = !user.uIsActive;
        const action = newStatus ? 'activar' : 'desactivar';
        const fullName = userFlow.getFullName(user);

        const ok = window.confirm(`¿Deseas ${action} al usuario "${fullName}"?`);
        if (!ok) return;

        setLoading(true);
        const result = await userFlow.toggleUserStatus(user.id, newStatus);

        if (result.success) {
            await loadUsers();
            alert(result.message || `Usuario ${action}do exitosamente`);
        } else {
            alert(result.error || `Error al ${action} usuario`);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-muted fw-medium">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error}</p>
                    <hr />
                    <div className="d-flex gap-2">
                        <button className="btn btn-secondary" onClick={() => navigate('/main-menu')}>
                            Volver al menú
                        </button>
                        <button className="btn btn-primary" onClick={loadUsers}>
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <h1 className="h3 fw-bold mb-1">Gestión de Usuarios</h1>
                                <p className="text-muted mb-0">Administra los usuarios del sistema</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                    onClick={() => navigate('/main-menu')}
                                >
                                    <i className="bi bi-arrow-left"></i>
                                    Regresar
                                </button>
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={() => navigate('/users/create')}
                                >
                                    <i className="bi bi-plus-lg"></i>
                                    Nuevo Usuario
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12 col-lg-6">
                                        <div className="input-group input-group-lg">
                                            <span className="input-group-text bg-white border-end-0">
                                                <i className="bi bi-search text-muted"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Buscar por nombre, email o identificación..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            {searchTerm && (
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={handleClearSearch}
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 col-lg-3">
                                        <select 
                                            className="form-select form-select-lg"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                                        >
                                            <option value="all">Todos los estados</option>
                                            <option value="active">Activos</option>
                                            <option value="inactive">Inactivos</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-lg-3">
                                        <div className="d-flex align-items-center h-100">
                                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 fs-6">
                                                <i className="bi bi-people-fill me-2"></i>
                                                {filteredUsers.length} usuarios
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-0">
                                {filteredUsers.length === 0 && searchTerm ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-search display-4 text-muted mb-3 d-block"></i>
                                        <h5 className="text-muted">No se encontraron resultados</h5>
                                        <p className="text-muted">Intenta con otros términos de búsqueda</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-person-plus display-4 text-muted mb-3 d-block"></i>
                                        <h5 className="text-muted mb-3">No hay usuarios registrados</h5>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => navigate('/users/create')}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Crear primer usuario
                                        </button>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="ps-4 py-3 fw-semibold text-muted text-uppercase small">#</th>
                                                    <th className="py-3 fw-semibold text-muted text-uppercase small">Identificación</th>
                                                    <th className="py-3 fw-semibold text-muted text-uppercase small">Nombre Completo</th>
                                                    <th className="py-3 fw-semibold text-muted text-uppercase small">Email</th>
                                                    <th className="py-3 fw-semibold text-muted text-uppercase small">Estado</th>
                                                    <th className="pe-4 py-3 fw-semibold text-muted text-uppercase small text-end">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map((user, index) => (
                                                    <tr key={user.id} className="border-bottom">
                                                        <td className="ps-4 py-3">
                                                            <span className="badge bg-light text-dark">{index + 1}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className="fw-medium">{user.uIdentification}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                                    <i className="bi bi-person-fill text-primary"></i>
                                                                </div>
                                                                <div>
                                                                    <div className="fw-medium">{userFlow.getFullName(user)}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <i className="bi bi-envelope text-muted"></i>
                                                                <span>{user.uEmail}</span>
                                                                {user.uEmailVerified && (
                                                                    <span className="badge bg-info bg-opacity-10 text-info" title="Email verificado">
                                                                        <i className="bi bi-patch-check-fill"></i>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`badge ${user.uIsActive ? 'bg-success' : 'bg-secondary'} bg-opacity-10 text-${user.uIsActive ? 'success' : 'secondary'} px-3 py-2`}>
                                                                <i className={`bi ${user.uIsActive ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                                                                {user.uIsActive ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </td>
                                                        <td className="pe-4 py-3">
                                                            <div className="d-flex justify-content-end gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-light"
                                                                    onClick={() => handleView(user)}
                                                                    title="Ver detalles"
                                                                >
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-light"
                                                                    onClick={() => handleEdit(user)}
                                                                    title="Editar"
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className={`btn btn-sm ${user.uIsActive ? 'btn-warning' : 'btn-success'}`}
                                                                    onClick={() => handleToggleStatus(user)}
                                                                    title={user.uIsActive ? 'Desactivar' : 'Activar'}
                                                                >
                                                                    <i className={`bi ${user.uIsActive ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDeleteClick(user)}
                                                                    title="Eliminar"
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}