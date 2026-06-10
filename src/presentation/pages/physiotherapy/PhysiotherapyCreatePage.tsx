// src/presentation/pages/physiotherapy/PhysiotherapyCreatePage.tsx
import { Link } from 'react-router-dom';

export default function PhysiotherapyCreatePage() {
  return (
    <div className="container py-4">
      <h1 className="h3">Crear sesión de fisioterapia</h1>
      <p className="text-muted">Página placeholder. Conectar al flow cuando esté listo.</p>
      <Link to="/physiotherapy" className="btn btn-link">← Volver al listado</Link>
    </div>
  );
}
