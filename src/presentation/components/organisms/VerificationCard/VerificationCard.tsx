import React, { useState } from 'react';

interface VerificationCardProps {
  verificationCode: string;
  onCodeChange: (code: string) => void;
  onVerify: () => void;
  onBack: () => void;
  processing: boolean;
}

type VerificationMethod = 'totp' | 'backup';

export const VerificationCard: React.FC<VerificationCardProps> = ({
  verificationCode,
  onCodeChange,
  onVerify,
  onBack,
  processing
}) => {
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('backup');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const maxLength = verificationMethod === 'totp' ? 6 : 8;
    const cleanValue = value.slice(0, maxLength);
    onCodeChange(cleanValue);
  };

  const isCodeValid = verificationMethod === 'totp' 
    ? verificationCode.length === 6 
    : verificationCode.length === 8;

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
          Elige cómo quieres verificar tu identidad para completar la configuración de 2FA.
        </p>

        {/* Método de verificación */}
        <div className="mb-4">
          <label className="form-label fw-bold">Método de verificación:</label>
          <div className="d-flex gap-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="verificationMethod"
                id="backupCode"
                value="backup"
                checked={verificationMethod === 'backup'}
                onChange={(e) => {
                  setVerificationMethod(e.target.value as VerificationMethod);
                  onCodeChange(''); // Limpiar código al cambiar método
                }}
                disabled={processing}
              />
              <label className="form-check-label" htmlFor="backupCode">
                Código de respaldo (8 dígitos)
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="verificationMethod"
                id="totpCode"
                value="totp"
                checked={verificationMethod === 'totp'}
                onChange={(e) => {
                  setVerificationMethod(e.target.value as VerificationMethod);
                  onCodeChange(''); // Limpiar código al cambiar método
                }}
                disabled={processing}
              />
              <label className="form-check-label" htmlFor="totpCode">
                Código TOTP (6 dígitos)
              </label>
            </div>
          </div>
        </div>

        {/* Input del código */}
        <div className="mb-4">
          <label htmlFor="verificationCode" className="form-label fw-bold">
            {verificationMethod === 'backup' ? 'Código de respaldo' : 'Código TOTP'}
          </label>
          <input
            type="text"
            className="form-control form-control-lg text-center font-monospace"
            id="verificationCode"
            value={verificationCode}
            onChange={handleInputChange}
            placeholder={verificationMethod === 'backup' ? '00000000' : '000000'}
            maxLength={verificationMethod === 'backup' ? 8 : 6}
            disabled={processing}
            autoFocus
          />
          <small className="text-muted">
            {verificationMethod === 'backup' 
              ? 'Ingresa uno de los códigos de respaldo que se mostraron anteriormente'
              : 'Ingresa el código de 6 dígitos que aparece en tu aplicación autenticadora'
            }
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
            disabled={processing || !isCodeValid}
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