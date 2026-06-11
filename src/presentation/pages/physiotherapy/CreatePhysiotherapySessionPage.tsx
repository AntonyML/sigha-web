import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { physiotherapyService } from '../../../services/physiotherapyService';
import type { CreatePhysiotherapySessionDto } from '../../../types/physiotherapy';

const SESSION_TYPES = [
  { value: 'therapy', label: 'Terapia' },
  { value: 'evaluation', label: 'Evaluación' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'initial_assessment', label: 'Valoración Inicial' },
  { value: 'discharge', label: 'Alta' },
];

const MOBILITY_LEVELS = [
  { value: 'independent', label: 'Independiente' },
  { value: 'minimal_assistance', label: 'Asistencia Mínima' },
  { value: 'moderate_assistance', label: 'Asistencia Moderada' },
  { value: 'full_assistance', label: 'Asistencia Total' },
  { value: 'non_ambulatory', label: 'No Deambulatorio' },
];

export default function CreatePhysiotherapySessionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<CreatePhysiotherapySessionDto>>({
    session_type: 'therapy',
    mobility_level: 'independent',
    objectives: '',
    activities_performed: '',
    patient_response: '',
    notes: '',
    duration_minutes: 60,
    session_date: new Date().toISOString().split('T')[0],
    appointment_id: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await physiotherapyService.createSession(form as CreatePhysiotherapySessionDto);
      navigate('/physiotherapy');
    } catch (err) {
      console.error('Error creating physiotherapy session:', err);
      setError('Error al crear la sesión de fisioterapia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-activity me-2 text-success"></i>
          Nueva Sesión de Fisioterapia
        </h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/physiotherapy')}>
          <i className="bi bi-arrow-left me-2"></i>Regresar
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID de Cita (Appointment)</label>
                <input
                  type="text"
                  className="form-control"
                  name="appointment_id"
                  value={form.appointment_id || ''}
                  onChange={handleChange}
                  placeholder="UUID de la cita médica"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Tipo de Sesión</label>
                <select className="form-select" name="session_type" value={form.session_type} onChange={handleChange}>
                  {SESSION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Nivel de Movilidad</label>
                <select className="form-select" name="mobility_level" value={form.mobility_level} onChange={handleChange}>
                  {MOBILITY_LEVELS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha de Sesión</label>
                <input
                  type="date"
                  className="form-control"
                  name="session_date"
                  value={form.session_date || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Duración (minutos)</label>
                <input
                  type="number"
                  className="form-control"
                  name="duration_minutes"
                  value={form.duration_minutes || ''}
                  onChange={handleChange}
                  min={1}
                  max={480}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Objetivos</label>
                <textarea
                  className="form-control"
                  name="objectives"
                  value={form.objectives || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Objetivos terapéuticos de la sesión"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Actividades Realizadas</label>
                <textarea
                  className="form-control"
                  name="activities_performed"
                  value={form.activities_performed || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descripción de actividades realizadas durante la sesión"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Respuesta del Paciente</label>
                <textarea
                  className="form-control"
                  name="patient_response"
                  value={form.patient_response || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Cómo respondió el paciente a la terapia"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Notas Adicionales</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={form.notes || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Observaciones adicionales"
                />
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/physiotherapy')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                ) : (
                  <><i className="bi bi-check-circle me-2"></i>Crear Sesión</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
