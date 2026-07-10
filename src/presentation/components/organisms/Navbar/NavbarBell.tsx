/**
 * NavbarBell
  *
  * Reemplaza el bell estático por una campana conectada al backend.
  * - Polling cada 90s: GET /notifications?nSent=false&limit=5
 * - Badge muestra el count real de notificaciones pendientes (cap 99+)
 * - Dropdown muestra las últimas N con título, mensaje y fecha
 * - Link "Ver todas" navega a /notifications
 *
 * NOTA: El modelo Notification no tiene campo severity/priority,
 *       por lo que todas las notificaciones tienen el mismo peso visual.
 *       Las no enviadas (nSent=false) se tratan como "pendientes/alertas".
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, X, ArrowRight, Clock } from 'lucide-react';
import { notificationService } from '../../../../services/notificationService';
import type { Notification } from '../../../../types/notification';
import './NavbarBell.css';

const POLL_INTERVAL_MS = 90_000; // 90 segundos (aumentado de 60s para reducir presión en /notifications)
const PREVIEW_LIMIT    = 5;

/* ────────────────────────────────────────────────────── */

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'Ahora';
  if (mins < 60)  return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
}

/* ────────────────────────────────────────────────────── */

export default function NavbarBell() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [count, setCount]                 = useState(0);
  const [open, setOpen]                   = useState(false);
  const [error, setError]                 = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Fetch pending notifications ───────────────────── */
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications({
        nSent: false,
        limit: PREVIEW_LIMIT,
        page: 1,
      });
      setNotifications(res.data ?? []);
      setCount(res.total ?? res.data?.length ?? 0);
      setError(false);
    } catch {
      setError(true);
      /* Fail silently — no interrumpir UX si el endpoint falla */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  /* ── Close on outside click / Escape ──────────────── */
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  /* ── Badge label ───────────────────────────────────── */
  const badgeLabel = count > 99 ? '99+' : String(count);
  const hasNew     = count > 0;

  /* ── Render ────────────────────────────────────────── */
  return (
    <div className="nbell-wrapper" ref={containerRef}>
      {/* Trigger */}
      <button
        className={`nbell-trigger${hasNew ? ' nbell-trigger--active' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label={`Notificaciones${count > 0 ? ` (${count} pendientes)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        title="Notificaciones"
      >
        {hasNew
          ? <BellRing className="nbell-icon nbell-icon--ring" aria-hidden="true" />
          : <Bell     className="nbell-icon"                  aria-hidden="true" />
        }
        {count > 0 && (
          <span className="nbell-badge" aria-hidden="true">
            {badgeLabel}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="nbell-panel" role="dialog" aria-label="Panel de notificaciones">
          {/* Header */}
          <div className="nbell-panel-header">
            <span className="nbell-panel-title">Notificaciones</span>
            {count > 0 && (
              <span className="nbell-panel-count">{count} pendiente{count !== 1 ? 's' : ''}</span>
            )}
            <button className="nbell-panel-close" onClick={() => setOpen(false)} aria-label="Cerrar notificaciones">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="nbell-panel-body">
            {error && (
              <p className="nbell-error">No se pudieron cargar las notificaciones.</p>
            )}

            {!error && notifications.length === 0 && (
              <div className="nbell-empty">
                <Bell className="nbell-empty-icon" aria-hidden="true" />
                <p>Sin notificaciones pendientes</p>
              </div>
            )}

            {!error && notifications.map(n => (
              <article key={n.id} className="nbell-item" role="button" tabIndex={0}
                onClick={() => { setOpen(false); navigate(`/notifications/${n.id}`); }}
                onKeyDown={e => { if (e.key === 'Enter') { setOpen(false); navigate(`/notifications/${n.id}`); } }}>
                <div className="nbell-item-body">
                  <p className="nbell-item-title">{n.nTitle}</p>
                  <p className="nbell-item-msg">{n.nMessage}</p>
                  <span className="nbell-item-time">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {formatRelativeTime(n.created_at)}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Footer */}
          <div className="nbell-panel-footer">
            <button
              className="nbell-view-all"
              onClick={() => { setOpen(false); navigate('/notifications'); }}
            >
              Ver todas las notificaciones
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
