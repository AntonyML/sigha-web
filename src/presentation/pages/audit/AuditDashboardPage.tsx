import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditFlow } from '../../../infrastructure/flows/audit';
import type { AuditReport } from '../../../types/audit';

interface AuditActionStats {
    action: string;
    count: number;
    percentage: number;
}

interface AuditTableStats {
    table: string;
    count: number;
    percentage: number;
}

interface DashboardStats {
    totalRecords: number;
    actionBreakdown: AuditActionStats[];
    tableBreakdown: AuditTableStats[];
    topUsers: { userName: string; count: number }[];
    topTables: { tableName: string; count: number }[];
}

export default function AuditDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentRecords, setRecentRecords] = useState<AuditReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const navigate = useNavigate();

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // ✅ Usar endpoint de estadísticas para datos agregados
            const statsResult = await auditFlow.getAuditStatistics(
                dateRange.start || undefined,
                dateRange.end || undefined
            );

            // ✅ Usar endpoint de búsqueda solo para registros recientes (limit=10)
            const recentResult = await auditFlow.searchAuditReports({
                startDate: dateRange.start || undefined,
                endDate: dateRange.end || undefined,
                limit: '10',
            });

            if (statsResult.success && statsResult.stats) {
                console.log('Estadísticas del backend:', statsResult.stats);
                
                const backendStats = statsResult.stats;
                const totalRecords = backendStats.totalActions;
                console.log('Total de registros desde estadísticas:', totalRecords);

                // ✅ Usar estadísticas agregadas del backend en lugar de calcular desde registros limitados
                const actionBreakdown: AuditActionStats[] = Object.entries(backendStats.actionsByType).map(([action, count]) => ({
                    action,
                    count: Number(count),
                    percentage: Math.round((Number(count) / totalRecords) * 100),
                })).sort((a, b) => b.count - a.count);

                const tableBreakdown: AuditTableStats[] = Object.entries(backendStats.actionsByEntity).map(([table, count]) => ({
                    table,
                    count: Number(count),
                    percentage: Math.round((Number(count) / totalRecords) * 100),
                })).sort((a, b) => b.count - a.count);

                // Top tablas desde estadísticas del backend
                const topTables = Object.entries(backendStats.actionsByEntity)
                    .map(([tableName, count]) => ({ tableName, count: Number(count) }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                // Top usuarios desde estadísticas del backend
                const topUsers = backendStats.topUsers.map(user => ({
                    userName: user.username,
                    count: user.actionCount
                })).slice(0, 5);

                console.log('Estadísticas procesadas:', {
                    totalRecords,
                    actionBreakdown,
                    tableBreakdown,
                    topUsers,
                    topTables
                });

                setStats({
                    totalRecords,
                    actionBreakdown,
                    tableBreakdown,
                    topUsers,
                    topTables
                });
            } else {
                console.error('Error obteniendo estadísticas:', statsResult.error);
                setError(statsResult.error || 'Error al cargar estadísticas');
            }

            // ✅ Procesar registros recientes para "Actividad Reciente"
            if (recentResult.success && recentResult.records) {
                console.log('Registros recientes - Total:', recentResult.records.length);
                console.log('Registros recientes - Datos:', recentResult.records);
                
                const records = recentResult.records as AuditReport[];
                
                // Inspeccionar el primer registro en detalle
                if (records.length > 0) {
                    const firstRecord = records[0];
                    console.log('Primer registro reciente:', firstRecord);
                    console.log('Campos disponibles:', Object.keys(firstRecord));
                    console.log('Valores de campos clave:', {
                        id: firstRecord.id,
                        ar_action: firstRecord.ar_action,
                        ar_entity_name: firstRecord.ar_entity_name,
                        user_name: firstRecord.user_name,
                        user_email: firstRecord.user_email,
                        create_at: firstRecord.create_at,
                        ar_observations: firstRecord.ar_observations
                    });
                } else {
                    console.log('No hay registros recientes para mostrar');
                }
                
                // Ordenar por timestamp descendente (más recientes primero)
                const sortedRecords = records
                    .filter(record => record.create_at)
                    .sort((a, b) => {
                        try {
                            const dateA = new Date(a.create_at);
                            const dateB = new Date(b.create_at);
                            return dateB.getTime() - dateA.getTime();
                        } catch (error) {
                            console.error('Error ordenando fechas:', error, { a: a.create_at, b: b.create_at });
                            return 0;
                        }
                    });
                
                console.log('Registros ordenados:', sortedRecords.slice(0, 5));
                setRecentRecords(sortedRecords.slice(0, 10));
            } else {
                console.log('Error obteniendo registros recientes:', recentResult.error);
                console.log('Resultado completo:', recentResult);
                setRecentRecords([]);
            }
        } catch (error) {
            console.error('Error general en loadDashboardData:', error);
            setError('Error al cargar datos del dashboard');
        }

        setLoading(false);
    }, [dateRange.start, dateRange.end]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleRefresh = () => {
        loadDashboardData();
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
                </div>
                <div>
                    <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/audits')}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver
                    </button>
                    <button className="btn btn-primary me-2" onClick={() => navigate('/audits/list')}>
                        <i className="bi bi-list-ul me-2"></i>Ver Lista
                    </button>
                    <button className="btn btn-success" onClick={handleRefresh}>
                        <i className="bi bi-arrow-clockwise me-2"></i>Actualizar
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Filtro de Fechas */}
            <div className="card mb-4">
                <div className="card-header">
                    <i className="bi bi-calendar-range me-2"></i>
                    Rango de Fechas
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Fecha inicio</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Fecha fin</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button className="btn btn-primary w-100" onClick={loadDashboardData}>
                                <i className="bi bi-filter me-2"></i>Aplicar Filtro
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {stats ? (
                <>
                    {/* Tarjetas de Resumen */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <div className="card border-primary">
                                <div className="card-body text-center">
                                    <i className="bi bi-file-earmark-text display-4 text-primary mb-2"></i>
                                    <h5 className="card-title">Total Registros</h5>
                                    <p className="display-6 fw-bold text-primary mb-0">{stats.totalRecords}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-success">
                                <div className="card-body text-center">
                                    <i className="bi bi-lightning display-4 text-success mb-2"></i>
                                    <h5 className="card-title">Acciones</h5>
                                    <p className="display-6 fw-bold text-success mb-0">{stats.actionBreakdown.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-warning">
                                <div className="card-body text-center">
                                    <i className="bi bi-table display-4 text-warning mb-2"></i>
                                    <h5 className="card-title">Tablas</h5>
                                    <p className="display-6 fw-bold text-warning mb-0">{stats.tableBreakdown.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-info">
                                <div className="card-body text-center">
                                    <i className="bi bi-people display-4 text-info mb-2"></i>
                                    <h5 className="card-title">Usuarios</h5>
                                    <p className="display-6 fw-bold text-info mb-0">{stats.topUsers.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficas y Estadísticas */}
                    <div className="row g-4 mb-4">
                        {/* Distribución por Acción */}
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <i className="bi bi-pie-chart me-2"></i>
                                    Distribución por Acción
                                </div>
                                <div className="card-body">
                                    {stats.actionBreakdown.map((item, index) => (
                                        <div key={index} className="mb-3">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="badge bg-primary">
                                                    {item.action}
                                                </span>
                                                <span className="text-muted">
                                                    {item.count} ({item.percentage}%)
                                                </span>
                                            </div>
                                            <div className="progress" style={{ height: '10px' }}>
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${item.percentage}%` }}
                                                    aria-valuenow={item.percentage}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Distribución por Tabla */}
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <i className="bi bi-bar-chart me-2"></i>
                                    Distribución por Tabla
                                </div>
                                <div className="card-body">
                                    {stats.tableBreakdown.slice(0, 5).map((item, index) => (
                                        <div key={index} className="mb-3">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="badge bg-secondary">
                                                    {auditFlow.getTableLabel(item.table || '')}
                                                </span>
                                                <span className="text-muted">
                                                    {item.count} ({item.percentage}%)
                                                </span>
                                            </div>
                                            <div className="progress" style={{ height: '10px' }}>
                                                <div
                                                    className="progress-bar bg-secondary"
                                                    role="progressbar"
                                                    style={{ width: `${item.percentage}%` }}
                                                    aria-valuenow={item.percentage}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Usuarios y Tablas */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <i className="bi bi-person-badge me-2"></i>
                                    Top 5 Usuarios Más Activos
                                </div>
                                <div className="card-body">
                                    <div className="list-group list-group-flush">
                                        {stats.topUsers.map((user, index) => (
                                            <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>
                                                    <i className="bi bi-person-circle me-2"></i>
                                                    {user.userName}
                                                </span>
                                                <span className="badge bg-primary rounded-pill">{user.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <i className="bi bi-table me-2"></i>
                                    Top 5 Tablas Más Modificadas
                                </div>
                                <div className="card-body">
                                    <div className="list-group list-group-flush">
                                        {stats.topTables.map((table, index) => (
                                            <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>
                                                    <i className="bi bi-database me-2"></i>
                                                    {auditFlow.getTableLabel(table.tableName || '')}
                                                </span>
                                                <span className="badge bg-secondary rounded-pill">{table.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actividad Reciente */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>
                                        <i className="bi bi-clock-history me-2"></i>
                                        Actividad Reciente
                                    </span>
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/audits/list')}>
                                        Ver Todas
                                    </button>
                                </div>
                                <div className="card-body">
                                    {recentRecords.length > 0 ? (
                                        <div className="list-group list-group-flush">
                                            {recentRecords.map((record) => (
                                                <div key={record.id} className="list-group-item">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                <span className="badge bg-primary">
                                                                    {record.ar_action || (record as unknown as Record<string, unknown>).action as string || 'other'}
                                                                </span>
                                                                <span className="badge bg-secondary">
                                                                    {auditFlow.getTableLabel(record.ar_entity_name || (record as unknown as Record<string, unknown>).entity_name as string || (record as unknown as Record<string, unknown>).tableName as string || '')}
                                                                </span>
                                                            </div>
                                                            <p className="mb-1">
                                                                {auditFlow.getAuditReportDescription(record).userFriendly}
                                                            </p>
                                                            <small className="text-muted">
                                                                <i className="bi bi-person-circle me-1"></i>
                                                                {record.user_name || record.user_email || (record as unknown as Record<string, unknown>).username as string || (record as unknown as Record<string, unknown>).name as string || 'N/A'} • {record.create_at ? auditFlow.formatAuditDate(record.create_at) : 'Fecha no disponible'}
                                                            </small>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary ms-2"
                                                            onClick={() => navigate(`/audits/view/${record.id}`)}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>
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
