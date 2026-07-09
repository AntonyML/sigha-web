import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { VirtualFile, UpdateVirtualFileData } from '../../../types/virtualFile'
import { defaultVirtualFile } from '../../../types/virtualFile'
import SelectsLocation from '../../components/molecules/SelectsLocation/SelectsLocation'
import { virtualFileService } from '../../../services/virtualFileService'
import { clinicalConditionService } from '../../../services/clinicalConditionService'
import type { ClinicalCondition } from '../../../types/clinicalCondition'
import { useCedulaLookup } from '../../hooks/useCedulaLookup'
import { formatColones, parseColones } from '@/utils/currencyUtils'

function formatCedulaNacional(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 1) return digits
  if (digits.length <= 5) return `${digits[0]}-${digits.slice(1)}`
  return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5)}`
}

/* ── Helpers ──────────────────────────────────────────────── */
const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-','UNKNOWN']
const RCVG_OPTIONS: [string, string][] = [
  ['< 10%',     '< 10%'],
  ['e /10y20%', '10 – 20%'],
  ['e /20y30%', '20 – 30%'],
  ['e /40y40%', '30 – 40%'],
  ['> 40%',     '> 40%'],
  ['UNKNOWN',   'N/E'],
]

function imcColor(imc: string) {
  const v = parseFloat(imc)
  if (isNaN(v)) return { bg: '#f1f5f9', fg: '#64748b', label: '' }
  if (v < 18.5) return { bg: '#dbeafe', fg: '#1d4ed8', label: 'Bajo peso' }
  if (v < 25)   return { bg: '#dcfce7', fg: '#15803d', label: 'Normal' }
  if (v < 30)   return { bg: '#fef9c3', fg: '#a16207', label: 'Sobrepeso' }
  return              { bg: '#fee2e2', fg: '#b91c1c', label: 'Obesidad' }
}

/* ══════════════════════════════════════════════════════════ */
export default function EditVirtualFile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [formData,     setFormData]     = useState<VirtualFile>(defaultVirtualFile)
  const [conditions,   setConditions]   = useState<ClinicalCondition[]>([])
  const [condIds,      setCondIds]      = useState<number[]>([])
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [saveOk,       setSaveOk]       = useState(false)
  const [ingresoDisplay, setIngresoDisplay] = useState('')
  const [cedulaIsForeign, setCedulaIsForeign] = useState(false)

  /* ── Cédula: validación, normalización y consulta de identificación ── */
  const {
    status:           cedulaStatus,
    helperText:       cedulaHelper,
    normalizedRaw:    cedulaNormalized,
    kind:             cedulaKind,
    showForeignDialog,
    confirmForeign,
    denyForeign,
  } = useCedulaLookup(
    cedulaIsForeign ? '' : formData.cedula,
    (nombre, normalized) => setFormData(p => ({ ...p, nombreApellido: nombre, cedula: normalized })),
    { skipFirstRun: true }
  )

  /* ── Load data ─────────────────────────────────────────── */
  useEffect(() => {
    if (!id) { setLoading(false); return }
    Promise.all([
      virtualFileService.getVirtualFileById(Number(id)),
      clinicalConditionService.getAllClinicalConditions(),
    ]).then(([file, conds]) => {
      setFormData(file)
      setConditions(conds)
      setIngresoDisplay(formatColones(file.ingresoEconomico ?? 0))
      // Reconstruct condIds from the boolean flags set by mapApiToVirtualFile
      const COND_FLAGS: [keyof typeof file, number][] = [
        ['hta',1],['dbt',2],['dislip',3],['irc',4],['cardioIsq',5],
        ['acv',6],['amputacion',7],['tabaquismo',8],['alcoholismo',9],
        ['parkinson',10],['demencia',11],['prostatismo',12],
        ['incontinenciaUrinaria',13],['caidasFrecuentes',14],['neoplasias',15],
      ]
      setCondIds(COND_FLAGS.filter(([k]) => file[k] === true).map(([,id]) => id))
    }).catch(() => setError('No se pudo cargar el expediente.'))
      .finally(() => setLoading(false))
  }, [id])
  /* ── Auto-calc IMC ─────────────────────────────────────── */
  useEffect(() => {
    const peso = parseFloat(formData.peso)
    const cm   = parseFloat(formData.talla)
    if (!isNaN(peso) && !isNaN(cm) && cm > 0) {
      const m = cm / 100
      setFormData(p => ({ ...p, imc: (peso / (m * m)).toFixed(1) }))
    }
  }, [formData.peso, formData.talla])

  /* ── Helpers ───────────────────────────────────────────── */
  const COND_ID_TO_KEY: Record<number, keyof VirtualFile> = {
    1:'hta', 2:'dbt', 3:'dislip', 4:'irc', 5:'cardioIsq',
    6:'acv', 7:'amputacion', 8:'tabaquismo', 9:'alcoholismo',
    10:'parkinson', 11:'demencia', 12:'prostatismo',
    13:'incontinenciaUrinaria', 14:'caidasFrecuentes', 15:'neoplasias',
  }
  function set(field: keyof VirtualFile | 'provincia' | 'canton' | 'distrito', value: string | boolean | number) {
    setFormData(p => ({ ...p, [field]: value } as VirtualFile))
  }
  function toggleCond(id: number) {
    setCondIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      const key = COND_ID_TO_KEY[id]
      if (key) setFormData(p => ({ ...p, [key]: !prev.includes(id) } as VirtualFile))
      return next
    })
  }
  const handleCedulaTypeChange = (isForeign: boolean) => {
    setCedulaIsForeign(isForeign)
    set('cedula', '')
  }

  /* ── Submit ────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setSaveOk(false)
    try {
      const docType = cedulaIsForeign ? 'pasaporte' : (cedulaKind === 'unknown' ? 'nacional' : cedulaKind)
      await virtualFileService.updateVirtualFile(Number(id), { ...formData, documentType: docType } as UpdateVirtualFileData)
      setSaveOk(true)
      setTimeout(() => navigate('/virtualFiles'), 1200)
    } catch (err) {
      console.error(err)
      setError('Error al guardar cambios.')
    } finally {
      setSaving(false)
    }
  }

  const imc = imcColor(formData.imc)

  /* ─── Loading / Error states ─────────────────────────── */
  if (!id) return (
    <div style={wrapStyle}>
      <p style={{ color: '#64748b' }}>No se proporcionó ID del expediente.</p>
      <button onClick={() => navigate('/virtualFiles')} style={btnSecondary}>← Volver</button>
    </div>
  )

  if (loading) return (
    <div style={{ ...wrapStyle, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
      <span style={{ fontSize: '1.5rem', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⏳</span>
      Cargando expediente…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error && loading === false && !formData.cedula) return (
    <div style={wrapStyle}>
      <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.75rem', color: '#b91c1c', marginBottom: '1rem' }}>{error}</div>
      <button onClick={() => navigate('/virtualFiles')} style={btnSecondary}>← Volver</button>
    </div>
  )

  /* ══════════════════════════════════════════════════════ */
  return (
    <div style={wrapStyle}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/virtualFiles')} style={btnSecondary}>← Volver</button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
              Editar expediente
            </h1>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
              {formData.nombreApellido || `#${id}`} · Cédula {formData.cedula || '–'}
            </p>
          </div>
        </div>
        {saveOk && (
          <div style={{ padding: '0.5rem 1rem', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '0.625rem', color: '#15803d', fontWeight: 600, fontSize: '0.875rem' }}>
            ✓ Guardado exitosamente
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.625rem', color: '#b91c1c', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── Datos personales ── */}
        <Section title="👤 Datos personales">
          <Grid cols={3}>
            <Field label="Cédula *">
              <CedulaInput
                value={formData.cedula}
                status={cedulaStatus}
                helperText={cedulaHelper}
                normalized={cedulaNormalized}
                isForeign={cedulaIsForeign}
                onTypeChange={handleCedulaTypeChange}
                onChange={v => set('cedula', v)}
              />
            </Field>
            {showForeignDialog && (
              <ForeignConfirmDialog
                onConfirm={confirmForeign}
                onDeny={denyForeign}
              />
            )}
            <Field label="Fecha de nacimiento">
              <input type="date" className="form-control" value={formData.fechaNacimiento}
                onChange={e => {
                  set('fechaNacimiento', e.target.value)
                  const d = e.target.value ? new Date(e.target.value) : null
                  if (d) {
                    const age = Math.floor((Date.now() - d.getTime()) / (1000*60*60*24*365.25))
                    set('edad', String(age))
                  }
                }} />
            </Field>
            <Field label="Edad">
              <input type="number" min={0} max={130} className="form-control" value={formData.edad}
                onChange={e => set('edad', e.target.value)} />
            </Field>
          </Grid>

          <Grid cols={2}>
            <Field label="Nombre completo *">
              <input className="form-control" value={formData.nombreApellido}
                onChange={e => set('nombreApellido', e.target.value)} />
            </Field>
            <Field label="Estado civil">
              <select className="form-select" value={formData.estadoCivil}
                onChange={e => set('estadoCivil', e.target.value)}>
                <option value="">Seleccionar</option>
                <option value="soltero">Soltero(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="viudo">Viudo(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="union-libre">Unión libre</option>
              </select>
            </Field>
          </Grid>

          <Grid cols={2}>
            <Field label="Género">
              <div style={{ display: 'flex', gap: '0.625rem', paddingTop: '0.25rem', flexWrap: 'wrap' }}>
                {[['male','Masculino'],['female','Femenino'],['not specified','N/E']].map(([v,l]) => (
                  <PillBtn key={v} active={formData.genero === v} onClick={() => set('genero', v)}>{l}</PillBtn>
                ))}
              </div>
            </Field>
            <Field label="Tipo de sangre">
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem', flexWrap: 'wrap' }}>
                {BLOOD_TYPES.map(bt => (
                  <PillBtn key={bt} active={formData.tipoSangre === bt} onClick={() => set('tipoSangre', bt)}
                    variant={bt === 'UNKNOWN' ? 'neutral' : 'red'}>{bt === 'UNKNOWN' ? '?' : bt}</PillBtn>
                ))}
              </div>
            </Field>
          </Grid>

          <Grid cols={3}>
            <Field label="Teléfono">
              <input className="form-control" value={formData.telefono || ''}
                onChange={e => set('telefono', e.target.value)} />
            </Field>
            <Field label="Correo electrónico">
              <input type="email" className="form-control" value={formData.email || ''}
                onChange={e => set('email', e.target.value)} />
            </Field>
            <SelectsLocation provincia={formData.provincia ?? ''} canton={formData.canton ?? ''} distrito={formData.distrito ?? ''} onChange={(field, value) => set(field, value)} />
          </Grid>

          <Grid cols={3}>
            <Field label="Vivienda">
              <select className="form-control" value={formData.vivienda} onChange={e => set('vivienda', e.target.value)}>
                <option value="">Seleccione...</option>
                <option value="Propia">Propia</option>
                <option value="Alquilada">Alquilada</option>
                <option value="Prestada">Prestada</option>
                <option value="Otro">Otro</option>
              </select>
            </Field>
            <Field label="Años de escolaridad">
              <select className="form-select" value={formData.anosEscolaridad}
                onChange={e => set('anosEscolaridad', e.target.value)}>
                <option value="">Seleccionar</option>
                {['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'].map(n => (
                  <option key={n} value={n}>{n === '0' ? 'Sin escolaridad' : `${n} años`}</option>
                ))}
              </select>
            </Field>
            <Field label="Trabajo previo">
              <select className="form-select" value={formData.trabajoPrevio}
                onChange={e => set('trabajoPrevio', e.target.value)}>
                <option value="">Seleccionar</option>
                <option value="jubilacion">Jubilación</option>
                <option value="pension">Pensión</option>
                <option value="otros">Otros</option>
              </select>
            </Field>
          </Grid>

          <Grid cols={2}>
            <Field label="Cantidad de hijos">
              <input type="number" min={0} className="form-control" value={formData.cantidadHijos || 0}
                onChange={e => set('cantidadHijos', parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="Ingreso económico (₡)">
              <input type="text" inputMode="numeric" className="form-control"
                value={ingresoDisplay}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9.,]/g, '')
                  setIngresoDisplay(raw)
                  set('ingresoEconomico', parseColones(raw))
                }}
                onBlur={() => setIngresoDisplay(formatColones(formData.ingresoEconomico as number))}
                onFocus={() => {
                  const raw = String(formData.ingresoEconomico || '')
                  setIngresoDisplay(raw === '0' ? '' : raw)
                }} />
            </Field>
          </Grid>
        </Section>

        {/* ── Antecedentes clínicos ── */}
        <Section title="🩺 Antecedentes clínicos">
          <SubTitle>Signos vitales</SubTitle>
          <Grid cols={4}>
            <Field label="TA – Sistólica / Diastólica (mmHg)">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <input
                  type="number" min={0} max={300} className="form-control"
                  value={formData.ta?.split('/')[0] ?? ''}
                  onChange={e => {
                    const dia = formData.ta?.split('/')[1] ?? ''
                    set('ta', `${e.target.value}/${dia}`)
                  }}
                  placeholder="120"
                  style={{ textAlign: 'center' }}
                />
                <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '1.1rem', flexShrink: 0 }}>/</span>
                <input
                  type="number" min={0} max={200} className="form-control"
                  value={formData.ta?.split('/')[1] ?? ''}
                  onChange={e => {
                    const sys = formData.ta?.split('/')[0] ?? ''
                    set('ta', `${sys}/${e.target.value}`)
                  }}
                  placeholder="80"
                  style={{ textAlign: 'center' }}
                />
              </div>
            </Field>
            <Field label="Peso (kg)">
              <input type="number" step="0.1" className="form-control" value={formData.peso}
                onChange={e => set('peso', e.target.value)} />
            </Field>
            <Field label="Talla (cm)">
              <input type="number" className="form-control" value={formData.talla}
                onChange={e => set('talla', e.target.value)} />
            </Field>
            <Field label="IMC">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: 38 }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: imc.fg }}>{formData.imc || '–'}</span>
                {imc.label && (
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: imc.bg, color: imc.fg, fontWeight: 600 }}>{imc.label}</span>
                )}
              </div>
            </Field>
          </Grid>

          {conditions.length > 0 && (
            <>
              <SubTitle>Condiciones médicas</SubTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.5rem' }}>
                {conditions.filter(c => c.ccName && c.id).map(c => (
                  <label key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem',
                    background: condIds.includes(c.id!) ? '#eff6ff' : '#f8fafc',
                    border: `1px solid ${condIds.includes(c.id!) ? '#93c5fd' : '#e2e8f0'}`,
                    color: condIds.includes(c.id!) ? '#1d4ed8' : '#475569',
                    fontWeight: condIds.includes(c.id!) ? 600 : 400, transition: 'all 150ms',
                  }}>
                    <input type="checkbox" checked={condIds.includes(c.id!)}
                      onChange={() => toggleCond(c.id!)}
                      style={{ accentColor: '#3b82f6', width: 15, height: 15 }} />
                    {c.ccName}
                  </label>
                ))}
              </div>
            </>
          )}

          <Grid cols={2} style={{ marginTop: '1rem' }}>
            <Field label="Neoplasias (detalle)">
              <input className="form-control" value={formData.neoplasiasDetalle}
                onChange={e => set('neoplasiasDetalle', e.target.value)} />
            </Field>
            <Field label="Otras condiciones">
              <input className="form-control" value={formData.otrasCondiciones}
                onChange={e => set('otrasCondiciones', e.target.value)} />
            </Field>
          </Grid>

          <SubTitle style={{ marginTop: '1.25rem' }}>Riesgo cardiovascular global (RCVG)</SubTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {RCVG_OPTIONS.map(([v, l]) => (
              <PillBtn key={v} active={formData.rcvg === v} onClick={() => set('rcvg', v)} size="md">{l}</PillBtn>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.25rem' }}>
            <div>
              <SubTitle>Dificultades de visión</SubTitle>
              <ToggleYesNo value={formData.dificultadesVision} onChange={v => set('dificultadesVision', v)} name="vision" />
            </div>
            <div>
              <SubTitle>Problemas de audición</SubTitle>
              <ToggleYesNo value={formData.problemasAudicion} onChange={v => set('problemasAudicion', v)} name="audicion" />
            </div>
          </div>
        </Section>

        {/* ── Botones ── */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/virtualFiles')} style={btnSecondary}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} style={{
            padding: '0.625rem 1.75rem', background: saving ? '#86efac' : '#16a34a', color: '#fff',
            border: 'none', borderRadius: '0.625rem', cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            {saving
              ? <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⏳</span> Guardando…</>
              : '✓ Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/* Sub-components                                              */
/* ═══════════════════════════════════════════════════════════ */

const wrapStyle: React.CSSProperties = { maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem 4rem', fontFamily: 'inherit' }

const btnSecondary: React.CSSProperties = { padding: '0.375rem 0.875rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', color: '#475569', fontSize: '0.8125rem', fontWeight: 500 }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{title}</h2>
      {children}
    </div>
  )
}

function SubTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ margin: '0 0 0.625rem', fontWeight: 600, fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', ...style }}>{children}</p>
}

function Grid({ cols, children, style }: { cols: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem', marginBottom: '1rem', ...style }}>
      {children}
    </div>
  )
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>{label}</label>
      {children}
    </div>
  )
}

function PillBtn({ active, onClick, children, variant = 'blue', size = 'sm' }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
  variant?: 'blue' | 'red' | 'neutral'; size?: 'sm' | 'md'
}) {
  const colors = {
    blue:    { on: { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' }, off: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' } },
    red:     { on: { bg: '#fee2e2', border: '#fca5a5', color: '#b91c1c' }, off: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' } },
    neutral: { on: { bg: '#f1f5f9', border: '#94a3b8', color: '#475569' }, off: { bg: '#f8fafc', border: '#e2e8f0', color: '#94a3b8' } },
  }
  const c = active ? colors[variant].on : colors[variant].off
  const pad = size === 'md' ? '0.45rem 1rem' : '0.3rem 0.75rem'
  return (
    <button type="button" onClick={onClick} style={{
      padding: pad, borderRadius: '999px', border: `1px solid ${c.border}`,
      background: c.bg, color: c.color, cursor: 'pointer', fontSize: '0.8125rem',
      fontWeight: active ? 700 : 400, transition: 'all 150ms',
    }}>{children}</button>
  )
}

function ToggleYesNo({ value, onChange }: { value: string; onChange: (v: string) => void; name?: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {['SI','NO'].map(v => (
        <button key={v} type="button" onClick={() => onChange(v)} style={{
          flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: `2px solid ${value === v ? (v === 'SI' ? '#f87171' : '#86efac') : '#e2e8f0'}`,
          background: value === v ? (v === 'SI' ? '#fee2e2' : '#dcfce7') : '#f8fafc',
          color: value === v ? (v === 'SI' ? '#b91c1c' : '#15803d') : '#94a3b8',
          fontWeight: value === v ? 700 : 400, cursor: 'pointer', fontSize: '0.9375rem', transition: 'all 150ms',
        }}>{v}</button>
      ))}
    </div>
  )
}

/* ── CedulaInput ───────────────────────────────────────────────── */
function CedulaInput({
  value, status, helperText, normalized, onChange, isForeign, onTypeChange,
}: {
  value:      string
  status:     'idle' | 'loading' | 'found' | 'notfound' | 'error'
  helperText: string
  normalized: string
  isForeign:  boolean
  onTypeChange: (v: boolean) => void
  onChange:   (v: string) => void
}) {
  const borderColor =
    status === 'found'    ? '#86efac' :
    status === 'notfound' ? '#fca5a5' :
    status === 'error'    ? '#f87171' : undefined

  const helperColor =
    status === 'found'  ? '#15803d' :
    status === 'error'  ? '#b91c1c' : '#b45309'

  const showNormalized =
    !isForeign &&
    normalized.length === 9 &&
    normalized !== value.replace(/[^0-9]/g, '') &&
    status !== 'idle'

  const displayValue = isForeign ? value : formatCedulaNacional(value)

  function handleInputChange(raw: string) {
    if (isForeign) {
      onChange(raw)
    } else {
      const digits = raw.replace(/\D/g, '').slice(0, 9)
      onChange(digits)
    }
  }

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '0.3rem 0.75rem',
    border: `1px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
    borderRadius: '0.375rem',
    background: active ? '#3b82f6' : '#f8fafc',
    color: active ? '#fff' : '#64748b',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: active ? 700 : 400,
    transition: 'all 150ms',
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
        <button type="button" onClick={() => onTypeChange(false)} style={toggleStyle(!isForeign)}>Nacional</button>
        <button type="button" onClick={() => onTypeChange(true)} style={toggleStyle(isForeign)}>Extranjero</button>
      </div>
      <div style={{ position: 'relative' }}>
        <input
          className="form-control"
          value={displayValue}
          onChange={e => handleInputChange(e.target.value)}
          placeholder={isForeign ? 'Número de identificación' : '1-2345-6789'}
          style={{ paddingRight: '2.25rem', borderColor }}
        />
        <span style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', pointerEvents: 'none' }}>
          {status === 'loading'  && <span style={{ animation: 'spin 0.7s linear infinite', display: 'inline-block' }}>⏳</span>}
          {status === 'found'    && '✅'}
          {status === 'notfound' && '❓'}
          {status === 'error'    && '⛔'}
        </span>
      </div>
      {showNormalized && (
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#6366f1' }}>
          Número normalizado: <strong>{normalized}</strong> (ceros completados)
        </p>
      )}
      {helperText && (
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: helperColor }}>{helperText}</p>
      )}
    </div>
  )
}

/* ── ForeignConfirmDialog ─────────────────────────────────── */
function ForeignConfirmDialog({ onConfirm, onDeny }: { onConfirm: () => void; onDeny: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: '1rem', padding: '2rem',
        maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.75rem' }}>🌍</div>
        <h3 style={{ margin: '0 0 0.5rem', textAlign: 'center', fontSize: '1.0625rem', color: '#1e293b' }}>
          ¿Cédula extranjera (DIMEX)?
        </h3>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>
          El número tiene <strong>11 o más dígitos</strong>, lo que corresponde a un DIMEX (extranjero
          residente en Costa Rica). ¿Confirma que esta persona es extranjera?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={onDeny} style={{
            flex: 1, padding: '0.625rem 1rem', borderRadius: '0.5rem',
            border: '1.5px solid #e2e8f0', background: '#f8fafc',
            color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
          }}>
            No, corregir cédula
          </button>
          <button type="button" onClick={onConfirm} style={{
            flex: 1, padding: '0.625rem 1rem', borderRadius: '0.5rem',
            border: 'none', background: '#3b82f6',
            color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
          }}>
            Sí, es extranjero
          </button>
        </div>
      </div>
    </div>
  )
}
