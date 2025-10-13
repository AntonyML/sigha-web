import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserFormData {
    u_identification: string;
    u_name: string;
    u_f_last_name: string;
    u_s_last_name: string;
    u_email: string;
    u_password: string;
    u_email_verified: boolean;
    u_is_active: boolean;
    role_id: string;
}

const defaultUserFormData: UserFormData = {
    u_identification: '',
    u_name: '',
    u_f_last_name: '',
    u_s_last_name: '',
    u_email: '',
    u_password: '',
    u_email_verified: false,
    u_is_active: true,
    role_id: ''
};

// Roles simulados - en una aplicación real vendrían de la base de datos
const roles = [
    { id: '1', name: 'Administrador' },
    { id: '2', name: 'Médico' },
    { id: '3', name: 'Enfermero' },
    { id: '4', name: 'Recepcionista' },
    { id: '5', name: 'Usuario Básico' }
];

export default function CreateUserPage() {
    const [formData, setFormData] = useState<UserFormData>(defaultUserFormData);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const navigate = useNavigate();

    function onInputChange(field: keyof UserFormData, value: string | boolean) {
        setFormData((prev) => ({ ...prev, [field]: value } as UserFormData));

        // Validar contraseñas si estamos cambiando alguno de los campos de contraseña
        if (field === 'u_password') {
            setPasswordsMatch(value === confirmPassword);
        }
    }

    function handleConfirmPasswordChange(value: string) {
        setConfirmPassword(value);
        setPasswordsMatch(formData.u_password === value);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!passwordsMatch) {
            window.alert('Las contraseñas no coinciden');
            return;
        }

        if (!formData.role_id) {
            window.alert('Por favor selecciona un rol');
            return;
        }

        console.log('Formulario de usuario enviado:', formData);
        // Aquí iría la lógica para enviar los datos al backend
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

            <form onSubmit={handleSubmit}>
                <h3 className="mb-3">INFORMACIÓN PERSONAL</h3>

                {/* Identificación y Email */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <label htmlFor="u_identification" className="form-label">IDENTIFICACIÓN</label>
                        <input
                            id="u_identification"
                            type="text"
                            className="form-control"
                            value={formData.u_identification}
                            onChange={(e) => onInputChange('u_identification', e.target.value)}
                            placeholder="Número de identificación"
                            required
                        />
                    </div>
                    <div className="col-12 col-md-6">
                        <label htmlFor="u_email" className="form-label">EMAIL</label>
                        <input
                            id="u_email"
                            type="email"
                            className="form-control"
                            value={formData.u_email}
                            onChange={(e) => onInputChange('u_email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            required
                        />
                    </div>
                </div>

                {/* Nombres y Apellidos */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                        <label htmlFor="u_name" className="form-label">NOMBRE</label>
                        <input
                            id="u_name"
                            type="text"
                            className="form-control"
                            value={formData.u_name}
                            onChange={(e) => onInputChange('u_name', e.target.value)}
                            placeholder="Nombre"
                            required
                        />
                    </div>
                    <div className="col-12 col-md-4">
                        <label htmlFor="u_f_last_name" className="form-label">PRIMER APELLIDO</label>
                        <input
                            id="u_f_last_name"
                            type="text"
                            className="form-control"
                            value={formData.u_f_last_name}
                            onChange={(e) => onInputChange('u_f_last_name', e.target.value)}
                            placeholder="Primer apellido"
                            required
                        />
                    </div>
                    <div className="col-12 col-md-4">
                        <label htmlFor="u_s_last_name" className="form-label">SEGUNDO APELLIDO</label>
                        <input
                            id="u_s_last_name"
                            type="text"
                            className="form-control"
                            value={formData.u_s_last_name}
                            onChange={(e) => onInputChange('u_s_last_name', e.target.value)}
                            placeholder="Segundo apellido (opcional)"
                        />
                    </div>
                </div>

                <hr />

                <h3 className="mb-3">CONFIGURACIÓN DE CUENTA</h3>

                {/* Contraseñas */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <label htmlFor="u_password" className="form-label">CONTRASEÑA</label>
                        <input
                            id="u_password"
                            type="password"
                            className="form-control"
                            value={formData.u_password}
                            onChange={(e) => onInputChange('u_password', e.target.value)}
                            placeholder="Contraseña"
                            required
                        />
                    </div>
                    <div className="col-12 col-md-6">
                        <label htmlFor="confirmPassword" className="form-label">CONFIRMAR CONTRASEÑA</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className={`form-control ${!passwordsMatch && confirmPassword ? 'is-invalid' : ''}`}
                            value={confirmPassword}
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            placeholder="Confirmar contraseña"
                            required
                        />
                        {!passwordsMatch && confirmPassword && (
                            <div className="invalid-feedback">
                                Las contraseñas no coinciden
                            </div>
                        )}
                    </div>
                </div>

                {/* Rol y Estado */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <label htmlFor="role_id" className="form-label">ROL</label>
                        <select
                            id="role_id"
                            className="form-select"
                            value={formData.role_id}
                            onChange={(e) => onInputChange('role_id', e.target.value)}
                            required
                        >
                            <option value="">Seleccionar rol</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">ESTADO DE LA CUENTA</label>
                        <div className="mt-2">
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="activeTrue"
                                    name="u_is_active"
                                    value="true"
                                    checked={formData.u_is_active === true}
                                    onChange={() => onInputChange('u_is_active', true)}
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
                                    name="u_is_active"
                                    value="false"
                                    checked={formData.u_is_active === false}
                                    onChange={() => onInputChange('u_is_active', false)}
                                />
                                <label className="form-check-label" htmlFor="activeFalse">
                                    Inactivo
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verificación de Email */}
                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="u_email_verified"
                                checked={formData.u_email_verified}
                                onChange={(e) => onInputChange('u_email_verified', e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="u_email_verified">
                                Email verificado
                            </label>
                        </div>
                        <small className="text-muted">
                            Marcar esta opción si el usuario ya ha verificado su dirección de email
                        </small>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                        <i className="bi bi-save me-2"></i>
                        Crear Usuario
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}