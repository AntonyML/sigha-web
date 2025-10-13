import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface UserFormData {
    u_identification: string;
    u_name: string;
    u_f_last_name: string;
    u_s_last_name: string;
    u_email: string;
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

export default function ViewUserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<UserFormData>(defaultUserFormData);
    const [loading, setLoading] = useState<boolean>(true);

    // Mock "fetch" — reemplaza por servicio real cuando esté disponible
    useEffect(() => {
        console.log('ViewUserPage mounted, id=', id);
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
                u_email_verified: true,
                u_is_active: true,
                role_id: '2'
            };
            setFormData(mock);
            setLoading(false);
        }, 300);
        return () => clearTimeout(t);
    }, [id]);

    // Obtener nombre del rol
    const getRoleName = (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : 'No asignado';
    };

    // Manejo cuando no hay id en la ruta
    if (!id) {
        return (
            <div className="container py-4">
                <h3 className="mb-3">ID no proporcionado</h3>
                <p>No se encontró el identificador del usuario.</p>
                <div className="d-flex gap-2">
                    <button className="btn btn-secondary" onClick={() => navigate('/users')}>
                        Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="container py-4">Cargando información del usuario...</div>;
    }

    const fullName = `${formData.u_name} ${formData.u_f_last_name} ${formData.u_s_last_name}`.trim();

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Usuario #{id}</h2>
                    <p className="text-muted mb-0">{fullName}</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-secondary" onClick={() => navigate('/users')}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Regresar
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate(`/users/edit/${id}`)}>
                        <i className="bi bi-pencil-square me-2"></i>
                        Editar
                    </button>
                </div>
            </div>

            {/* Información Personal */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">👤 Información Personal</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <strong>Identificación:</strong>
                            <p className="mb-0">{formData.u_identification || 'No especificada'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <strong>Email:</strong>
                            <p className="mb-0">{formData.u_email || 'No especificado'}</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <strong>Nombre:</strong>
                            <p className="mb-0">{formData.u_name || 'No especificado'}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <strong>Primer apellido:</strong>
                            <p className="mb-0">{formData.u_f_last_name || 'No especificado'}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <strong>Segundo apellido:</strong>
                            <p className="mb-0">{formData.u_s_last_name || 'No especificado'}</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <strong>Nombre completo:</strong>
                            <p className="mb-0">{fullName || 'No especificado'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información de la Cuenta */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">⚙️ Configuración de la Cuenta</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <strong>Rol:</strong>
                            <p className="mb-0">{getRoleName(formData.role_id)}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <strong>Estado de la cuenta:</strong>
                            <p className="mb-0">
                                <span className={`badge ${formData.u_is_active ? 'bg-success' : 'bg-danger'}`}>
                                    {formData.u_is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <strong>Verificación de email:</strong>
                            <p className="mb-0">
                                <span className={`badge ${formData.u_email_verified ? 'bg-success' : 'bg-warning'}`}>
                                    {formData.u_email_verified ? 'Verificado' : 'Pendiente'}
                                </span>
                            </p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <strong>Fecha de creación:</strong>
                            <p className="mb-0">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen de Permisos */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">🔐 Resumen de Permisos</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h6>Capacidades del Rol:</h6>
                            <ul className="list-unstyled">
                                {formData.role_id === '1' && (
                                    <>
                                        <li>✅ Acceso completo al sistema</li>
                                        <li>✅ Gestión de usuarios</li>
                                        <li>✅ Gestión de fichas virtuales</li>
                                        <li>✅ Configuración del sistema</li>
                                    </>
                                )}
                                {formData.role_id === '2' && (
                                    <>
                                        <li>✅ Ver todas las fichas virtuales</li>
                                        <li>✅ Crear y editar fichas</li>
                                        <li>✅ Generar reportes médicos</li>
                                        <li>❌ Gestión de usuarios</li>
                                    </>
                                )}
                                {formData.role_id === '3' && (
                                    <>
                                        <li>✅ Ver fichas asignadas</li>
                                        <li>✅ Actualizar registros de enfermería</li>
                                        <li>❌ Crear nuevas fichas</li>
                                        <li>❌ Gestión de usuarios</li>
                                    </>
                                )}
                                {formData.role_id === '4' && (
                                    <>
                                        <li>✅ Registrar nuevos pacientes</li>
                                        <li>✅ Ver información básica</li>
                                        <li>❌ Acceso a historial médico completo</li>
                                        <li>❌ Gestión de usuarios</li>
                                    </>
                                )}
                                {formData.role_id === '5' && (
                                    <>
                                        <li>✅ Ver información personal</li>
                                        <li>❌ Acceso a otras fichas</li>
                                        <li>❌ Funciones administrativas</li>
                                        <li>❌ Gestión de usuarios</li>
                                    </>
                                )}
                                {!formData.role_id && (
                                    <li>❌ Sin permisos asignados</li>
                                )}
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <h6>Estado del Sistema:</h6>
                            <ul className="list-unstyled">
                                <li>📊 Total de sesiones: 24</li>
                                <li>🕒 Último acceso: {new Date().toLocaleDateString()}</li>
                                <li>🔔 Notificaciones: 3 pendientes</li>
                                <li>📈 Actividad: Normal</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información Adicional */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">📊 Información Adicional</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <strong>Registros creados:</strong>
                            <p className="mb-0">15</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <strong>Última actualización:</strong>
                            <p className="mb-0">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <strong>Días activo:</strong>
                            <p className="mb-0">45 días</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <strong>Notas:</strong>
                            <p className="mb-0 text-muted">
                                {formData.u_is_active
                                    ? 'Usuario activo en el sistema con todos los permisos correspondientes a su rol.'
                                    : 'Usuario inactivo. No puede acceder al sistema hasta que sea reactivado.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}