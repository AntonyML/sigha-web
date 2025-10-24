import React from 'react';

interface QRCodeCardProps {
  qrCode: string;
  secret: string;
  instructions: string[];
  onCancel: () => void;
  onContinue: () => void;
  processing: boolean;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  qrCode,
  secret,
  instructions,
  onCancel,
  onContinue,
  processing
}) => {
  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    alert('Código copiado al portapapeles');
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-qr-code me-2"></i>
          Paso 1: Escanea el código QR
        </h5>
      </div>
      <div className="card-body p-4">
        {/* Instrucciones */}
        <div className="alert alert-info mb-4">
          <h6 className="fw-bold mb-2">Instrucciones:</h6>
          <ol className="mb-0">
            {instructions.length > 0 ? (
              instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))
            ) : (
              <>
                <li>Descarga una aplicación autenticadora (2FAS, Google Authenticator, Authy)</li>
                <li>Abre la aplicación y escanea el código QR a continuación</li>
                <li>O ingresa manualmente el código secreto</li>
                <li>La aplicación generará un código de 6 dígitos</li>
              </>
            )}
          </ol>
        </div>

        {/* QR Code */}
        <div className="text-center mb-4">
          {qrCode ? (
            <div className="d-inline-block p-3 bg-white border rounded">
              <img
                src={qrCode}
                alt="Código QR para 2FA"
                className="img-fluid"
                style={{ maxWidth: '250px' }}
              />
            </div>
          ) : (
            <div className="alert alert-warning">
              No se pudo generar el código QR
            </div>
          )}
        </div>

        {/* Código secreto manual */}
        {secret && (
          <div className="card bg-light mb-4">
            <div className="card-body">
              <label className="form-label fw-bold">
                <i className="bi bi-key me-2"></i>
                O ingresa este código manualmente:
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control font-monospace"
                  value={secret}
                  readOnly
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleCopySecret}
                >
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={onContinue}
          >
            Continuar
            <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};