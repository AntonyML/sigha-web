import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userManagementFlow } from '../../../infrastructure/flows/userManagement';
import { roleFlow } from '../../../infrastructure/flows/role';
import { auditService } from '../../../services/auditService';
import { getFullName } from '../../../utils/userUtils';
import type { User, UserRole, UpdateUserData } from '../../../types/user';

interface UserFormData {
    uIdentification: string;
    uName: string;
    uFLastName: string;
    uSLastName?: string;
    uEmail: string;
    uPassword?: string;
    roleId: number;
    isActive: boolean;
}

const defaultUserFormData: UserFormData = {
    uIdentification: '',
    uName: '',
    uFLastName: '',
    uSLastName: '',
    uEmail: '',
    uPassword: '',
    roleId: 0,
    isActive: true
};

export default function EditUserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<UserFormData>(defaultUserFormData);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [originalUser, setOriginalUser] = useState<User | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        loadUserAndRoles();
    }, [id]);

    const loadUserAndRoles = async () => {
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
                    roleId: user.roleId || 0,
                    isActive: user.uIsActive === undefined ? true : user.uIsActive
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
    };

    function onInputChange(field: keyof UserFormData, value: string | number | boolean) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!id) {
            setError('ID de usuario no válido');
            return;
        }

        setError('');
        setSaving(true);

        // Construir objeto de actualización solo con campos modificados
        const updateData: UpdateUserData = {};

        if (formData.uName !== originalUser?.uName) {
            updateData.uName = formData.uName;
        }
        if (formData.uFLastName !== originalUser?.uFLastName) {
            updateData.uFLastName = formData.uFLastName;
        }
        if (formData.uSLastName !== (originalUser?.uSLastName || '')) {
            updateData.uSLastName = formData.uSLastName || undefined;
        }
        if (formData.uEmail !== originalUser?.uEmail) {
            updateData.uEmail = formData.uEmail;
        }
        if (formData.roleId !== originalUser?.roleId) {
            updateData.roleId = formData.roleId;
        }
        if (formData.isActive !== originalUser?.uIsActive) {
            updateData.uIsActive = formData.isActive;
        }

        // Verificar si hay cambios
        if (Object.keys(updateData).length === 0) {
            setError('No se detectaron cambios para guardar');
            setSaving(false);
            return;
        }

        const result = await userManagementFlow.updateUser(Number(id), updateData);

        if (result.success) {
            // Registrar cambio de rol si aplica
            if (updateData.roleId && originalUser) {
                const oldRole = roles.find(r => r.id === originalUser.roleId)?.rName || 'Desconocido';
                const newRole = roles.find(r => r.id === updateData.roleId)?.rName || 'Desconocido';
                
                await auditService.logRoleChange(
                    Number(id),
                    oldRole,
                    newRole,
                    `Cambio de rol de ${oldRole} a ${newRole} para usuario ${originalUser.uEmail}`
                );
            }
            
            alert(result.message || 'Usuario actualizado exitosamente');
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
                                <h1 className="h3 fw-bold mb-1">Editar Usuario</h1>
                                <p className="text-muted mb-0">{originalUser ? getFullName(originalUser) : `#${id}`}</p>
                            </div>
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate('/users')} disabled={saving}>
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
                                                placeholder="Ej: 1234567890"
                                                required
                                                disabled={saving}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Número único de identificación
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
                                                disabled={saving}
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
                                                disabled={saving}
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
                                                disabled={saving}
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
                                                disabled={saving}
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
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="roleId" className="form-label fw-semibold">
                                                Asignar Rol <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="roleId"
                                                className="form-select form-select-lg"
                                                value={formData.roleId}
                                                onChange={(e) => onInputChange('roleId', Number(e.target.value))}
                                                required
                                                disabled={saving}
                                            >
                                                <option value={0}>Seleccionar rol...</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.rName}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Los permisos se definen según el rol asignado
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="isActive" className="form-label fw-semibold">
                                                Estado de Cuenta <span className="text-danger">*</span>
                                            </label>
                                            <div className="btn-group w-100" role="group" aria-label="Estado de la cuenta">
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    id="activeTrue"
                                                    name="isActive"
                                                    checked={formData.isActive === true}
                                                    onChange={() => onInputChange('isActive', true)}
                                                    disabled={saving}
                                                />
                                                <label className="btn btn-outline-success" htmlFor="activeTrue">
                                                    <i className="bi bi-check-circle me-1"></i>
                                                    Activo
                                                </label>

                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    id="activeFalse"
                                                    name="isActive"
                                                    checked={formData.isActive === false}
                                                    onChange={() => onInputChange('isActive', false)}
                                                    disabled={saving}
                                                />
                                                <label className="btn btn-outline-secondary" htmlFor="activeFalse">
                                                    <i className="bi bi-x-circle me-1"></i>
                                                    Inactivo
                                                </label>
                                            </div>
                                        </div>
                                    </div>
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
                                        <div className="col-12">
                                            <label htmlFor="uPassword" className="form-label fw-semibold">
                                                Contraseña
                                            </label>
                                            <input
                                                id="uPassword"
                                                type="password"
                                                className="form-control form-control-lg"
                                                value={formData.uPassword}
                                                onChange={(e) => onInputChange('uPassword', e.target.value)}
                                                placeholder="Dejar vacío para mantener la actual"
                                                disabled={saving}
                                                minLength={8}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Completa solo si deseas cambiar la contraseña (mínimo 8 caracteres)
                                            </small>
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
                                            disabled={saving}
                                        >
                                            {saving ? (
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
                                            onClick={() => navigate('/users')}
                                            disabled={saving}
                                        >
                                            <i className="bi bi-x-circle"></i>
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-info btn-lg px-4 d-flex align-items-center justify-content-center gap-2 btn-outline-info-white-hover"
                                            onClick={() => navigate(`/users/view/${id}`)}
                                            disabled={saving}
                                        >
                                            <i className="bi bi-eye"></i>
                                            Ver Detalles
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