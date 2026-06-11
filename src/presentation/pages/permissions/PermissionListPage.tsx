import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { permissionFlow } from '../../../infrastructure/flows/permission';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { PermissionApi } from '../../../services/permissionApiService';

export default function PermissionListPage() {
    const [permissions, setPermissions] = useState<PermissionApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPermissions, setFilteredPermissions] = useState<PermissionApi[]>([]);
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();

    useEffect(() => {
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await permissionFlow.getAllPermissions();

            if (result.success && result.permissions) {
                setPermissions(result.permissions);
                setFilteredPermissions(result.permissions);
            } else {
                setError(result.error || 'Error al cargar permisos');
            }
        } catch (err) {
            console.error('Error cargando permisos:', err);
            setError('Error inesperado al cargar permisos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPermissions(permissions);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = permissions.filter(permission =>
                permission.pName.toLowerCase().includes(term) ||
                permission.pDescription.toLowerCase().includes(term) ||
                permission.pModule.toLowerCase().includes(term) ||
                permission.pAction.toLowerCase().includes(term)
            );
            setFilteredPermissions(filtered);
        }
    }, [searchTerm, permissions]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleViewPermission = (permissionId: number) => {
        navigate(`/permissions/view/${permissionId}`);
    };

    const handleEditPermission = (permissionId: number) => {
        navigate(`/permissions/edit/${permissionId}`);
    };

    const handleDeletePermission = async (permission: PermissionApi) => {
        const confirmed = await feedback.confirm(
            'Eliminar permiso',
            `¿Estás seguro de que deseas eliminar el permiso "${permission.pName}"?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        setError('');

        try {
            const result = await permissionFlow.deletePermission(permission.id);

            if (result.success) {
                feedback.success('Permiso eliminado exitosamente');
                feedback.showNotification({
                    title: 'Permiso eliminado',
                    message: `El permiso "${permission.pName}" ha sido eliminado exitosamente.`,
                    variant: 'success'
                });
                await loadPermissions();
            } else {
                setError(result.error || 'Error al eliminar permiso');
            }
        } catch (err) {
            console.error('Error eliminando permiso:', err);
            setError('Error inesperado al eliminar permiso');
        }
    };

    const handleCreatePermission = () => {
        navigate('/permissions/create');
    };

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <h1 className="h3 fw-bold mb-1">Gestión de Permisos</h1>
                                <p className="text-muted mb-0">Administra los permisos del sistema</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={handleCreatePermission}
                                >
                                    <i className="bi bi-plus-circle"></i>
                                    Nuevo Permiso
                                </button>
                            </div>
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
                                        Lista de Permisos
                                    </h5>
                                    <div className="d-flex gap-2 w-100 w-md-auto">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-search"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Buscar permisos..."
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
                                        <p className="text-muted mt-2">Cargando permisos...</p>
                                    </div>
                                ) : filteredPermissions.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-shield-x display-4 text-muted mb-3"></i>
                                        <h5 className="text-muted">No se encontraron permisos</h5>
                                        <p className="text-muted">
                                            {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Aún no hay permisos registrados.'}
                                        </p>
                                        {!searchTerm && (
                                            <button
                                                className="btn btn-primary mt-3"
                                                onClick={handleCreatePermission}
                                            >
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Crear Primer Permiso
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="border-0 fw-semibold px-4 py-3">ID</th>
                                                    <th className="border-0 fw-semibold px-4 py-3">Nombre</th>
                                                    <th className="border-0 fw-semibold px-4 py-3">Módulo</th>
                                                    <th className="border-0 fw-semibold px-4 py-3">Acción</th>
                                                    <th className="border-0 fw-semibold px-4 py-3 text-center">Estado</th>
                                                    <th className="border-0 fw-semibold px-4 py-3 text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPermissions.map((permission) => (
                                                    <tr key={permission.id} className="align-middle">
                                                        <td className="px-4 py-3">
                                                            <span className="badge bg-secondary fs-6 px-3 py-2">
                                                                #{permission.id}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                                                    <i className="bi bi-shield-check"></i>
                                                                </div>
                                                                <div>
                                                                    <h6 className="mb-0 fw-semibold">{permission.pName}</h6>
                                                                    <small className="text-muted">{permission.pDescription}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="badge bg-info">{permission.pModule}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="badge bg-warning">{permission.pAction}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`badge ${permission.pEnabled ? 'bg-success' : 'bg-danger'}`}>
                                                                {permission.pEnabled ? 'Habilitado' : 'Deshabilitado'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="btn-group" role="group">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleViewPermission(permission.id)}
                                                                    title="Ver detalles"
                                                                >
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-warning"
                                                                    onClick={() => handleEditPermission(permission.id)}
                                                                    title="Editar permiso"
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDeletePermission(permission)}
                                                                    title="Eliminar permiso"
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
                            {!loading && filteredPermissions.length > 0 && (
                                <div className="card-footer bg-white border-top py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Mostrando {filteredPermissions.length} de {permissions.length} permisos
                                        </small>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={loadPermissions}
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
