import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { medicalRecordService, type MedicalRecord, type UpdateMedicalRecordDto } from '../../../services/medicalRecordService';

const ORIGIN_AREAS = [
  { value: 'nursing', label: 'Enfermería' },
  { value: 'physiotherapy', label: 'Fisioterapia' },
  { value: 'psychology', label: 'Psicología' },
  { value: 'social_work', label: 'Trabajo Social' },
  { value: 'general_medicine', label: 'Medicina General' },
];

export default function EditMedicalRecordPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UpdateMedicalRecordDto>({});

  useEffect(() => {
    if (!id) return;
    const loadRecord = async () => {
      setFetching(true);
      try {
        const record: MedicalRecord = await medicalRecordService.getMedicalRecordById(Number(id));
        setForm({
          mr_summary: record.mr_summary,
          mr_origin_area: record.mr_origin_area,
          mr_diagnosis: record.mr_diagnosis ?? undefined,
          mr_treatment: record.mr_treatment ?? undefined,
          mr_observations: record.mr_observations ?? undefined,
          mr_signed_by: record.mr_signed_by ?? undefined,
          id_appointment: record.id_appointment?.id,
          id_staff: record.id_staff?.id,
        });
      } catch (err) {
        console.error('Error loading medical record:', err);
        setError('Error al cargar el registro médico');
      } finally {
        setFetching(false);
      }
    };
    loadRecord();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      await medicalRecordService.updateMedicalRecord(Number(id), form);
      navigate('/medical-records');
    } catch (err) {
      console.error('Error updating medical record:', err);
      setError('Error al actualizar el registro médico');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Cargando registro...</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-pencil-square me-2 text-warning"></i>
          Editar Registro Médico
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
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Resumen Clínico</label>
                <textarea
                  className="form-control"
                  name="mr_summary"
                  value={form.mr_summary ?? ''}
                  onChange={handleChange}
                  rows={3}
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
              <button type="submit" className="btn btn-warning" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                ) : (
                  <><i className="bi bi-check-circle me-2"></i>Guardar Cambios</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
