import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditFlow } from '../../../infrastructure/flows/auditFlow';
import type { AuditStats, Audit } from '../../../types/audit';

export default function AuditDashboardPage() {
    const [stats, setStats] = useState<AuditStats | null>(null);
    const [recentAudits, setRecentAudits] = useState<Audit[]>([]);
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
            const [statsResult, auditsResult] = await Promise.all([
                auditFlow.getAuditStats(dateRange.start, dateRange.end),
                auditFlow.getAllAudits({ page: 1, limit: 10, sortBy: 'createAt', sortOrder: 'DESC' })
            ]);

            if (statsResult.success && statsResult.stats) {
                setStats(statsResult.stats);
            } else {
                setError(statsResult.error || 'Error al cargar estadísticas');
            }

            if (auditsResult.success && auditsResult.audits) {
                setRecentAudits(auditsResult.audits);
            }
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
                        {/* Total de Acciones */}
                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-2">Total de Acciones</h6>
                                            <h2 className="mb-0">{stats.totalActions}</h2>
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

                        {/* Tipos de Acciones */}
                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-2">Tipos de Acciones</h6>
                                            <h2 className="mb-0">{Object.keys(stats.actionsByType).length}</h2>
                                        </div>
                                        <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-exclamation-triangle text-warning fs-3"></i>
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
                                            <h2 className="mb-0">{Object.keys(stats.actionsByEntity).length}</h2>
                                        </div>
                                        <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-calendar-check text-info fs-3"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos y Tablas */}
                    <div className="row g-4">
                        {/* Acciones por Tipo */}
                        <div className="col-12 col-xl-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-bar-chart me-2"></i>
                                        Acciones por Tipo
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {stats.actionsByType && Object.keys(stats.actionsByType).length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {Object.entries(stats.actionsByType)
                                                .sort(([, a], [, b]) => b - a)
                                                .map(([action, count]) => (
                                                    <div key={action}>
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <span className={`badge ${auditFlow.getActionBadgeClass(action as any)}`}>
                                                                {auditFlow.getActionLabel(action as any)}
                                                            </span>
                                                            <strong>{count}</strong>
                                                        </div>
                                                        <div className="progress" style={{ height: '10px' }}>
                                                            <div
                                                                className="progress-bar"
                                                                role="progressbar"
                                                                style={{ width: `${calculatePercentage(count, stats.totalActions)}%` }}
                                                                aria-valuenow={calculatePercentage(count, stats.totalActions)}
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                            >
                                                                {calculatePercentage(count, stats.totalActions)}%
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

                        {/* Acciones por Entidad */}
                        <div className="col-12 col-xl-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-diagram-3 me-2"></i>
                                        Acciones por Entidad
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {stats.actionsByEntity && Object.keys(stats.actionsByEntity).length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {Object.entries(stats.actionsByEntity)
                                                .sort(([, a], [, b]) => b - a)
                                                .map(([entity, count]) => (
                                                    <div key={entity}>
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <span className="badge bg-secondary">
                                                                {auditFlow.getEntityLabel(entity as any)}
                                                            </span>
                                                            <strong>{count}</strong>
                                                        </div>
                                                        <div className="progress" style={{ height: '10px' }}>
                                                            <div
                                                                className="progress-bar bg-secondary"
                                                                role="progressbar"
                                                                style={{ width: `${calculatePercentage(count, stats.totalActions)}%` }}
                                                                aria-valuenow={calculatePercentage(count, stats.totalActions)}
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                            >
                                                                {calculatePercentage(count, stats.totalActions)}%
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
                                                                {user.username}
                                                            </td>
                                                            <td className="text-end">
                                                                <strong>{user.actionCount}</strong>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No hay datos disponibles</p>
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
                                    {recentAudits.length > 0 ? (
                                        <div className="list-group list-group-flush">
                                            {recentAudits.map((audit) => (
                                                <div
                                                    key={audit.id}
                                                    className="list-group-item list-group-item-action"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/audits/view/${audit.id}`)}
                                                >
                                                    <div className="d-flex w-100 justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <div className="mb-1">
                                                                <span className={`badge ${auditFlow.getActionBadgeClass(audit.aAction)} me-2`}>
                                                                    {auditFlow.getActionLabel(audit.aAction)}
                                                                </span>
                                                                <span className="badge bg-secondary">
                                                                    {auditFlow.getEntityLabel(audit.aEntity)}
                                                                </span>
                                                            </div>
                                                            <p className="mb-1 text-truncate" style={{ maxWidth: '300px' }}>
                                                                {audit.aDescription}
                                                            </p>
                                                            <small className="text-muted">
                                                                <i className="bi bi-person-circle me-1"></i>
                                                                {audit.aUsername || 'Sistema'}
                                                            </small>
                                                        </div>
                                                        <small className="text-muted text-end">
                                                            {auditFlow.formatAuditDate(audit.createAt)}
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
