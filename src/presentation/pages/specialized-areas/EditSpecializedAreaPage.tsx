import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { specializedAreasService } from '../../../services/specializedAreasService';
import type { UpdateSpecializedAreaDto } from '../../../types/specializedArea';
import { SpecializedAreaName } from '../../../types/specializedArea';

const areaLabel: Record<string, string> = {
  [SpecializedAreaName.NURSING]: 'Enfermería',
  [SpecializedAreaName.PHYSIOTHERAPY]: 'Fisioterapia',
  [SpecializedAreaName.PSYCHOLOGY]: 'Psicología',
  [SpecializedAreaName.SOCIAL_WORK]: 'Trabajo Social',
  [SpecializedAreaName.NOT_SPECIFIED]: 'No especificado',
};

export default function EditSpecializedAreaPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<UpdateSpecializedAreaDto>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    specializedAreasService.getById(Number(id)).then(d => {
      setForm({ saName: d.saName, saDescription: d.saDescription, saContactEmail: d.saContactEmail, saContactPhone: d.saContactPhone, saIsActive: d.saIsActive, idManager: d.idManager });
      setLoading(false);
    }).catch(() => { setError('Error al cargar área'); setLoading(false); });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(p => ({ ...p, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await specializedAreasService.update(Number(id), form);
      setSuccess('Área actualizada exitosamente');
      setTimeout(() => navigate('/specialized-areas'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al actualizar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/specialized-areas')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-hospital me-2 text-warning"></i>Editar Área Especializada</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Nombre del Área</label>
                <select name="saName" className="form-select" value={form.saName ?? ''} onChange={handleChange} disabled={saving}>
                  {Object.entries(SpecializedAreaName).map(([k, v]) => <option key={k} value={v}>{areaLabel[v] ?? v}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea name="saDescription" className="form-control" rows={3} value={form.saDescription ?? ''} onChange={handleChange} disabled={saving} maxLength={500} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email de Contacto</label>
                <input name="saContactEmail" type="email" className="form-control" value={form.saContactEmail ?? ''} onChange={handleChange} disabled={saving} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Teléfono de Contacto</label>
                <input name="saContactPhone" className="form-control" value={form.saContactPhone ?? ''} onChange={handleChange} disabled={saving} maxLength={20} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID del Encargado</label>
                <input type="number" className="form-control" value={form.idManager ?? ''} onChange={e => setForm(p => ({ ...p, idManager: e.target.value ? Number(e.target.value) : undefined }))} disabled={saving} min={1} />
              </div>
              <div className="col-md-6 d-flex align-items-center mt-4">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" name="saIsActive" id="saIsActive" checked={form.saIsActive ?? false} onChange={handleChange} disabled={saving} />
                  <label className="form-check-label fw-semibold" htmlFor="saIsActive">Área Activa</label>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/specialized-areas')} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn btn-warning" disabled={saving}>{saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Actualizar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
