import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { securityAuditService } from '../../../services/securityAuditService';
import type { SecurityEvent } from '../../../types/securityAudit';

const severityBadge: Record<string, string> = {
  low: 'bg-success',
  medium: 'bg-warning text-dark',
  high: 'bg-danger',
  critical: 'bg-danger',
};

const statusBadge: Record<string, string> = {
  pending: 'bg-warning text-dark',
  resolved: 'bg-success',
  investigating: 'bg-info text-dark',
  false_positive: 'bg-secondary',
};

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  resolved: 'Resuelto',
  investigating: 'Investigando',
  false_positive: 'Falso Positivo',
};

export default function SecurityAuditPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const navigate = useNavigate();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await securityAuditService.getSecurityEvents({
        status: filterStatus !== 'ALL' ? filterStatus as never : undefined,
        severity: filterSeverity !== 'ALL' ? filterSeverity as never : undefined,
      });
      setEvents(data.events ?? data as unknown as SecurityEvent[]);
    } catch (err) {
      console.error('Error loading security events:', err);
      setError('Error al cargar los eventos de seguridad');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterSeverity]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filtered = events.filter((e) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.event_type?.toLowerCase().includes(term) ||
      e.description?.toLowerCase().includes(term) ||
      e.ip_address?.toLowerCase().includes(term)
    );
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-shield-exclamation me-2 text-danger"></i>
          Auditoría de Seguridad
        </h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/audits')}>
          <i className="bi bi-arrow-left me-2"></i>Regresar
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por tipo, descripción, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="ALL">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="resolved">Resuelto</option>
                <option value="investigating">Investigando</option>
                <option value="false_positive">Falso Positivo</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                <option value="ALL">Toda severidad</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-secondary w-100"
                onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); setFilterSeverity('ALL'); }}
              >
                <i className="bi bi-x-circle me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status" />
          <p className="mt-2 text-muted">Cargando eventos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-shield-check fs-1 d-block mb-2"></i>
          No se encontraron eventos de seguridad
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tipo de Evento</th>
                  <th>Descripción</th>
                  <th>IP</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr key={event.id}>
                    <td><code className="text-danger">{event.event_type}</code></td>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>{event.description || <span className="text-muted">—</span>}</td>
                    <td><small className="text-muted">{event.ip_address || '—'}</small></td>
                    <td>
                      <span className={`badge ${severityBadge[event.severity] ?? 'bg-secondary'}`}>
                        {event.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusBadge[event.status] ?? 'bg-secondary'}`}>
                        {statusLabel[event.status] ?? event.status}
                      </span>
                    </td>
                    <td><small>{event.created_at ? formatDate(event.created_at) : '—'}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer text-muted small">
            {filtered.length} evento(s) encontrado(s)
          </div>
        </div>
      )}
    </div>
  );
}
