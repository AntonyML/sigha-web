const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatDateTime(date: Date, tz: string): { dateStr: string; timeStr: string } {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat('es-CR', opts);
  const parts = formatter.formatToParts(date);
  const day = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const num = parts.find((p) => p.type === 'day')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const hh = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const mm = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return {
    dateStr: `${day} ${num} ${month}`,
    timeStr: `${hh}:${mm}`,
  };
}

export function formatDate(iso: string, tz: string): string {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = { timeZone: tz, year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('es-CR', opts).format(d);
}

export function formatDateTimeFull(iso: string, tz: string): string {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return new Intl.DateTimeFormat('es-CR', opts).format(d);
}