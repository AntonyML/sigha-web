import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicalMedicationService } from '../../../services/clinicalMedicationService';
import type { CreateClinicalMedicationDto } from '../../../types/clinicalMedication';
import { TreatmentType } from '../../../types/clinicalMedication';

const initial: CreateClinicalMedicationDto = { mMedication: '', mDosage: '', mTreatmentType: undefined, idClinicalHistory: undefined };

export default function CreateClinicalMedicationPage() {
  const [form, setForm] = useState<CreateClinicalMedicationDto>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value === '' ? undefined : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mMedication.trim() || !form.mDosage.trim()) { setError('Medicamento y dosis son requeridos'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await clinicalMedicationService.create(form);
      setSuccess('Medicamento creado exitosamente');
      setTimeout(() => navigate('/clinical-medication'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al crear';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/clinical-medication')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-capsule me-2 text-primary"></i>Nuevo Medicamento Clínico</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Medicamento <span className="text-danger">*</span></label>
              <input name="mMedication" className="form-control" placeholder="Ej: Metformina 850mg" value={form.mMedication} onChange={handleChange} disabled={loading} maxLength={500} autoFocus />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Dosis <span className="text-danger">*</span></label>
              <input name="mDosage" className="form-control" placeholder="Ej: 1 tableta dos veces al día" value={form.mDosage} onChange={handleChange} disabled={loading} maxLength={200} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Tipo de Tratamiento</label>
              <select name="mTreatmentType" className="form-select" value={form.mTreatmentType ?? ''} onChange={handleChange} disabled={loading}>
                <option value="">— Seleccionar —</option>
                <option value={TreatmentType.TEMPORARY}>Temporal</option>
                <option value={TreatmentType.CHRONIC}>Crónico</option>
                <option value={TreatmentType.PREVENTIVE}>Preventivo</option>
                <option value={TreatmentType.OTHER}>Otro</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">ID Historia Clínica</label>
              <input name="idClinicalHistory" type="number" className="form-control" placeholder="Opcional" value={form.idClinicalHistory ?? ''} onChange={e => setForm(p => ({ ...p, idClinicalHistory: e.target.value ? Number(e.target.value) : undefined }))} disabled={loading} />
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/clinical-medication')} disabled={loading}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
