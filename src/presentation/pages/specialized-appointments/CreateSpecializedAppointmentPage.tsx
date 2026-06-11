import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { specializedAppointmentsService } from '../../../services/specializedAppointmentsService';
import type { CreateSpecializedAppointmentDto } from '../../../types/specializedAppointment';
import { AppointmentTypeApi, AppointmentPriorityApi, AppointmentStatusApi } from '../../../types/specializedAppointment';

const initial: CreateSpecializedAppointmentDto = {
  saAppointmentDate: '', idArea: 0, idPatient: 0, idStaff: 0,
};

export default function CreateSpecializedAppointmentPage() {
  const [form, setForm] = useState<CreateSpecializedAppointmentDto>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numFields = ['idArea', 'idPatient', 'idStaff', 'saDurationMinutes'];
    setForm(p => ({ ...p, [name]: numFields.includes(name) ? (value ? Number(value) : undefined) : value || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.saAppointmentDate || !form.idArea || !form.idPatient || !form.idStaff) { setError('Fecha, área, paciente y personal son requeridos'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await specializedAppointmentsService.create(form);
      setSuccess('Cita creada exitosamente');
      setTimeout(() => navigate('/specialized-appointments'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al crear';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/specialized-appointments')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-calendar-plus me-2 text-success"></i>Nueva Cita Especializada</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <h6 className="text-muted fw-bold text-uppercase mb-3">Datos requeridos</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha y Hora <span className="text-danger">*</span></label>
                <input name="saAppointmentDate" type="datetime-local" className="form-control" value={form.saAppointmentDate} onChange={e => setForm(p => ({ ...p, saAppointmentDate: e.target.value }))} disabled={loading} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID Área <span className="text-danger">*</span></label>
                <input name="idArea" type="number" className="form-control" placeholder="ID del área" value={form.idArea || ''} onChange={handleChange} disabled={loading} min={1} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID Paciente <span className="text-danger">*</span></label>
                <input name="idPatient" type="number" className="form-control" placeholder="ID del paciente" value={form.idPatient || ''} onChange={handleChange} disabled={loading} min={1} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID Personal <span className="text-danger">*</span></label>
                <input name="idStaff" type="number" className="form-control" placeholder="ID del personal" value={form.idStaff || ''} onChange={handleChange} disabled={loading} min={1} required />
              </div>
            </div>
            <hr className="my-4" />
            <h6 className="text-muted fw-bold text-uppercase mb-3">Datos opcionales</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Tipo de Cita</label>
                <select name="saAppointmentType" className="form-select" onChange={handleChange} disabled={loading}>
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
                <select name="saPriority" className="form-select" onChange={handleChange} disabled={loading}>
                  <option value="">Seleccionar...</option>
                  <option value={AppointmentPriorityApi.LOW}>Baja</option>
                  <option value={AppointmentPriorityApi.MEDIUM}>Media</option>
                  <option value={AppointmentPriorityApi.HIGH}>Alta</option>
                  <option value={AppointmentPriorityApi.URGENT}>Urgente</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Estado</label>
                <select name="saStatus" className="form-select" onChange={handleChange} disabled={loading}>
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
                <input name="saDurationMinutes" type="number" className="form-control" placeholder="60" onChange={handleChange} disabled={loading} min={1} max={480} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Próxima Cita</label>
                <input name="saNextAppointment" type="datetime-local" className="form-control" onChange={e => setForm(p => ({ ...p, saNextAppointment: e.target.value || undefined }))} disabled={loading} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Notas</label>
                <textarea name="saNotes" className="form-control" rows={2} placeholder="Notas de la cita..." onChange={handleChange} disabled={loading} maxLength={500} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Observaciones</label>
                <textarea name="saObservations" className="form-control" rows={2} placeholder="Observaciones adicionales..." onChange={handleChange} disabled={loading} maxLength={500} />
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/specialized-appointments')} disabled={loading}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
