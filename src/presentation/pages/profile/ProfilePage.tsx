import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFullName } from '../../../utils/userUtils';
import { profileFlow } from '../../../infrastructure/flows/profile';
import type { User } from '../../../types/user';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            setError('');

            try {
                const result = await profileFlow.getProfile();

                if (result.success && result.user) {
                    setUser(result.user);
                } else {
                    setError(result.error || 'Error al cargar el perfil');
                }
            } catch (err) {
                console.error('Error cargando perfil:', err);
                setError('Error inesperado al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const getUserFullName = (): string => {
        if (!user) return '';
        return getFullName(user);
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-muted fw-medium">Cargando información del perfil...</p>
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
                                    <h4 className="mb-3">Error al cargar perfil</h4>
                                    <p className="text-muted mb-4">{error || 'No se pudo cargar la información del perfil'}</p>
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                                            Volver al inicio
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

    const fullName = getUserFullName();

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: '80px', height: '80px' }}>
                                        <i className="bi bi-person-fill text-white fs-1"></i>
                                    </div>
                                    <div>
                                        <h1 className="h3 fw-bold mb-1">{fullName}</h1>
                                        <p className="text-muted mb-0">Mi Perfil</p>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate('/dashboard')}>
                                    <i className="bi bi-arrow-left"></i>
                                    Volver
                                </button>
                                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate('/profile/edit')}>
                                    <i className="bi bi-pencil"></i>
                                    Editar Perfil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-12">
                        {/* Card 1: Información Personal */}
                        <div className="card shadow-sm border-0 mb-4 hover-lift">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-person-circle me-2 text-primary"></i>
                                    Información Personal
                                </h5>
                                <small className="text-muted d-block mt-1">Datos de identificación personal</small>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Identificación</small>
                                            <span className="fs-5 fw-medium">{user.uIdentification || 'No especificada'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Nombre</small>
                                            <span className="fs-5 fw-medium">{user.uName || 'No especificado'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Primer Apellido</small>
                                            <span className="fs-5 fw-medium">{user.uFLastName || 'No especificado'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Segundo Apellido</small>
                                            <span className="fs-5 fw-medium">{user.uSLastName || 'No especificado'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Información de Contacto */}
                        <div className="card shadow-sm border-0 mb-4 hover-lift">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-envelope me-2 text-primary"></i>
                                    Información de Contacto
                                </h5>
                                <small className="text-muted d-block mt-1">Datos de comunicación</small>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-12">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Correo Electrónico</small>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-envelope text-muted"></i>
                                                <span className="fs-5 fw-medium">{user.uEmail || 'No especificado'}</span>
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

                        {/* Card 3: Información de Cuenta */}
                        <div className="card shadow-sm border-0 mb-4 hover-lift">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-shield-lock me-2 text-primary"></i>
                                    Información de Cuenta
                                </h5>
                                <small className="text-muted d-block mt-1">Estado y configuración de la cuenta</small>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Estado de la Cuenta</small>
                                            <span className={`badge bg-${user.uIsActive ? 'success' : 'danger'} bg-opacity-10 text-${user.uIsActive ? 'success' : 'danger'} fs-6 py-2 px-3 w-fit`}>
                                                <i className={`bi ${user.uIsActive ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                                                {user.uIsActive ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted text-uppercase fw-semibold mb-2">Fecha de Creación</small>
                                            <span className="fs-5 fw-medium">
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

                        {/* Card 4: Acciones Rápidas */}
                        <div className="card shadow-sm border-0 hover-lift">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-gear me-2 text-primary"></i>
                                    Acciones Rápidas
                                </h5>
                                <small className="text-muted d-block mt-1">Gestión rápida del perfil</small>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <button
                                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                                            onClick={() => navigate('/profile/edit')}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                            <span>Editar Información</span>
                                        </button>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <button
                                            className="btn btn-outline-info w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                                            onClick={() => navigate('/two-factor')}
                                        >
                                            <i className="bi bi-shield-check"></i>
                                            <span>Configurar 2FA</span>
                                        </button>
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