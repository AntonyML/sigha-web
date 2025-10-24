import React from 'react';

interface SuccessCardProps {
  title?: string;
  message?: string;
  onContinue: () => void;
  buttonText?: string;
  buttonIcon?: string;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  title = "¡2FA Habilitado Correctamente!",
  message = "Tu cuenta ahora está protegida con autenticación de dos factores. A partir de ahora, necesitarás tu contraseña y un código de tu aplicación autenticadora para iniciar sesión.",
  onContinue,
  buttonText = "Volver al Inicio",
  buttonIcon = "bi-house-door"
}) => {
  return (
    <div className="card shadow-sm border-success">
      <div className="card-body p-5 text-center">
        <div className="mb-4">
          <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
          </div>
        </div>

        <h3 className="text-success mb-3">{title}</h3>
        <p className="text-muted mb-4">{message}</p>

        <div className="alert alert-warning text-start mb-4">
          <h6 className="fw-bold mb-2">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Importante:
          </h6>
          <ul className="mb-0 small">
            <li>Guarda tus códigos de respaldo en un lugar seguro</li>
            <li>No compartas tu código QR ni tu clave secreta con nadie</li>
            <li>Si pierdes acceso a tu aplicación, usa un código de respaldo</li>
          </ul>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={onContinue}
        >
          <i className={`bi ${buttonIcon} me-2`}></i>
          {buttonText}
        </button>
      </div>
    </div>
  );
};