import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { specializedAppointmentsService } from '../../../services/specializedAppointmentsService';
import type { UpdateSpecializedAppointmentDto } from '../../../types/specializedAppointment';
import { AppointmentTypeApi, AppointmentPriorityApi, AppointmentStatusApi } from '../../../types/specializedAppointment';

export default function EditSpecializedAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<UpdateSpecializedAppointmentDto>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    specializedAppointmentsService.getById(Number(id)).then(d => {
      setForm({
        saAppointmentDate: d.saAppointmentDate, saAppointmentType: d.saAppointmentType, saPriority: d.saPriority, saStatus: d.saStatus,
        saNotes: d.saNotes, saObservations: d.saObservations, saDurationMinutes: d.saDurationMinutes, saNextAppointment: d.saNextAppointment,
        idArea: d.idArea, idPatient: d.idPatient, idStaff: d.idStaff,
      });
      setLoading(false);
    }).catch(() => { setError('Error al cargar cita'); setLoading(false); });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numFields = ['idArea', 'idPatient', 'idStaff', 'saDurationMinutes'];
    setForm(p => ({ ...p, [name]: numFields.includes(name) ? (value ? Number(value) : undefined) : value || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await specializedAppointmentsService.update(Number(id), form);
      setSuccess('Cita actualizada exitosamente');
      setTimeout(() => navigate('/specialized-appointments'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al actualizar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/specialized-appointments')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-calendar-check me-2 text-warning"></i>Editar Cita Especializada</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <h6 className="text-muted fw-bold text-uppercase mb-3">Datos requeridos</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha y Hora</label>
                <input name="saAppointmentDate" type="datetime-local" className="form-control" value={form.saAppointmentDate ?? ''} onChange={e => setForm(p => ({ ...p, saAppointmentDate: e.target.value }))} disabled={saving} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID Área</label>
                <input name="idArea" type="number" className="form-control" value={form.idArea ?? ''} onChange={handleChange} disabled={saving} min={1} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID Paciente</label>
                <input name="idPatient" type="number" className="form-control" value={form.idPatient ?? ''} onChange={handleChange} disabled={saving} min={1} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID Personal</label>
                <input name="idStaff" type="number" className="form-control" value={form.idStaff ?? ''} onChange={handleChange} disabled={saving} min={1} />
              </div>
            </div>
            <hr className="my-4" />
            <h6 className="text-muted fw-bold text-uppercase mb-3">Datos opcionales</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Tipo de Cita</label>
                <select name="saAppointmentType" className="form-select" value={form.saAppointmentType ?? ''} onChange={handleChange} disabled={saving}>
                  <option value="">Seleccionar...</option>
                  <option value={AppointmentTypeApi.CHECKUP}>Chequeo</option>
                  <option value={AppointmentTypeApi.EVALUATION}>Evaluación</option>
                  <option value={AppointmentTypeApi.THERAPY}>Terapia</option>
                  <option value={AppointmentTypeApi.FOLLOW_UP}>Seguimiento</option>
                  <option value={AppointmentTypeApi.EMERGENCY}>Emergencia</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Prioridad</label>
                <select name="saPriority" className="form-select" value={form.saPriority ?? ''} onChange={handleChange} disabled={saving}>
                  <option value="">Seleccionar...</option>
                  <option value={AppointmentPriorityApi.LOW}>Baja</option>
                  <option value={AppointmentPriorityApi.MEDIUM}>Media</option>
                  <option value={AppointmentPriorityApi.HIGH}>Alta</option>
                  <option value={AppointmentPriorityApi.URGENT}>Urgente</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Estado</label>
                <select name="saStatus" className="form-select" value={form.saStatus ?? ''} onChange={handleChange} disabled={saving}>
                  <option value="">Seleccionar...</option>
                  <option value={AppointmentStatusApi.SCHEDULED}>Programada</option>
                  <option value={AppointmentStatusApi.IN_PROGRESS}>En Progreso</option>
                  <option value={AppointmentStatusApi.COMPLETED}>Completada</option>
                  <option value={AppointmentStatusApi.CANCELLED}>Cancelada</option>
                  <option value={AppointmentStatusApi.RESCHEDULED}>Reprogramada</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Duración (minutos)</label>
                <input name="saDurationMinutes" type="number" className="form-control" value={form.saDurationMinutes ?? ''} onChange={handleChange} disabled={saving} min={1} max={480} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Próxima Cita</label>
                <input name="saNextAppointment" type="datetime-local" className="form-control" value={form.saNextAppointment ?? ''} onChange={e => setForm(p => ({ ...p, saNextAppointment: e.target.value || undefined }))} disabled={saving} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Notas</label>
                <textarea name="saNotes" className="form-control" rows={2} value={form.saNotes ?? ''} onChange={handleChange} disabled={saving} maxLength={500} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Observaciones</label>
                <textarea name="saObservations" className="form-control" rows={2} value={form.saObservations ?? ''} onChange={handleChange} disabled={saving} maxLength={500} />
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/specialized-appointments')} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn btn-warning" disabled={saving}>{saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Actualizar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
