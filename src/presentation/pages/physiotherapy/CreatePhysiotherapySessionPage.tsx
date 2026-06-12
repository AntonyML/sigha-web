import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  physiotherapyService,
  type CreatePhysiotherapySessionDto,
  type PhysiotherapyType,
  type MobilityLevel,
} from '../../../services/physiotherapyService';

const SESSION_TYPES: { value: PhysiotherapyType; label: string }[] = [
  { value: 'evaluation', label: 'Evaluación' },
  { value: 'therapy', label: 'Terapia' },
  { value: 'follow_up', label: 'Seguimiento' },
];

const MOBILITY_LEVELS: { value: MobilityLevel; label: string }[] = [
  { value: 'high', label: 'Alta' },
  { value: 'moderate', label: 'Moderada' },
  { value: 'low', label: 'Baja' },
  { value: 'none', label: 'Ninguna' },
];

export default function CreatePhysiotherapySessionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CreatePhysiotherapySessionDto>({
    ps_type: 'evaluation',
    ps_mobility_level: 'high',
    ps_treatment_description: '',
    ps_exercise_plan: '',
    ps_progress_notes: '',
    ps_date: new Date().toISOString().split('T')[0],
    id_appointment: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_appointment) {
      setError('El ID de la cita es obligatorio');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await physiotherapyService.createSession(form);
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
                  type="number"
                  className="form-control"
                  name="id_appointment"
                  value={form.id_appointment}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Tipo de Sesión</label>
                <select className="form-select" name="ps_type" value={form.ps_type} onChange={handleChange} required>
                  {SESSION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Nivel de Movilidad</label>
                <select
                  className="form-select"
                  name="ps_mobility_level"
                  value={form.ps_mobility_level}
                  onChange={handleChange}
                  required
                >
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
                  name="ps_date"
                  value={form.ps_date || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Nivel de Dolor (0-10)</label>
                <input
                  type="number"
                  className="form-control"
                  name="ps_pain_level"
                  value={form.ps_pain_level ?? ''}
                  onChange={handleChange}
                  min={0}
                  max={10}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Descripción del Tratamiento</label>
                <textarea
                  className="form-control"
                  name="ps_treatment_description"
                  value={form.ps_treatment_description || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Procedimientos realizados"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Plan de Ejercicios</label>
                <textarea
                  className="form-control"
                  name="ps_exercise_plan"
                  value={form.ps_exercise_plan || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ejercicios indicados"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Notas de Progreso</label>
                <textarea
                  className="form-control"
                  name="ps_progress_notes"
                  value={form.ps_progress_notes || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Evolución y observaciones"
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
