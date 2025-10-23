import { useNavigate } from 'react-router-dom';

interface AuditMenuOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    route: string;
    color: string;
}

export default function AuditMenuPage() {
    const navigate = useNavigate();

    const auditOptions: AuditMenuOption[] = [
        {
            id: '1',
            title: 'Registros de Auditoría',
            description: 'Consultar, filtrar y exportar todos los registros de auditoría del sistema',
            icon: 'bi-list-ul',
            route: '/audits/list',
            color: 'primary'
        },
        {
            id: '2',
            title: 'Dashboard de Auditoría',
            description: 'Visualizar estadísticas, gráficos y análisis de actividad del sistema',
            icon: 'bi-graph-up',
            route: '/audits/dashboard',
            color: 'success'
        },
        {
            id: '3',
            title: 'Actividad por Usuario',
            description: 'Consultar registros de auditoría filtrados por usuario específico',
            icon: 'bi-person-check',
            route: '/audits/list?filterType=user',
            color: 'info'
        }
    ];

    const handleOptionClick = (route: string) => {
        navigate(route);
    };

    const handleBack = () => {
        navigate('/main-menu');
    };

    return (
        <div className="min-vh-100 bg-light">
            <div className="container py-4">
                {/* Header con botón de volver */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="display-5 fw-bold text-dark mb-2">
                            <i className="bi bi-shield-check text-primary me-3"></i>
                            Módulo de Auditoría
                        </h1>
                        <p className="lead text-muted mb-0">
                            Selecciona una opción para gestionar la auditoría del sistema
                        </p>
                    </div>
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={handleBack}
                    >
                        <i className="bi bi-arrow-left"></i>
                        Volver al Menú
                    </button>
                </div>

                {/* Grid de opciones de auditoría */}
                <div className="row g-4 mt-2">
                    {auditOptions.map((option) => (
                        <div key={option.id} className="col-12 col-md-6 col-lg-4">
                            <div
                                className="card h-100 shadow-sm border-0 hover-card"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    borderLeft: `4px solid var(--bs-${option.color})`,
                                }}
                                onClick={() => handleOptionClick(option.route)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
                                }}
                            >
                                <div className="card-body p-4 d-flex flex-column">
                                    {/* Icono */}
                                    <div className="mb-3">
                                        <div
                                            className={`rounded-circle bg-${option.color} bg-opacity-10 d-inline-flex align-items-center justify-content-center`}
                                            style={{ width: '70px', height: '70px' }}
                                        >
                                            <i className={`${option.icon} fs-1 text-${option.color}`}></i>
                                        </div>
                                    </div>

                                    {/* Título */}
                                    <h5 className="card-title fw-bold text-dark mb-3">
                                        {option.title}
                                    </h5>

                                    {/* Descripción */}
                                    <p className="card-text text-muted flex-grow-1 mb-4">
                                        {option.description}
                                    </p>

                                    {/* Indicador de acción */}
                                    <div className="mt-auto">
                                        <span className={`text-${option.color} fw-semibold d-flex align-items-center`}>
                                            Acceder
                                            <i className="bi bi-arrow-right ms-2"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Información adicional */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <i className="bi bi-info-circle fs-2 text-primary"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <h5 className="fw-bold text-dark mb-2">
                                            ¿Qué es la Auditoría del Sistema?
                                        </h5>
                                        <p className="text-muted mb-3">
                                            El módulo de auditoría registra automáticamente todas las acciones críticas realizadas en el sistema, 
                                            incluyendo creación, modificación y eliminación de registros, inicios de sesión, cambios de configuración, 
                                            y más. Esto permite mantener un historial completo de la actividad del sistema para fines de seguridad, 
                                            cumplimiento normativo y análisis de comportamiento.
                                        </p>
                                        <div className="row g-2">
                                            <div className="col-12 col-md-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-check-circle-fill text-success"></i>
                                                    <small className="text-muted">Trazabilidad completa</small>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-check-circle-fill text-success"></i>
                                                    <small className="text-muted">Detección de anomalías</small>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-check-circle-fill text-success"></i>
                                                    <small className="text-muted">Cumplimiento normativo</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accesos rápidos */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="mb-0 fw-bold">
                                    <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
                                    Accesos Rápidos
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="row g-2">
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <button
                                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => navigate('/audits/list?filterAction=CREATE')}
                                        >
                                            <span>
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Creaciones
                                            </span>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <button
                                            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => navigate('/audits/list?filterAction=DELETE')}
                                        >
                                            <span>
                                                <i className="bi bi-trash me-2"></i>
                                                Eliminaciones
                                            </span>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <button
                                            className="btn btn-outline-success w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => navigate('/audits/list?filterAction=LOGIN')}
                                        >
                                            <span>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Inicios de Sesión
                                            </span>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <button
                                            className="btn btn-outline-warning w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => navigate('/audits/list?filterAction=LOGIN_FAILED')}
                                        >
                                            <span>
                                                <i className="bi bi-shield-exclamation me-2"></i>
                                                Intentos Fallidos
                                            </span>
                                            <i className="bi bi-chevron-right"></i>
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
