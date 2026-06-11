import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { specializedAreasService } from '../../../services/specializedAreasService';
import type { CreateSpecializedAreaDto } from '../../../types/specializedArea';
import { SpecializedAreaName } from '../../../types/specializedArea';

const initial: CreateSpecializedAreaDto = {
  saName: SpecializedAreaName.NOT_SPECIFIED, saDescription: '', saContactEmail: '', saContactPhone: '', saIsActive: true,
};

const areaLabel: Record<string, string> = {
  [SpecializedAreaName.NURSING]: 'Enfermería',
  [SpecializedAreaName.PHYSIOTHERAPY]: 'Fisioterapia',
  [SpecializedAreaName.PSYCHOLOGY]: 'Psicología',
  [SpecializedAreaName.SOCIAL_WORK]: 'Trabajo Social',
  [SpecializedAreaName.NOT_SPECIFIED]: 'No especificado',
};

export default function CreateSpecializedAreaPage() {
  const [form, setForm] = useState<CreateSpecializedAreaDto>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(p => ({ ...p, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await specializedAreasService.create(form);
      setSuccess('Área creada exitosamente');
      setTimeout(() => navigate('/specialized-areas'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al crear';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/specialized-areas')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-hospital me-2 text-success"></i>Nueva Área Especializada</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Nombre del Área</label>
                <select name="saName" className="form-select" value={form.saName ?? ''} onChange={handleChange} disabled={loading}>
                  {Object.entries(SpecializedAreaName).map(([k, v]) => <option key={k} value={v}>{areaLabel[v] ?? v}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea name="saDescription" className="form-control" rows={3} placeholder="Descripción del área..." value={form.saDescription ?? ''} onChange={handleChange} disabled={loading} maxLength={500} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email de Contacto</label>
                <input name="saContactEmail" type="email" className="form-control" placeholder="area@hogar.com" value={form.saContactEmail ?? ''} onChange={handleChange} disabled={loading} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Teléfono de Contacto</label>
                <input name="saContactPhone" className="form-control" placeholder="+506 2222-3333" value={form.saContactPhone ?? ''} onChange={handleChange} disabled={loading} maxLength={20} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID del Encargado</label>
                <input name="idManager" type="number" className="form-control" placeholder="ID opcional" onChange={e => setForm(p => ({ ...p, idManager: e.target.value ? Number(e.target.value) : undefined }))} disabled={loading} min={1} />
              </div>
              <div className="col-md-6 d-flex align-items-center mt-4">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" name="saIsActive" id="saIsActive" checked={form.saIsActive ?? true} onChange={handleChange} disabled={loading} />
                  <label className="form-check-label fw-semibold" htmlFor="saIsActive">Área Activa</label>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/specialized-areas')} disabled={loading}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
