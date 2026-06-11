import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socialWorkService } from '../../../services/socialWorkService';
import type { CreateSocialWorkReportDto } from '../../../types/socialWork';

const REPORT_TYPES = [
  { value: 'initial_assessment', label: 'Valoración Inicial' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'family_intervention', label: 'Intervención Familiar' },
  { value: 'resource_coordination', label: 'Coordinación de Recursos' },
  { value: 'discharge_planning', label: 'Planificación de Alta' },
  { value: 'crisis_intervention', label: 'Intervención en Crisis' },
];

const SUPPORT_LEVELS = [
  { value: 'high', label: 'Alto' },
  { value: 'medium', label: 'Medio' },
  { value: 'low', label: 'Bajo' },
  { value: 'none', label: 'Ninguno' },
];

const LIVING_ARRANGEMENTS = [
  { value: 'institution', label: 'Institución' },
  { value: 'family', label: 'Familia' },
  { value: 'alone', label: 'Solo' },
  { value: 'assisted_living', label: 'Vida Asistida' },
];

export default function CreateSocialWorkReportPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<CreateSocialWorkReportDto>>({
    report_type: 'initial_assessment',
    support_level: 'medium',
    living_arrangement: 'institution',
    observations: '',
    recommendations: '',
    family_contact: '',
    notes: '',
    report_date: new Date().toISOString().split('T')[0],
    patient_id: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id?.trim()) {
      setError('El ID del paciente es obligatorio');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await socialWorkService.createReport(form as CreateSocialWorkReportDto);
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
                <label className="form-label fw-semibold">ID del Paciente <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="patient_id"
                  value={form.patient_id || ''}
                  onChange={handleChange}
                  placeholder="UUID del paciente"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Tipo de Reporte</label>
                <select className="form-select" name="report_type" value={form.report_type} onChange={handleChange}>
                  {REPORT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Nivel de Apoyo Social</label>
                <select className="form-select" name="support_level" value={form.support_level} onChange={handleChange}>
                  {SUPPORT_LEVELS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Condición de Vivienda</label>
                <select className="form-select" name="living_arrangement" value={form.living_arrangement} onChange={handleChange}>
                  {LIVING_ARRANGEMENTS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha del Reporte</label>
                <input
                  type="date"
                  className="form-control"
                  name="report_date"
                  value={form.report_date || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Contacto Familiar</label>
                <input
                  type="text"
                  className="form-control"
                  name="family_contact"
                  value={form.family_contact || ''}
                  onChange={handleChange}
                  placeholder="Nombre y teléfono del contacto familiar"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Observaciones</label>
                <textarea
                  className="form-control"
                  name="observations"
                  value={form.observations || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones del trabajador social"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Recomendaciones</label>
                <textarea
                  className="form-control"
                  name="recommendations"
                  value={form.recommendations || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Recomendaciones y plan de acción"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Notas</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={form.notes || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Notas adicionales"
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
