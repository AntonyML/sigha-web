import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { olderAdultFamilyService } from '../../../services/olderAdultFamilyService';
import type { UpdateOlderAdultFamilyDto, KinshipType } from '../../../services/olderAdultFamily';

export default function EditOlderAdultFamilyPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<UpdateOlderAdultFamilyDto>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    olderAdultFamilyService.getById(Number(id)).then(d => {
      setForm({ pfIdentification: d.pfIdentification, pfName: d.pfName, pfFLastName: d.pfFLastName, pfSLastName: d.pfSLastName, pfPhoneNumber: d.pfPhoneNumber, pfEmail: d.pfEmail, pfKinship: d.pfKinship });
      setLoading(false);
    }).catch(() => { setError('Error al cargar familiar'); setLoading(false); });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await olderAdultFamilyService.update(Number(id), form);
      setSuccess('Familiar actualizado exitosamente');
      setTimeout(() => navigate('/older-adult-family'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al actualizar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/older-adult-family')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-person-check me-2 text-warning"></i>Editar Familiar</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Cédula</label>
                <input name="pfIdentification" className="form-control" value={form.pfIdentification ?? ''} onChange={handleChange} disabled={saving} maxLength={20} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nombre</label>
                <input name="pfName" className="form-control" value={form.pfName ?? ''} onChange={handleChange} disabled={saving} maxLength={50} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Primer Apellido</label>
                <input name="pfFLastName" className="form-control" value={form.pfFLastName ?? ''} onChange={handleChange} disabled={saving} maxLength={50} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Segundo Apellido</label>
                <input name="pfSLastName" className="form-control" value={form.pfSLastName ?? ''} onChange={handleChange} disabled={saving} maxLength={50} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Parentesco</label>
                <select name="pfKinship" className="form-select" value={form.pfKinship ?? ''} onChange={handleChange} disabled={saving}>
                  {(['son','daughter','grandson','granddaughter','brother','sister','nephew','niece','husband','wife','legal guardian','other','not specified'] as KinshipType[]).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Teléfono</label>
                <input name="pfPhoneNumber" className="form-control" value={form.pfPhoneNumber ?? ''} onChange={handleChange} disabled={saving} maxLength={20} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input name="pfEmail" type="email" className="form-control" value={form.pfEmail ?? ''} onChange={handleChange} disabled={saving} maxLength={256} />
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/older-adult-family')} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn btn-warning" disabled={saving}>{saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Actualizar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
