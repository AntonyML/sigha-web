import React from 'react';

interface VerificationCardProps {
  verificationCode: string;
  onCodeChange: (code: string) => void;
  onVerify: () => void;
  onBack: () => void;
  processing: boolean;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  verificationCode,
  onCodeChange,
  onVerify,
  onBack,
  processing
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    onCodeChange(value);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-shield-check me-2"></i>
          Paso 2: Verifica tu código
        </h5>
      </div>
      <div className="card-body p-4">
        <p className="mb-4">
          Ingresa el código de 6 dígitos que aparece en tu aplicación autenticadora
          para completar la configuración.
        </p>

        <div className="mb-4">
          <label htmlFor="verificationCode" className="form-label fw-bold">
            Código de verificación
          </label>
          <input
            type="text"
            className="form-control form-control-lg text-center font-monospace"
            id="verificationCode"
            value={verificationCode}
            onChange={handleInputChange}
            placeholder="000000"
            maxLength={6}
            disabled={processing}
            autoFocus
          />
          <small className="text-muted">
            Ingresa los 6 dígitos sin espacios
          </small>
        </div>

        <div className="alert alert-info mb-4">
          <i className="bi bi-info-circle me-2"></i>
          El código cambia cada 30 segundos. Si el código expira, usa el siguiente.
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={onBack}
            disabled={processing}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Atrás
          </button>
          <button
            className="btn btn-primary flex-grow-1"
            onClick={onVerify}
            disabled={processing || verificationCode.length !== 6}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Verificando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Verificar y Activar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};