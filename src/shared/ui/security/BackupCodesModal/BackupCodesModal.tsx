import React, { useState } from 'react';

interface BackupCodesModalProps {
  backupCodes: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const BackupCodesModal: React.FC<BackupCodesModalProps> = ({
  backupCodes,
  isOpen,
  onClose
}) => {
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 3000);
  };

  const handleDownloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '2fa-backup-codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-warning bg-opacity-10">
            <h5 className="modal-title">
              <i className="bi bi-shield-exclamation me-2"></i>
              Nuevos Códigos de Respaldo
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning">
              <strong>¡Importante!</strong> Los códigos anteriores ya no funcionarán.
              Guarda estos nuevos códigos en un lugar seguro.
            </div>

            <div className="bg-light p-3 rounded mb-3 font-monospace" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {backupCodes.map((code, index) => (
                <div key={index} className="mb-1">
                  {index + 1}. {code}
                </div>
              ))}
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={handleCopyBackupCodes}
              >
                <i className={`bi ${copiedCodes ? 'bi-check2' : 'bi-clipboard'} me-1`}></i>
                {copiedCodes ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleDownloadBackupCodes}
              >
                <i className="bi bi-download me-1"></i>
                Descargar
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};