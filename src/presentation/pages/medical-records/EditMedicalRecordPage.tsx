import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { medicalRecordService } from '../../../services/medicalRecordService';
import type { UpdateMedicalRecordDto } from '../../../types/medicalRecord';

const RECORD_TYPES = [
  { value: 'routine_check', label: 'Control Rutinario' },
  { value: 'emergency', label: 'Emergencia' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'specialist', label: 'Especialista' },
  { value: 'surgery', label: 'Cirugía' },
  { value: 'hospitalization', label: 'Hospitalización' },
];

const VITAL_SIGNS_STATUS = [
  { value: 'normal', label: 'Normal' },
  { value: 'abnormal', label: 'Anormal' },
  { value: 'critical', label: 'Crítico' },
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
        const record = await medicalRecordService.getMedicalRecordById(id);
        setForm({
          record_type: record.record_type,
          vital_signs_status: record.vital_signs_status,
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          notes: record.notes,
          record_date: record.record_date,
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
      await medicalRecordService.updateMedicalRecord(id, form);
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
                <label className="form-label fw-semibold">Tipo de Registro</label>
                <select className="form-select" name="record_type" value={form.record_type || ''} onChange={handleChange}>
                  {RECORD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha del Registro</label>
                <input
                  type="date"
                  className="form-control"
                  name="record_date"
                  value={form.record_date || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Estado de Signos Vitales</label>
                <select className="form-select" name="vital_signs_status" value={form.vital_signs_status || ''} onChange={handleChange}>
                  {VITAL_SIGNS_STATUS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Diagnóstico</label>
                <input
                  type="text"
                  className="form-control"
                  name="diagnosis"
                  value={form.diagnosis || ''}
                  onChange={handleChange}
                  placeholder="Descripción del diagnóstico"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Tratamiento</label>
                <textarea
                  className="form-control"
                  name="treatment"
                  value={form.treatment || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descripción del tratamiento"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Notas Adicionales</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={form.notes || ''}
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
