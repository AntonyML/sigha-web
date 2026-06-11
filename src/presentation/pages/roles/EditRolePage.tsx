import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roleFlow } from '../../../infrastructure/flows/role';
import { PermissionUtils } from '../../../utils/permissionUtils';
import { permissionService } from '../../../services/permissionService';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { UpdateRoleData } from '../../../types/user';
import type { Permission, PermissionModuleType, PermissionActionType } from '../../../types/permissions';
import { PermissionModule } from '../../../types/permissions';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';

interface RoleFormData {
    rName: string;
    rDescription?: string;
    rIsAdmin?: boolean;
    rRequires2FA?: boolean;
    rIsActive?: boolean;
}

export default function EditRolePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();
    const [formData, setFormData] = useState<RoleFormData>({
        rName: '',
        rDescription: '',
        rIsAdmin: false,
        rRequires2FA: false,
        rIsActive: true
    });
    const [originalData, setOriginalData] = useState<RoleFormData>({
        rName: '',
        rDescription: '',
        rIsAdmin: false,
        rRequires2FA: false,
        rIsActive: true
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [originalPermissions, setOriginalPermissions] = useState<Permission[]>([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);

    // Verificar permisos y cargar datos del rol al montar el componente
    useEffect(() => {
        const checkPermissionsAndLoadData = async () => {
            if (!id) {
                setError('ID de rol no proporcionado');
                setLoadingData(false);
                return;
            }

            try {
                // Verificar permisos
                const canManage = await PermissionUtils.canManageRoles();
                setHasPermission(canManage);

                if (!canManage) {
                    setLoadingData(false);
                    return;
                }

                // Cargar datos del rol
                setLoadingData(true);
                setError('');

                const result = await roleFlow.getRoleById(Number(id));

                if (result.success && result.role) {
                    const roleData: RoleFormData = {
                        rName: result.role.rName,
                        rDescription: result.role.rDescription || '',
                        rIsAdmin: result.role.rIsAdmin || false,
                        rRequires2FA: result.role.rRequires2FA || false,
                        rIsActive: result.role.rIsActive !== undefined ? result.role.rIsActive : true
                    };
                    setFormData(roleData);
                    setOriginalData(roleData);

                    // Cargar permisos del rol
                    setPermissionsLoading(true);
                    const rolePermissions = permissionService.getRolePermissionsByName(result.role.rName);
                    setPermissions(rolePermissions);
                    setOriginalPermissions(JSON.parse(JSON.stringify(rolePermissions))); // Deep copy
                    setPermissionsLoading(false);
                } else {
                    setError(result.error || 'Error al cargar rol');
                }
            } catch (err) {
                console.error('Error verificando permisos o cargando rol:', err);
                setError('Error inesperado al cargar el rol');
            } finally {
                setLoadingData(false);
            }
        };

        checkPermissionsAndLoadData();
    }, [id]);

    useEffect(() => {
        // Verificar si hay cambios en formData o permisos
        const formChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
        const permissionChanges = JSON.stringify(permissions) !== JSON.stringify(originalPermissions);
        setHasChanges(formChanges || permissionChanges);
    }, [formData, originalData, permissions, originalPermissions]);

    function onInputChange(field: keyof RoleFormData, value: string | boolean) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    function handlePermissionChange(module: PermissionModuleType, action: PermissionActionType, enabled: boolean) {
        setPermissions(prev => prev.map(permission =>
            permission.module === module && permission.action === action
                ? { ...permission, enabled }
                : permission
        ));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        // Verificar permisos antes de procesar
        if (hasPermission === false) {
            setError('No tienes permisos para editar roles.');
            return;
        }

        if (!formData.rName.trim()) {
            setError('Por favor ingresa el nombre del rol');
            return;
        }

        if (formData.rName.trim().length < 3) {
            setError('El nombre del rol debe tener al menos 3 caracteres');
            return;
        }

        if (!hasChanges) {
            setError('No hay cambios para guardar');
            return;
        }

        setLoading(true);

        try {
            // Crear el objeto de datos para actualizar
            const updateData: UpdateRoleData = {};

            // Solo incluir campos que han cambiado
            if (formData.rName !== originalData.rName) {
                updateData.rName = formData.rName;
            }
            if (formData.rDescription !== originalData.rDescription) {
                updateData.rDescription = formData.rDescription;
            }
            if (formData.rIsAdmin !== originalData.rIsAdmin) {
                updateData.rIsAdmin = formData.rIsAdmin;
            }
            if (formData.rRequires2FA !== originalData.rRequires2FA) {
                updateData.rRequires2FA = formData.rRequires2FA;
            }
            if (formData.rIsActive !== originalData.rIsActive) {
                updateData.rIsActive = formData.rIsActive;
            }

            const result = await roleFlow.updateRole(Number(id), updateData);

            if (result.success && result.role) {
                // Guardar permisos si han cambiado
                if (JSON.stringify(permissions) !== JSON.stringify(originalPermissions)) {
                    try {
                        await permissionService.updateRolePermissions(result.role.id, permissions);
                        setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
                    } catch (permError) {
                        console.error('Error guardando permisos:', permError);
                        feedback.error('Rol actualizado pero error al guardar permisos');
                    }
                }

                feedback.success('Rol actualizado exitosamente');
                feedback.showNotification({
                    title: 'Rol actualizado',
                    message: `El rol "${result.role.rName}" ha sido actualizado correctamente.`,
                    variant: 'success'
                });
                navigate(`/roles/view/${id}`);
            } else {
                setError(result.error || 'Error al actualizar rol');
            }
        } catch (err) {
            console.error('Error actualizando rol:', err);
            setError('Error inesperado al actualizar rol');
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = async () => {
        if (hasChanges) {
            const confirmed = await feedback.confirm(
                'Salir sin guardar',
                '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.'
            );
            if (!confirmed) return;
        }
        navigate(`/roles/view/${id}`);
    };

    if (loadingData) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-muted">Cargando datos del rol...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.rName) {
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
                                        onClick={() => navigate('/roles')}
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
                                <h1 className="h3 fw-bold mb-1">Editar Rol</h1>
                                <p className="text-muted mb-0">Modifica la información del rol seleccionado</p>
                            </div>
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={handleCancel}
                            >
                                <i className="bi bi-arrow-left"></i>
                                Volver
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

                {hasPermission === false && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
                                <i className="bi bi-shield-x-fill me-2"></i>
                                <strong>Acceso Denegado</strong>
                                <p className="mb-0 mt-2">No tienes permisos para editar roles. Solo los administradores del sistema pueden editar roles.</p>
                                <button type="button" className="btn-close" onClick={() => navigate('/roles')}></button>
                            </div>
                        </div>
                    </div>
                )}

                {hasPermission === true && (
                <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-shield-plus me-2 text-primary"></i>
                                        Información del Rol
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="rName" className="form-label fw-semibold">
                                                Nombre del Rol <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="rName"
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.rName}
                                                onChange={(e) => onInputChange('rName', e.target.value)}
                                                placeholder="Ej: Administrador, Enfermera, Doctor"
                                                required
                                                disabled={loading}
                                                minLength={3}
                                                maxLength={50}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                El nombre debe ser único y descriptivo (mínimo 3 caracteres)
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="rIsActive" className="form-label fw-semibold">
                                                Estado
                                            </label>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="rIsActive"
                                                    checked={formData.rIsActive}
                                                    onChange={(e) => onInputChange('rIsActive', e.target.checked)}
                                                    disabled={loading}
                                                />
                                                <label className="form-check-label" htmlFor="rIsActive">
                                                    {formData.rIsActive ? 'Activo' : 'Inactivo'}
                                                </label>
                                            </div>
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Indica si el rol está activo en el sistema
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="rIsAdmin" className="form-label fw-semibold">
                                                Rol Administrativo
                                            </label>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="rIsAdmin"
                                                    checked={formData.rIsAdmin}
                                                    onChange={(e) => onInputChange('rIsAdmin', e.target.checked)}
                                                    disabled={loading}
                                                />
                                                <label className="form-check-label" htmlFor="rIsAdmin">
                                                    {formData.rIsAdmin ? 'Es rol administrativo' : 'No es rol administrativo'}
                                                </label>
                                            </div>
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Los roles administrativos tienen permisos elevados
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="rRequires2FA" className="form-label fw-semibold">
                                                Requiere 2FA
                                            </label>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="rRequires2FA"
                                                    checked={formData.rRequires2FA}
                                                    onChange={(e) => onInputChange('rRequires2FA', e.target.checked)}
                                                    disabled={loading}
                                                />
                                                <label className="form-check-label" htmlFor="rRequires2FA">
                                                    {formData.rRequires2FA ? 'Requiere autenticación de dos factores' : 'No requiere 2FA'}
                                                </label>
                                            </div>
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Mayor seguridad para roles críticos
                                            </small>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="rDescription" className="form-label fw-semibold">
                                                Descripción
                                            </label>
                                            <textarea
                                                id="rDescription"
                                                className="form-control form-control-lg"
                                                value={formData.rDescription}
                                                onChange={(e) => onInputChange('rDescription', e.target.value)}
                                                placeholder="Describe las responsabilidades y permisos de este rol..."
                                                disabled={loading}
                                                rows={3}
                                                maxLength={255}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Descripción opcional del rol y sus funciones
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-shield-check me-2 text-primary"></i>
                                        Permisos del Rol
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    {permissionsLoading ? (
                                        <LoadingSpinner message="Cargando permisos..." size="sm" />
                                    ) : permissions.length === 0 ? (
                                        <AlertMessage
                                            type="warning"
                                            message="No se encontraron permisos para este rol"
                                        />
                                    ) : (
                                        <div className="row g-4">
                                            {(Object.keys(PermissionModule) as Array<keyof typeof PermissionModule>).map(moduleKey => {
                                                const module = PermissionModule[moduleKey] as PermissionModuleType;
                                                const modulePermissions = permissions.filter(p => p.module === module);
                                                if (modulePermissions.length === 0) return null;

                                                return (
                                                    <div key={module} className="col-12 col-md-6">
                                                        <div className="border rounded p-3">
                                                            <h6 className="fw-semibold mb-3 text-capitalize">
                                                                <i className="bi bi-folder me-2 text-primary"></i>
                                                                {module.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                            </h6>
                                                            <div className="d-flex flex-column gap-2">
                                                                {modulePermissions.map(permission => {
                                                                    const originalPermission = originalPermissions.find(
                                                                        op => op.module === permission.module && op.action === permission.action
                                                                    );
                                                                    const hasChanged = originalPermission ? originalPermission.enabled !== permission.enabled : false;

                                                                    return (
                                                                        <div key={`${permission.module}:${permission.action}`} className="form-check">
                                                                            <input
                                                                                className="form-check-input"
                                                                                type="checkbox"
                                                                                id={`perm-${permission.module}-${permission.action}`}
                                                                                checked={permission.enabled}
                                                                                onChange={(e) => handlePermissionChange(permission.module, permission.action, e.target.checked)}
                                                                                disabled={loading}
                                                                            />
                                                                            <label className={`form-check-label text-capitalize ${hasChanged ? 'text-success fw-semibold' : ''}`} htmlFor={`perm-${permission.module}-${permission.action}`}>
                                                                                {permission.action.replace('_', ' ')}
                                                                                {hasChanged && <i className="bi bi-pencil-square ms-1 small"></i>}
                                                                            </label>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <small className="text-muted d-block mt-3">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Configura los permisos que tendrá este rol en el sistema
                                    </small>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-info-circle me-2 text-info"></i>
                                        Información de Cambios
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Nombre Original</small>
                                                <span className="fw-semibold text-primary">{originalData.rName}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Nombre Nuevo</small>
                                                <span className={`fw-semibold ${formData.rName !== originalData.rName ? 'text-success' : 'text-muted'}`}>
                                                    {formData.rName || 'Sin cambios'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Estado Original</small>
                                                <span className="fw-semibold text-primary">{originalData.rIsActive ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Estado Nuevo</small>
                                                <span className={`fw-semibold ${formData.rIsActive !== originalData.rIsActive ? 'text-success' : 'text-muted'}`}>
                                                    {formData.rIsActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Rol Admin Original</small>
                                                <span className="fw-semibold text-primary">{originalData.rIsAdmin ? 'Sí' : 'No'}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Rol Admin Nuevo</small>
                                                <span className={`fw-semibold ${formData.rIsAdmin !== originalData.rIsAdmin ? 'text-success' : 'text-muted'}`}>
                                                    {formData.rIsAdmin ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Requiere 2FA Original</small>
                                                <span className="fw-semibold text-primary">{originalData.rRequires2FA ? 'Sí' : 'No'}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Requiere 2FA Nuevo</small>
                                                <span className={`fw-semibold ${formData.rRequires2FA !== originalData.rRequires2FA ? 'text-success' : 'text-muted'}`}>
                                                    {formData.rRequires2FA ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                        {(formData.rDescription !== originalData.rDescription) && (
                                            <>
                                                <div className="col-md-6">
                                                    <div className="border rounded p-3 bg-light">
                                                        <small className="text-muted d-block fw-semibold">Descripción Original</small>
                                                        <span className="fw-semibold text-primary small">{originalData.rDescription || 'Sin descripción'}</span>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="border rounded p-3 bg-light">
                                                        <small className="text-muted d-block fw-semibold">Descripción Nueva</small>
                                                        <span className="fw-semibold text-success small">{formData.rDescription || 'Sin descripción'}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {hasChanges && (
                                        <div className="alert alert-warning border-0 bg-light mt-3">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            <strong>Atención:</strong> Has realizado cambios que no han sido guardados.
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-sm-row gap-3">
                                        <button
                                            type="submit"
                                            className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            disabled={loading || !hasChanges}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Guardando cambios...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle"></i>
                                                    Guardar Cambios
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            onClick={handleCancel}
                                            disabled={loading}
                                        >
                                            <i className="bi bi-x-circle"></i>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                )}

            </div>
        </div>
    );
}