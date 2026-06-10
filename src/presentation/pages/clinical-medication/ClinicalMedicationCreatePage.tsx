// src/presentation/pages/clinical-medication/ClinicalMedicationCreatePage.tsx
import { Link } from 'react-router-dom';

export default function ClinicalMedicationCreatePage() {
  return (
    <div className="container py-4">
      <h1 className="h3">Crear medicamento clínico</h1>
      <p className="text-muted">Página placeholder. Conectar al flow cuando esté listo.</p>
      <Link to="/clinical-medication" className="btn btn-link">← Volver al listado</Link>
    </div>
  );
}
