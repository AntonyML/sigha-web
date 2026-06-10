// src/presentation/pages/psychology/PsychologyCreatePage.tsx
import { Link } from 'react-router-dom';

export default function PsychologyCreatePage() {
  return (
    <div className="container py-4">
      <h1 className="h3">Crear sesión de psicología</h1>
      <p className="text-muted">Página placeholder. Conectar al flow cuando esté listo.</p>
      <Link to="/psychology" className="btn btn-link">← Volver al listado</Link>
    </div>
  );
}
