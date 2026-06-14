import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userManagementFlow } from '../../../infrastructure/flows/userManagement';
import { roleFlow } from '../../../infrastructure/flows/role';
import { permissionApiService } from '../../../services/permissionApiService';
import { getFullName } from '../../../utils/userUtils';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { User, UserRole, UpdateUserData } from '../../../types/user';
import type { Permission, PermissionModuleType } from '../../../types/permissions';
import { PermissionModule } from '../../../types/permissions';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';

type PermissionActionType = string;

interface UserFormData {
    uIdentification: string;
    uName: string;
    uFLastName: string;
    uSLastName?: string;
    uEmail: string;
    uPassword?: string;
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

export default function EditUserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();
    const [formData, setFormData] = useState<UserFormData>(defaultUserFormData);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [originalUser, setOriginalUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);

    const loadUserAndRoles = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError('');

        try {
            const [userResult, rolesResult] = await Promise.all([
                userManagementFlow.getUserById(Number(id)),
                roleFlow.getAllRoles()
            ]);

            if (userResult.success && userResult.user) {
                const user = userResult.user;
                setOriginalUser(user);
                setFormData({
                    uIdentification: user.uIdentification || '',
                    uName: user.uName || '',
                    uFLastName: user.uFLastName || '',
                    uSLastName: user.uSLastName || '',
                    uEmail: user.uEmail || '',
                    uPassword: '',
                    roleId: 0,
                });
            } else {
                setError(userResult.error || 'Error al cargar usuario');
            }

            if (rolesResult.success && rolesResult.roles) {
                setRoles(rolesResult.roles);
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error inesperado al cargar los datos');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!id) { setLoading(false); return; }
        loadUserAndRoles();
    }, [id, loadUserAndRoles]);

    function onInputChange(field: keyof UserFormData, value: string | number | boolean) {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === 'roleId') loadRolePermissions(Number(value));
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

        const timeoutId = setTimeout(() => {
            setPermissions([]);
            setSelectedPermissions({});
            setPermissionsLoading(false);
            setPermissionsError('Tiempo de espera agotado al cargar permisos del rol');
        }, 5000);

        try {
            const rolePerms = await permissionApiService.getByRole(roleId);
            clearTimeout(timeoutId);
            const mapped: Permission[] = rolePerms
                .filter(rp => rp.rpGranted)
                .map(rp => ({
                    module: rp.permission.pModule as PermissionModuleType,
                    action: rp.permission.pAction as PermissionActionType,
                    enabled: true,
                }));
            setPermissions(mapped);
            setPermissionsLoading(false);
            const initialSelected: Record<string, boolean> = {};
            mapped.forEach(p => { initialSelected[`${p.module}:${p.action}`] = true; });
            setSelectedPermissions(initialSelected);
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('Error cargando permisos del rol:', err);
            setPermissions([]);
            setSelectedPermissions({});
            setPermissionsLoading(false);
            setPermissionsError('Error al cargar los permisos del rol seleccionado');
        }
    }

    function handlePermissionChange(module: string, action: string, enabled: boolean) {
        setSelectedPermissions(prev => ({ ...prev, [`${module}:${action}`]: enabled }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!id) { setError('ID de usuario no válido'); return; }

        setError('');
        setSaving(true);

        const updateData: UpdateUserData = {};

        if (formData.uIdentification !== (originalUser?.uIdentification || ''))
            updateData.uIdentification = formData.uIdentification;
        if (formData.uName !== originalUser?.uName)
            updateData.uName = formData.uName;
        if (formData.uFLastName !== originalUser?.uFLastName)
            updateData.uFLastName = formData.uFLastName;
        if (formData.uSLastName !== (originalUser?.uSLastName || ''))
            updateData.uSLastName = formData.uSLastName || undefined;
        if (formData.uEmail !== originalUser?.uEmail)
            updateData.uEmail = formData.uEmail;
        if (formData.roleId !== 0)
            updateData.roleId = formData.roleId;

        updateData.uIsActive = true;

        if (Object.keys(updateData).length <= 1) {
            setError('No se detectaron cambios para guardar');
            setSaving(false);
            return;
        }

        const result = await userManagementFlow.updateUser(Number(id), updateData);

        if (result.success) {
            feedback.success(result.message || 'Usuario actualizado exitosamente');
            feedback.showNotification({
                title: 'Usuario actualizado',
                message: 'El usuario ha sido actualizado correctamente en el sistema.',
                variant: 'success'
            });
            navigate('/users');
        } else {
            setError(result.error || 'Error al actualizar usuario');
        }

        setSaving(false);
    }

    if (!id) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-5 text-center">
                                    <i className="bi bi-exclamation-triangle display-1 text-warning mb-3 d-block"></i>
                                    <h4 className="mb-3">ID no proporcionado</h4>
                                    <p className="text-muted mb-4">No se encontró el identificador del usuario.</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/users')}>
                                        Volver a la lista
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-muted fw-medium">Cargando información del usuario...</p>
                </div>
            </div>
        );
    }

    if (error && !originalUser) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-5 text-center">
                                    <i className="bi bi-exclamation-circle display-1 text-danger mb-3 d-block"></i>
                                    <h4 className="mb-3">Error al cargar usuario</h4>
                                    <p className="text-muted mb-4">{error}</p>
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button className="btn btn-secondary" onClick={() => navigate('/users')}>
                                            Volver a la lista
                                        </button>
                                        <button className="btn btn-primary" onClick={loadUserAndRoles}>
                                            Reintentar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light py-4">
            <div className="container-fluid">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <h1 className="h3 fw-bold mb-1">Editar Personal</h1>
                                <p className="text-muted mb-0">{originalUser ? getFullName(originalUser) : `#${id}`}</p>
                            </div>
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate('/users')} disabled={saving}>
                                <i className="bi bi-arrow-left"></i>
                                Volver al personal
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
                                            <input id="uIdentification" type="text" className="form-control form-control-lg"
                                                value={formData.uIdentification}
                                                onChange={(e) => onInputChange('uIdentification', e.target.value)}
                                                placeholder="Ej: 123456789" required disabled={saving}
                                                pattern="^[0-9]+$" title="Solo números" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="uName" className="form-label fw-semibold">
                                                Nombre <span className="text-danger">*</span>
                                            </label>
                                            <input id="uName" type="text" className="form-control form-control-lg"
                                                value={formData.uName}
                                                onChange={(e) => onInputChange('uName', e.target.value)}
                                                required disabled={saving} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="uFLastName" className="form-label fw-semibold">
                                                Primer Apellido <span className="text-danger">*</span>
                                            </label>
                                            <input id="uFLastName" type="text" className="form-control form-control-lg"
                                                value={formData.uFLastName}
                                                onChange={(e) => onInputChange('uFLastName', e.target.value)}
                                                required disabled={saving} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="uSLastName" className="form-label fw-semibold">
                                                Segundo Apellido
                                            </label>
                                            <input id="uSLastName" type="text" className="form-control form-control-lg"
                                                value={formData.uSLastName}
                                                onChange={(e) => onInputChange('uSLastName', e.target.value)}
                                                placeholder="Opcional" disabled={saving} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-envelope me-2 text-primary"></i>
                                        Correo Electrónico
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <label htmlFor="uEmail" className="form-label fw-semibold">
                                                Correo <span className="text-danger">*</span>
                                            </label>
                                            <input id="uEmail" type="email" className="form-control form-control-lg"
                                                value={formData.uEmail}
                                                onChange={(e) => onInputChange('uEmail', e.target.value)}
                                                required disabled={saving} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-key me-2 text-primary"></i>
                                        Cambiar Rol Primario
                                    </h5>
                                    <small className="text-muted d-block mt-1">
                                        Opcional — solo completar si deseas cambiar el rol principal del usuario
                                    </small>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <label htmlFor="roleId" className="form-label fw-semibold">
                                                Nuevo Rol Principal
                                            </label>
                                            <select id="roleId" className="form-select form-select-lg"
                                                value={formData.roleId}
                                                onChange={(e) => onInputChange('roleId', Number(e.target.value))}
                                                disabled={saving}>
                                                <option value={0}>Sin cambio de rol</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.rName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {permissions.length > 0 && (
                                        <div className="mt-4">
                                            <h6 className="fw-semibold mb-3">
                                                <i className="bi bi-shield-check me-2 text-success"></i>
                                                Permisos del nuevo rol
                                            </h6>
                                            {permissionsError ? (
                                                <AlertMessage type="danger" message={permissionsError}
                                                    dismissible onDismiss={() => setPermissionsError('')} />
                                            ) : permissionsLoading ? (
                                                <LoadingSpinner message="Cargando permisos..." size="sm" />
                                            ) : (
                                                <div className="row g-3">
                                                    {Object.values(PermissionModule).map(module => {
                                                        const modulePerms = permissions.filter(p => p.module === module);
                                                        if (modulePerms.length === 0) return null;
                                                        return (
                                                            <div key={module} className="col-12 col-md-6 col-lg-4">
                                                                <div className="card border-light bg-light">
                                                                    <div className="card-header bg-white py-2">
                                                                        <small className="fw-semibold text-uppercase text-muted">
                                                                            {module.replace('_', ' ')}
                                                                        </small>
                                                                    </div>
                                                                    <div className="card-body p-3">
                                                                        {modulePerms.map(p => {
                                                                            const key = `${p.module}:${p.action}`;
                                                                            return (
                                                                                <div key={key} className="form-check mb-2">
                                                                                    <input className="form-check-input" type="checkbox"
                                                                                        id={`perm-${key}`}
                                                                                        checked={selectedPermissions[key] || false}
                                                                                        onChange={(e) => handlePermissionChange(p.module, p.action, e.target.checked)}
                                                                                        disabled={saving} />
                                                                                    <label className="form-check-label small" htmlFor={`perm-${key}`}>
                                                                                        {p.action.replace('_', ' ')}
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
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-shield-lock me-2 text-primary"></i>
                                        Contraseña
                                    </h5>
                                    <small className="text-muted d-block mt-1">Dejar vacío para mantener la actual</small>
                                </div>
                                <div className="card-body p-4">
                                    <div className="col-12 col-md-6">
                                        <label htmlFor="uPassword" className="form-label fw-semibold">Nueva Contraseña</label>
                                        <div className="position-relative">
                                            <input id="uPassword" type={showPassword ? 'text' : 'password'}
                                                className="form-control form-control-lg"
                                                value={formData.uPassword}
                                                onChange={(e) => onInputChange('uPassword', e.target.value)}
                                                placeholder="Dejar vacío para no cambiar"
                                                disabled={saving} minLength={8} />
                                            <button type="button"
                                                className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1} aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
                                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-sm-row gap-3">
                                        <button type="submit" className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2" disabled={saving}>
                                            {saving ? (
                                                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...</>
                                            ) : (
                                                <><i className="bi bi-check-circle"></i> Guardar Cambios</>
                                            )}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => navigate('/users')} disabled={saving}>
                                            <i className="bi bi-x-circle"></i> Cancelar
                                        </button>
                                        <button type="button" className="btn btn-outline-info btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => navigate(`/users/view/${id}`)} disabled={saving}>
                                            <i className="bi bi-eye"></i> Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
