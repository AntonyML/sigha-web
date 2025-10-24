import React, { useState } from 'react';

interface BackupCodesCardProps {
  backupCodes: string[];
  title?: string;
  showHeader?: boolean;
}

export const BackupCodesCard: React.FC<BackupCodesCardProps> = ({
  backupCodes,
  title = "Códigos de Respaldo",
  showHeader = true
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

  return (
    <div className="card border-warning mb-4">
      {showHeader && (
        <div className="card-header bg-warning bg-opacity-10">
          <h6 className="mb-0">
            <i className="bi bi-shield-exclamation me-2"></i>
            {title}
          </h6>
        </div>
      )}
      <div className="card-body">
        <p className="small text-muted mb-3">
          Guarda estos códigos en un lugar seguro. Cada uno puede ser usado una sola vez
          si pierdes acceso a tu aplicación autenticadora.
        </p>

        <div className="bg-light p-3 rounded mb-3 font-monospace" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {backupCodes.map((code, index) => (
            <div key={index} className="mb-1">
              {index + 1}. {code}
            </div>
          ))}
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleCopyBackupCodes}
          >
            <i className={`bi ${copiedCodes ? 'bi-check2' : 'bi-clipboard'} me-1`}></i>
            {copiedCodes ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleDownloadBackupCodes}
          >
            <i className="bi bi-download me-1"></i>
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
};