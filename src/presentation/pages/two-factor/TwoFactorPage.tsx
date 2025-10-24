import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { twoFactorFlow } from '../../../infrastructure/flows/twoFactorFlow';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import { PageHeader } from '../../components/molecules/PageHeader/PageHeader';
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
                    icon: "bi-arrow-left"
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
                        />

                        <TwoFactorInfoCard />
                    </div>
                </div>
            )}

            {/* Paso 2: Generar y escanear QR */}
            {currentStep === 'generate' && (
                <div className="row">
                    <div className="col-lg-8 mx-auto">
                        <QRCodeCard
                            qrCode={qrCode}
                            secret={secret}
                            instructions={instructions}
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

            {/* Paso 3: Verificar código */}
            {currentStep === 'verify' && (
                <div className="row">
                    <div className="col-lg-6 mx-auto">
                        <VerificationCard
                            verificationCode={verificationCode}
                            onCodeChange={setVerificationCode}
                            onVerify={handleVerifyAndEnable}
                            onBack={() => setCurrentStep('generate')}
                            processing={processing}
                        />
                    </div>
                </div>
            )}

            {/* Paso 4: Éxito */}
            {currentStep === 'success' && (
                <div className="row">
                    <div className="col-lg-6 mx-auto">
                        <SuccessCard
                            onContinue={() => loadStatus()}
                        />
                    </div>
                </div>
            )}

            {/* Modal para mostrar códigos de respaldo regenerados */}
            <BackupCodesModal
                backupCodes={backupCodes}
                isOpen={showBackupCodes}
                onClose={() => setShowBackupCodes(false)}
            />
        </div>
    );
}
