import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../../services/notificationService';
import type { CreateNotificationDto } from '../../../types/notification';

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Información' },
  { value: 'warning', label: 'Advertencia' },
  { value: 'error', label: 'Error' },
  { value: 'success', label: 'Éxito' },
  { value: 'alert', label: 'Alerta' },
];

export default function CreateNotificationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<CreateNotificationDto>>({
    title: '',
    message: '',
    type: 'info',
    recipient_id: '',
    link: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.message?.trim()) {
      setError('El título y el mensaje son obligatorios');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await notificationService.createNotification(form as CreateNotificationDto);
      navigate('/notifications');
    } catch (err) {
      console.error('Error creating notification:', err);
      setError('Error al crear la notificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '700px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-bell-plus me-2 text-warning"></i>
          Nueva Notificación
        </h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/notifications')}>
          <i className="bi bi-arrow-left me-2"></i>Regresar
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Título <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={form.title || ''}
                  onChange={handleChange}
                  placeholder="Título de la notificación"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Tipo</label>
                <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                  {NOTIFICATION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">ID del Destinatario</label>
                <input
                  type="text"
                  className="form-control"
                  name="recipient_id"
                  value={form.recipient_id || ''}
                  onChange={handleChange}
                  placeholder="UUID del usuario destinatario"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Mensaje <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  name="message"
                  value={form.message || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Contenido de la notificación"
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Enlace (opcional)</label>
                <input
                  type="url"
                  className="form-control"
                  name="link"
                  value={form.link || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/notifications')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-warning" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Enviando...</>
                ) : (
                  <><i className="bi bi-send me-2"></i>Crear Notificación</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
