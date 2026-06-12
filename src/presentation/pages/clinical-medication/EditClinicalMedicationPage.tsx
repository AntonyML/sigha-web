import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clinicalMedicationService, type UpdateClinicalMedicationDto } from '../../../services/clinicalMedicationService';

export default function EditClinicalMedicationPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<UpdateClinicalMedicationDto>({ mMedication: '', mDosage: '', mTreatmentType: undefined });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    clinicalMedicationService.getById(Number(id)).then(d => { setForm({ mMedication: d.mMedication, mDosage: d.mDosage, mTreatmentType: d.mTreatmentType, idClinicalHistory: d.idClinicalHistory }); setLoading(false); })
      .catch(() => { setError('Error al cargar medicamento'); setLoading(false); });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value === '' ? undefined : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await clinicalMedicationService.update(Number(id), form);
      setSuccess('Medicamento actualizado exitosamente');
      setTimeout(() => navigate('/clinical-medication'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al actualizar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/clinical-medication')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-capsule me-2 text-warning"></i>Editar Medicamento Clínico</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Medicamento</label>
              <input name="mMedication" className="form-control" value={form.mMedication ?? ''} onChange={handleChange} disabled={saving} maxLength={500} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Dosis</label>
              <input name="mDosage" className="form-control" value={form.mDosage ?? ''} onChange={handleChange} disabled={saving} maxLength={200} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Tipo de Tratamiento</label>
              <select name="mTreatmentType" className="form-select" value={form.mTreatmentType ?? ''} onChange={handleChange} disabled={saving}>
                <option value="">— Seleccionar —</option>
                <option value="temporary">Temporal</option>
                <option value="chronic">Crónico</option>
                <option value="preventive">Preventivo</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">ID Historia Clínica</label>
              <input type="number" className="form-control" value={form.idClinicalHistory ?? ''} onChange={e => setForm(p => ({ ...p, idClinicalHistory: e.target.value ? Number(e.target.value) : undefined }))} disabled={saving} />
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/clinical-medication')} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn btn-warning" disabled={saving}>{saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Actualizar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
