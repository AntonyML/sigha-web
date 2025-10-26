import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { twoFactorFlow } from '../../../infrastructure/flows/twoFactor';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import { PageHeader } from '../../components/molecules/PageHeader/PageHeader';
import { Icon } from '../../components/atoms';
import {
  TwoFactorStatusCard,
  TwoFactorInfoCard,
  QRCodeCard,
  BackupCodesCard,
  VerificationCard,
  SuccessCard,
  BackupCodesModal
} from '../../components/organisms';

// Tipo para el estado del flujo de configuración
type SetupStep = 'status' | 'setup' | 'verify' | 'success';

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
    const [verificationCode, setVerificationCode] = useState('');
    const [disableCode, setDisableCode] = useState('');

    // Estados UI
    const [showBackupCodes, setShowBackupCodes] = useState(false);

    // Cargar estado de 2FA al montar
    useEffect(() => {
        loadStatus();
    }, []);

    /**
     * Cargar el estado actual de 2FA usando el flow
     */
    const loadStatus = async () => {
        setLoading(true);
        setError('');

        const result = await twoFactorFlow.getStatus();

        if (result.success) {
            setIs2FAEnabled(result.enabled);
            setLastUsed(result.lastUsed || null);
            setHasBackupCodes(result.hasBackupCodes);
            setCurrentStep('status');
        } else {
            setError(result.error || 'Error al cargar el estado de 2FA');
        }

        setLoading(false);
    };

    /**
     * Iniciar el proceso de configuración de 2FA usando el flow
     */
    const handleStartSetup = async () => {
        setProcessing(true);
        setError('');
        setSuccessMessage('');

        const result = await twoFactorFlow.setup();

        if (result.success) {
            setQrCode(result.qrCode || '');
            setSecret(result.secret || '');
            setBackupCodes(result.backupCodes || []);
            setCurrentStep('setup');
        } else {
            setError(result.error || 'Error al configurar 2FA');
        }

        setProcessing(false);
    };

    /**
     * Verificar el código y habilitar 2FA usando el flow
     */
    const handleVerifyAndEnable = async () => {
        setProcessing(true);
        setError('');

        console.log('DEBUG: verificationCode before sending:', verificationCode);
        const result = await twoFactorFlow.enable({ code: verificationCode });

        if (result.success) {
            setSuccessMessage(result.message || '¡2FA habilitado exitosamente!');
            // Actualizar códigos de respaldo si se retornaron (por ejemplo, si se usó uno)
            if (result.backupCodes) {
                setBackupCodes(result.backupCodes);
            }
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
     * Deshabilitar 2FA usando el flow
     */
    const handleDisable2FA = async () => {
        if (!disableCode) {
            setError('Ingresa el código de verificación para deshabilitar 2FA');
            return;
        }

        setProcessing(true);
        setError('');

        const result = await twoFactorFlow.disable(disableCode);

        if (result.success) {
            setSuccessMessage(result.message || '2FA deshabilitado correctamente');
            setDisableCode('');
            await loadStatus();
        } else {
            setError(result.error || 'Error al deshabilitar 2FA');
        }

        setProcessing(false);
    };

    /**
     * Placeholder para regenerar códigos de respaldo (no implementado en flow)
     */
    const handleRegenerateBackupCodes = async () => {
        setError('Funcionalidad de regenerar códigos de respaldo no disponible');
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
        setDisableCode('');
        setError('');
        setSuccessMessage('');
    };

    // Renderizar pantalla de carga
    if (loading) {
        return (
            <div className="container py-5">
                <LoadingSpinner message="Cargando configuración de 2FA..." />
            </div>
        );
    }

    return (
        <div className="container py-4">
            <PageHeader
                title="Autenticación de Dos Factores (2FA)"
                subtitle="Añade una capa adicional de seguridad a tu cuenta"
                icon="bi-shield-lock"
                backButton={{
                    text: "Regresar",
                    onClick: () => navigate('/main-menu'),
                    disabled: processing,
                    icon: "arrow_back"
                }}
            />

            {/* Estado actual de 2FA */}
            {currentStep === 'status' && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-3">Estado actual</h5>
                        {is2FAEnabled ? (
                            <>
                                <div className="alert alert-success d-flex align-items-center" role="alert">
                                    <Icon name="check_circle" size="sm" className="me-2" />
                                    2FA está habilitado en tu cuenta.
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="disableCode" className="form-label">
                                        Código de verificación para deshabilitar
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="disableCode"
                                        value={disableCode}
                                        onChange={(e) => setDisableCode(e.target.value)}
                                        placeholder="Ingresa código de 6 dígitos"
                                        disabled={processing}
                                    />
                                </div>
                                <button
                                    className="btn btn-danger me-2"
                                    onClick={handleDisable2FA}
                                    disabled={processing || !disableCode}
                                >
                                    <Icon name="cancel" size="sm" className="me-2" />
                                    Deshabilitar 2FA
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="alert alert-warning d-flex align-items-center" role="alert">
                                    <Icon name="warning" size="sm" className="me-2" />
                                    2FA no está habilitado en tu cuenta.
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleStartSetup}
                                    disabled={processing}
                                >
                                    <Icon name="shield" size="sm" className="me-2" />
                                    Habilitar 2FA
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Alertas */}
            {error && (
                <AlertMessage
                    type="danger"
                    message={error}
                    onDismiss={() => setError('')}
                />
            )}

            {successMessage && (
                <AlertMessage
                    type="success"
                    message={successMessage}
                    onDismiss={() => setSuccessMessage('')}
                />
            )}

            {/* Contenido según el paso actual */}
            {currentStep === 'status' && (
                <div className="row">
                    <div className="col-lg-8 mx-auto">
                        <TwoFactorStatusCard
                            is2FAEnabled={is2FAEnabled}
                            lastUsed={lastUsed}
                            hasBackupCodes={hasBackupCodes}
                            processing={processing}
                            onDisable2FA={handleDisable2FA}
                            onRegenerateBackupCodes={handleRegenerateBackupCodes}
                            onStartSetup={handleStartSetup}
                        />                        <TwoFactorInfoCard />
                    </div>
                </div>
            )}

            {/* Paso de configuración: Generar y escanear QR */}
            {currentStep === 'setup' && (
                <div className="row">
                    <div className="col-lg-8 mx-auto">
                        <QRCodeCard
                            qrCode={qrCode}
                            secret={secret}
                            instructions={[]}
                            onCancel={handleCancelSetup}
                            onContinue={() => setCurrentStep('verify')}
                            processing={processing}
                        />
                        {backupCodes.length > 0 && (
                            <BackupCodesCard
                                backupCodes={backupCodes}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Paso de verificación: Verificar código */}
            {currentStep === 'verify' && (
                <div className="row">
                    <div className="col-lg-6 mx-auto">
                        <VerificationCard
                            verificationCode={verificationCode}
                            onCodeChange={setVerificationCode}
                            onVerify={handleVerifyAndEnable}
                            onBack={() => setCurrentStep('setup')}
                            processing={processing}
                        />
                    </div>
                </div>
            )}

            {/* Paso de éxito */}
            {currentStep === 'success' && (
                <div className="row">
                    <div className="col-lg-6 mx-auto">
                        <SuccessCard
                            onContinue={() => loadStatus()}
                        />
                    </div>
                </div>
            )}

            {/* Modal para mostrar códigos de respaldo */}
            <BackupCodesModal
                backupCodes={backupCodes}
                isOpen={showBackupCodes}
                onClose={() => setShowBackupCodes(false)}
            />
        </div>
    );
}
