import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  socialWorkService,
  type CreateSocialWorkReportDto,
  type SocialWorkVisitType,
} from '../../../services/socialWorkService';

const VISIT_TYPES: { value: SocialWorkVisitType; label: string }[] = [
  { value: 'home visit',          label: 'Visita domiciliar' },
  { value: 'institutional visit', label: 'Visita institucional' },
  { value: 'interview',           label: 'Entrevista' },
  { value: 'follow_up',           label: 'Seguimiento' },
];

export default function CreateSocialWorkReportPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CreateSocialWorkReportDto>({
    sw_visit_type: 'home visit',
    sw_date: new Date().toISOString().split('T')[0],
    sw_family_relationship: '',
    sw_economic_assessment: '',
    sw_social_support: '',
    sw_observations: '',
    sw_recommendations: '',
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
      await socialWorkService.createReport(form);
      navigate('/social-work');
    } catch (err) {
      console.error('Error creating social work report:', err);
      setError('Error al crear el reporte de trabajo social');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-people me-2 text-info"></i>
          Nuevo Reporte de Trabajo Social
        </h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/social-work')}>
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
                <label className="form-label fw-semibold">ID de Cita (Appointment) <span className="text-danger">*</span></label>
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
                <label className="form-label fw-semibold">Tipo de Visita</label>
                <select className="form-select" name="sw_visit_type" value={form.sw_visit_type} onChange={handleChange} required>
                  {VISIT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha del Reporte</label>
                <input
                  type="date"
                  className="form-control"
                  name="sw_date"
                  value={form.sw_date || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Relación Familiar</label>
                <input
                  type="text"
                  className="form-control"
                  name="sw_family_relationship"
                  value={form.sw_family_relationship || ''}
                  onChange={handleChange}
                  placeholder="Descripción de la relación familiar"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Evaluación Económica</label>
                <textarea
                  className="form-control"
                  name="sw_economic_assessment"
                  value={form.sw_economic_assessment || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descripción de la situación económica"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Apoyo Social</label>
                <textarea
                  className="form-control"
                  name="sw_social_support"
                  value={form.sw_social_support || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Servicios sociales de apoyo"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Observaciones</label>
                <textarea
                  className="form-control"
                  name="sw_observations"
                  value={form.sw_observations || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones del trabajador social"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Recomendaciones</label>
                <textarea
                  className="form-control"
                  name="sw_recommendations"
                  value={form.sw_recommendations || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Recomendaciones y plan de acción"
                />
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/social-work')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-info text-white" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                ) : (
                  <><i className="bi bi-check-circle me-2"></i>Crear Reporte</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
