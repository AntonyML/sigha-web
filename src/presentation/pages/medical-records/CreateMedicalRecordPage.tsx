import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicalRecordService, type CreateMedicalRecordDto } from '../../../services/medicalRecordService';

const ORIGIN_AREAS = [
  { value: 'nursing', label: 'Enfermería' },
  { value: 'physiotherapy', label: 'Fisioterapia' },
  { value: 'psychology', label: 'Psicología' },
  { value: 'social_work', label: 'Trabajo Social' },
  { value: 'general_medicine', label: 'Medicina General' },
];

export default function CreateMedicalRecordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<CreateMedicalRecordDto>>({
    mr_origin_area: 'nursing',
    mr_summary: '',
    id_older_adult: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mr_summary?.trim()) {
      setError('El resumen clínico es obligatorio');
      return;
    }
    if (!form.id_older_adult || form.id_older_adult <= 0) {
      setError('El ID del adulto mayor es obligatorio');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await medicalRecordService.createMedicalRecord(form as CreateMedicalRecordDto);
      navigate('/medical-records');
    } catch (err) {
      console.error('Error creating medical record:', err);
      setError('Error al crear el registro médico. Verifique los datos e intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-file-medical me-2 text-primary"></i>
          Nuevo Registro Médico
        </h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/medical-records')}>
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
                <label className="form-label fw-semibold">ID del Adulto Mayor <span className="text-danger">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  name="id_older_adult"
                  value={form.id_older_adult ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, id_older_adult: e.target.value ? Number(e.target.value) : 0 }))}
                  min={1}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Área de Origen</label>
                <select className="form-select" name="mr_origin_area" value={form.mr_origin_area ?? 'nursing'} onChange={handleChange}>
                  {ORIGIN_AREAS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Firmado por</label>
                <input
                  type="text"
                  className="form-control"
                  name="mr_signed_by"
                  value={form.mr_signed_by ?? ''}
                  onChange={handleChange}
                  placeholder="Lic. María Solís"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">ID de Cita Especializada</label>
                <input
                  type="number"
                  className="form-control"
                  name="id_appointment"
                  value={form.id_appointment ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, id_appointment: e.target.value ? Number(e.target.value) : undefined }))}
                  min={1}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Resumen Clínico <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  name="mr_summary"
                  value={form.mr_summary ?? ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Resumen del encuentro clínico"
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Diagnóstico</label>
                <textarea
                  className="form-control"
                  name="mr_diagnosis"
                  value={form.mr_diagnosis ?? ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Diagnóstico o diferencial"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Tratamiento</label>
                <textarea
                  className="form-control"
                  name="mr_treatment"
                  value={form.mr_treatment ?? ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Tratamiento aplicado o recomendado"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Observaciones</label>
                <textarea
                  className="form-control"
                  name="mr_observations"
                  value={form.mr_observations ?? ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones adicionales"
                />
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/medical-records')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                ) : (
                  <><i className="bi bi-check-circle me-2"></i>Guardar Registro</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
