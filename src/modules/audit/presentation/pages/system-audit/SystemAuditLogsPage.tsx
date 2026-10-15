'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { systemAuditLogService } from '@/infrastructure/api/services/systemAuditLogService';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import type { SystemAuditAction, SystemAuditLog, SystemAuditLogFilters } from '@/shared/types/systemAuditLog';

const PAGE_SIZE = 25;
const formatDate = (value: string) => new Date(value).toLocaleString('es-CR');
const formatValues = (value: Record<string, unknown> | null) => value ? JSON.stringify(value, null, 2) : 'Sin datos';

export default function SystemAuditLogsPage() {
  const [rows, setRows] = useState<SystemAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<SystemAuditLogFilters>({});
  const [form, setForm] = useState({ tableName: '', recordId: '', action: '' as '' | SystemAuditAction, actorUserId: '', from: '', to: '' });

  const loadData = useCallback(async (nextPage = 1, nextFilters: SystemAuditLogFilters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await systemAuditLogService.findAll({ ...nextFilters, page: nextPage, limit: PAGE_SIZE });
      setRows(response.data);
      setTotal(response.total);
      setPage(response.page);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setError(getApiErrorMessage(err, 'No se pudo cargar la auditoría administrativa.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  function handleFilter(event: FormEvent) {
    event.preventDefault();
    const nextFilters: SystemAuditLogFilters = {
      tableName: form.tableName.trim() || undefined,
      recordId: form.recordId.trim() || undefined,
      action: form.action || undefined,
      actorUserId: form.actorUserId ? Number(form.actorUserId) : undefined,
      from: form.from ? new Date(`${form.from}T00:00:00`).toISOString() : undefined,
      to: form.to ? new Date(`${form.to}T23:59:59.999`).toISOString() : undefined,
    };
    setFilters(nextFilters);
    void loadData(1, nextFilters);
  }

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3 mb-1">Auditoría administrativa</h1>
        <p className="text-muted mb-0">Consulta de cambios registrados automáticamente en la base de datos. Esta vista es de solo lectura.</p>
      </div>

      <form className="card card-body mb-4" onSubmit={handleFilter} aria-label="Filtros de auditoría administrativa">
        <div className="row g-3 align-items-end">
          <div className="col-sm-6 col-lg-2"><label className="form-label" htmlFor="audit-table">Tabla</label><input id="audit-table" className="form-control" value={form.tableName} onChange={(event) => setForm((current) => ({ ...current, tableName: event.target.value }))} placeholder="care_programs" /></div>
          <div className="col-sm-6 col-lg-2"><label className="form-label" htmlFor="audit-record">Registro</label><input id="audit-record" className="form-control" value={form.recordId} onChange={(event) => setForm((current) => ({ ...current, recordId: event.target.value }))} /></div>
          <div className="col-sm-6 col-lg-2"><label className="form-label" htmlFor="audit-action">Acción</label><select id="audit-action" className="form-select" value={form.action} onChange={(event) => setForm((current) => ({ ...current, action: event.target.value as typeof form.action }))}><option value="">Todas</option><option value="INSERT">Creación</option><option value="UPDATE">Actualización</option><option value="DELETE">Eliminación</option></select></div>
          <div className="col-sm-6 col-lg-2"><label className="form-label" htmlFor="audit-actor">ID del actor</label><input id="audit-actor" className="form-control" type="number" min="1" value={form.actorUserId} onChange={(event) => setForm((current) => ({ ...current, actorUserId: event.target.value }))} /></div>
          <div className="col-sm-6 col-lg-1"><label className="form-label" htmlFor="audit-from">Desde</label><input id="audit-from" className="form-control" type="date" value={form.from} onChange={(event) => setForm((current) => ({ ...current, from: event.target.value }))} /></div>
          <div className="col-sm-6 col-lg-1"><label className="form-label" htmlFor="audit-to">Hasta</label><input id="audit-to" className="form-control" type="date" value={form.to} onChange={(event) => setForm((current) => ({ ...current, to: event.target.value }))} /></div>
          <div className="col-lg-2 d-flex gap-2"><button className="btn btn-primary flex-grow-1" type="submit" disabled={loading}>Filtrar</button><button className="btn btn-outline-secondary" type="button" onClick={() => { setForm({ tableName: '', recordId: '', action: '', actorUserId: '', from: '', to: '' }); setFilters({}); void loadData(1, {}); }} disabled={loading}>Limpiar</button></div>
        </div>
      </form>

      {error && <div className="alert alert-danger" role="alert">{error}<button type="button" className="btn btn-link p-0 ms-2" onClick={() => void loadData(page, filters)}>Reintentar</button></div>}

      <section className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">Cambios registrados</h2>
          <span className="small text-muted">{total} registro(s)</span>
        </div>
        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0">
            <thead><tr><th>Fecha</th><th>Actor</th><th>Acción</th><th>Registro</th><th>Cambio</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center py-4">Cargando auditoría…</td></tr> : rows.length === 0 ? <tr><td colSpan={5} className="text-center text-muted py-4">No hay cambios que coincidan con los filtros.</td></tr> : rows.map((row) => (
                <tr key={row.id}>
                  <td className="text-nowrap">{formatDate(row.occurredAt)}</td>
                  <td>{row.actor ? <>{row.actor.name}<br /><small className="text-muted">{row.actor.email}</small></> : row.actorUserId ? `Usuario ${row.actorUserId}` : 'Sistema'}</td>
                  <td><span className={`badge ${row.action === 'DELETE' ? 'text-bg-danger' : row.action === 'INSERT' ? 'text-bg-success' : 'text-bg-primary'}`}>{row.action}</span></td>
                  <td><code>{row.tableName}</code><br /><small>ID {row.recordId}</small></td>
                  <td style={{ minWidth: 250 }}>
                    <details>
                      <summary>Ver valores anteriores y nuevos</summary>
                      <div className="row g-2 mt-1">
                        <div className="col-xl-6"><strong className="small">Anterior</strong><pre className="bg-light border rounded p-2 small mt-1" style={{ maxHeight: 260, overflow: 'auto' }}>{formatValues(row.oldValues)}</pre></div>
                        <div className="col-xl-6"><strong className="small">Nuevo</strong><pre className="bg-light border rounded p-2 small mt-1" style={{ maxHeight: 260, overflow: 'auto' }}>{formatValues(row.newValues)}</pre></div>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          <span className="small text-muted">Página {page} de {lastPage}</span>
          <div className="btn-group"><button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => void loadData(page - 1)} disabled={loading || page <= 1}>Anterior</button><button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => void loadData(page + 1)} disabled={loading || page >= lastPage}>Siguiente</button></div>
        </div>
      </section>
    </main>
  );
}
