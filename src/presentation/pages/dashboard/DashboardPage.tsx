/**
 * DashboardPage — Centro operacional
 *
 * Responde "¿Qué está pasando hoy y qué necesita mi atención?".
 * Responsabilidad: excepciones, KPIs, pendientes, actividad reciente,
 * movimientos, acciones rápidas y accesos frecuentes.
 * NO es un catálogo de módulos (esa responsabilidad vive en el Sidebar).
 *
 * Estructura:
 *   1. Header         (título + fecha + última actualización)
 *   2. KPIs           (4 indicadores operacionales)
 *   3. Excepciones    (banner compacto, solo si hay pendientes)
 *   4. Pendientes     (notificaciones por enviar)
 *   5. Actividad reciente
 *   6. Movimientos recientes
 *   7. Acciones rápidas
 *   8. Accesos frecuentes (favoritos estáticos, peso visual bajo)
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, ArrowLeftRight, Bell, FilePlus,
  Eye, Loader2, AlertTriangle, CalendarClock,
  TrendingUp, Clock, CalendarCheck, Stethoscope, CalendarDays,
  ChevronRight, DoorOpen, RefreshCw,
} from 'lucide-react'
import { virtualFileService } from '../../../services/virtualFileService'
import { entranceExitService } from '../../../services/entranceExitService'
import { notificationService } from '../../../services/notificationService'
import type { VirtualFile } from '../../../types/virtualFile'
import type { EntranceExitResponse } from '../../../types/entranceExit'
import type { Notification } from '../../../types/notification'

/* ─── helpers ─────────────────────────────────────────── */

function isToday(str?: string): boolean {
  if (!str) return false
  const d = new Date(str)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

function timeAgo(str?: string): string {
  if (!str) return '—'
  const diff = Date.now() - new Date(str).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'ahora mismo'
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

function formatTime(str?: string): string {
  if (!str) return '—'
  const d = new Date(str)
  return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
}

const MONTHS_LONG = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const WEEKDAYS_LONG = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
function formatTodayLong(): string {
  const d = new Date()
  return `${WEEKDAYS_LONG[d.getDay()].charAt(0).toUpperCase() + WEEKDAYS_LONG[d.getDay()].slice(1)}, ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`
}

/* ─── stat card ───────────────────────────────────────── */

interface Stat {
  label: string
  value: number | string
  icon: React.ReactNode
  accent: string
  bg: string
  loading: boolean
}

function StatCard({ s }: { s: Stat }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.125rem', background: 'var(--card-bg,#fff)', border: `1px solid var(--border-color,#e2e8f0)`, borderLeft: `3px solid ${s.accent}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: s.bg, color: s.accent, flexShrink: 0 }}>
        {s.icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary,#1e293b)', lineHeight: 1.15 }}>
          {s.loading ? <Loader2 size={16} style={{ animation: 'dbSpin .8s linear infinite' }} /> : s.value}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary,#64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginTop: '0.125rem' }}>{s.label}</div>
      </div>
    </div>
  )
}

/* ─── section header ──────────────────────────────────── */

function Section({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
        <span style={{ color: 'var(--text-secondary,#64748b)' }} aria-hidden="true">{icon}</span>
        <h2 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary,#64748b)' }}>{title}</h2>
        <div style={{ flex: 1, height: 1, background: 'var(--border-color,#e2e8f0)' }} />
        {action}
      </div>
      {children}
    </section>
  )
}

/* ─── quick link (Accesos frecuentes) ─────────────────── */

interface QuickLink {
  label: string
  route: string
  icon: React.ReactNode
  bg: string
  color: string
}

const QUICK_LINKS: QuickLink[] = [
  { label: 'Residentes',  route: '/virtualFiles',              icon: <Users          size={14} />, bg: '#eff6ff', color: '#1d4ed8' },
  { label: 'Citas',       route: '/specialized-appointments',  icon: <CalendarCheck  size={14} />, bg: '#eef2ff', color: '#4338ca' },
  { label: 'Enfermería',  route: '/nursing',                   icon: <Stethoscope    size={14} />, bg: '#ecfdf5', color: '#047857' },
  { label: 'Programas',   route: '/programs',                  icon: <CalendarDays   size={14} />, bg: '#f0fdfa', color: '#0f766e' },
]

/* ─── main component ──────────────────────────────────── */

export default function DashboardPage() {
  const navigate = useNavigate()

  const [residents,     setResidents]     = useState<VirtualFile[]>([])
  const [entrances,     setEntrances]     = useState<EntranceExitResponse[]>([])
  const [pendingNotifs, setPendingNotifs] = useState(0)
  const [pendingList,   setPendingList]   = useState<Notification[]>([])

  const [loadingR, setLoadingR] = useState(true)
  const [loadingE, setLoadingE] = useState(true)
  const [loadingN, setLoadingN] = useState(true)
  const [errorR,   setErrorR]   = useState(false)
  const [errorE,   setErrorE]   = useState(false)
  const [errorN,   setErrorN]   = useState(false)

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    let cancelled = false
    let pending = 3

    const markDone = () => {
      pending -= 1
      if (pending === 0 && !cancelled) setLastUpdated(new Date())
    }

    virtualFileService.getAllVirtualFiles()
      .then(d => { if (!cancelled) setResidents(d) })
      .catch(() => { if (!cancelled) setErrorR(true) })
      .finally(() => { if (!cancelled) { setLoadingR(false); markDone() } })

    entranceExitService.getAllEntranceExits()
      .then(d => { if (!cancelled) setEntrances(d) })
      .catch(() => { if (!cancelled) setErrorE(true) })
      .finally(() => { if (!cancelled) { setLoadingE(false); markDone() } })

    notificationService.getNotifications({ nSent: false, limit: 5 })
      .then(r => {
        if (cancelled) return
        setPendingNotifs(r.total ?? r.data?.length ?? 0)
        setPendingList(r.data ?? [])
      })
      .catch(() => { if (!cancelled) { setErrorN(true); setPendingNotifs(0); setPendingList([]) } })
      .finally(() => { if (!cancelled) { setLoadingN(false); markDone() } })

    return () => { cancelled = true }
  }, [])

  /* ── Derived operational signals (sin nuevos endpoints) ── */
  const todayEntrances     = useMemo(() => entrances.filter(e => isToday(e.eeDatetimeEntrance ?? e.createAt)), [entrances])
  const openEntrances     = useMemo(() => entrances.filter(e => e.eeAccessType === 'entrance' && !e.eeClose), [entrances])
  const recentResidents   = useMemo(() =>
    [...residents]
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 5),
    [residents]
  )
  const newResidentsToday = useMemo(() => residents.filter(r => isToday(r.createdAt)).length, [residents])

  const totalExceptions = pendingNotifs + openEntrances.length
  const hasExceptions   = totalExceptions > 0

  const stats: Stat[] = [
    { label: 'Residentes totales', value: residents.length,         accent: '#3b82f6', bg: '#eff6ff', icon: <Users size={17} />,         loading: loadingR },
    { label: 'Movimientos hoy',    value: todayEntrances.length,    accent: '#10b981', bg: '#ecfdf5', icon: <ArrowLeftRight size={17} />, loading: loadingE },
    { label: 'Ingresos abiertos',  value: openEntrances.length,     accent: '#f97316', bg: '#fff7ed', icon: <DoorOpen size={17} />,       loading: loadingE },
    { label: 'Notif. pendientes',  value: pendingNotifs,            accent: '#f59e0b', bg: '#fffbeb', icon: <Bell size={17} />,            loading: loadingN },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1.25rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`@keyframes dbSpin { to { transform: rotate(360deg); } }`}</style>

      {/* Header — título + fecha + última actualización */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary,#1e293b)' }}>Dashboard</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.625rem', background: 'var(--card-bg,#fff)', border: '1px solid var(--border-color,#e2e8f0)', borderRadius: '999px', fontSize: '0.75rem', color: 'var(--text-secondary,#64748b)', fontWeight: 600 }}>
              <CalendarClock size={12} aria-hidden="true" />
              {formatTodayLong()}
            </span>
            {newResidentsToday > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.625rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}
                aria-label={`${newResidentsToday} residentes nuevos hoy`}>
                <TrendingUp size={12} aria-hidden="true" />
                {newResidentsToday} {newResidentsToday === 1 ? 'nuevo residente' : 'nuevos residentes'} hoy
              </span>
            )}
          </div>
        </div>
        {lastUpdated && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary,#94a3b8)' }}
            aria-label={`Datos actualizados ${timeAgo(lastUpdated.toISOString())}`}>
            <RefreshCw size={12} aria-hidden="true" />
            Actualizado {timeAgo(lastUpdated.toISOString())}
          </div>
        )}
      </div>

      {/* 1. KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem' }} role="group" aria-label="Indicadores operacionales">
        {stats.map(s => <StatCard key={s.label} s={s} />)}
      </div>

      {/* 2. Excepciones — banner compacto, solo si hay */}
      {hasExceptions && (
        <div
          role="status"
          aria-live="polite"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #fcd34d', borderLeft: '4px solid #f59e0b', borderRadius: '0.625rem', boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', background: '#fef3c7', color: '#b45309', flexShrink: 0 }} aria-hidden="true">
            <AlertTriangle size={15} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#92400e' }}>
              Necesita atención — {totalExceptions} {totalExceptions === 1 ? 'excepción' : 'excepciones'}
            </div>
            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#78350f', marginTop: '0.125rem' }}>
              {pendingNotifs > 0 && (
                <button type="button" onClick={() => navigate('/notifications')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', padding: 0, color: '#92400e', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  aria-label={`Ver ${pendingNotifs} notificaciones pendientes`}>
                  <Bell size={12} aria-hidden="true" /> {pendingNotifs} {pendingNotifs === 1 ? 'notificación' : 'notificaciones'} sin enviar
                </button>
              )}
              {openEntrances.length > 0 && (
                <button type="button" onClick={() => navigate('/entrance-exit')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', padding: 0, color: '#92400e', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  aria-label={`Ver ${openEntrances.length} ingresos abiertos sin cierre`}>
                  <DoorOpen size={12} aria-hidden="true" /> {openEntrances.length} {openEntrances.length === 1 ? 'ingreso abierto' : 'ingresos abiertos'} sin cierre
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Pendientes */}
      <Section
        title="Pendientes"
        icon={<Bell size={15} />}
        action={
          pendingNotifs > 0 && (
            <button type="button" onClick={() => navigate('/notifications')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--primary-color,#3b82f6)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}
              aria-label="Ver todas las notificaciones">
              Ver todas <ChevronRight size={13} aria-hidden="true" />
            </button>
          )
        }
      >
        {loadingN && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <Loader2 size={16} style={{ animation: 'dbSpin .8s linear infinite' }} aria-hidden="true" /> Cargando…
          </div>
        )}
        {!loadingN && errorN && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.625rem', color: '#991b1b', fontSize: '0.875rem' }}>
            <AlertTriangle size={15} aria-hidden="true" /> No se pudo cargar las notificaciones.
          </div>
        )}
        {!loadingN && !errorN && pendingList.length === 0 && (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary,#64748b)', fontSize: '0.875rem' }}>
            No hay notificaciones pendientes. Todo al día.
          </div>
        )}
        {!loadingN && !errorN && pendingList.length > 0 && (
          <div style={{ border: '1px solid var(--border-color,#e2e8f0)', borderRadius: '0.75rem', overflow: 'hidden', background: 'var(--card-bg,#fff)' }}>
            {pendingList.map((n, i) => (
              <div key={n.id}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.625rem 0.875rem', borderBottom: i < pendingList.length - 1 ? '1px solid var(--border-color,#f1f5f9)' : 'none', cursor: 'pointer' }}
                onClick={() => navigate(`/notifications/view/${n.id}`)}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-card-bg,#f8faff)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/notifications/view/${n.id}`) } }}
                aria-label={`Notificación pendiente: ${n.nTitle}`}
              >
                <span style={{ marginTop: '0.35rem', width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} aria-hidden="true" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary,#1e293b)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.nTitle}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary,#94a3b8)', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(n.nSendDate ?? n.created_at)}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary,#475569)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                    {n.nMessage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 4. Actividad reciente */}
      <Section title="Actividad reciente" icon={<TrendingUp size={15} />}>
        {loadingR && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <Loader2 size={16} style={{ animation: 'dbSpin .8s linear infinite' }} aria-hidden="true" /> Cargando…
          </div>
        )}
        {!loadingR && errorR && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.625rem', color: '#991b1b', fontSize: '0.875rem' }}>
            <AlertTriangle size={15} aria-hidden="true" /> No se pudo cargar la lista de residentes.
          </div>
        )}
        {!loadingR && !errorR && recentResidents.length === 0 && (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary,#64748b)', fontSize: '0.875rem' }}>
            No hay fichas registradas.{' '}
            <button type="button" onClick={() => navigate('/virtualFiles/create')} style={{ color: 'var(--primary-color,#3b82f6)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Crear primera ficha →</button>
          </div>
        )}
        {!loadingR && !errorR && recentResidents.length > 0 && (
          <div style={{ border: '1px solid var(--border-color,#e2e8f0)', borderRadius: '0.75rem', overflow: 'hidden', background: 'var(--card-bg,#fff)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--sidebar-bg,#f8fafc)', borderBottom: '1px solid var(--border-color,#e2e8f0)' }}>
                  {['Nombre', 'Cédula', 'Edad', 'Registrado', ''].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.875rem', textAlign: 'left', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--text-secondary,#64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentResidents.map((r, i) => (
                  <tr key={r.id ?? i} style={{ borderBottom: '1px solid var(--border-color,#f1f5f9)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-card-bg,#f8faff)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '0.5rem 0.875rem', fontWeight: 600, color: 'var(--text-primary,#1e293b)' }}>{r.nombreApellido ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.875rem', color: 'var(--text-secondary,#475569)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.cedula ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.875rem', color: 'var(--text-secondary,#64748b)' }}>{r.edad ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.875rem', color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem' }}>{timeAgo(r.createdAt)}</td>
                    <td style={{ padding: '0.5rem 0.875rem', textAlign: 'right' }}>
                      <button type="button" onClick={() => navigate(`/virtualFiles/view/${r.id}`)}
                        aria-label={`Ver ficha de ${r.nombreApellido ?? 'residente'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                        <Eye size={12} aria-hidden="true" /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '0.5rem 0.875rem', borderTop: '1px solid var(--border-color,#e2e8f0)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => navigate('/virtualFiles')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color,#3b82f6)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                Ver todas las fichas ({residents.length}) →
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* 5. Movimientos recientes */}
      <Section title="Movimientos recientes" icon={<Clock size={15} />}>
        {loadingE && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <Loader2 size={16} style={{ animation: 'dbSpin .8s linear infinite' }} aria-hidden="true" /> Cargando…
          </div>
        )}
        {!loadingE && errorE && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.625rem', color: '#991b1b', fontSize: '0.875rem' }}>
            <AlertTriangle size={15} aria-hidden="true" /> No se pudo cargar los movimientos.
          </div>
        )}
        {!loadingE && !errorE && todayEntrances.length === 0 && (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary,#64748b)', fontSize: '0.875rem' }}>
            Sin movimientos registrados hoy.
          </div>
        )}
        {!loadingE && !errorE && todayEntrances.length > 0 && (
          <div style={{ border: '1px solid var(--border-color,#e2e8f0)', borderRadius: '0.75rem', overflow: 'hidden', background: 'var(--card-bg,#fff)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--sidebar-bg,#f8fafc)', borderBottom: '1px solid var(--border-color,#e2e8f0)' }}>
                  {['Tipo', 'Acceso', 'Hora entrada', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.875rem', textAlign: 'left', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--text-secondary,#64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayEntrances.slice(0, 6).map((e, i) => (
                  <tr key={e.id ?? i} style={{ borderBottom: '1px solid var(--border-color,#f1f5f9)' }}>
                    <td style={{ padding: '0.5rem 0.875rem', color: 'var(--text-primary,#1e293b)' }}>{e.eeType ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.875rem', color: 'var(--text-secondary,#475569)' }}>{e.eeAccessType ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.875rem', color: 'var(--text-secondary,#64748b)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{formatTime(e.eeDatetimeEntrance)}</td>
                    <td style={{ padding: '0.5rem 0.875rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.6875rem', fontWeight: 600, background: e.eeClose ? '#f1f5f9' : '#ecfdf5', color: e.eeClose ? '#64748b' : '#059669' }}>
                        {e.eeClose ? 'Cerrado' : 'Activo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {todayEntrances.length > 6 && (
              <div style={{ padding: '0.5rem 0.875rem', borderTop: '1px solid var(--border-color,#e2e8f0)', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => navigate('/entrance-exit')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color,#3b82f6)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                  Ver todos ({todayEntrances.length}) →
                </button>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* 6. Acciones rápidas — verbos claros, máximo 4 */}
      <Section title="Acciones rápidas" icon={<FilePlus size={15} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }} role="group" aria-label="Acciones rápidas">
          {[
            { label: 'Crear residente',       route: '/virtualFiles/create',        bg: '#eff6ff', color: '#1d4ed8', icon: <Users        size={16} />, hint: 'Nueva ficha de adulto mayor' },
            { label: 'Registrar movimiento',  route: '/entrance-exit',               bg: '#ecfdf5', color: '#065f46', icon: <ArrowLeftRight size={16} />, hint: 'Ingreso o salida de residente o visita' },
            { label: 'Nueva cita',            route: '/specialized-appointments',    bg: '#eef2ff', color: '#3730a3', icon: <CalendarCheck size={16} />, hint: 'Agendar atención especializada' },
            { label: 'Atención enfermería',   route: '/nursing',                     bg: '#f0fdfa', color: '#0f766e', icon: <Stethoscope  size={16} />, hint: 'Notas, citas y resultados' },
          ].map(a => (
            <button key={a.route} type="button" onClick={() => navigate(a.route)}
              aria-label={`${a.label} — ${a.hint}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 0.875rem', background: a.bg, color: a.color, border: 'none', borderRadius: '0.625rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left', transition: 'transform 150ms ease, box-shadow 150ms ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              onFocus={e => { e.currentTarget.style.outline = '2px solid #3b82f6'; e.currentTarget.style.outlineOffset = '2px' }}
              onBlur={e => { e.currentTarget.style.outline = ''; e.currentTarget.style.outlineOffset = '' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem', background: 'rgba(255,255,255,.55)', flexShrink: 0 }} aria-hidden="true">
                {a.icon}
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.label}</span>
                <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 500, opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* 7. Accesos frecuentes — peso visual bajo */}
      <Section title="Accesos frecuentes" icon={<ChevronRight size={15} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }} role="group" aria-label="Accesos frecuentes">
          {QUICK_LINKS.map(q => (
            <button key={q.route} type="button" onClick={() => navigate(q.route)}
              aria-label={`Ir a ${q.label}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--card-bg,#fff)', color: q.color, border: '1px solid var(--border-color,#e2e8f0)', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'background 150ms ease, border-color 150ms ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = q.bg; e.currentTarget.style.borderColor = q.color }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg,#fff)'; e.currentTarget.style.borderColor = 'var(--border-color,#e2e8f0)' }}
              onFocus={e => { e.currentTarget.style.outline = '2px solid #3b82f6'; e.currentTarget.style.outlineOffset = '2px' }}
              onBlur={e => { e.currentTarget.style.outline = ''; e.currentTarget.style.outlineOffset = '' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.25rem', height: '1.25rem', flexShrink: 0, color: q.color }} aria-hidden="true">
                {q.icon}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.label}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
