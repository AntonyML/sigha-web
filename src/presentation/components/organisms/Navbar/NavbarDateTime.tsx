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
import { useAppSettings } from '../../../context/SettingsContext';
import { formatDateTime } from '../../../../utils/dateUtils';
import './NavbarDateTime.css';

export default function NavbarDateTime() {
  const { timezone } = useAppSettings();
  const [now, setNow] = useState(() => formatDateTime(new Date(), timezone));

  useEffect(() => {
    const tick = () => setNow(formatDateTime(new Date(), timezone));
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    const timeout = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 60_000);
      return () => clearInterval(interval);
    }, msToNextMinute);
    return () => clearTimeout(timeout);
  }, [timezone]);

  return (
    <div className="navbar-datetime" aria-label="Fecha y hora actual" title="Fecha y hora del sistema">
      <Clock className="navbar-datetime-icon" aria-hidden="true" />
      <span className="navbar-datetime-date">{now.dateStr}</span>
      <span className="navbar-datetime-sep" aria-hidden="true">·</span>
      <span className="navbar-datetime-time">{now.timeStr}</span>
    </div>
  );
}
