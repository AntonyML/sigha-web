import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userFlow } from '../../../infrastructure/flows/userFlow';
import type { User, UserRole, UpdateUserData } from '../../../types/user';

interface UserFormData {
    identification: string;
    name: string;
    fLastName: string;
    sLastName: string;
    email: string;
    password: string;
    roleId: number;
    isActive: boolean;
}

const defaultUserFormData: UserFormData = {
    identification: '',
    name: '',
    fLastName: '',
    sLastName: '',
    email: '',
    password: '',
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

    // Cargar usuario y roles al montar el componente
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
            // Cargar usuario y roles en paralelo
            const [userResult, rolesResult] = await Promise.all([
                userFlow.getUserById(Number(id)),
                userFlow.getAllRoles()
            ]);

            // Manejar resultado del usuario
            if (userResult.success && userResult.user) {
                const user = userResult.user;
                setOriginalUser(user);
                setFormData({
                    identification: user.identification,
                    name: user.name,
                    fLastName: user.fLastName,
                    sLastName: user.sLastName || '',
                    email: user.u_email,
                    password: '', // No cargamos la contraseña por seguridad
                    roleId: user.role_id || 0,
                    isActive: user.u_is_active
                });
            } else {
                setError(userResult.error || 'Error al cargar usuario');
            }

            // Manejar resultado de roles
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

        if (formData.identification !== originalUser?.identification) {
            updateData.identification = formData.identification;
        }
        if (formData.name !== originalUser?.name) {
            updateData.name = formData.name;
        }
        if (formData.fLastName !== originalUser?.fLastName) {
            updateData.fLastName = formData.fLastName;
        }
        if (formData.sLastName !== (originalUser?.sLastName || '')) {
            updateData.sLastName = formData.sLastName || undefined;
        }
        if (formData.email !== originalUser?.u_email) {
            updateData.u_email = formData.email;
        }
        if (formData.password) {
            updateData.password = formData.password;
        }
        if (formData.roleId !== originalUser?.role_id) {
            updateData.roleId = formData.roleId;
        }
        if (formData.isActive !== originalUser?.u_is_active) {
            updateData.u_is_active = formData.isActive;
        }

        // Verificar si hay cambios
        if (Object.keys(updateData).length === 0) {
            setError('No se detectaron cambios para guardar');
            setSaving(false);
            return;
        }

        const result = await userFlow.updateUser(Number(id), updateData);

        if (result.success) {
            alert(result.message || 'Usuario actualizado exitosamente');
            navigate('/users');
        } else {
            setError(result.error || 'Error al actualizar usuario');
        }

        setSaving(false);
    }

    // Manejo cuando no hay id en la ruta
    if (!id) {
        return (
            <div className="container py-4">
                <h3 className="mb-3">ID no proporcionado</h3>
                <p>No se encontró el identificador del usuario. Puedes crear uno nuevo o volver a la lista.</p>
                <div className="d-flex gap-2">
                    <button className="btn btn-primary" onClick={() => navigate('/users/create')}>Crear nuevo</button>
                    <button className="btn btn-secondary" onClick={() => navigate('/users')}>Volver a la lista</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container py-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3 text-muted">Cargando información del usuario...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !originalUser) {
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
                        <button className="btn btn-primary" onClick={loadUserAndRoles}>
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Editar Usuario {originalUser ? `- ${userFlow.getFullName(originalUser)}` : `#${id}`}</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/users')}
                    disabled={saving}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Regresar
                </button>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <h3 className="mb-3">INFORMACIÓN PERSONAL</h3>

                {/* Identificación y Email */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <label htmlFor="identification" className="form-label">IDENTIFICACIÓN *</label>
                        <input
                            id="identification"
                            type="text"
                            className="form-control"
                            value={formData.identification}
                            onChange={(e) => onInputChange('identification', e.target.value)}
                            placeholder="Número de identificación"
                            required
                            disabled={saving}
                        />
                    </div>
                    <div className="col-12 col-md-6">
                        <label htmlFor="email" className="form-label">EMAIL *</label>
                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => onInputChange('email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            required
                            disabled={saving}
                        />
                    </div>
                </div>

                {/* Nombres y Apellidos */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                        <label htmlFor="name" className="form-label">NOMBRE *</label>
                        <input
                            id="name"
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => onInputChange('name', e.target.value)}
                            placeholder="Nombre"
                            required
                            disabled={saving}
                        />
                    </div>
                    <div className="col-12 col-md-4">
                        <label htmlFor="fLastName" className="form-label">PRIMER APELLIDO *</label>
                        <input
                            id="fLastName"
                            type="text"
                            className="form-control"
                            value={formData.fLastName}
                            onChange={(e) => onInputChange('fLastName', e.target.value)}
                            placeholder="Primer apellido"
                            required
                            disabled={saving}
                        />
                    </div>
                    <div className="col-12 col-md-4">
                        <label htmlFor="sLastName" className="form-label">SEGUNDO APELLIDO</label>
                        <input
                            id="sLastName"
                            type="text"
                            className="form-control"
                            value={formData.sLastName}
                            onChange={(e) => onInputChange('sLastName', e.target.value)}
                            placeholder="Segundo apellido (opcional)"
                            disabled={saving}
                        />
                    </div>
                </div>

                <hr />

                <h3 className="mb-3">CONFIGURACIÓN DE CUENTA</h3>

                {/* Contraseña (opcional en edición) */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <label htmlFor="password" className="form-label">CONTRASEÑA</label>
                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => onInputChange('password', e.target.value)}
                            placeholder="Dejar vacío para mantener la actual"
                            disabled={saving}
                            minLength={6}
                        />
                        <small className="text-muted">
                            Solo completa este campo si deseas cambiar la contraseña (mínimo 6 caracteres)
                        </small>
                    </div>
                    <div className="col-12 col-md-6">
                        <label htmlFor="roleId" className="form-label">ROL *</label>
                        <select
                            id="roleId"
                            className="form-select"
                            value={formData.roleId}
                            onChange={(e) => onInputChange('roleId', Number(e.target.value))}
                            required
                            disabled={saving}
                        >
                            <option value={0}>Seleccionar rol</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Estado */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <label className="form-label">ESTADO DE LA CUENTA *</label>
                        <div className="mt-2">
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="activeTrue"
                                    name="isActive"
                                    checked={formData.isActive === true}
                                    onChange={() => onInputChange('isActive', true)}
                                    disabled={saving}
                                />
                                <label className="form-check-label" htmlFor="activeTrue">
                                    Activo
                                </label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="activeFalse"
                                    name="isActive"
                                    checked={formData.isActive === false}
                                    onChange={() => onInputChange('isActive', false)}
                                    disabled={saving}
                                />
                                <label className="form-check-label" htmlFor="activeFalse">
                                    Inactivo
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-save me-2"></i>
                                Guardar Cambios
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/users')}
                        disabled={saving}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn-info"
                        onClick={() => navigate(`/users/view/${id}`)}
                        disabled={saving}
                    >
                        <i className="bi bi-eye me-2"></i>
                        Ver Detalles
                    </button>
                </div>
            </form>
        </div>
    );
}