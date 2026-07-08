import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { olderAdultFamilyService } from '../../../services/olderAdultFamilyService';
import type { CreateOlderAdultFamilyDto, KinshipType } from '../../../services/olderAdultFamilyService';
import {
  WizardTopBar,
  WizardStepper,
  WizardCard,
  WizardGrid,
  WizardField,
  WizardNav,
  IdentificationField,
  type WizardStepDef,
} from '../../components/molecules/CreationWizard';

const STEPS: WizardStepDef[] = [
  { id: 1, label: 'Datos personales', icon: '👤' },
  { id: 2, label: 'Contacto', icon: '📞' },
];

const KINSHIP_OPTIONS: KinshipType[] = [
  'son', 'daughter', 'grandson', 'granddaughter', 'brother', 'sister',
  'nephew', 'niece', 'husband', 'wife', 'legal guardian', 'other', 'not specified',
];

const initial: CreateOlderAdultFamilyDto = {
  pfIdentification: '', pfName: '', pfFLastName: '', pfSLastName: '', pfPhoneNumber: '', pfEmail: '', pfKinship: 'not specified' as KinshipType,
};

export default function CreateOlderAdultFamilyPage() {
  const [form, setForm] = useState<CreateOlderAdultFamilyDto>(initial);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function set<K extends keyof CreateOlderAdultFamilyDto>(field: K, value: CreateOlderAdultFamilyDto[K]) {
    setForm(p => ({ ...p, [field]: value }));
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!form.pfIdentification.trim()) return 'La cédula es requerida';
      if (!form.pfName.trim()) return 'El nombre es requerido';
      if (!form.pfFLastName.trim()) return 'El primer apellido es requerido';
      if (!form.pfSLastName.trim()) return 'El segundo apellido es requerido';
    }
    return null;
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep(s => Math.min(s + 1, STEPS.length));
  }

  function handlePrev() {
    if (step === 1) { navigate('/older-adult-family'); return; }
    setStep(s => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    const stepError = validateStep(1);
    if (stepError) { setError(stepError); setStep(1); return; }

    setLoading(true);
    setError('');
    try {
      await olderAdultFamilyService.create(form);
      navigate('/older-adult-family');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al crear';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem 4rem', fontFamily: 'inherit' }}>

      <WizardTopBar
        title="Nuevo familiar"
        onBack={() => navigate('/older-adult-family')}
        currentStep={step}
        totalSteps={STEPS.length}
      />

      <WizardStepper steps={STEPS} currentStep={step} onStepClick={setStep} />

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
        </div>
      )}

      {/* ── Paso 1: Datos personales ── */}
      {step === 1 && (
        <WizardCard title="👤 Datos personales">
          <WizardGrid cols={1}>
            <IdentificationField
              label="Cédula"
              required
              value={form.pfIdentification}
              onChange={v => set('pfIdentification', v)}
              onResolved={({ givenNames, firstLastName, secondLastName, normalizedCedula }) => {
                setForm(p => ({
                  ...p,
                  pfIdentification: normalizedCedula,
                  pfName: givenNames,
                  pfFLastName: firstLastName,
                  pfSLastName: secondLastName,
                }));
              }}
            />
          </WizardGrid>
          <p style={{ margin: '-0.5rem 0 1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Al encontrar la cédula se autocompletan nombre y apellidos. Puedes ajustarlos manualmente después.
          </p>
          <WizardGrid cols={3}>
            <WizardField label="Nombre(s)" required>
              <input className="form-control" value={form.pfName}
                onChange={e => set('pfName', e.target.value)} placeholder="Ej: María José" disabled={loading} maxLength={50} />
            </WizardField>
            <WizardField label="Primer apellido" required>
              <input className="form-control" value={form.pfFLastName}
                onChange={e => set('pfFLastName', e.target.value)} placeholder="Primer apellido" disabled={loading} maxLength={50} />
            </WizardField>
            <WizardField label="Segundo apellido" required>
              <input className="form-control" value={form.pfSLastName}
                onChange={e => set('pfSLastName', e.target.value)} placeholder="Segundo apellido" disabled={loading} maxLength={50} />
            </WizardField>
          </WizardGrid>
          <WizardGrid cols={1}>
            <WizardField label="Parentesco">
              <select className="form-select" value={form.pfKinship}
                onChange={e => set('pfKinship', e.target.value as KinshipType)} disabled={loading}>
                {KINSHIP_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </WizardField>
          </WizardGrid>
        </WizardCard>
      )}

      {/* ── Paso 2: Contacto ── */}
      {step === 2 && (
        <WizardCard title="📞 Contacto">
          <WizardGrid cols={2}>
            <WizardField label="Teléfono">
              <input className="form-control" value={form.pfPhoneNumber ?? ''}
                onChange={e => set('pfPhoneNumber', e.target.value)} placeholder="+506 8888-1234" disabled={loading} maxLength={20} />
            </WizardField>
            <WizardField label="Correo electrónico">
              <input type="email" className="form-control" value={form.pfEmail ?? ''}
                onChange={e => set('pfEmail', e.target.value)} placeholder="correo@email.com" disabled={loading} maxLength={256} />
            </WizardField>
          </WizardGrid>

          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>Resumen</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', fontSize: '0.8125rem', color: '#475569' }}>
              <span>👤 {[form.pfName, form.pfFLastName, form.pfSLastName].filter(Boolean).join(' ') || <em style={{ color: '#cbd5e1' }}>Sin nombre</em>}</span>
              <span>🪪 {form.pfIdentification || <em style={{ color: '#cbd5e1' }}>Sin cédula</em>}</span>
              <span>👪 {form.pfKinship}</span>
            </div>
          </div>
        </WizardCard>
      )}

      <WizardNav
        step={step}
        totalSteps={STEPS.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmit}
        saving={loading}
        submitLabel="✓ Crear familiar"
        savingLabel="⏳ Guardando…"
      />
    </div>
  );
}
