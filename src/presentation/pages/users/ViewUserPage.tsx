import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userFlow } from '../../../infrastructure/flows/userFlow';
import type { User, UserRole } from '../../../types/user';

export default function ViewUserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Cargar usuario y roles
    useEffect(() => {
        const loadData = async () => {
            console.log('ViewUserPage mounted, id=', id);
            if (!id) {
                setLoading(false);
                return;
            }

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
                    setUser(userResult.user);
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

        loadData();
    }, [id]);

    // Obtener nombre del rol
    const getRoleName = (roleId?: number): string => {
        if (!roleId) return 'No asignado';
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : 'No asignado';
    };

    // Obtener nombre completo
    const getFullName = (): string => {
        if (!user) return '';
        return userFlow.getFullName(user);
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

    if (error || !user) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error || 'No se pudo cargar la información del usuario'}</p>
                    <hr />
                    <div className="d-flex gap-2">
                        <button className="btn btn-secondary" onClick={() => navigate('/users')}>
                            Volver a la lista
                        </button>
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const fullName = getFullName();

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
                            <p className="mb-0">{user.identification || 'No especificada'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <strong>Email:</strong>
                            <p className="mb-0">{user.u_email || 'No especificado'}</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <strong>Nombre:</strong>
                            <p className="mb-0">{user.name || 'No especificado'}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <strong>Primer apellido:</strong>
                            <p className="mb-0">{user.fLastName || 'No especificado'}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <strong>Segundo apellido:</strong>
                            <p className="mb-0">{user.sLastName || 'No especificado'}</p>
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
                            <p className="mb-0">{getRoleName(user.role_id)}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <strong>Estado de la cuenta:</strong>
                            <p className="mb-0">
                                <span className={`badge ${user.u_is_active ? 'bg-success' : 'bg-danger'}`}>
                                    {user.u_is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <strong>Verificación de email:</strong>
                            <p className="mb-0">
                                <span className={`badge ${user.u_email_verified ? 'bg-success' : 'bg-warning'}`}>
                                    {user.u_email_verified ? 'Verificado' : 'Pendiente'}
                                </span>
                            </p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <strong>Fecha de creación:</strong>
                            <p className="mb-0">{new Date(user.create_at).toLocaleDateString()}</p>
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
                                {user.role_id === 1 && (
                                    <>
                                        <li>✅ Acceso completo al sistema</li>
                                        <li>✅ Gestión de usuarios</li>
                                        <li>✅ Gestión de fichas virtuales</li>
                                        <li>✅ Configuración del sistema</li>
                                    </>
                                )}
                                {user.role_id === 2 && (
                                    <>
                                        <li>✅ Ver todas las fichas virtuales</li>
                                        <li>✅ Crear y editar fichas</li>
                                        <li>✅ Generar reportes médicos</li>
                                        <li>❌ Gestión de usuarios</li>
                                    </>
                                )}
                                {user.role_id === 3 && (
                                    <>
                                        <li>✅ Ver fichas asignadas</li>
                                        <li>✅ Actualizar registros de enfermería</li>
                                        <li>❌ Crear nuevas fichas</li>
                                        <li>❌ Gestión de usuarios</li>
                                    </>
                                )}
                                {user.role_id === 4 && (
                                    <>
                                        <li>✅ Registrar nuevos pacientes</li>
                                        <li>✅ Ver información básica</li>
                                        <li>❌ Acceso a historial médico completo</li>
                                        <li>❌ Gestión de usuarios</li>
                                    </>
                                )}
                                {user.role_id === 5 && (
                                    <>
                                        <li>✅ Ver información personal</li>
                                        <li>❌ Acceso a otras fichas</li>
                                        <li>❌ Funciones administrativas</li>
                                        <li>❌ Gestión de usuarios</li>
                                    </>
                                )}
                                {!user.role_id && (
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
                            <strong>ID de Usuario:</strong>
                            <p className="mb-0">{user.id}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <strong>Fecha de creación:</strong>
                            <p className="mb-0">{new Date(user.create_at).toLocaleDateString()}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <strong>Estado:</strong>
                            <p className="mb-0">
                                <span className={`badge ${userFlow.isUserActive(user) ? 'bg-success' : 'bg-secondary'}`}>
                                    {userFlow.isUserActive(user) ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <strong>Notas:</strong>
                            <p className="mb-0 text-muted">
                                {user.u_is_active
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