import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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

// Roles simulados
const roles = [
    { id: '1', name: 'Administrador' },
    { id: '2', name: 'Médico' },
    { id: '3', name: 'Enfermero' },
    { id: '4', name: 'Recepcionista' },
    { id: '5', name: 'Usuario Básico' }
];

export default function EditUserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<UserFormData>(defaultUserFormData);
    const [loading, setLoading] = useState<boolean>(true);

    // Mock "fetch" — reemplaza por servicio real cuando esté disponible
    useEffect(() => {
        console.log('EditUserPage mounted, id=', id);
        if (!id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const t = setTimeout(() => {
            const mock: UserFormData = {
                u_identification: `ID-${id}`,
                u_name: 'Juan',
                u_f_last_name: 'Pérez',
                u_s_last_name: 'Gómez',
                u_email: `usuario${id}@ejemplo.com`,
                u_password: '', // No cargamos la contraseña real por seguridad
                u_email_verified: true,
                u_is_active: true,
                role_id: '2'
            };
            setFormData(mock);
            setLoading(false);
        }, 300);
        return () => clearTimeout(t);
    }, [id]);

    function onInputChange(field: keyof UserFormData, value: string | boolean) {
        setFormData((prev) => ({ ...prev, [field]: value } as UserFormData));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log('Guardar usuario (mock):', id, formData);
        // TODO: llamar servicio real para guardar
        navigate('/users');
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
        return <div className="container py-4">Cargando usuario...</div>;
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Editar Usuario {id ? `#${id}` : ''}</h2>
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

                {/* Contraseña (opcional en edición) */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <label htmlFor="u_password" className="form-label">CONTRASEÑA</label>
                        <input
                            id="u_password"
                            type="password"
                            className="form-control"
                            value={formData.u_password}
                            onChange={(e) => onInputChange('u_password', e.target.value)}
                            placeholder="Dejar vacío para mantener la actual"
                        />
                        <small className="text-muted">
                            Solo completa este campo si deseas cambiar la contraseña
                        </small>
                    </div>
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
                </div>

                {/* Estado y Verificación de Email */}
                <div className="row g-3 mb-4">
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
                    <div className="col-12 col-md-6">
                        <div className="form-check mt-4">
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
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                        <i className="bi bi-save me-2"></i>
                        Guardar
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Regresar
                    </button>
                </div>
            </form>
        </div>
    );
}