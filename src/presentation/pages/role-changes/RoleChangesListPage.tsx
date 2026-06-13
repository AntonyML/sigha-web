/**
 * RoleChangesListPage — Historial de cambios de roles
 *
 * Consume el backend real:
 *   GET /role-changes               → listado paginado con filtros
 *   GET /role-changes/statistics/summary → métricas agregadas
 *
 * Servicio y flow ya implementados:
 *   services/roleChangesService.ts
 *   infrastructure/flows/role-changes/roleChangesFlow.ts
 *
 * Filtros: tipo de cambio (ASSIGNMENT | REMOVAL | UPDATE), fechas desde/hasta.
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  History, Search, AlertCircle, Loader2,
  UserPlus, UserMinus, UserCog, RefreshCw, ArrowLeft, Filter,
} from 'lucide-react'
import { roleChangesFlow } from '../../../infrastructure/flows/role-changes'
import { roleFlow } from '../../../infrastructure/flows/role'
import type { RoleChange, RoleChangeStatistics } from '../../../types/roleChanges'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

const CHANGE_TYPE_META: Record<RoleChange['changeType'], { label: string; color: string; icon: React.ReactNode }> = {
  ASSIGNMENT: { label: 'Asignación', color: '#10b981', icon: <UserPlus size={12} /> },
  REMOVAL:    { label: 'Remoción',   color: '#ef4444', icon: <UserMinus size={12} /> },
  UPDATE:     { label: 'Actualización', color: '#3b82f6', icon: <UserCog size={12} /> },
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' })
}

function fullName(u?: { uName?: string; uFLastName?: string } | null): string {
  if (!u) return '—'
  return `${u.uName ?? ''} ${u.uFLastName ?? ''}`.trim() || '—'
}

export default function RoleChangesListPage() {
  const navigate = useNavigate()

  const [changes, setChanges]       = useState<RoleChange[]>([])
  const [stats, setStats]           = useState<RoleChangeStatistics | null>(null)
  const [loading, setLoading]       = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError]           = useState('')

  const [typeFilter, setTypeFilter]         = useState<'' | RoleChange['changeType']>('')
  const [startDate, setStartDate]           = useState('')
  const [endDate, setEndDate]               = useState('')
  const [searchTerm, setSearchTerm]         = useState('')
  const [roleFilter, setRoleFilter]         = useState<number | ''>('')
  const [rolesCatalog, setRolesCatalog]     = useState<{ id: number; rName: string }[]>([])

  const loadChanges = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await roleChangesFlow.getAllRoleChanges({
        changeType: typeFilter || undefined,
        startDate:  startDate || undefined,
        endDate:    endDate   || undefined,
        roleId:     roleFilter === '' ? undefined : Number(roleFilter),
        limit: 100,
      })
      if (result.success && result.data) {
        setChanges(result.data)
      } else {
        setError(result.error || 'Error al cargar el historial')
      }
    } catch (err) {
      console.error('Error cargando cambios de rol:', err)
      setError('Error inesperado al cargar el historial')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    setLoadingStats(true)
    try {
      const r = await roleChangesFlow.getRoleChangeStatistics()
      if (r.success && r.statistics) setStats(r.statistics)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  /* Cargar catálogo de roles para el filtro */
  useEffect(() => {
    roleFlow.getAllRoles()
      .then(r => { if (r.success && r.roles) setRolesCatalog(r.roles.map(rl => ({ id: rl.id, rName: rl.rName }))) })
      .catch(err => console.error('Error cargando roles:', err))
  }, [])

  useEffect(() => { loadChanges() }, [typeFilter, startDate, endDate, roleFilter])
  useEffect(() => { loadStats() }, [])

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return changes
    const q = searchTerm.toLowerCase()
    return changes.filter(c =>
      fullName(c.user).toLowerCase().includes(q) ||
      fullName(c.admin).toLowerCase().includes(q) ||
      (c.oldRole?.rName ?? '').toLowerCase().includes(q) ||
      (c.newRole?.rName ?? '').toLowerCase().includes(q) ||
      (c.changeReason ?? '').toLowerCase().includes(q)
    )
  }, [changes, searchTerm])

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  const handleClearFilters = () => {
    setTypeFilter('')
    setStartDate('')
    setEndDate('')
    setRoleFilter('')
    setSearchTerm('')
  }

  return (
    <div className="lp-page">
      <div className="lp-header">
        <div>
          <h2 className="lp-title">
            <History size={22} color="#2563eb" />
            Historial de Cambios de Roles
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Auditoría de asignaciones, remociones y actualizaciones de roles
          </p>
        </div>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/roles')}>
            <ArrowLeft size={14} /> Volver a Roles
          </button>
          <button className="lp-btn lp-btn--back" onClick={loadChanges} disabled={loading}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <KpiCard label="Total de cambios"  value={stats?.totalChanges ?? 0}               loading={loadingStats} accent="#3b82f6" />
        <KpiCard label="Asignaciones"      value={stats?.changesByType.ASSIGNMENT ?? 0}   loading={loadingStats} accent="#10b981" />
        <KpiCard label="Remociones"        value={stats?.changesByType.REMOVAL    ?? 0}   loading={loadingStats} accent="#ef4444" />
        <KpiCard label="Actualizaciones"    value={stats?.changesByType.UPDATE     ?? 0}   loading={loadingStats} accent="#f59e0b" />
      </div>

      {/* Filtros */}
      <div className="lp-search-card" style={{ alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="lp-search-wrap" style={{ flex: '1 1 200px' }}>
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar por usuario, admin, rol o motivo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Buscar cambios de rol"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8125rem' }}>
          <Filter size={14} aria-hidden="true" />
          <select
            className="form-select form-select-sm"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            aria-label="Filtrar por tipo de cambio"
            style={{ width: 150 }}
          >
            <option value="">Todos los tipos</option>
            <option value="ASSIGNMENT">Asignación</option>
            <option value="REMOVAL">Remoción</option>
            <option value="UPDATE">Actualización</option>
          </select>
          <select
            className="form-select form-select-sm"
            value={roleFilter === '' ? '' : String(roleFilter)}
            onChange={e => setRoleFilter(e.target.value === '' ? '' : Number(e.target.value))}
            aria-label="Filtrar por rol"
            style={{ width: 180 }}
          >
            <option value="">Todos los roles</option>
            {rolesCatalog.map(r => (
              <option key={r.id} value={r.id}>{r.rName}</option>
            ))}
          </select>
          <input
            type="date"
            className="form-control form-control-sm"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            aria-label="Fecha desde"
            title="Desde"
            style={{ width: 150 }}
          />
          <input
            type="date"
            className="form-control form-control-sm"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            aria-label="Fecha hasta"
            title="Hasta"
            style={{ width: 150 }}
          />
          {(typeFilter || startDate || endDate || roleFilter) && (
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none"
              onClick={handleClearFilters}
              aria-label="Limpiar filtros"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="lp-error" role="alert">
          <AlertCircle size={18} />
          {error}
          <button className="lp-error__retry" onClick={() => setError('')}>Cerrar</button>
        </div>
      )}

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando historial...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <History size={48} className="lp-empty__icon" />
          <p>{searchTerm || typeFilter || roleFilter || startDate || endDate
            ? 'Sin resultados para los filtros aplicados.'
            : 'Aún no hay cambios de roles registrados.'}</p>
          {(searchTerm || typeFilter || roleFilter || startDate || endDate) && (
            <button className="lp-btn lp-btn--back" onClick={handleClearFilters}>Limpiar filtros</button>
          )}
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Usuario</th>
                  <th>Rol anterior</th>
                  <th>Rol nuevo</th>
                  <th>Realizado por</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(c => {
                  const meta = CHANGE_TYPE_META[c.changeType] ?? CHANGE_TYPE_META.UPDATE
                  return (
                    <tr key={c.id}>
                      <td><span style={{ color: '#475569', fontSize: '0.8125rem', fontFamily: 'monospace' }}>{formatDate(c.createdAt)}</span></td>
                      <td>
                        <span
                          className="lp-badge"
                          style={{ background: `${meta.color}1a`, color: meta.color, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td>
                        <strong style={{ display: 'block' }}>{fullName(c.user)}</strong>
                        {c.user?.uEmail && <span className="lp-muted" style={{ fontSize: '0.75rem' }}>{c.user.uEmail}</span>}
                      </td>
                      <td>
                        {c.oldRole
                          ? <span className="lp-badge lp-badge--info">{c.oldRole.rName}</span>
                          : <span className="lp-muted">—</span>}
                      </td>
                      <td>
                        {c.newRole
                          ? <span className="lp-badge lp-badge--success">{c.newRole.rName}</span>
                          : <span className="lp-muted">—</span>}
                      </td>
                      <td>
                        <strong style={{ display: 'block' }}>{fullName(c.admin)}</strong>
                        {c.admin?.uEmail && <span className="lp-muted" style={{ fontSize: '0.75rem' }}>{c.admin.uEmail}</span>}
                      </td>
                      <td>
                        <span className="lp-muted" style={{ fontSize: '0.8125rem' }}>
                          {c.changeReason || <em>Sin motivo registrado</em>}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Sub-component ───────────────────────────────────── */

function KpiCard({ label, value, loading, accent }: { label: string; value: number; loading: boolean; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.125rem', background: '#fff', border: '1px solid #e2e8f0', borderLeft: `3px solid ${accent}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.15 }}>
          {loading ? <Loader2 size={16} style={{ animation: 'lp-spin .8s linear infinite' }} /> : value}
        </div>
        <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginTop: '0.125rem' }}>{label}</div>
      </div>
    </div>
  )
}
