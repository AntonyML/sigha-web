/**
 * DashboardPage — Centro operacional
 *
 * Responde "¿Qué está pasando hoy?".
 * Responsabilidad: KPIs, pendientes, actividad reciente, movimientos,
 * acciones rápidas y accesos frecuentes. NO es un catálogo de módulos
 * (esa responsabilidad vive en el Sidebar).
 *
 * Estructura:
 *   1. KPIs
 *   2. Pendientes (notificaciones)
 *   3. Actividad reciente
 *   4. Movimientos recientes
 *   5. Acciones rápidas
 *   6. Accesos frecuentes (favoritos estáticos)
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, ArrowLeftRight, Bell, FilePlus,
  Eye, Loader2, AlertTriangle, CalendarClock,
  TrendingUp, Clock, CalendarCheck, Stethoscope, CalendarDays, ChevronRight,
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'var(--card-bg,#fff)', border: `1px solid var(--border-color,#e2e8f0)`, borderLeft: `3px solid ${s.accent}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: s.bg, color: s.accent, flexShrink: 0 }}>
        {s.icon}
      </span>
      <div>
        <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary,#1e293b)', lineHeight: 1.2 }}>
          {s.loading ? <Loader2 size={18} style={{ animation: 'dbSpin .8s linear infinite' }} /> : s.value}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary,#64748b)' }}>{s.label}</div>
      </div>
    </div>
  )
}

/* ─── section header ──────────────────────────────────── */

function Section({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ color: 'var(--text-secondary,#64748b)' }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary,#64748b)' }}>{title}</h2>
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
  { label: 'Residentes',  route: '/virtualFiles',              icon: <Users          size={15} />, bg: '#eff6ff', color: '#1d4ed8' },
  { label: 'Citas',       route: '/specialized-appointments',  icon: <CalendarCheck  size={15} />, bg: '#eef2ff', color: '#4338ca' },
  { label: 'Enfermería',  route: '/nursing',                   icon: <Stethoscope    size={15} />, bg: '#ecfdf5', color: '#047857' },
  { label: 'Programas',   route: '/programs',                  icon: <CalendarDays   size={15} />, bg: '#f0fdfa', color: '#0f766e' },
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

  useEffect(() => {
    virtualFileService.getAllVirtualFiles()
      .then(d => setResidents(d))
      .catch(() => setErrorR(true))
      .finally(() => setLoadingR(false))

    entranceExitService.getAllEntranceExits()
      .then(d => setEntrances(d))
      .catch(() => setErrorE(true))
      .finally(() => setLoadingE(false))

    notificationService.getNotifications({ nSent: false, limit: 5 })
      .then(r => {
        setPendingNotifs(r.total ?? r.data?.length ?? 0)
        setPendingList(r.data ?? [])
      })
      .catch(() => { setErrorN(true); setPendingNotifs(0); setPendingList([]) })
      .finally(() => setLoadingN(false))
  }, [])

  const todayEntrances = entrances.filter(e => isToday(e.eeDatetimeEntrance ?? e.createAt))
  const recentResidents = [...residents]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 6)

  const stats: Stat[] = [
    { label: 'Residentes totales',  value: residents.length,   accent: '#3b82f6', bg: '#eff6ff', icon: <Users size={18} />,         loading: loadingR },
    { label: 'Movimientos hoy',     value: todayEntrances.length, accent: '#10b981', bg: '#ecfdf5', icon: <ArrowLeftRight size={18} />, loading: loadingE },
    { label: 'Notif. pendientes',   value: pendingNotifs,      accent: '#f59e0b', bg: '#fffbeb', icon: <Bell size={18} />,            loading: loadingN },
    { label: 'Fecha',               value: new Date().toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric', month: 'short' }),
      accent: '#8b5cf6', bg: '#f5f3ff', icon: <CalendarClock size={18} />, loading: false },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1.25rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style>{`@keyframes dbSpin { to { transform: rotate(360deg); } }`}</style>

      {/* Page title */}
      <div>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary,#1e293b)' }}>Dashboard</h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary,#64748b)' }}>Resumen operacional del día</p>
      </div>

      {/* 1. KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.875rem' }}>
        {stats.map(s => <StatCard key={s.label} s={s} />)}
      </div>

      {/* 2. Pendientes */}
      <Section
        title="Pendientes"
        icon={<Bell size={15} />}
        action={
          pendingNotifs > 0 && (
            <button type="button" onClick={() => navigate('/notifications')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--primary-color,#3b82f6)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
              Ver todas <ChevronRight size={13} />
            </button>
          )
        }
      >
        {loadingN && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <Loader2 size={16} style={{ animation: 'dbSpin .8s linear infinite' }} /> Cargando…
          </div>
        )}
        {!loadingN && errorN && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.625rem', color: '#991b1b', fontSize: '0.875rem' }}>
            <AlertTriangle size={15} /> No se pudo cargar las notificaciones.
          </div>
        )}
        {!loadingN && !errorN && pendingList.length === 0 && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary,#64748b)', fontSize: '0.875rem' }}>
            No hay notificaciones pendientes.
          </div>
        )}
        {!loadingN && !errorN && pendingList.length > 0 && (
          <div style={{ border: '1px solid var(--border-color,#e2e8f0)', borderRadius: '0.75rem', overflow: 'hidden', background: 'var(--card-bg,#fff)' }}>
            {pendingList.map((n, i) => (
              <div key={n.id}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: i < pendingList.length - 1 ? '1px solid var(--border-color,#f1f5f9)' : 'none', cursor: 'pointer' }}
                onClick={() => navigate(`/notifications/view/${n.id}`)}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-card-bg,#f8faff)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/notifications/view/${n.id}`) } }}
                aria-label={`Notificación pendiente: ${n.nTitle}`}
              >
                <span style={{ marginTop: '0.2rem', width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} aria-hidden="true" />
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

      {/* 3. Actividad reciente */}
      <Section title="Actividad reciente" icon={<TrendingUp size={15} />}>
        {loadingR && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <Loader2 size={16} style={{ animation: 'dbSpin .8s linear infinite' }} /> Cargando…
          </div>
        )}
        {!loadingR && errorR && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.625rem', color: '#991b1b', fontSize: '0.875rem' }}>
            <AlertTriangle size={15} /> No se pudo cargar la lista de residentes.
          </div>
        )}
        {!loadingR && !errorR && recentResidents.length === 0 && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary,#64748b)', fontSize: '0.875rem' }}>
            No hay fichas registradas.{' '}
            <button type="button" onClick={() => navigate('/virtualFiles/create')} style={{ color: 'var(--primary-color,#3b82f6)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Crear primera ficha →</button>
          </div>
        )}
        {!loadingR && !errorR && recentResidents.length > 0 && (
          <div style={{ border: '1px solid var(--border-color,#e2e8f0)', borderRadius: '0.75rem', overflow: 'hidden', background: 'var(--card-bg,#fff)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--sidebar-bg,#f8fafc)', borderBottom: '1px solid var(--border-color,#e2e8f0)' }}>
                  {['Nombre', 'Cédula', 'Edad', 'Registrado', ''].map(h => (
                    <th key={h} style={{ padding: '0.625rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-secondary,#64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentResidents.map((r, i) => (
                  <tr key={r.id ?? i} style={{ borderBottom: '1px solid var(--border-color,#f1f5f9)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-card-bg,#f8faff)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '0.625rem 1rem', fontWeight: 600, color: 'var(--text-primary,#1e293b)' }}>{r.nombreApellido ?? '—'}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary,#475569)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{r.cedula ?? '—'}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary,#64748b)' }}>{r.edad ?? '—'}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary,#94a3b8)', fontSize: '0.8125rem' }}>{timeAgo(r.createdAt)}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right' }}>
                      <button type="button" onClick={() => navigate(`/virtualFiles/view/${r.id}`)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '0.375rem', padding: '0.3rem 0.625rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Eye size={13} /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '0.625rem 1rem', borderTop: '1px solid var(--border-color,#e2e8f0)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => navigate('/virtualFiles')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color,#3b82f6)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                Ver todas las fichas ({residents.length}) →
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* 4. Movimientos recientes */}
      <Section title="Movimientos recientes" icon={<Clock size={15} />}>
        {loadingE && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <Loader2 size={16} style={{ animation: 'dbSpin .8s linear infinite' }} /> Cargando…
          </div>
        )}
        {!loadingE && errorE && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.625rem', color: '#991b1b', fontSize: '0.875rem' }}>
            <AlertTriangle size={15} /> No se pudo cargar los movimientos.
          </div>
        )}
        {!loadingE && !errorE && todayEntrances.length === 0 && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary,#64748b)', fontSize: '0.875rem' }}>
            Sin movimientos registrados hoy.
          </div>
        )}
        {!loadingE && !errorE && todayEntrances.length > 0 && (
          <div style={{ border: '1px solid var(--border-color,#e2e8f0)', borderRadius: '0.75rem', overflow: 'hidden', background: 'var(--card-bg,#fff)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--sidebar-bg,#f8fafc)', borderBottom: '1px solid var(--border-color,#e2e8f0)' }}>
                  {['Tipo', 'Acceso', 'Hora entrada', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '0.625rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-secondary,#64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayEntrances.slice(0, 8).map((e, i) => (
                  <tr key={e.id ?? i} style={{ borderBottom: '1px solid var(--border-color,#f1f5f9)' }}>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--text-primary,#1e293b)' }}>{e.eeType ?? '—'}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary,#475569)' }}>{e.eeAccessType ?? '—'}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary,#64748b)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{formatTime(e.eeDatetimeEntrance)}</td>
                    <td style={{ padding: '0.625rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: e.eeClose ? '#f1f5f9' : '#ecfdf5', color: e.eeClose ? '#64748b' : '#059669' }}>
                        {e.eeClose ? 'Cerrado' : 'Activo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {todayEntrances.length > 8 && (
              <div style={{ padding: '0.625rem 1rem', borderTop: '1px solid var(--border-color,#e2e8f0)', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => navigate('/entrance-exit')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color,#3b82f6)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                  Ver todos ({todayEntrances.length}) →
                </button>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* 5. Acciones rápidas */}
      <Section title="Acciones rápidas" icon={<FilePlus size={15} />}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
          {[
            { label: 'Nueva ficha',        route: '/virtualFiles/create', bg: '#eff6ff', color: '#1d4ed8' },
            { label: 'Registrar ingreso',  route: '/entrance-exit',       bg: '#ecfdf5', color: '#065f46' },
            { label: 'Nota de enfermería', route: '/nursing',             bg: '#eef2ff', color: '#3730a3' },
            { label: 'Ver actividades',    route: '/programs',            bg: '#f0fdfa', color: '#0f766e' },
          ].map(a => (
            <button key={a.route} type="button" onClick={() => navigate(a.route)}
              style={{ padding: '0.5rem 1.125rem', background: a.bg, color: a.color, border: `1px solid ${a.bg}`, borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'opacity 150ms' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              {a.label}
            </button>
          ))}
        </div>
      </Section>

      {/* 6. Accesos frecuentes (favoritos estáticos) */}
      <Section title="Accesos frecuentes" icon={<ChevronRight size={15} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }}>
          {QUICK_LINKS.map(q => (
            <button key={q.route} type="button" onClick={() => navigate(q.route)}
              aria-label={`Ir a ${q.label}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 0.875rem', background: q.bg, color: q.color, border: 'none', borderRadius: '0.625rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left', transition: 'transform 150ms ease, box-shadow 150ms ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              onFocus={e => { e.currentTarget.style.outline = '2px solid #3b82f6'; e.currentTarget.style.outlineOffset = '2px' }}
              onBlur={e => { e.currentTarget.style.outline = ''; e.currentTarget.style.outlineOffset = '' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'rgba(255,255,255,.6)', flexShrink: 0 }} aria-hidden="true">
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
