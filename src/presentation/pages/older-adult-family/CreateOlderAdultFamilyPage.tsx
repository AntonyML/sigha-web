import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { olderAdultFamilyService } from '../../../services/olderAdultFamilyService';
import type { CreateOlderAdultFamilyDto, KinshipType } from '../../../services/olderAdultFamily';

const initial: CreateOlderAdultFamilyDto = {
  pfIdentification: '', pfName: '', pfFLastName: '', pfSLastName: '', pfPhoneNumber: '', pfEmail: '',   pfKinship: 'not specified' as KinshipType,
};

export default function CreateOlderAdultFamilyPage() {
  const [form, setForm] = useState<CreateOlderAdultFamilyDto>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pfIdentification || !form.pfName || !form.pfFLastName || !form.pfSLastName) { setError('Cédula, nombre y apellidos son requeridos'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await olderAdultFamilyService.create(form);
      setSuccess('Familiar creado exitosamente');
      setTimeout(() => navigate('/older-adult-family'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al crear';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/older-adult-family')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-person-plus me-2 text-success"></i>Nuevo Familiar</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Cédula <span className="text-danger">*</span></label>
                <input name="pfIdentification" className="form-control" placeholder="1-2345-6789" value={form.pfIdentification} onChange={handleChange} disabled={loading} maxLength={20} autoFocus />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
                <input name="pfName" className="form-control" placeholder="María" value={form.pfName} onChange={handleChange} disabled={loading} maxLength={50} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Primer Apellido <span className="text-danger">*</span></label>
                <input name="pfFLastName" className="form-control" placeholder="González" value={form.pfFLastName} onChange={handleChange} disabled={loading} maxLength={50} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Segundo Apellido <span className="text-danger">*</span></label>
                <input name="pfSLastName" className="form-control" placeholder="Rodríguez" value={form.pfSLastName} onChange={handleChange} disabled={loading} maxLength={50} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Parentesco</label>
                <select name="pfKinship" className="form-select" value={form.pfKinship} onChange={handleChange} disabled={loading}>
                  {(['son','daughter','grandson','granddaughter','brother','sister','nephew','niece','husband','wife','legal guardian','other','not specified'] as KinshipType[]).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Teléfono</label>
                <input name="pfPhoneNumber" className="form-control" placeholder="+506 8888-1234" value={form.pfPhoneNumber ?? ''} onChange={handleChange} disabled={loading} maxLength={20} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input name="pfEmail" type="email" className="form-control" placeholder="correo@email.com" value={form.pfEmail ?? ''} onChange={handleChange} disabled={loading} maxLength={256} />
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/older-adult-family')} disabled={loading}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
