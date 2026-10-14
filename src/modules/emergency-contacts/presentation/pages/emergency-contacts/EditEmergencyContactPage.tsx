import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@/shared/navigation';
import { emergencyContactService } from '@/infrastructure/api/services/emergencyContactService';
import type { UpdateEmergencyContactDto } from '@/infrastructure/api/services/emergencyContactService';
import { virtualFileService } from '@/infrastructure/api/services/virtualFileService';
import type { PatientBasicInfo } from '@/shared/types/virtualFile';
import OlderAdultSelector from '../../components/OlderAdultSelector';

export default function EditEmergencyContactPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<UpdateEmergencyContactDto>({ enPhoneNumber: '' });
  const [selectedAdult, setSelectedAdult] = useState<PatientBasicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    let active = true;
    emergencyContactService.getById(Number(id)).then(async (d) => {
      if (!active) return;
      setForm({ enPhoneNumber: d.enPhoneNumber, idOlderAdult: d.idOlderAdult });
      if (d.idOlderAdult) {
        try {
          const vf = await virtualFileService.getVirtualFileById(d.idOlderAdult);
          if (!active) return;
          setSelectedAdult({
            id: vf.id ?? d.idOlderAdult,
            identification: vf.cedula,
            name: vf.nombreApellido,
            firstLastName: '',
            secondLastName: '',
            fullName: vf.nombreApellido || 'Adulto mayor vinculado',
            birthdate: vf.fechaNacimiento,
            gender: '',
            phone: '',
            email: '',
            status: '',
          });
        } catch {
          // Si no se puede resolver el nombre, se deja sin selección
          // para que el usuario busque por cédula o nombre.
          if (active) setSelectedAdult(null);
        }
      }
      if (active) setLoading(false);
    })
      .catch(() => { if (active) { setError('Error al cargar contacto'); setLoading(false); } });
    return () => { active = false; };
  }, [id]);

  const handleSelectAdult = (patient: PatientBasicInfo | null) => {
    setSelectedAdult(patient);
    setForm((p) => ({ ...p, idOlderAdult: patient ? patient.id : undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await emergencyContactService.update(Number(id), form);
      setSuccess('Contacto actualizado exitosamente');
      setTimeout(() => navigate('/emergency-contacts'), 1500);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error al actualizar'));
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
              <label className="form-label fw-semibold" htmlFor="enPhoneNumber">Número de Teléfono</label>
              <input id="enPhoneNumber" className="form-control" value={form.enPhoneNumber ?? ''} onChange={e => setForm(p => ({ ...p, enPhoneNumber: e.target.value }))} disabled={saving} maxLength={20} />
            </div>
            <div className="mb-4">
              <OlderAdultSelector value={selectedAdult} onSelect={handleSelectAdult} disabled={saving} />
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
