'use client';

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@/shared/navigation';
import { accessLogService } from '@/infrastructure/api/services/accessLogService';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import type { AccessEventType, AccessLog } from '@/shared/types/accessLog';

const EVENT_LABELS: Record<AccessEventType, string> = { exit: 'Salida', return: 'Regreso', visit: 'Visita' };
const EVENT_BADGES: Record<AccessEventType, string> = {
  exit: 'text-bg-warning', return: 'text-bg-success', visit: 'text-bg-info',
};
const formatDate = (value: string) => new Date(value).toLocaleString('es-CR');

export default function EntranceExitDashboard() {
  const [events, setEvents] = useState<AccessLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await accessLogService.findAll({ page: 1, limit: 25 });
      setEvents(response.data);
      setTotal(response.total);
    } catch (err) {
      setEvents([]);
      setTotal(0);
      setError(getApiErrorMessage(err, 'No se pudieron cargar los movimientos de acceso.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const counts = events.reduce<Record<AccessEventType, number>>((result, event) => {
    result[event.eventType] += 1;
    return result;
  }, { exit: 0, return: 0, visit: 0 });

  return (
    <main className="container-fluid py-4" style={{ maxWidth: 1280 }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Entradas y salidas</h1>
          <p className="text-muted mb-0">Salidas, regresos y visitas de residentes, separados de las estancias clínicas.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-primary" onClick={() => navigate('/entrance-exit/register?type=exit')}>Registrar salida</button>
          <button type="button" className="btn btn-outline-success" onClick={() => navigate('/entrance-exit/register?type=entrance')}>Registrar regreso</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/entrance-exit/register?type=visit')}>Registrar visita</button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/entrance-exit/history')}>Ver historial</button>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}<button type="button" className="btn btn-link p-0 ms-2" onClick={() => void loadData()}>Reintentar</button></div>}

      <section className="row g-3 mb-4" aria-label="Conteo de los últimos movimientos">
        {(['exit', 'return', 'visit'] as const).map((eventType) => (
          <div className="col-sm-4" key={eventType}>
            <div className="card h-100"><div className="card-body">
              <div className="text-muted small">{EVENT_LABELS[eventType]} · últimos 25</div>
              <div className="fs-3 fw-semibold">{loading ? '—' : counts[eventType]}</div>
            </div></div>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="card-header d-flex justify-content-between align-items-center gap-2">
          <h2 className="h5 mb-0">Actividad reciente</h2>
          <span className="small text-muted">{total} movimiento(s) en total</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr><th>Fecha y hora</th><th>Movimiento</th><th>Residente</th><th>Visitante</th><th>Regreso estimado</th><th>Observaciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-4">Cargando movimientos…</td></tr>
                : events.length === 0 ? <tr><td colSpan={6} className="text-center text-muted py-4">Todavía no hay movimientos registrados.</td></tr>
                  : events.map((event) => (
                    <tr key={event.id}>
                      <td className="text-nowrap">{formatDate(event.occurredAt)}</td>
                      <td><span className={`badge ${EVENT_BADGES[event.eventType]}`}>{EVENT_LABELS[event.eventType]}</span></td>
                      <td>{event.resident?.name ?? '—'}</td>
                      <td>{event.visitorName ?? '—'}</td>
                      <td>{event.expectedReturnAt ? formatDate(event.expectedReturnAt) : '—'}</td>
                      <td>{event.notes ?? '—'}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
