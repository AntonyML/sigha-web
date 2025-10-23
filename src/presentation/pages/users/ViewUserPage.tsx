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

    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const [userResult, rolesResult] = await Promise.all([
                    userFlow.getUserById(Number(id)),
                    userFlow.getAllRoles()
                ]);

                if (userResult.success && userResult.user) {
                    setUser(userResult.user);
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

        loadData();
    }, [id]);

    const getRoleName = (roleId?: number): string => {
        if (!roleId) return 'No asignado';
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : 'No asignado';
    };

    const getFullName = (): string => {
        if (!user) return '';
        return userFlow.getFullName(user);
    };

    if (!id) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <i className="bi bi-exclamation-triangle display-1 text-warning mb-3 d-block"></i>
                    <h3 className="mb-3">ID no proporcionado</h3>
                    <p className="text-muted mb-4">No se encontró el identificador del usuario.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/users')}>
                        Volver a la lista
                    </button>
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

    if (error || !user) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-5 text-center">
                                    <i className="bi bi-exclamation-circle display-1 text-danger mb-3 d-block"></i>
                                    <h4 className="mb-3">Error al cargar usuario</h4>
                                    <p className="text-muted mb-4">{error || 'No se pudo cargar la información del usuario'}</p>
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button className="btn btn-outline-secondary" onClick={() => navigate('/users')}>
                                            Volver a la lista
                                        </button>
                                        <button className="btn btn-primary" onClick={() => window.location.reload()}>
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

    const fullName = getFullName();

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                        <i className="bi bi-person-fill text-primary fs-3"></i>
                                    </div>
                                    <div>
                                        <h1 className="h3 fw-bold mb-1">{fullName}</h1>
                                        <p className="text-muted mb-0">Usuario #{id}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate('/users')}>
                                    <i className="bi bi-arrow-left"></i>
                                    Volver
                                </button>
                                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate(`/users/edit/${id}`)}>
                                    <i className="bi bi-pencil"></i>
                                    Editar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-12">
                        {/* Card 1: Información Personal */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-person-circle me-2 text-primary"></i>
                                    Información Personal
                                </h5>
                                <small className="text-muted d-block mt-1">Datos de identificación del usuario</small>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Identificación</small>
                                            <span className="fs-5">{user.uIdentification || 'No especificada'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Nombre</small>
                                            <span className="fs-5">{user.uName || 'No especificado'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Primer Apellido</small>
                                            <span className="fs-5">{user.uFLastName || 'No especificado'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Segundo Apellido</small>
                                            <span className="fs-5">{user.uSLastName || 'No especificado'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Información de Contacto */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-envelope me-2 text-primary"></i>
                                    Información de Contacto
                                </h5>
                                <small className="text-muted d-block mt-1">Datos de comunicación del usuario</small>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-12">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Correo Electrónico</small>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-envelope text-muted"></i>
                                                <span className="fs-5">{user.uEmail || 'No especificado'}</span>
                                                {user.uEmailVerified && (
                                                    <span className="badge bg-success bg-opacity-10 text-success">
                                                        <i className="bi bi-patch-check-fill me-1"></i>
                                                        Verificado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Rol y Permisos */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-key me-2 text-primary"></i>
                                    Rol y Permisos
                                </h5>
                                <small className="text-muted d-block mt-1">Rol asignado para gestionar accesos</small>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Rol del Usuario</small>
                                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 w-fit fs-6">
                                                <i className="bi bi-person-badge me-1"></i>
                                                {getRoleName(user.roleId)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Estado de la Cuenta</small>
                                            <span className={`badge bg-${user.uIsActive ? 'success' : 'danger'} bg-opacity-10 text-${user.uIsActive ? 'success' : 'danger'} fs-6 py-2 px-3`}>
                                                <i className={`bi ${user.uIsActive ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                                                {user.uIsActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Permisos Específicos */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-shield-lock me-2 text-primary"></i>
                                    Permisos Específicos del Rol
                                </h5>
                                <small className="text-muted d-block mt-1">Acciones disponibles según el rol asignado</small>
                            </div>
                            <div className="card-body p-4">
                                {user.roleId === 1 && (
                                    <ul className="list-unstyled mb-0">
                                        <li className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            Acceso completo al sistema
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            Gestión de usuarios
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            Gestión de fichas virtuales
                                        </li>
                                        <li className="mb-0">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            Configuración del sistema
                                        </li>
                                    </ul>
                                )}
                                {user.roleId === 2 && (
                                    <ul className="list-unstyled mb-0">
                                        <li className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            Ver todas las fichas virtuales
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            Crear y editar fichas
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            Generar reportes médicos
                                        </li>
                                        <li className="mb-0">
                                            <i className="bi bi-x-circle-fill text-danger me-2"></i>
                                            Gestión de usuarios
                                        </li>
                                    </ul>
                                )}
                                {user.roleId === 3 && (
                                    <ul className="list-unstyled mb-0">
                                        <li className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            Ver fichas asignadas
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            Actualizar registros
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-x-circle-fill text-danger me-2"></i>
                                            Crear nuevas fichas
                                        </li>
                                        <li className="mb-0">
                                            <i className="bi bi-x-circle-fill text-danger me-2"></i>
                                            Gestión de usuarios
                                        </li>
                                    </ul>
                                )}
                                {(!user.roleId || (user.roleId > 3)) && (
                                    <p className="text-muted mb-0">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Permisos específicos del rol no disponibles
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card 5: Información Adicional */}
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-clock-history me-2 text-primary"></i>
                                    Información Adicional
                                </h5>
                                <small className="text-muted d-block mt-1">Metadatos históricos de la cuenta</small>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">ID de Usuario</small>
                                            <span className="badge bg-light text-dark">{user.id}</span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Fecha de Creación</small>
                                            <span className="fs-5">
                                                <i className="bi bi-calendar3 text-muted me-2"></i>
                                                {user.createAt ? new Date(user.createAt).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'No disponible'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
