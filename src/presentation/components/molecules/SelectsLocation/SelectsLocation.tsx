import { useMemo } from 'react'
import { costarica } from '@/data/costaRica'

type LocationField = 'provincia' | 'canton' | 'distrito'

interface Props {
  provincia: string
  canton: string
  distrito: string
  onChange: (field: LocationField, value: string) => void
}

export default function SelectsLocation({ provincia, canton, distrito, onChange }: Props) {
  const provincias = useMemo(() => costarica.map(p => p.provincia), [])
  const cantones = useMemo(() => {
    const p = costarica.find(p => p.provincia === provincia)
    return p ? p.cantones.map(c => c.nombre) : []
  }, [provincia])
  const distritosList = useMemo(() => {
    const p = costarica.find(p => p.provincia === provincia)
    if (!p) return []
    const c = p.cantones.find(c => c.nombre === canton)
    return c ? c.distritos : []
  }, [provincia, canton])

  return (
    <>
      <div className="mb-2">
        <label className="text-uppercase small fw-semibold text-secondary mb-1">Provincia</label>
        <select className="form-select" value={provincia} onChange={e => { onChange('provincia', e.target.value); onChange('canton', ''); onChange('distrito', '') }}>
          <option value="">Seleccione…</option>
          {provincias.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label className="text-uppercase small fw-semibold text-secondary mb-1">Cantón</label>
        <select className="form-select" value={canton} onChange={e => { onChange('canton', e.target.value); onChange('distrito', '') }} disabled={!provincia}>
          <option value="">Seleccione…</option>
          {cantones.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label className="text-uppercase small fw-semibold text-secondary mb-1">Distrito</label>
        <select className="form-select" value={distrito} onChange={e => onChange('distrito', e.target.value)} disabled={!canton}>
          <option value="">Seleccione…</option>
          {distritosList.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </>
  )
}