import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { emergencyContactsService } from '../../../services/emergencyContactsService';
import type { UpdateEmergencyContactDto } from '../../../types/emergencyContact';

export default function EditEmergencyContactPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<UpdateEmergencyContactDto>({ enPhoneNumber: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    emergencyContactsService.getById(Number(id)).then(d => { setForm({ enPhoneNumber: d.enPhoneNumber, idOlderAdult: d.idOlderAdult }); setLoading(false); })
      .catch(() => { setError('Error al cargar contacto'); setLoading(false); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await emergencyContactsService.update(Number(id), form);
      setSuccess('Contacto actualizado exitosamente');
      setTimeout(() => navigate('/emergency-contacts'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al actualizar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 500 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/emergency-contacts')} type="button"><i className="bi bi-arrow-left me-1"></i>Regresar</button>
        <h2 className="mb-0"><i className="bi bi-telephone-fill me-2 text-warning"></i>Editar Contacto de Emergencia</h2>
      </div>
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Número de Teléfono</label>
              <input className="form-control" value={form.enPhoneNumber ?? ''} onChange={e => setForm(p => ({ ...p, enPhoneNumber: e.target.value }))} disabled={saving} maxLength={20} />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">ID Adulto Mayor</label>
              <input type="number" className="form-control" value={form.idOlderAdult ?? ''} onChange={e => setForm(p => ({ ...p, idOlderAdult: e.target.value ? Number(e.target.value) : undefined }))} disabled={saving} />
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/emergency-contacts')} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn btn-warning" disabled={saving}>{saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Actualizar</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
