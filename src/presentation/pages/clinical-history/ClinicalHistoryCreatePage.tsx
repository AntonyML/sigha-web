// src/presentation/pages/clinical-history/ClinicalHistoryCreatePage.tsx
import { Link } from 'react-router-dom';

export default function ClinicalHistoryCreatePage() {
  return (
    <div className="container py-4">
      <h1 className="h3">Crear historial clínico</h1>
      <p className="text-muted">
        Página placeholder. Conectar al flow <code>clinicalHistoryFlow.create</code> y
        al formulario real cuando el servicio esté completamente integrado.
      </p>
      <Link to="/clinical-history" className="btn btn-link">← Volver al listado</Link>
    </div>
  );
}
