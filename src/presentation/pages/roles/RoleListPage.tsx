import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleFlow } from '../../../infrastructure/flows/role';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { UserRole } from '../../../types/user';

export default function RoleListPage() {
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRoles, setFilteredRoles] = useState<UserRole[]>([]);
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();

    // Cargar roles al montar el componente
    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await roleFlow.getAllRoles();

            if (result.success && result.roles) {
                setRoles(result.roles);
                setFilteredRoles(result.roles);
            } else {
                setError(result.error || 'Error al cargar roles');
            }
        } catch (err) {
            console.error('Error cargando roles:', err);
            setError('Error inesperado al cargar roles');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar roles por término de búsqueda
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredRoles(roles);
        } else {
            const filtered = roles.filter(role =>
                role.rName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRoles(filtered);
        }
    }, [searchTerm, roles]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleViewRole = (roleId: number) => {
        navigate(`/roles/view/${roleId}`);
    };

    const handleEditRole = (roleId: number) => {
        navigate(`/roles/edit/${roleId}`);
    };

    const handleDeleteRole = async (role: UserRole) => {
        // Solo permitir eliminar roles que no sean del sistema (ID > 10 o verificar si no es admin del sistema)
        if (role.id <= 10) {
            feedback.error('No se pueden eliminar los roles del sistema.');
            return;
        }

        const confirmed = await feedback.confirm(
            'Eliminar rol',
            `¿Estás seguro de que deseas eliminar el rol "${role.rName}"?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        setError('');

        try {
            const result = await roleFlow.deleteRole(role.id);

            if (result.success) {
                feedback.success('Rol eliminado exitosamente');
                feedback.showNotification({
                    title: 'Rol eliminado',
                    message: `El rol "${role.rName}" ha sido eliminado exitosamente.`,
                    variant: 'success'
                });
                // Recargar la lista de roles
                await loadRoles();
            } else {
                setError(result.error || 'Error al eliminar rol');
            }
        } catch (err) {
            console.error('Error eliminando rol:', err);
            setError('Error inesperado al eliminar rol');
        }
    };

    const handleCreateRole = () => {
        navigate('/roles/create');
    };

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <h1 className="h3 fw-bold mb-1">Gestión de Roles</h1>
                                <p className="text-muted mb-0">Administra los roles y permisos del sistema</p>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2"
                                onClick={handleCreateRole}
                            >
                                <i className="bi bi-plus-circle"></i>
                                Nuevo Rol
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                                <button type="button" className="btn-close" onClick={() => setError('')}></button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom py-3">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-shield-check me-2 text-primary"></i>
                                        Lista de Roles
                                    </h5>
                                    <div className="d-flex gap-2 w-100 w-md-auto">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-search"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Buscar roles..."
                                                value={searchTerm}
                                                onChange={handleSearch}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                        <p className="text-muted mt-2">Cargando roles...</p>
                                    </div>
                                ) : filteredRoles.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-shield-x display-4 text-muted mb-3"></i>
                                        <h5 className="text-muted">No se encontraron roles</h5>
                                        <p className="text-muted">
                                            {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Aún no hay roles registrados.'}
                                        </p>
                                        {!searchTerm && (
                                            <button
                                                className="btn btn-primary mt-3"
                                                onClick={handleCreateRole}
                                            >
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Crear Primer Rol
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="border-0 fw-semibold px-4 py-3">ID</th>
                                                    <th className="border-0 fw-semibold px-4 py-3">Nombre del Rol</th>
                                                    <th className="border-0 fw-semibold px-4 py-3 text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRoles.map((role) => (
                                                    <tr key={role.id} className="align-middle">
                                                        <td className="px-4 py-3">
                                                            <span className="badge bg-secondary fs-6 px-3 py-2">
                                                                #{role.id}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                                                    <i className="bi bi-shield-check"></i>
                                                                </div>
                                                                <div>
                                                                    <h6 className="mb-0 fw-semibold">{role.rName}</h6>
                                                                    <small className="text-muted">Rol del sistema</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="btn-group" role="group">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleViewRole(role.id)}
                                                                    title="Ver detalles"
                                                                >
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-warning"
                                                                    onClick={() => handleEditRole(role.id)}
                                                                    title="Editar rol"
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                {role.id > 10 && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDeleteRole(role)}
                                                                        title="Eliminar rol"
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            {!loading && filteredRoles.length > 0 && (
                                <div className="card-footer bg-white border-top py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Mostrando {filteredRoles.length} de {roles.length} roles
                                        </small>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={loadRoles}
                                            disabled={loading}
                                        >
                                            <i className="bi bi-arrow-clockwise me-1"></i>
                                            Actualizar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}