import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import { roleFlow } from '../../../infrastructure/flows/role';
import { permissionApiService } from '../../../services/permissionApiService';
import type { PermissionApi, RolePermissionApi } from '../../../services/permissionApiService';
import type { UserRole } from '../../../types/user';

/* ─── Labels amigables (display-only) ─────────────────── */

const ACTION_LABELS: Record<string, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
};

const ACTION_ORDER = ['view', 'create', 'edit', 'delete'];

const MODULE_LABELS: Record<string, string> = {
  users: 'Usuarios',
  roles: 'Roles',
  permissions: 'Permisos',
  audits: 'Auditoría',
  programs: 'Programas',
  'sub-programs': 'Subprogramas',
  vaccines: 'Vacunas',
  notifications: 'Notificaciones',
  'virtualFiles': 'Residentes',
  'entrance-exit': 'Entradas y Salidas',
  nursing: 'Enfermería',
  'older-adult-family': 'Familiares',
  'older-adult-updates': 'Actualizaciones',
  'emergency-contacts': 'Contactos de Emergencia',
  'medical-records': 'Expedientes Médicos',
  'clinical-medication': 'Medicamentos',
  'clinical-history': 'Condiciones Clínicas',
  'specialized-appointments': 'Citas Especializadas',
  'specialized-areas': 'Áreas Especializadas',
  'two-factor': '2FA',
  dashboard: 'Dashboard',
  profile: 'Perfil',
};

function moduleLabel(m: string): string {
  return MODULE_LABELS[m] ?? m;
}

/* ─── Component ───────────────────────────────────────── */

export default function ViewRolePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [deleting, setDeleting] = useState<boolean>(false);

    const [catalog,      setCatalog]      = useState<PermissionApi[]>([]);
    const [rolePerms,    setRolePerms]    = useState<RolePermissionApi[]>([]);
    const [loadingPerms, setLoadingPerms] = useState<boolean>(true);
    const [errorPerms,   setErrorPerms]   = useState<string>('');

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

    /* Cargar catálogo y permisos del rol desde el backend */
    useEffect(() => {
        if (!id) return;
        const roleId = Number(id);
        setLoadingPerms(true);
        setErrorPerms('');
        Promise.all([
            permissionApiService.getAll(),
            permissionApiService.getByRole(roleId),
        ])
            .then(([cat, rp]) => {
                setCatalog(cat);
                setRolePerms(rp);
            })
            .catch(err => {
                console.error('Error cargando permisos del rol:', err);
                setErrorPerms('No se pudieron cargar los permisos del rol.');
            })
            .finally(() => setLoadingPerms(false));
    }, [id]);

    /* Agrupar permisos del catálogo por módulo + estado de otorgamiento del rol */
    const groupedPermissions = useMemo(() => {
        const grantedIds = new Set(rolePerms.filter(rp => rp.rpGranted).map(rp => rp.permissionId));
        const byModule: Record<string, Array<{ action: string; granted: boolean; name: string }>> = {};
        for (const perm of catalog) {
            if (!perm.pEnabled) continue;
            if (!byModule[perm.pModule]) byModule[perm.pModule] = [];
            byModule[perm.pModule].push({
                action: perm.pAction,
                granted: grantedIds.has(perm.id),
                name: perm.pName,
            });
        }
        for (const mod of Object.keys(byModule)) {
            byModule[mod].sort((a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action));
        }
        return byModule;
    }, [catalog, rolePerms]);

    const grantedCount  = rolePerms.filter(rp => rp.rpGranted).length;
    const modulesCount  = Object.keys(groupedPermissions).length;
    const totalInCatalog = catalog.filter(p => p.pEnabled).length;

    const handleEditRole = () => {
        navigate(`/roles/edit/${id}`);
    };

    const handleDeleteRole = async () => {
        if (!role) return;

        if (role.rIsAdmin) {
            feedback.showNotification({
                title: 'No se puede eliminar',
                message: 'No se pueden eliminar roles administrativos.',
                variant: 'warning'
            });
            return;
        }

        const criticalRoles = ['Super Admin', 'Administrador', 'Admin'];
        if (criticalRoles.includes(role.rName)) {
            feedback.showNotification({
                title: 'No se puede eliminar',
                message: 'Este es un rol crítico del sistema y no puede ser eliminado.',
                variant: 'warning'
            });
            return;
        }

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

                        {/* Permisos del rol — conectado a GET /permissions y GET /permissions/role/:id */}
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-key me-2 text-primary"></i>
                                    Permisos del Rol
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                {loadingPerms && (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando permisos...</span>
                                        </div>
                                        <p className="text-muted small mt-2 mb-0">Cargando permisos del rol…</p>
                                    </div>
                                )}

                                {!loadingPerms && errorPerms && (
                                    <div className="alert alert-danger mb-0" role="alert">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        {errorPerms}
                                    </div>
                                )}

                                {!loadingPerms && !errorPerms && Object.keys(groupedPermissions).length === 0 && (
                                    <p className="text-muted text-center mb-0">No hay permisos activos definidos en el sistema.</p>
                                )}

                                {!loadingPerms && !errorPerms && Object.keys(groupedPermissions).length > 0 && (
                                    <div className="row g-3">
                                        {Object.entries(groupedPermissions).map(([module, actions]) => {
                                            const grantedInModule = actions.filter(a => a.granted).length;
                                            return (
                                                <div key={module} className="col-md-6">
                                                    <div className="border rounded p-3 h-100 bg-white">
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <h6 className="fw-semibold mb-0 text-capitalize">{moduleLabel(module)}</h6>
                                                            <span className={`badge ${grantedInModule === actions.length ? 'bg-success' : grantedInModule > 0 ? 'bg-warning text-dark' : 'bg-light text-secondary border'}`}>
                                                                {grantedInModule}/{actions.length}
                                                            </span>
                                                        </div>
                                                        <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                                                            {actions.map(a => (
                                                                <li
                                                                    key={a.action}
                                                                    className={`d-flex align-items-center gap-2 small ${a.granted ? 'text-body' : 'text-muted'}`}
                                                                    title={a.name}
                                                                >
                                                                    <i
                                                                        className={`bi ${a.granted ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'}`}
                                                                        aria-hidden="true"
                                                                    ></i>
                                                                    <span className={a.granted ? 'fw-semibold' : 'text-decoration-line-through'}>
                                                                        {ACTION_LABELS[a.action] ?? a.action}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
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
                                    <div className="display-6 fw-bold text-success">{grantedCount}</div>
                                    <small className="text-muted">Permisos otorgados</small>
                                </div>
                                <div className="mb-3">
                                    <div className="display-6 fw-bold text-info">{modulesCount}</div>
                                    <small className="text-muted">Módulos cubiertos</small>
                                </div>
                                <small className="text-muted d-block">
                                    {totalInCatalog} permisos activos en el sistema
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
