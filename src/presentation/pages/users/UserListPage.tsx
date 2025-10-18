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

    // Efecto para filtrar los usuarios basado en el término de búsqueda
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.uName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.uEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.uIdentification || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [users, searchTerm]);

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
            <div className="container py-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3 text-muted">Cargando usuarios...</p>
                    </div>
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
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Lista de Usuarios</h2>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/main-menu')}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Regresar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/users/create')}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Crear Usuario
                    </button>
                </div>
            </div>

            {/* Buscador de usuarios */}
            <div className="row mb-4">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por nombre, email o identificación"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={handleClearSearch}
                                title="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <small className="text-muted mt-1 d-block">
                            Mostrando {filteredUsers.length} de {users.length} usuarios
                        </small>
                    )}
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Identificación</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 && searchTerm && (
                            <tr>
                                <td colSpan={6} className="text-center py-4">
                                    <p className="text-muted mb-0">No se encontraron resultados para "{searchTerm}".</p>
                                </td>
                            </tr>
                        )}
                        {filteredUsers.length === 0 && !searchTerm && (
                            <tr>
                                <td colSpan={6} className="text-center py-4">
                                    <p className="text-muted mb-0">No hay usuarios registrados.</p>
                                    <button className="btn btn-primary btn-sm mt-2" onClick={() => navigate('/users/create')}>
                                        Crear primer usuario
                                    </button>
                                </td>
                            </tr>
                        )}
                        {filteredUsers.map((user, index) => (
                            <tr key={user.id}>
                                <td>{index + 1}</td>
                                <td>{user.uIdentification}</td>
                                <td>{userFlow.getFullName(user)}</td>
                                <td>{user.uEmail}</td>
                                <td>
                                    <span className={`badge ${user.uIsActive ? 'bg-success' : 'bg-secondary'}`}>
                                        {user.uIsActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                    {user.uEmailVerified && (
                                        <span className="badge bg-info ms-1" title="Email verificado">
                                            <i className="bi bi-check-circle"></i>
                                        </span>
                                    )}
                                </td>
                                <td className="text-end">
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => handleView(user)}
                                            title="Ver detalles"
                                        >
                                            <i className="bi bi-eye"></i>
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEdit(user)}
                                            title="Editar usuario"
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                        <button
                                            className={`btn btn-sm ${user.uIsActive ? 'btn-warning' : 'btn-success'}`}
                                            onClick={() => handleToggleStatus(user)}
                                            title={user.uIsActive ? 'Desactivar' : 'Activar'}
                                        >
                                            <i className={`bi ${user.uIsActive ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteClick(user)}
                                            title="Eliminar usuario"
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
        </div>
    );
}