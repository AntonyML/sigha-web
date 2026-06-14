import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManagementFlow } from '../../../infrastructure/flows/userManagement';
import { roleFlow } from '../../../infrastructure/flows/role';
import { PermissionUtils } from '../../../utils/permissionUtils';
import { permissionApiService } from '../../../services/permissionApiService';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { UserRole, CreateUserData } from '../../../types/user';
import type { Permission, PermissionModuleType } from '../../../types/permissions';
import { PermissionModule } from '../../../types/permissions';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';
import PasswordInput from '../../components/atoms/PasswordInput/PasswordInput';

interface UserFormData {
    uIdentification: string;
    uName: string;
    uFLastName: string;
    uSLastName?: string;
    uEmail: string;
    uPassword: string;
    roleId: number;
}

const defaultUserFormData: UserFormData = {
    uIdentification: '',
    uName: '',
    uFLastName: '',
    uSLastName: '',
    uEmail: '',
    uPassword: '',
    roleId: 0
};

export default function CreateUserPage() {
    const [formData, setFormData] = useState<UserFormData>(defaultUserFormData);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string>('');
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();

    // Verificar permisos y cargar roles al montar el componente
    useEffect(() => {
        const checkPermissionsAndLoadData = async () => {
            try {
                // Verificar permisos
                const canCreate = await PermissionUtils.canCreateUsers();
                setHasPermission(canCreate);

                if (!canCreate) {
                    return;
                }

                // Cargar roles
                const result = await roleFlow.getAllRoles();
                if (result.success && result.roles) {
                    setRoles(result.roles);
                } else {
                    console.error('Error al cargar roles:', result.error);
                }
            } catch (err) {
                console.error('Error verificando permisos:', err);
            }
        };

        checkPermissionsAndLoadData();
    }, []);

    function onInputChange(field: keyof UserFormData, value: string | number) {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Validar contraseñas si estamos cambiando el campo de contraseña
        if (field === 'uPassword') {
            setPasswordsMatch((value as string) === confirmPassword);
        }

        // Si cambiamos el rol, cargar los permisos de ese rol
        if (field === 'roleId') {
            loadRolePermissions(Number(value));
        }
    }

    function handleConfirmPasswordChange(value: string) {
        setConfirmPassword(value);
        setPasswordsMatch(formData.uPassword === value);
    }

    async function loadRolePermissions(roleId: number) {
        if (roleId === 0) {
            setPermissions([]);
            setSelectedPermissions({});
            setPermissionsError('');
            return;
        }

        setPermissionsLoading(true);
        setPermissionsError('');

        // Crear un timeout para evitar loading infinito
        const timeoutId = setTimeout(() => {
            console.warn('Timeout cargando permisos del rol:', roleId);
            setPermissions([]);
            setSelectedPermissions({});
            setPermissionsLoading(false);
            setPermissionsError('Tiempo de espera agotado al cargar permisos del rol');
        }, 5000); // 5 segundos timeout

        try {
            const rolePerms = await permissionApiService.getByRole(roleId);
            clearTimeout(timeoutId);

            const mapped: Permission[] = rolePerms
                .filter(rp => rp.rpGranted)
                .map(rp => ({
                    module: rp.permission.pModule as PermissionModuleType,
                    action: rp.permission.pAction as string,
                    enabled: true,
                }));
            setPermissions(mapped);
            setPermissionsLoading(false);

            const initialSelected: Record<string, boolean> = {};
            mapped.forEach(permission => {
                const key = `${permission.module}:${permission.action}`;
                initialSelected[key] = true;
            });
            setSelectedPermissions(initialSelected);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Error cargando permisos del rol:', error);
            setPermissions([]);
            setSelectedPermissions({});
            setPermissionsLoading(false);
            setPermissionsError('Error al cargar los permisos del rol seleccionado');
        }
    }

    function handlePermissionChange(module: string, action: string, enabled: boolean) {
        const key = `${module}:${action}`;
        setSelectedPermissions(prev => ({
            ...prev,
            [key]: enabled
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Verificar permisos antes de procesar
        if (hasPermission === false) {
            feedback.error('No tienes permisos para crear usuarios.');
            return;
        }

        // Validar identificación (solo números según backend)
        if (!formData.uIdentification.trim()) {
            feedback.error('Por favor ingresa la identificación del usuario');
            return;
        }

        if (!/^[0-9]+$/.test(formData.uIdentification.trim())) {
            feedback.error('La identificación debe contener solo números');
            return;
        }

        if (!passwordsMatch) {
            feedback.error('Las contraseñas no coinciden');
            return;
        }

        if (!formData.roleId || formData.roleId === 0) {
            feedback.error('Por favor selecciona un rol');
            return;
        }

        setLoading(true);

        // Crear el objeto de datos para enviar
        const createData: CreateUserData = {
            uIdentification: formData.uIdentification.trim(),
            uName: formData.uName.trim(),
            uFLastName: formData.uFLastName.trim(),
            uEmail: formData.uEmail.trim(),
            uPassword: formData.uPassword,
            roleId: Number(formData.roleId)
        };

        // Solo incluir uSLastName si tiene valor
        if (formData.uSLastName && formData.uSLastName.trim()) {
            createData.uSLastName = formData.uSLastName.trim();
        }

        console.log('Datos a enviar:', createData);
        console.log('Token de autenticación presente:', !!localStorage.getItem('authToken'));

        const result = await userManagementFlow.createUser(createData);

        if (result.success && result.user) {
            feedback.success(result.message || 'Usuario creado exitosamente');
            feedback.showNotification({
                title: 'Usuario creado',
                message: `El usuario ${result.user.uEmail} ha sido creado exitosamente`,
                variant: 'success',
                icon: 'bi-person-plus-fill'
            });
            navigate('/users');
        } else {
            feedback.error(result.error || 'Error al crear usuario', 'Error de creación');
        }

        setLoading(false);
    }

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <h1 className="h3 fw-bold mb-1">Crear Nuevo Usuario</h1>
                                <p className="text-muted mb-0">Complete el formulario para registrar un nuevo usuario</p>
                            </div>
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={() => navigate('/users')}
                            >
                                <i className="bi bi-arrow-left"></i>
                                Volver a la lista
                            </button>
                        </div>
                    </div>
                </div>

                {hasPermission === false && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
                                <i className="bi bi-shield-x-fill me-2"></i>
                                <strong>Acceso Denegado</strong>
                                <p className="mb-0 mt-2">No tienes permisos para crear usuarios. Solo los administradores del sistema pueden crear nuevos usuarios.</p>
                                <button type="button" className="btn-close" onClick={() => navigate('/users')}></button>
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
                                        <i className="bi bi-person-circle me-2 text-primary"></i>
                                        Información Personal
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="uIdentification" className="form-label fw-semibold">
                                                Identificación <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="uIdentification"
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.uIdentification}
                                                onChange={(e) => onInputChange('uIdentification', e.target.value)}
                                                placeholder="Ej: 123456789, 208890123"
                                                required
                                                disabled={loading}
                                                pattern="^[0-9]+$"
                                                title="Solo números (cédula o identificación)"
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Identificador único (solo números, sin letras ni caracteres especiales)
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="uName" className="form-label fw-semibold">
                                                Nombre <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="uName"
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.uName}
                                                onChange={(e) => onInputChange('uName', e.target.value)}
                                                placeholder="Nombre completo"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="uFLastName" className="form-label fw-semibold">
                                                Primer Apellido <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="uFLastName"
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.uFLastName}
                                                onChange={(e) => onInputChange('uFLastName', e.target.value)}
                                                placeholder="Primer apellido"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="uSLastName" className="form-label fw-semibold">
                                                Segundo Apellido
                                            </label>
                                            <input
                                                id="uSLastName"
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.uSLastName}
                                                onChange={(e) => onInputChange('uSLastName', e.target.value)}
                                                placeholder="Segundo apellido (opcional)"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-envelope me-2 text-primary"></i>
                                        Información de Contacto
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <label htmlFor="uEmail" className="form-label fw-semibold">
                                                Correo Electrónico <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="uEmail"
                                                type="email"
                                                className="form-control form-control-lg"
                                                value={formData.uEmail}
                                                onChange={(e) => onInputChange('uEmail', e.target.value)}
                                                placeholder="correo@ejemplo.com"
                                                required
                                                disabled={loading}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Se utilizará para autenticación y notificaciones
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-key me-2 text-primary"></i>
                                        Rol y Permisos
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <label htmlFor="roleId" className="form-label fw-semibold">
                                                Rol inicial del usuario <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="roleId"
                                                className="form-select form-select-lg"
                                                value={formData.roleId}
                                                onChange={(e) => onInputChange('roleId', Number(e.target.value))}
                                                required
                                                disabled={loading}
                                            >
                                                <option value={0}>Seleccionar rol…</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.rName}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                El rol determina los permisos del usuario desde el primer inicio de sesión
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
                                    {formData.roleId === 0 ? (
                                        <div className="text-center py-4">
                                            <i className="bi bi-info-circle text-muted fs-1 mb-3 d-block"></i>
                                            <p className="text-muted mb-0">Selecciona un rol para ver y configurar sus permisos</p>
                                        </div>
                                    ) : permissionsError ? (
                                        <AlertMessage
                                            type="danger"
                                            message={permissionsError}
                                            dismissible={true}
                                            onDismiss={() => setPermissionsError('')}
                                        />
                                    ) : permissionsLoading ? (
                                        <LoadingSpinner message="Cargando permisos del rol..." size="sm" />
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
                                                                    const key = `${permission.module}:${permission.action}`;
                                                                    const isChecked = selectedPermissions[key] ?? permission.enabled;

                                                                    return (
                                                                        <div key={key} className="form-check">
                                                                            <input
                                                                                className="form-check-input"
                                                                                type="checkbox"
                                                                                id={key}
                                                                                checked={isChecked}
                                                                                onChange={(e) => handlePermissionChange(permission.module, permission.action, e.target.checked)}
                                                                                disabled={loading}
                                                                            />
                                                                            <label className="form-check-label text-capitalize" htmlFor={key}>
                                                                                {permission.action}
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
                                        Los permisos marcados estarán activos para usuarios con este rol
                                    </small>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-shield-lock me-2 text-primary"></i>
                                        Credenciales de Seguridad
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12 col-md-6">
                                            <PasswordInput
                                                label="Contraseña"
                                                id="uPassword"
                                                value={formData.uPassword}
                                                onChange={(e) => onInputChange('uPassword', e.target.value)}
                                                placeholder="Mínimo 8 caracteres"
                                                required
                                                disabled={loading}
                                                minLength={8}
                                                className="form-control-lg"
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Mínimo 8 caracteres, mayúsculas, minúsculas y números
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <PasswordInput
                                                label="Confirmar Contraseña"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                                placeholder="Confirmar contraseña"
                                                required
                                                disabled={loading}
                                                className={`form-control-lg ${!passwordsMatch && confirmPassword ? 'is-invalid' : passwordsMatch && confirmPassword ? 'is-valid' : ''}`}
                                            />
                                            {!passwordsMatch && confirmPassword && (
                                                <div className="invalid-feedback d-block mt-2">
                                                    <i className="bi bi-x-circle me-1"></i>
                                                    Las contraseñas no coinciden
                                                </div>
                                            )}
                                            {passwordsMatch && confirmPassword && (
                                                <div className="valid-feedback d-block mt-2">
                                                    <i className="bi bi-check-circle me-1"></i>
                                                    Las contraseñas coinciden
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-sm-row gap-3">
                                        <button 
                                            type="submit" 
                                            className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2" 
                                            disabled={loading || !passwordsMatch}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Creando usuario...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle"></i>
                                                    Crear Usuario
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => navigate('/users')}
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