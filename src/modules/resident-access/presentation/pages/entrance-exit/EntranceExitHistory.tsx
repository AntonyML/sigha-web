'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from '@/shared/navigation';
import { accessLogService } from '@/infrastructure/api/services/accessLogService';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { ResidentSearchPicker } from '@/modules/residents';
import type { PatientBasicInfo } from '@/shared/types/virtualFile';
import type { AccessEventType, AccessLog, AccessLogFilters } from '@/shared/types/accessLog';

const PAGE_SIZE = 25;
const EVENT_LABELS: Record<AccessEventType, string> = { exit: 'Salida', return: 'Regreso', visit: 'Visita' };
const formatDate = (value: string) => new Date(value).toLocaleString('es-CR');
const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

function dateBoundary(value: string, end = false): string | undefined {
  return value ? new Date(`${value}T${end ? '23:59:59.999' : '00:00:00'}`).toISOString() : undefined;
}

function exportCsv(records: AccessLog[]) {
  const rows = [
    ['Fecha', 'Movimiento', 'Residente', 'Visitante', 'Regreso estimado', 'Observaciones'],
    ...records.map((record) => [
      formatDate(record.occurredAt), EVENT_LABELS[record.eventType], record.resident?.name ?? '',
      record.visitorName ?? '', record.expectedReturnAt ? formatDate(record.expectedReturnAt) : '', record.notes ?? '',
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historial-accesos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function EntranceExitHistory() {
  const [records, setRecords] = useState<AccessLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<AccessLogFilters>({});
  const [resident, setResident] = useState<PatientBasicInfo | null>(null);
  const [form, setForm] = useState({ eventType: '' as '' | AccessEventType, visitorName: '', from: '', to: '' });
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    void accessLogService.findAll({ ...filters, page, limit: PAGE_SIZE })
      .then((response) => {
        if (!active) return;
        setRecords(response.data);
        setTotal(response.total);
      })
      .catch((err) => {
        if (!active) return;
        setRecords([]);
        setTotal(0);
        setError(getApiErrorMessage(err, 'No se pudo cargar el historial de accesos.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters, page]);

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setPage(1);
    setFilters({
      eventType: form.eventType || undefined,
      residentId: resident?.id,
      visitorName: form.visitorName.trim() || undefined,
      from: dateBoundary(form.from),
      to: dateBoundary(form.to, true),
    });
  }

  function clearFilters() {
    setLoading(true);
    setError('');
    setForm({ eventType: '', visitorName: '', from: '', to: '' });
    setResident(null);
    setPage(1);
    setFilters({});
  }

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="container-fluid py-4" style={{ maxWidth: 1280 }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div><h1 className="h3 mb-1">Historial de entradas, salidas y visitas</h1><p className="text-muted mb-0">Los movimientos registrados se conservan como eventos de auditoría.</p></div>
        <div className="d-flex gap-2"><button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/entrance-exit')}>Volver</button><button type="button" className="btn btn-primary" onClick={() => navigate('/entrance-exit/register?type=exit')}>Registrar movimiento</button></div>
      </div>

      <form className="card card-body mb-4" onSubmit={applyFilters} aria-label="Filtros del historial de accesos">
        <div className="row g-3 align-items-end">
          <div className="col-md-6 col-xl-3"><label className="form-label" htmlFor="access-event-filter">Movimiento</label><select id="access-event-filter" className="form-select" value={form.eventType} onChange={(event) => setForm((current) => ({ ...current, eventType: event.target.value as typeof form.eventType }))}><option value="">Todos</option><option value="exit">Salida</option><option value="return">Regreso</option><option value="visit">Visita</option></select></div>
          <div className="col-md-6 col-xl-3"><ResidentSearchPicker value={resident} onChange={setResident} label="Residente" /></div>
          <div className="col-md-6 col-xl-2"><label className="form-label" htmlFor="access-visitor-filter">Visitante</label><input id="access-visitor-filter" className="form-control" value={form.visitorName} onChange={(event) => setForm((current) => ({ ...current, visitorName: event.target.value }))} maxLength={200} /></div>
          <div className="col-md-6 col-xl-2"><label className="form-label" htmlFor="access-from-filter">Desde</label><input id="access-from-filter" className="form-control" type="date" value={form.from} onChange={(event) => setForm((current) => ({ ...current, from: event.target.value }))} /></div>
          <div className="col-md-6 col-xl-2"><label className="form-label" htmlFor="access-to-filter">Hasta</label><input id="access-to-filter" className="form-control" type="date" value={form.to} onChange={(event) => setForm((current) => ({ ...current, to: event.target.value }))} /></div>
          <div className="col-12 d-flex gap-2"><button className="btn btn-primary" type="submit" disabled={loading}>Filtrar</button><button className="btn btn-outline-secondary" type="button" onClick={clearFilters} disabled={loading}>Limpiar</button><button className="btn btn-outline-success ms-auto" type="button" onClick={() => exportCsv(records)} disabled={loading || records.length === 0}>Exportar esta página CSV</button></div>
        </div>
      </form>

      {error && <div className="alert alert-danger" role="alert">{error}<button type="button" className="btn btn-link p-0 ms-2" onClick={() => { setLoading(true); setError(''); setFilters({ ...filters }); }}>Reintentar</button></div>}

      <section className="card">
        <div className="card-header d-flex justify-content-between align-items-center"><h2 className="h5 mb-0">Movimientos registrados</h2><span className="small text-muted">{total} registro(s)</span></div>
        <div className="table-responsive"><table className="table table-hover align-middle mb-0">
          <thead><tr><th>Fecha y hora</th><th>Movimiento</th><th>Residente</th><th>Visitante</th><th>Regreso estimado</th><th>Observaciones</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-4">Cargando historial…</td></tr> : records.length === 0 ? <tr><td colSpan={6} className="text-center text-muted py-4">No hay movimientos que coincidan con los filtros.</td></tr> : records.map((record) => (
              <tr key={record.id}><td className="text-nowrap">{formatDate(record.occurredAt)}</td><td><span className={`badge ${record.eventType === 'exit' ? 'text-bg-warning' : record.eventType === 'return' ? 'text-bg-success' : 'text-bg-info'}`}>{EVENT_LABELS[record.eventType]}</span></td><td>{record.resident?.name ?? '—'}</td><td>{record.visitorName ?? '—'}</td><td>{record.expectedReturnAt ? formatDate(record.expectedReturnAt) : '—'}</td><td>{record.notes ?? '—'}</td></tr>
            ))}
          </tbody>
        </table></div>
        <div className="card-footer d-flex justify-content-between align-items-center"><span className="small text-muted">Página {page} de {lastPage} · la exportación incluye esta página</span><div className="btn-group"><button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setLoading(true); setPage((current) => current - 1); }} disabled={loading || page <= 1}>Anterior</button><button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setLoading(true); setPage((current) => current + 1); }} disabled={loading || page >= lastPage}>Siguiente</button></div></div>
      </section>
    </main>
  );
}
