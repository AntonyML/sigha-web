import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../../services/notificationService';
import type { CreateNotificationDto } from '../../../types/notification';

export default function CreateNotificationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<CreateNotificationDto>>({
    nTitle: '',
    nMessage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nTitle?.trim() || !form.nMessage?.trim()) {
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
                  name="nTitle"
                  value={form.nTitle || ''}
                  onChange={handleChange}
                  placeholder="Título de la notificación"
                  maxLength={150}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Mensaje <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  name="nMessage"
                  value={form.nMessage || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Contenido de la notificación"
                  required
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
                  <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                ) : (
                  <><i className="bi bi-send me-2"></i>Enviar</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
