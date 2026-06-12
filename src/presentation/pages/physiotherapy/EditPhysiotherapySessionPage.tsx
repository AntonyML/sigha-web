import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  physiotherapyService,
  type UpdatePhysiotherapySessionDto,
  type PhysiotherapyType,
  type MobilityLevel,
} from '../../../services/physiotherapyService';
import { ArrowLeft, Activity, Save, AlertCircle } from 'lucide-react';
import '../../styles/lp.css';

const SESSION_TYPES: { value: PhysiotherapyType; label: string }[] = [
  { value: 'evaluation', label: 'Evaluación' },
  { value: 'therapy',    label: 'Terapia' },
  { value: 'follow_up',  label: 'Seguimiento' },
];

const MOBILITY_LEVELS: { value: MobilityLevel; label: string }[] = [
  { value: 'high',     label: 'Alta' },
  { value: 'moderate', label: 'Moderada' },
  { value: 'low',      label: 'Baja' },
  { value: 'none',     label: 'Ninguna' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0',
  borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569',
  marginBottom: '0.3rem',
};
const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

export default function EditPhysiotherapySessionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState('');
  const [form,     setForm]     = useState<UpdatePhysiotherapySessionDto>({});

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setFetching(true);
      try {
        const s = await physiotherapyService.getSessionById(Number(id));
        setForm({
          ps_type:                 s.ps_type,
          ps_mobility_level:       s.ps_mobility_level,
          ps_pain_level:           s.ps_pain_level ?? undefined,
          ps_treatment_description:s.ps_treatment_description ?? undefined,
          ps_exercise_plan:        s.ps_exercise_plan ?? undefined,
          ps_progress_notes:       s.ps_progress_notes ?? undefined,
          ps_date:                 s.ps_date ? s.ps_date.slice(0, 10) : undefined,
        });
      } catch {
        setError('Error al cargar la sesión de fisioterapia');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      await physiotherapyService.updateSession(Number(id), form);
      navigate('/physiotherapy');
    } catch {
      setError('Error al actualizar la sesión de fisioterapia');
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="lp-page">
      <div className="lp-loading"><div className="lp-spinner" /><span>Cargando sesión</span></div>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="#16a34a" /> Editar Sesión de Fisioterapia
        </h2>
        <button type="button" onClick={() => navigate('/physiotherapy')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.875rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b' }}>
          <ArrowLeft size={14} /> Regresar
        </button>
      </div>

      {error && (
        <div className="lp-error">
          <AlertCircle size={16} />{error}
          <button className="lp-error__retry" onClick={() => setError('')}>Cerrar</button>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

            <div style={fieldStyle}>
              <label style={labelStyle}>Tipo de sesión</label>
              <select name="ps_type" value={form.ps_type || ''} onChange={handleChange} style={inputStyle}>
                {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Nivel de movilidad</label>
              <select name="ps_mobility_level" value={form.ps_mobility_level || ''} onChange={handleChange} style={inputStyle}>
                {MOBILITY_LEVELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Fecha de sesión</label>
              <input type="date" name="ps_date" value={(form.ps_date as string) || ''} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Nivel de dolor (0-10)</label>
              <input type="number" name="ps_pain_level" value={form.ps_pain_level ?? ''} onChange={handleChange}
                min={0} max={10} style={inputStyle} placeholder="0-10" />
            </div>

            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Descripción del tratamiento</label>
              <textarea name="ps_treatment_description" value={form.ps_treatment_description || ''} onChange={handleChange}
                rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Procedimientos realizados" />
            </div>

            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Plan de ejercicios</label>
              <textarea name="ps_exercise_plan" value={form.ps_exercise_plan || ''} onChange={handleChange}
                rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Ejercicios indicados" />
            </div>

            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notas de progreso</label>
              <textarea name="ps_progress_notes" value={form.ps_progress_notes || ''} onChange={handleChange}
                rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Evolución y observaciones" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" onClick={() => navigate('/physiotherapy')} disabled={loading}
              style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              {loading ? <><span className="lp-spinner" style={{ width: 14, height: 14 }} />Guardando</> : <><Save size={14} />Guardar cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
