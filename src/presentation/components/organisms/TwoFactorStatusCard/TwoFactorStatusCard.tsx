import React from 'react';

interface TwoFactorStatusCardProps {
  is2FAEnabled: boolean;
  lastUsed: Date | null;
  hasBackupCodes: boolean;
  processing: boolean;
  onDisable2FA: () => void;
  onRegenerateBackupCodes: () => void;
  onStartSetup: () => void;
}

export const TwoFactorStatusCard: React.FC<TwoFactorStatusCardProps> = ({
  is2FAEnabled,
  lastUsed,
  hasBackupCodes,
  processing,
  onDisable2FA,
  onRegenerateBackupCodes,
  onStartSetup
}) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <div className={`rounded-circle p-3 ${is2FAEnabled ? 'bg-success' : 'bg-warning'} bg-opacity-10 me-3`}>
            <i className={`bi ${is2FAEnabled ? 'bi-shield-check' : 'bi-shield-exclamation'} fs-2 ${is2FAEnabled ? 'text-success' : 'text-warning'}`}></i>
          </div>
          <div>
            <h4 className="mb-1">
              Estado: {is2FAEnabled ? (
                <span className="badge bg-success">Habilitado</span>
              ) : (
                <span className="badge bg-warning">Deshabilitado</span>
              )}
            </h4>
            <p className="text-muted mb-0">
              {is2FAEnabled
                ? 'Tu cuenta está protegida con autenticación de dos factores'
                : 'Tu cuenta no está protegida con 2FA'
              }
            </p>
          </div>
        </div>

        {is2FAEnabled && (
          <div className="border-top pt-3 mt-3">
            <div className="row g-3">
              <div className="col-md-6">
                <small className="text-muted d-block">Último uso</small>
                <strong>
                  {lastUsed
                    ? (lastUsed as Date).toLocaleString()
                    : 'Nunca usado'
                  }
                </strong>
              </div>
              <div className="col-md-6">
                <small className="text-muted d-block">Códigos de respaldo</small>
                <strong>
                  {hasBackupCodes ? (
                    <span className="text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      Disponibles
                    </span>
                  ) : (
                    <span className="text-warning">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      No generados
                    </span>
                  )}
                </strong>
              </div>
            </div>
          </div>
        )}

        <div className="border-top pt-3 mt-3">
          {is2FAEnabled ? (
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                className="btn btn-danger me-md-2"
                onClick={onDisable2FA}
                disabled={processing}
              >
                <i className="bi bi-x-circle me-2"></i>
                Deshabilitar 2FA
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={onRegenerateBackupCodes}
                disabled={processing || !hasBackupCodes}
              >
                <i className="bi bi-key me-2"></i>
                Regenerar códigos de respaldo
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                className="btn btn-primary btn-lg"
                onClick={onStartSetup}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Generando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-plus me-2"></i>
                    Habilitar 2FA
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};