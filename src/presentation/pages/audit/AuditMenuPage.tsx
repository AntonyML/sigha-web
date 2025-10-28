import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/atoms';

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
            title: 'Dashboard de Auditoría',
            description: 'Vista general rápida para detectar anomalías con estadísticas resumidas, actividad reciente y gráficos simples',
            icon: 'dashboard',
            route: '/audits/dashboard',
            color: 'primary'
        },
        {
            id: '2',
            title: 'Registros de Auditoría',
            description: 'Lista y búsqueda de historial completo con filtros avanzados y exportación a CSV/PDF',
            icon: 'list',
            route: '/audits/list',
            color: 'success'
        },
        // {
        //     id: '3',
        //     title: 'Historial de Adultos Mayores',
        //     description: 'Cambios en datos de pacientes con vista comparativa y notificaciones de modificaciones recientes',
        //     icon: 'person',
        //     route: '/audits/older-adult-updates',
        //     color: 'info'
        // },
        // {
        //     id: '4',
        //     title: 'Reportes de Auditoría',
        //     description: 'Generación y consulta de reportes formales con datos tabulados y opciones de exportación',
        //     icon: 'clipboard_document',
        //     route: '/audits/reports',
        //     color: 'warning'
        // },
        // {
        //     id: '5',
        //     title: 'Historial de Registros Digitales',
        //     description: 'Cambios en documentos específicos con vista timeline y diffs detallados por registro',
        //     icon: 'document',
        //     route: '/audits/digital-records',
        //     color: 'secondary'
        // }
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="display-5 fw-bold text-dark mb-2">
                            <Icon name="shield" size="lg" className="text-primary me-3" />
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
                        <Icon name="arrow_back" size="sm" />
                        Volver al Menú
                    </button>
                </div>

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
                                    <div className="mb-3">
                                        <div
                                            className={`rounded-circle bg-${option.color} bg-opacity-10 d-inline-flex align-items-center justify-content-center`}
                                            style={{ width: '70px', height: '70px' }}
                                        >
                                            <Icon name={option.icon} size="xl" className={`text-${option.color}`} />
                                        </div>
                                    </div>

                                    <h5 className="card-title fw-bold text-dark mb-3">
                                        {option.title}
                                    </h5>

                                    <p className="card-text text-muted flex-grow-1 mb-4">
                                        {option.description}
                                    </p>

                                    <div className="mt-auto">
                                        <span className={`text-${option.color} fw-semibold d-flex align-items-center`}>
                                            Acceder
                                            <Icon name="arrow_forward" size="sm" className="ms-2" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row mt-5">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <Icon name="info" size="lg" className="text-primary" />
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
                                                    <Icon name="check_circle" size="sm" className="text-success" />
                                                    <small className="text-muted">Trazabilidad completa</small>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Icon name="check_circle" size="sm" className="text-success" />
                                                    <small className="text-muted">Detección de anomalías</small>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Icon name="check_circle" size="sm" className="text-success" />
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
                                    <Icon name="bolt" size="sm" className="text-warning me-2" />
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
                                                <Icon name="add" size="sm" className="me-2" />
                                                Creaciones
                                            </span>
                                            <Icon name="chevron_right" size="sm" />
                                        </button>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <button
                                            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => navigate('/audits/list?filterAction=DELETE')}
                                        >
                                            <span>
                                                <Icon name="delete" size="sm" className="me-2" />
                                                Eliminaciones
                                            </span>
                                            <Icon name="chevron_right" size="sm" />
                                        </button>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <button
                                            className="btn btn-outline-success w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => navigate('/audits/list?filterAction=LOGIN')}
                                        >
                                            <span>
                                                <Icon name="arrow_right_circle" size="sm" className="me-2" />
                                                Inicios de Sesión
                                            </span>
                                            <Icon name="chevron_right" size="sm" />
                                        </button>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <button
                                            className="btn btn-outline-warning w-100 d-flex align-items-center justify-content-between"
                                            onClick={() => navigate('/audits/list?filterAction=LOGIN_FAILED')}
                                        >
                                            <span>
                                                <Icon name="exclamation_triangle" size="sm" className="me-2" />
                                                Intentos Fallidos
                                            </span>
                                            <Icon name="chevron_right" size="sm" />
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
