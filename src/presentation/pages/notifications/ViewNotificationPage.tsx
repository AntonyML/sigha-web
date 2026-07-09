import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notificationService } from '../../../services/notificationService';
import type { Notification } from '../../../types/notification';

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  sent: 'Enviada',
};

const statusBadge: Record<string, string> = {
  pending: 'bg-warning text-dark',
  sent: 'bg-info text-dark',
};

export default function ViewNotificationPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await notificationService.getNotificationById(Number(id));
        setNotification(data);
        if (data.nStatus !== 'read') {
          await notificationService.markAsRead(Number(id));
          setNotification(prev => prev ? { ...prev, nStatus: 'read' } : prev);
        }
      } catch {
        setError('Error al cargar la notificación');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status" />
        <p className="mt-2 text-muted">Cargando notificación...</p>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error || 'Notificación no encontrada'}</div>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/notifications')}>
          <i className="bi bi-arrow-left me-2"></i>Regresar
        </button>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="container py-4" style={{ maxWidth: '700px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-bell me-2 text-warning"></i>
          Detalle de Notificación
        </h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/notifications')}>
          <i className="bi bi-arrow-left me-2"></i>Regresar
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className={`badge ${statusBadge[notification.nSent ? 'sent' : 'pending'] ?? 'bg-secondary'}`}>
              {statusLabel[notification.nSent ? 'sent' : 'pending']}
            </span>
            {notification.nSent ? (
              <span className="badge bg-info text-dark"><i className="bi bi-check-circle me-1"></i>Enviada</span>
            ) : (
              <span className="badge bg-warning text-dark"><i className="bi bi-circle-fill me-1"></i>No enviada</span>
            )}
          </div>

          <h4 className="fw-bold mb-3">{notification.nTitle}</h4>
          <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{notification.nMessage}</p>

          <hr />

          <div className="row text-muted small">
            {notification.created_at && (
              <div className="col-md-6">
                <strong>Creada:</strong> {formatDate(notification.created_at)}
              </div>
            )}
            {notification.nSendDate && (
              <div className="col-md-6">
                <strong>Programada:</strong> {formatDate(notification.nSendDate)}
              </div>
            )}
          </div>

          {notification.attachments && notification.attachments.length > 0 && (
            <div className="mt-3">
              <h6 className="fw-semibold">Archivos Adjuntos</h6>
              <ul className="list-group list-group-flush">
                {notification.attachments.map((att) => (
                  <li key={att.id ?? att.naFileName} className="list-group-item px-0">
                    <i className="bi bi-paperclip me-2"></i>
                    {att.naFileName} <span className="text-muted small">({att.naFilePath})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
