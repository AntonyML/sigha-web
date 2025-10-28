import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import { roleFlow } from '../../../infrastructure/flows/role';
import type { UserRole } from '../../../types/user';

export default function ViewRolePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [deleting, setDeleting] = useState<boolean>(false);

    useEffect(() => {
        const loadRole = async () => {
            if (!id) {
                setError('ID de rol no proporcionado');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const result = await roleFlow.getRoleById(Number(id));

                if (result.success && result.role) {
                    setRole(result.role);
                } else {
                    setError(result.error || 'Error al cargar rol');
                }
            } catch (err) {
                console.error('Error cargando rol:', err);
                setError('Error inesperado al cargar el rol');
            } finally {
                setLoading(false);
            }
        };

        loadRole();
    }, [id]);

    const handleEditRole = () => {
        navigate(`/roles/edit/${id}`);
    };

    const handleDeleteRole = async () => {
        if (!role) return;

        // Verificar si el rol puede ser eliminado
        if (role.rIsAdmin) {
            feedback.showNotification({
                title: 'No se puede eliminar',
                message: 'No se pueden eliminar roles administrativos.',
                variant: 'warning'
            });
            return;
        }

        // Verificar si es un rol crítico del sistema (por nombre)
        const criticalRoles = ['Super Admin', 'Administrador', 'Admin'];
        if (criticalRoles.includes(role.rName)) {
            feedback.showNotification({
                title: 'No se puede eliminar',
                message: 'Este es un rol crítico del sistema y no puede ser eliminado.',
                variant: 'warning'
            });
            return;
        }

        // Confirmar eliminación
        const confirmed = await feedback.confirm(
            '¿Eliminar Rol?',
            `¿Estás seguro de que deseas eliminar el rol "${role.rName}"? Esta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        setDeleting(true);

        try {
            const result = await roleFlow.deleteRole(role.id);

            if (result.success) {
                feedback.showNotification({
                    title: 'Rol eliminado',
                    message: `El rol "${role.rName}" ha sido eliminado exitosamente.`,
                    variant: 'success'
                });
                navigate('/roles');
            } else {
                setError(result.error || 'Error al eliminar el rol');
            }
        } catch (err) {
            console.error('Error eliminando rol:', err);
            setError('Error inesperado al eliminar el rol');
        } finally {
            setDeleting(false);
        }
    };

    const handleBackToList = () => {
        navigate('/roles');
    };

    if (loading) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-muted">Cargando detalles del rol...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 bg-light">
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center p-5">
                                    <i className="bi bi-exclamation-triangle display-4 text-danger mb-4"></i>
                                    <h4 className="card-title text-danger mb-3">Error al Cargar Rol</h4>
                                    <p className="card-text text-muted mb-4">{error}</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleBackToList}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Volver a la Lista
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!role) {
        return (
            <div className="min-vh-100 bg-light">
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center p-5">
                                    <i className="bi bi-shield-x display-4 text-muted mb-4"></i>
                                    <h4 className="card-title text-muted mb-3">Rol No Encontrado</h4>
                                    <p className="card-text text-muted mb-4">
                                        El rol que buscas no existe o ha sido eliminado.
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleBackToList}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Volver a la Lista
                                    </button>
                                </div>
                            </div>
                        </div>
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
                                <h1 className="h3 fw-bold mb-1">Detalles del Rol</h1>
                                <p className="text-muted mb-0">Información completa del rol seleccionado</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                                    onClick={handleEditRole}
                                >
                                    <i className="bi bi-pencil"></i>
                                    Editar Rol
                                </button>
                                {role && !role.rIsAdmin && !['Super Admin', 'Administrador', 'Admin'].includes(role.rName) && (
                                    <button
                                        className="btn btn-outline-danger d-flex align-items-center gap-2"
                                        onClick={handleDeleteRole}
                                        disabled={deleting}
                                    >
                                        <i className={`bi ${deleting ? 'bi-hourglass-split' : 'bi-trash'}`}></i>
                                        {deleting ? 'Eliminando...' : 'Eliminar Rol'}
                                    </button>
                                )}
                                <button
                                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                    onClick={handleBackToList}
                                >
                                    <i className="bi bi-arrow-left"></i>
                                    Volver a la Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-lg-8">
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-shield-check me-2 text-primary"></i>
                                    Información del Rol
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-12">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-4" style={{width: '80px', height: '80px'}}>
                                                <i className="bi bi-shield-check fs-1"></i>
                                            </div>
                                            <div>
                                                <h3 className="mb-1 fw-bold">{role.rName}</h3>
                                                <p className="text-muted mb-2">Rol del Sistema</p>
                                                <span className="badge bg-primary fs-6 px-3 py-2">
                                                    ID: #{role.id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="border rounded p-3 bg-light">
                                            <h6 className="fw-semibold mb-3">
                                                <i className="bi bi-info-circle me-2 text-info"></i>
                                                Información General
                                            </h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <small className="text-muted d-block">ID del Rol</small>
                                                    <span className="fw-semibold">{role.id}</span>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted d-block">Nombre</small>
                                                    <span className="fw-semibold">{role.rName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-info-circle me-2 text-warning"></i>
                                    Estado de Implementación
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="alert alert-warning border-0 bg-light">
                                    <h6 className="alert-heading fw-semibold">
                                        <i className="bi bi-tools me-2"></i>
                                        Funcionalidad en Desarrollo
                                    </h6>
                                    <p className="mb-2">
                                        Esta vista de detalles está preparada para mostrar información completa del rol,
                                        incluyendo permisos asociados y estadísticas de uso.
                                    </p>
                                    <hr />
                                    <p className="mb-0 small">
                                        <strong>Próximas funcionalidades:</strong> Visualización de permisos,
                                        estadísticas de usuarios con este rol, y opciones de gestión avanzada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h6 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-gear me-2 text-secondary"></i>
                                    Acciones Rápidas
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={handleEditRole}
                                    >
                                        <i className="bi bi-pencil me-2"></i>
                                        Editar Rol
                                    </button>
                                    {role && !role.rIsAdmin && !['Super Admin', 'Administrador', 'Admin'].includes(role.rName) && (
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={handleDeleteRole}
                                            disabled={deleting}
                                        >
                                            <i className={`bi ${deleting ? 'bi-hourglass-split' : 'bi-trash'} me-2`}></i>
                                            {deleting ? 'Eliminando...' : 'Eliminar'}
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-outline-info btn-sm"
                                        onClick={() => feedback.info('Funcionalidad próximamente disponible', 'La vista de usuarios asignados a este rol estará disponible en futuras versiones.')}
                                    >
                                        <i className="bi bi-people me-2"></i>
                                        Ver Usuarios
                                    </button>
                                    <button
                                        className="btn btn-outline-warning btn-sm"
                                        onClick={() => feedback.info('Funcionalidad próximamente disponible', 'La gestión de permisos estará disponible en futuras versiones.')}
                                    >
                                        <i className="bi bi-key me-2"></i>
                                        Gestionar Permisos
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom py-3">
                                <h6 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-graph-up me-2 text-success"></i>
                                    Estadísticas
                                </h6>
                            </div>
                            <div className="card-body p-3 text-center">
                                <div className="mb-3">
                                    <div className="display-6 fw-bold text-success">--</div>
                                    <small className="text-muted">Usuarios activos</small>
                                </div>
                                <div className="mb-3">
                                    <div className="display-6 fw-bold text-info">--</div>
                                    <small className="text-muted">Permisos asignados</small>
                                </div>
                                <small className="text-muted d-block">
                                    Estadísticas disponibles próximamente
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}