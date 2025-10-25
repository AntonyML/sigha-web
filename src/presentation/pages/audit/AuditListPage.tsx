import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditFlow } from '../../../infrastructure/flows/auditFlow';
import { Icon } from '../../components/atoms';
import type { DigitalRecord, SearchDigitalRecordsDto, AuditActionType } from '../../../types/audit';
import { AuditAction } from '../../../types/audit';

export default function AuditListPage() {
    const [records, setRecords] = useState<DigitalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<AuditAction | 'ALL'>('ALL');
    const [filterTable, setFilterTable] = useState<string>('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const navigate = useNavigate();

    useEffect(() => {
        loadRecords();
    }, [currentPage, pageSize, filterAction, filterTable, startDate, endDate]);

    const loadRecords = async () => {
        setLoading(true);
        setError('');

        const params: SearchDigitalRecordsDto = {
            page: currentPage,
            limit: pageSize,
            action: filterAction !== 'ALL' ? (filterAction as AuditActionType) : undefined,
            tableName: filterTable !== 'ALL' ? filterTable : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        };

        const result = await auditFlow.searchDigitalRecords(params);
        
        if (result.success) {
            setRecords(result.records || []);
            setTotalRecords(result.total || 0);
            setTotalPages(result.totalPages || 1);
        } else {
            setError(result.error || 'Error al cargar auditorías');
            setRecords([]);
        }
        
        setLoading(false);
    };

    const filteredRecords = records.filter(record => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            (record.description || '').toLowerCase().includes(term) ||
            (record.userName || '').toLowerCase().includes(term) ||
            (record.userEmail || '').toLowerCase().includes(term) ||
            record.action.toLowerCase().includes(term) ||
            (record.tableName || '').toLowerCase().includes(term)
        );
    });

    const handleView = (record: DigitalRecord) => {
        navigate(`/audits/view/${record.id}`);
    };

    const handleExport = async () => {
        const result = await auditFlow.exportDigitalRecords({
            action: filterAction !== 'ALL' ? (filterAction as AuditActionType) : undefined,
            tableName: filterTable !== 'ALL' ? filterTable : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }, 'auditorias.csv');
        
        if (!result.success) {
            setError(result.error || 'Error al exportar auditorías');
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>
                        <Icon name="shield" size="lg" className="me-2" />
                        Auditoría del Sistema
                    </h2>
                </div>
                <div>
                    <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/audits')}>
                        <Icon name="arrow_back" size="sm" className="me-2" />
                        Volver
                    </button>
                    <button className="btn btn-primary me-2" onClick={() => navigate('/audits/dashboard')}>
                        <Icon name="dashboard" size="sm" className="me-2" />
                        Dashboard
                    </button>
                    <button className="btn btn-success" onClick={handleExport}>
                        <Icon name="download" size="sm" className="me-2" />
                        Exportar CSV
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

            {/* Filtros */}
            <div className="card mb-4">
                <div className="card-header">
                    <Icon name="filter_list" size="sm" className="me-2" />
                    Filtros de Búsqueda
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Búsqueda</label>
                            <input type="text" className="form-control" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Acción</label>
                            <select className="form-select" value={filterAction} onChange={(e) => setFilterAction(e.target.value as AuditAction | 'ALL')}>
                                <option value="ALL">Todas</option>
                                <option value={AuditAction.LOGIN}>Login</option>
                                <option value={AuditAction.LOGOUT}>Logout</option>
                                <option value={AuditAction.CREATE}>Crear</option>
                                <option value={AuditAction.UPDATE}>Actualizar</option>
                                <option value={AuditAction.DELETE}>Eliminar</option>
                                <option value={AuditAction.VIEW}>Ver</option>
                                <option value={AuditAction.EXPORT}>Exportar</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Tabla</label>
                            <select className="form-select" value={filterTable} onChange={(e) => setFilterTable(e.target.value)}>
                                <option value="ALL">Todas</option>
                                <option value="users">Usuarios</option>
                                <option value="roles">Roles</option>
                                <option value="older_adult">Adultos Mayores</option>
                                <option value="clinical_history">Historia Clínica</option>
                                <option value="entrances_exits">Entradas/Salidas</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Fecha inicio</label>
                            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Fecha fin</label>
                            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <button className="btn btn-secondary btn-sm" onClick={handleClearFilters}>
                            <Icon name="close" size="sm" className="me-2" />
                            Limpiar
                        </button>
                        <span className="ms-3 text-muted">{totalRecords} registros encontrados</span>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card">
                <div className="card-header d-flex justify-content-between">
                    <span><Icon name="list" size="sm" className="me-2" />Registros de Auditoría</span>
                    <select className="form-select form-select-sm w-auto" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
                <div className="card-body p-0">
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-5">
                            <Icon name="inbox" size="xl" className="display-1 text-muted" />
                            <p className="mt-3 text-muted">No se encontraron registros</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-striped mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Acción</th>
                                        <th>Tabla</th>
                                        <th>Usuario</th>
                                        <th>Descripción</th>
                                        <th>Ver</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id}>
                                            <td><code>#{record.id}</code></td>
                                            <td><small>{auditFlow.formatAuditDate(record.timestamp)}</small></td>
                                            <td>
                                                <span className={`badge ${auditFlow.getActionBadgeClass(record.action)}`}>
                                                    {auditFlow.getActionIcon(record.action)} {auditFlow.getActionLabel(record.action)}
                                                </span>
                                            </td>
                                            <td><span className="badge bg-secondary">{auditFlow.getTableLabel(record.tableName)}</span></td>
                                            <td>
                                                <div><Icon name="person" size="sm" className="me-1" />{record.userName}</div>
                                                {record.userEmail && <small className="text-muted">{record.userEmail}</small>}
                                            </td>
                                            <td><div className="text-truncate" style={{ maxWidth: '300px' }}>{record.description || 'Sin descripción'}</div></td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleView(record)}>
                                                    <Icon name="visibility" size="sm" />
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
                                    <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                                        <Icon name="chevron_left" size="sm" />
                                    </button>
                                </li>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5) {
                                        if (currentPage <= 3) pageNum = i + 1;
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
                                        </li>
                                    );
                                })}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                                        <Icon name="chevron_right" size="sm" />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                        <div className="text-center mt-2">
                            <small className="text-muted">Página {currentPage} de {totalPages} ({totalRecords} registros)</small>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
