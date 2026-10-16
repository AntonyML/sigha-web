'use client';

import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from '@/shared/navigation';
import { accessLogService } from '@/infrastructure/api/services/accessLogService';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { ResidentSearchPicker } from '@/modules/residents';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';
import type { PatientBasicInfo } from '@/shared/types/virtualFile';
import type { AccessEventType, CreateAccessLog } from '@/shared/types/accessLog';
import { DateTimePicker } from '@/shared/ui/forms';

type FormType = AccessEventType | '';
const formatLocalInput = (value: Date) => {
  const pad = (number: number) => String(number).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
};
const toIso = (value: string) => new Date(value).toISOString();
const eventTitles: Record<AccessEventType, string> = { exit: 'Registrar salida', return: 'Registrar regreso', visit: 'Registrar visita' };

export default function RegisterEntranceExit() {
  const [searchParams] = useSearchParams();
  const queryType = searchParams.get('type');
  const initialEvent: AccessEventType = queryType === 'entrance' || queryType === 'return'
    ? 'return' : queryType === 'visit' ? 'visit' : 'exit';
  const [eventType, setEventType] = useState<FormType>(initialEvent);
  const [resident, setResident] = useState<PatientBasicInfo | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [occurredAt, setOccurredAt] = useState(formatLocalInput(new Date()));
  const [expectedReturnAt, setExpectedReturnAt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const feedback = useFeedbackWithNotifications();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!eventType) { setError('Seleccione el tipo de movimiento.'); return; }
    if (eventType !== 'visit' && !resident) { setError('Seleccione el residente para registrar una salida o un regreso.'); return; }
    if (eventType === 'visit' && !resident && !visitorName.trim()) { setError('Indique el nombre del visitante o el residente asociado.'); return; }
    if (!occurredAt || Number.isNaN(new Date(occurredAt).getTime())) { setError('Indique una fecha y hora válidas.'); return; }
    if (expectedReturnAt && (eventType !== 'exit' || new Date(expectedReturnAt) < new Date(occurredAt))) {
      setError('La fecha estimada de regreso debe ser posterior a la salida.');
      return;
    }

    const payload: CreateAccessLog = {
      eventType,
      residentId: resident?.id,
      occurredAt: toIso(occurredAt),
      expectedReturnAt: eventType === 'exit' && expectedReturnAt ? toIso(expectedReturnAt) : undefined,
      visitorName: eventType === 'visit' ? visitorName.trim() || undefined : undefined,
      notes: notes.trim() || undefined,
    };

    setLoading(true);
    try {
      await accessLogService.create(payload);
      feedback.success(`${eventTitles[eventType]} correctamente.`);
      navigate('/entrance-exit');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el movimiento.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div><h1 className="h3 mb-1">Registro de acceso</h1><p className="text-muted mb-0">Cada movimiento se agrega al historial y no se edita ni se elimina.</p></div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/entrance-exit')}>Volver</button>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <div className="card-header"><h2 className="h5 mb-0">Datos del movimiento</h2></div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold" htmlFor="access-event-type">Movimiento</label>
              <select id="access-event-type" className="form-select" value={eventType} onChange={(change) => { setEventType(change.target.value as FormType); setError(''); }} required disabled={loading}>
                <option value="exit">Salida de residente</option><option value="return">Regreso de residente</option><option value="visit">Visita</option>
              </select>
            </div>
            <div className="col-md-6">
              <DateTimePicker
                id="access-occurred-at"
                label="Fecha y hora"
                maxDate={new Date()}
                value={occurredAt}
                onChange={(val) => setOccurredAt(val)}
                required
                disabled={loading}
              />
            </div>
            <div className="col-md-6"><ResidentSearchPicker value={resident} onChange={setResident} required={eventType !== 'visit'} disabled={loading} /></div>
            {eventType === 'visit' && <div className="col-md-6"><label className="form-label fw-semibold" htmlFor="visitor-name">Nombre del visitante</label><input id="visitor-name" className="form-control" value={visitorName} onChange={(change) => setVisitorName(change.target.value)} maxLength={200} disabled={loading} placeholder="Nombre y apellidos" /><small className="text-muted">Puede asociar la visita a un residente o registrar el nombre del visitante.</small></div>}
            {eventType === 'exit' && (
              <div className="col-md-6">
                <DateTimePicker
                  id="expected-return-at"
                  label="Regreso estimado (opcional)"
                  minDate={occurredAt ? occurredAt.split('T')[0] : undefined}
                  value={expectedReturnAt}
                  onChange={(val) => setExpectedReturnAt(val)}
                  disabled={loading}
                />
              </div>
            )}
            <div className="col-12"><label className="form-label fw-semibold" htmlFor="access-notes">Observaciones</label><textarea id="access-notes" className="form-control" rows={3} value={notes} onChange={(change) => setNotes(change.target.value)} maxLength={5000} disabled={loading} placeholder="Destino, motivo o detalles de la visita" /></div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-end gap-2"><button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/entrance-exit')} disabled={loading}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando…' : eventType ? eventTitles[eventType] : 'Guardar movimiento'}</button></div>
      </form>
    </main>
  );
}
