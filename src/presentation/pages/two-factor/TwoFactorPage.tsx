import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { twoFactorFlow } from '../../../infrastructure/flows/twoFactorFlow';

// Tipo para el estado del flujo de configuración
type SetupStep = 'status' | 'generate' | 'verify' | 'success';

export default function TwoFactorPage() {
    const navigate = useNavigate();

    // Estados principales
    const [currentStep, setCurrentStep] = useState<SetupStep>('status');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Estados de 2FA
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [lastUsed, setLastUsed] = useState<Date | null>(null);
    const [hasBackupCodes, setHasBackupCodes] = useState(false);

    // Estados para configuración
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [instructions, setInstructions] = useState<string[]>([]);
    const [verificationCode, setVerificationCode] = useState('');

    // Estados UI
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);

    // Cargar estado de 2FA al montar
    useEffect(() => {
        loadStatus();
    }, []);

    /**
     * Cargar el estado actual de 2FA
     */
    const loadStatus = async () => {
        setLoading(true);
        setError('');

        const result = await twoFactorFlow.get2FAStatus();

        if (result.success) {
            setIs2FAEnabled(result.enabled || false);
            setLastUsed(result.lastUsed || null);
            setHasBackupCodes(result.hasBackupCodes || false);
            setCurrentStep('status');
        } else {
            setError(result.error || 'Error al cargar el estado de 2FA');
        }

        setLoading(false);
    };

    /**
     * Iniciar el proceso de configuración de 2FA
     */
    const handleStartSetup = async () => {
        setProcessing(true);
        setError('');
        setSuccessMessage('');

        const result = await twoFactorFlow.generate2FA();

        if (result.success) {
            setQrCode(result.qrCode || '');
            setSecret(result.secret || '');
            setBackupCodes(result.backupCodes || []);
            setInstructions(result.instructions || []);
            setCurrentStep('generate');
        } else {
            setError(result.error || 'Error al generar configuración de 2FA');
        }

        setProcessing(false);
    };

    /**
     * Verificar el código y habilitar 2FA
     */
    const handleVerifyAndEnable = async () => {
        if (verificationCode.length !== 6) {
            setError('El código debe tener 6 dígitos');
            return;
        }

        setProcessing(true);
        setError('');

        const result = await twoFactorFlow.enable2FA(verificationCode);

        if (result.success) {
            setSuccessMessage(result.message || '¡2FA habilitado exitosamente!');
            setCurrentStep('success');
            // Recargar estado después de 2 segundos
            setTimeout(() => {
                loadStatus();
                setVerificationCode('');
            }, 2000);
        } else {
            setError(result.error || 'Código inválido. Intenta nuevamente.');
        }

        setProcessing(false);
    };

    /**
     * Deshabilitar 2FA
     */
    const handleDisable2FA = async () => {
        const confirmed = window.confirm(
            '¿Estás seguro de que deseas deshabilitar la autenticación de dos factores?\n\n' +
            'Esto reducirá la seguridad de tu cuenta.'
        );

        if (!confirmed) return;

        setProcessing(true);
        setError('');

        const result = await twoFactorFlow.disable2FA();

        if (result.success) {
            setSuccessMessage(result.message || '2FA deshabilitado correctamente');
            await loadStatus();
        } else {
            setError(result.error || 'Error al deshabilitar 2FA');
        }

        setProcessing(false);
    };

    /**
     * Regenerar códigos de respaldo
     */
    const handleRegenerateBackupCodes = async () => {
        const confirmed = window.confirm(
            '¿Deseas generar nuevos códigos de respaldo?\n\n' +
            'Los códigos anteriores dejarán de funcionar.'
        );

        if (!confirmed) return;

        setProcessing(true);
        setError('');

        const result = await twoFactorFlow.regenerateBackupCodes();

        if (result.success) {
            setBackupCodes(result.backupCodes || []);
            setShowBackupCodes(true);
            setSuccessMessage('Códigos de respaldo regenerados exitosamente');
        } else {
            setError(result.error || 'Error al regenerar códigos de respaldo');
        }

        setProcessing(false);
    };

    /**
     * Copiar códigos de respaldo al portapapeles
     */
    const handleCopyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 3000);
    };

    /**
     * Descargar códigos de respaldo como archivo
     */
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

    /**
     * Cancelar configuración
     */
    const handleCancelSetup = () => {
        setCurrentStep('status');
        setQrCode('');
        setSecret('');
        setBackupCodes([]);
        setVerificationCode('');
        setError('');
        setSuccessMessage('');
    };

    // Renderizar pantalla de carga
    if (loading) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3 text-muted">Cargando configuración de 2FA...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <i className="bi bi-shield-lock me-2"></i>
                        Autenticación de Dos Factores (2FA)
                    </h2>
                    <p className="text-muted mb-0">Añade una capa adicional de seguridad a tu cuenta</p>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/main-menu')}
                    disabled={processing}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Regresar
                </button>
            </div>

            {/* Estado actual de 2FA */}
            {currentStep === 'status' && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-3">Estado actual</h5>
                        {is2FAEnabled ? (
                            <>
                                <div className="alert alert-success d-flex align-items-center" role="alert">
                                    <i className="bi bi-check-circle me-2"></i>
                                    2FA está habilitado en tu cuenta.
                                </div>
                                <button
                                    className="btn btn-danger me-2"
                                    onClick={handleDisable2FA}
                                    disabled={processing}
                                >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Deshabilitar 2FA
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleRegenerateBackupCodes}
                                    disabled={processing || !hasBackupCodes}
                                >
                                    <i className="bi bi-key me-2"></i>
                                    Regenerar códigos de respaldo
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="alert alert-warning d-flex align-items-center" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    2FA no está habilitado en tu cuenta.
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleStartSetup}
                                    disabled={processing}
                                >
                                    <i className="bi bi-shield-plus me-2"></i>
                                    Habilitar 2FA
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ...existing code... */}

            {/* Alertas */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                </div>
            )}

            {/* Contenido según el paso actual */}
            {currentStep === 'status' && (
                <div className="row">
                    <div className="col-lg-8 mx-auto">
                        {/* Card de estado actual */}
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
                            </div>
                        </div>

                        {/* Información sobre 2FA */}
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

                        {/* Acciones */}
                        <div className="card shadow-sm">
                            <div className="card-body p-4">
                                {!is2FAEnabled ? (
                                    <div className="text-center">
                                        <h5 className="mb-3">Configurar Autenticación de Dos Factores</h5>
                                        <p className="text-muted mb-4">
                                            Mejora la seguridad de tu cuenta en solo unos minutos
                                        </p>
                                        <button
                                            className="btn btn-primary btn-lg"
                                            onClick={handleStartSetup}
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
                                ) : (
                                    <div>
                                        <h5 className="mb-3">Gestionar 2FA</h5>
                                        <div className="d-grid gap-2">
                                            <button
                                                className="btn btn-outline-primary"
                                                onClick={handleRegenerateBackupCodes}
                                                disabled={processing}
                                            >
                                                <i className="bi bi-arrow-clockwise me-2"></i>
                                                Regenerar Códigos de Respaldo
                                            </button>
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={handleDisable2FA}
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Deshabilitando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-shield-x me-2"></i>
                                                        Deshabilitar 2FA
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="alert alert-warning mt-3 mb-0">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            <small>
                                                <strong>Advertencia:</strong> Deshabilitar 2FA reducirá la seguridad de tu cuenta.
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Paso 2: Generar y escanear QR */}
            {currentStep === 'generate' && (
                <div className="row">
                    <div className="col-lg-8 mx-auto">
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
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(secret);
                                                        alert('Código copiado al portapapeles');
                                                    }}
                                                >
                                                    <i className="bi bi-clipboard"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Códigos de respaldo */}
                                {backupCodes.length > 0 && (
                                    <div className="card border-warning mb-4">
                                        <div className="card-header bg-warning bg-opacity-10">
                                            <h6 className="mb-0">
                                                <i className="bi bi-shield-exclamation me-2"></i>
                                                Códigos de Respaldo
                                            </h6>
                                        </div>
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
                                )}

                                {/* Botones de acción */}
                                <div className="d-flex gap-2 justify-content-end">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCancelSetup}
                                        disabled={processing}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setCurrentStep('verify')}
                                    >
                                        Continuar
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Paso 3: Verificar código */}
            {currentStep === 'verify' && (
                <div className="row">
                    <div className="col-lg-6 mx-auto">
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
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setVerificationCode(value);
                                        }}
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
                                        onClick={() => setCurrentStep('generate')}
                                        disabled={processing}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Atrás
                                    </button>
                                    <button
                                        className="btn btn-primary flex-grow-1"
                                        onClick={handleVerifyAndEnable}
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
                    </div>
                </div>
            )}

            {/* Paso 4: Éxito */}
            {currentStep === 'success' && (
                <div className="row">
                    <div className="col-lg-6 mx-auto">
                        <div className="card shadow-sm border-success">
                            <div className="card-body p-5 text-center">
                                <div className="mb-4">
                                    <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                </div>

                                <h3 className="text-success mb-3">¡2FA Habilitado Correctamente!</h3>
                                <p className="text-muted mb-4">
                                    Tu cuenta ahora está protegida con autenticación de dos factores.
                                    A partir de ahora, necesitarás tu contraseña y un código de tu aplicación
                                    autenticadora para iniciar sesión.
                                </p>

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
                                    onClick={() => loadStatus()}
                                >
                                    <i className="bi bi-house-door me-2"></i>
                                    Volver al Inicio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para mostrar códigos de respaldo regenerados */}
            {showBackupCodes && backupCodes.length > 0 && (
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
                                    onClick={() => setShowBackupCodes(false)}
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
                                    onClick={() => setShowBackupCodes(false)}
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
