import { useState, useEffect } from 'react';
import { useNavigate } from '@/shared/navigation';
import { userManagementFlow } from '@/modules/identity/application/flows/userManagement';
import { getFullName } from '@/shared/lib/userUtils';
import { Icon } from '@/shared/ui';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';
import type { User } from '@/shared/types/user';

export default function DeletedUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();

    const loadDeletedUsers = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await userManagementFlow.getAllUsers();

            if (result.success && result.users) {
                // Filtrar solo usuarios eliminados (inactivos por soft delete)
                const deletedUsers = result.users.filter(user => user.uIsActive === false);
                setUsers(deletedUsers);
            } else {
                setError(result.error || 'Error al cargar usuarios eliminados');
            }
        } catch (err) {
            console.error('Error cargando usuarios eliminados:', err);
            setError('Error inesperado al cargar usuarios eliminados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
      let active = true;
      let cleanup: (() => void) | undefined;
      void Promise.resolve().then(() => {
        if (!active) return;
        const maybeCleanup = (() => {
        loadDeletedUsers();

        })();
        if (typeof maybeCleanup === "function") cleanup = maybeCleanup;
      });
      return () => {
        active = false;
        cleanup?.();
      };
    }, []);

    const filteredUsers = users.filter(user => {
        if (!searchTerm.trim()) return true;
        return user.uName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.uEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.uIdentification || '').toString().toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Función para limpiar la búsqueda
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const handleRestoreClick = async (user: User) => {
        const fullName = getFullName(user);
        const confirmed = await feedback.confirm(
            'Recuperar usuario',
            `¿Estás seguro que deseas recuperar al usuario "${fullName}"?`
        );
        if (!confirmed) return;

        setLoading(true);
        const result = await userManagementFlow.toggleUserStatus(user.id);

        if (result.success) {
            // Recargar la lista de usuarios eliminados
            await loadDeletedUsers();
            feedback.success(result.message || 'Usuario recuperado exitosamente');
            feedback.showNotification({
                title: 'Usuario recuperado',
                message: `El usuario ${fullName} ha sido recuperado exitosamente.`,
                variant: 'success'
            });
        } else {
            feedback.error(result.error || 'Error al recuperar usuario');
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
                    <p className="text-muted fw-medium">Cargando usuarios eliminados...</p>
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
                        <button className="btn btn-secondary" onClick={() => navigate('/users')}>
                            Volver a la lista
                        </button>
                        <button className="btn btn-primary" onClick={loadDeletedUsers}>
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
                                <h1 className="h3 fw-bold mb-1">Usuarios Eliminados</h1>
                                <p className="text-muted mb-0">Recupera usuarios que han sido eliminados del sistema</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                    onClick={() => navigate('/users')}
                                >
                                    <Icon name="arrow_back" size="sm" />
                                    Volver a usuarios
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
                                                <Icon name="search" size="sm" className="text-muted" />
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
                                                    <Icon name="close" size="sm" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 col-lg-6">
                                        <div className="d-flex align-items-center h-100">
                                            <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 fs-6 d-inline-flex align-items-center">
                                                <Icon name="trash" size="sm" className="me-2" />
                                                {filteredUsers.length} usuarios eliminados
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
                                        <Icon name="search" size="xl" className="display-4 text-muted mb-3 d-block" />
                                        <h5 className="text-muted">No se encontraron resultados</h5>
                                        <p className="text-muted">Intenta con otros términos de búsqueda</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-5">
                                        <Icon name="trash" size="xl" className="display-4 text-muted mb-3 d-block" />
                                        <h5 className="text-muted mb-3">No hay usuarios eliminados</h5>
                                        <p className="text-muted">Todos los usuarios están activos en el sistema</p>
                                        <button
                                            className="btn btn-primary mt-3"
                                            onClick={() => navigate('/users')}
                                        >
                                            <Icon name="arrow_back" size="sm" className="me-2" />
                                            Volver a usuarios
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
                                                    <tr key={user.id} className="border-bottom table-secondary opacity-75">
                                                        <td className="ps-4 py-3">
                                                            <span className="badge bg-light text-dark">{index + 1}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className="fw-medium">{user.uIdentification}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                                    <Icon name="person" size="md" className="text-secondary" />
                                                                </div>
                                                                <div>
                                                                    <div className="fw-medium">{getFullName(user)}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Icon name="email" size="sm" className="text-muted" />
                                                                <span>{user.uEmail}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 d-inline-flex align-items-center">
                                                                <Icon name="trash" size="sm" className="me-1" />
                                                                Eliminado
                                                            </span>
                                                        </td>
                                                        <td className="pe-4 py-3">
                                                            <div className="d-flex justify-content-end gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => handleRestoreClick(user)}
                                                                    title="Recuperar usuario"
                                                                >
                                                                    <Icon name="refresh" size="sm" />
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
