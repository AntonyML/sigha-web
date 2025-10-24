import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditService } from '../../../services/auditService';
import type { AuditReport } from '../../../types/audit';
import { AuditReportType, AuditAction } from '../../../types/audit';

export default function ViewAuditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [record, setRecord] = useState<AuditReport | null>(null);
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
                const result = await auditService.getAuditReportById(Number(id));
                setRecord(result);
            } catch (err) {
                console.error('Error cargando auditoría:', err);
                setError('Error inesperado al cargar el registro');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

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
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
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

    const handleExportSingle = async () => {
        if (!record) return;

        try {
            const csvContent = [
                ['Campo', 'Valor'].join(','),
                ['ID', record.id].join(','),
                ['Tipo', getTypeLabel(record.ar_type)].join(','),
                ['Acción', getActionLabel(record.ar_action)].join(','),
                ['Entidad', record.ar_entity_name].join(','),
                ['ID Entidad', record.ar_entity_id || 'N/A'].join(','),
                ['Usuario', record.user_name || 'N/A'].join(','),
                ['Email', record.user_email || 'N/A'].join(','),
                ['Observaciones', `"${record.ar_observations || 'N/A'}"`].join(','),
                ['IP', record.ar_ip_address || 'N/A'].join(','),
                ['Fecha', formatDateTime(record.create_at)].join(','),
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `auditoria_${record.id}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);

            alert('Registro exportado exitosamente');
        } catch (err) {
            console.error('Error exportando registro:', err);
            alert('Error al exportar registro');
        }
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
                                            {formatDateTime(record.create_at)}
                                            {(record.ar_action === AuditAction.DELETE || record.ar_type === AuditReportType.PASSWORD_RESETS) && (
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
                                        <label className="text-muted small fw-semibold">Tipo de Auditoría</label>
                                        <p className="mb-0">
                                            <span className="badge bg-info text-dark fs-6">
                                                {getTypeLabel(record.ar_type)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Acción</label>
                                        <p className="mb-0">
                                            <span className={`badge fs-6 ${
                                                record.ar_action === AuditAction.CREATE ? 'bg-success' :
                                                record.ar_action === AuditAction.UPDATE ? 'bg-warning text-dark' :
                                                record.ar_action === AuditAction.DELETE ? 'bg-danger' :
                                                record.ar_action === AuditAction.LOGIN ? 'bg-primary' :
                                                'bg-secondary'
                                            }`}>
                                                {getActionLabel(record.ar_action)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Entidad Afectada</label>
                                        <p className="mb-0">
                                            <span className="badge bg-secondary fs-6">
                                                {record.ar_entity_name}
                                            </span>
                                            {record.ar_entity_id && (
                                                <span className="ms-2 text-muted">
                                                    (ID: <code>#{record.ar_entity_id}</code>)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Usuario</label>
                                        <p className="mb-0">
                                            <span>
                                                <i className="bi bi-person-circle me-2"></i>
                                                {record.user_name || 'N/A'}
                                            </span>
                                            {record.user_email && (
                                                <>
                                                    <br />
                                                    <small className="text-muted">{record.user_email}</small>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Observaciones</label>
                                        <p className="mb-0">
                                            {record.ar_observations || <span className="text-muted fst-italic">Sin observaciones</span>}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-semibold">Fecha y Hora</label>
                                        <p className="mb-0">
                                            <i className="bi bi-calendar-event me-2"></i>
                                            {formatDateTime(record.create_at)}
                                        </p>
                                    </div>
                                    {record.ar_duration_seconds && (
                                        <div className="col-12">
                                            <label className="text-muted small fw-semibold">Duración</label>
                                            <p className="mb-0">
                                                <i className="bi bi-clock me-2"></i>
                                                {record.ar_duration_seconds} segundos
                                            </p>
                                        </div>
                                    )}
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
                                    {record.ar_ip_address && (
                                        <div className="col-12">
                                            <label className="text-muted small fw-semibold">Dirección IP</label>
                                            <p className="mb-0">
                                                <i className="bi bi-geo-alt me-2"></i>
                                                <code>{record.ar_ip_address}</code>
                                            </p>
                                        </div>
                                    )}
                                    {record.ar_user_agent && (
                                        <div className="col-12">
                                            <label className="text-muted small fw-semibold">User Agent</label>
                                            <p className="mb-0 text-break">
                                                <i className="bi bi-laptop me-2"></i>
                                                <small className="text-muted">{record.ar_user_agent}</small>
                                            </p>
                                        </div>
                                    )}
                                    {record.ar_audit_number && (
                                        <div className="col-12">
                                            <label className="text-muted small fw-semibold">Número de Auditoría</label>
                                            <p className="mb-0">
                                                <code>{record.ar_audit_number}</code>
                                            </p>
                                        </div>
                                    )}
                                    {record.id_generator && (
                                        <div className="col-12">
                                            <label className="text-muted small fw-semibold">ID Generador</label>
                                            <p className="mb-0">
                                                <code>{record.id_generator}</code>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Cambios Realizados (Valor Anterior vs Nuevo) */}
                    {(record.ar_old_value || record.ar_new_value) && (
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0">
                                        <i className="bi bi-arrow-left-right me-2"></i>
                                        Cambios Realizados
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-4">
                                        {record.ar_old_value && (
                                            <div className="col-12 col-md-6">
                                                <h6 className="text-danger mb-3">
                                                    <i className="bi bi-file-earmark-minus me-2"></i>
                                                    Valor Anterior
                                                </h6>
                                                <pre className="bg-light p-3 rounded border" style={{ maxHeight: '300px', overflow: 'auto', fontSize: '0.85rem' }}>
                                                    {JSON.stringify(parseJsonValue(record.ar_old_value), null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {record.ar_new_value && (
                                            <div className="col-12 col-md-6">
                                                <h6 className="text-success mb-3">
                                                    <i className="bi bi-file-earmark-plus me-2"></i>
                                                    Valor Nuevo
                                                </h6>
                                                <pre className="bg-light p-3 rounded border" style={{ maxHeight: '300px', overflow: 'auto', fontSize: '0.85rem' }}>
                                                    {JSON.stringify(parseJsonValue(record.ar_new_value), null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
