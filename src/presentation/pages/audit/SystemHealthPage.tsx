import { useNavigate } from 'react-router-dom';

export default function SystemHealthPage() {
  const navigate = useNavigate();
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-cpu me-2 text-primary"></i>
          Estado del Sistema
        </h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/audits')}>
          <i className="bi bi-arrow-left me-2"></i>Regresar
        </button>
      </div>
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-info-circle fs-1 text-muted d-block mb-3"></i>
          <h5 className="mb-2">Métricas de sistema no disponibles</h5>
          <p className="text-muted mb-0">
            Esta vista aún no expone un endpoint en el backend.
            Use el panel de auditoría para revisar la actividad reciente.
          </p>
        </div>
      </div>
    </div>
  );
}
