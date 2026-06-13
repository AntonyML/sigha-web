import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { olderAdultUpdatesService, type OlderAdultUpdateApi } from '../../../services/olderAdultUpdatesService';

export default function OlderAdultUpdatesListPage() {
  const [items, setItems] = useState<OlderAdultUpdateApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await olderAdultUpdatesService.getAll()); }
    catch { setError('Error al cargar historial de cambios'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => {
    if (!search.trim()) return true;
    const t = search.toLowerCase();
    return (i.oauFieldChanged ?? '').toLowerCase().includes(t)
      || (i.oauOldValue ?? '').toLowerCase().includes(t)
      || (i.oauNewValue ?? '').toLowerCase().includes(t);
  });

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0"><i className="bi bi-clock-history me-2 text-secondary"></i>Historial de Cambios de Adultos Mayores</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}><i className="bi bi-arrow-left me-2"></i>Regresar</button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control" placeholder="Buscar por campo, valor anterior o nuevo..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="btn btn-outline-secondary" onClick={() => setSearch('')}><i className="bi bi-x-circle"></i></button>}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger d-flex align-items-center"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}<button className="btn btn-sm btn-outline-danger ms-auto" onClick={load}>Reintentar</button></div>}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-2 text-muted">Cargando...</p></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-clock text-muted" style={{ fontSize: '3rem' }}></i><p className="mt-3 text-muted">{search ? 'No se encontraron resultados.' : 'No hay cambios registrados.'}</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr><th>ID</th><th>Adulto Mayor</th><th>Campo Modificado</th><th>Valor Anterior</th><th>Valor Nuevo</th><th>Modificado por</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td><span className="badge bg-secondary">{item.id}</span></td>
                  <td>{item.idOlderAdult ?? <span className="text-muted">—</span>}</td>
                  <td><span className="badge bg-primary bg-opacity-75">{item.oauFieldChanged ?? '—'}</span></td>
                  <td><span className="text-muted small">{item.oauOldValue ?? '—'}</span></td>
                  <td><span className="text-success small">{item.oauNewValue ?? '—'}</span></td>
                  <td>{item.changedBy ?? <span className="text-muted">—</span>}</td>
                  <td><small className="text-muted">{formatDate(item.changedAt)}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
