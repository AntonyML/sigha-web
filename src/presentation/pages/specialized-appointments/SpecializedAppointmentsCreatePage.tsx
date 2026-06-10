// src/presentation/pages/specialized-appointments/SpecializedAppointmentsCreatePage.tsx
import { Link } from 'react-router-dom';

export default function SpecializedAppointmentsCreatePage() {
  return (
    <div className="container py-4">
      <h1 className="h3">Programar cita especializada</h1>
      <p className="text-muted">Página placeholder. Conectar al flow cuando esté listo.</p>
      <Link to="/specialized-appointments" className="btn btn-link">← Volver al listado</Link>
    </div>
  );
}
