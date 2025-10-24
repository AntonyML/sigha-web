import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditService } from '../../../services/auditService';
import type { AuditReport, SearchAuditReportsDto } from '../../../types/audit';
import { AuditReportType, AuditAction } from '../../../types/audit';

export default function AuditListPage() {
    const [records, setRecords] = useState<AuditReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterAction, setFilterAction] = useState<string>('ALL');
    const [filterEntity, setFilterEntity] = useState<string>('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const navigate = useNavigate();

    // Cargar registros al montar el componente o cuando cambien los filtros
    useEffect(() => {
        loadRecords();
    }, [currentPage, pageSize, filterType, filterAction, filterEntity, startDate, endDate]);

    const loadRecords = async () => {
        setLoading(true);
        setError('');

        try {
            const params: SearchAuditReportsDto = {
                page: currentPage,
                limit: pageSize,
            };

            if (filterType !== 'ALL') {
                params.type = filterType;
            }

            if (filterAction !== 'ALL') {
                params.action = filterAction;
            }

            if (filterEntity !== 'ALL') {
                params.entityName = filterEntity;
            }

            if (startDate) {
                params.startDate = startDate;
            }

            if (endDate) {
                params.endDate = endDate;
            }

            const result = await auditService.searchAuditReports(params);
            setRecords(result.records);
            setTotalRecords(result.total || 0);
            setTotalPages(result.totalPages || 1);
        } catch (err) {
            console.error('Error cargando auditorías:', err);
            setError('Error inesperado al cargar auditorías');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar por término de búsqueda (local)
    const filteredRecords = records.filter(record => {
        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase();
        return (
            (record.ar_observations || '').toLowerCase().includes(term) ||
            (record.user_name || '').toLowerCase().includes(term) ||
            (record.user_email || '').toLowerCase().includes(term) ||
            record.ar_action.toLowerCase().includes(term) ||
            record.ar_entity_name.toLowerCase().includes(term) ||
            (record.ar_type || '').toLowerCase().includes(term)
        );
    });

    const toggleRowExpansion = (recordId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(recordId)) {
                newSet.delete(recordId);
            } else {
                newSet.add(recordId);
            }
            return newSet;
        });
    };

    const handleView = (record: AuditReport) => {
        navigate(`/audits/view/${record.id}`);
    };

    const parseJsonValue = (jsonString?: string): any => {
        if (!jsonString) return null;
        try {
            return JSON.parse(jsonString);
        } catch {
            return jsonString;
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-CR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
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

    const handleExport = async () => {
        try {
            const params: SearchAuditReportsDto = {
                type: filterType !== 'ALL' ? filterType : undefined,
                action: filterAction !== 'ALL' ? filterAction : undefined,
                entityName: filterEntity !== 'ALL' ? filterEntity : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                limit: 10000
            };

            const result = await auditService.searchAuditReports(params);
            
            // Generar CSV
            const headers = ['ID', 'Tipo', 'Acción', 'Entidad', 'ID Entidad', 'Usuario', 'Email', 'Observaciones', 'Fecha', 'IP'];
            const rows = result.records.map(record => [
                record.id,
                getTypeLabel(record.ar_type),
                getActionLabel(record.ar_action),
                record.ar_entity_name,
                record.ar_entity_id || 'N/A',
                record.user_name || 'N/A',
                record.user_email || 'N/A',
                record.ar_observations || 'N/A',
                formatDateTime(record.create_at),
                record.ar_ip_address || 'N/A'
            ]);
            
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `auditorias_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);

            alert('Auditorías exportadas exitosamente');
        } catch (err) {
            console.error('Error exportando auditorías:', err);
            alert('Error al exportar auditorías');
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterAction('ALL');
        setFilterType('ALL');
        setFilterEntity('ALL');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset a primera página
    };

    if (loading) {
        return (
            <div className="container-fluid mt-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando registros de auditoría...</p>
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
                        <i className="bi bi-shield-check me-2"></i>
                        Auditoría del Sistema
                    </h2>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/audits'); }} style={{ cursor: 'pointer' }}>
                                    Menú Auditoría
                                </a>
                            </li>
                            <li className="breadcrumb-item active">Registros</li>
                        </ol>
                    </nav>
                </div>
                <div>
                    <button
                        className="btn btn-outline-secondary me-2"
                        onClick={() => navigate('/audits')}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver
                    </button>
                    <button
                        className="btn btn-primary me-2"
                        onClick={() => navigate('/audits/dashboard')}
                    >
                        <i className="bi bi-graph-up me-2"></i>
                        Dashboard
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={handleExport}
                        disabled={loading}
                    >
                        <i className="bi bi-download me-2"></i>
                        Exportar CSV
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

            {/* Filtros */}
            <div className="card mb-4">
                <div className="card-header">
                    <i className="bi bi-funnel me-2"></i>
                    Filtros de Búsqueda
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        {/* Búsqueda por texto */}
                        <div className="col-md-4">
                            <label className="form-label">Búsqueda</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por observaciones, usuario, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtro por Tipo */}
                        <div className="col-md-2">
                            <label className="form-label">Tipo</label>
                            <select
                                className="form-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="ALL">Todos</option>
                                <option value={AuditReportType.LOGIN_ATTEMPTS}>Intentos de Acceso</option>
                                <option value={AuditReportType.ROLE_CHANGES}>Cambios de Rol</option>
                                <option value={AuditReportType.OLDER_ADULT_UPDATES}>Adultos Mayores</option>
                                <option value={AuditReportType.CLINICAL_RECORD_CHANGES}>Registros Clínicos</option>
                                <option value={AuditReportType.SYSTEM_ACCESS}>Acceso Sistema</option>
                                <option value={AuditReportType.PASSWORD_RESETS}>Contraseñas</option>
                                <option value={AuditReportType.NOTIFICATIONS}>Notificaciones</option>
                                <option value={AuditReportType.GENERAL_ACTIONS}>Acciones Generales</option>
                                <option value={AuditReportType.OTHER}>Otros</option>
                            </select>
                        </div>

                        {/* Filtro por Acción */}
                        <div className="col-md-2">
                            <label className="form-label">Acción</label>
                            <select
                                className="form-select"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                            >
                                <option value="ALL">Todas</option>
                                <option value={AuditAction.LOGIN}>Login</option>
                                <option value={AuditAction.LOGOUT}>Logout</option>
                                <option value={AuditAction.CREATE}>Crear</option>
                                <option value={AuditAction.UPDATE}>Actualizar</option>
                                <option value={AuditAction.DELETE}>Eliminar</option>
                                <option value={AuditAction.VIEW}>Ver</option>
                                <option value={AuditAction.EXPORT}>Exportar</option>
                                <option value={AuditAction.OTHER}>Otro</option>
                            </select>
                        </div>

                        {/* Filtro por Entidad */}
                        <div className="col-md-2">
                            <label className="form-label">Entidad</label>
                            <select
                                className="form-select"
                                value={filterEntity}
                                onChange={(e) => setFilterEntity(e.target.value)}
                            >
                                <option value="ALL">Todas</option>
                                <option value="users">Usuarios</option>
                                <option value="roles">Roles</option>
                                <option value="older_adults">Adultos Mayores</option>
                                <option value="older_adult_family">Familiares</option>
                                <option value="programs">Programas</option>
                                <option value="medications">Medicamentos</option>
                                <option value="clinical_records">Registros Clínicos</option>
                                <option value="clinical_history">Historia Clínica</option>
                                <option value="entrances_exits">Entradas/Salidas</option>
                                <option value="specialized_area">Áreas Especializadas</option>
                                <option value="notifications">Notificaciones</option>
                            </select>
                        </div>

                        {/* Fecha inicio */}
                        <div className="col-md-2">
                            <label className="form-label">Fecha inicio</label>
                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        {/* Fecha fin */}
                        <div className="col-md-2">
                            <label className="form-label">Fecha fin</label>
                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-3">
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleClearFilters}
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Limpiar Filtros
                        </button>
                        <span className="ms-3 text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            {totalRecords} registros encontrados
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabla de Auditorías */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span>
                        <i className="bi bi-list-ul me-2"></i>
                        Registros de Auditoría
                    </span>
                    <div>
                        <label className="me-2">Registros por página:</label>
                        <select
                            className="form-select form-select-sm d-inline-block w-auto"
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
                <div className="card-body p-0">
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox display-1 text-muted"></i>
                            <p className="mt-3 text-muted">No se encontraron registros de auditoría</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-striped mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '60px' }}>ID</th>
                                        <th style={{ width: '140px' }}>Fecha</th>
                                        <th style={{ width: '150px' }}>Tipo</th>
                                        <th style={{ width: '100px' }}>Acción</th>
                                        <th style={{ width: '120px' }}>Entidad</th>
                                        <th style={{ width: '150px' }}>Usuario</th>
                                        <th>Observaciones</th>
                                        <th style={{ width: '120px' }} className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => (
                                        <>
                                            <tr key={record.id} className={expandedRows.has(record.id) ? 'table-active' : ''}>
                                                <td>
                                                    <code>#{record.id}</code>
                                                </td>
                                                <td>
                                                    <small>{formatDateTime(record.create_at)}</small>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info text-dark">
                                                        {getTypeLabel(record.ar_type)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        record.ar_action === AuditAction.CREATE ? 'bg-success' :
                                                        record.ar_action === AuditAction.UPDATE ? 'bg-warning text-dark' :
                                                        record.ar_action === AuditAction.DELETE ? 'bg-danger' :
                                                        record.ar_action === AuditAction.LOGIN ? 'bg-primary' :
                                                        'bg-secondary'
                                                    }`}>
                                                        {getActionLabel(record.ar_action)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-secondary">
                                                        {record.ar_entity_name}
                                                        {record.ar_entity_id && (
                                                            <span className="ms-1">#{record.ar_entity_id}</span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div>
                                                        <i className="bi bi-person-circle me-1"></i>
                                                        {record.user_name || 'N/A'}
                                                    </div>
                                                    {record.user_email && (
                                                        <small className="text-muted">{record.user_email}</small>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="text-truncate" style={{ maxWidth: '250px' }}>
                                                        {record.ar_observations || <span className="text-muted">Sin observaciones</span>}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-info me-1"
                                                        onClick={() => toggleRowExpansion(record.id)}
                                                        title={expandedRows.has(record.id) ? 'Ocultar detalles' : 'Ver detalles'}
                                                    >
                                                        <i className={`bi bi-chevron-${expandedRows.has(record.id) ? 'up' : 'down'}`}></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleView(record)}
                                                        title="Ver completo"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Fila expandida con detalles */}
                                            {expandedRows.has(record.id) && (
                                                <tr key={`${record.id}-expanded`} className="table-active">
                                                    <td colSpan={8}>
                                                        <div className="p-3">
                                                            <div className="row g-3">
                                                                {/* Valor Anterior */}
                                                                {record.ar_old_value && (
                                                                    <div className="col-md-6">
                                                                        <h6 className="text-danger">
                                                                            <i className="bi bi-file-earmark-minus me-1"></i>
                                                                            Valor Anterior
                                                                        </h6>
                                                                        <pre className="bg-light p-2 rounded" style={{ maxHeight: '150px', overflow: 'auto', fontSize: '0.85rem' }}>
                                                                            {JSON.stringify(parseJsonValue(record.ar_old_value), null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {/* Valor Nuevo */}
                                                                {record.ar_new_value && (
                                                                    <div className="col-md-6">
                                                                        <h6 className="text-success">
                                                                            <i className="bi bi-file-earmark-plus me-1"></i>
                                                                            Valor Nuevo
                                                                        </h6>
                                                                        <pre className="bg-light p-2 rounded" style={{ maxHeight: '150px', overflow: 'auto', fontSize: '0.85rem' }}>
                                                                            {JSON.stringify(parseJsonValue(record.ar_new_value), null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {/* Info técnica */}
                                                            <div className="row mt-3 g-2">
                                                                {record.ar_ip_address && (
                                                                    <div className="col-auto">
                                                                        <span className="badge bg-light text-dark">
                                                                            <i className="bi bi-geo-alt me-1"></i>
                                                                            IP: {record.ar_ip_address}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {record.ar_duration_seconds && (
                                                                    <div className="col-auto">
                                                                        <span className="badge bg-light text-dark">
                                                                            <i className="bi bi-clock me-1"></i>
                                                                            Duración: {record.ar_duration_seconds}s
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {record.ar_user_agent && (
                                                                    <div className="col-12 mt-2">
                                                                        <small className="text-muted">
                                                                            <i className="bi bi-laptop me-1"></i>
                                                                            <strong>User Agent:</strong> {record.ar_user_agent}
                                                                        </small>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="card-footer">
                        <nav>
                            <ul className="pagination pagination-sm mb-0 justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </li>

                                {/* Páginas */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <li
                                            key={pageNum}
                                            className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        </li>
                                    );
                                })}

                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                        <div className="text-center mt-2">
                            <small className="text-muted">
                                Página {currentPage} de {totalPages} ({totalRecords} registros totales)
                            </small>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
