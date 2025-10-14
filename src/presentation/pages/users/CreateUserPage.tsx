import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userFlow } from '../../../infrastructure/flows/userFlow';
import type { UserRole, CreateUserData } from '../../../types/user';

interface UserFormData {
    identification: string;
    name: string;
    fLastName: string;
    sLastName: string;
    email: string;
    password: string;
    roleId: number;
}

const defaultUserFormData: UserFormData = {
    identification: '',
    name: '',
    fLastName: '',
    sLastName: '',
    email: '',
    password: '',
    roleId: 0
};

export default function CreateUserPage() {
    const [formData, setFormData] = useState<UserFormData>(defaultUserFormData);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [roles, setRoles] = useState<UserRole[]>([]);
    const navigate = useNavigate();

    // Cargar roles al montar el componente
    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        const result = await userFlow.getAllRoles();
        if (result.success && result.roles) {
            setRoles(result.roles);
        } else {
            setError(result.error || 'Error al cargar roles');
        }
    };

    function onInputChange(field: keyof UserFormData, value: string | number) {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Validar contraseñas si estamos cambiando el campo de contraseña
        if (field === 'password') {
            setPasswordsMatch(value === confirmPassword);
        }
    }

    function handleConfirmPasswordChange(value: string) {
        setConfirmPassword(value);
        setPasswordsMatch(formData.password === value);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!passwordsMatch) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!formData.roleId || formData.roleId === 0) {
            setError('Por favor selecciona un rol');
            return;
        }

        setLoading(true);

        // Crear el objeto de datos para enviar
        const createData: CreateUserData = {
            identification: formData.identification,
            name: formData.name,
            fLastName: formData.fLastName,
            sLastName: formData.sLastName || undefined,
            email: formData.email,
            password: formData.password,
            roleId: formData.roleId
        };

        const result = await userFlow.createUser(createData);

        if (result.success) {
            alert(result.message || 'Usuario creado exitosamente');
            navigate('/users');
        } else {
            setError(result.error || 'Error al crear usuario');
        }

        setLoading(false);
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Crear Usuario</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/users')}
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
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </div>
                </div>

                <hr />

                <h3 className="mb-3">CONFIGURACIÓN DE CUENTA</h3>

                {/* Contraseñas */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <label htmlFor="password" className="form-label">CONTRASEÑA *</label>
                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => onInputChange('password', e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                        <small className="text-muted">La contraseña debe tener al menos 6 caracteres</small>
                    </div>
                    <div className="col-12 col-md-6">
                        <label htmlFor="confirmPassword" className="form-label">CONFIRMAR CONTRASEÑA *</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className={`form-control ${!passwordsMatch && confirmPassword ? 'is-invalid' : ''}`}
                            value={confirmPassword}
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            placeholder="Confirmar contraseña"
                            required
                            disabled={loading}
                        />
                        {!passwordsMatch && confirmPassword && (
                            <div className="invalid-feedback">
                                Las contraseñas no coinciden
                            </div>
                        )}
                    </div>
                </div>

                {/* Rol */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <label htmlFor="roleId" className="form-label">ROL *</label>
                        <select
                            id="roleId"
                            className="form-select"
                            value={formData.roleId}
                            onChange={(e) => onInputChange('roleId', Number(e.target.value))}
                            required
                            disabled={loading}
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

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={loading || !passwordsMatch}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-save me-2"></i>
                                Crear Usuario
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/users')}
                        disabled={loading}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}