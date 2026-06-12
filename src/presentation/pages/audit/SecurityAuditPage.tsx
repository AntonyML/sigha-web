import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditService, type DigitalRecord } from '../../../services/auditService';

const severityBadge: Record<string, string> = {
  create: 'bg-success',
  update: 'bg-info text-dark',
  delete: 'bg-danger',
  view: 'bg-secondary',
  login: 'bg-primary',
  logout: 'bg-warning text-dark',
  export: 'bg-warning text-dark',
  other: 'bg-light text-dark',
};

const severityLabel: Record<string, string> = {
  create: 'Creación',
  update: 'Actualización',
  delete: 'Eliminación',
  view: 'Consulta',
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  export: 'Exportación',
  other: 'Otro',
};

export default function SecurityAuditPage() {
  const [events, setEvents] = useState<DigitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const navigate = useNavigate();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await auditService.searchAuditRecords({ limit: 200 });
      setEvents(data.records ?? []);
    } catch (err) {
      console.error('Error loading security events:', err);
      setError('Error al cargar los eventos de auditoría');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filtered = events
    .filter((e) => ['login', 'logout', 'create', 'update', 'delete'].includes(e.action ?? ''))
    .filter((e) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        e.action?.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term) ||
        e.userName?.toLowerCase().includes(term) ||
        e.ipAddress?.toLowerCase().includes(term)
      );
    })
    .filter((e) => filterSeverity === 'ALL' || e.action === filterSeverity);

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
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por acción, usuario, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                <option value="ALL">Toda acción</option>
                <option value="login">Inicio de sesión</option>
                <option value="logout">Cierre de sesión</option>
                <option value="create">Creación</option>
                <option value="update">Actualización</option>
                <option value="delete">Eliminación</option>
              </select>
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-secondary w-100"
                onClick={() => { setSearchTerm(''); setFilterSeverity('ALL'); }}
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
                  <th>Acción</th>
                  <th>Descripción</th>
                  <th>Usuario</th>
                  <th>IP</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className={`badge ${severityBadge[event.action ?? 'other'] ?? 'bg-secondary'}`}>
                        {severityLabel[event.action ?? 'other'] ?? event.action}
                      </span>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: '300px' }}>{event.description || <span className="text-muted">—</span>}</td>
                    <td><small>{event.userName ?? event.userId ?? '—'}</small></td>
                    <td><small className="text-muted">{event.ipAddress || '—'}</small></td>
                    <td><small>{event.timestamp ? formatDate(event.timestamp) : '—'}</small></td>
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
