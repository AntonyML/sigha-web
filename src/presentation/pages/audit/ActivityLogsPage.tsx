import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityLogsService } from '../../../services/activityLogsService';
import type { ActivityLog } from '../../../types/activityLog';

const severityBadge: Record<string, string> = {
  low: 'bg-success',
  medium: 'bg-warning text-dark',
  high: 'bg-danger',
  critical: 'bg-danger',
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await activityLogsService.getActivityLogs({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(data.logs ?? []);
    } catch (err) {
      console.error('Error loading activity logs:', err);
      setError('Error al cargar los registros de actividad');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filtered = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.activityType?.toLowerCase().includes(term) ||
      log.entityType?.toLowerCase().includes(term) ||
      log.description?.toLowerCase().includes(term) ||
      log.ipAddress?.toLowerCase().includes(term)
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
          <i className="bi bi-journal-text me-2 text-secondary"></i>
          Registros de Actividad
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
                  placeholder="Buscar por acción, entidad, usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Fecha inicio"
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Fecha fin"
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-secondary w-100"
                onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); }}
              >
                <i className="bi bi-x-circle me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status" />
          <p className="mt-2 text-muted">Cargando registros...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
          No se encontraron registros de actividad
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>Usuario</th>
                  <th>IP</th>
                  <th>Severidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td><code className="text-primary">{log.activityType}</code></td>
                    <td>{log.entityType ? <><small className="text-muted">({log.entityType})</small></> : <span className="text-muted">—</span>}</td>
                    <td><small className="text-muted">{log.userId ?? '—'}</small></td>
                    <td><small className="text-muted">{log.ipAddress || '—'}</small></td>
                    <td>
                      <span className={`badge ${severityBadge[log.severity] ?? 'bg-secondary'}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td><small>{log.createdAt ? formatDate(log.createdAt) : '—'}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer text-muted small">
            Mostrando {filtered.length} de {logs.length} registros
          </div>
        </div>
      )}
    </div>
  );
}
