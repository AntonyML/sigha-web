import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditFlow } from '../../../infrastructure/flows/auditFlow';
import type { DigitalRecord, AuditAction, SearchDigitalRecordsDto } from '../../../types/audit';

export default function AuditListPage() {
    const [records, setRecords] = useState<DigitalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<AuditAction | 'ALL'>('ALL');
    const [filterTable, setFilterTable] = useState<string | 'ALL'>('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const navigate = useNavigate();

    // Cargar registros al montar el componente o cuando cambien los filtros
    useEffect(() => {
        loadRecords();
    }, [currentPage, pageSize, filterAction, filterTable, startDate, endDate]);

    const loadRecords = async () => {
        setLoading(true);
        setError('');

        try {
            const params: SearchDigitalRecordsDto = {
                page: currentPage,
                limit: pageSize,
            };

            if (filterAction !== 'ALL') {
                params.action = filterAction;
            }

            if (filterTable !== 'ALL') {
                params.tableName = filterTable;
            }

            if (startDate) {
                params.startDate = startDate;
            }

            if (endDate) {
                params.endDate = endDate;
            }

            const result = await auditFlow.searchDigitalRecords(params);

            if (result.success && result.records) {
                setRecords(result.records);
                setTotalRecords(result.total || 0);
                setTotalPages(result.totalPages || 1);
            } else {
                setError(result.error || 'Error al cargar registros de auditoría');
            }
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
            (record.description || '').toLowerCase().includes(term) ||
            record.userName.toLowerCase().includes(term) ||
            record.action.toLowerCase().includes(term) ||
            (record.tableName || '').toLowerCase().includes(term)
        );
    });

    const handleView = (record: DigitalRecord) => {
        navigate(`/audits/view/${record.id}`);
    };

    const handleExport = async () => {
        const params: SearchDigitalRecordsDto = {
            action: filterAction !== 'ALL' ? filterAction : undefined,
            tableName: filterTable !== 'ALL' ? filterTable : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        };

        const result = await auditFlow.exportDigitalRecords(params, 'auditorias.csv');

        if (result.success) {
            alert(result.message || 'Auditorías exportadas exitosamente');
        } else {
            alert(result.error || 'Error al exportar auditorías');
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterAction('ALL');
        setFilterTable('ALL');
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
                                    placeholder="Buscar por descripción, usuario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtro por Acción */}
                        <div className="col-md-2">
                            <label className="form-label">Acción</label>
                            <select
                                className="form-select"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value as AuditAction | 'ALL')}
                            >
                                <option value="ALL">Todas</option>
                                <option value="login">Inicio sesión</option>
                                <option value="logout">Cierre sesión</option>
                                <option value="create">Creación</option>
                                <option value="update">Actualización</option>
                                <option value="delete">Eliminación</option>
                                <option value="view">Visualización</option>
                                <option value="export">Exportación</option>
                                <option value="other">Otra</option>
                            </select>
                        </div>

                        {/* Filtro por Tabla */}
                        <div className="col-md-2">
                            <label className="form-label">Tabla</label>
                            <select
                                className="form-select"
                                value={filterTable}
                                onChange={(e) => setFilterTable(e.target.value)}
                            >
                                <option value="ALL">Todas</option>
                                <option value="users">Usuarios</option>
                                <option value="roles">Roles</option>
                                <option value="older_adult">Adultos Mayores</option>
                                <option value="older_adult_family">Familiares</option>
                                <option value="programs">Programas</option>
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
                                        <th style={{ width: '80px' }}>ID</th>
                                        <th style={{ width: '150px' }}>Fecha</th>
                                        <th style={{ width: '120px' }}>Acción</th>
                                        <th style={{ width: '150px' }}>Tabla</th>
                                        <th style={{ width: '100px' }}>ID Registro</th>
                                        <th style={{ width: '150px' }}>Usuario</th>
                                        <th>Descripción</th>
                                        <th style={{ width: '100px' }} className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id}>
                                            <td>
                                                <code>#{record.id}</code>
                                            </td>
                                            <td>
                                                <small>{auditFlow.formatAuditDate(record.timestamp)}</small>
                                            </td>
                                            <td>
                                                <span className={`badge ${auditFlow.getActionBadgeClass(record.action)}`}>
                                                    {auditFlow.getActionIcon(record.action)} {auditFlow.getActionLabel(record.action)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {auditFlow.getTableLabel(record.tableName)}
                                                </span>
                                            </td>
                                            <td>
                                                {record.recordId ? (
                                                    <code className="text-primary">#{record.recordId}</code>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td>
                                                <span>
                                                    <i className="bi bi-person-circle me-1"></i>
                                                    {record.userName}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: '300px' }}>
                                                    {record.description || <span className="text-muted">Sin descripción</span>}
                                                </div>
                                                {auditFlow.isCriticalAudit(record) && (
                                                    <span className="badge bg-warning text-dark ms-2">
                                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                                        Crítico
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleView(record)}
                                                    title="Ver detalles"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
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
