import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emergencyContactService } from '../../../services/emergencyContactService';
import type { CreateEmergencyContactDto } from '../../../services/emergencyContactService';

const initial: CreateEmergencyContactDto = { enPhoneNumber: '', idOlderAdult: undefined };

export default function CreateEmergencyContactPage() {
  const [form, setForm] = useState<CreateEmergencyContactDto>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.enPhoneNumber.trim()) { setError('El número de teléfono es requerido'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await emergencyContactService.create(form);
      setSuccess('Contacto de emergencia creado exitosamente');
      setTimeout(() => navigate('/emergency-contacts'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al crear';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 500 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/emergency-contacts')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-telephone-plus me-2 text-danger"></i>Nuevo Contacto de Emergencia</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Número de Teléfono <span className="text-danger">*</span></label>
              <input className="form-control" placeholder="Ej: +506 8888-0000" value={form.enPhoneNumber} onChange={e => setForm(p => ({ ...p, enPhoneNumber: e.target.value }))} disabled={loading} maxLength={20} autoFocus />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">ID Adulto Mayor</label>
              <input type="number" className="form-control" placeholder="Opcional" value={form.idOlderAdult ?? ''} onChange={e => setForm(p => ({ ...p, idOlderAdult: e.target.value ? Number(e.target.value) : undefined }))} disabled={loading} />
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/emergency-contacts')} disabled={loading}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
