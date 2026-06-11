/**
 * NavbarDateTime
 *
 * Muestra la fecha y hora actual en el top bar.
 * 100% frontend — actualiza cada minuto con setInterval.
 * No existe módulo de "turnos" en el backend, por lo que
 * se muestra solo fecha + hora del sistema.
 *
 * Formato: "Jue 26 Feb · 14:32"
 */

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import './NavbarDateTime.css';

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatDateTime(date: Date): { dateStr: string; timeStr: string } {
  const day   = DAYS_SHORT[date.getDay()];
  const num   = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];
  const hh    = String(date.getHours()).padStart(2, '0');
  const mm    = String(date.getMinutes()).padStart(2, '0');
  return {
    dateStr: `${day} ${num} ${month}`,
    timeStr: `${hh}:${mm}`,
  };
}

export default function NavbarDateTime() {
  const [now, setNow] = useState(() => formatDateTime(new Date()));

  useEffect(() => {
    /* Sincronizar al próximo minuto exacto y luego cada 60s */
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;

    const timeout = setTimeout(() => {
      setNow(formatDateTime(new Date()));
      const interval = setInterval(() => {
        setNow(formatDateTime(new Date()));
      }, 60_000);
      return () => clearInterval(interval);
    }, msToNextMinute);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="navbar-datetime" aria-label="Fecha y hora actual" title="Fecha y hora del sistema">
      <Clock className="navbar-datetime-icon" aria-hidden="true" />
      <span className="navbar-datetime-date">{now.dateStr}</span>
      <span className="navbar-datetime-sep" aria-hidden="true">·</span>
      <span className="navbar-datetime-time">{now.timeStr}</span>
    </div>
  );
}
