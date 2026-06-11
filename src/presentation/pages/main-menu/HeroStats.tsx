/**
 * HeroStats
 *
 * Capa 1 del Main Menu: métricas accionables del día.
 * Datos obtenidos de servicios existentes, sin cambios al backend.
 *
 *  - Residentes activos  → virtualFileService.getAllVirtualFiles()
 *  - Movimientos hoy     → entranceExitService.getAllEntranceExits() filtrado por fecha
 *  - Notificaciones pend → notificationService.getNotifications({ nSent: false })
 *  - Hora del sistema    → Date() local (sin API)
 */

import { useState, useEffect } from 'react';
import { Users, ArrowRightLeft, Bell, CalendarClock, Loader2 } from 'lucide-react';
import { virtualFileService }  from '../../../services/virtualFileService';
import { entranceExitService } from '../../../services/entranceExitService';
import { notificationService } from '../../../services/notificationService';
import type { AuthUser }        from '../../../types/auth';
import type { VirtualFile }     from '../../../types';
import type { EntranceExitResponse } from '../../../types/entranceExit';
import './HeroStats.css';

/* ─── Helpers ─────────────────────────────────────────── */

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch { return null; }
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  );
}

const DAYS   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatGreetingDate(): string {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function buildGreeting(user: AuthUser | null): string {
  const hour = new Date().getHours();
  const saludo = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const name = user?.uName ?? 'bienvenido';
  return `${saludo}, ${name}`;
}

/* ─── Stat card data type ─────────────────────────────── */

interface StatCard {
  id: string;
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'violet';
  loading: boolean;
}

/* ─── Component ───────────────────────────────────────── */

export default function HeroStats() {
  const user = getStoredUser();

  const [residents,      setResidents]      = useState(0);
  const [todayMoves,     setTodayMoves]     = useState(0);
  const [pendingNotifs,  setPendingNotifs]  = useState(0);
  const [loadingR, setLoadingR] = useState(true);
  const [loadingE, setLoadingE] = useState(true);
  const [loadingN, setLoadingN] = useState(true);

  /* Fetch residents count */
  useEffect(() => {
    virtualFileService.getAllVirtualFiles()
      .then((data: VirtualFile[]) => setResidents(data.length))
      .catch(() => setResidents(0))
      .finally(() => setLoadingR(false));
  }, []);

  /* Fetch today's entrance/exit movements */
  useEffect(() => {
    entranceExitService.getAllEntranceExits()
      .then((data: EntranceExitResponse[]) => {
        const today = data.filter((e: EntranceExitResponse) => isToday(e.eeDatetimeEntrance ?? e.createAt));
        setTodayMoves(today.length);
      })
      .catch(() => setTodayMoves(0))
      .finally(() => setLoadingE(false));
  }, []);

  /* Fetch pending notifications */
  useEffect(() => {
    notificationService.getNotifications({ nSent: false, limit: 1 })
      .then((res: { total?: number }) => setPendingNotifs(res.total ?? 0))
      .catch(() => setPendingNotifs(0))
      .finally(() => setLoadingN(false));
  }, []);

  const stats: StatCard[] = [
    {
      id: 'residents',
      label: 'Residentes activos',
      value: residents,
      icon: <Users className="hero-stat-icon-svg" />,
      color: 'blue',
      loading: loadingR,
    },
    {
      id: 'movements',
      label: 'Movimientos hoy',
      value: todayMoves,
      icon: <ArrowRightLeft className="hero-stat-icon-svg" />,
      color: 'emerald',
      loading: loadingE,
    },
    {
      id: 'notifications',
      label: 'Notif. pendientes',
      value: pendingNotifs,
      icon: <Bell className="hero-stat-icon-svg" />,
      color: 'amber',
      loading: loadingN,
    },
    {
      id: 'date',
      label: 'Fecha de hoy',
      value: formatGreetingDate(),
      icon: <CalendarClock className="hero-stat-icon-svg" />,
      color: 'violet',
      loading: false,
    },
  ];

  return (
    <section className="hero-section" aria-label="Resumen del día">
      {/* Greeting */}
      <div className="hero-greeting">
        <h1 className="hero-greeting-title">{buildGreeting(user)}</h1>
        <p className="hero-greeting-sub">Aquí tienes el resumen de hoy</p>
      </div>

      {/* Stat cards */}
      <div className="hero-stats-grid">
        {stats.map(s => (
          <div key={s.id} className={`hero-stat-card hero-stat-card--${s.color}`} aria-label={s.label}>
            <span className={`hero-stat-icon hero-stat-icon--${s.color}`} aria-hidden="true">
              {s.icon}
            </span>
            <div className="hero-stat-body">
              <span className="hero-stat-value">
                {s.loading
                  ? <Loader2 className="hero-stat-spinner" aria-label="Cargando" />
                  : s.value
                }
              </span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
