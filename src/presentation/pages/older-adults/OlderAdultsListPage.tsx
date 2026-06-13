import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, X, Plus, Eye, Pencil, Trash2,
  Loader2, UserRound, ChevronLeft, AlertTriangle, Calendar,
} from 'lucide-react'
import { virtualFileService } from '../../../services/virtualFileService'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import type { VirtualFile } from '../../../types/virtualFile'

/* ── Helpers ──────────────────────────────────────────────── */
function formatDate(str?: string): string {
  if (!str) return '–'
  const d = new Date(str)
  return isNaN(d.getTime()) ? str : d.toLocaleDateString('es-CR')
}

function highlight(text: string, term: string): React.ReactNode {
  if (!term) return text
  const idx = text.toLowerCase().indexOf(term.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#fef08a', padding: 0 }}>{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  )
}

function inDateRange(fecha: string | undefined, from: string, to: string): boolean {
  if (!fecha) return true
  const d = new Date(fecha).getTime()
  if (from && d < new Date(from).getTime()) return false
  if (to && d > new Date(to + 'T23:59:59').getTime()) return false
  return true
}

function initials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  ['#dbeafe','#1d4ed8'], ['#dcfce7','#15803d'], ['#fef9c3','#a16207'],
  ['#f3e8ff','#7c3aed'], ['#fce7f3','#be185d'], ['#e0f2fe','#0369a1'],
  ['#ffedd5','#c2410c'], ['#d1fae5','#065f46'],
]
function avatarColor(name?: string): [string, string] {
  if (!name) return ['#f1f5f9', '#94a3b8']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  const pair = AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length] ?? ['#f1f5f9', '#94a3b8']
  return [pair[0] ?? '#f1f5f9', pair[1] ?? '#94a3b8']
}

function BloodBadge({ type }: { type?: string }) {
  if (!type || type === 'UNKNOWN') return null
  const isNeg = type.includes('-')
  return (
    <span style={{
      padding: '0.1rem 0.4rem', borderRadius: '0.3rem', fontSize: '0.7rem', fontWeight: 700,
      background: isNeg ? '#fee2e2' : '#dbeafe', color: isNeg ? '#b91c1c' : '#1d4ed8',
      border: `1px solid ${isNeg ? '#fca5a5' : '#93c5fd'}`, letterSpacing: '0.02em',
    }}>🩸 {type}</span>
  )
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null
  const alive = status === 'alive'
  return (
    <span style={{
      padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
      background: alive ? '#dcfce7' : '#f1f5f9', color: alive ? '#15803d' : '#64748b',
      border: `1px solid ${alive ? '#86efac' : '#e2e8f0'}`,
    }}>
      {alive ? '● Activo' : '○ Fallecido'}
    </span>
  )
}

function GenderIcon({ gender }: { gender?: string }) {
  if (gender === 'male')   return <span title="Masculino" style={{ fontSize: '0.875rem' }}>♂</span>
  if (gender === 'female') return <span title="Femenino"  style={{ fontSize: '0.875rem' }}>♀</span>
  return null
}

/* ══════════════════════════════════════════════════════════ */
export default function ListVirtualFile() {
  const navigate  = useNavigate()
  const feedback  = useFeedbackWithNotifications()

  const [items,        setItems]        = useState<VirtualFile[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [search,       setSearch]       = useState('')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleting,     setDeleting]     = useState<number | null>(null)

  /* ── Fetch ─────────────────────────────────────────────── */
  const load = useCallback(() => {
    setLoading(true); setError(null)
    virtualFileService.getAllVirtualFiles()
      .then(data => setItems(data))
      .catch(() => setError('No se pudo cargar la lista. Verifique la conexión.'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  /* ── Filters ───────────────────────────────────────────── */
  const term = search.trim().toLowerCase()
  const filtered = items.filter(r => {
    const matchText = !term || (
      r.nombreApellido?.toLowerCase().includes(term) ||
      r.cedula?.toLowerCase().includes(term) ||
      r.edad?.toLowerCase().includes(term)
    )
    const matchDate   = inDateRange(r.fecha, dateFrom, dateTo)
    const matchStatus = !statusFilter || (r.status ? r.status === statusFilter : true)
    return matchText && matchDate && matchStatus
  })

  const hasFilter  = !!term || !!dateFrom || !!dateTo || !!statusFilter
  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); setStatusFilter('') }

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  /* ── Delete ────────────────────────────────────────────── */
  const handleDelete = async (item: VirtualFile) => {
    if (!item.id) return
    const ok = await feedback.confirm(
      'Eliminar expediente',
      `¿Eliminar el expediente de "${item.nombreApellido}"? Esta acción no se puede deshacer.`
    )
    if (!ok) return
    setDeleting(item.id)
    try {
      await virtualFileService.deleteVirtualFile(item.id)
      setItems(prev => prev.filter(r => r.id !== item.id))
      feedback.success(`Expediente de "${item.nombreApellido}" eliminado.`)
    } catch {
      feedback.error('No se pudo eliminar el expediente.')
    } finally {
      setDeleting(null)
    }
  }

  /* ══════════════════════════════════════════════════════ */
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .vf-row:hover { background: #f8faff !important; }
        .vf-action-btn:hover { opacity: 0.85; transform: scale(1.08); }
        .vf-action-btn { transition: opacity 150ms, transform 150ms; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button type="button" onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.8125rem' }}>
            <ChevronLeft size={15} /> Menú
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Fichas virtuales</h1>
            {!loading && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                {items.length} expediente{items.length !== 1 ? 's' : ''} registrado{items.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <button type="button" onClick={() => navigate('/virtualFiles/create')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5625rem 1.125rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={16} /> Nueva ficha
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input type="text" placeholder="Buscar por nombre o cédula…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 2rem 0.5rem 2rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc', boxSizing: 'border-box' }} />
          {search && (
            <button type="button" onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>
        {/* Date from */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={12} /> Desde
          </label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc' }} />
        </div>
        {/* Date to */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={12} /> Hasta
          </label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc' }} />
        </div>
        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc', minWidth: 130, cursor: 'pointer' }}>
            <option value="">Todos</option>
            <option value="alive">Activo</option>
            <option value="deceased">Fallecido</option>
          </select>
        </div>
        {hasFilter && (
          <button type="button" onClick={clearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
            <X size={14} /> Limpiar filtros
          </button>
        )}
      </div>

      {hasFilter && (
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', marginTop: '-0.5rem' }}>
          {filtered.length} de {items.length} resultados
        </p>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '2.5rem', color: '#64748b', fontSize: '0.875rem', justifyContent: 'center' }}>
          <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} /> Cargando expedientes…
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '1rem 1.25rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.625rem', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <AlertTriangle size={16} /> {error}
          <button type="button" onClick={load}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid #f87171', borderRadius: '0.375rem', padding: '0.25rem 0.75rem', cursor: 'pointer', color: '#b91c1c', fontSize: '0.8125rem' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          <UserRound size={44} style={{ marginBottom: '0.875rem', opacity: 0.25 }} />
          <p style={{ margin: '0 0 0.375rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
            {hasFilter ? 'Sin resultados para los filtros aplicados' : 'No hay fichas registradas'}
          </p>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem' }}>
            {hasFilter ? 'Prueba con otros términos o limpia los filtros.' : 'Empieza creando la primera ficha virtual.'}
          </p>
          {!hasFilter
            ? <button type="button" onClick={() => navigate('/virtualFiles/create')}
                style={{ padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                Crear primera ficha
              </button>
            : <button type="button" onClick={clearFilters}
                style={{ padding: '0.4rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                Limpiar filtros
              </button>
          }
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.875rem', background: '#fff', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                  {['', 'Residente', 'Cédula', 'Edad', 'Ingreso', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{
                      padding: '0.875rem 1rem', textAlign: h === 'Acciones' ? 'right' : 'left',
                      fontWeight: 700, color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase',
                      letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((r, i) => {
                  const [avatarBg, avatarFg] = avatarColor(r.nombreApellido)
                  return (
                    <tr key={r.id ?? i} className="vf-row"
                      style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', transition: 'background 150ms' }}>

                      {/* Avatar */}
                      <td style={{ padding: '0.875rem 0.5rem 0.875rem 1rem', width: 44 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', background: avatarBg, color: avatarFg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0,
                        }}>
                          {initials(r.nombreApellido)}
                        </div>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {highlight(r.nombreApellido ?? '', term)}
                          </span>
                          <GenderIcon gender={r.genero} />
                          <BloodBadge type={r.tipoSangre} />
                        </div>
                      </td>

                      {/* Cédula */}
                      <td style={{ padding: '0.875rem 1rem', color: '#475569', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {highlight(r.cedula ?? '', term)}
                      </td>

                      {/* Edad */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {r.edad ? (
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                            background: '#f1f5f9', color: '#475569',
                          }}>
                            {r.edad} años
                          </span>
                        ) : '–'}
                      </td>

                      {/* Ingreso */}
                      <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.8125rem' }}>
                        {formatDate(r.fecha)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <StatusBadge status={r.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                          <ActionBtn color="#2563eb" bg="#eff6ff" title="Ver expediente"
                            onClick={() => navigate(`/virtualFiles/view/${r.id}`)}>
                            <Eye size={14} />
                          </ActionBtn>
                          <ActionBtn color="#16a34a" bg="#f0fdf4" title="Editar"
                            onClick={() => navigate(`/virtualFiles/edit/${r.id}`)}>
                            <Pencil size={14} />
                          </ActionBtn>
                          <ActionBtn color="#dc2626" bg="#fef2f2" title="Eliminar"
                            onClick={() => handleDelete(r)} disabled={deleting === r.id}>
                            {deleting === r.id
                              ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                              : <Trash2 size={14} />}
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '0.625rem 1rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
            </span>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── ActionBtn helper ────────────────────────────────────── */
function ActionBtn({ children, color, bg, title, onClick, disabled = false }: {
  children: React.ReactNode; color: string; bg: string; title: string;
  onClick: () => void; disabled?: boolean
}) {
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled} className="vf-action-btn"
      style={{ background: bg, color, border: 'none', borderRadius: '0.375rem', padding: '0.4rem', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  )
}
