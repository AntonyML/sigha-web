import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditFlow } from '../../../infrastructure/flows/auditFlow';
import type { DigitalRecord } from '../../../types/audit';

export default function ViewAuditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [record, setRecord] = useState<DigitalRecord | null>(null);
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

            const result = await auditFlow.getDigitalRecordById(Number(id));
            
            if (result.success && result.record) {
                setRecord(result.record);
            } else {
                setError(result.error || 'No se pudo cargar la información del registro');
            }
            
            setLoading(false);
        };

        loadData();
    }, [id]);

    const handleExportSingle = async () => {
        if (!record) return;

        const csvContent = [
            ['Campo', 'Valor'].join(','),
            ['ID', record.id].join(','),
            ['Acción', auditFlow.getActionLabel(record.action)].join(','),
            ['Tabla', auditFlow.getTableLabel(record.tableName || '')].join(','),
            ['Usuario', record.userName || 'N/A'].join(','),
            ['Email', record.userEmail || 'N/A'].join(','),
            ['Descripción', `"${record.description || 'N/A'}"`].join(','),
            ['Fecha', auditFlow.formatAuditDate(record.timestamp)].join(','),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auditoria_${record.id}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
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

    if (error || !record) {
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
                                        <h1 className="h3 fw-bold mb-1">Registro de Auditoría #{record.id}</h1>
                                        <p className="text-muted mb-0">
                                            {auditFlow.formatAuditDate(record.timestamp)}
                                            {auditFlow.isCriticalAudit(record) && (
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
                                            <code className="fs-6">#{record.id}</code>
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Acción</label>
                                        <p className="mb-0">
                                            <span className={`badge fs-6 ${auditFlow.getActionBadgeClass(record.action)}`}>
                                                {auditFlow.getActionIcon(record.action)} {auditFlow.getActionLabel(record.action)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Tabla Afectada</label>
                                        <p className="mb-0">
                                            <span className="badge bg-secondary fs-6">
                                                {auditFlow.getTableLabel(record.tableName || '')}
                                            </span>
                                            {record.recordId && (
                                                <span className="ms-2 text-muted">
                                                    (ID: <code>#{record.recordId}</code>)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Usuario</label>
                                        <p className="mb-0">
                                            <span>
                                                <i className="bi bi-person-circle me-2"></i>
                                                {record.userName || 'N/A'}
                                            </span>
                                            {record.userEmail && (
                                                <>
                                                    <br />
                                                    <small className="text-muted">{record.userEmail}</small>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Descripción</label>
                                        <p className="mb-0">
                                            {record.description || <span className="text-muted fst-italic">Sin descripción</span>}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Fecha y Hora</label>
                                        <p className="mb-0">
                                            <i className="bi bi-calendar-event me-2"></i>
                                            {auditFlow.formatAuditDate(record.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Información Técnica */}
                    <div className="col-12 col-lg-6">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="mb-0">
                                    <i className="bi bi-gear me-2"></i>
                                    Información Técnica
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {record.userId && (
                                        <div className="col-12">
                                            <label className="text-muted small fw-semibold">ID Usuario</label>
                                            <p className="mb-0">
                                                <code>#{record.userId}</code>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
