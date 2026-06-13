import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Search, X, Calendar, Download, Printer, ChevronLeft, Inbox, LogIn, LogOut } from 'lucide-react'
import { entranceExitService } from '../../../services/entranceExitService'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import type { EntranceExitResponse } from '../../../types/entranceExit'
import EntranceExitNav from './EntranceExitNav'
import '../../styles/lp.css'

const TYPE_LABELS: Record<string, string> = {
  'employee': 'Empleado', 'older adult': 'Adulto Mayor', 'visitor': 'Visitante',
  'volunteer': 'Voluntario', 'vehicle': 'Vehículo', 'other': 'Otro'
}
const getFullName = (item: EntranceExitResponse) =>
  [item.eeName, item.eeFLastName, item.eeSLastName].filter(Boolean).join(' ') || 'Sin nombre'
const fmtDT = (s?: string) => s ? new Date(s).toLocaleString('es-CR') : 'N/A'

function inRange(dateStr: string | undefined, from: string, to: string): boolean {
  if (!dateStr) return true
  const d = new Date(dateStr).getTime()
  if (from && d < new Date(from).getTime()) return false
  if (to   && d > new Date(to + 'T23:59:59').getTime()) return false
  return true
}

function exportCsv(records: EntranceExitResponse[]) {
  const headers = ['ID', 'Tipo persona', 'Acceso', 'Identificación', 'Nombre completo', 'Fecha entrada', 'Fecha salida', 'Estado', 'Observaciones']
  const rows = records.map(r => [
    r.id,
    TYPE_LABELS[r.eeType] ?? r.eeType,
    r.eeAccessType === 'entrance' ? 'Entrada' : 'Salida',
    r.eeIdentification ?? '',
    getFullName(r),
    r.eeDatetimeEntrance ? new Date(r.eeDatetimeEntrance).toLocaleString('es-CR') : '',
    r.eeDatetimeExit     ? new Date(r.eeDatetimeExit).toLocaleString('es-CR')     : '',
    r.eeClose ? 'Finalizado' : 'Activo',
    r.eeObservations ?? ''
  ])
  const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `historial-acceso-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function EntranceExitHistory() {
  const [records,   setRecords]   = useState<EntranceExitResponse[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [typeFilter,setTypeFilter]= useState('')   // entrance | exit | ''
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await entranceExitService.getClosedRecords()
      setRecords(Array.isArray(data) ? data : [])
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const term = search.trim().toLowerCase()
  const filtered = records.filter(r => {
    const matchText = !term || (
      (r.eeIdentification ?? '').toLowerCase().includes(term) ||
      getFullName(r).toLowerCase().includes(term) ||
      (TYPE_LABELS[r.eeType] ?? r.eeType).toLowerCase().includes(term)
    )
    const dateRef = r.eeDatetimeEntrance || r.eeDatetimeExit
    const matchDate = inRange(dateRef, dateFrom, dateTo)
    const matchType = !typeFilter || r.eeAccessType === typeFilter
    return matchText && matchDate && matchType
  })

  const hasFilter = !!term || !!dateFrom || !!dateTo || !!typeFilter
  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); setTypeFilter('') }

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered, 25)

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
      <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } body { font-size: 11px; } }`}</style>

      {/* Header */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button type="button" onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.8125rem' }}>
            <ChevronLeft size={15} /> Menú
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Historial de Acceso</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => exportCsv(filtered)} disabled={filtered.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
            <Download size={14} /> Exportar CSV
          </button>
          <button type="button" onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: '#f5f3ff', color: '#5b21b6', border: '1px solid #c4b5fd', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
            <Printer size={14} /> Imprimir / PDF
          </button>
          <button type="button" onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b' }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* Nav */}
      <div className="no-print"><EntranceExitNav /></div>

      {/* Filters */}
      <div className="no-print" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
        {/* Text */}
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input type="text" placeholder="Buscar nombre, identificación" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 2rem 0.5rem 2rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc', boxSizing: 'border-box' }} />
          {search && <button type="button" onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><X size={14} /></button>}
        </div>

        {/* Access type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo acceso</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc', minWidth: 130 }}>
            <option value="">Todos</option>
            <option value="entrance">Entrada</option>
            <option value="exit">Salida</option>
          </select>
        </div>

        {/* Date from */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> Desde</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc' }} />
        </div>

        {/* Date to */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> Hasta</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc' }} />
        </div>

        {hasFilter && (
          <button type="button" onClick={clearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      {hasFilter && (
        <p className="no-print" style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
          {filtered.length} de {records.length} registros
        </p>
      )}

      {/* Print header */}
      <div style={{ display: 'none' }} className="print-only">
        <h2>Historial de Acceso  {new Date().toLocaleDateString('es-CR')}</h2>
        {dateFrom || dateTo ? <p>Período: {dateFrom || ''}  {dateTo || ''}</p> : null}
        <p>Total: {filtered.length} registros</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '3rem', justifyContent: 'center', color: '#64748b' }}>
          <RefreshCw size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Cargando historial
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <Inbox size={40} style={{ marginBottom: '0.75rem', opacity: 0.35 }} />
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>
            {hasFilter ? 'Sin resultados para los filtros aplicados' : 'No hay registros finalizados'}
          </p>
          {hasFilter && <button type="button" onClick={clearFilters} style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>Limpiar filtros</button>}
        </div>
      ) : (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', background: '#fff', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8375rem' }}>
              <thead>
                <tr style={{ background: '#1e293b' }}>
                  {['#', 'Tipo persona', 'Acceso', 'Identificación', 'Nombre', 'Fecha entrada', 'Fecha salida', 'Estado', 'Observaciones'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontWeight: 600, color: '#f1f5f9', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8faff')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '0.625rem 0.875rem', color: '#94a3b8' }}>{(page - 1) * pageSize + i + 1}</td>
                    <td style={{ padding: '0.625rem 0.875rem' }}>
                      <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '999px', padding: '0.2rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        {TYPE_LABELS[item.eeType] ?? item.eeType}
                      </span>
                    </td>
                    <td style={{ padding: '0.625rem 0.875rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: item.eeAccessType === 'entrance' ? '#dcfce7' : '#fef9c3', color: item.eeAccessType === 'entrance' ? '#15803d' : '#854d0e', borderRadius: '999px', padding: '0.2rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        {item.eeAccessType === 'entrance' ? <><LogIn size={11} /> Entrada</> : <><LogOut size={11} /> Salida</>}
                      </span>
                    </td>
                    <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'monospace', fontWeight: 500 }}>{item.eeIdentification || 'N/A'}</td>
                    <td style={{ padding: '0.625rem 0.875rem' }}>{getFullName(item)}</td>
                    <td style={{ padding: '0.625rem 0.875rem', whiteSpace: 'nowrap', color: '#64748b' }}>{fmtDT(item.eeDatetimeEntrance)}</td>
                    <td style={{ padding: '0.625rem 0.875rem', whiteSpace: 'nowrap', color: '#64748b' }}>{fmtDT(item.eeDatetimeExit)}</td>
                    <td style={{ padding: '0.625rem 0.875rem' }}>
                      <span style={{ background: item.eeClose ? '#dcfce7' : '#fef2f2', color: item.eeClose ? '#15803d' : '#dc2626', borderRadius: '999px', padding: '0.2rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        {item.eeClose ? 'Finalizado' : 'Activo'}
                      </span>
                    </td>
                    <td style={{ padding: '0.625rem 0.875rem', color: '#94a3b8', fontSize: '0.8125rem' }}>{item.eeObservations || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="no-print" style={{ borderTop: '1px solid #e2e8f0', padding: '0.5rem 1rem', background: '#f8fafc' }}>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
          </div>
        </div>
      )}
    </div>
  )
}