// src/presentation/pages/medical-records/MedicalRecordsCreatePage.tsx
import { Link } from 'react-router-dom';

export default function MedicalRecordsCreatePage() {
  return (
    <div className="container py-4">
      <h1 className="h3">Crear registro médico</h1>
      <p className="text-muted">Página placeholder. Conectar al flow cuando esté listo.</p>
      <Link to="/medical-records" className="btn btn-link">← Volver al listado</Link>
    </div>
  );
}
