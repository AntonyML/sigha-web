import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import { psychologyService } from '../../../services/psychologyService';
import { specializedAppointmentsService } from '../../../services/specializedAppointmentsService';
import { virtualFileService } from '../../../services/virtualFileService';
import type { CreatePsychologySessionDto } from '../../../types/psychology';
import type { SpecializedAppointmentApi } from '../../../types/specializedAppointment';
import type { VirtualFile } from '../../../types/virtualFile';

const SESSION_TYPES = [
  { value: 'evaluation',    label: 'Evaluación' },
  { value: 'therapy',       label: 'Terapia' },
  { value: 'follow_up',     label: 'Seguimiento' },
  { value: 'group therapy', label: 'Terapia Grupal' },
];

const MOODS = [
  { value: 'stable',    label: 'Estable' },
  { value: 'anxious',   label: 'Ansioso' },
  { value: 'depressed', label: 'Deprimido' },
  { value: 'irritable', label: 'Irritable' },
  { value: 'other',     label: 'Otro' },
];

const COGNITIVE_STATES = [
  { value: 'normal',              label: 'Normal' },
  { value: 'mild impairment',     label: 'Deterioro Leve' },
  { value: 'moderate impairment', label: 'Deterioro Moderado' },
  { value: 'severe impairment',   label: 'Deterioro Severo' },
];

// ─── styles ────────────────────────────────────────────────────────────────────
const wrap: React.CSSProperties       = { maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' };
const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' };
const titleStyle: React.CSSProperties  = { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.4rem', fontWeight: 700, color: '#4c1d95', margin: 0 };
const dot: React.CSSProperties         = { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem' };
const btnBack: React.CSSProperties    = { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#475569', fontWeight: 500 };
const card: React.CSSProperties        = { background: '#fff', borderRadius: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 6px 20px rgba(124,58,237,0.07)', padding: '2rem' };
const grid: React.CSSProperties        = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' };
const fullRow: React.CSSProperties     = { gridColumn: '1 / -1' };
const labelStyle: React.CSSProperties  = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' };
const inputStyle: React.CSSProperties  = { width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fafbfc' };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 90 };
const errorBox: React.CSSProperties   = { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' };
const btnRow: React.CSSProperties     = { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' };
const btnCancel: React.CSSProperties  = { padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#475569', fontWeight: 500 };
const btnSubmit: React.CSSProperties  = { padding: '0.6rem 1.4rem', background: '#7c3aed', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#fff', fontWeight: 600 };
const spinnerStyle: React.CSSProperties = { width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', animation: 'spin 0.8s linear infinite', display: 'inline-block', marginRight: '0.5rem' };

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

export default function CreatePsychologySessionPage() {
  const navigate = useNavigate();
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [appointments, setAppointments] = useState<SpecializedAppointmentApi[]>([]);
  const [patientMap, setPatientMap]     = useState<Map<number, string>>(new Map());
  const [form, setForm]                 = useState<Partial<CreatePsychologySessionDto>>({
    psy_session_type: 'evaluation',
    psy_mood:         'stable',
    psy_cognitive_status: 'normal',
    psy_observations:  '',
    psy_therapy_goal:  '',
    psy_progress:      '',
    psy_date:          new Date().toISOString().split('T')[0],
    id_appointment:    undefined,
  });

  // Load appointments and patients for dropdown
  useEffect(() => {
    specializedAppointmentsService.getAll()
      .then(setAppointments)
      .catch(() => setAppointments([]));

    virtualFileService.getAllVirtualFiles()
      .then((files: VirtualFile[]) => {
        const map = new Map<number, string>();
        files.forEach(f => {
          if (f.id != null) {
            const name = [
              (f as unknown as Record<string, string>).oa_name || f.nombreApellido || '',
              (f as unknown as Record<string, string>).oa_f_last_name || '',
              (f as unknown as Record<string, string>).oa_s_last_name || '',
            ].filter(Boolean).join(' ').trim() || f.nombreApellido || 'Paciente';
            map.set(f.id, name);
          }
        });
        setPatientMap(map);
      })
      .catch(() => setPatientMap(new Map()));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'id_appointment' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_appointment) { setError('Debe seleccionar una cita'); return; }
    setLoading(true);
    setError('');
    try {
      await psychologyService.createSession(form as CreatePsychologySessionDto);
      navigate('/psychology');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Error al crear la sesión de psicología');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <span style={dot}><Brain size={18} /></span>
          Nueva Sesión de Psicología
        </h1>
        <button type="button" style={btnBack} onClick={() => navigate('/psychology')}>
          <ArrowLeft size={15} /> Regresar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={errorBox}>
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem', lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Card */}
      <div style={card}>
        <form onSubmit={handleSubmit}>
          <div style={grid}>

            {/* Appointment dropdown — full row */}
            <div style={fullRow}>
              <label style={labelStyle}>Cita programada *</label>
              <select
                name="id_appointment"
                value={form.id_appointment ?? ''}
                onChange={handleChange}
                required
                style={inputStyle}
              >
                <option value="">— Seleccione una cita —</option>
                {appointments.map(apt => {
                  const patientName = patientMap.get(apt.idPatient) || 'Paciente';
                  return (
                    <option key={apt.id} value={apt.id}>
                      {patientName} — {fmtDate(apt.saAppointmentDate)}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Session type */}
            <div>
              <label style={labelStyle}>Tipo de sesión *</label>
              <select name="psy_session_type" value={form.psy_session_type ?? 'evaluation'} onChange={handleChange} required style={inputStyle}>
                {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={labelStyle}>Fecha de sesión</label>
              <input type="date" name="psy_date" value={form.psy_date ?? ''} onChange={handleChange} style={inputStyle} />
            </div>

            {/* Mood */}
            <div>
              <label style={labelStyle}>Estado de ánimo *</label>
              <select name="psy_mood" value={form.psy_mood ?? 'stable'} onChange={handleChange} required style={inputStyle}>
                {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            {/* Cognitive status */}
            <div>
              <label style={labelStyle}>Estado cognitivo *</label>
              <select name="psy_cognitive_status" value={form.psy_cognitive_status ?? 'normal'} onChange={handleChange} required style={inputStyle}>
                {COGNITIVE_STATES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Observations */}
            <div style={fullRow}>
              <label style={labelStyle}>Observaciones clínicas</label>
              <textarea name="psy_observations" value={form.psy_observations ?? ''} onChange={handleChange} rows={3} placeholder="Observaciones de la sesión..." style={textareaStyle} />
            </div>

            {/* Therapy goal */}
            <div style={fullRow}>
              <label style={labelStyle}>Objetivo terapéutico</label>
              <textarea name="psy_therapy_goal" value={form.psy_therapy_goal ?? ''} onChange={handleChange} rows={3} placeholder="Meta o propósito de la sesión..." style={textareaStyle} />
            </div>

            {/* Progress */}
            <div style={fullRow}>
              <label style={labelStyle}>Progreso y evolución</label>
              <textarea name="psy_progress" value={form.psy_progress ?? ''} onChange={handleChange} rows={3} placeholder="Notas sobre el avance del paciente..." style={textareaStyle} />
            </div>

          </div>

          {/* Buttons */}
          <div style={btnRow}>
            <button type="button" style={btnCancel} onClick={() => navigate('/psychology')} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" style={{ ...btnSubmit, opacity: loading ? 0.75 : 1 }} disabled={loading}>
              {loading && <span style={spinnerStyle} />}
              {loading ? 'Guardando…' : 'Crear sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
