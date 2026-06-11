import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicalRecordService } from '../../../services/medicalRecordService';
import type { CreateMedicalRecordDto } from '../../../types/medicalRecord';

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

export default function CreateMedicalRecordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<CreateMedicalRecordDto>>({
    record_type: 'routine_check',
    vital_signs_status: 'normal',
    diagnosis: '',
    treatment: '',
    notes: '',
    record_date: new Date().toISOString().split('T')[0],
    patient_id: '',
    staff_id: '',
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
                <label className="form-label fw-semibold">ID del Personal Médico</label>
                <input
                  type="text"
                  className="form-control"
                  name="staff_id"
                  value={form.staff_id || ''}
                  onChange={handleChange}
                  placeholder="UUID del médico/enfermero"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Tipo de Registro</label>
                <select className="form-select" name="record_type" value={form.record_type} onChange={handleChange}>
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
                <select className="form-select" name="vital_signs_status" value={form.vital_signs_status} onChange={handleChange}>
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
                  placeholder="Descripción del tratamiento indicado"
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
