import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleFlow } from '../../../infrastructure/flows/role';
import { PermissionUtils } from '../../../utils/permissionUtils';
import { permissionService } from '../../../services/permissionService';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { CreateRoleData } from '../../../types/user';
import type { Permission, PermissionModuleType, PermissionActionType } from '../../../types/permissions';
import { PermissionModule } from '../../../types/permissions';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';

const defaultRoleFormData: CreateRoleData = {
    rName: '',
    rDescription: '',
    rIsAdmin: false,
    rRequires2FA: false,
    rIsActive: true
};

export default function CreateRolePage() {
    const [formData, setFormData] = useState<CreateRoleData>(defaultRoleFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();

    // Verificar permisos y cargar permisos por defecto al montar el componente
    useEffect(() => {
        const checkPermissionsAndLoadPermissions = async () => {
            try {
                // Verificar permisos
                const canManage = await PermissionUtils.canManageRoles();
                setHasPermission(canManage);

                if (!canManage) {
                    return;
                }

                // Cargar permisos por defecto
                setPermissionsLoading(true);
                const defaultPermissions = permissionService.getDefaultPermissions();
                setPermissions(defaultPermissions);
                setPermissionsLoading(false);
            } catch (err) {
                console.error('Error verificando permisos:', err);
                setPermissionsLoading(false);
            }
        };

        checkPermissionsAndLoadPermissions();
    }, []);

    function onInputChange(field: keyof CreateRoleData, value: string | boolean) {
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
            setError('No tienes permisos para crear roles.');
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

        setLoading(true);

        try {
            const result = await roleFlow.createRole(formData);

            if (result.success && result.role) {
                // Guardar permisos del rol
                try {
                    await permissionService.updateRolePermissions(result.role.id, permissions);
                } catch (permError) {
                    console.error('Error guardando permisos:', permError);
                    feedback.error('Rol creado pero error al guardar permisos');
                }

                feedback.success('Rol creado exitosamente');
                feedback.showNotification({
                    title: 'Rol creado',
                    message: `El rol "${result.role.rName}" ha sido creado exitosamente.`,
                    variant: 'success'
                });
                navigate('/roles');
            } else {
                setError(result.error || 'Error al crear rol');
            }
        } catch (err) {
            console.error('Error creando rol:', err);
            setError('Error inesperado al crear rol');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <h1 className="h3 fw-bold mb-1">Crear Nuevo Rol</h1>
                                <p className="text-muted mb-0">Define un nuevo rol para el sistema</p>
                            </div>
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={() => navigate('/roles')}
                            >
                                <i className="bi bi-arrow-left"></i>
                                Volver a la lista
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
                                <p className="mb-0 mt-2">No tienes permisos para crear roles. Solo los administradores del sistema pueden crear nuevos roles.</p>
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
                                            message="No se pudieron cargar los permisos por defecto"
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
                                                                {modulePermissions.map(permission => (
                                                                    <div key={`${permission.module}:${permission.action}`} className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="checkbox"
                                                                            id={`perm-${permission.module}-${permission.action}`}
                                                                            checked={permission.enabled}
                                                                            onChange={(e) => handlePermissionChange(permission.module, permission.action, e.target.checked)}
                                                                            disabled={loading}
                                                                        />
                                                                        <label className="form-check-label text-capitalize" htmlFor={`perm-${permission.module}-${permission.action}`}>
                                                                            {permission.action.replace('_', ' ')}
                                                                        </label>
                                                                    </div>
                                                                ))}
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

                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-sm-row gap-3">
                                        <button
                                            type="submit"
                                            className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Creando rol...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle"></i>
                                                    Crear Rol
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => navigate('/roles')}
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