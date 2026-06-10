// src/presentation/pages/emergency-contacts/EmergencyContactsCreatePage.tsx
import { Link } from 'react-router-dom';

export default function EmergencyContactsCreatePage() {
  return (
    <div className="container py-4">
      <h1 className="h3">Crear contacto de emergencia</h1>
      <p className="text-muted">Página placeholder. Conectar al flow cuando esté listo.</p>
      <Link to="/emergency-contacts" className="btn btn-link">← Volver al listado</Link>
    </div>
  );
}
