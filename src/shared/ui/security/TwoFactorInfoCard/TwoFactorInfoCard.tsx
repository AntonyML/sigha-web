import React from 'react';

export const TwoFactorInfoCard: React.FC = () => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">
          <i className="bi bi-info-circle me-2"></i>
          ¿Qué es la autenticación de dos factores?
        </h5>
      </div>
      <div className="card-body">
        <p className="mb-3">
          La autenticación de dos factores (2FA) añade una capa extra de seguridad a tu cuenta.
          Además de tu contraseña, necesitarás un código temporal generado por una aplicación
          autenticadora en tu dispositivo móvil.
        </p>

        <h6 className="fw-bold mb-2">Beneficios:</h6>
        <ul className="mb-3">
          <li>Protección adicional contra accesos no autorizados</li>
          <li>Seguridad incluso si tu contraseña es comprometida</li>
          <li>Códigos de respaldo para emergencias</li>
          <li>Compatible con aplicaciones como Google Authenticator, 2FAS, Authy</li>
        </ul>

        <div className="alert alert-info mb-0">
          <i className="bi bi-lightbulb me-2"></i>
          <strong>Recomendación:</strong> Te recomendamos usar la aplicación <strong>2FAS</strong>
          (gratuita y de código abierto) para gestionar tus códigos de autenticación.
        </div>
      </div>
    </div>
  );
};