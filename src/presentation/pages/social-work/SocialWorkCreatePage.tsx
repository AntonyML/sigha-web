// src/presentation/pages/social-work/SocialWorkCreatePage.tsx
import { Link } from 'react-router-dom';

export default function SocialWorkCreatePage() {
  return (
    <div className="container py-4">
      <h1 className="h3">Crear informe de trabajo social</h1>
      <p className="text-muted">Página placeholder. Conectar al flow cuando esté listo.</p>
      <Link to="/social-work" className="btn btn-link">← Volver al listado</Link>
    </div>
  );
}
