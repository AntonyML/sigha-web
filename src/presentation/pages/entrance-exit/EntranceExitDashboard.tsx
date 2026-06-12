import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ChevronLeft, CheckCircle2, Loader2, LogIn, LogOut, Inbox, ChevronsDown } from 'lucide-react'
import { entranceExitService } from '../../../services/entranceExitService'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import type { EntranceExitResponse } from '../../../types/entranceExit'
import EntranceExitNav from './EntranceExitNav'

const TYPE_LABELS: Record<string, string> = {
  'employee': 'Empleado', 'older adult': 'Adulto Mayor', 'visitor': 'Visitante',
  'volunteer': 'Voluntario', 'vehicle': 'Vehículo', 'other': 'Otro'
}
const getFullName = (item: EntranceExitResponse) =>
  [item.eeName, item.eeFLastName, item.eeSLastName].filter(Boolean).join(' ') || 'Sin nombre'
const fmtDT = (s?: string) => s ? new Date(s).toLocaleString('es-CR') : 'N/A'

export default function EntranceExitDashboard() {
  const [activeEntrances, setActiveEntrances] = useState<EntranceExitResponse[]>([])
  const [activeExits,     setActiveExits]     = useState<EntranceExitResponse[]>([])
  const [loading,         setLoading]         = useState(true)
  const [bulkLoading,     setBulkLoading]     = useState(false)
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [entrances, exits] = await Promise.all([
        entranceExitService.getActiveEntrances(),
        entranceExitService.getActiveExits()
      ])
      setActiveEntrances(Array.isArray(entrances) ? entrances : [])
      setActiveExits(Array.isArray(exits) ? exits : [])
    } catch {
      setActiveEntrances([])
      setActiveExits([])
    } finally {
      setLoading(false)
    }
  }

  const handleFinalize = async (item: EntranceExitResponse, type: 'entrance' | 'exit') => {
    const ok = await feedback.confirm(
      'Finalizar registro',
      `¿Finalizar el registro de ${getFullName(item)}?`
    )
    if (!ok) return
    try {
      if (type === 'entrance') await entranceExitService.finalizeEntranceRecord(item.id)
      else await entranceExitService.finalizeExitRecord(item.id)
      feedback.success('Registro finalizado correctamente')
      await loadData()
    } catch {
      feedback.error('No se pudo finalizar el registro')
    }
  }

  const handleBulkClose = async () => {
    const total = activeEntrances.length + activeExits.length
    if (total === 0) { feedback.error('No hay registros activos para cerrar'); return }
    const ok = await feedback.confirm(
      'Cierre masivo',
      `¿Cerrar los ${total} registro(s) activo(s)? Esta acción no se puede deshacer.`
    )
    if (!ok) return
    setBulkLoading(true)
    try {
      await Promise.all([
        ...activeEntrances.map(r => entranceExitService.finalizeEntranceRecord(r.id)),
        ...activeExits.map(r => entranceExitService.finalizeExitRecord(r.id))
      ])
      feedback.success(`${total} registro(s) cerrado(s) exitosamente`)
      feedback.showNotification({ title: 'Cierre masivo', message: `${total} registros activos fueron cerrados.`, variant: 'success' })
      await loadData()
    } catch {
      feedback.error('Ocurrió un error durante el cierre masivo. Algunos registros pueden no haberse cerrado.')
      await loadData()
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button type="button" onClick={() => navigate('/main-menu')}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.8125rem' }}>
            <ChevronLeft size={15} /> Menú
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Control de Acceso</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(activeEntrances.length + activeExits.length) > 0 && (
            <button type="button" onClick={handleBulkClose} disabled={bulkLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8375rem' }}>
              {bulkLoading
                ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Cerrando...</>
                : <><ChevronsDown size={14} /> Cerrar todos ({activeEntrances.length + activeExits.length})</>}
            </button>
          )}
          <button type="button" onClick={loadData} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 0.8s linear infinite' } : {}} /> Actualizar
          </button>
        </div>
      </div>

      {/* Nav */}
      <EntranceExitNav />

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '3rem', justifyContent: 'center', color: '#64748b' }}>
          <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} /> Cargando registros activos
        </div>
      ) : (
        <>
          {/* Summary badges */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.625rem', fontSize: '0.8125rem', color: '#1d4ed8' }}>
              <LogIn size={15} /> <strong>{activeEntrances.length}</strong> entradas activas
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.625rem', fontSize: '0.8125rem', color: '#15803d' }}>
              <LogOut size={15} /> <strong>{activeExits.length}</strong> salidas activas
            </div>
          </div>

          {/* Entrances table */}
          <ActiveTable
            title="Registros de Entrada Activos"
            accent="#2563eb"
            accentBg="#eff6ff"
            icon={<LogIn size={16} color="#fff" />}
            items={activeEntrances}
            dateField="eeDatetimeEntrance"
            typeLabels={TYPE_LABELS}
            onFinalize={item => handleFinalize(item, 'entrance')}
          />

          {/* Exits table */}
          <ActiveTable
            title="Registros de Salida Activos"
            accent="#16a34a"
            accentBg="#f0fdf4"
            icon={<LogOut size={16} color="#fff" />}
            items={activeExits}
            dateField="eeDatetimeExit"
            typeLabels={TYPE_LABELS}
            onFinalize={item => handleFinalize(item, 'exit')}
          />
        </>
      )}
    </div>
  )
}

function ActiveTable({ title, accent, accentBg, icon, items, dateField, typeLabels, onFinalize }: {
  title: string; accent: string; accentBg: string; icon: React.ReactNode
  items: EntranceExitResponse[]; dateField: 'eeDatetimeEntrance' | 'eeDatetimeExit'
  typeLabels: Record<string, string>; onFinalize: (item: EntranceExitResponse) => void
}) {
  return (
    <div style={{ border: `1px solid ${accent}33`, borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.875rem 1.25rem', background: accent, color: '#fff' }}>
        {icon}
        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{title}</span>
        <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.125rem 0.625rem', fontSize: '0.8125rem', fontWeight: 600 }}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', padding: '2.5rem', color: '#94a3b8', background: accentBg }}>
          <Inbox size={22} /> Sin registros activos
        </div>
      ) : (
        <div style={{ overflowX: 'auto', maxHeight: 260, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Tipo', 'Identificación', 'Nombre', 'Fecha/Hora', 'Observaciones', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 1rem', textAlign: h === 'Acción' ? 'right' : 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.625rem 1rem' }}>
                    <span style={{ background: `${accent}20`, color: accent, borderRadius: '999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      {typeLabels[item.eeType] ?? item.eeType}
                    </span>
                  </td>
                  <td style={{ padding: '0.625rem 1rem', fontWeight: 500, fontFamily: 'monospace' }}>{item.eeIdentification || 'N/A'}</td>
                  <td style={{ padding: '0.625rem 1rem' }}>{getFullName(item)}</td>
                  <td style={{ padding: '0.625rem 1rem', whiteSpace: 'nowrap', color: '#64748b' }}>{fmtDT(item[dateField])}</td>
                  <td style={{ padding: '0.625rem 1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>{item.eeObservations || ''}</td>
                  <td style={{ padding: '0.625rem 1rem', textAlign: 'right' }}>
                    <button type="button" onClick={() => onFinalize(item)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                      <CheckCircle2 size={13} /> Finalizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}