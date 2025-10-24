import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditService } from '../../../services/auditService';
import type { AuditReport } from '../../../types/audit';
import { AuditReportType, AuditAction } from '../../../types/audit';

interface AuditTypeStats {
    type: string;
    count: number;
    percentage: number;
}

interface AuditActionStats {
    action: string;
    count: number;
    percentage: number;
}

interface DashboardStats {
    totalRecords: number;
    typeBreakdown: AuditTypeStats[];
    actionBreakdown: AuditActionStats[];
    topUsers: { userId: number; userName: string; count: number }[];
    topEntities: { entityName: string; count: number }[];
}

export default function AuditDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentRecords, setRecentRecords] = useState<AuditReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Últimos 30 días
        end: new Date().toISOString().split('T')[0]
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, [dateRange]);

    const loadDashboardData = async () => {
        setLoading(true);
        setError('');

        try {
            // Obtener todos los registros del período
            const result = await auditService.searchAuditReports({
                startDate: dateRange.start,
                endDate: dateRange.end,
                limit: 10000 // Obtener todos para calcular estadísticas
            });

            // Calcular estadísticas
            const totalRecords = result.records.length;

            // Contar por tipo
            const typeCounts = result.records.reduce((acc, record) => {
                acc[record.ar_type] = (acc[record.ar_type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const typeBreakdown: AuditTypeStats[] = Object.entries(typeCounts).map(([type, count]) => ({
                type,
                count,
                percentage: Math.round((count / totalRecords) * 100)
            })).sort((a, b) => b.count - a.count);

            // Contar por acción
            const actionCounts = result.records.reduce((acc, record) => {
                acc[record.ar_action] = (acc[record.ar_action] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const actionBreakdown: AuditActionStats[] = Object.entries(actionCounts).map(([action, count]) => ({
                action,
                count,
                percentage: Math.round((count / totalRecords) * 100)
            })).sort((a, b) => b.count - a.count);

            // Top entidades
            const entityCounts = result.records.reduce((acc, record) => {
                acc[record.ar_entity_name] = (acc[record.ar_entity_name] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const topEntities = Object.entries(entityCounts)
                .map(([entityName, count]) => ({ entityName, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Top usuarios (simulado - backend debe incluir esto)
            const topUsers = [
                { userId: 0, userName: 'Pendiente backend', count: 0 }
            ];

            setStats({
                totalRecords,
                typeBreakdown,
                actionBreakdown,
                topUsers,
                topEntities
            });

            // Registros recientes (primeros 10)
            setRecentRecords(result.records.slice(0, 10));

        } catch (err) {
            console.error('Error cargando dashboard:', err);
            setError('Error inesperado al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadDashboardData();
    };

    const calculatePercentage = (value: number, total: number): number => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    const getTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            [AuditReportType.LOGIN_ATTEMPTS]: 'Intentos de Acceso',
            [AuditReportType.ROLE_CHANGES]: 'Cambios de Rol',
            [AuditReportType.OLDER_ADULT_UPDATES]: 'Actualizaciones Adultos Mayores',
            [AuditReportType.SYSTEM_ACCESS]: 'Acceso al Sistema',
            [AuditReportType.CLINICAL_RECORD_CHANGES]: 'Cambios Registros Clínicos',
            [AuditReportType.PASSWORD_RESETS]: 'Restablecimientos Contraseña',
            [AuditReportType.NOTIFICATIONS]: 'Notificaciones',
            [AuditReportType.GENERAL_ACTIONS]: 'Acciones Generales',
            [AuditReportType.OTHER]: 'Otros'
        };
        return labels[type] || type;
    };

    const getActionLabel = (action: string): string => {
        const labels: Record<string, string> = {
            [AuditAction.CREATE]: 'Crear',
            [AuditAction.UPDATE]: 'Actualizar',
            [AuditAction.DELETE]: 'Eliminar',
            [AuditAction.VIEW]: 'Ver',
            [AuditAction.LOGIN]: 'Login',
            [AuditAction.LOGOUT]: 'Logout',
            [AuditAction.EXPORT]: 'Exportar',
            [AuditAction.OTHER]: 'Otro'
        };
        return labels[action] || action;
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-CR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container-fluid mt-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando estadísticas de auditoría...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>
                        <i className="bi bi-graph-up me-2"></i>
                        Dashboard de Auditoría
                    </h2>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/audits'); }} style={{ cursor: 'pointer' }}>
                                    Menú Auditoría
                                </a>
                            </li>
                            <li className="breadcrumb-item active">Dashboard</li>
                        </ol>
                    </nav>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/audits')}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver
                    </button>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Actualizar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/audits/list')}
                    >
                        <i className="bi bi-list-ul me-2"></i>
                        Ver Todos
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError('')}
                        aria-label="Close"
                    ></button>
                </div>
            )}

            {/* Filtro de Rango de Fechas */}
            <div className="card mb-4">
                <div className="card-header">
                    <i className="bi bi-calendar-range me-2"></i>
                    Rango de Fechas
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Fecha inicio</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Fecha fin</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6 d-flex align-items-end gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={loadDashboardData}
                            >
                                <i className="bi bi-search me-2"></i>
                                Aplicar
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDateRange({
                                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    end: new Date().toISOString().split('T')[0]
                                })}
                            >
                                <i className="bi bi-arrow-counterclockwise me-2"></i>
                                Últimos 30 días
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {stats ? (
                <>
                    {/* Cards de Resumen */}
                    <div className="row g-3 mb-4">
                        {/* Total de Registros */}
                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-2">Total de Registros</h6>
                                            <h2 className="mb-0">{stats.totalRecords}</h2>
                                        </div>
                                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-activity text-primary fs-3"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usuarios Activos */}
                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-2">Usuarios Activos</h6>
                                            <h2 className="mb-0">{stats.topUsers.length}</h2>
                                        </div>
                                        <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-people text-success fs-3"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tipos de Auditoría */}
                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-2">Tipos de Auditoría</h6>
                                            <h2 className="mb-0">{stats.typeBreakdown.length}</h2>
                                        </div>
                                        <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-folder text-warning fs-3"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Entidades Afectadas */}
                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-2">Entidades Afectadas</h6>
                                            <h2 className="mb-0">{stats.topEntities.length}</h2>
                                        </div>
                                        <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-database text-info fs-3"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos y Tablas */}
                    <div className="row g-4">
                        {/* Distribución por Tipo de Auditoría */}
                        <div className="col-12 col-xl-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-pie-chart me-2"></i>
                                        Distribución por Tipo de Auditoría
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {stats.typeBreakdown.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {stats.typeBreakdown.map((item) => (
                                                <div key={item.type}>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="badge bg-info text-dark">
                                                            {getTypeLabel(item.type)}
                                                        </span>
                                                        <strong>{item.count}</strong>
                                                    </div>
                                                    <div className="progress" style={{ height: '10px' }}>
                                                        <div
                                                            className="progress-bar bg-info"
                                                            role="progressbar"
                                                            style={{ width: `${item.percentage}%` }}
                                                            aria-valuenow={item.percentage}
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                        >
                                                            {item.percentage}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted text-center">No hay datos disponibles</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Distribución por Acción */}
                        <div className="col-12 col-xl-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-bar-chart me-2"></i>
                                        Distribución por Acción
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {stats.actionBreakdown.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {stats.actionBreakdown.map((item) => (
                                                <div key={item.action}>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className={`badge ${
                                                            item.action === AuditAction.CREATE ? 'bg-success' :
                                                            item.action === AuditAction.UPDATE ? 'bg-warning text-dark' :
                                                            item.action === AuditAction.DELETE ? 'bg-danger' :
                                                            item.action === AuditAction.LOGIN ? 'bg-primary' :
                                                            'bg-secondary'
                                                        }`}>
                                                            {getActionLabel(item.action)}
                                                        </span>
                                                        <strong>{item.count}</strong>
                                                    </div>
                                                    <div className="progress" style={{ height: '10px' }}>
                                                        <div
                                                            className={`progress-bar ${
                                                                item.action === AuditAction.CREATE ? 'bg-success' :
                                                                item.action === AuditAction.UPDATE ? 'bg-warning' :
                                                                item.action === AuditAction.DELETE ? 'bg-danger' :
                                                                item.action === AuditAction.LOGIN ? 'bg-primary' :
                                                                'bg-secondary'
                                                            }`}
                                                            role="progressbar"
                                                            style={{ width: `${item.percentage}%` }}
                                                            aria-valuenow={item.percentage}
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                        >
                                                            {item.percentage}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted text-center">No hay datos disponibles</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Entidades Afectadas */}
                        <div className="col-12 col-xl-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-database me-2"></i>
                                        Top 5 Entidades Afectadas
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {stats.topEntities.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {stats.topEntities.map((item, index) => (
                                                <div key={item.entityName}>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span>
                                                            <span className="badge bg-secondary me-2">#{index + 1}</span>
                                                            {item.entityName}
                                                        </span>
                                                        <strong>{item.count}</strong>
                                                    </div>
                                                    <div className="progress" style={{ height: '10px' }}>
                                                        <div
                                                            className="progress-bar bg-secondary"
                                                            role="progressbar"
                                                            style={{ width: `${calculatePercentage(item.count, stats.totalRecords)}%` }}
                                                            aria-valuenow={calculatePercentage(item.count, stats.totalRecords)}
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                        >
                                                            {calculatePercentage(item.count, stats.totalRecords)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted text-center">No hay datos disponibles</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Usuarios Más Activos */}
                        <div className="col-12 col-xl-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-trophy me-2"></i>
                                        Top Usuarios Más Activos
                                    </h5>
                                </div>
                                <div className="card-body p-0">
                                    {stats.topUsers && stats.topUsers.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: '60px' }}>#</th>
                                                        <th>Usuario</th>
                                                        <th style={{ width: '100px' }} className="text-end">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.topUsers.map((user, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                {index === 0 && <i className="bi bi-trophy-fill text-warning"></i>}
                                                                {index === 1 && <i className="bi bi-trophy-fill text-secondary"></i>}
                                                                {index === 2 && <i className="bi bi-trophy-fill" style={{ color: '#cd7f32' }}></i>}
                                                                {index > 2 && <span className="text-muted">{index + 1}</span>}
                                                            </td>
                                                            <td>
                                                                <i className="bi bi-person-circle me-2"></i>
                                                                {user.userName}
                                                            </td>
                                                            <td className="text-end">
                                                                <strong>{user.count}</strong>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No hay datos disponibles (Backend pendiente)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actividad Reciente */}
                        <div className="col-12 col-xl-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-clock-history me-2"></i>
                                        Actividad Reciente
                                    </h5>
                                </div>
                                <div className="card-body p-0">
                                    {recentRecords.length > 0 ? (
                                        <div className="list-group list-group-flush">
                                            {recentRecords.map((record) => (
                                                <div
                                                    key={record.id}
                                                    className="list-group-item list-group-item-action"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/audits/view/${record.id}`)}
                                                >
                                                    <div className="d-flex w-100 justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <div className="mb-1">
                                                                <span className={`badge me-2 ${
                                                                    record.ar_action === AuditAction.CREATE ? 'bg-success' :
                                                                    record.ar_action === AuditAction.UPDATE ? 'bg-warning text-dark' :
                                                                    record.ar_action === AuditAction.DELETE ? 'bg-danger' :
                                                                    record.ar_action === AuditAction.LOGIN ? 'bg-primary' :
                                                                    'bg-secondary'
                                                                }`}>
                                                                    {getActionLabel(record.ar_action)}
                                                                </span>
                                                                <span className="badge bg-info text-dark">
                                                                    {getTypeLabel(record.ar_type)}
                                                                </span>
                                                                <span className="badge bg-secondary ms-1">
                                                                    {record.ar_entity_name}
                                                                </span>
                                                            </div>
                                                            <p className="mb-1 text-truncate" style={{ maxWidth: '300px' }}>
                                                                {record.ar_observations || <span className="text-muted fst-italic">Sin observaciones</span>}
                                                            </p>
                                                            <small className="text-muted">
                                                                <i className="bi bi-person-circle me-1"></i>
                                                                {record.user_name || 'N/A'}
                                                            </small>
                                                        </div>
                                                        <small className="text-muted text-end">
                                                            {formatDateTime(record.create_at)}
                                                        </small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No hay actividad reciente</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <p className="mt-3 text-muted">No hay datos de estadísticas disponibles</p>
                </div>
            )}
        </div>
    );
}
