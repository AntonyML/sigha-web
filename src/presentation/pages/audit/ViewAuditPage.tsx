import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditFlow } from '../../../infrastructure/flows/auditFlow';
import type { Audit, AuditChangeSummary } from '../../../types/audit';

export default function ViewAuditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [audit, setAudit] = useState<Audit | null>(null);
    const [changeSummary, setChangeSummary] = useState<AuditChangeSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const result = await auditFlow.getAuditById(Number(id));

                if (result.success && result.audit) {
                    setAudit(result.audit);

                    // Generar resumen de cambios si existen valores antiguos/nuevos
                    if (result.audit.aOldValues && result.audit.aNewValues) {
                        const changes = auditFlow.getChangeSummary(
                            result.audit.aOldValues,
                            result.audit.aNewValues
                        );
                        setChangeSummary(changes);
                    }
                } else {
                    setError(result.error || 'Error al cargar registro de auditoría');
                }
            } catch (err) {
                console.error('Error cargando auditoría:', err);
                setError('Error inesperado al cargar el registro');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleExportSingle = async () => {
        if (!audit) return;

        const result = await auditFlow.exportAudits(
            { entityId: audit.id },
            `auditoria_${audit.id}.csv`
        );

        if (result.success) {
            alert(result.message || 'Registro exportado exitosamente');
        } else {
            alert(result.error || 'Error al exportar registro');
        }
    };

    const renderJsonValue = (value: Record<string, any> | null) => {
        if (!value) return <span className="text-muted">Sin datos</span>;

        return (
            <pre className="bg-light p-3 rounded border" style={{ fontSize: '0.85rem', maxHeight: '300px', overflow: 'auto' }}>
                {JSON.stringify(value, null, 2)}
            </pre>
        );
    };

    if (!id) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <i className="bi bi-exclamation-triangle display-1 text-warning mb-3 d-block"></i>
                    <h3 className="mb-3">ID no proporcionado</h3>
                    <p className="text-muted mb-4">No se encontró el identificador del registro.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/audits')}>
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
                    <p className="text-muted fw-medium">Cargando información del registro...</p>
                </div>
            </div>
        );
    }

    if (error || !audit) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-5 text-center">
                                    <i className="bi bi-exclamation-circle display-1 text-danger mb-3 d-block"></i>
                                    <h4 className="mb-3">Error al cargar registro</h4>
                                    <p className="text-muted mb-4">{error || 'No se pudo cargar la información del registro'}</p>
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button className="btn btn-outline-secondary" onClick={() => navigate('/audits')}>
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

    const isCritical = auditFlow.isCriticalAudit(audit);

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                        <i className="bi bi-shield-check text-primary fs-3"></i>
                                    </div>
                                    <div>
                                        <h1 className="h3 fw-bold mb-1">Registro de Auditoría #{audit.id}</h1>
                                        <p className="text-muted mb-0">
                                            {auditFlow.formatAuditDate(audit.createAt)}
                                            {isCritical && (
                                                <span className="badge bg-warning text-dark ms-2">
                                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                                    Crítico
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate('/audits/list')}>
                                    <i className="bi bi-arrow-left"></i>
                                    Volver a Lista
                                </button>
                                <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => navigate('/audits')}>
                                    <i className="bi bi-menu-button"></i>
                                    Menú Auditoría
                                </button>
                                <button className="btn btn-success d-flex align-items-center gap-2" onClick={handleExportSingle}>
                                    <i className="bi bi-download"></i>
                                    Exportar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Card 1: Información General */}
                    <div className="col-12 col-lg-6">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="mb-0">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Información General
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">ID</label>
                                        <p className="mb-0">
                                            <code className="fs-6">#{audit.id}</code>
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Acción</label>
                                        <p className="mb-0">
                                            <span className={`badge ${auditFlow.getActionBadgeClass(audit.aAction)} fs-6`}>
                                                {auditFlow.getActionLabel(audit.aAction)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Entidad Afectada</label>
                                        <p className="mb-0">
                                            <span className="badge bg-secondary fs-6">
                                                {auditFlow.getEntityLabel(audit.aEntity)}
                                            </span>
                                            {audit.aEntityId && (
                                                <span className="ms-2 text-muted">
                                                    (ID: {audit.aEntityId})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Usuario</label>
                                        <p className="mb-0">
                                            {audit.aUsername ? (
                                                <span>
                                                    <i className="bi bi-person-circle me-2"></i>
                                                    {audit.aUsername}
                                                    {audit.aUserId && (
                                                        <span className="text-muted ms-2">(ID: {audit.aUserId})</span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-muted">
                                                    <i className="bi bi-dash-circle me-2"></i>
                                                    Sistema / No identificado
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Fecha y Hora</label>
                                        <p className="mb-0">
                                            <i className="bi bi-calendar-event me-2"></i>
                                            {auditFlow.formatAuditDate(audit.createAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Metadata Técnica */}
                    <div className="col-12 col-lg-6">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="mb-0">
                                    <i className="bi bi-hdd-network me-2"></i>
                                    Información Técnica
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Dirección IP</label>
                                        <p className="mb-0">
                                            {audit.aIpAddress ? (
                                                <code className="fs-6">{audit.aIpAddress}</code>
                                            ) : (
                                                <span className="text-muted">No registrada</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">User Agent</label>
                                        <p className="mb-0">
                                            {audit.aUserAgent ? (
                                                <small className="text-break">{audit.aUserAgent}</small>
                                            ) : (
                                                <span className="text-muted">No registrado</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Descripción Completa</label>
                                        <div className="bg-light p-3 rounded border">
                                            <p className="mb-0 text-break">{audit.aDescription}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Valores Antiguos */}
                    {audit.aOldValues && (
                        <div className="col-12 col-lg-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0">
                                        <i className="bi bi-clock-history me-2"></i>
                                        Valores Antiguos
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {renderJsonValue(audit.aOldValues)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card 4: Valores Nuevos */}
                    {audit.aNewValues && (
                        <div className="col-12 col-lg-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0">
                                        <i className="bi bi-arrow-clockwise me-2"></i>
                                        Valores Nuevos
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {renderJsonValue(audit.aNewValues)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card 5: Comparación de Cambios */}
                    {changeSummary.length > 0 && (
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0">
                                        <i className="bi bi-arrow-left-right me-2"></i>
                                        Comparación de Cambios
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover table-bordered mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '25%' }}>Campo</th>
                                                    <th style={{ width: '37.5%' }}>Valor Anterior</th>
                                                    <th style={{ width: '37.5%' }}>Valor Nuevo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {changeSummary.map((change, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <strong>{change.field}</strong>
                                                        </td>
                                                        <td>
                                                            {change.oldValue ? (
                                                                <span className="text-danger">
                                                                    <i className="bi bi-dash-circle me-2"></i>
                                                                    {String(change.oldValue)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">Sin valor</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {change.newValue ? (
                                                                <span className="text-success">
                                                                    <i className="bi bi-plus-circle me-2"></i>
                                                                    {String(change.newValue)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">Sin valor</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sin cambios detectados */}
                    {!audit.aOldValues && !audit.aNewValues && (
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center py-5">
                                    <i className="bi bi-info-circle display-3 text-muted mb-3 d-block"></i>
                                    <h5 className="text-muted">No se registraron cambios de valores</h5>
                                    <p className="text-muted mb-0">
                                        Esta acción no involucró modificaciones en los datos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
